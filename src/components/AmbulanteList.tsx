import { Clock } from 'lucide-react';

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

interface AmbulanteListProps {
  ambulantes: Ambulante[];
  onSelectAmbulante: (ambulante: Ambulante) => void;
  isLoading: boolean;
}

export default function AmbulanteList({ ambulantes, onSelectAmbulante, isLoading }: AmbulanteListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00d8ff]"></div>
        <p className="text-gray-400 mt-4">Carregando ambulantes...</p>
      </div>
    );
  }

  if (ambulantes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 bg-[#212121] rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <p className="text-gray-400 text-center">Nenhum ambulante ativo no momento</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
      {ambulantes.map((ambulante) => (
        <button
          key={ambulante.id}
          onClick={() => onSelectAmbulante(ambulante)}
          className="bg-[#212121] rounded-xl p-4 flex items-start gap-3 hover:bg-[#1c1c1c] transition-all"
        >
          {/* Foto */}
          <img
            src={ambulante.foto_url || 'https://via.placeholder.com/200/00d8ff/FFFFFF?text=A'}
            alt={`Foto de ${ambulante.nome}`}
            className="w-12 h-12 rounded-full object-cover"
          />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium truncate">{ambulante.nome}</h3>
            <p className="text-[#00d8ff] text-sm truncate">{ambulante.produto}</p>
            
            {/* ETA */}
            <div className="flex items-center gap-1 mt-2">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400">
                Chega em ~{Math.floor(Math.random() * 20 + 1)} min
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
} 