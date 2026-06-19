import React, { useState } from 'react';
import { apiFetch } from '../utils/fetchHelper';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import type { Language } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { 
  Home, 
  Pill, 
  Stethoscope, 
  HeartPulse, 
  Truck, 
  ShoppingBag, 
  Camera, 
  Users, 
  ShoppingCart, 
  Globe, 
  Sun, 
  Moon, 
  LogOut, 
  Menu, 
  X,
  PhoneCall
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t, isBilingual, toggleBilingual } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/', labelKey: 'navHome', icon: Home },
    { path: '/medicines', labelKey: 'navMedicines', icon: Pill },
    { path: '/consult', labelKey: 'navConsult', icon: Stethoscope },
    { path: '/subscription', labelKey: 'navSubscription', icon: HeartPulse },
    { path: '/delivery', labelKey: 'navDelivery', icon: Truck },
    { path: '/orders', labelKey: 'navOrders', icon: ShoppingBag },
    { path: '/search', labelKey: 'navSearch', icon: Camera },
    { path: '/family', labelKey: 'navFamily', icon: Users },
  ];

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी (Hindi)' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'ml', label: 'മലയാളം (Malayalam)' },
    { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' }
  ];

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 w-full shadow-md no-print">
      {/* 1. Emergency Helpline Bar */}
      <div className="w-full bg-red-600 dark:bg-red-700 text-white text-xs md:text-sm py-2 px-4 flex items-center justify-center font-bold text-center border-b border-red-500/30 gap-2">
        <PhoneCall size={14} className="animate-bounce" />
        <a href="tel:108" className="hover:underline">{t('emergencyBar')}</a>
      </div>

      {/* 2. Main Navigation Header */}
      <div className="w-full bg-card text-card-foreground border-b border-border glass transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <span className="text-3xl text-primary font-black animate-pulse">🩺</span>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight leading-none text-primary">RuralCare</span>
              <span className="text-[10px] font-semibold text-muted-foreground tracking-widest uppercase">ग्रामीण स्वास्थ्य</span>
            </div>
          </div>

          {/* Desktop Nav Links (Pill Style) */}
          <nav className="hidden xl:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`
                  }
                >
                  <Icon size={14} />
                  <span>{t(link.labelKey)}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Quick Actions (Theme, Lang, Cart, Logout) */}
          <div className="flex items-center gap-2">
            
            {/* Bilingual View Toggle (Rural Assist) */}
            <button
              onClick={toggleBilingual}
              className={`hidden sm:flex text-[10px] font-bold px-2 py-1 rounded border transition-colors ${
                isBilingual 
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400' 
                  : 'bg-muted text-muted-foreground border-border'
              }`}
              title="Toggle Bilingual Text / द्विभाषिक दृश्य"
            >
              🌐 {isBilingual ? 'Bilingual ON' : 'Single Language'}
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative group">
              <button 
                className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm border border-border"
                title="Select Language"
              >
                <Globe size={18} />
                <span className="hidden sm:inline font-bold text-xs uppercase">{language}</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl overflow-hidden hidden group-hover:block z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code as Language);
                      // Sync with server if needed
                      apiFetch('/api/auth/update-lang', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user.id, language: lang.code })
                      });
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-muted transition-colors ${
                      language === lang.code ? 'text-primary bg-primary/5' : 'text-foreground'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground border border-border"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Cart Button with Count Badge */}
            <button
              onClick={() => navigate('/cart')}
              className="relative p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground border border-border flex items-center justify-center"
              title="View Cart"
            >
              <ShoppingCart size={18} />
              {getCartCount() > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full text-[9px] font-black w-5 h-5 flex items-center justify-center border-2 border-card animate-bounce">
                  {getCartCount()}
                </span>
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white transition-all text-xs font-bold"
              title="Log Out"
            >
              <LogOut size={14} />
              <span>{t('logout')}</span>
            </button>

            {/* Mobile Drawer Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground border border-border"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </div>

      {/* 3. Mobile Navigation Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-x-0 top-[104px] bottom-0 bg-slate-900/60 backdrop-blur-sm z-30" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="w-72 max-w-[80vw] h-full bg-card border-r border-border p-4 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <span className="font-black text-sm text-primary uppercase tracking-wider">{t('welcome').split(',')[0]}</span>
                {/* Mobile Bilingual toggle */}
                <button
                  onClick={toggleBilingual}
                  className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                    isBilingual 
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' 
                      : 'bg-muted text-muted-foreground border-border'
                  }`}
                >
                  🌐 {isBilingual ? 'Bilingual ON' : 'OFF'}
                </button>
              </div>
              
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                        }`
                      }
                    >
                      <Icon size={18} />
                      <span>{t(link.labelKey)}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-border space-y-3">
              {/* Logged in as */}
              <div className="px-4 py-2 bg-muted rounded-xl text-center">
                <span className="text-[10px] text-muted-foreground block">Logged in as</span>
                <span className="text-xs font-bold text-foreground">{user.name}</span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">{user.phone}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/95 flex items-center justify-center gap-2 text-sm font-bold shadow-md"
              >
                <LogOut size={16} />
                <span>{t('logout')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
