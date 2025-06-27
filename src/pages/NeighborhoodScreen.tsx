import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';
import {
  ArrowLeft, Info, Volume2, Search, Mic, Camera, MapPin,
  TrendingUp, Store, User, UserCheck, X, Clock, Calendar, Filter
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import SearchInput from '../components/SearchInput';
import SearchBar from '../components/SearchBar';
import PromotionBanner from '../components/PromotionBanner';
import RealMap from '../components/RealMap';
import ProductFeed from '../components/ProductFeed';
import CommerceList from '../components/CommerceList';
import CommerceDetails from '../components/CommerceDetails';
import { PublicInfoPanel } from '../components/PublicInfoPanel';
import AmbulanteList from '../components/AmbulanteList';
import AmbulanteModal from '../components/AmbulanteModal';
import FilterPanel from '../components/FilterPanel';
import { getNeighborhoodFromLatLng, calcularDistanciaEmKm } from '../utils/geolocation';
import PromotionMap from '../components/PromotionMap';

interface Organ {
  id: string;
  nome_orgao: string;
  tipo_orgao: string;
  status_orgao: string;
}

interface Publication {
  id: string;
  titulo: string;
  mensagem: string;
  data_publicacao: string;
  orgaos_publicadores: Organ;
  ativo: boolean;
  bairro_destino: string;
  data_inicio: string;
  data_fim: string;
}

interface PublicacaoView {
  titulo: string;
  mensagem: string;
  nome_orgao: string;
  data_publicacao: string;
}

interface SupabaseResponse {
  id: string;
  titulo: string;
  mensagem: string;
  data_publicacao: string;
  orgaos_publicadores: {
    id: string;
    nome_orgao: string;
    tipo_orgao: string;
    status_orgao: string;
  };
}

interface Ambulante {
  id: string;
  nome: string;
  produto: string;
  descricao: string;
  dias_semana: string;
  horarios: string;
  bairro_destino: string;
  foto_url: string;
  ativo: boolean;
}

interface Promocao {
  id: string;
  titulo: string;
  descricao: string;
  imagem_url?: string;
  data_inicio: string;
  data_fim: string;
}

export default function NeighborhoodScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, setUser } = useUserContext();
  const [activeTab, setActiveTab] = useState<'promotions' | 'trending' | 'commerce'>('promotions');
  const [isProductFeedOpen, setIsProductFeedOpen] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [selectedCommerce, setSelectedCommerce] = useState<any>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [publicationsView, setPublicationsView] = useState<PublicacaoView[]>([]);
  const [activeOrgans, setActiveOrgans] = useState<Organ[]>([]);
  const [selectedOrgan, setSelectedOrgan] = useState<Organ | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showAmbulantePanel, setShowAmbulantePanel] = useState(false);
  const [ambulantes, setAmbulantes] = useState<Ambulante[]>([]);
  const [isLoadingAmbulantes, setIsLoadingAmbulantes] = useState(false);
  const [selectedAmbulante, setSelectedAmbulante] = useState<Ambulante | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPublication, setSelectedPublication] = useState<PublicacaoView | null>(null);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mensagensLidas, setMensagensLidas] = useState<string[]>([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filteredPromotions, setFilteredPromotions] = useState<any[] | null>(null);
  const [raioSelecionado, setRaioSelecionado] = useState(0);
  const [userLatitude, setUserLatitude] = useState<number | null>(null);
  const [userLongitude, setUserLongitude] = useState<number | null>(null);
  const [promocoes, setPromocoes] = useState<Promocao[]>([]);
  const [loadingPromocoes, setLoadingPromocoes] = useState(true);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadPublications();
    loadOrgans();
    loadAmbulantes();
    loadPromocoes();
  }, [user, navigate]);

  useEffect(() => {
    if (searchParams.get('abrirFiltro') === 'true') {
      setShowFilterPanel(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const bairroGeo = await getNeighborhoodFromLatLng(position.coords.latitude, position.coords.longitude);
        if (bairroGeo && user.bairro !== bairroGeo) {
          setUser({ ...user, bairro: bairroGeo });
        }
        setUserLatitude(position.coords.latitude);
        setUserLongitude(position.coords.longitude);
      });
    }
  }, [user, setUser]);

  const loadPublications = async () => {
    try {
      const { data, error } = await supabase
        .from('publicacoes')
        .select(`
          id,
          titulo,
          mensagem,
          data_publicacao,
          ativo,
          bairro_destino,
          data_inicio,
          data_fim,
          orgaos_publicadores (
            id,
            nome_orgao,
            tipo_orgao,
            status_orgao
          )
        `)
        .eq('ativo', true)
        .eq('bairro_destino', user.bairro)
        .order('data_publicacao', { ascending: false });

      if (error) {
        console.error('Erro ao carregar publicações:', error);
        return;
      }

      if (!data) {
        console.warn('Nenhuma publicação encontrada');
        return;
      }

      // Transforma os dados para o formato esperado
      const transformedData = data.map(pub => {
        const organ = pub.orgaos_publicadores;
        
        if (!organ) {
          console.warn('Publicação sem órgão:', pub);
          return null;
        }

        const publication: Publication = {
          id: pub.id,
          titulo: pub.titulo,
          mensagem: pub.mensagem,
          data_publicacao: pub.data_publicacao,
          orgaos_publicadores: organ,
          ativo: pub.ativo,
          bairro_destino: pub.bairro_destino,
          data_inicio: pub.data_inicio,
          data_fim: pub.data_fim
        };

        // Valida campos obrigatórios
        if (!publication.ativo || !publication.bairro_destino || !publication.data_inicio || !publication.data_fim) {
          console.warn('Publicação com campos obrigatórios ausentes:', publication);
          return null;
        }

        return publication;
      }).filter(Boolean) as Publication[];

      console.log('Publicações carregadas:', transformedData);
      setPublications(transformedData);
    } catch (error) {
      console.error('Erro ao carregar publicações:', error);
    }
  };

  const loadOrgans = async () => {
    const { data } = await supabase
      .from('orgaos_publicadores')
      .select('id, nome_orgao, tipo_orgao, status_orgao')
      .eq('status_orgao', 'Ativo');
    // Garante que todos os campos obrigatórios estão presentes
    const organs: Organ[] = (data || []).map((org: any) => ({
      id: org.id,
      nome_orgao: org.nome_orgao,
      tipo_orgao: org.tipo_orgao,
      status_orgao: org.status_orgao,
    }));
    setActiveOrgans(organs);
  };

  const loadAmbulantes = async () => {
    if (!user?.bairro) {
      console.warn('Bairro do usuário não definido');
      return;
    }
    
    console.log('User bairro:', user.bairro);
    
    setIsLoadingAmbulantes(true);
    try {
      const { data, error } = await supabase
        .from('ambulantes')
        .select('*')
        .eq('bairro_destino', user.bairro)
        .eq('ativo', true)
        .order('nome', { ascending: true });

      if (error) {
        console.error('Erro ao carregar ambulantes:', error);
        throw error;
      }

      if (!data) {
        console.warn('Nenhum ambulante encontrado para o bairro:', user.bairro);
        setAmbulantes([]);
        return;
      }

      console.log('Ambulantes carregados:', data);
      setAmbulantes(data);
    } catch (error) {
      console.error('Erro ao carregar ambulantes:', error);
      setAmbulantes([]);
    } finally {
      setIsLoadingAmbulantes(false);
    }
  };

  // Efeito para carregar ambulantes quando o painel é aberto
  useEffect(() => {
    if (showAmbulantePanel && user?.bairro) {
      loadAmbulantes();
    }
  }, [showAmbulantePanel, user?.bairro]);

  const readLatestPublication = useCallback(() => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const now = new Date();
    const validPublications = publications
      .filter(pub => 
        pub.ativo &&
        pub.bairro_destino === user?.bairro &&
        new Date(pub.data_inicio) <= now &&
        new Date(pub.data_fim) >= now &&
        !mensagensLidas.includes(pub.id)
      )
      .sort((a, b) => new Date(b.data_publicacao).getTime() - new Date(a.data_publicacao).getTime());

    if (validPublications.length === 0) return;

    setIsSpeaking(true);
    let currentIndex = 0;

    const readNext = () => {
      if (currentIndex >= validPublications.length) {
        setIsSpeaking(false);
        return;
      }

      const pub = validPublications[currentIndex];
      const utterance = new SpeechSynthesisUtterance(
        `${pub.orgaos_publicadores.nome_orgao}: ${pub.mensagem}`
      );
      utterance.lang = 'pt-BR';
      utterance.onend = () => {
        currentIndex++;
        readNext();
      };
      window.speechSynthesis.speak(utterance);
    };

    readNext();
  }, [publications, user?.bairro, mensagensLidas, isSpeaking]);

  const hasActivePublications = publications.length > 0;

  // Função para marcar mensagem como lida no Supabase
  const marcarMensagemComoLida = async (publicacaoId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('publicacoes_lidas')
        .upsert(
          {
            usuario_id: user.id,
            publicacao_id: publicacaoId,
            lida_em: new Date().toISOString()
          },
          {
            onConflict: 'usuario_id,publicacao_id'
          }
        );

      if (error) throw error;

      // Atualiza o estado local
      setMensagensLidas(prev => [...prev, publicacaoId]);
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error);
    }
  };

  // Função para carregar mensagens lidas do Supabase
  const carregarMensagensLidas = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('publicacoes_lidas')
        .select('publicacao_id')
        .eq('usuario_id', user.id);

      if (error) throw error;

      const ids = data.map(item => item.publicacao_id);
      setMensagensLidas(ids);
    } catch (error) {
      console.error('Erro ao carregar mensagens lidas:', error);
    }
  };

  // Função para contar mensagens não lidas
  const countUnreadMessages = useCallback(() => {
    if (!user?.bairro || !publications.length) return 0;

    const now = new Date();
    return publications.filter(pub => 
      pub.ativo &&
      pub.bairro_destino === user.bairro &&
      new Date(pub.data_inicio) <= now &&
      new Date(pub.data_fim) >= now &&
      !mensagensLidas.includes(pub.id)
    ).length;
  }, [user?.bairro, publications, mensagensLidas]);

  // Atualiza contador quando mudar publicações, bairro ou mensagens lidas
  useEffect(() => {
    const count = countUnreadMessages();
    setUnreadCount(count);
  }, [countUnreadMessages]);

  // Carrega mensagens lidas após carregar publicações
  useEffect(() => {
    if (publications.length > 0) {
      carregarMensagensLidas();
    }
  }, [publications]);

  // Função para buscar comércios por raio de distância
  const buscarComerciosPorRaio = async (termo: string, raio: number) => {
    if (!userLatitude || !userLongitude) {
      console.error('Coordenadas do usuário não disponíveis');
      return;
    }

    try {
      // Buscar todos os bairros do Supabase
      const { data: bairros, error: bairrosError } = await supabase
        .from('bairros')
        .select('nome, latitude, longitude');

      if (bairrosError) {
        console.error('Erro ao buscar bairros:', bairrosError);
        return;
      }

      // Calcular bairros dentro do raio
      const bairrosDentroDoRaio = bairros
        .filter((bairro) => {
          const distancia = calcularDistanciaEmKm(
            userLatitude,
            userLongitude,
            bairro.latitude,
            bairro.longitude
          );
          return distancia <= raio;
        })
        .map((bairro) => bairro.nome);

      console.log('Bairros dentro do raio:', bairrosDentroDoRaio);

      // Buscar comércios nos bairros dentro do raio
      const { data: comercios, error: comerciosError } = await supabase
        .from('comercios')
        .select('*')
        .in('bairro', bairrosDentroDoRaio)
        .ilike('nome_razao_social', `%${termo}%`);

      if (comerciosError) {
        console.error('Erro ao buscar comércios:', comerciosError);
        return;
      }

      return comercios;
    } catch (error) {
      console.error('Erro na busca por raio:', error);
    }
  };

  // Função para lidar com mudança de raio
  const handleRaioChange = async (novoRaio: number) => {
    setRaioSelecionado(novoRaio);
    // Aqui você pode adicionar lógica para refazer a busca automaticamente
    // se houver um termo de busca ativo
  };

  const loadPromocoes = async () => {
    async function fetchPromocoes() {
      setLoadingPromocoes(true);
      if (!user?.bairro) {
        setPromocoes([]);
        setLoadingPromocoes(false);
        return;
      }
      const hoje = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('promocoes')
        .select('id, titulo, descricao, imagem_url, data_inicio, data_fim, bairro_destino')
        .eq('bairro_destino', user.bairro)
        .gte('data_fim', hoje)
        .order('data_fim', { ascending: true });
      if (error) {
        setPromocoes([]);
      } else {
        setPromocoes((data as Promocao[]) || []);
      }
      setLoadingPromocoes(false);
    }
    fetchPromocoes();
  };

  if (!user) return null;

  return (
    <>
      {/* CONTEÚDO PRINCIPAL DA TELA */}
      <div className="relative w-full h-full">
        {/* Header */}
        <div className="relative border-b border-[#2a2a2a] bg-[#0b0b0b] z-50">
          <div className="container mx-auto flex items-center justify-between px-4 h-14">
            {/* Esquerda: seta e info/speaker */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/main')}
                className="p-2 rounded-lg text-white hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setShowInfoPanel(true)}
                    className={`
                      p-2 pl-2 rounded-lg text-[#00d8ff] hover:bg-[#00d8ff]/10 cursor-pointer
                      ${publications.length > 0 ? 'animate-pulse' : ''}
                    `}
                  >
                    <Info className="w-5 h-5" />
                  </button>
                  {unreadCount > 0 && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#00d8ff] text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                      {unreadCount}
                    </div>
                  )}
                </div>

                <div className="w-2 h-0.5 bg-[#00d8ff]/50" />

                <button
                  onClick={readLatestPublication}
                  className={`p-2 rounded-lg text-[#00d8ff] hover:bg-[#00d8ff]/10 cursor-pointer ${
                    isSpeaking ? 'text-green-400 animate-bounce' : publications.length > 0 ? 'animate-pulse' : ''
                  }`}
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Centro: localização */}
            <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
              <p className="text-white text-sm">Olá, você está no bairro</p>
              <p className="text-[#00d8ff] font-semibold text-lg mt-1">{user.bairro}</p>
            </div>

            {/* Direita: botão de ambulante e busca/filtro */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAmbulantePanel(true)}
                className={`text-[#00d8ff] ${ambulantes.length > 0 ? 'animate-pulse' : ''}`}
              >
                <UserCheck size={22} />
              </button>
              <button
                className="p-2 rounded-full bg-[#212121] text-[#00d8ff] hover:bg-[#2a2a2a]"
                onClick={() => setShowFilterPanel(true)}
                title="Filtrar"
              >
                <Filter size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Painel de filtro/busca avançada */}
        <FilterPanel
          isOpen={showFilterPanel}
          bairro={user?.bairro || ''}
          userId={user?.id || ''}
          onClose={() => {
            setShowFilterPanel(false);
            setFilteredPromotions(null); // Volta para lista geral
          }}
          onResults={(results) => {
            setFilteredPromotions(results);
          }}
          raioSelecionado={raioSelecionado}
          onRaioChange={setRaioSelecionado}
        />

        {/* Conteúdo principal */}
        <div className="container mx-auto px-4 pt-4">
          {/* Abas */}
          <div className="mt-4 mb-1 flex gap-2">
            {['promotions', 'trending', 'commerce'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-full font-medium text-sm ${
                  activeTab === tab ? 'bg-[#00d8ff] text-black' : 'bg-[#212121] text-white'
                }`}
              >
                {{
                  promotions: 'Promoções',
                  trending: 'Em Alta',
                  commerce: 'Comércios'
                }[tab]}
              </button>
            ))}
          </div>

          {/* Exibe resultados filtrados se houver, senão lista geral */}
          {activeTab === 'promotions' && (
            <div className="mt-2">
              {loadingPromocoes ? (
                <div className="text-center text-gray-600 py-4">Carregando promoções...</div>
              ) : promocoes.length === 0 ? (
                <div className="bg-[#18181b] rounded-xl shadow-lg overflow-hidden flex flex-col items-center justify-center h-100 text-gray-300 text-lg">
                  Nenhuma promoção disponível no momento para seu bairro.
                </div>
              ) : (
                <PromotionCarousel promocoes={promocoes} />
              )}
              {/* Botão 'Ver no mapa' permanece sempre visível */}
              <div className="flex justify-center mt-8">
                <button
                  className="bg-[#00BFFF] text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 hover:opacity-90"
                  onClick={() => setShowMap(true)}
                >
                  Ver no mapa
                </button>
              </div>
              {showMap && (
                <div className="mt-4">
                  <PromotionMap onClose={() => setShowMap(false)} />
                </div>
              )}
            </div>
          )}
          {activeTab === 'trending' && <RealMap />}
          {activeTab === 'commerce' && (
            <CommerceList onCommerceClick={setSelectedCommerce} />
          )}
        </div>

        <ProductFeed isOpen={isProductFeedOpen} onClose={() => setIsProductFeedOpen(false)} />
        
        {selectedCommerce && (
          <CommerceDetails
            isOpen={!!selectedCommerce}
            commerce={selectedCommerce}
            onClose={() => setSelectedCommerce(null)}
          />
        )}

        {/* Ambulante Panel */}
        {showAmbulantePanel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
            <div className="w-96 bg-[#0b0b0b] h-full flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-[#2a2a2a] flex justify-between items-center">
                <h2 className="text-xl font-semibold text-[#00d8ff]">Ambulantes do Bairro</h2>
                <button 
                  onClick={() => {
                    setShowAmbulantePanel(false);
                    setSelectedAmbulante(null);
                  }}
                  className="text-white hover:text-[#00d8ff] transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <AmbulanteList
                  ambulantes={ambulantes}
                  isLoading={isLoadingAmbulantes}
                  onSelectAmbulante={setSelectedAmbulante}
                />
              </div>
            </div>
          </div>
        )}

        {/* Ambulante Modal */}
        {selectedAmbulante && (
          <AmbulanteModal
            ambulante={selectedAmbulante}
            onClose={() => setSelectedAmbulante(null)}
          />
        )}
      </div>

      {/* PAINEL ℹ️ FORA DO CONTAINER PRINCIPAL */}
      {showInfoPanel && (
        <PublicInfoPanel
          isOpen={showInfoPanel}
          onClose={() => setShowInfoPanel(false)}
          publications={publications}
          activeOrgans={activeOrgans}
          userBairro={user?.bairro}
          onPublicationSelect={(pub) => setSelectedPublication(pub)}
          onReadMessage={marcarMensagemComoLida}
          mensagensLidas={mensagensLidas}
        />
      )}
    </>
  );
}

// COMPONENTE DO CARROSSEL DE PROMOÇÕES
function PromotionCarousel({ promocoes }: { promocoes: any[] }) {
  const [current, setCurrent] = React.useState(0);
  const [commerces, setCommerces] = React.useState<Record<string, string>>({});
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    async function fetchCommerces() {
      const ids = Array.from(new Set(promocoes.map((p: any) => p.comercio_id).filter(Boolean)));
      if (ids.length === 0) return;
      const { data, error } = await supabase
        .from('comercios')
        .select('id, nome_razao_social')
        .in('id', ids);
      if (!error && isMounted) {
        const map: Record<string, string> = {};
        (data || []).forEach((c: any) => { map[c.id] = c.nome_razao_social; });
        setCommerces(map);
      }
    }
    fetchCommerces();
    return () => { isMounted = false; };
  }, [promocoes]);

  React.useEffect(() => {
    if (promocoes.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % promocoes.length);
    }, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [promocoes]);

  if (!promocoes.length) return null;
  const promo = promocoes[current];
  const nomeComercio = promo.comercio_id ? (commerces[promo.comercio_id] || 'Estabelecimento') : 'Estabelecimento';
  const desconto = promo.desconto ? `${promo.desconto}% OFF` : null;
  const validade = promo.data_validade ? `Válido até ${new Date(promo.data_validade).toLocaleDateString('pt-BR')}` : '';
  const imgUrl = promo.imagem_url && promo.imagem_url !== 'null' && promo.imagem_url !== '' ? promo.imagem_url : '/img/padrao.png';

  // Função para abrir o mapa (mantém funcionalidade)
  const handleVerNoMapa = () => {
    // Exemplo: pode ser window.open ou navegação interna
    window.open(`https://www.google.com/maps/search/?q=${encodeURIComponent(nomeComercio)}`);
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 md:px-6">
      {/* Espaço extra acima do banner para harmonia visual */}
      <div className="mt-8" />
      {/* Banner visual */}
      <div className="w-full rounded-2xl min-h-[320px] h-[340px] flex flex-col justify-between bg-neutral-800" style={{ aspectRatio: '3.8/1' }}>
        {/* Conteúdo textual e botões aqui, sem <img> quebrada */}
        <div className="relative z-20 flex flex-col justify-center h-full pl-8 pr-4 pb-8 max-w-[60%] mt-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 drop-shadow-lg leading-tight">{promo.titulo}</h2>
          <p className="text-base sm:text-lg text-gray-200 mb-1 drop-shadow max-w-xl">{promo.descricao}</p>
          <span className="text-xs text-gray-300 mb-1 block">{validade}</span>
        </div>
        {/* Selo de desconto (opcional, canto superior direito) */}
        {desconto && (
          <div className="absolute top-4 right-6 bg-[#00BFFF] text-white text-xs font-bold px-3 py-1 rounded-full shadow z-30">
            -{desconto}
          </div>
        )}
      </div>
      {/* Indicadores do carrossel */}
      <div className="flex justify-center items-center mt-2">
        {promocoes.map((_: any, idx: number) => (
          <span
            key={idx}
            className={`w-2 h-2 mx-1 rounded-full transition-all duration-300 ${idx === current ? 'bg-[#00BFFF]' : 'bg-white/30'}`}
            style={{ boxShadow: idx === current ? '0 0 6px #00BFFF' : undefined }}
          />
        ))}
      </div>
      {/* Após o banner: */}
      <div className="mt-1 flex items-center justify-between w-full px-4">
        {/* Esquerda: Curtir e Comentar */}
        <div className="flex items-center gap-2">
          <button className="bg-[#212121] text-white text-sm font-medium px-4 py-2 rounded-lg shadow-md flex items-center gap-2">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 21s-6.5-5.5-9-9.5C1.5 8.5 3.5 5 7 5c2.1 0 3.5 1.5 5 3.5C13.5 6.5 14.9 5 17 5c3.5 0 5.5 3.5 4 6.5-2.5 4-9 9.5-9 9.5z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span>89</span>
          </button>
          <button className="bg-[#212121] text-white text-sm font-medium px-4 py-2 rounded-lg shadow-md flex items-center gap-2">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span>12</span>
          </button>
        </div>
        {/* Direita: Ver detalhes */}
        <button
          className="bg-[#212121] text-white text-sm font-medium px-4 py-2 rounded-lg shadow-md flex items-center gap-2"
          onClick={() => window.location.href = `/promotion/${promo.id}`}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Ver detalhes
        </button>
      </div>
    </div>
  );
}
