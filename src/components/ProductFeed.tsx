import { useState } from 'react';
import { Heart, MessageCircle, Share2, Filter, Search } from 'lucide-react';

interface FeedItem {
  id: string;
  type: 'new' | 'used';
  title: string;
  price: string;
  description: string;
  images: string[];
  seller: {
    name: string;
    type: 'commerce' | 'user';
    avatar: string;
    rating?: number;
  };
  category: string;
  location: string;
  timeAgo: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

interface ProductFeedProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  'Todos',
  'Eletrônicos',
  'Roupas',
  'Calçados',
  'Casa',
  'Esportes',
  'Livros',
  'Outros'
];

const mockFeedItems: FeedItem[] = [
  {
    id: '1',
    type: 'new',
    title: 'iPhone 14 Pro Max 256GB',
    price: 'R$ 6.999,00',
    description: 'iPhone novo, lacrado, com nota fiscal. Todas as cores disponíveis.',
    images: ['https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg'],
    seller: {
      name: 'TechStore Centro',
      type: 'commerce',
      avatar: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg',
      rating: 4.8
    },
    category: 'Eletrônicos',
    location: '0.4 km',
    timeAgo: '2h',
    likes: 45,
    comments: 12,
    isLiked: false
  },
  {
    id: '2',
    type: 'used',
    title: 'Tênis Nike Air Max',
    price: 'R$ 180,00',
    description: 'Tênis usado poucas vezes, tamanho 42, em ótimo estado.',
    images: ['https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg'],
    seller: {
      name: 'João Silva',
      type: 'user',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg'
    },
    category: 'Calçados',
    location: '0.8 km',
    timeAgo: '4h',
    likes: 23,
    comments: 5,
    isLiked: true
  },
  {
    id: '3',
    type: 'new',
    title: 'Vestido Floral Verão',
    price: 'R$ 89,90',
    description: 'Vestido novo, várias cores e tamanhos disponíveis.',
    images: ['https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg'],
    seller: {
      name: 'Boutique Elegance',
      type: 'commerce',
      avatar: 'https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg',
      rating: 4.7
    },
    category: 'Roupas',
    location: '0.5 km',
    timeAgo: '6h',
    likes: 67,
    comments: 18,
    isLiked: false
  },
  {
    id: '4',
    type: 'used',
    title: 'Notebook Dell Inspiron',
    price: 'R$ 1.200,00',
    description: 'Notebook usado, funcionando perfeitamente. Intel i5, 8GB RAM.',
    images: ['https://images.pexels.com/photos/18105/pexels-photo.jpg'],
    seller: {
      name: 'Maria Santos',
      type: 'user',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg'
    },
    category: 'Eletrônicos',
    location: '1.2 km',
    timeAgo: '1d',
    likes: 34,
    comments: 8,
    isLiked: false
  }
];

export default function ProductFeed({ isOpen, onClose }: ProductFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedType, setSelectedType] = useState<'all' | 'new' | 'used'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedItems, setFeedItems] = useState(mockFeedItems);
  const [showFilters, setShowFilters] = useState(false);

  if (!isOpen) return null;

  const filteredItems = feedItems.filter(item => {
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesType && matchesSearch;
  });

  const handleLike = (itemId: string) => {
    setFeedItems(prev => prev.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            isLiked: !item.isLiked,
            likes: item.isLiked ? item.likes - 1 : item.likes + 1
          }
        : item
    ));
  };

  const handleComment = (itemId: string) => {
    alert(`Comentar no item ${itemId}`);
  };

  const handleShare = (itemId: string) => {
    alert(`Compartilhar item ${itemId}`);
  };

  const handleContact = (item: FeedItem) => {
    alert(`Entrar em contato com ${item.seller.name}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-[#1a1a1a] w-full h-[90vh] rounded-t-3xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#2a2a2a]">
          <h2 className="text-xl font-semibold text-white">Shopping/Vitrine</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Busca e Filtros */}
        <div className="p-6 border-b border-[#2a2a2a] space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#2a2a2a] text-white placeholder-gray-400 rounded-xl border border-[#333] focus:border-[#00d8ff] focus:outline-none"
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white">{filteredItems.length} produtos encontrados</span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-[#212121] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          </div>

          {showFilters && (
            <div className="bg-[#212121] rounded-xl p-4 space-y-4">
              {/* Tipo de produto */}
              <div>
                <h4 className="font-medium text-white mb-2">Tipo</h4>
                <div className="flex gap-2">
                  {[
                    { value: 'all', label: 'Todos' },
                    { value: 'new', label: 'Novos' },
                    { value: 'used', label: 'Usados' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setSelectedType(type.value as any)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedType === type.value
                          ? 'bg-[#00d8ff] text-[#0b0b0b]'
                          : 'bg-[#2a2a2a] text-white hover:bg-[#333]'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categorias */}
              <div>
                <h4 className="font-medium text-white mb-2">Categoria</h4>
                <div className="grid grid-cols-4 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-[#00d8ff] text-[#0b0b0b]'
                          : 'bg-[#2a2a2a] text-white hover:bg-[#333]'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feed */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-[#212121] rounded-xl p-6">
                {/* Header do post */}
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={item.seller.avatar}
                    alt={item.seller.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-white">{item.seller.name}</h4>
                      {item.seller.type === 'commerce' && (
                        <span className="px-2 py-1 bg-[#00d8ff] text-[#0b0b0b] text-xs rounded-full font-medium">
                          Loja
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        item.type === 'new' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {item.type === 'new' ? 'Novo' : 'Usado'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>{item.location}</span>
                      <span>•</span>
                      <span>{item.timeAgo}</span>
                    </div>
                  </div>
                </div>

                {/* Imagem do produto */}
                <div className="mb-4">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>

                {/* Conteúdo */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-[#00d8ff] text-xl font-bold mb-2">{item.price}</p>
                  <p className="text-gray-300 text-sm">{item.description}</p>
                </div>

                {/* Ações */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(item.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        item.isLiked 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'bg-[#2a2a2a] text-white hover:bg-[#333]'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${item.isLiked ? 'fill-current' : ''}`} />
                      <span className="text-sm">{item.likes}</span>
                    </button>
                    
                    <button
                      onClick={() => handleComment(item.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#333] transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{item.comments}</span>
                    </button>
                    
                    <button
                      onClick={() => handleShare(item.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#333] transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleContact(item)}
                    className="px-6 py-2 bg-[#00d8ff] text-[#0b0b0b] rounded-lg font-medium hover:bg-[#00d8ff]/90 transition-colors"
                  >
                    Entrar em contato
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Nenhum produto encontrado</p>
              <p className="text-gray-500 text-sm mt-2">
                Tente ajustar os filtros ou termo de busca
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}