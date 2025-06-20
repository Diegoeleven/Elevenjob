import { X, MapPin, Clock, Calendar } from 'lucide-react';

interface Ambulante {
  id: string;
  nome: string;
  produto: string;
  descricao: string;
  dias_semana: string;
  horarios: string;
  bairro_destino: string;
  foto_url: string;
  ativo: boolean;
}

interface AmbulanteModalProps {
  ambulante: Ambulante;
  onClose: () => void;
}

export default function AmbulanteModal({ ambulante, onClose }: AmbulanteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50 p-4">
      <div className="relative bg-[#0b0b0b] rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Close Button - Always visible */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-[#1c1c1c] hover:bg-[#00d8ff]/20 rounded-full p-1.5 z-50 transition-colors"
        >
          <X size={22} />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[90vh]">
          {/* Header */}
          <div className="p-6 border-b border-[#2a2a2a]">
            {/* Foto */}
            <img
              src={ambulante.foto_url || 'https://via.placeholder.com/200/00d8ff/FFFFFF?text=A'}
              alt={`Foto de ${ambulante.nome}`}
              className="w-16 h-16 rounded-full border-2 border-[#00d8ff] mx-auto mb-3 object-cover"
            />

            {/* Nome e Produto */}
            <h2 className="text-2xl font-bold text-white text-center mb-2">
              {ambulante.nome}
            </h2>
            <p className="text-[#00d8ff] text-lg text-center font-medium">
              {ambulante.produto}
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Descrição */}
            <div>
              <h3 className="text-white font-medium mb-2">Sobre</h3>
              <p className="text-gray-400 text-sm">
                {ambulante.descricao}
              </p>
            </div>

            {/* Horários */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white">
                <Calendar className="w-5 h-5 text-[#00d8ff]" />
                <span className="font-medium">Dias:</span>
                <span className="text-gray-400">{ambulante.dias_semana}</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Clock className="w-5 h-5 text-[#00d8ff]" />
                <span className="font-medium">Horário:</span>
                <span className="text-gray-400">{ambulante.horarios}</span>
              </div>
            </div>

            {/* Comentários */}
            <div>
              <h3 className="text-white font-medium mb-2">Avaliações</h3>
              <div className="space-y-2">
                <div className="bg-[#212121] rounded-lg p-3">
                  <p className="text-gray-300 text-sm italic">
                    "Melhor do bairro! Sempre pontual e produtos de qualidade."
                  </p>
                </div>
                <div className="bg-[#212121] rounded-lg p-3">
                  <p className="text-gray-300 text-sm italic">
                    "Preços justos e atendimento excelente."
                  </p>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="space-y-3">
              <button 
                onClick={() => {
                  // Implementar rota no mapa
                  alert('Abrindo rota no mapa...');
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#212121] text-white px-4 py-3 rounded-lg hover:bg-[#2a2a2a] transition-colors"
              >
                <MapPin className="w-5 h-5 text-[#00d8ff]" />
                <span>Ver rota no mapa</span>
              </button>

              <button 
                onClick={() => {
                  // Implementar notificação
                  alert('Você será notificado quando o ambulante estiver próximo!');
                }}
                className="w-full bg-[#00d8ff] text-black px-4 py-3 rounded-lg hover:bg-[#00d8ff]/90 transition-colors font-medium"
              >
                Quero ser avisado quando estiver próximo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 