import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Upload } from 'lucide-react';

export default function CreatePlace() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', address: '', latitude: 0, longitude: 0,
    category: 'OTHER', vibe: [] as string[], cityId: '', images: [] as string[],
  });
  const [error, setError] = useState('');

  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: () => api.get('/cities').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/places', data),
    onSuccess: (res) => navigate(`/places/${res.data.id}`),
    onError: (err: any) => setError(err.response?.data?.error || '发布失败'),
  });

  const categories = [
    { key: 'CAFE', label: '咖啡馆' }, { key: 'BOOKSTORE', label: '书店' },
    { key: 'PARK', label: '公园' }, { key: 'LIBRARY', label: '图书馆' },
    { key: 'MUSEUM', label: '博物馆' }, { key: 'VIEWPOINT', label: '观景点' },
    { key: 'RESTAURANT', label: '一人食' }, { key: 'OTHER', label: '其他' },
  ];

  const vibes = [
    { key: 'QUIET', label: '安静' }, { key: 'HEALING', label: '治愈' },
    { key: 'LITERARY', label: '文艺' }, { key: 'NATURE', label: '自然' },
    { key: 'COZY', label: '温馨' }, { key: 'MINIMAL', label: '极简' },
  ];

  const toggleVibe = (key: string) => {
    setForm(f => ({
      ...f,
      vibe: f.vibe.includes(key) ? f.vibe.filter(v => v !== key) : [...f.vibe, key],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    createMutation.mutate(form);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">分享一个新地点</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-stone-200 space-y-6">
        {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">地点名称 *</label>
          <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">城市 *</label>
            <select required value={form.cityId} onChange={e => setForm({ ...form, cityId: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white">
              <option value="">选择城市</option>
              {cities?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name} · {c.province}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">分类 *</label>
            <select required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white">
              {categories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">氛围标签</label>
          <div className="flex flex-wrap gap-2">
            {vibes.map(v => (
              <button key={v.key} type="button" onClick={() => toggleVibe(v.key)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  form.vibe.includes(v.key)
                    ? 'bg-primary text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >{v.label}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">详细描述 *</label>
          <textarea required rows={5} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="这个地方为什么适合独处？有什么特别的体验？"
            className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">纬度</label>
            <input type="number" step="any" value={form.latitude || ''} onChange={e => setForm({ ...form, latitude: Number(e.target.value) })}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">经度</label>
            <input type="number" step="any" value={form.longitude || ''} onChange={e => setForm({ ...form, longitude: Number(e.target.value) })}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">地址</label>
          <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
        </div>

        <button type="submit" disabled={createMutation.isPending}
          className="w-full py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium disabled:opacity-50">
          {createMutation.isPending ? '发布中...' : '发布地点'}
        </button>
      </form>
    </div>
  );
}
