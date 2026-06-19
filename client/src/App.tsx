import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Components & Pages
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Medicines } from './pages/Medicines';
import { Cart } from './pages/Cart';
import { Orders } from './pages/Orders';
import { Consult } from './pages/Consult';
import { Subscription } from './pages/Subscription';
import { Delivery } from './pages/Delivery';
import { Search } from './pages/Search';
import { Family } from './pages/Family';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';

// Protected Route Gate
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <div className="text-center space-y-1">
          <p className="text-sm font-bold">Connecting to RuralCare Network...</p>
          <p className="text-xs text-muted-foreground font-medium">ग्रामीण नेटवर्क से जुड़ रहे हैं...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Logged In Layout Wrapper
const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-all duration-300">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 pb-16">
        {children}
      </main>
      <footer className="w-full py-6 border-t border-border bg-card text-card-foreground text-center text-xs text-muted-foreground no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-semibold">
            © {new Date().getFullYear()} RuralCare Telemedicine Platform. All rights reserved.
          </p>
          <div className="flex gap-4 font-bold text-primary">
            <a href="#" className="hover:underline">Privacy Policy / गोपनीयता नीति</a>
            <span className="text-border">|</span>
            <a href="#" className="hover:underline">Terms of Service / नियम और शर्तें</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <Routes>
                {/* Public Auth Route */}
                <Route path="/login" element={<Login />} />

                {/* Authenticated Routes Guarded by ProtectedRoute */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Home />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/medicines"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Medicines />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Cart />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Orders />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/consult"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Consult />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/subscription"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Subscription />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/delivery"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Delivery />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/search"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Search />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/family"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Family />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Fallback 404 Route */}
                <Route
                  path="*"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <NotFound />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
