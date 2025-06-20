import { useState } from 'react';
import { MapPin, Navigation, X, Star, Phone, Globe } from 'lucide-react';

interface CommercePin {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  hasPromotion: boolean;
  distance: string;
  rating: number;
  phone?: string;
  website?: string;
  plan: 'free' | 'paid';
}

interface CommerceMapProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: { lat: number; lng: number };
}

const mockCommerces: CommercePin[] = [
  {
    id: '1',
    name: 'Padaria do Bairro',
    category: 'Padaria',
    lat: -23.5505,
    lng: -46.6333,
    hasPromotion: true,
    distance: '0.2 km',
    rating: 4.8,
    phone: '(11) 99999-9999',
    plan: 'paid'
  },
  {
    id: '2',
    name: 'TechStore Centro',
    category: 'Eletrônicos',
    lat: -23.5515,
    lng: -46.6343,
    hasPromotion: true,
    distance: '0.4 km',
    rating: 4.5,
    phone: '(11) 88888-8888',
    website: 'techstore.com.br',
    plan: 'paid'
  },
  {
    id: '3',
    name: 'Mercadinho São José',
    category: 'Mercado',
    lat: -23.5495,
    lng: -46.6323,
    hasPromotion: false,
    distance: '0.3 km',
    rating: 4.2,
    plan: 'free'
  },
  {
    id: '4',
    name: 'Farmácia Popular',
    category: 'Farmácia',
    lat: -23.5525,
    lng: -46.6353,
    hasPromotion: false,
    distance: '0.6 km',
    rating: 4.6,
    phone: '(11) 77777-7777',
    plan: 'paid'
  }
];

export default function CommerceMap({ isOpen, onClose, userLocation }: CommerceMapProps) {
  const [selectedCommerce, setSelectedCommerce] = useState<CommercePin | null>(null);

  if (!isOpen) return null;

  const handlePinClick = (commerce: CommercePin) => {
    setSelectedCommerce(commerce);
  };

  const handleGetDirections = (commerce: CommercePin) => {
    // Simular abertura de rota
    alert(`Abrindo rota para ${commerce.name}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-4xl h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#2a2a2a]">
          <h2 className="text-xl font-semibold text-white">Mapa do Bairro</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex h-full">
          {/* Área do Mapa (Mock) */}
          <div className="flex-1 relative bg-[#2a2a2a] p-8">
            <div className="w-full h-full bg-[#333] rounded-xl relative overflow-hidden">
              {/* Simulação de mapa */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-blue-900/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-[#00d8ff]" />
                    <p className="text-lg font-medium mb-2">Mapa Interativo</p>
                    <p className="text-sm text-gray-300">Visualização em desenvolvimento</p>
                  </div>
                </div>

                {/* Pins dos comércios */}
                {mockCommerces.map((commerce, index) => (
                  <button
                    key={commerce.id}
                    onClick={() => handlePinClick(commerce)}
                    className={`absolute w-8 h-8 rounded-full border-2 border-white shadow-lg transition-all duration-200 hover:scale-110 ${
                      commerce.hasPromotion 
                        ? 'bg-[#00d8ff] animate-pulse' 
                        : 'bg-red-500'
                    }`}
                    style={{
                      left: `${20 + index * 15}%`,
                      top: `${30 + index * 10}%`
                    }}
                  >
                    <MapPin className="w-4 h-4 text-white mx-auto" />
                  </button>
                ))}

                {/* Pin do usuário */}
                <div
                  className="absolute w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg"
                  style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                >
                  <div className="w-2 h-2 bg-white rounded-full mx-auto mt-1"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Painel Lateral */}
          <div className="w-80 bg-[#212121] p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Comércios Próximos</h3>
            
            <div className="space-y-3">
              {mockCommerces.map((commerce) => (
                <button
                  key={commerce.id}
                  onClick={() => handlePinClick(commerce)}
                  className={`w-full text-left p-4 rounded-lg transition-colors ${
                    selectedCommerce?.id === commerce.id
                      ? 'bg-[#00d8ff]/20 border border-[#00d8ff]'
                      : 'bg-[#2a2a2a] hover:bg-[#333]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-white">{commerce.name}</h4>
                      <p className="text-sm text-gray-400">{commerce.category}</p>
                    </div>
                    {commerce.hasPromotion && (
                      <span className="px-2 py-1 bg-[#00d8ff] text-[#0b0b0b] text-xs rounded-full font-medium">
                        Promoção
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400" />
                      {commerce.rating}
                    </span>
                    <span>{commerce.distance}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      commerce.plan === 'paid' 
                        ? 'bg-[#00d8ff] text-[#0b0b0b]' 
                        : 'bg-gray-600 text-white'
                    }`}>
                      {commerce.plan === 'paid' ? 'Premium' : 'Básico'}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Detalhes do comércio selecionado */}
            {selectedCommerce && (
              <div className="mt-6 p-4 bg-[#2a2a2a] rounded-lg">
                <h4 className="font-semibold text-white mb-3">{selectedCommerce.name}</h4>
                
                <div className="space-y-3">
                  {selectedCommerce.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Phone className="w-4 h-4" />
                      {selectedCommerce.phone}
                    </div>
                  )}
                  
                  {selectedCommerce.website && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Globe className="w-4 h-4" />
                      {selectedCommerce.website}
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleGetDirections(selectedCommerce)}
                    className="w-full py-2 px-4 bg-[#00d8ff] text-[#0b0b0b] rounded-lg font-medium hover:bg-[#00d8ff]/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Navigation className="w-4 h-4" />
                    Traçar rota
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}