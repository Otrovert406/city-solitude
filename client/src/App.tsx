import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PlaceDetail from './pages/PlaceDetail';
import CreatePlace from './pages/CreatePlace';
import MapExplore from './pages/MapExplore';
import Profile from './pages/Profile';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/places/:id" element={<PlaceDetail />} />
        <Route path="/create" element={<CreatePlace />} />
        <Route path="/map" element={<MapExplore />} />
        <Route path="/profile/:id" element={<Profile />} />
      </Route>
    </Routes>
  );
}
