import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Heart, MessageCircle, Play, Pause } from 'lucide-react';

interface Promotion {
  id: string;
  title: string;
  description: string;
  image: string;
  store: string;
  discount: string;
  validUntil: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

interface PromotionBannerProps {
  promotions?: Promotion[];
  onPromotionClick: (promotion: Promotion) => void;
  onViewNeighborhood: () => void;
  onAdvancedSearch: () => void;
}

const mockPromotions: Promotion[] = [
  {
    id: '1',
    title: 'Super Desconto em Eletrônicos',
    description: 'Até 50% OFF em smartphones, tablets e notebooks',
    image: 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg',
    store: 'TechStore Centro',
    discount: '50%',
    validUntil: '2025-01-20',
    likes: 127,
    comments: 23,
    isLiked: false
  },
  {
    id: '2',
    title: 'Pães Artesanais Fresquinhos',
    description: 'Compre 3 pães e leve 4 - Válido até domingo',
    image: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg',
    store: 'Padaria do Bairro',
    discount: '25%',
    validUntil: '2025-01-15',
    likes: 89,
    comments: 12,
    isLiked: true
  },
  {
    id: '3',
    title: 'Frutas e Verduras Orgânicas',
    description: 'Produtos frescos direto do produtor com preços especiais',
    image: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg',
    store: 'Hortifruti Orgânico',
    discount: '30%',
    validUntil: '2025-01-18',
    likes: 156,
    comments: 34,
    isLiked: false
  }
];

export default function PromotionBanner({ promotions: propPromotions, onPromotionClick, onViewNeighborhood, onAdvancedSearch }: PromotionBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [promotions, setPromotions] = useState<Promotion[]>(propPromotions && propPromotions.length > 0 ? propPromotions : mockPromotions);

  useEffect(() => {
    if (propPromotions && propPromotions.length > 0) {
      setPromotions(propPromotions);
      setCurrentIndex(0);
    } else {
      setPromotions(mockPromotions);
      setCurrentIndex(0);
    }
  }, [propPromotions]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promotions.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying, promotions.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % promotions.length);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleLike = (promotionId: string) => {
    setPromotions(prev => prev.map(promo => 
      promo.id === promotionId 
        ? { 
            ...promo, 
            isLiked: !promo.isLiked,
            likes: promo.isLiked ? promo.likes - 1 : promo.likes + 1
          }
        : promo
    ));
  };

  const currentPromotion = promotions[currentIndex];

  return (
    <div className="space-y-4">
      {/* Banner Principal */}
      <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-[#212121] shadow-lg">
        <div className="relative w-full h-full">
          <img
            src={currentPromotion.image}
            alt={currentPromotion.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Badge de Desconto */}
          <div className="absolute top-4 right-4 bg-[#00d8ff] text-[#0b0b0b] px-3 py-1 rounded-full font-bold text-sm">
            -{currentPromotion.discount} OFF
          </div>

          {/* Controle Play/Pause */}
          <button
            onClick={togglePlayPause}
            className="absolute top-4 left-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white" />
            )}
          </button>
          
          {/* Conteúdo */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="mb-2">
              <span className="text-[#00d8ff] text-sm font-medium">{currentPromotion.store}</span>
            </div>
            <h3 className="text-xl font-bold mb-2">
              {currentPromotion.title}
            </h3>
            <p className="text-sm text-gray-200 mb-3">
              {currentPromotion.description}
            </p>
            <p className="text-xs text-gray-300">
              Válido até {new Date(currentPromotion.validUntil).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Navegação */}
        <button
          onClick={goToPrevious}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        
        <button
          onClick={goToNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        {/* Indicadores */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
          {promotions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-[#00d8ff]' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Botões de Interação */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleLike(currentPromotion.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentPromotion.isLiked 
                ? 'bg-red-500/20 text-red-400' 
                : 'bg-[#212121] text-white hover:bg-[#2a2a2a]'
            }`}
          >
            <Heart className={`w-4 h-4 ${currentPromotion.isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm">{currentPromotion.likes}</span>
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-[#212121] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">{currentPromotion.comments}</span>
          </button>
        </div>

        <button
          onClick={() => onPromotionClick(currentPromotion)}
          className="px-6 py-2 bg-[#00d8ff] text-[#0b0b0b] rounded-lg font-medium hover:bg-[#00d8ff]/90 transition-colors"
        >
          Ver Detalhes
        </button>
      </div>

      {/* Opções Adicionais */}
      <div className="flex gap-3">
        <button
          onClick={onViewNeighborhood}
          className="flex-1 py-3 px-4 bg-[#212121] text-white rounded-xl hover:bg-[#2a2a2a] transition-colors text-center"
        >
          Ver promoções do bairro vizinho
        </button>
        <button
          onClick={onAdvancedSearch}
          className="flex-1 py-3 px-4 bg-[#212121] border border-[#00d8ff] text-[#00d8ff] rounded-xl hover:bg-[#00d8ff]/10 transition-colors text-center"
        >
          Busca avançada
        </button>
      </div>
    </div>
  );
}