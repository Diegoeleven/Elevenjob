import { X, LogOut } from 'lucide-react';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const menuItems = [
  'Nossas políticas',
  'Configurações',
  'Nossas redes sociais',
  'Anunciar no marketplace',
  'Saiba mais',
  'Como funciona',
  'Feedback',
  'Termos',
  'Política de privacidade',
  'Tradução',
  'Filtros personalizados (Gênero, Idade, Preferências)'
];

export default function MenuDrawer({ isOpen, onClose, onLogout }: MenuDrawerProps) {
  if (!isOpen) return null;

  const handleMenuItemClick = (item: string) => {
    console.log(`Clicked: ${item}`);
    // Implementar navegação específica para cada item
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex">
      <div className="bg-[#1a1a1a] w-80 h-full p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-semibold text-white">Menu</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleMenuItemClick(item)}
              className="w-full text-left p-4 text-white hover:bg-[#2a2a2a] rounded-lg transition-colors"
            >
              {item}
            </button>
          ))}
          
          {/* Botão Sair */}
          <button
            onClick={onLogout}
            className="w-full text-left p-4 text-red-400 hover:bg-[#2a2a2a] rounded-lg transition-colors flex items-center gap-3 mt-4 border-t border-[#2a2a2a] pt-6"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </div>
      <div 
        className="flex-1" 
        onClick={onClose}
      />
    </div>
  );
}