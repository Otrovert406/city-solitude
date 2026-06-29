import { useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { MapPin, PlusCircle, User, LogOut, Compass } from 'lucide-react';

export default function Layout() {
  const { user, fetchMe, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMe();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-primary">
            <Compass className="w-6 h-6" />
            <span className="hidden sm:inline">城市独处地图</span>
          </Link>

          <nav className="flex items-center gap-1 text-sm">
            <Link to="/map" className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">地图</span>
            </Link>

            {user ? (
              <>
                <Link to="/create" className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-stone-100 text-primary transition-colors">
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">发布</span>
                </Link>
                <Link to={`/profile/${user.id}`} className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user.username}</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors">登录</Link>
                <Link to="/register" className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors">注册</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-8 text-center text-sm text-stone-500">
        <p>🌿 每个城市都有属于你一个人的角落</p>
        <p className="mt-1">城市独处地图 &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
