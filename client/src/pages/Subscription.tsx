import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Check, Star, Shield, Heart, Award } from 'lucide-react';

export const Subscription: React.FC = () => {
  const { user, updateSubscription } = useAuth();
  const { t } = useLanguage();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  if (!user) return null;

  const plans = [
    {
      id: 'none',
      nameKey: 'planNone',
      price: 0,
      period: 'lifetime',
      icon: Heart,
      color: 'border-border',
      headerBg: 'bg-muted/50',
      btnColor: 'bg-muted hover:bg-muted/90 text-foreground',
      benefits: [
        'Pay standard consultation fees (₹150 - ₹300)',
        'Pay standard village delivery fees (₹20 per delivery)',
        'Access all generic medicine catalogs',
        'Call support services during working hours'
      ]
    },
    {
      id: 'basic',
      nameKey: 'planBasic',
      price: 49,
      period: 'month',
      icon: Shield,
      color: 'border-blue-500/30 dark:border-blue-500/20',
      headerBg: 'bg-blue-500/5',
      btnColor: 'bg-primary hover:bg-primary/95 text-primary-foreground',
      benefits: [
        '1 Free doctor consultation every month',
        'Subsequent consultations at 20% off',
        'Free medicine delivery for orders above ₹100',
        'Priority booking with block physicians'
      ]
    },
    {
      id: 'family',
      nameKey: 'planFamily',
      price: 99,
      period: 'month',
      icon: Star,
      color: 'border-emerald-500/40 dark:border-emerald-500/20 shadow-md shadow-emerald-500/5',
      headerBg: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/5 dark:text-emerald-400',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      badge: 'Popular / लोकप्रिय',
      benefits: [
        'Unlimited free medicine delivery to your home',
        '3 Free doctor consultations every month',
        'All consultations at 50% discount afterwards',
        'Covers up to 5 family members under one plan'
      ]
    },
    {
      id: 'village',
      nameKey: 'planVillage',
      price: 199,
      period: 'month',
      icon: Award,
      color: 'border-amber-500/30 dark:border-amber-500/20',
      headerBg: 'bg-amber-500/5',
      btnColor: 'bg-amber-600 hover:bg-amber-700 text-white',
      benefits: [
        'Unlimited free medicine delivery (No min order)',
        'Unlimited free doctor consultations (All languages)',
        'Extra 10% discount on all medicine orders',
        'Covers unlimited family dependents',
        'Free blood pressure/sugar checkup camps access'
      ]
    }
  ];

  const handleSubscribe = async (planId: any) => {
    setLoadingPlan(planId);
    // Simulate payment clearing delay
    setTimeout(async () => {
      await updateSubscription(planId);
      setLoadingPlan(null);
      alert('Subscription plan successfully updated! / आपकी स्वास्थ्य योजना सफलतापूर्वक सक्रिय कर दी गई है!');
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-4xl font-black tracking-tight">{t('subTitle')}</h1>
        <p className="text-xs md:text-base text-muted-foreground max-w-2xl mx-auto">
          {t('subSubtitle')}
        </p>
      </div>

      {/* Subscription Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isActive = user.subscription === plan.id;
          const isLoading = loadingPlan === plan.id;

          return (
            <div 
              key={plan.id}
              className={`bg-card border-2 rounded-3xl overflow-hidden flex flex-col justify-between relative transition-all ${plan.color} ${
                isActive ? 'ring-2 ring-primary border-primary scale-102 shadow-lg' : 'hover:-translate-y-1'
              }`}
            >
              {plan.badge && (
                <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                  {plan.badge}
                </span>
              )}

              {/* Header block */}
              <div className={`p-5 space-y-3 ${plan.headerBg} border-b border-border/80`}>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-card border border-border/80 text-primary">
                    <Icon size={18} />
                  </div>
                  <h3 className="font-black text-sm text-foreground leading-none">{t(plan.nameKey)}</h3>
                </div>
                <div>
                  <span className="text-2xl font-black text-foreground">₹{plan.price}</span>
                  <span className="text-xs text-muted-foreground"> / {plan.period}</span>
                </div>
              </div>

              {/* Benefit List */}
              <div className="p-5 flex-1 space-y-3">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block">Benefits:</span>
                <ul className="space-y-2">
                  {plan.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs">
                      <Check size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/90 leading-normal">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Button */}
              <div className="p-5 border-t border-border/80 bg-muted/20">
                {isActive ? (
                  <div className="w-full py-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-default">
                    <span>✔️</span>
                    <span>{t('currentPlan').split(' ')[0]}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isLoading || !!loadingPlan}
                    className={`w-full py-2.5 rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all ${plan.btnColor} disabled:opacity-50`}
                  >
                    {isLoading ? (
                      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>💳</span>
                        <span>{t('subscribeBtn').split(' ')[0]}</span>
                      </>
                    )}
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
