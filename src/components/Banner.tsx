import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BannerItem {
  id: number;
  title: string;
  description: string;
  image: string;
}

const bannerItems: BannerItem[] = [
  {
    id: 1,
    title: "Promoção Especial",
    description: "Desconto de 30% em todos os produtos",
    image: "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg"
  },
  {
    id: 2,
    title: "Oferta Limitada",
    description: "Compre 2 e leve 3 - Válido até domingo",
    image: "https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg"
  },
  {
    id: 3,
    title: "Novo Produto",
    description: "Conheça nossa nova linha de produtos",
    image: "https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg"
  }
];

export default function Banner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerItems.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + bannerItems.length) % bannerItems.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % bannerItems.length);
  };

  return (
    <div className="relative w-full h-48 rounded-xl overflow-hidden bg-[#212121]">
      {/* Banner Image */}
      <div className="relative w-full h-full">
        <img
          src={bannerItems[currentIndex].image}
          alt={bannerItems[currentIndex].title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        
        {/* Content */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="text-lg font-semibold mb-1">
            {bannerItems[currentIndex].title}
          </h3>
          <p className="text-sm text-gray-200">
            {bannerItems[currentIndex].description}
          </p>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
      >
        <ChevronLeft className="w-4 h-4 text-white" />
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
      >
        <ChevronRight className="w-4 h-4 text-white" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
        {bannerItems.map((_, index) => (
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
  );
}