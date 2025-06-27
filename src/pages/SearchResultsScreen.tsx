// IMPORTS GERAIS
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { MapPin, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserContext } from "../context/UserContext";
import { getNeighborBairros, getNeighborhoodFromLatLng } from "../utils/geolocation";
import { calculateDistance } from "../utils/calculateDistance";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const IMG_PLACEHOLDER = "https://via.placeholder.com/300x200.png?text=Sem+imagem";
const MAP_CENTER: [number, number] = [-29.7156, -52.4297];

interface ResultItem {
  id: string;
  tipo: 'promocao' | 'servico' | 'produto' | 'comercio';
  nome_item: string;
  texto_unificado: string;
  image?: string;
  lat?: number;
  lng?: number;
  address?: string;
  distance?: number;
  bairro?: string;
}

// Fix para ícones do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function SearchResultsScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const termo = searchParams.get("termo") || "";
  const raioParam = searchParams.get("raio");
  const raioSelecionado = raioParam ? parseInt(raioParam) : 0;
  const { user, setUser } = useUserContext();
  const bairro = user?.bairro || "";
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [showOtherNeighborhoods, setShowOtherNeighborhoods] = useState(false);
  const [filterByNeighbors, setFilterByNeighbors] = useState(false);
  const [userLatitude, setUserLatitude] = useState<number | null>(null);
  const [userLongitude, setUserLongitude] = useState<number | null>(null);
  const [emptyMessage, setEmptyMessage] = useState("");

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
    setEmptyMessage("");
    const performSearch = async () => {
      try {
        let bairrosParaBuscar: string[] = [bairro.trim().toLowerCase()];
        if (raioSelecionado > 0 && userLatitude && userLongitude) {
          const { data: bairrosData, error: bairrosError } = await supabase
            .from('bairros')
            .select('*');
          if (!bairrosError && bairrosData) {
            const bairrosDentroDoRaio = bairrosData.filter((bairroItem) => {
              const distance = calculateDistance(
                userLatitude,
                userLongitude,
                bairroItem.latitude,
                bairroItem.longitude
              );
              return distance <= raioSelecionado;
            }).map(bairroItem => bairroItem.nome.trim().toLowerCase());
            bairrosParaBuscar = bairrosDentroDoRaio;
          }
        } else if (showOtherNeighborhoods || filterByNeighbors) {
          const neighborBairros = getNeighborBairros(bairro);
          bairrosParaBuscar = [bairro.trim().toLowerCase(), ...neighborBairros.map(b => b.trim().toLowerCase())];
        }
        console.log('🔍 Bairros para busca:', bairrosParaBuscar, 'Termo:', termo);
        const { data, error } = await supabase
          .from('vw_search_geral')
          .select('*')
          .ilike('texto_unificado', `%${termo}%`)
          .in('bairro', bairrosParaBuscar);
        if (error) {
          setLoading(false);
          setResults([]);
          setEmptyMessage("Erro ao buscar dados.");
          return;
        }
        if (isMounted) {
          setResults(data || []);
          if (!data || data.length === 0) {
            setEmptyMessage(`Nenhum resultado encontrado para "${termo}" nos bairros: ${bairrosParaBuscar.join(', ')}`);
          }
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
        setResults([]);
        setEmptyMessage("Erro inesperado na busca.");
      }
    };
    performSearch();
    return () => {
      isMounted = false;
    };
  }, [termo, bairro, raioSelecionado, userLatitude, userLongitude, showOtherNeighborhoods, filterByNeighbors]);

  // Agrupamento por tipo
  const grouped = {
    promocao: results.filter(r => r.tipo === 'promocao'),
    servico: results.filter(r => r.tipo === 'servico'),
    produto: results.filter(r => r.tipo === 'produto'),
    comercio: results.filter(r => r.tipo === 'comercio'),
  };

  // Função para imagem segura
  const getImage = (imgUrl: string | null | undefined) => {
    if (!imgUrl || imgUrl === "null" || imgUrl.trim() === "") return IMG_PLACEHOLDER;
    return imgUrl;
  };

  // Botões de filtro
  const filterButtons = [
    { label: `Promoções (${grouped.promocao.length})`, type: "promocao" },
    { label: `Serviços (0)`, type: "servico" }, // Serviços sempre 0 pois não há na view
    { label: `Produtos (${grouped.produto.length})`, type: "produto" },
    { label: `Comércios (${grouped.comercio.length})`, type: "comercio" },
  ];

  // Renderização dos cards por tipo
  const renderCards = () => {
    if (grouped.comercio.length === 0) return (
      <div className="flex flex-col gap-3 mt-4">
        <button className="w-full py-4 rounded-lg bg-[#222] text-gray-200 flex items-center justify-center gap-2 font-semibold text-base">
          <span className="material-icons">store</span> Nenhum comércio disponível 😔
        </button>
      </div>
    );
    return (
      <div className="flex flex-col gap-3 mt-4">
        {grouped.comercio.map((comercio) => (
          <div
            key={comercio.id_registro}
            className="bg-[#18181b] rounded-xl p-4 flex flex-col shadow hover:bg-[#232323] transition-colors cursor-pointer"
            onClick={() => navigate(`/commerce/${comercio.id_registro}`)}
          >
            <h4 className="font-bold text-base mb-1 truncate flex items-center gap-2">
              <MapPin size={16} className="text-[#00BFFF]" />
              {comercio.nome_item}
            </h4>
            <p className="text-xs text-gray-300 mb-1 truncate">{comercio.texto_unificado}</p>
            {comercio.bairro && (
              <span className="text-xs text-gray-400">Bairro: {comercio.bairro}</span>
            )}
            {comercio.distance && (
              <span className="text-xs text-[#00BFFF] mt-1">{comercio.distance.toFixed(2)}km de você</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white flex flex-col items-center">
      <div className="w-full max-w-3xl px-2 md:px-0 flex items-center gap-3 py-3 border-b border-[#222] sticky top-0 bg-[#0b0b0b] z-10">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg text-[#00BFFF] hover:bg-[#222]">
          <span className="material-icons">arrow_back</span>
        </button>
        <h1 className="text-lg md:text-xl font-bold truncate">
          Resultados para: <span className="text-[#00BFFF]">{termo}</span>
        </h1>
      </div>
      {/* Mapa sempre visível */}
      <div className="w-full max-w-3xl px-2 md:px-0 mt-3">
        <div className="rounded-xl overflow-hidden mb-4" style={{ height: 220 }}>
          <MapContainer center={MAP_CENTER} zoom={14} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false} dragging={true}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {/* Marcar comércios no mapa se houver */}
            {grouped.comercio.map((comercio) =>
              comercio.lat && comercio.lng ? (
                <Marker key={comercio.id_registro} position={[comercio.lat, comercio.lng]}>
                  <Popup>
                    <strong>{comercio.nome_item}</strong><br />
                    {comercio.bairro}
                  </Popup>
                </Marker>
              ) : null
            )}
          </MapContainer>
        </div>
        {/* Botões de filtro */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {filterButtons.map((btn) => (
            <button
              key={btn.type}
              className={`w-full py-3 rounded-lg font-semibold text-sm transition-all duration-200 cursor-pointer
                ${grouped.comercio.length > 0 && btn.type === "comercio" ? "bg-[#00BFFF] text-white" : "bg-[#222] text-gray-200"}`}
              onClick={() => {
                if (btn.type === "comercio") {
                  setShowOtherNeighborhoods(false);
                  setFilterByNeighbors(false);
                } else if (btn.type === "promocao") {
                  setShowOtherNeighborhoods(false);
                  setFilterByNeighbors(false);
                } else if (btn.type === "produto") {
                  setShowOtherNeighborhoods(false);
                  setFilterByNeighbors(false);
                } else if (btn.type === "servico") {
                  setShowOtherNeighborhoods(false);
                  setFilterByNeighbors(false);
                }
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
        {/* Renderização dos cards */}
        {loading ? (
          <div className="flex items-center justify-center h-32 text-[#00BFFF] w-full">Buscando...</div>
        ) : emptyMessage ? (
          <div className="text-center py-6 mb-4">
            <span className="text-4xl mb-3 block">😔</span>
            <p className="text-gray-300 text-lg font-medium">{emptyMessage}</p>
          </div>
        ) : (
          renderCards()
        )}
      </div>
    </div>
  );
} 