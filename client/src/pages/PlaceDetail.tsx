import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { MapPin, Heart, MessageCircle, Calendar, User, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PlaceDetail() {
  const { id } = useParams();
  const [imgIndex, setImgIndex] = useState(0);

  const { data: place, isLoading } = useQuery({
    queryKey: ['place', id],
    queryFn: () => api.get(`/places/${id}`).then(r => r.data),
  });

  if (isLoading) return <div className="max-w-4xl mx-auto px-4 py-8"><div className="bg-white rounded-2xl h-96 animate-pulse" /></div>;
  if (!place) return <div className="text-center py-20 text-stone-400">地点不存在</div>;

  const images = place.images || [];
  const hasImages = images.length > 0;

  const prevImage = () => setImgIndex(i => (i === 0 ? images.length - 1 : i - 1));
  const nextImage = () => setImgIndex(i => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Image gallery */}
      <div className="relative bg-stone-100 rounded-2xl overflow-hidden mb-8">
        {hasImages ? (
          <>
            <div className="aspect-[16/9] sm:aspect-[2/1]">
              <img src={images[imgIndex]} alt={place.title} className="w-full h-full object-cover" />
            </div>
            {images.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-lg transition-colors">
                  <ChevronLeft className="w-5 h-5 text-stone-700" />
                </button>
                <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-lg transition-colors">
                  <ChevronRight className="w-5 h-5 text-stone-700" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setImgIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === imgIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'}`}
                    />
                  ))}
                </div>
              </>
            )}
            {/* Thumbnails */}
            <div className="flex gap-2 p-3 bg-white/50 backdrop-blur">
              {images.map((url: string, i: number) => (
                <button key={i} onClick={() => setImgIndex(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${i === imgIndex ? 'border-primary' : 'border-transparent hover:border-stone-300'}`}>
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="aspect-[16/9] sm:aspect-[2/1] flex items-center justify-center text-stone-300">
            <MapPin className="w-20 h-20" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-primary mb-2">
              <MapPin className="w-4 h-4" />
              {place.city.name} · {place.city.province}
            </div>
            <h1 className="text-3xl font-bold text-stone-800">{place.title}</h1>

            {/* Tags */}
            {place.vibe?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {place.vibe.map((v: string) => {
                  const labels: Record<string, string> = { QUIET: '安静', HEALING: '治愈', LITERARY: '文艺', NATURE: '自然', COZY: '温馨', MINIMAL: '极简' };
                  return <span key={v} className="px-3 py-1 rounded-full text-xs bg-primary/10 text-primary">{labels[v] || v}</span>;
                })}
              </div>
            )}

            <p className="text-stone-600 mt-6 leading-relaxed whitespace-pre-wrap">{place.description}</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 space-y-4">
            <Link to={`/profile/${place.author.id}`} className="flex items-center gap-3 hover:bg-stone-50 p-2 rounded-lg transition-colors">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {place.author.avatar ? <img src={place.author.avatar} alt="" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-primary" />}
              </div>
              <div>
                <p className="font-medium text-stone-800 text-sm">{place.author.username}</p>
                {place.author.bio && <p className="text-xs text-stone-400">{place.author.bio}</p>}
              </div>
            </Link>
            <div className="flex gap-4 text-sm text-stone-500">
              <span className="flex items-center gap-1"><Heart className="w-4 h-4" />{place._count.favorites} 收藏</span>
              <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" />{place._count.reviews} 评论</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-stone-400">
              <Calendar className="w-3 h-3" />
              {new Date(place.createdAt).toLocaleDateString('zh-CN')}
            </div>
          </div>

          {place.address && (
            <div className="bg-white rounded-2xl p-6 border border-stone-200">
              <h3 className="font-medium text-stone-700 mb-2">📍 地址</h3>
              <p className="text-sm text-stone-500">{place.address}</p>
            </div>
          )}

          {/* Map placeholder */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200">
            <h3 className="font-medium text-stone-700 mb-2">🗺️ 位置</h3>
            <div className="bg-stone-100 rounded-xl h-40 flex items-center justify-center text-stone-400 text-sm">
              <MapPin className="w-5 h-5 mr-2" />
              {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
