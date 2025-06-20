import { useState } from 'react';
import { X, Star, Phone, Globe, MapPin, Clock, Heart, ShoppingCart, Calendar } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  description: string;
  inStock: boolean;
}

interface CommerceDetailsProps {
  commerce: {
    id: string;
    name: string;
    category: string;
    rating: number;
    distance: string;
    phone?: string;
    website?: string;
    address: string;
    hours: string;
    plan: 'free' | 'paid';
    logo: string;
    socialMedia?: {
      instagram?: string;
      facebook?: string;
      whatsapp?: string;
    };
  };
  isOpen: boolean;
  onClose: () => void;
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Pão Francês',
    price: 'R$ 0,50',
    image: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg',
    description: 'Pão francês fresquinho, assado diariamente',
    inStock: true
  },
  {
    id: '2',
    name: 'Croissant Integral',
    price: 'R$ 4,50',
    image: 'https://images.pexels.com/photos/2067396/pexels-photo-2067396.jpeg',
    description: 'Croissant artesanal com farinha integral',
    inStock: true
  },
  {
    id: '3',
    name: 'Bolo de Chocolate',
    price: 'R$ 25,00',
    image: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg',
    description: 'Bolo caseiro de chocolate com cobertura',
    inStock: false
  },
  {
    id: '4',
    name: 'Café Expresso',
    price: 'R$ 3,00',
    image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg',
    description: 'Café expresso tradicional',
    inStock: true
  }
];

export default function CommerceDetails({ commerce, isOpen, onClose }: CommerceDetailsProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'info'>('products');
  const [favorites, setFavorites] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSchedule = () => {
    alert('Funcionalidade de agendamento em desenvolvimento');
  };

  const handleAddToCart = (product: Product) => {
    alert(`${product.name} adicionado ao carrinho!`);
  };

  const handleSocialMedia = (platform: string, url?: string) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      alert(`Redirecionando para ${platform}`);
    }
  };

  const handleGetDirections = () => {
    alert(`Abrindo rota para ${commerce.name}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-4xl h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-4">
            <img
              src={commerce.logo}
              alt={commerce.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <h2 className="text-xl font-semibold text-white">{commerce.name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>{commerce.rating}</span>
                <span>•</span>
                <span>{commerce.distance}</span>
                <span>•</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  commerce.plan === 'paid' 
                    ? 'bg-[#00d8ff] text-[#0b0b0b]' 
                    : 'bg-gray-600 text-white'
                }`}>
                  {commerce.plan === 'paid' ? 'Premium' : 'Básico'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#2a2a2a]">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-4 px-6 text-center transition-colors ${
              activeTab === 'products'
                ? 'text-[#00d8ff] border-b-2 border-[#00d8ff]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Produtos
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-4 px-6 text-center transition-colors ${
              activeTab === 'info'
                ? 'text-[#00d8ff] border-b-2 border-[#00d8ff]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Informações
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'products' ? (
            <div className="space-y-6">
              {/* Produtos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-[#212121] rounded-xl p-4 hover:bg-[#2a2a2a] transition-colors"
                  >
                    <div className="flex gap-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-white">{product.name}</h4>
                          <button
                            onClick={() => toggleFavorite(product.id)}
                            className={`p-1 rounded transition-colors ${
                              favorites.includes(product.id)
                                ? 'text-red-400'
                                : 'text-gray-400 hover:text-red-400'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${
                              favorites.includes(product.id) ? 'fill-current' : ''
                            }`} />
                          </button>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{product.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-[#00d8ff] font-semibold">{product.price}</span>
                          <div className="flex gap-2">
                            {product.inStock ? (
                              <button
                                onClick={() => handleAddToCart(product)}
                                className="px-3 py-1 bg-[#00d8ff] text-[#0b0b0b] rounded-lg text-sm font-medium hover:bg-[#00d8ff]/90 transition-colors flex items-center gap-1"
                              >
                                <ShoppingCart className="w-3 h-3" />
                                Adicionar
                              </button>
                            ) : (
                              <span className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm">
                                Indisponível
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botão de Agendamento */}
              <div className="text-center">
                <button
                  onClick={handleSchedule}
                  className="px-6 py-3 bg-[#00d8ff] text-[#0b0b0b] rounded-xl font-medium hover:bg-[#00d8ff]/90 transition-colors flex items-center gap-2 mx-auto"
                >
                  <Calendar className="w-5 h-5" />
                  Agendar Visita
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Informações do Comércio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-[#212121] rounded-xl p-4">
                    <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#00d8ff]" />
                      Endereço
                    </h4>
                    <p className="text-gray-300 text-sm mb-3">{commerce.address}</p>
                    <button
                      onClick={handleGetDirections}
                      className="w-full py-2 px-4 bg-[#00d8ff] text-[#0b0b0b] rounded-lg font-medium hover:bg-[#00d8ff]/90 transition-colors"
                    >
                      Traçar rota até o local
                    </button>
                  </div>

                  <div className="bg-[#212121] rounded-xl p-4">
                    <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#00d8ff]" />
                      Horário de Funcionamento
                    </h4>
                    <p className="text-gray-300 text-sm">{commerce.hours}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {commerce.phone && (
                    <div className="bg-[#212121] rounded-xl p-4">
                      <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#00d8ff]" />
                        Contato
                      </h4>
                      <p className="text-gray-300 text-sm">{commerce.phone}</p>
                    </div>
                  )}

                  {commerce.website && (
                    <div className="bg-[#212121] rounded-xl p-4">
                      <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-[#00d8ff]" />
                        Website
                      </h4>
                      <a
                        href={`https://${commerce.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00d8ff] text-sm hover:underline"
                      >
                        {commerce.website}
                      </a>
                    </div>
                  )}

                  {commerce.socialMedia && (
                    <div className="bg-[#212121] rounded-xl p-4">
                      <h4 className="font-medium text-white mb-3">Redes Sociais</h4>
                      <div className="flex gap-3">
                        {commerce.socialMedia.instagram && (
                          <button
                            onClick={() => handleSocialMedia('Instagram', commerce.socialMedia?.instagram)}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                          >
                            Instagram
                          </button>
                        )}
                        {commerce.socialMedia.facebook && (
                          <button
                            onClick={() => handleSocialMedia('Facebook', commerce.socialMedia?.facebook)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            Facebook
                          </button>
                        )}
                        {commerce.socialMedia.whatsapp && (
                          <button
                            onClick={() => handleSocialMedia('WhatsApp', commerce.socialMedia?.whatsapp)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                          >
                            WhatsApp
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}