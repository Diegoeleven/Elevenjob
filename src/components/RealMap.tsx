import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix para ícones do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Business {
  name: string;
  lat: number;
  lng: number;
  promo: boolean;
}

interface UserLocation {
  lat: number;
  lng: number;
}

// Dados simulados de comércios
const businesses: Business[] = [
  { name: "Padaria do Bairro", lat: -29.715, lng: -52.430, promo: true },
  { name: "Mercado Central", lat: -29.716, lng: -52.432, promo: false },
  { name: "Farmácia Popular", lat: -29.714, lng: -52.428, promo: true },
  { name: "TechStore", lat: -29.717, lng: -52.431, promo: false },
  { name: "Boutique Elegance", lat: -29.713, lng: -52.429, promo: true },
];

// Componente para centralizar o mapa na localização do usuário
function MapController({ userLocation }: { userLocation: UserLocation | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 15);
    }
  }, [userLocation, map]);
  
  return null;
}

// Ícones customizados
const createPromoIcon = () => {
  return L.divIcon({
    html: `
      <div class="relative">
        <div class="w-6 h-6 bg-[#00d8ff] rounded-full border-2 border-white shadow-lg animate-pulse"></div>
        <div class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  });
};

const createNormalIcon = () => {
  return L.divIcon({
    html: `
      <div class="w-6 h-6 bg-gray-500 rounded-full border-2 border-white shadow-lg"></div>
    `,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  });
};

const createUserIcon = () => {
  return L.divIcon({
    html: `
      <div class="relative">
        <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
        <div class="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-75"></div>
      </div>
    `,
    className: 'user-location-marker',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

export default function RealMap() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Obter localização do usuário
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLoading(false);
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          // Usar localização padrão (centro de uma cidade brasileira)
          setUserLocation({
            lat: -29.7156,
            lng: -52.4297
          });
          setError('Não foi possível obter sua localização. Usando localização padrão.');
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      setError('Geolocalização não é suportada neste navegador.');
      setUserLocation({
        lat: -29.7156,
        lng: -52.4297
      });
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[400px] bg-[#212121] rounded-xl flex items-center justify-center">
        <div className="text-center text-white">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-[#00d8ff] animate-pulse" />
          <p className="text-sm">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  if (!userLocation) {
    return (
      <div className="w-full h-[400px] bg-[#212121] rounded-xl flex items-center justify-center">
        <div className="text-center text-white p-6">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-red-400" />
          <p className="text-sm mb-2">Erro ao carregar mapa</p>
          {error && <p className="text-xs text-gray-400">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-lg border border-[#2a2a2a]">
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        className="z-10"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapController userLocation={userLocation} />
        
        {/* Marker do usuário */}
        <Marker 
          position={[userLocation.lat, userLocation.lng]} 
          icon={createUserIcon()}
        >
          <Popup>
            <div className="text-center p-2">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="w-4 h-4 text-blue-500" />
                <strong className="text-gray-800">Você está aqui</strong>
              </div>
              <p className="text-sm text-gray-600">Sua localização atual</p>
            </div>
          </Popup>
        </Marker>

        {/* Markers dos comércios */}
        {businesses.map((business, index) => (
          <Marker
            key={index}
            position={[business.lat, business.lng]}
            icon={business.promo ? createPromoIcon() : createNormalIcon()}
          >
            <Popup>
              <div className="p-2 min-w-[150px]">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  <strong className="text-gray-800">{business.name}</strong>
                </div>
                
                {business.promo && (
                  <div className="mb-2">
                    <span className="px-2 py-1 bg-[#00d8ff] text-white text-xs rounded-full font-medium">
                      🎉 Promoção Ativa
                    </span>
                  </div>
                )}
                
                <div className="text-sm text-gray-600 mb-3">
                  <p>Comércio local do bairro</p>
                  <p className="text-xs">Clique para mais detalhes</p>
                </div>
                
                <button className="w-full py-1 px-2 bg-[#00d8ff] text-white rounded text-sm hover:bg-[#00d8ff]/90 transition-colors">
                  Ver Detalhes
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {error && (
        <div className="absolute bottom-2 left-2 right-2 bg-yellow-500/90 text-yellow-900 px-3 py-2 rounded text-xs">
          {error}
        </div>
      )}
    </div>
  );
}