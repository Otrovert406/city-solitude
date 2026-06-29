import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import maplibregl from 'maplibre-gl';
import api from '../lib/api';
import { MapPin } from 'lucide-react';

export default function MapExplore() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);

  const { data } = useQuery({
    queryKey: ['places', 'map'],
    queryFn: () => api.get('/places', { params: { limit: 100 } }).then(r => r.data),
  });

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [104.0, 35.0],
      zoom: 3.5,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !data?.places) return;

    const markers = data.places.filter((p: any) => p.latitude && p.longitude);
    markers.forEach((place: any) => {
      const el = document.createElement('div');
      el.className = 'w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg cursor-pointer hover:scale-110 transition-transform';
      el.innerHTML = '📍';
      el.onclick = () => setSelectedPlace(place);

      new maplibregl.Marker({ element: el })
        .setLngLat([place.longitude, place.latitude])
        .addTo(map.current!);
    });

    if (markers.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      markers.forEach((p: any) => bounds.extend([p.longitude, p.latitude]));
      map.current.fitBounds(bounds, { padding: 80, maxZoom: 14 });
    }
  }, [data]);

  return (
    <div className="relative h-[calc(100vh-3.5rem)]">
      <div ref={mapContainer} className="w-full h-full" />

      {selectedPlace && (
        <div className="absolute bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:w-80 bg-white rounded-2xl p-4 shadow-xl border border-stone-200">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-stone-800">{selectedPlace.title}</h3>
              <p className="text-sm text-stone-500">{selectedPlace.city.name} · {selectedPlace.city.province}</p>
            </div>
            <button onClick={() => setSelectedPlace(null)} className="text-stone-400 hover:text-stone-600">✕</button>
          </div>
          <p className="text-sm text-stone-600 mt-2 line-clamp-2">{selectedPlace.description}</p>
          <Link
            to={`/places/${selectedPlace.id}`}
            className="inline-block mt-3 text-sm text-primary hover:underline font-medium"
          >
            查看详情 →
          </Link>
        </div>
      )}
    </div>
  );
}
