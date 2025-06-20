import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    bairro: '',
    cidade: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    if (!formData.nome || !formData.email || !formData.telefone || !formData.bairro || !formData.cidade) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .insert([formData])
        .select()
        .limit(1);

      if (error) throw error;

      if (data && data[0]) {
        // Store user data in localStorage for persistent login
        localStorage.setItem('user', JSON.stringify(data[0]));
        toast.success('Cadastro realizado com sucesso');
        navigate('/main');
      }
    } catch (error) {
      console.error('Error registering:', error);
      toast.error('Erro ao cadastrar. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white flex flex-col items-center justify-center p-4">
      <button
        className="absolute top-4 left-4 text-[#00d8ff] hover:text-[#00d8ff]/80 flex items-center gap-2"
        onClick={() => navigate('/login')}
      >
        <ArrowLeft size={20} />
        Voltar
      </button>

      <h1 className="text-3xl font-bold mb-6">Cadastro</h1>

      <form onSubmit={handleRegister} className="w-full max-w-sm space-y-4">
        <input
          type="text"
          name="nome"
          placeholder="Nome"
          value={formData.nome}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-[#2a2a2a] text-white rounded-lg border border-[#333] focus:border-[#00d8ff] focus:outline-none"
          disabled={loading}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-[#2a2a2a] text-white rounded-lg border border-[#333] focus:border-[#00d8ff] focus:outline-none"
          disabled={loading}
        />
        <input
          type="tel"
          name="telefone"
          placeholder="Telefone"
          value={formData.telefone}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-[#2a2a2a] text-white rounded-lg border border-[#333] focus:border-[#00d8ff] focus:outline-none"
          disabled={loading}
        />
        <input
          type="text"
          name="bairro"
          placeholder="Bairro"
          value={formData.bairro}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-[#2a2a2a] text-white rounded-lg border border-[#333] focus:border-[#00d8ff] focus:outline-none"
          disabled={loading}
        />
        <input
          type="text"
          name="cidade"
          placeholder="Cidade"
          value={formData.cidade}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-[#2a2a2a] text-white rounded-lg border border-[#333] focus:border-[#00d8ff] focus:outline-none"
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#00d8ff] text-[#0b0b0b] font-bold py-3 rounded hover:opacity-90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>

      <p className="text-center text-[#bfbfbf] mt-4">
        Já tem uma conta?{' '}
        <button
          onClick={() => navigate('/login')}
          className="text-[#00d8ff] hover:text-[#00d8ff]/80"
          disabled={loading}
        >
          Faça login
        </button>
      </p>
    </div>
  );
}

export default Register;