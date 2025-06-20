import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData && userData.id) {
          navigate('/main');
        }
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !telefone) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('telefone', telefone)
        .limit(1);

      if (error) throw error;

      if (data && data[0]) {
        localStorage.setItem('user', JSON.stringify(data[0]));
        toast.success('Login realizado com sucesso');
        navigate('/main');
      } else {
        toast.error('E-mail ou telefone inválido');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Erro ao realizar login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin(e as any);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]" translate="no">
        <h1 className="text-[#ffffff] text-center text-[18px] font-normal tracking-widest mb-12 uppercase font-sans">
          SEJA BEM-VINDO
        </h1>

        <div className="bg-[#1a1a1a] rounded-[24px] px-8 py-10 shadow-2xl border border-[#2a2a2a]">
          {/* Logo visual Eleven Job */}
          <div className="relative mb-10 h-[120px] flex items-center justify-center" translate="no">
            <div 
              className="absolute inset-0 flex items-center justify-center text-[120px] text-[#666666] font-serif font-thin select-none pointer-events-none"
              style={{ opacity: 0.5 }}
            >
              11
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <h2 
                className="font-serif text-[#ffffff] text-[36px] font-bold tracking-[0.1em]"
                style={{ marginTop: '55px' }}
              >
                ELEVEN
              </h2>
              <span 
                className="text-[#ffffff] text-[16px] italic font-normal self-end"
                style={{ 
                  fontFamily: "'Great Vibes', cursive", 
                  marginTop: '-8px',
                  marginRight: '8px'
                }}
              >
                Job
              </span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-4 bg-[#2a2a2a] text-white placeholder-[#888] rounded-[12px] border border-[#333] focus:border-[#00d8ff] focus:outline-none text-[15px] transition-colors"
              disabled={loading}
            />
            <input
              type="tel"
              placeholder="Telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-4 bg-[#2a2a2a] text-white placeholder-[#888] rounded-[12px] border border-[#333] focus:border-[#00d8ff] focus:outline-none text-[15px] transition-colors"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#00d8ff] text-[#0b0b0b] font-semibold rounded-[12px] hover:opacity-90 transition-all duration-200 disabled:opacity-50 text-[16px] mt-6"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <button
            onClick={() => navigate('/register')}
            disabled={loading}
            className="w-full mt-5 py-4 border border-white text-white rounded-[12px] hover:bg-white hover:text-[#0b0b0b] transition-all duration-200 disabled:opacity-50 text-[16px] font-semibold"
          >
            Cadastrar-se
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
