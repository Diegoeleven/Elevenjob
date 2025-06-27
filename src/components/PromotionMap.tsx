import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../lib/supabase';
import { useUserContext } from '../context/UserContext';

interface PromotionMapProps {
  onClose: () => void;
}

interface Location {
  id: string;
  nome: string;
  endereco: string;
  latitude: number;
  longitude: number;
}

const defaultCenter = { lat: -14.2350, lng: -51.9253 }; // Centro do Brasil

const PromotionMap: React.FC<PromotionMapProps> = ({ onClose }) => {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const { user } = useUserContext();

  const getLocation = useCallback(() => {
    setShowError(false);
    setErrorMsg('');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (error) => {
          setPosition(null);
          setShowError(true);
          if (error.code === 1) {
            setErrorMsg('Permissão de localização negada. Ative o GPS e permita o acesso.');
          } else if (error.code === 2) {
            setErrorMsg('Localização indisponível. Verifique seu GPS.');
          } else if (error.code === 3) {
            setErrorMsg('Tempo de localização esgotado. Tente novamente.');
          } else {
            setErrorMsg('Não foi possível acessar sua localização. Por favor, ative o GPS e permita o acesso à localização para ver comércios próximos.');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      setPosition(null);
      setShowError(true);
      setErrorMsg('Geolocalização não é suportada neste navegador.');
    }
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  useEffect(() => {
    const fetchLocations = async () => {
      const { data, error } = await supabase
        .from('comercios')
        .select('id, nome, endereco, latitude, longitude')
        .eq('bairro', user?.bairro);
      if (!error && data) setLocations(data as Location[]);
    };
    fetchLocations();
  }, [user?.bairro]);

  const icon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854878.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    className: 'animate-pulse',
  });

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center">
      <div className="relative w-full h-full md:w-4/5 md:h-4/5">
        {showError && (
          <div
            className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-yellow-600 text-white px-4 py-2 rounded shadow z-50 text-xs text-center"
            role="alert"
          >
            {errorMsg}
            <button
              onClick={getLocation}
              className="ml-4 px-2 py-1 bg-blue-600 text-white rounded text-xs"
              aria-label="Tentar novamente"
            >
              Tentar novamente
            </button>
          </div>
        )}
        {position && (
          <MapContainer center={position} zoom={14} className="h-full w-full rounded-lg z-40">
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locations.map((loc) => (
              <Marker
                key={loc.id}
                position={{ lat: loc.latitude, lng: loc.longitude }}
                icon={icon}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold">{loc.nome}</p>
                    <p className="text-xs">{loc.endereco}</p>
                    <button
                      onClick={() => console.log('Ver catálogo do comércio:', loc.id)}
                      className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
                    >
                      Ver catálogo
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-red-600 px-3 py-1 rounded z-50 hover:bg-red-700"
        >
          Fechar mapa
        </button>
      </div>
    </div>
  );
};

export default PromotionMap; 