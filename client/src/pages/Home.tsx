import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Search, MapPin, Heart, MessageCircle } from 'lucide-react';

export default function Home() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['places', search, category, page],
    queryFn: () => api.get('/places', { params: { search, category, page, limit: 12 } }).then(r => r.data),
  });

  const categories = [
    { key: '', label: '全部' },
    { key: 'CAFE', label: '咖啡馆' },
    { key: 'BOOKSTORE', label: '书店' },
    { key: 'PARK', label: '公园' },
    { key: 'LIBRARY', label: '图书馆' },
    { key: 'MUSEUM', label: '博物馆' },
    { key: 'VIEWPOINT', label: '观景点' },
    { key: 'RESTAURANT', label: '一人食' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-stone-800 mb-4">
          发现你的城市角落
        </h1>
        <p className="text-stone-500 text-lg mb-8">
          安静的地方，留给想独处的你
        </p>

        {/* Search */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            placeholder="搜索地点、城市..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {categories.map(c => (
          <button
            key={c.key}
            onClick={() => { setCategory(c.key); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              category === c.key
                ? 'bg-primary text-white'
                : 'bg-white border border-stone-200 hover:border-primary hover:text-primary'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Place cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.places.map((place: any) => (
              <Link
                key={place.id}
                to={`/places/${place.id}`}
                className="group bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-stone-300 hover:shadow-lg transition-all"
              >
                {/* Image */}
                <div className="h-48 bg-stone-100 overflow-hidden">
                  {place.images?.[0] ? (
                    <img src={place.images[0]} alt={place.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                      <MapPin className="w-12 h-12" />
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-stone-800 group-hover:text-primary transition-colors">{place.title}</h3>
                  </div>
                  <p className="text-sm text-stone-500 mt-1">
                    {place.city.name} · {place.city.province}
                  </p>
                  <p className="text-sm text-stone-600 mt-2 line-clamp-2">{place.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-stone-400">
                    <span className="flex items-center gap-1"><Heart className="w-4 h-4" />{place._count.favorites}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" />{place._count.reviews}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: data.totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-lg text-sm transition-colors ${
                    page === i + 1 ? 'bg-primary text-white' : 'bg-white border border-stone-200 hover:border-primary'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}

          {data?.places.length === 0 && (
            <div className="text-center py-20 text-stone-400">
              <MapPin className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg">还没有地点，来做第一个分享的人吧</p>
              <Link to="/create" className="inline-block mt-4 text-primary hover:underline">发布地点</Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
