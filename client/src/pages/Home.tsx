import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Stethoscope, 
  Pill, 
  Camera, 
  Users, 
  PhoneCall, 
  Heart,
  Calendar,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const Home: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const services = [
    {
      titleKey: 'callDoctorNow',
      desc: 'Talk to city hospital specialists over video call from your home / घर बैठे वीडियो कॉल पर शहर के डॉक्टरों से बात करें।',
      icon: Stethoscope,
      color: 'from-blue-500 to-cyan-500',
      shadowColor: 'shadow-blue-500/20',
      path: '/consult'
    },
    {
      titleKey: 'orderMedsNow',
      desc: 'Browse and order authentic generic medicines with free village delivery / मुफ़्त गाँव डिलीवरी के साथ जेनेरिक दवाएं मंगाएं।',
      icon: Pill,
      color: 'from-emerald-500 to-teal-500',
      shadowColor: 'shadow-emerald-500/20',
      path: '/medicines'
    },
    {
      titleKey: 'imageSearchNow',
      desc: 'Search medicines by taking a photo of prescriptions or boxes / पर्चे या पैकेट की फोटो खींचकर दवाइयों की पहचान करें।',
      icon: Camera,
      color: 'from-purple-500 to-indigo-500',
      shadowColor: 'shadow-purple-500/20',
      path: '/search'
    },
    {
      titleKey: 'manageFamilyNow',
      desc: 'Create and manage health profiles for all family members / एक ही खाते में पूरे परिवार का स्वास्थ्य विवरण दर्ज करें।',
      icon: Users,
      color: 'from-amber-500 to-orange-500',
      shadowColor: 'shadow-amber-500/20',
      path: '/family'
    }
  ];

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Welcoming Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 md:p-10 shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden md:block">
          <Heart size={200} />
        </div>
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
            <Sparkles size={12} />
            <span>Digital Village Health Node</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            {t('welcome').split(',')[0]}, <span className="text-yellow-300">{user.name}</span>!
          </h1>
          <p className="text-sm md:text-lg font-medium text-blue-100">
            {t('homeSubtitle')}
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <div className="flex items-center gap-1 bg-black/15 px-3 py-1.5 rounded-full text-xs font-semibold">
              <ShieldCheck size={14} className="text-green-300" />
              <span>Govt. Certified Doctors</span>
            </div>
            <div className="flex items-center gap-1 bg-black/15 px-3 py-1.5 rounded-full text-xs font-semibold">
              <span>📍</span>
              <span>Village Node: Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Core Service Options */}
      <div className="space-y-4">
        <h2 className="text-lg md:text-xl font-black text-foreground/90 uppercase tracking-wide">
          Our Services / हमारी सेवाएं
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((srv, index) => {
            const Icon = srv.icon;
            return (
              <div 
                key={index}
                className={`group cursor-pointer bg-card border border-border p-6 rounded-3xl shadow-md ${srv.shadowColor} hover:shadow-lg hover:border-primary/30 transform hover:-translate-y-1 transition-all duration-300 flex items-start gap-4`}
                onClick={() => navigate(srv.path)}
              >
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${srv.color} text-white flex-shrink-0 shadow-md`}>
                  <Icon size={28} />
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="text-lg font-black text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                    {t(srv.titleKey)}
                    <span className="text-xs group-hover:translate-x-1 transition-transform">➔</span>
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {srv.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Emergency & Health Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Health Tip Banner */}
        <div className="lg:col-span-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/5 dark:to-teal-500/5 border border-emerald-500/20 rounded-3xl p-6 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <Calendar size={18} />
              <span className="uppercase tracking-wider">{t('healthTipTitle')} / आज का स्वास्थ्य सुझाव</span>
            </div>
            <p className="text-sm md:text-base font-semibold leading-relaxed text-foreground/90">
              "{t('healthTipContent')}"
            </p>
          </div>
          <span className="text-[10px] text-muted-foreground">Updated daily by RuralCare Public Health Team</span>
        </div>

        {/* Quick Emergency Dial Grid */}
        <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
          <h3 className="font-black text-sm uppercase tracking-wider text-red-500 flex items-center gap-2">
            <PhoneCall size={16} />
            {t('emergencyContact')} / आपातकालीन डायल
          </h3>
          
          <div className="space-y-3">
            <a 
              href="tel:108" 
              className="block p-3 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 hover:bg-red-100 transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-red-600 dark:text-red-400">{t('ambulance108')}</span>
                <span className="text-lg">📞</span>
              </div>
            </a>
            
            <a 
              href="tel:18003098800" 
              className="block p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-border hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('ruralCareTollFree')}</span>
                <span className="text-lg">📞</span>
              </div>
            </a>
          </div>
        </div>

      </div>

    </div>
  );
};
