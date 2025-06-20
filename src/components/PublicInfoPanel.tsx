import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ReactDOM from 'react-dom';
import { createPortal } from 'react-dom';

interface Organ {
  id: string;
  nome_orgao: string;
  tipo_orgao: string;
  status_orgao: string;
}

interface PublicacaoView {
  id: string;
  titulo: string;
  mensagem: string;
  data_publicacao: string;
  orgao_id: string;
  bairro_destino: string;
  status: string;
  data_inicio: string;
  data_fim: string;
  nome_orgao: string;
}

interface Publication {
  id: string;
  titulo: string;
  mensagem: string;
  data_publicacao: string;
  orgao_id: string;
  bairro_destino: string;
  data_inicio: string;
  data_fim: string;
  ativo: boolean;
  orgaos_publicadores: { id: string };
}

interface PublicInfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  publications: PublicacaoView[];
  activeOrgans: {
    id: string;
    nome_orgao: string;
    tipo_orgao: string;
    status_orgao: string;
  }[];
  userBairro: string;
  onPublicationSelect: (publication: PublicacaoView | null) => void;
  onReadMessage: (id: string) => void;
  mensagensLidas: string[];
}

export const PublicInfoPanel: React.FC<PublicInfoPanelProps> = ({
  isOpen,
  onClose,
  publications,
  activeOrgans,
  userBairro,
  onPublicationSelect,
  onReadMessage,
  mensagensLidas
}) => {
  const [selectedOrgan, setSelectedOrgan] = useState<typeof activeOrgans[0] | null>(null);
  const [selectedPublication, setSelectedPublication] = useState<PublicacaoView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [balloonPosition, setBalloonPosition] = useState({ top: 0, left: 0 });
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Função para buscar a publicação correta
  const fetchPublicationForOrgan = async () => {
    if (!selectedOrgan?.id || !userBairro) return;

    console.log('Consultando publicações para órgão:', selectedOrgan.id, 'bairro:', userBairro);

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('publicacoes')
        .select('id, titulo, mensagem, data_publicacao, orgao_id, bairro_destino')
        .eq('orgao_id', selectedOrgan.id)
        .eq('ativo', true)
        // REMOVA TEMPORARIAMENTE O FILTRO POR BAIRRO
        //.eq('bairro_destino', userBairro)
        .order('data_publicacao', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setSelectedPublication(data[0]);
        onPublicationSelect(data[0]);
      } else {
        setSelectedPublication(null);
        onPublicationSelect(null);
      }
    } catch (err) {
      console.error('Erro ao carregar publicação:', err);
      setSelectedPublication(null);
      onPublicationSelect(null);
    } finally {
      setLoading(false);
    }
  };

  // Carregar publicação quando um órgão é selecionado
  useEffect(() => {
    if (selectedOrgan) {
      fetchPublicationForOrgan();
    }
  }, [selectedOrgan, userBairro]);

  const getLatestValidPublication = (organId: string) => {
    const now = new Date();
    return publications
      .filter(pub =>
        pub.orgaos_publicadores.id === organId &&
        pub.ativo &&
        pub.bairro_destino === userBairro &&
        new Date(pub.data_inicio) <= now &&
        new Date(pub.data_fim) >= now
      )
      .sort((a, b) => new Date(b.data_publicacao).getTime() - new Date(a.data_publicacao).getTime())[0];
  };

  const hasUnreadMessages = (organId: string) => {
    const now = new Date();
    return publications.some(pub =>
      pub.orgaos_publicadores.id === organId &&
      pub.ativo &&
      pub.bairro_destino === userBairro &&
      new Date(pub.data_inicio) <= now &&
      new Date(pub.data_fim) >= now &&
      !mensagensLidas.includes(pub.id)
    );
  };

  const handleOrganSelect = (organ: typeof activeOrgans[0]) => {
    setSelectedOrgan(organ);
    // Atualiza a posição do balão baseado no botão clicado
    const button = buttonRefs.current[organ.id];
    if (button) {
      const rect = button.getBoundingClientRect();
      setBalloonPosition({
        top: rect.top,
        left: rect.right + 8 // 8px de margem
      });
    }
    // Nova lógica: se a publicação for válida e ainda não foi lida
    const pub = getLatestValidPublication(organ.id);
    if (pub && !mensagensLidas.includes(pub.id)) {
      onReadMessage(pub.id);
    }
    setSelectedPublication(pub || null);
  };

  // Função para verificar se um órgão tem mensagens válidas
  const hasValidMessages = (organId: string) => {
    const now = new Date();
    return publications.some(pub =>
      pub.orgao_id === organId &&
      pub.status === 'ativo' &&
      pub.bairro_destino === userBairro &&
      new Date(pub.data_inicio) <= now &&
      new Date(pub.data_fim) >= now
    );
  };

  // Renderiza o balão via portal
  const renderBalloon = () => {
    if (!selectedPublication) return null;
    return ReactDOM.createPortal(
      <div
        className="fixed z-50 w-80 bg-[#212121] text-white p-4 rounded-lg shadow-lg"
        style={{
          top: `${balloonPosition.top}px`,
          left: `${balloonPosition.left}px`
        }}
      >
        <div className="absolute -left-2 top-6 w-4 h-4 bg-[#212121] rotate-45 z-0" />
        <button
          onClick={() => setSelectedPublication(null)}
          className="absolute top-2 right-2 text-[#bfbfbf] hover:text-white"
          aria-label="Fechar"
        >
          <span className="text-2xl font-bold leading-none">×</span>
        </button>
        <div className="font-semibold text-white mb-1">{selectedPublication.titulo}</div>
        <div className="text-[#bfbfbf] text-sm">{selectedPublication.mensagem}</div>
        <div className="text-[#bfbfbf] text-xs mt-2">{new Date(selectedPublication.data_publicacao).toLocaleDateString('pt-BR')}</div>
      </div>,
      document.body
    );
  };

  if (!isOpen) return null;
                
                return (
    <div className="fixed left-0 top-0 w-96 h-full bg-[#0b0b0b] z-50 shadow-lg overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#212121]">
        <h2 className="text-white font-medium">Informações Públicas</h2>
                  <button
          onClick={onClose}
          className="text-[#bfbfbf] hover:text-white"
        >
          <X className="w-6 h-6" />
                  </button>
          </div>

      {/* Lista de órgãos */}
      <div className="p-4 space-y-2">
        {activeOrgans.map((organ) => (
          <button
            key={organ.id}
            ref={el => buttonRefs.current[organ.id] = el}
            onClick={() => handleOrganSelect(organ)}
            className={`
              w-full p-3 rounded-lg text-left transition-colors
              ${selectedOrgan?.id === organ.id ? 'bg-[#212121]' : 'hover:bg-[#212121]/50'}
              ${hasUnreadMessages(organ.id) ? 'border-l-4 border-[#00b4d8]' : ''}
            `}
          >
            <div className="flex flex-col">
              <span className="font-medium text-white">{organ.nome_orgao}</span>
              <span className="text-[#bfbfbf] text-xs">{organ.tipo_orgao}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Renderiza o balão via portal */}
      {renderBalloon()}
    </div>
  );
}