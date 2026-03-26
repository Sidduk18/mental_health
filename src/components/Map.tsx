import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import getApiUrl from '../lib/api';
import { Loader2, Navigation } from 'lucide-react';

// Fix Leaflet icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface Center {
  _id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 13);
  return null;
}

export default function MapComponent() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          setLoading(false);
        },
        () => {
          // Default to center if denied (e.g., Wellness City example coordinates)
          setUserLocation([12.9716, 77.5946]);
          setLoading(false);
        }
      );
    } else {
      setUserLocation([12.9716, 77.5946]);
      setLoading(false);
    }

    // Fetch centers
    const fetchCenters = async () => {
      const token = localStorage.getItem('auth_token');
      try {
        const response = await fetch(getApiUrl('/api/centers'), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setCenters(data);
      } catch (err) {
        console.error('Error fetching centers:', err);
      }
    };
    fetchCenters();
  }, []);

  if (loading || !userLocation) {
    return (
      <div className="h-[400px] bg-neutral-100 dark:bg-white/5 rounded-3xl flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-black/20" />
        <p className="text-sm text-black/40 font-bold uppercase tracking-widest">Loading Map...</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-black/10 h-[400px] md:h-[500px] z-10">
      <MapContainer center={userLocation} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={userLocation} />

        {/* User Marker */}
        <Marker position={userLocation}>
          <Popup>
            <div className="font-bold">Your Location</div>
          </Popup>
        </Marker>

        {/* Support Centers */}
        {centers.map((center) => (
          <Marker key={center._id} position={[center.lat, center.lng]}>
            <Popup className="custom-popup">
              <div className="p-1 space-y-2 min-w-[200px]">
                <div>
                  <h4 className="font-black text-lg text-black m-0 leading-tight">{center.name}</h4>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{center.type}</p>
                </div>
                <p className="text-xs text-black/60 m-0">{center.address}</p>
                <div className="pt-2 border-t border-black/5 flex flex-col space-y-2">
                  <a href={`tel:${center.phone}`} className="text-xs font-bold text-black flex items-center space-x-2">
                    <span>📞 {center.phone}</span>
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-black text-white py-2 px-4 rounded-xl text-[10px] font-bold text-center hover:bg-black/80 transition-all flex items-center justify-center space-x-2"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Get Directions</span>
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
