export interface User {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  bairro: string;
  cidade: string;
}

export interface Neighborhood {
  name: string;
}

export interface Publication {
  id: string;
  titulo: string;
  mensagem: string;
  bairro_destino: string;
  nivel_prioridade: string;
  data_publicacao: string;
  nome_orgao: string;
}

export interface Commerce {
  id: string;
  nome_razao_social: string;
  proprietario: string;
  endereco: string;
  bairro: string;
  cidade: string;
  telefone: string;
  plano: string;
}

export interface PublicOrgan {
  id: string;
  nome_orgao: string;
  hasActivePublication?: boolean;
}

// Declarações globais para APIs do navegador
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}