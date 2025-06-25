// IMPORTS GERAIS
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Star,
  ShoppingBag,
} from "lucide-react";
import { useUserContext } from "../context/UserContext";
import { FaInstagram, FaFacebook, FaTiktok } from 'react-icons/fa6';

interface Product {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem_url: string;
  curtidas: number;
  userLiked: boolean;
}

interface Comment {
  id: string;
  user_id: string;
  comentario: string;
  data_comentario: string;
}

interface Commerce {
  id: string;
  nome_razao_social: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  cep: string;
  whatsapp: string;
  entrega?: boolean;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
}

interface CartItem {
  user_id: string;
  produto_id: string;
  comercio_id: string;
  quantidade: number;
  preco_unitario: number;
  produto?: { nome: string; preco: number };
}

export default function CommerceDetailsScreen() {
  const { commerceId } = useParams<{ commerceId: string }>();
  const navigate = useNavigate();
  const { user } = useUserContext();

  const [commerce, setCommerce] = useState<Commerce | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [userLikedCommerce, setUserLikedCommerce] = useState(false);
  const [userFollowingCommerce, setUserFollowingCommerce] = useState(false);
  const [totalFollowers, setTotalFollowers] = useState(0);
  const [userRating, setUserRating] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [showCartModal, setShowCartModal] = useState(false);
  const cartModalRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const cartIconRef = useRef<HTMLButtonElement>(null);
  const [cart, setCart] = useState<{ [produtoId: string]: { produto: Product, quantidade: number } }>({});

  useEffect(() => {
    if (!commerceId || typeof commerceId !== 'string' || commerceId.trim() === '') return;
    fetchCommerce();
    fetchProducts();
    fetchComments();
    checkUserLikeCommerce();
    checkUserFollowingCommerce();
    fetchTotalFollowers();
    fetchUserRating();
    fetchAverageRating();
    fetchCartItems();
  }, [commerceId, user?.id]);

  async function fetchCommerce() {
    if (!commerceId || typeof commerceId !== 'string' || commerceId.trim() === '') return;
    console.log('fetchCommerce: commerceId =', commerceId);
    const { data, error } = await supabase
      .from("comercios")
      .select("id, nome_razao_social, endereco, numero, bairro, cidade, cep, whatsapp, instagram, facebook, tiktok")
      .eq("id", commerceId)
      .single();
    if (error) console.error('fetchCommerce error:', error);
    if (data) setCommerce(data);
  }

  async function fetchProducts() {
    if (!commerceId || typeof commerceId !== 'string' || commerceId.trim() === '') return;
    console.log('fetchProducts: commerceId =', commerceId);
    const { data: productsData, error } = await supabase
      .from("produtos_comercios")
      .select("id, nome, descricao, preco, imagem_url")
      .eq("commerce_id", commerceId);
    if (error) console.error('fetchProducts error:', error);
    if (productsData && user) {
      const likesResponse = await supabase
        .from("curtidas_produtos")
        .select("produto_id")
        .eq("user_id", user.id);
      const likedProductIds = likesResponse.data?.map((like) => like.produto_id) || [];
      const produtosComCurtidas = await Promise.all(productsData.map(async (product) => {
        const { count } = await supabase
          .from("curtidas_produtos")
          .select("*", { count: "exact", head: true })
          .eq("produto_id", product.id);
        return {
          ...product,
          curtidas: count || 0,
          userLiked: likedProductIds.includes(product.id),
        };
      }));
      setProducts(produtosComCurtidas);
    }
  }

  async function fetchComments() {
    if (!commerceId || typeof commerceId !== 'string' || commerceId.trim() === '') return;
    console.log('fetchComments: commerceId =', commerceId);
    const { data, error } = await supabase
      .from("comentarios_comercio")
      .select("*")
      .eq("comercio_id", commerceId)
      .order("data_comentario", { ascending: false });
    if (error) console.error('fetchComments error:', error);
    if (data) setComments(data);
  }

  async function fetchUserRating() {
    if (!user?.id || !commerceId || typeof commerceId !== 'string' || commerceId.trim() === '') return;
    console.log('fetchUserRating: commerceId =', commerceId);
    const { data, error } = await supabase
      .from("avaliacoes_comercios")
      .select("nota")
      .eq("user_id", user.id)
      .eq("commerce_id", commerceId)
      .single();
    if (error) console.error('fetchUserRating error:', error);
    if (data) setUserRating(data.nota);
  }

  async function fetchAverageRating() {
    if (!commerceId || typeof commerceId !== 'string' || commerceId.trim() === '') return;
    console.log('fetchAverageRating: commerceId =', commerceId);
    const { data, error } = await supabase
      .from("avaliacoes_comercios")
      .select("nota")
      .eq("commerce_id", commerceId);
    if (error) console.error('fetchAverageRating error:', error);
    if (data) {
      const notas = data.map((item) => item.nota);
      const total = notas.length;
      const media = total ? notas.reduce((a, b) => a + b, 0) / total : 0;
      setAverageRating(media);
      setTotalRatings(total);
    }
  }

  async function handleRatingSelect(nota: number) {
    if (!user?.id || !commerceId) return;

    const { data: existing } = await supabase
      .from("avaliacoes_comercios")
      .select("id")
      .eq("user_id", user.id)
      .eq("commerce_id", commerceId)
      .single();

    if (existing) {
      await supabase
        .from("avaliacoes_comercios")
        .update({ nota })
        .eq("id", existing.id);
    } else {
      await supabase.from("avaliacoes_comercios").insert({
        user_id: user.id,
        commerce_id: commerceId,
        nota,
      });
    }

    setUserRating(nota);
    fetchAverageRating();
  }

  async function handleSubmitComment() {
    if (!user || !commentText.trim()) return;

    await supabase.from("comentarios_comercio").insert({
      user_id: user.id,
      comercio_id: commerceId,
      comentario: commentText.trim(),
    });

    setCommentText("");
    fetchComments();
  }

  async function checkUserLikeCommerce() {
    if (!user?.id || !commerceId || typeof commerceId !== 'string' || commerceId.trim() === '') return;
    console.log('checkUserLikeCommerce: commerceId =', commerceId);
    const { data, error } = await supabase
      .from("curtidas_comercio")
      .select("*")
      .eq("user_id", user.id)
      .eq("comercio_id", commerceId)
      .single();
    if (error) console.error('checkUserLikeCommerce error:', error);
    setUserLikedCommerce(!!data);
  }

  async function checkUserFollowingCommerce() {
    if (!user?.id || !commerceId || typeof commerceId !== 'string' || commerceId.trim() === '') return;
    console.log('checkUserFollowingCommerce: commerceId =', commerceId);
    const { data, error } = await supabase
      .from("seguidores_comercio")
      .select("*")
      .eq("user_id", user.id)
      .eq("comercio_id", commerceId)
      .single();
    if (error) console.error('checkUserFollowingCommerce error:', error);
    setUserFollowingCommerce(!!data);
  }

  async function fetchTotalFollowers() {
    if (!commerceId || typeof commerceId !== 'string' || commerceId.trim() === '') return;
    console.log('fetchTotalFollowers: commerceId =', commerceId);
    const { count, error } = await supabase
      .from("seguidores_comercio")
      .select("*", { count: "exact", head: true })
      .eq("comercio_id", commerceId);
    if (error) console.error('fetchTotalFollowers error:', error);
    setTotalFollowers(count || 0);
  }

  async function handleToggleLikeCommerce() {
    if (!user || !commerceId) return;

    if (userLikedCommerce) {
      await supabase
        .from("curtidas_comercio")
        .delete()
        .eq("user_id", user.id)
        .eq("comercio_id", commerceId);
    } else {
      await supabase.from("curtidas_comercio").insert({
        user_id: user.id,
        comercio_id: commerceId,
      });
    }

    checkUserLikeCommerce();
  }

  async function handleToggleFollowCommerce() {
    if (!user || !commerceId) return;

    if (userFollowingCommerce) {
      await supabase
        .from("seguidores_comercio")
        .delete()
        .eq("user_id", user.id)
        .eq("comercio_id", commerceId);
    } else {
      await supabase.from("seguidores_comercio").insert({
        user_id: user.id,
        comercio_id: commerceId,
      });
    }

    checkUserFollowingCommerce();
    fetchTotalFollowers();
  }

  function handleKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") handleSubmitComment();
  }

  const handleToggleLikeProduct = async (productId: string) => {
    if (!user || !user.id) return;

    const { data: existingLike, error: fetchError } = await supabase
      .from("curtidas_produtos")
      .select("*")
      .eq("user_id", user.id)
      .eq("produto_id", productId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Erro ao buscar curtida existente:", fetchError);
      return;
    }

    if (existingLike) {
      const { error: deleteError } = await supabase
        .from("curtidas_produtos")
        .delete()
        .eq("id", existingLike.id);
      if (deleteError) {
        console.error("Erro ao descurtir:", deleteError);
      }
    } else {
      const { error: insertError } = await supabase
        .from("curtidas_produtos")
        .insert({
          user_id: user.id,
          produto_id: productId,
        });
      if (insertError) {
        console.error("Erro ao curtir produto:", insertError);
      }
    }

    fetchProducts();
  };

  async function fetchCartItems() {
    if (!user?.id || !commerceId) return;
    const { data, error } = await supabase
      .from("sacola_compras_temp")
      .select("*, produto:produto_id (nome, preco)")
      .eq("user_id", user.id)
      .eq("comercio_id", commerceId);
    if (error === null) {
      setCartItems((data || []) as CartItem[]);
      setCartCount(((data || []) as CartItem[]).reduce((acc, item) => acc + (item.quantidade || 0), 0));
    } else {
      console.error("Erro ao buscar sacola:", error);
    }
  }

  function handleAddToCart(product: Product) {
    setCart(prev => {
      const prevItem = prev[product.id];
      const quantidade = prevItem ? prevItem.quantidade + 1 : 1;
      return { ...prev, [product.id]: { produto: product, quantidade } };
    });
    // Animação pulse-rotate
    if (cartIconRef.current) {
      cartIconRef.current.classList.add('animate-pulse-rotate');
      setTimeout(() => {
        cartIconRef.current && cartIconRef.current.classList.remove('animate-pulse-rotate');
      }, 400);
    }
  }

  function handleRemoveFromCart(produtoId: string) {
    setCart(prev => {
      const newCart = { ...prev };
      delete newCart[produtoId];
      return newCart;
    });
  }

  function gerarMensagemWhatsApp(cartObj: typeof cart) {
    const itens = Object.values(cartObj);
    let mensagem = 'Olá, gostaria de fazer um pedido:\n';
    itens.forEach(({ produto, quantidade }) => {
      mensagem += `- ${quantidade}x ${produto.nome} (R$ ${produto.preco.toFixed(2).replace('.', ',')})\n`;
    });
    const total = itens.reduce((acc, { produto, quantidade }) => acc + produto.preco * quantidade, 0);
    mensagem += `Total: R$ ${total.toFixed(2).replace('.', ',')}`;
    return mensagem;
  }

  useEffect(() => {
    if (showCartModal) fetchCartItems();
  }, [showCartModal]);

  if (!commerce) return <div className="text-white p-4">Carregando...</div>;

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white flex flex-col">
      {/* Cabeçalho */}
      <div className="relative flex items-center justify-center p-4 border-b border-[#212121] bg-[#0b0b0b]">
        <button onClick={() => navigate(-1)} className="absolute left-4">
          <ArrowLeft size={24} color="white" />
        </button>
        <div className="absolute top-4 right-6 flex items-center gap-2 z-10">
          {/* Ícones de redes sociais */}
          {commerce?.instagram && (
            <a
              href={commerce.instagram}
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram"
            >
              <FaInstagram size={22} color="#E1306C" />
            </a>
          )}
          {commerce?.facebook && (
            <a
              href={commerce.facebook}
              target="_blank"
              rel="noopener noreferrer"
              title="Facebook"
            >
              <FaFacebook size={22} color="#1877F2" />
            </a>
          )}
          {commerce?.tiktok && (
            <a
              href={commerce.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              title="TikTok"
            >
              <FaTiktok size={22} color="#ffffff" />
            </a>
          )}
          {/* Botão WhatsApp e Sacola já existentes, sem alteração */}
          {commerce && (
            <div className="flex flex-row items-center space-x-4 z-10">
              {/* Botão WhatsApp */}
              {(() => {
                // Sanitização do número para formato internacional (apenas dígitos)
                let sanitizedWhatsapp = commerce.whatsapp ? commerce.whatsapp.replace(/\D/g, "") : "";
                let waLink = sanitizedWhatsapp ? `https://wa.me/${sanitizedWhatsapp}` : "#";
                let isAvailable = !!sanitizedWhatsapp;
                return (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center px-3 py-1 rounded-xl transition ${isAvailable ? "hover:bg-[#25D366]/10 cursor-pointer" : "cursor-not-allowed"}`}
                    title={isAvailable ? "Chama aí" : "WhatsApp não disponível"}
                    tabIndex={isAvailable ? 0 : -1}
                    aria-disabled={!isAvailable}
                    style={{ pointerEvents: isAvailable ? "auto" : "none" }}
                  >
                    <MessageCircle size={22} color={isAvailable ? "#25D366" : "#bfbfbf"} className="mr-1" />
                    <span className="hidden sm:inline text-xs font-medium" style={{ color: isAvailable ? "#25D366" : "#bfbfbf" }}>
                      Chama aí
                    </span>
                  </a>
                );
              })()}
              {/* Botão Sacola */}
              <button
                id="cart-icon"
                ref={cartIconRef}
                type="button"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-transparent hover:bg-white/10 transition relative"
                title="Sacola"
                onClick={() => setShowCartModal(true)}
              >
                <ShoppingBag size={22} color="#ffffff" />
                {Object.keys(cart).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#25D366] text-white text-xs rounded-full px-2 py-0.5 font-bold">
                    {Object.values(cart).reduce((acc, item) => acc + item.quantidade, 0)}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
        <h1 className="text-lg font-semibold">{commerce.nome_razao_social}</h1>
      </div>

      {/* Lista de Produtos */}
      <div className="flex-1 overflow-y-auto p-4 pb-32 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">

        {products.map((product) => (
          <div key={product.id} className="bg-[#212121] rounded-xl overflow-hidden shadow-md relative">
            <div className="relative">
              <img
                src={product.imagem_url}
                alt={product.nome}
                className="w-full h-28 object-cover"
              />
              <button
                onClick={() => handleToggleLikeProduct(product.id)}
                className={`absolute top-2 right-2 bg-white bg-opacity-80 p-1 rounded-full ${
                  product.userLiked ? "text-red-600" : ""
                }`}
              >
                <Heart
                  size={18}
                  color={product.userLiked ? "#00BFFF" : "#bfbfbf"}
                  fill={product.userLiked ? "#00BFFF" : "none"}
                />
              </button>
            </div>
            <div className="p-2">
              <h2 className="font-semibold text-white text-sm">{product.nome}</h2>
              <p className="text-[#bfbfbf] text-xs">{product.descricao}</p>
              <p className="text-turquoise text-base font-bold mt-1">
                R$ {product.preco.toFixed(2)}
              </p>
              <p className="text-xs text-[#bfbfbf] mt-1">{product.curtidas} curtidas</p>
            </div>
            <button
              className="absolute bottom-2 right-2 w-7 h-7 flex items-center justify-center bg-[#00D9FF] text-white rounded-full shadow hover:bg-[#0099cc] transition"
              title="Adicionar à sacola"
              onClick={() => handleAddToCart(product)}
              style={{ fontSize: '1.25rem', lineHeight: 1 }}
            >
              +
            </button>
          </div>
        ))}
      </div>

      {/* Rodapé */}
      <div className="bg-black text-white flex justify-between items-center p-2 fixed bottom-0 w-full z-50">
      {/* Endereço + Rota no Mapa - Centralizado */}
<div className="flex flex-col items-center px-6 text-center">
  <a
    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${commerce.endereco}, ${commerce.numero} - ${commerce.bairro} - ${commerce.cidade} - ${commerce.cep}`
    )}`}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center text-xs font-semibold text-turquoise hover:text-[#00BFFF] mb-1"
  >
    <MapPin size={16} color="#00BFFF" className="mr-1" />
    Ver rota no mapa
  </a>

  <p className="text-xs text-[#bfbfbf] whitespace-normal">
    {commerce.endereco}, {commerce.numero} - {commerce.bairro} - {commerce.cidade} - {commerce.cep}
  </p>
</div>






        {/* Botões Centrais */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex space-x-4 items-center">
          <button onClick={handleToggleLikeCommerce}>
            <Heart size={20} color={userLikedCommerce ? "red" : "white"} />
          </button>
          <div
            className="flex items-center space-x-1 cursor-pointer"
            onClick={() => setShowComments(true)}
          >
            <MessageCircle size={20} />
            <span className="text-xs">{comments.length}</span>
          </div>
          <Share2 size={20} />
          <button onClick={handleToggleFollowCommerce} className="ml-2 text-xs font-semibold">
            {userFollowingCommerce ? "Seguindo" : "Seguir"}
          </button>
          <p className="text-xs">{totalFollowers} seguidores</p>
        </div>

        {/* Avaliação */}
        <div className="flex justify-end px-6">
          <div className="flex flex-col items-center justify-center">
            <p className="text-sm font-semibold mb-1">Avaliar</p>
            <div className="flex space-x-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  size={16}
                  color={index < userRating ? "#00D9FF" : "#bfbfbf"}
                  fill={index < userRating ? "#00D9FF" : "#bfbfbf"}
                  onClick={() => handleRatingSelect(index + 1)}
                  className="cursor-pointer"
                />
              ))}
            </div>
            <p className="text-xs text-[#bfbfbf] mt-1">
              {averageRating.toFixed(1)} - {totalRatings} avaliações
            </p>
          </div>
        </div>
      </div>

      {/* Gaveta de Comentários */}
      {showComments && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setShowComments(false)}
        >
          <div
            className="bg-[#121212] w-full max-w-md p-4 rounded-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-white"
              onClick={() => setShowComments(false)}
            >
              X
            </button>

            <h2 className="text-lg font-bold mb-2">Comentários</h2>

            <div className="max-h-64 overflow-y-auto mb-2">
              {comments.map((c) => (
                <p key={c.id} className="text-sm text-white mb-1">
                  {c.comentario}
                </p>
              ))}
            </div>

            <div className="flex mt-2">
              <input
                type="text"
                placeholder="Digite seu comentário..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 p-2 text-black rounded"
              />
              <button
                onClick={handleSubmitComment}
                className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-xs text-white">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${commerce.endereco}, ${commerce.numero} - ${commerce.bairro} - ${commerce.cidade}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:underline block"
        >
          Ver rota no mapa
        </a>
        <p className="mt-1">
          📍 {commerce.endereco}, {commerce.numero} - {commerce.bairro} - {commerce.cidade}
        </p>
      </div>

      {/* Modal da sacola */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={() => setShowCartModal(false)}>
          <div className="bg-[#18181b] rounded-xl p-6 w-full max-w-md relative" onClick={e => e.stopPropagation()} ref={cartModalRef}>
            <button className="absolute top-2 right-2 text-white" onClick={() => setShowCartModal(false)}>X</button>
            <h2 className="text-lg font-bold mb-4">Sacola de Compras</h2>
            {Object.keys(cart).length === 0 ? (
              <p className="text-gray-400">Sua sacola está vazia.</p>
            ) : (
              <>
                <ul className="divide-y divide-gray-700 mb-4">
                  {Object.values(cart).map(({ produto, quantidade }) => (
                    <li key={produto.id} className="flex justify-between items-center py-2">
                      <div>
                        <span className="font-medium text-white">{produto.nome}</span>
                        <span className="block text-xs text-gray-400">Qtd: {quantidade} x R$ {produto.preco.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">R$ {(quantidade * produto.preco).toFixed(2)}</span>
                        <button onClick={() => handleRemoveFromCart(produto.id)} className="text-red-500 hover:text-red-700 ml-2" title="Remover">✕</button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-white">Total:</span>
                  <span className="text-lg font-bold text-[#25D366]">
                    R$ {Object.values(cart).reduce((acc, { produto, quantidade }) => acc + produto.preco * quantidade, 0).toFixed(2)}
                  </span>
                </div>
                {Object.values(cart).length > 0 && (
                  <a
                    href={`https://api.whatsapp.com/send?phone=${commerce.whatsapp.replace(/\D/g, "")}&text=${encodeURIComponent(gerarMensagemWhatsApp(cart))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 block w-full text-center bg-[#00D9FF] hover:bg-[#0099cc] text-white font-semibold py-2 rounded-xl transition duration-200"
                    style={{ marginBottom: '0.5rem' }}
                  >
                    Finalizar compra
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
