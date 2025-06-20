export async function getNeighborhoodFromLatLng(lat: number, lng: number): Promise<string> {
  // Rate limit: delay de 1 segundo entre chamadas
  await new Promise((resolve) => setTimeout(resolve, 1000));
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
    const data = await response.json();
    const bairro = data.address?.suburb || data.address?.neighbourhood || data.address?.city_district || 'Bairro desconhecido';
    return bairro;
  } catch (error) {
    console.error('Erro ao buscar bairro por geolocalização:', error);
    return 'Bairro desconhecido';
  }
}

// Função mock para retornar bairros vizinhos
export function getNeighborBairros(bairro: string): string[] {
  // Mock atualizado para refletir os bairros reais do Supabase
  const vizinhos: { [key: string]: string[] } = {
    'Linha Santa Cruz': ['Universitário', 'Esmeralda'],
    'Universitário': ['Linha Santa Cruz', 'Esmeralda'],
    'Esmeralda': ['Linha Santa Cruz', 'Universitário'],
  };
  return vizinhos[bairro] || [];
}

// Função para calcular distância entre duas coordenadas geográficas (fórmula de Haversine)
export function calcularDistanciaEmKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
} 