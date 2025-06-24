// IMPORTS GERAIS
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Star,
} from "lucide-react";
import { useUserContext } from "../context/UserContext";

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

  useEffect(() => {
    fetchCommerce();
    fetchProducts();
    fetchComments();
    checkUserLikeCommerce();
    checkUserFollowingCommerce();
    fetchTotalFollowers();
    fetchUserRating();
    fetchAverageRating();
  }, [commerceId, user?.id]);

  async function fetchCommerce() {
    const { data } = await supabase
      .from("comercios")
      .select("id, nome_razao_social, endereco")
      .eq("id", commerceId)
      .single();
    if (data) setCommerce(data);
  }

  async function fetchProducts() {
    const { data: productsData } = await supabase
      .from("produtos_comercios")
      .select("id, nome, descricao, preco, imagem_url, curtidas")
      .eq("commerce_id", commerceId);

    if (productsData && user) {
      const likesResponse = await supabase
        .from("curtidas_produtos")
        .select("produto_id")
        .eq("user_id", user.id);

      const likedProductIds = likesResponse.data?.map((like) => like.produto_id) || [];

      const formattedProducts = productsData.map((product) => ({
        ...product,
        userLiked: likedProductIds.includes(product.id),
      }));

      setProducts(formattedProducts);
    }
  }

  async function fetchComments() {
    const { data } = await supabase
      .from("comentarios_comercio")
      .select("*")
      .eq("comercio_id", commerceId)
      .order("data_comentario", { ascending: false });

    if (data) setComments(data);
  }

  async function fetchUserRating() {
    if (!user?.id || !commerceId) return;
    const { data } = await supabase
      .from("avaliacoes_comercios")
      .select("nota")
      .eq("user_id", user.id)
      .eq("commerce_id", commerceId)
      .single();
    if (data) setUserRating(data.nota);
  }

  async function fetchAverageRating() {
    const { data } = await supabase
      .from("avaliacoes_comercios")
      .select("nota")
      .eq("commerce_id", commerceId);
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
    const { data } = await supabase
      .from("curtidas_comercio")
      .select("*")
      .eq("user_id", user.id)
      .eq("comercio_id", commerceId)
      .single();

    setUserLikedCommerce(!!data);
  }

  async function checkUserFollowingCommerce() {
    const { data } = await supabase
      .from("seguidores_comercio")
      .select("*")
      .eq("user_id", user.id)
      .eq("comercio_id", commerceId)
      .single();

    setUserFollowingCommerce(!!data);
  }

  async function fetchTotalFollowers() {
    const { count } = await supabase
      .from("seguidores_comercio")
      .select("*", { count: "exact", head: true })
      .eq("comercio_id", commerceId);

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

  if (!commerce) return <div className="text-white p-4">Carregando...</div>;

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white flex flex-col">
      {/* Cabeçalho */}
      <div className="relative flex items-center justify-center p-4 border-b border-[#212121] bg-[#0b0b0b]">
        <button onClick={() => navigate(-1)} className="absolute left-4">
          <ArrowLeft size={24} color="white" />
        </button>
        <h1 className="text-lg font-semibold">{commerce.nome_razao_social}</h1>
      </div>

      {/* Lista de Produtos */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {products.map((product) => (
          <div key={product.id} className="bg-[#212121] rounded-xl overflow-hidden shadow-md">
            <div className="relative">
              <img
                src={product.imagem_url}
                alt={product.nome}
                className="w-full h-36 object-cover"
              />
              <button
                onClick={() => {}}
                className={`absolute top-2 right-2 bg-white bg-opacity-80 p-1 rounded-full ${
                  product.userLiked ? "text-red-600" : ""
                }`}
              >
                <Heart size={18} color={product.userLiked ? "red" : "gray"} />
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
          </div>
        ))}
      </div>

      {/* Rodapé */}
      <div className="bg-black text-white flex justify-between items-center p-2 fixed bottom-0 w-full z-50">
        {/* Endereço */}
        <div className="flex-1 ml-2 px-6">
          <p className="text-sm font-semibold">Como chegar:</p>
          <div className="flex items-center mt-1">
            <MapPin size={16} color="#00BFFF" className="mr-1" />
            <p className="text-xs text-[#bfbfbf]">{commerce.endereco}</p>
          </div>
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
    </div>
  );
}
