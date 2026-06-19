import React, { useState } from 'react';
import { apiFetch } from '../utils/fetchHelper';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Trash2, Plus, Minus, CreditCard, Wallet, ShieldCheck, MapPin } from 'lucide-react';

export const Cart: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartSubtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Checkout workflow states
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Wallet' | 'COD'>('UPI');
  
  // Shipping form fields
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    village: '',
    panchayat: '',
    district: '',
    state: '',
    pincode: ''
  });

  // Modal / simulation states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [latestOrderId, setLatestOrderId] = useState('');
  const [formError, setFormError] = useState('');

  if (!user) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckoutNext = () => {
    setFormError('');
    if (cartItems.length === 0) return;
    setStep('checkout');
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Field validations
    const { fullName, phone, village, panchayat, district, state, pincode } = address;
    if (!fullName || !phone || !village || !panchayat || !district || !state || !pincode) {
      setFormError('Please fill out all address details / कृपया पूरा पता दर्ज करें।');
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      setFormError('Please enter a valid 6-digit Pincode / कृपया सही ६ अंकों का पिनकोड डालें।');
      return;
    }

    // Trigger payment modal or directly process COD
    if (paymentMethod === 'COD') {
      submitOrderToServer();
    } else {
      setShowPaymentModal(true);
    }
  };

  const submitOrderToServer = async () => {
    setIsSimulatingPayment(true);
    try {
      const orderPayload = {
        userId: user.id,
        items: cartItems,
        total: getCartSubtotal(),
        paymentMethod,
        shippingAddress: address
      };

      const res = await apiFetch('/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.order) {
          setLatestOrderId(data.order.id);
          setShowPaymentModal(false);
          setShowSuccessOverlay(true);
          clearCart();
        } else {
          setFormError('Failed to place order. Try again. / ऑर्डर करने में विफल। दोबारा प्रयास करें।');
        }
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setFormError('Network error. Check backend server. / नेटवर्क त्रुटि। सर्वर की जांच करें।');
    } finally {
      setIsSimulatingPayment(false);
    }
  };

  const handleSimulationOutcome = (success: boolean) => {
    if (success) {
      submitOrderToServer();
    } else {
      alert('Simulated transaction rejected! Please choose another payment method. / सिमुलेशन अस्वीकार किया गया। दूसरा विकल्प चुनें।');
      setShowPaymentModal(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* 1. Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">
          {step === 'cart' ? t('cartTitle') : t('checkoutTitle')}
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
          {step === 'cart' 
            ? 'Review and manage your medications before village dispatch / अपने ऑर्डर की जांच करें।'
            : 'Enter village delivery address and settle payment / डिलीवरी का पता भरें।'
          }
        </p>
      </div>

      {cartItems.length === 0 && !showSuccessOverlay ? (
        /* Empty Cart Block */
        <div className="min-h-[45vh] border border-dashed border-border rounded-3xl p-8 flex flex-col items-center justify-center text-center">
          <span className="text-7xl mb-4 animate-bounce">🛒</span>
          <h2 className="text-lg font-bold mb-2">{t('emptyCart').split('/')[0]}</h2>
          <p className="text-xs text-muted-foreground max-w-sm mb-6">
            {t('emptyCart')}
          </p>
          <button
            onClick={() => navigate('/medicines')}
            className="px-6 py-3 bg-primary hover:bg-primary/95 text-primary-foreground font-black rounded-xl shadow-lg active:scale-95 transition-all text-xs uppercase"
          >
            ← Browse Medicines / दवाइयाँ देखें
          </button>
        </div>
      ) : (
        /* Active Cart layout split */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT SIDE: Items or Form */}
          <div className="lg:col-span-2 space-y-4">
            
            {step === 'cart' ? (
              /* Itemized Cart List */
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div 
                    key={item.medicineId} 
                    className="bg-card border border-border p-4 rounded-2xl shadow-sm flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-foreground">{item.name}</h4>
                      <p className="text-[10px] text-muted-foreground italic">Generic: {item.genericName}</p>
                      <p className="text-xs font-black text-primary">₹{item.price} <span className="text-[10px] text-muted-foreground font-normal">per unit</span></p>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center bg-muted border border-border rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(item.medicineId, item.quantity - 1)}
                          className="p-1 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground transition-all"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.medicineId, item.quantity + 1)}
                          className="p-1 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground transition-all"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Trash Delete */}
                      <button
                        onClick={() => removeFromCart(item.medicineId)}
                        className="p-2 text-destructive/80 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                        title="Delete Item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Shipping Address & Payment Selection Form */
              <form onSubmit={handlePlaceOrder} className="bg-card border border-border p-6 rounded-3xl shadow-sm space-y-6">
                
                {formError && (
                  <div className="p-3 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold border border-red-500/20 text-center">
                    ⚠️ {formError}
                  </div>
                )}

                {/* Section title */}
                <div className="space-y-3">
                  <h3 className="font-black text-sm uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <MapPin size={16} />
                    Village Shipping Address / डिलीवरी का पता
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">{t('fullName')}</label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={address.fullName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={address.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">{t('village')}</label>
                      <input
                        type="text"
                        name="village"
                        required
                        placeholder="Ex: Rampur"
                        value={address.village}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">{t('panchayat')}</label>
                      <input
                        type="text"
                        name="panchayat"
                        required
                        placeholder="Ex: Rampur Gram Panchayat"
                        value={address.panchayat}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">{t('district')}</label>
                      <input
                        type="text"
                        name="district"
                        required
                        placeholder="Ex: Varanasi"
                        value={address.district}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">{t('state')}</label>
                      <input
                        type="text"
                        name="state"
                        required
                        placeholder="Ex: Uttar Pradesh"
                        value={address.state}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">{t('pincode')}</label>
                      <input
                        type="text"
                        name="pincode"
                        required
                        maxLength={6}
                        placeholder="Ex: 221001"
                        value={address.pincode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment method section */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <h3 className="font-black text-sm uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <CreditCard size={16} />
                    {t('selectPayment')} / भुगतान का तरीका
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* UPI */}
                    <div 
                      onClick={() => setPaymentMethod('UPI')}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                        paymentMethod === 'UPI' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
                      }`}
                    >
                      <span className="text-xl">📲</span>
                      <div>
                        <span className="font-bold text-xs block">{t('upiPay').split('(')[0]}</span>
                        <span className="text-[9px] text-muted-foreground">Google Pay / PhonePe / Paytm</span>
                      </div>
                    </div>

                    {/* COD */}
                    <div 
                      onClick={() => setPaymentMethod('COD')}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                        paymentMethod === 'COD' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
                      }`}
                    >
                      <span className="text-xl">💵</span>
                      <div>
                        <span className="font-bold text-xs block">{t('codPay').split('(')[0]}</span>
                        <span className="text-[9px] text-muted-foreground">Pay cash when medicines arrive</span>
                      </div>
                    </div>

                    {/* Cards */}
                    <div 
                      onClick={() => setPaymentMethod('Card')}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                        paymentMethod === 'Card' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
                      }`}
                    >
                      <CreditCard size={18} className="text-muted-foreground" />
                      <div>
                        <span className="font-bold text-xs block">{t('cardPay').split('/')[0]}</span>
                        <span className="text-[9px] text-muted-foreground">Visa, RuPay, MasterCard</span>
                      </div>
                    </div>

                    {/* Wallet */}
                    <div 
                      onClick={() => setPaymentMethod('Wallet')}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                        paymentMethod === 'Wallet' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
                      }`}
                    >
                      <Wallet size={18} className="text-muted-foreground" />
                      <div>
                        <span className="font-bold text-xs block">{t('walletPay')}</span>
                        <span className="text-[9px] text-muted-foreground">Airtel Money, JioMoney, Amazon Pay</span>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setStep('cart')}
                    className="flex-1 py-3 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl border border-border active:scale-95 transition-all text-xs"
                  >
                    ← Edit Cart / पीछे
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-3 bg-primary hover:bg-primary/95 text-primary-foreground font-black rounded-xl shadow-md active:scale-95 transition-all text-xs uppercase"
                  >
                    {paymentMethod === 'COD' ? t('placeOrder') : 'Proceed to Payment / भुगतान करें'}
                  </button>
                </div>

              </form>
            )}

          </div>

          {/* RIGHT SIDE: Cart Order pricing Summary */}
          <div className="space-y-4">
            <div className="bg-card border border-border p-5 rounded-3xl shadow-sm space-y-4">
              <h3 className="font-black text-sm uppercase tracking-wider border-b border-border pb-2">
                Order Summary / बिल विवरण
              </h3>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('itemTotal')}:</span>
                  <span className="font-bold">₹{getCartSubtotal()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('deliveryCharges')}:</span>
                  <span className="text-green-600 font-bold">{t('free')}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between text-sm font-black">
                  <span className="text-foreground">{t('totalPayable')}:</span>
                  <span className="text-primary">₹{getCartSubtotal()}</span>
                </div>
              </div>

              {step === 'cart' && (
                <button
                  onClick={handleCheckoutNext}
                  className="w-full py-3 bg-primary hover:bg-primary/95 text-primary-foreground font-black rounded-xl shadow-md active:scale-95 transition-all text-xs uppercase"
                >
                  {t('proceedCheckout')}
                </button>
              )}
            </div>

            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/5 dark:to-teal-500/5 border border-emerald-500/20 rounded-3xl p-5 flex items-start gap-2.5">
              <ShieldCheck className="text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" size={18} />
              <div className="text-[10px] leading-relaxed text-muted-foreground">
                <strong>100% Genuine Guarantee:</strong> Medicines are stored in temperature-controlled nodes under licensed block pharmacists and delivered by local village delivery partners.
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 2. Interactive UPI Payment Simulation Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-card text-card-foreground p-6 rounded-3xl border border-border shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div>
              <h3 className="font-black text-base text-foreground">{t('paymentModalTitle')}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">{t('paymentModalBody')}</p>
            </div>

            {paymentMethod === 'UPI' ? (
              <div className="space-y-4">
                {/* Simulated QR Code */}
                <div className="w-40 h-40 bg-white border border-slate-200 p-2 mx-auto rounded-xl flex flex-col items-center justify-center gap-1 shadow-inner relative group">
                  {/* Mock QR Drawing with clean CSS */}
                  <div className="grid grid-cols-4 gap-1 w-28 h-28 opacity-80">
                    <div className="bg-slate-900 rounded-sm" /><div className="bg-slate-900 rounded-sm" /><div className="bg-slate-200 rounded-sm" /><div className="bg-slate-900 rounded-sm" />
                    <div className="bg-slate-200 rounded-sm" /><div className="bg-slate-900 rounded-sm" /><div className="bg-slate-900 rounded-sm" /><div className="bg-slate-200 rounded-sm" />
                    <div className="bg-slate-900 rounded-sm" /><div className="bg-slate-200 rounded-sm" /><div className="bg-slate-900 rounded-sm" /><div className="bg-slate-900 rounded-sm" />
                    <div className="bg-slate-900 rounded-sm" /><div className="bg-slate-900 rounded-sm" /><div className="bg-slate-200 rounded-sm" /><div className="bg-slate-900 rounded-sm" />
                  </div>
                  <span className="text-[8px] font-bold text-slate-800 tracking-wider">UPI: ruralcare@sbi</span>
                </div>
                
                <p className="text-xs font-bold text-primary">Amount to Scan: ₹{getCartSubtotal()}</p>
              </div>
            ) : (
              <div className="py-4 text-center space-y-2">
                <span className="text-4xl">💳</span>
                <p className="text-xs font-bold text-muted-foreground">Processing card/wallet checkout for ₹{getCartSubtotal()}...</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleSimulationOutcome(false)}
                className="flex-1 py-2 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white font-bold rounded-xl transition-all text-xs border border-destructive/20"
                disabled={isSimulatingPayment}
              >
                {t('simulatedFail')}
              </button>
              
              <button
                onClick={() => handleSimulationOutcome(true)}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-1.5"
                disabled={isSimulatingPayment}
              >
                {isSimulatingPayment ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>✔️</span>
                    <span>{t('simulatedSuccess')}</span>
                  </>
                )}
              </button>
            </div>
            
            <button
              onClick={() => setShowPaymentModal(false)}
              className="text-xs text-muted-foreground hover:text-foreground font-semibold block mx-auto underline pt-2"
              disabled={isSimulatingPayment}
            >
              Cancel Payment / रद्द करें
            </button>
          </div>
        </div>
      )}

      {/* 3. Huge Success Overlay Page */}
      {showSuccessOverlay && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <div className="max-w-md space-y-6">
            <span className="text-7xl block animate-bounce">📦</span>
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {t('orderSuccessTitle')}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('orderSuccessDesc')}
              </p>
            </div>

            <div className="p-4 bg-muted border border-border rounded-2xl text-xs space-y-1 inline-block text-left">
              <p className="text-muted-foreground"><strong>{t('orderId')}:</strong> <span className="text-foreground font-mono font-bold">{latestOrderId}</span></p>
              <p className="text-muted-foreground"><strong>Village Destination:</strong> <span className="text-foreground font-bold">{address.village} ({address.panchayat})</span></p>
              <p className="text-muted-foreground"><strong>Expected Delivery:</strong> <span className="text-emerald-600 font-bold">Tomorrow afternoon / कल दोपहर तक</span></p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setShowSuccessOverlay(false);
                  navigate('/orders');
                }}
                className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground font-black rounded-xl shadow-md transition-all text-xs uppercase"
              >
                Track Status / ऑर्डर देखें
              </button>
              <button
                onClick={() => {
                  setShowSuccessOverlay(false);
                  navigate('/');
                }}
                className="px-6 py-2.5 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl border border-border transition-all text-xs uppercase"
              >
                Back to Home / मुख्य पृष्ठ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
