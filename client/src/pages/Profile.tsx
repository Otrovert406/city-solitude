import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { MapPin, Heart, Calendar, User } from 'lucide-react';

export default function Profile() {
  const { id } = useParams();
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => api.get(`/users/${id}`).then(r => r.data),
  });

  if (isLoading) return <div className="max-w-4xl mx-auto px-4 py-8"><div className="bg-white rounded-2xl h-48 animate-pulse" /></div>;
  if (!user) return <div className="text-center py-20 text-stone-400">用户不存在</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile card */}
      <div className="bg-white rounded-2xl p-8 border border-stone-200 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-800">{user.username}</h1>
            {user.bio && <p className="text-stone-500 mt-1">{user.bio}</p>}
            <div className="flex items-center gap-6 mt-3 text-sm text-stone-500">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{user._count.places} 个分享</span>
              <span className="flex items-center gap-1"><Heart className="w-4 h-4" />{user._count.favorites} 个收藏</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(user.createdAt).toLocaleDateString('zh-CN')} 加入</span>
            </div>
          </div>
        </div>
      </div>

      {/* User's places */}
      <h2 className="text-xl font-bold text-stone-800 mb-6">分享的地点</h2>
      {user.places?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {user.places.map((place: any) => (
            <Link
              key={place.id}
              to={`/places/${place.id}`}
              className="group bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-stone-300 hover:shadow-lg transition-all"
            >
              <div className="h-48 bg-stone-100 overflow-hidden">
                {place.images?.[0] ? (
                  <img src={place.images[0]} alt={place.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300"><MapPin className="w-12 h-12" /></div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-stone-800 group-hover:text-primary transition-colors">{place.title}</h3>
                <p className="text-sm text-stone-500 mt-1">{place.city.name}</p>
                <div className="flex gap-4 mt-3 text-sm text-stone-400">
                  <span className="flex items-center gap-1"><Heart className="w-4 h-4" />{place._count.favorites}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-stone-400">
          <MapPin className="w-12 h-12 mx-auto mb-3" />
          <p>还没有分享过地点</p>
        </div>
      )}
    </div>
  );
}
