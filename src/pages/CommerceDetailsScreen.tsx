import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useUserContext } from '../context/UserContext';
import { calculateDistance } from '../utils/calculateDistance';
import { ArrowLeft, Heart, MessageCircle, Share2, MapPin, Navigation, Phone, ShoppingBag, Tag, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interfaces para os tipos de dados
interface Commerce {
  id: string;
  nome_razao_social: string;
  telefone: string;
  endereco: string;
  latitude: string;
  longitude: string;
  bairro: string;
  cidade: string;
  // Adicionar outros campos conforme necessário
}

interface Product {
  id: string;
  nome_produto: string;
  descricao_produto: string;
  categoria_produto: string;
  // Preço será mockado por enquanto
  preco?: number;
}

interface Promotion {
  id: string;
  titulo: string;
  mensagem: string;
  commerce_id?: string;
}

interface Comment {
  id: string;
  texto: string;
  created_at: string;
  user_id: string;
  user_name: string;
  commerce_id: string;
}

interface Like {
  id: string;
  user_id: string;
  commerce_id: string;
  created_at: string;
}

const CommerceDetailsScreen: React.FC = () => {
  const { id: commerceId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUserContext();

  const [commerce, setCommerce] = useState<Commerce | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [distance, setDistance] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (!commerceId) {
      setError("ID do comércio não encontrado.");
      setLoading(false);
      return;
    }

    const fetchCommerceDetails = async () => {
      const { data, error } = await supabase
        .from('comercios')
        .select('*')
        .eq('id', commerceId)
        .single();
      if (error) throw new Error(`Erro ao buscar comércio: ${error.message}`);
      setCommerce(data);
      return data;
    };

    const fetchPromotions = async () => {
      try {
        const { data, error } = await supabase
          .from('publicacoes')
          .select('*')
          .eq('commerce_id', commerceId)
          .eq('ativo', true);
        
        if (error) {
          console.warn('Erro ao buscar promoções:', error);
          setPromotions([]);
          return;
        }
        
        setPromotions(data || []);
      } catch (error) {
        console.error('Erro ao buscar promoções:', error);
        setPromotions([]);
      }
    };
    
    const fetchProducts = async () => {
        try {
            // Tentar buscar produtos reais do Supabase
            const { data, error } = await supabase
                .from('produtos_comercios')
                .select('*')
                .eq('comercio_id', commerceId);
            
            if (error) {
                console.warn('Erro ao buscar produtos do Supabase, usando produtos mockados:', error);
                // Fallback para produtos mockados
                const mockProducts: Product[] = [
                    {
                        id: '1',
                        nome_produto: 'Produto 1',
                        descricao_produto: 'Descrição do produto 1',
                        categoria_produto: 'Categoria A',
                        preco: 25.00
                    },
                    {
                        id: '2',
                        nome_produto: 'Produto 2',
                        descricao_produto: 'Descrição do produto 2',
                        categoria_produto: 'Categoria B',
                        preco: 35.00
                    },
                    {
                        id: '3',
                        nome_produto: 'Produto 3',
                        descricao_produto: 'Descrição do produto 3',
                        categoria_produto: 'Categoria C',
                        preco: 45.00
                    }
                ];
                setProducts(mockProducts);
            } else {
                // Converter produtos do Supabase para o formato esperado
                const productsWithPrice = (data || []).map(product => ({
                    ...product,
                    preco: Math.random() * 100 + 10 // Preço mockado por enquanto
                }));
                setProducts(productsWithPrice);
            }
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            // Fallback para produtos mockados em caso de erro
            const mockProducts: Product[] = [
                {
                    id: '1',
                    nome_produto: 'Produto 1',
                    descricao_produto: 'Descrição do produto 1',
                    categoria_produto: 'Categoria A',
                    preco: 25.00
                },
                {
                    id: '2',
                    nome_produto: 'Produto 2',
                    descricao_produto: 'Descrição do produto 2',
                    categoria_produto: 'Categoria B',
                    preco: 35.00
                },
                {
                    id: '3',
                    nome_produto: 'Produto 3',
                    descricao_produto: 'Descrição do produto 3',
                    categoria_produto: 'Categoria C',
                    preco: 45.00
                }
            ];
            setProducts(mockProducts);
        }
    }

    const fetchComments = async () => {
      try {
        const { data, error } = await supabase
          .from('comentarios_comercio')
          .select(`
            id,
            texto,
            created_at,
            user_id
          `)
          .eq('commerce_id', commerceId)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.warn('Erro ao buscar comentários:', error);
          setComments([]);
          return;
        }
        
        // Buscar dados dos usuários separadamente
        if (data && data.length > 0) {
          const userIds = [...new Set(data.map(comment => comment.user_id))];
          const { data: usersData, error: usersError } = await supabase
            .from('usuarios')
            .select('id, nome')
            .in('id', userIds);
          
          if (!usersError && usersData) {
            const commentsWithUsers = data.map(comment => ({
              ...comment,
              user_name: usersData.find(user => user.id === comment.user_id)?.nome || 'Usuário'
            }));
            setComments(commentsWithUsers as any[]);
          } else {
            setComments(data as any[]);
          }
        } else {
          setComments([]);
        }
      } catch (error) {
        console.error('Erro ao buscar comentários:', error);
        setComments([]);
      }
    };

    const fetchLikes = async () => {
      try {
        const { data, error, count } = await supabase
          .from('curtidas_comercio')
          .select('*', { count: 'exact' })
          .eq('commerce_id', commerceId);

        if (error) {
          console.warn('Erro ao buscar curtidas:', error);
          setLikeCount(0);
          setIsLiked(false);
          return;
        }
        
        setLikeCount(count || 0);

        if (user) {
          const userLike = data?.some(like => like.user_id === user.id);
          setIsLiked(!!userLike);
        }
      } catch (error) {
        console.error('Erro ao buscar curtidas:', error);
        setLikeCount(0);
        setIsLiked(false);
      }
    };

    const calculateAndSetDistance = (commerceData: Commerce) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = parseFloat(commerceData.latitude as any);
          const lng = parseFloat(commerceData.longitude as any);
          
          if (isNaN(lat) || isNaN(lng)) {
            setDistance("Coordenadas inválidas");
            return;
          }
          
          const dist = calculateDistance(
            position.coords.latitude,
            position.coords.longitude,
            lat,
            lng
          );
          setDistance(`${dist.toFixed(1)} km`);
        },
        () => {
          console.warn("Não foi possível obter a localização do usuário para calcular a distância.");
          setDistance("Distância indisponível");
        }
      );
    };

    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        const commerceData = await fetchCommerceDetails();
        if (commerceData) {
          // Executar todas as queries em paralelo, mas tratar erros individualmente
          await Promise.allSettled([
            fetchPromotions(),
            fetchProducts(),
            fetchComments(),
            fetchLikes(),
          ]);
          calculateAndSetDistance(commerceData);
        }
      } catch (e: any) {
        console.error('Erro ao carregar dados do comércio:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [commerceId, user]);

  const handleLike = async () => {
    if (!user || !commerceId) {
      alert("Você precisa estar logado para curtir.");
      return;
    }

    // Otimista: atualiza a UI primeiro
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

    if (isLiked) {
      // Remove a curtida
      const { error } = await supabase
        .from('curtidas_comercio')
        .delete()
        .eq('user_id', user.id)
        .eq('commerce_id', commerceId);

      if (error) {
        console.error("Erro ao descurtir:", error);
        // Reverte a UI em caso de erro
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } else {
      // Adiciona a curtida
      const { error } = await supabase
        .from('curtidas_comercio')
        .insert({ user_id: user.id, commerce_id: commerceId });

      if (error) {
        console.error("Erro ao curtir:", error);
        // Reverte a UI em caso de erro
        setIsLiked(false);
        setLikeCount(prev => prev - 1);
      }
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commerceId || !newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const { data, error } = await supabase
        .from('comentarios_comercio')
        .insert({
          user_id: user.id,
          commerce_id: commerceId,
          texto: newComment.trim()
        })
        .select(`
          id,
          texto,
          created_at,
          user_id
        `)
        .single();
      
      if (error) throw error;

      if(data) {
        // Adicionar nome do usuário ao comentário
        const commentWithUser = {
          ...data,
          user_name: user.nome || 'Usuário'
        };
        setComments(prev => [commentWithUser as any, ...prev]);
      }
      setNewComment("");

    } catch (error: any) {
      console.error("Erro ao publicar comentário:", error);
      alert("Não foi possível publicar seu comentário. Tente novamente.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: commerce?.nome_razao_social || 'Comércio ElevenJob',
      text: `Confira ${commerce?.nome_razao_social} no ElevenJob!`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback para desktop: copiar link
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copiado para a área de transferência!');
      } catch (error) {
        console.log('Erro ao copiar link:', error);
        // Fallback adicional
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Link copiado para a área de transferência!');
      }
    }
  };

  if (loading) {
    return <div className="bg-[#0b0b0b] text-white min-h-screen flex items-center justify-center">Carregando detalhes do comércio...</div>;
  }

  if (error) {
    return <div className="bg-[#0b0b0b] text-white min-h-screen flex items-center justify-center">Erro: {error}</div>;
  }

  if (!commerce) {
    return <div className="bg-[#0b0b0b] text-white min-h-screen flex items-center justify-center">Comércio não encontrado.</div>;
  }

  return (
    <div className="bg-[#0b0b0b] text-white min-h-screen font-sans">
      {/* Header Moderno */}
      <header className="sticky top-0 z-20 bg-gradient-to-b from-[#121212] to-[#0b0b0b] p-4 flex items-center gap-4 shadow-lg">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 text-white hover:bg-gray-800 rounded-full transition-colors duration-200"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold truncate">{commerce.nome_razao_social}</h1>
      </header>

      <main className="pb-20">
        {/* Cabeçalho Principal - Estilo Apps Modernos */}
        <section className="bg-gradient-to-b from-[#1a1a1a] to-[#0b0b0b] p-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-2 leading-tight">
              {commerce.nome_razao_social}
            </h2>
            <div className="space-y-1 text-gray-300">
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={16} className="text-[#00d8ff] flex-shrink-0" />
                <span>{commerce.endereco}</span>
              </div>
              <div className="text-sm text-gray-400 ml-6">
                {commerce.bairro}, {commerce.cidade}
              </div>
              {distance && (
                <div className="flex items-center gap-2 text-sm text-[#00d8ff] ml-6">
                  <span>📍 {distance} de você</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Seção de Ações - Só exibir se houver conteúdo */}
        {(promotions.length > 0 || likeCount > 0 || comments.length > 0) && (
          <section className="bg-[#1a1a1a] border-b border-gray-800">
            <div className="max-w-4xl mx-auto p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 text-white px-4 py-2 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                      isLiked ? 'bg-pink-600 shadow-lg' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <Heart size={18} className={isLiked ? 'fill-current' : ''} />
                    <span className="text-sm font-medium">{likeCount}</span>
                  </button>
                  <button className="flex items-center gap-2 text-white px-4 py-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors">
                    <MessageCircle size={18} />
                    <span className="text-sm font-medium">{comments.length}</span>
                  </button>
                  <button 
                    onClick={handleShare} 
                    className="flex items-center gap-2 text-white px-4 py-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="max-w-4xl mx-auto p-4 space-y-6">
          {/* Promoções Ativas - Cards Modernos */}
          {promotions.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Tag size={20} className="text-[#00d8ff]" />
                Promoções Ativas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {promotions.map(promo => (
                  <div key={promo.id} className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 hover:border-[#00d8ff] transition-colors duration-200">
                    <h3 className="font-bold text-white mb-2">{promo.titulo}</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">{promo.mensagem}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Produtos e Serviços - Cards Modernos */}
          {products.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <ShoppingBag size={20} className="text-[#00d8ff]" />
                Produtos e Serviços
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map(product => (
                  <div key={product.id} className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 hover:border-[#00d8ff] transition-all duration-200 hover:shadow-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-white text-lg">{product.nome_produto}</h3>
                      <span className="text-xl font-bold text-[#00d8ff]">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.preco || 0)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">{product.descricao_produto}</p>
                    <div className="mt-3">
                      <span className="inline-block bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-full">
                        {product.categoria_produto}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Localização - Mini Mapa */}
          {commerce.latitude && commerce.longitude && (
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-[#00d8ff]" />
                Localização
              </h2>
              <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                {/* Mini Mapa Placeholder */}
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
                  <div className="text-center">
                    <MapPin size={48} className="text-[#00d8ff] mx-auto mb-3" />
                    <p className="text-gray-300 font-medium">Localização do comércio</p>
                    <p className="text-gray-500 text-sm mt-1">{commerce.endereco}</p>
                  </div>
                  {/* Pin da localização */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-6 h-6 bg-red-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
                  </div>
                </div>
                <div className="p-4">
                  <button
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${commerce.latitude},${commerce.longitude}`, '_blank')}
                    className="w-full bg-[#00d8ff] hover:bg-[#00b4d8] text-black font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 transform hover:scale-105"
                  >
                    <Navigation size={20} />
                    <span>Abrir no Google Maps</span>
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Seção de Comentários - Design Moderno */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <MessageCircle size={20} className="text-[#00d8ff]" />
              O que achou deste lugar? ({comments.length})
            </h2>
            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
              {/* Formulário de Comentário */}
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Digite seu comentário..."
                    className="flex-grow bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d8ff] border border-gray-700"
                    disabled={isSubmittingComment}
                  />
                  <button 
                    type="submit" 
                    className="bg-[#00d8ff] text-black font-bold px-6 py-3 rounded-lg hover:bg-[#00b4d8] transition-colors duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none" 
                    disabled={isSubmittingComment || !newComment.trim()}
                  >
                    {isSubmittingComment ? "Enviando..." : "Enviar"}
                  </button>
                </div>
              </form>

              {/* Lista de Comentários */}
              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment.id} className="flex gap-4 p-4 bg-gray-800 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00d8ff] to-[#00b4d8] flex-shrink-0 flex items-center justify-center">
                      <span className="text-black font-bold text-sm">
                        {comment.user_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">{comment.user_name}</span>
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-gray-300 leading-relaxed">{comment.texto}</p>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <div className="text-center py-8">
                    <MessageCircle size={48} className="text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Seja o primeiro a comentar!</p>
                    <p className="text-gray-600 text-sm mt-1">Sua opinião é muito importante para outros usuários</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Botão WhatsApp Flutuante - Estilo Apps Modernos */}
      <button
        onClick={() => window.open(`https://wa.me/${commerce.telefone}`, '_blank')}
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-full shadow-lg flex items-center gap-2 transition-all duration-200 transform hover:scale-110 z-50"
      >
        <Phone size={20} />
        <span className="hidden sm:inline">WhatsApp</span>
      </button>
    </div>
  );
};

export default CommerceDetailsScreen; 