// IMPORTS GERAIS
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { ArrowLeft, Heart, MessageCircle, Share2, MapPin, ShoppingCart, Star } from "lucide-react";
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

  useEffect(() => {
    fetchCommerce();
    fetchProducts();
  }, []);

  async function fetchCommerce() {
    const { data } = await supabase
      .from("comercios")
      .select("id, nome_razao_social, endereco")
      .eq("id", commerceId)
      .single();

    if (data) {
      setCommerce({
        id: data.id,
        nome_razao_social: data.nome_razao_social,
        endereco: data.endereco,
      });
    }
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
        id: product.id,
        nome: product.nome,
        descricao: product.descricao,
        preco: product.preco,
        imagem_url: product.imagem_url,
        curtidas: product.curtidas,
        userLiked: likedProductIds.includes(product.id),
      }));

      setProducts(formattedProducts);
    }
  }

  async function handleLike(productId: string) {
    if (!user) {
      alert("Você precisa estar logado para curtir.");
      return;
    }

    const alreadyLiked = products.find((p) => p.id === productId)?.userLiked;
    if (alreadyLiked) return;

    const { error } = await supabase.from("curtidas_produtos").insert({
      produto_id: productId,
      user_id: user.id,
    });

    if (!error) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, curtidas: p.curtidas + 1, userLiked: true } : p
        )
      );

      await supabase
        .from("produtos_comercios")
        .update({ curtidas: products.find((p) => p.id === productId)!.curtidas + 1 })
        .eq("id", productId);
    }
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

        <div className="absolute right-4 flex items-center space-x-2">
          <button className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">
            Fale Conosco
          </button>
          <ShoppingCart size={24} color="#00BFFF" />
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {products.length > 0 ? (
          products.map((product) => (
            <div
              key={product.id}
              className="bg-[#212121] rounded-xl overflow-hidden shadow-md"
            >
              <div className="relative">
                <img
                  src={product.imagem_url}
                  alt={product.nome}
                  className="w-full h-36 object-cover"
                />
                <button
                  onClick={() => handleLike(product.id)}
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
                <p className="text-xs text-[#bfbfbf] mt-1">
                  {product.curtidas} curtidas
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-[#bfbfbf]">Nenhum produto disponível.</p>
        )}
      </div>

      {/* Rodapé */}
      <div className="bg-black text-white flex justify-between items-start p-4 space-x-4">
        {/* Endereço */}
        <div className="flex-1">
          <p className="text-sm font-semibold">Como chegar:</p>
          <div className="flex items-center mt-1">
            <MapPin size={16} color="#00BFFF" className="mr-1" />
            <p className="text-xs text-[#bfbfbf]">{commerce.endereco}</p>
          </div>
        </div>

        {/* Curtir, Seguir, Compartilhar */}
        <div className="flex flex-col items-center justify-center">
          <div className="flex space-x-4 mb-1">
            <Heart size={20} />
            <MessageCircle size={20} />
            <Share2 size={20} />
          </div>
          <p className="text-xs text-[#bfbfbf]">Seguir / Curtir / Compartilhar</p>
        </div>

        {/* Avaliações */}
        <div className="flex flex-col items-center justify-center mr-2">
          <p className="text-sm font-semibold mb-1">Avaliar</p>
          <div className="flex space-x-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} size={16} color="#FFD700" fill="#FFD700" />
            ))}
          </div>
          <p className="text-xs text-[#bfbfbf] mt-1">Em breve: Avaliações reais</p>
        </div>
      </div>
    </div>
  );
}
