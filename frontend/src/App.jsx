import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Analytics from './pages/Analytics';
import Products from './pages/Products';
import AiAssistant from './pages/AiAssistant';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkout/:orderId" element={<Checkout />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/:phone" element={<CustomerDetail />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/products" element={<Products />} />
              <Route path="/ai" element={<AiAssistant />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
