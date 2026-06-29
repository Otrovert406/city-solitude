import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Upload, X, ImagePlus } from 'lucide-react';

export default function CreatePlace() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: '', description: '', address: '', latitude: 0, longitude: 0,
    category: 'OTHER', vibe: [] as string[], cityId: '', images: [] as string[],
  });
  const [uploading, setUploading] = useState(false);
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

  // Upload single image
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('图片大小不能超过 10MB');
      return;
    }

    setUploading(true);
    setError('');
    try {
      // Convert to base64 data URL
      const reader = new FileReader();
      reader.onload = async () => {
        const { data } = await api.post('/upload', { image: reader.result });
        setForm(f => ({ ...f, images: [...f.images, data.url] }));
        setUploading(false);
      };
      reader.onerror = () => { setError('读取图片失败'); setUploading(false); };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.response?.data?.error || '上传失败');
      setUploading(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (url: string) => {
    setForm(f => ({ ...f, images: f.images.filter(i => i !== url) }));
  };

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
      <h1 className="text-3xl font-bold mb-2">分享一个新地点</h1>
      <p className="text-stone-500 mb-8">拍下那个让你心动的角落，告诉更多人</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-stone-200 space-y-6">
        {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">照片（最多 6 张）</label>
          <div className="flex flex-wrap gap-3">
            {/* Existing images */}
            {form.images.map((url, i) => (
              <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden bg-stone-100 group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {/* Upload button */}
            {form.images.length < 6 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-24 h-24 rounded-xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center gap-1 text-stone-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <span className="text-xs">上传中…</span>
                ) : (
                  <>
                    <ImagePlus className="w-6 h-6" />
                    <span className="text-xs">添加照片</span>
                  </>
                )}
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleUpload}
            className="hidden"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">地点名称 *</label>
          <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="给这个地方起个名字"
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
            placeholder="这个地方为什么适合独处？有什么特别的体验？安静吗？人多吗？"
            className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">纬度</label>
            <input type="number" step="any" value={form.latitude || ''} onChange={e => setForm({ ...form, latitude: Number(e.target.value) })}
              placeholder="如 30.2590"
              className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">经度</label>
            <input type="number" step="any" value={form.longitude || ''} onChange={e => setForm({ ...form, longitude: Number(e.target.value) })}
              placeholder="如 120.1680"
              className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">地址</label>
          <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
            placeholder="如 杭州市西湖区满觉陇路"
            className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
        </div>

        <button type="submit" disabled={createMutation.isPending}
          className="w-full py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2">
          <Upload className="w-5 h-5" />
          {createMutation.isPending ? '发布中...' : '发布地点'}
        </button>
      </form>
    </div>
  );
}
