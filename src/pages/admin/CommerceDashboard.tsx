import React, { useContext } from 'react';
import SearchTrendsPanel from '../../components/SearchTrendsPanel';
import { UserContext } from '../../context/UserContext';

export default function CommerceDashboard() {
  const { user } = useContext(UserContext);

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Painel Administrativo do Comércio</h1>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Tendências de Busca no Bairro</h2>
        <SearchTrendsPanel bairro={user?.bairro || 'Bairro não identificado'} className="w-full max-w-4xl" />
      </div>
    </div>
  );
}
