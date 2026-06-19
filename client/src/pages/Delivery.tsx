import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Truck, CheckCircle2, ShieldCheck, HeartHandshake, FileCheck } from 'lucide-react';

export const Delivery: React.FC = () => {
  const { t } = useLanguage();
  
  // Registration form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicleType: 'Bicycle',
    village: '',
    licenseNo: ''
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { name, phone, vehicleType, village, licenseNo } = formData;
    if (!name.trim() || !phone.trim() || !village.trim()) {
      setError('Please fill out all required fields / कृपया सभी आवश्यक जानकारी भरें।');
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError('Enter a valid 10-digit phone number / १० अंकों का सही फोन नंबर डालें।');
      return;
    }

    if (vehicleType !== 'Bicycle' && !licenseNo.trim()) {
      setError('Driving license number is required for motorized vehicles / वाहन के लिए ड्राइविंग लाइसेंस नंबर आवश्यक है।');
      return;
    }

    setLoading(true);
    // Simulate API registration post
    setTimeout(() => {
      setLoading(false);
      setFormSubmitted(true);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8 animate-in fade-in duration-300">
      
      {/* Page Title */}
      <div className="text-center space-y-2 max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-black tracking-tight">{t('delTitle')}</h1>
        <p className="text-xs md:text-base text-muted-foreground">
          {t('delSubtitle')}
        </p>
      </div>

      {/* Main split grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* LEFT SIDE: Requirements & Benefits info */}
        <div className="space-y-6">
          
          {/* Requirements block */}
          <div className="bg-card border border-border p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-black text-sm uppercase tracking-wider text-primary flex items-center gap-2">
              <ShieldCheck size={18} />
              {t('requirements')}
            </h3>
            
            <ul className="space-y-3 text-xs leading-normal">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground/90 font-medium">{t('reqAge')}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground/90 font-medium">{t('reqVehicle')}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground/90 font-medium">{t('reqLicense')}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground/90 font-medium">{t('reqPhone')}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground/90 font-medium">{t('reqArea')}</span>
              </li>
            </ul>
          </div>

          {/* Benefits block */}
          <div className="bg-card border border-border p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-black text-sm uppercase tracking-wider text-emerald-600 flex items-center gap-2">
              <HeartHandshake size={18} />
              {t('benefits')}
            </h3>
            
            <ul className="space-y-3 text-xs leading-normal">
              <li className="flex items-start gap-2.5">
                <span className="text-base flex-shrink-0 mt-0.5">⏱️</span>
                <span className="text-foreground/90 font-medium">{t('benHours')}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-base flex-shrink-0 mt-0.5">💰</span>
                <span className="text-foreground/90 font-medium">{t('benPayouts')}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-base flex-shrink-0 mt-0.5">🎁</span>
                <span className="text-foreground/90 font-medium">{t('benIncentives')}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-base flex-shrink-0 mt-0.5">🛡️</span>
                <span className="text-foreground/90 font-medium">{t('benSupport')}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* RIGHT SIDE: Interactive registration form */}
        <div className="bg-card border border-border p-6 md:p-8 rounded-3xl shadow-md">
          
          {formSubmitted ? (
            /* Success state message */
            <div className="text-center py-8 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                ✔️
              </div>
              <h3 className="font-black text-lg text-emerald-600 dark:text-emerald-400">
                Application Received!
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                {t('regSuccess')}
              </p>
              <button
                onClick={() => {
                  setFormData({ name: '', phone: '', vehicleType: 'Bicycle', village: '', licenseNo: '' });
                  setFormSubmitted(false);
                }}
                className="px-6 py-2 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl border border-border text-xs uppercase"
              >
                Apply Another
              </button>
            </div>
          ) : (
            /* Active Form Block */
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-black text-sm uppercase tracking-wider text-primary border-b border-border pb-2 flex items-center gap-1.5">
                <FileCheck size={16} />
                {t('registerFormTitle')} / पंजीकरण फॉर्म
              </h3>

              {error && (
                <div className="p-3 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold border border-red-500/20 text-center">
                  ⚠️ {error}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                  {t('regName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Ex: Ramesh Kumar"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                  {t('regPhone')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  pattern="[0-9]{10}"
                  placeholder="Ex: 9876543210"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                    {t('regVehicleType')}
                  </label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Bicycle">Bicycle / साइकिल</option>
                    <option value="Motorcycle">Motorcycle / मोटरसाइकिल</option>
                    <option value="Scooter">Scooter / स्कूटर</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                    {t('regVillage')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="village"
                    required
                    placeholder="Ex: Rampur Block"
                    value={formData.village}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {formData.vehicleType !== 'Bicycle' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                    {t('regLicenseNo')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="licenseNo"
                    required={formData.vehicleType !== 'Bicycle'}
                    placeholder="Ex: DL-1420210000000"
                    value={formData.licenseNo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary hover:bg-primary/95 text-primary-foreground font-black rounded-xl text-xs uppercase shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Truck size={16} />
                    <span>{t('regSubmit')}</span>
                  </>
                )}
              </button>

            </form>
          )}

        </div>

      </div>

    </div>
  );
};
