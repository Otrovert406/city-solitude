import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || '登录失败，请重试');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">登录</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200 space-y-5">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">邮箱</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">密码</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
          <button type="submit" className="w-full py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium">
            登录
          </button>
          <p className="text-center text-sm text-stone-500">
            还没有账号？<Link to="/register" className="text-primary hover:underline">注册</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
