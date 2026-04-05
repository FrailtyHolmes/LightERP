import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import Login from './pages/Login';
import Register from './pages/Register';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import InvoiceList from './pages/Invoice';
import PaymentList from './pages/Payment';
import PenaltyList from './pages/Penalty';
import Query from './pages/Query';
import Admin from './pages/Admin';

// 路由守卫组件
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

function App() {
  const { user, setUser } = useAuthStore();

  // 从session检查登录状态 (页面刷新后保持登录)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/v1/auth/current', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.code === 200 && data.data) {
            setUser(data.data);
          }
        }
      } catch {
        // 未登录
      }
    };
    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* 公开路由 */}
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />

        {/* 受保护的路由 */}
        <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="invoice" element={<InvoiceList />} />
          <Route path="payment" element={<PaymentList />} />
          <Route path="penalty" element={<PenaltyList />} />
          <Route path="query" element={<Query />} />
          <Route path="admin" element={<Admin />} />
        </Route>

        {/* 默认跳转 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;