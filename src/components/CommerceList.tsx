import { useState } from 'react';
import { Search, Filter, MapPin, Star, Phone } from 'lucide-react';

interface Commerce {
  id: string;
  name: string;
  category: string;
  rating: number;
  distance: string;
  phone?: string;
  plan: 'free' | 'paid';
  hasPromotion: boolean;
  image: string;
}

interface CommerceListProps {
  onCommerceClick: (commerce: Commerce) => void;
}

const categories = [
  'Todos',
  'Padarias',
  'Mercados',
  'Farmácias',
  'Eletrônicos',
  'Roupas',
  'Restaurantes',
  'Serviços'
];

const mockCommerces: Commerce[] = [
  {
    id: '1',
    name: 'Padaria do Bairro',
    category: 'Padarias',
    rating: 4.8,
    distance: '0.2 km',
    phone: '(11) 99999-9999',
    plan: 'paid',
    hasPromotion: true,
    image: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg'
  },
  {
    id: '2',
    name: 'TechStore Centro',
    category: 'Eletrônicos',
    rating: 4.5,
    distance: '0.4 km',
    phone: '(11) 88888-8888',
    plan: 'paid',
    hasPromotion: true,
    image: 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg'
  },
  {
    id: '3',
    name: 'Mercadinho São José',
    category: 'Mercados',
    rating: 4.2,
    distance: '0.3 km',
    plan: 'free',
    hasPromotion: false,
    image: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg'
  },
  {
    id: '4',
    name: 'Farmácia Popular',
    category: 'Farmácias',
    rating: 4.6,
    distance: '0.6 km',
    phone: '(11) 77777-7777',
    plan: 'paid',
    hasPromotion: false,
    image: 'https://images.pexels.com/photos/356040/pexels-photo-356040.jpeg'
  },
  {
    id: '5',
    name: 'Boutique Elegance',
    category: 'Roupas',
    rating: 4.7,
    distance: '0.5 km',
    plan: 'paid',
    hasPromotion: true,
    image: 'https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg'
  },
  {
    id: '6',
    name: 'Restaurante Sabor',
    category: 'Restaurantes',
    rating: 4.4,
    distance: '0.7 km',
    phone: '(11) 66666-6666',
    plan: 'free',
    hasPromotion: false,
    image: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg'
  }
];

export default function CommerceList({ onCommerceClick }: CommerceListProps) {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredCommerces = mockCommerces.filter(commerce => {
    const matchesCategory = selectedCategory === 'Todos' || commerce.category === selectedCategory;
    const matchesSearch = commerce.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryCount = (category: string) => {
    if (category === 'Todos') return mockCommerces.length;
    return mockCommerces.filter(c => c.category === category).length;
  };

  return (
    <div className="space-y-6">
      {/* Header com busca */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar comércios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#2a2a2a] text-white placeholder-gray-400 rounded-xl border border-[#333] focus:border-[#00d8ff] focus:outline-none"
          />
        </div>

        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">
            {filteredCommerces.length} comércios encontrados
          </h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-[#212121] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>
      </div>

      {/* Filtros de categoria */}
      {showFilters && (
        <div className="bg-[#212121] rounded-xl p-4">
          <h4 className="font-medium text-white mb-3">Categorias</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#00d8ff] text-[#0b0b0b]'
                    : 'bg-[#2a2a2a] text-white hover:bg-[#333]'
                }`}
              >
                {category} ({getCategoryCount(category)})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lista de comércios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCommerces.map((commerce) => (
          <button
            key={commerce.id}
            onClick={() => onCommerceClick(commerce)}
            className="bg-[#212121] rounded-xl p-4 hover:bg-[#2a2a2a] transition-colors text-left w-full"
          >
            <div className="flex gap-4">
              <img
                src={commerce.image}
                alt={commerce.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
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
                
                <div className="flex items-center gap-4 text-sm text-gray-300 mb-2">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400" />
                    {commerce.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {commerce.distance}
                  </span>
                  {commerce.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      Telefone
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 rounded text-xs ${
                    commerce.plan === 'paid' 
                      ? 'bg-[#00d8ff] text-[#0b0b0b]' 
                      : 'bg-gray-600 text-white'
                  }`}>
                    {commerce.plan === 'paid' ? 'Premium' : 'Básico'}
                  </span>
                  
                  <span className="text-[#00d8ff] text-sm font-medium">
                    Ver detalhes →
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredCommerces.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">Nenhum comércio encontrado</p>
          <p className="text-gray-500 text-sm mt-2">
            Tente ajustar os filtros ou termo de busca
          </p>
        </div>
      )}
    </div>
  );
}