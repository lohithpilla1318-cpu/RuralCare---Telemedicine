import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/fetchHelper';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { DownloadReportButton } from '../components/DownloadReport';
import { ShoppingBag, Truck, Calendar } from 'lucide-react';

interface OrderItem {
  medicineId: string;
  name: string;
  genericName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  paymentMethod: 'UPI' | 'Card' | 'Wallet' | 'COD';
  paymentStatus: 'pending' | 'completed' | 'failed';
  shippingAddress: {
    fullName: string;
    phone: string;
    village: string;
    panchayat: string;
    district: string;
    state: string;
    pincode: string;
  };
  status: 'ordered' | 'dispatched' | 'out_for_delivery' | 'delivered';
  date: string;
}

export const Orders: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const res = await apiFetch(`/api/orders/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error('Failed to load orders history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (!user) return null;

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'ordered':
        return { text: t('orderedState'), color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' };
      case 'dispatched':
        return { text: t('dispatchedState'), color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' };
      case 'out_for_delivery':
        return { text: t('outForDeliveryState'), color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 animate-pulse' };
      case 'delivered':
        return { text: t('deliveredState'), color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
      default:
        return { text: status, color: 'bg-slate-500/10 text-slate-600 border-slate-500/20' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">{t('navOrders')}</h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
          Track active medicine dispatches and print purchase invoices / अपने पुराने ऑर्डर की रसीदें डाउनलोड करें।
        </p>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground">Loading orders log... / ऑर्डर सूची लोड की जा रही है...</p>
        </div>
      ) : orders.length === 0 ? (
        /* Empty Orders list */
        <div className="min-h-[35vh] border border-dashed border-border rounded-3xl p-8 flex flex-col items-center justify-center text-center">
          <span className="text-6xl mb-4 opacity-75">📦</span>
          <h2 className="text-base font-bold mb-1">{t('noOrders').split('/')[0]}</h2>
          <p className="text-xs text-muted-foreground max-w-xs">
            {t('noOrders')}
          </p>
        </div>
      ) : (
        /* Render list of orders */
        <div className="space-y-6">
          {orders.map((order) => {
            const badge = getStatusBadge(order.status);
            const formattedDate = new Date(order.date).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div 
                key={order.id} 
                className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden flex flex-col"
              >
                
                {/* Header of Order card */}
                <div className="p-4 bg-muted border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-xs">
                    <div className="p-2 rounded-xl bg-card border border-border">
                      <ShoppingBag size={16} className="text-primary" />
                    </div>
                    <div>
                      <span className="text-muted-foreground font-semibold">ID: </span>
                      <span className="font-mono font-bold text-foreground">{order.id.substring(0, 8).toUpperCase()}</span>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                        <Calendar size={10} />
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status pills & Invoice button */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${badge.color}`}>
                      {badge.text}
                    </span>
                    <DownloadReportButton
                      type="invoice"
                      data={order}
                      label={t('downloadInvoice')}
                      className="!py-1.5 !px-3 shadow-none text-xs"
                    />
                  </div>
                </div>

                {/* Body of Order card */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Item lists */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Medicines list / दवाइयों की सूची
                    </h4>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs border-b border-border/40 pb-2 last:border-b-0 last:pb-0">
                          <div>
                            <span className="font-bold text-foreground">{item.name}</span>
                            <span className="text-[10px] text-muted-foreground block italic">Qty: {item.quantity} x ₹{item.price}</span>
                          </div>
                          <span className="font-bold text-primary">₹{item.quantity * item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping address details */}
                  <div className="space-y-3 border-t md:border-t-0 md:border-l border-border/60 pt-4 md:pt-0 md:pl-6 text-xs">
                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Shipping Details / डिलीवरी का पता
                    </h4>
                    <div className="space-y-1.5 leading-relaxed">
                      <p className="font-bold text-foreground">{order.shippingAddress.fullName}</p>
                      <p className="text-muted-foreground">
                        Village: <span className="text-foreground/95 font-medium">{order.shippingAddress.village}</span>, 
                        Panchayat: <span className="text-foreground/95 font-medium">{order.shippingAddress.panchayat}</span>
                      </p>
                      <p className="text-muted-foreground">
                        District: <span className="text-foreground/95 font-medium">{order.shippingAddress.district}</span>, 
                        State: <span className="text-foreground/95 font-medium">{order.shippingAddress.state}</span>
                      </p>
                      <p className="text-muted-foreground">
                        Pincode: <span className="text-foreground font-mono">{order.shippingAddress.pincode}</span>
                      </p>
                    </div>
                  </div>

                </div>

                {/* Footer sum */}
                <div className="px-5 py-3 border-t border-border flex items-center justify-between bg-muted/20 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Truck size={14} className="text-emerald-500" />
                    <span>Payment Method: <strong>{order.paymentMethod}</strong> ({order.paymentStatus})</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground mr-1">Paid:</span>
                    <span className="text-base font-black text-primary">₹{order.total}</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
