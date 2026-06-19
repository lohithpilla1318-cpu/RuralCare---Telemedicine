import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Phone, User, CheckCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !phone.trim()) {
      setError(t('requiredFields'));
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number / कृपया १० अंकों का सही मोबाइल नंबर डालें।');
      return;
    }

    setLoading(true);
    // Simulate SMS OTP delay
    setTimeout(() => {
      setLoading(false);
      setShowOtpField(true);
    }, 1000);
  };

  const handleVerifyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp.trim()) {
      setError('Please enter the OTP / कृपया ओटीपी दर्ज करें।');
      return;
    }

    if (otp !== '1234' && otp !== '123456' && otp.length < 4) {
      setError('Incorrect OTP (Enter 1234 to verify) / गलत ओटीपी (सत्यापित करने के लिए 1234 डालें)');
      return;
    }

    setLoading(true);
    const success = await login(name, phone);
    setLoading(false);

    if (success) {
      navigate('/');
    } else {
      setError('Authentication failed. Server error. / लॉगिन विफल रहा। सर्वर त्रुटि।');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 transition-all duration-300">
      <div className="w-full max-w-md bg-card text-card-foreground p-6 md:p-8 rounded-3xl shadow-xl border border-border">
        
        {/* Branding header */}
        <div className="text-center mb-6">
          <span className="text-5xl block animate-bounce mb-2">🩺</span>
          <h2 className="text-2xl md:text-3xl font-black text-primary tracking-tight">{t('loginTitle')}</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">{t('loginSubtitle')}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold border border-red-500/20 text-center">
            ⚠️ {error}
          </div>
        )}

        {!showOtpField ? (
          /* Phone & Name inputs form */
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground/80 mb-1.5">{t('nameLabel')}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  required
                  placeholder={t('namePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-bold placeholder:text-muted-foreground/60 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground/80 mb-1.5">{t('phoneLabel')}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                  <Phone size={16} />
                </span>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  placeholder={t('phonePlaceholder')}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-bold placeholder:text-muted-foreground/60 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary/95 text-primary-foreground font-black rounded-xl shadow-md active:scale-95 transition-all text-sm uppercase tracking-wider disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending SMS...
                </span>
              ) : (
                t('loginBtn')
              )}
            </button>
          </form>
        ) : (
          /* OTP verification form */
          <form onSubmit={handleVerifyLogin} className="space-y-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-center text-xs font-semibold mb-2">
              📲 OTP sent to {phone}. Enter <strong>1234</strong> to bypass.
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground/80 mb-1.5">
                Enter 4-Digit OTP / ओटीपी दर्ज करें
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="Ex: 1234"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-center text-xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowOtpField(false)}
                className="flex-1 py-3 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl border border-border active:scale-95 transition-all text-xs"
              >
                ← Back / पीछे
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md active:scale-95 transition-all text-xs uppercase tracking-wider"
              >
                Verify & Login
              </button>
            </div>
          </form>
        )}

        {/* Informative helper footnotes */}
        <div className="mt-6 pt-4 border-t border-border flex items-start gap-2 text-[10px] text-muted-foreground leading-relaxed">
          <CheckCircle size={14} className="text-primary flex-shrink-0 mt-0.5" />
          <p>
            By logging in, you agree to access certified government healthcare listings, local delivery hubs, and verify prescriptions safely under Indian Telemedicine Guidelines 2020.
          </p>
        </div>

      </div>
    </div>
  );
};
