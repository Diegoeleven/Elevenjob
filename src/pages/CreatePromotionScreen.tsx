import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { UserContext } from '../context/UserContext';

export default function CreatePromotionScreen() {
  const navigate = useNavigate();
  const { user, comercio } = useContext(UserContext);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [dataValidade, setDataValidade] = useState('');
  const [desconto, setDesconto] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comercio?.id) {
      alert('Comércio não identificado. Faça login como comerciante.');
      return;
    }

    const { error } = await supabase.from('promocoes').insert({
      titulo,
      descricao,
      imagem_url: imagemUrl,
      data_validade: dataValidade,
      desconto: Number(desconto),
      comercio_id: comercio.id,
    });

    if (error) {
      console.error('Erro ao cadastrar promoção:', error.message);
      alert('Erro ao cadastrar promoção.');
    } else {
      alert('Promoção cadastrada com sucesso!');
      navigate('/neighborhood');
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-4">Cadastrar Promoção</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full p-2 rounded bg-zinc-800"
          required
        />
        <textarea
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="w-full p-2 rounded bg-zinc-800"
          rows={3}
          required
        />
        <input
          type="text"
          placeholder="URL da imagem"
          value={imagemUrl}
          onChange={(e) => setImagemUrl(e.target.value)}
          className="w-full p-2 rounded bg-zinc-800"
          required
        />
        <input
          type="number"
          placeholder="Desconto (%)"
          value={desconto}
          onChange={(e) => setDesconto(e.target.value)}
          className="w-full p-2 rounded bg-zinc-800"
          min={1}
          max={100}
          required
        />
        <input
          type="date"
          placeholder="Data de validade"
          value={dataValidade}
          onChange={(e) => setDataValidade(e.target.value)}
          className="w-full p-2 rounded bg-zinc-800"
          required
        />
        <button
          type="submit"
          className="w-full bg-cyan-500 text-black font-bold py-2 rounded"
        >
          Salvar Promoção
        </button>
      </form>
    </div>
  );
} 