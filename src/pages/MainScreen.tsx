import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';
import { supabase } from '../lib/supabase';
import { Menu, LogOut } from 'lucide-react';
import MenuDrawer from '../components/MenuDrawer';

export default function MainScreen() {
  const navigate = useNavigate();
  const { user, setUser } = useUserContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState(0); // 0: Seu Bairro, 1: Job, 2: Turismo

  useEffect(() => {
    // Verificar se usuário está logado
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    } catch (error) {
      navigate('/login');
    }
  }, [navigate, setUser]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleScreenNavigation = (screenIndex: number) => {
    if (screenIndex === 0) {
      navigate('/neighborhood');
    } else {
      setCurrentScreen(screenIndex);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      {/* Header */}
      <div className="flex items-center p-6">
        <button
          onClick={() => setIsMenuOpen(true)}
          className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors mr-4"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>

        <h1 className="text-lg font-medium flex-1">
          Olá, {user.nome}
        </h1>

        <button
          onClick={handleLogout}
          className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 text-red-400" />
        </button>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6">
        <h2 className="text-2xl font-medium text-center mb-12">
          O que você precisa hoje?
        </h2>

        {/* Três Botões Principais - Mais Quadrados e Modernos */}
        <div className="flex gap-4 w-full max-w-3xl">
          <button
            onClick={() => handleScreenNavigation(0)}
            className="flex-1 py-8 px-6 bg-[#00d8ff] text-[#0b0b0b] rounded-2xl font-bold text-lg hover:bg-[#00d8ff]/90 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
          >
            <div className="text-xl mb-2">🏘️</div>
            Seu Bairro
          </button>
          
          <button
            onClick={() => handleScreenNavigation(1)}
            className="flex-1 py-8 px-6 bg-[#212121] text-gray-400 rounded-2xl font-bold text-lg cursor-not-allowed border border-[#2a2a2a]"
            disabled
          >
            <div className="text-xl mb-2">💼</div>
            Job
            <div className="text-xs mt-2 font-normal opacity-70">(em breve)</div>
          </button>
          
          <button
            onClick={() => handleScreenNavigation(2)}
            className="flex-1 py-8 px-6 bg-[#212121] text-gray-400 rounded-2xl font-bold text-lg cursor-not-allowed border border-[#2a2a2a]"
            disabled
          >
            <div className="text-xl mb-2">🗺️</div>
            Modo Turismo
            <div className="text-xs mt-2 font-normal opacity-70">(em breve)</div>
          </button>
        </div>

        {/* Indicador de tela ativa */}
        <div className="flex gap-3 mt-10">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentScreen === index ? 'bg-[#00d8ff] scale-125' : 'bg-[#2a2a2a]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Menu Lateral */}
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onLogout={handleLogout}
      />
    </div>
  );
}