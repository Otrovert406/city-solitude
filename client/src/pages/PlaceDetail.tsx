import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { MapPin, Heart, MessageCircle, Calendar, User } from 'lucide-react';

export default function PlaceDetail() {
  const { id } = useParams();
  const { data: place, isLoading } = useQuery({
    queryKey: ['place', id],
    queryFn: () => api.get(`/places/${id}`).then(r => r.data),
  });

  if (isLoading) return <div className="max-w-4xl mx-auto px-4 py-8"><div className="bg-white rounded-2xl h-96 animate-pulse" /></div>;

  if (!place) return <div className="text-center py-20 text-stone-400">地点不存在</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Image */}
      <div className="bg-stone-100 rounded-2xl h-64 sm:h-96 overflow-hidden mb-8">
        {place.images?.[0] ? (
          <img src={place.images[0]} alt={place.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300"><MapPin className="w-20 h-20" /></div>
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
            <p className="text-stone-600 mt-4 leading-relaxed whitespace-pre-wrap">{place.description}</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 space-y-4">
            <Link to={`/profile/${place.author.id}`} className="flex items-center gap-3 hover:bg-stone-50 p-2 rounded-lg transition-colors">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
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
              <h3 className="font-medium text-stone-700 mb-2">地址</h3>
              <p className="text-sm text-stone-500">{place.address}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
