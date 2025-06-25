import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MapPin, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Fuse from 'fuse.js';
import { useUserContext } from '../context/UserContext';
import { getNeighborhoodFromLatLng, getNeighborBairros } from '../utils/geolocation';
import { calculateDistance } from '../utils/calculateDistance';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ResultItem {
  id: string;
  type: 'promocao' | 'servico' | 'produto' | 'comercio';
  title: string;
  description: string;
  image?: string;
  lat?: number;
  lng?: number;
  address?: string;
  distance?: number;
  raw: any;
  bairro?: string;
}

// Fix para ícones do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente para centralizar o mapa nos comércios
function MapController({ commerceResults }: { commerceResults: ResultItem[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (commerceResults.length > 0) {
      // Calcular o centro baseado nos comércios
      const lats = commerceResults.map(item => parseFloat(item.lat as any) || 0).filter(lat => lat !== 0);
      const lngs = commerceResults.map(item => parseFloat(item.lng as any) || 0).filter(lng => lng !== 0);
      
      if (lats.length > 0 && lngs.length > 0) {
        const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
        const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
        map.setView([centerLat, centerLng], 14);
      }
    }
  }, [commerceResults, map]);
  
  return null;
}

// Ícone customizado para os pins pulsando
const createPulsingIcon = () => {
  return L.divIcon({
    html: `
      <div class="relative">
        <div class="w-6 h-6 bg-[#00d8ff] rounded-full border-2 border-white shadow-lg animate-pulse"></div>
        <div class="absolute inset-0 w-6 h-6 bg-[#00d8ff] rounded-full animate-ping opacity-30"></div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  });
};

export default function SearchResultsScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const termo = searchParams.get('termo') || '';
  const raioParam = searchParams.get('raio');
  const raioSelecionado = raioParam ? parseInt(raioParam) : 0;
  const tipoFiltro = searchParams.get('tipo') || 'geral';
  const { user, setUser } = useUserContext();
  const bairro = user?.bairro || '';
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [showOtherNeighborhoods, setShowOtherNeighborhoods] = useState(false);
  const [otherNeighborhoodResults, setOtherNeighborhoodResults] = useState<ResultItem[]>([]);
  const [showAllCommerces, setShowAllCommerces] = useState(false);
  const [showAllPromos, setShowAllPromos] = useState(false);
  const [showAllServices, setShowAllServices] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [filterByNeighbors, setFilterByNeighbors] = useState(false);
  const [userLatitude, setUserLatitude] = useState<number | null>(null);
  const [userLongitude, setUserLongitude] = useState<number | null>(null);

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

  useEffect(() => {
    if (!termo || !bairro) {
      setLoading(false);
      return;
    }
    
    let isMounted = true;
    setLoading(true);
    
    const performSearch = async () => {
      try {
        let bairrosParaBuscar: string[] = [bairro];
        
        // Se há raio selecionado, buscar bairros dentro do raio
        if (raioSelecionado > 0 && userLatitude && userLongitude) {
          console.log(`🔍 Buscando bairros dentro de ${raioSelecionado}km...`);
          
          // Buscar todos os bairros do Supabase
          const { data: bairrosData, error: bairrosError } = await supabase
            .from('bairros')
            .select('*');
          
          if (bairrosError) {
            console.error('Erro ao buscar bairros:', bairrosError);
          } else if (bairrosData) {
            // Filtrar bairros dentro do raio
            const bairrosDentroDoRaio = bairrosData.filter((bairroItem) => {
              const distance = calculateDistance(
                userLatitude, 
                userLongitude, 
                bairroItem.latitude, 
                bairroItem.longitude
              );
              console.log(`📍 ${bairroItem.nome}: ${distance.toFixed(2)}km`);
              return distance <= raioSelecionado;
            }).map(bairroItem => bairroItem.nome);
            
            console.log('🎯 Bairros dentro do raio:', bairrosDentroDoRaio);
            bairrosParaBuscar = bairrosDentroDoRaio;
          }
        } else if (showOtherNeighborhoods || filterByNeighbors) {
          // Usar lógica antiga de bairros vizinhos se não há raio
          const neighborBairros = getNeighborBairros(bairro);
          bairrosParaBuscar = [bairro, ...neighborBairros];
        }
        
        console.log('🔍 Bairros para busca:', bairrosParaBuscar);
        console.log('🎯 Tipo de filtro:', tipoFiltro);
        
        // Se é filtro de promoções, buscar apenas em banners
        if (tipoFiltro === 'promocoes') {
          console.log('🎯 Buscando apenas promoções...');
          const { data, error } = await supabase
            .from('banners')
            .select('*')
            .eq('ativo', true)
            .in('bairro', bairrosParaBuscar)
            .or(`titulo.ilike.%${termo}%,descricao.ilike.%${termo}%`);
          
          if (!error && data && isMounted) {
            const promoResults = data.map((item: any) => ({
              id: item.id,
              type: 'promocao' as const,
              title: item.titulo,
              description: item.descricao,
              image: item.imagem_url,
              lat: item.lat,
              lng: item.lng,
              address: item.endereco,
              raw: item,
              distance: userLatitude && userLongitude && item.lat && item.lng 
                ? calculateDistance(userLatitude, userLongitude, item.lat, item.lng)
                : Math.floor(Math.random() * 5 + 1),
            }));
            setResults(promoResults);
          }
        } else {
          // Busca geral (lógica existente)
          const [banners, publicacoes, comercios, produtos] = await Promise.all([
            supabase.from('banners').select('*').in('bairro', bairrosParaBuscar).or(`titulo.ilike.%${termo}%,descricao.ilike.%${termo}%`),
            supabase.from('publicacoes').select('*').in('bairro_destino', bairrosParaBuscar).or(`titulo.ilike.%${termo}%,mensagem.ilike.%${termo}%`),
            supabase.from('comercios').select('*').in('bairro', bairrosParaBuscar),
            supabase.from('produtos').select('*').in('bairro', bairrosParaBuscar).or(`nome.ilike.%${termo}%,descricao.ilike.%${termo}%`),
          ]);

          if (!isMounted) return;

          // Processar resultados (lógica existente)
          const produtosData = produtos && produtos.data ? produtos.data : [];
          
          const promoResults = (banners.data || []).map((item: any) => ({
            id: item.id,
            type: 'promocao' as const,
            title: item.titulo,
            description: item.descricao,
            image: item.imagem_url,
            lat: item.lat,
            lng: item.lng,
            address: item.endereco,
            raw: item,
            distance: userLatitude && userLongitude && item.lat && item.lng 
              ? calculateDistance(userLatitude, userLongitude, item.lat, item.lng)
              : Math.floor(Math.random() * 5 + 1),
          }));
          
          const servicoResults = (publicacoes.data || []).map((item: any) => ({
            id: item.id,
            type: 'servico' as const,
            title: item.titulo,
            description: item.mensagem,
            image: item.imagem_url,
            lat: item.lat,
            lng: item.lng,
            address: item.endereco,
            raw: item,
            distance: userLatitude && userLongitude && item.lat && item.lng 
              ? calculateDistance(userLatitude, userLongitude, item.lat, item.lng)
              : Math.floor(Math.random() * 5 + 1),
          }));
          
          // Fuzzy search para comércios
          let comerciosFiltrados = [];
          if (comercios.data && termo) {
            const fuse = new Fuse(comercios.data, {
              keys: ['nome_razao_social'],
              threshold: 0.4,
              ignoreLocation: true,
              minMatchCharLength: 2,
            });
            comerciosFiltrados = fuse.search(termo).map((r: any) => r.item);
          } else {
            comerciosFiltrados = comercios.data || [];
          }
          
          const comercioResults = (comerciosFiltrados || []).map((item: any) => ({
            id: item.id,
            type: 'comercio' as const,
            title: item.nome_razao_social,
            description: item.descricao,
            image: item.logo_url || item.imagem_url,
            lat: item.lat,
            lng: item.lng,
            address: item.endereco,
            bairro: item.bairro,
            raw: item,
            distance: userLatitude && userLongitude && item.lat && item.lng 
              ? calculateDistance(userLatitude, userLongitude, item.lat, item.lng)
              : Math.floor(Math.random() * 5 + 1),
          }));
          
          const produtoResults = (produtosData || []).map((item: any) => ({
            id: item.id,
            type: 'produto' as const,
            title: item.nome,
            description: item.descricao,
            image: item.imagem_url,
            lat: item.lat,
            lng: item.lng,
            address: item.endereco,
            raw: item,
            distance: userLatitude && userLongitude && item.lat && item.lng 
              ? calculateDistance(userLatitude, userLongitude, item.lat, item.lng)
              : Math.floor(Math.random() * 5 + 1),
          }));
          
          setResults([...promoResults, ...servicoResults, ...produtoResults, ...comercioResults]);
        }
        
        if (isMounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro na busca:', error);
        if (isMounted) {
          setResults([]);
          setLoading(false);
        }
      }
    };
    
    performSearch();
    
    return () => {
      isMounted = false;
    };
  }, [termo, bairro, raioSelecionado, userLatitude, userLongitude, showOtherNeighborhoods, filterByNeighbors, tipoFiltro]);

  // Agrupar por tipo
  const grouped = {
    promocao: results.filter(r => r.type === 'promocao'),
    servico: results.filter(r => r.type === 'servico'),
    produto: results.filter(r => r.type === 'produto'),
    comercio: results.filter(r => r.type === 'comercio'),
  };

  // Para exibir só os primeiros itens por padrão
  const visiblePromos = showAllPromos ? grouped.promocao : grouped.promocao.slice(0, 3);
  const hasMorePromos = grouped.promocao.length > 3;
  const visibleServices = showAllServices ? grouped.servico : grouped.servico.slice(0, 3);
  const hasMoreServices = grouped.servico.length > 3;
  const visibleProducts = showAllProducts ? grouped.produto : grouped.produto.slice(0, 3);
  const hasMoreProducts = grouped.produto.length > 3;
  const visibleCommerces = showAllCommerces ? grouped.comercio : grouped.comercio.slice(0, 3);
  const hasMoreCommerces = grouped.comercio.length > 3;

  // Função para voltar ao estado anterior
  const handleBack = () => {
    if (showOtherNeighborhoods) {
      setShowOtherNeighborhoods(false);
      setOtherNeighborhoodResults([]);
    } else {
      navigate('/neighborhood?abrirFiltro=true');
    }
  };

  // Verificar se não há resultados em nenhuma categoria
  const hasNoResults = grouped.promocao.length === 0 && grouped.servico.length === 0 && grouped.produto.length === 0 && grouped.comercio.length === 0;

  const handleSectionClick = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Função para formatar distância
  const formatDistance = (distance: number | undefined) => {
    if (!distance) return null;
    
    if (distance < 0.1) {
      return "📍 No seu bairro";
    } else if (distance < 1) {
      return `📍 ${(distance * 1000).toFixed(0)}m de você`;
    } else {
      return `📍 ${distance.toFixed(1)}km de você`;
    }
  };

  console.log(grouped.produto);

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white flex flex-col items-center">
      {/* Topo: Voltar + Título */}
      <div className="w-full max-w-3xl px-2 md:px-0 flex items-center gap-3 py-3 border-b border-[#222] sticky top-0 bg-[#0b0b0b] z-10">
        <button onClick={handleBack} className="p-2 rounded-lg text-[#00d8ff] hover:bg-[#222]">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg md:text-xl font-bold truncate">Resultados para: <span className="text-[#00d8ff]">{termo}</span></h1>
      </div>
      {/* Mapa compacto */}
      <div className="w-full max-w-3xl px-2 md:px-0 mt-3">
        {loading ? (
          <div className="w-full h-[150px] bg-gray-700 rounded-xl flex items-center justify-center text-gray-200 text-base font-semibold">
            <div className="text-center">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-[#00d8ff] animate-pulse" />
              <p>Carregando mapa...</p>
            </div>
          </div>
        ) : grouped.comercio.length > 0 ? (
          <div className="w-full h-[150px] rounded-xl overflow-hidden shadow-lg border border-[#2a2a2a]">
            <MapContainer
              center={[-29.7156, -52.4297]} // Centro padrão
              zoom={14}
              style={{ height: '100%', width: '100%' }}
              className="z-10"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              <MapController commerceResults={grouped.comercio} />
              
              {/* Markers dos comércios encontrados */}
              {grouped.comercio.map((commerce) => {
                const lat = parseFloat(commerce.lat as any);
                const lng = parseFloat(commerce.lng as any);
                
                if (isNaN(lat) || isNaN(lng)) return null;
                
                return (
                  <Marker
                    key={commerce.id}
                    position={[lat, lng]}
                    icon={createPulsingIcon()}
                    eventHandlers={{
                      click: () => {
                        navigate(`/commerce/${commerce.id}`);
                      }
                    }}
                  >
                    <Popup>
                      <div className="p-2 min-w-[150px]">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-gray-600" />
                          <strong className="text-gray-800">{commerce.title}</strong>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-3">
                          <p>{commerce.description}</p>
                          {commerce.distance && (
                            <p className="text-xs text-[#00d8ff] mt-1">
                              {formatDistance(commerce.distance)}
                            </p>
                          )}
                        </div>
                        
                        <button 
                          className="w-full py-1 px-2 bg-[#00d8ff] text-white rounded text-sm hover:bg-[#00d8ff]/90 transition-colors"
                          onClick={() => navigate(`/commerce/${commerce.id}`)}
                        >
                          Ver Detalhes
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        ) : (
          <div className="w-full h-[150px] bg-gray-700 rounded-xl flex items-center justify-center text-gray-200 text-base font-semibold">
            <div className="text-center">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>Nenhum comércio encontrado</p>
            </div>
          </div>
        )}
      </div>
      {/* Conteúdo principal compacto */}
      {loading ? (
        <div className="flex items-center justify-center h-32 text-[#00d8ff] w-full">Buscando...</div>
      ) : (
        <div className="w-full max-w-3xl px-2 md:px-0 mt-3">
          {/* Mensagem de nenhum resultado */}
          {hasNoResults && !showOtherNeighborhoods && (
            <div className="text-center py-6 mb-4">
              <span className="text-4xl mb-3 block">😔</span>
              <p className="text-gray-300 text-lg font-medium">Nenhum resultado encontrado para "{termo}"</p>
            </div>
          )}
          
          {/* Accordion de seções */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Promoções */}
            <div className="col-span-1">
              <button
                onClick={() => handleSectionClick('promocoes')}
                className={`w-full p-4 rounded-2xl font-semibold text-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#00d8ff] shadow-lg cursor-pointer
                  ${grouped.promocao.length > 0 ? 'bg-[#00d8ff] text-white hover:bg-[#00b4d8] hover:shadow-xl' : 'bg-[#bfbfbf] text-[#212121] opacity-80'}
                  ${expandedSection === 'promocoes' ? 'ring-2 ring-[#00d8ff]' : ''}`}
              >
                {grouped.promocao.length > 0 ? `Promoções (${grouped.promocao.length})` : 'Nenhuma promoção disponível 😔'}
              </button>
              <AnimatePresence initial={false}>
                {expandedSection === 'promocoes' && (
                  <motion.div
                    key="promocoes"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="bg-[#18181b] rounded-xl mt-2 p-4">
                      {grouped.promocao.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {grouped.promocao.map(item => (
                            <div key={item.id} className="bg-[#0b0b0b] rounded-lg p-3 flex gap-3 items-center cursor-pointer hover:bg-[#1a1a1a] transition-colors" onClick={() => navigate(`/commerce/${item.id}`)}>
                              {item.image && <img src={item.image} alt={item.title} className="w-12 h-12 object-cover rounded-md" />}
                              <div className="flex-1">
                                <h3 className="font-semibold text-sm mb-1 truncate">{item.title}</h3>
                                <p className="text-xs text-gray-300 truncate">{item.description}</p>
                                {formatDistance(item.distance) && (
                                  <p className="text-xs text-[#00d8ff] mt-1">{formatDistance(item.distance)}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-400">Nenhuma promoção encontrada para "{termo}" no bairro atual.</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* Serviços */}
            <div className="col-span-1">
              <button
                onClick={() => handleSectionClick('servicos')}
                className={`w-full p-4 rounded-2xl font-semibold text-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#00d8ff] shadow-lg cursor-pointer
                  ${grouped.servico.length > 0 ? 'bg-[#00d8ff] text-white hover:bg-[#00b4d8] hover:shadow-xl' : 'bg-[#bfbfbf] text-[#212121] opacity-80'}
                  ${expandedSection === 'servicos' ? 'ring-2 ring-[#00d8ff]' : ''}`}
              >
                {grouped.servico.length > 0 ? `Serviços (${grouped.servico.length})` : 'Nenhum serviço disponível 😔'}
              </button>
              <AnimatePresence initial={false}>
                {expandedSection === 'servicos' && (
                  <motion.div
                    key="servicos"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="bg-[#18181b] rounded-xl mt-2 p-4">
                      {grouped.servico.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {grouped.servico.map(item => (
                            <div key={item.id} className="bg-[#0b0b0b] rounded-lg p-3 flex gap-3 items-center cursor-pointer hover:bg-[#1a1a1a] transition-colors" onClick={() => navigate(`/commerce/${item.id}`)}>
                              {item.image && <img src={item.image} alt={item.title} className="w-12 h-12 object-cover rounded-md" />}
                              <div className="flex-1">
                                <h3 className="font-semibold text-sm mb-1 truncate">{item.title}</h3>
                                <p className="text-xs text-gray-300 truncate">{item.description}</p>
                                {formatDistance(item.distance) && (
                                  <p className="text-xs text-[#00d8ff] mt-1">{formatDistance(item.distance)}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-400">Nenhum serviço encontrado para "{termo}" no bairro atual.</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* Produtos */}
            <div className="col-span-1">
              <button
                onClick={() => handleSectionClick('produtos')}
                className={`w-full p-4 rounded-2xl font-semibold text-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#00d8ff] shadow-lg cursor-pointer
                  ${grouped.produto.length > 0 ? 'bg-[#00d8ff] text-white hover:bg-[#00b4d8] hover:shadow-xl' : 'bg-[#bfbfbf] text-[#212121] opacity-80'}
                  ${expandedSection === 'produtos' ? 'ring-2 ring-[#00d8ff]' : ''}`}
              >
                {grouped.produto.length > 0 ? `Produtos (${grouped.produto.length})` : 'Nenhum produto disponível 😔'}
              </button>
              <AnimatePresence initial={false}>
                {expandedSection === 'produtos' && (
                  <motion.div
                    key="produtos"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="bg-[#18181b] rounded-xl mt-2 p-4">
                      {grouped.produto.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {grouped.produto.map((product) => {
                            const nome = product?.title || "Sem nome";
                            const descricao = product?.description || "Sem descrição";
                            let imagemUrl = product?.image;
                            if (imagemUrl) {
                              try {
                                imagemUrl = decodeURIComponent(imagemUrl);
                              } catch {}
                            }
                            const imagemFinal =
                              imagemUrl && imagemUrl.trim() !== "" && imagemUrl !== "null"
                                ? imagemUrl
                                : "/img/padrao.png";

                            return (
                              <div key={product.id} className="bg-[#0b0b0b] rounded-lg p-3 flex gap-3 items-center cursor-pointer hover:bg-[#1a1a1a] transition-colors" onClick={() => navigate(`/commerce/${product.id}`)}>
                                <img
                                  src={imagemFinal}
                                  alt={nome}
                                  className="w-12 h-12 object-cover rounded-md"
                                  onError={(e) => {
                                    e.currentTarget.src = "/img/padrao.png";
                                  }}
                                />
                                <div className="flex-1">
                                  <h3 className="font-semibold text-sm mb-1 truncate">{nome}</h3>
                                  <p className="text-xs text-gray-300 truncate">{descricao}</p>
                                  {formatDistance(product.distance) && (
                                    <p className="text-xs text-[#00d8ff] mt-1">{formatDistance(product.distance)}</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-400">Nenhum produto encontrado para "{termo}" no bairro atual.</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* Comércios */}
            <div className="col-span-1">
              <button
                onClick={() => handleSectionClick('comercios')}
                className={`w-full p-4 rounded-2xl font-semibold text-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#00d8ff] shadow-lg cursor-pointer
                  ${grouped.comercio.length > 0 ? 'bg-[#00d8ff] text-white hover:bg-[#00b4d8] hover:shadow-xl' : 'bg-[#bfbfbf] text-[#212121] opacity-80'}
                  ${expandedSection === 'comercios' ? 'ring-2 ring-[#00d8ff]' : ''}`}
              >
                {grouped.comercio.length > 0 ? `Comércios (${grouped.comercio.length})` : 'Nenhum comércio disponível 😔'}
              </button>
              <AnimatePresence initial={false}>
                {expandedSection === 'comercios' && (
                  <motion.div
                    key="comercios"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="bg-[#18181b] rounded-xl mt-2 p-4">
                      {grouped.comercio.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {grouped.comercio.map(item => (
                            <div key={item.id} className="bg-[#0b0b0b] rounded-lg p-3 flex gap-3 items-center cursor-pointer hover:bg-[#1a1a1a] transition-colors" onClick={() => navigate(`/commerce/${item.id}`)}>
                              {item.image && <img src={item.image} alt={item.title} className="w-12 h-12 object-cover rounded-md" />}
                              <div className="flex-1">
                                <h3 className="font-semibold text-sm mb-1 truncate">{item.title}</h3>
                                <p className="text-xs text-gray-300 truncate">{item.description}</p>
                                {formatDistance(item.distance) && (
                                  <p className="text-xs text-[#00d8ff] mt-1">{formatDistance(item.distance)}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-400">Nenhum comércio encontrado para "{termo}" no bairro atual.</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Botão de bairros vizinhos - sempre visível quando não há resultados */}
          {hasNoResults && !filterByNeighbors && (
            <div className="flex justify-center mb-4">
              <button
                className="px-8 py-4 bg-[#00d8ff] text-white rounded-2xl font-bold text-lg hover:bg-[#00b4d8] transition-all duration-200 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                onClick={() => setFilterByNeighbors(true)}
              >
                Buscar em bairros vizinhos
              </button>
            </div>
          )}
          {filterByNeighbors && (
            <div className="flex justify-center mb-4">
              <button
                className="px-8 py-4 bg-[#00d8ff] text-white rounded-2xl font-bold text-lg hover:bg-[#00b4d8] transition-all duration-200 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                onClick={() => setFilterByNeighbors(false)}
              >
                Buscar apenas no bairro atual
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 