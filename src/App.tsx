import { HashRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import HomePage from './pages/home/HomePage';
import OrchidsPage from './pages/orchids/OrchidsPage';
import CalendarPage from './pages/calendar/CalendarPage';
import DiseasesPage from './pages/diseases/DiseasesPage';
import GardenPage from './pages/garden/GardenPage';
import WeatherPage from './pages/weather/WeatherPage';
import ShopPage from './pages/shop/ShopPage';
import AdminPage from './pages/admin/AdminPage';
import OrderPage from './pages/order/OrderPage';
import PropagationPage from './pages/propagation/PropagationPage';
import CostsPage from './pages/costs/CostsPage';
import CommunityPage from './pages/community/CommunityPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import SensorPage from './pages/sensor/SensorPage';
import PrivacyPolicyPage from './pages/privacy/PrivacyPolicyPage';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/orchids" element={<OrchidsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/diseases" element={<DiseasesPage />} />
        <Route path="/garden" element={<GardenPage />} />
        <Route path="/weather" element={<WeatherPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/propagation" element={<PropagationPage />} />
        <Route path="/costs" element={<CostsPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/sensors" element={<SensorPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
