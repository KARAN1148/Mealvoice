import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { DemoModeProvider, useDemoMode } from './context/DemoModeContext';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import DemoToolbar from './components/common/DemoToolbar';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RestaurantListPage from './pages/RestaurantListPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import EasyOrderPage from './pages/EasyOrderPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import CustomerProfilePage from './pages/CustomerProfilePage';
import SupportPage from './pages/SupportPage';
import AgentDashboardPage from './pages/AgentDashboardPage';
import RestaurantDashboardPage from './pages/RestaurantDashboardPage';
import RiderDashboardPage from './pages/RiderDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

// Toast Notification Bar
const NotificationBar: React.FC = () => {
  const { lastNotification } = useDemoMode();
  if (!lastNotification) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top">
      <div className="bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-3 border border-emerald-500 max-w-xl">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-200 animate-ping" />
        <span>{lastNotification}</span>
      </div>
    </div>
  );
};

// Route guard for role-specific pages
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user, isLoading, switchRoleDemo } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500 font-bold">
        Checking session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const roleEmails: Record<string, string> = {
      CALL_AGENT: 'agent@mealvoice.demo',
      RESTAURANT_ADMIN: 'restaurant@mealvoice.demo',
      RIDER: 'rider@mealvoice.demo',
      OPERATIONS_ADMIN: 'admin@mealvoice.demo',
      CUSTOMER: 'customer@mealvoice.demo',
    };

    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-2xl font-black">
          🔒
        </div>
        <h2 className="text-3xl font-black text-gray-900">Dashboard Access Required</h2>
        <p className="text-gray-600 font-semibold">
          You are currently logged in as <span className="px-2 py-1 rounded bg-gray-200 text-gray-800 font-bold text-xs uppercase">{user.role.replace('_', ' ')}</span>.
          <br />This page requires the <span className="px-2 py-1 rounded bg-amber-200 text-amber-900 font-bold text-xs uppercase">{allowedRoles.join(', ').replace(/_/g, ' ')}</span> role.
        </p>

        <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-xl">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            ⚡ One-Tap Demo Switcher
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {allowedRoles.map((role) => (
              <button
                key={role}
                onClick={async () => {
                  if (roleEmails[role]) {
                    await switchRoleDemo(roleEmails[role]);
                    window.location.reload();
                  }
                }}
                className="px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 font-extrabold text-sm text-white shadow-lg transition-all flex items-center gap-2"
              >
                <span>Switch to {role.replace('_', ' ')} Role</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Layout wrapper for customer-facing pages (with Navbar + Footer)
const CustomerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-gray-50">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

// Layout wrapper for dashboard pages (Navbar only)
const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-gray-100">
    <Navbar />
    <main className="flex-1">{children}</main>
  </div>
);

const AppRoutes: React.FC = () => {
  return (
    <>
      <NotificationBar />
      <DemoToolbar />

      <Routes>
        {/* Public Customer Routes */}
        <Route path="/" element={<CustomerLayout><LandingPage /></CustomerLayout>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/restaurants" element={<CustomerLayout><RestaurantListPage /></CustomerLayout>} />
        <Route path="/restaurant/:id" element={<CustomerLayout><RestaurantDetailPage /></CustomerLayout>} />
        <Route path="/cart" element={<CustomerLayout><CartPage /></CustomerLayout>} />
        <Route path="/easy-order" element={<CustomerLayout><EasyOrderPage /></CustomerLayout>} />
        <Route path="/support" element={<CustomerLayout><SupportPage /></CustomerLayout>} />

        {/* Protected Customer Routes */}
        <Route path="/checkout" element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomerLayout><CheckoutPage /></CustomerLayout>
          </ProtectedRoute>
        } />
        <Route path="/orders/:id" element={<CustomerLayout><OrderTrackingPage /></CustomerLayout>} />
        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomerLayout><CustomerProfilePage /></CustomerLayout>
          </ProtectedRoute>
        } />

        {/* Call Agent Dashboard */}
        <Route path="/agent" element={
          <ProtectedRoute allowedRoles={['CALL_AGENT', 'SUPER_ADMIN', 'OPERATIONS_ADMIN']}>
            <DashboardLayout><AgentDashboardPage /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Restaurant Admin Dashboard */}
        <Route path="/restaurant" element={
          <ProtectedRoute allowedRoles={['RESTAURANT_ADMIN', 'SUPER_ADMIN', 'OPERATIONS_ADMIN']}>
            <DashboardLayout><RestaurantDashboardPage /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Rider Dashboard */}
        <Route path="/rider" element={
          <ProtectedRoute allowedRoles={['RIDER', 'SUPER_ADMIN', 'OPERATIONS_ADMIN']}>
            <DashboardLayout><RiderDashboardPage /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Operations Admin Dashboard */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['OPERATIONS_ADMIN', 'SUPER_ADMIN']}>
            <DashboardLayout><AdminDashboardPage /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AccessibilityProvider>
        <AuthProvider>
          <CartProvider>
            <DemoModeProvider>
              <AppRoutes />
            </DemoModeProvider>
          </CartProvider>
        </AuthProvider>
      </AccessibilityProvider>
    </BrowserRouter>
  );
}

export default App;