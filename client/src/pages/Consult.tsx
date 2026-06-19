import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/fetchHelper';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { VideoCall } from '../components/VideoCall';
import { DownloadReportButton } from '../components/DownloadReport';
import { Video, CheckCircle } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  languages: string[];
  fee: number;
  available: boolean;
}

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
}

interface PrescribedMedicine {
  name: string;
  dosage: string;
  duration: string;
}

interface Consultation {
  id: string;
  userId: string;
  patientName: string;
  doctorName: string;
  doctorSpecialization: string;
  date: string;
  type: 'video' | 'audio' | 'chat';
  status: 'scheduled' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'completed';
  amount: number;
  prescription?: {
    medicines: PrescribedMedicine[];
    advice: string;
  };
}

export const Consult: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  // Available list states
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking states
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<string>('Self');
  const [symptoms, setSymptoms] = useState('');
  const [showBookingDrawer, setShowBookingDrawer] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Wallet'>('UPI');

  // Video call triggers
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [activeCallDocName, setActiveCallDocName] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        // Fetch Doctors
        const docRes = await apiFetch('/api/doctors');
        if (docRes.ok) {
          const docData = await docRes.json();
          setDoctors(docData);
        }

        // Fetch Family Members
        const famRes = await apiFetch(`/api/family/${user.id}`);
        if (famRes.ok) {
          const famData = await famRes.json();
          setFamilyMembers(famData);
        }

        // Fetch Consultations
        await refreshConsultations();

      } catch (err) {
        console.error('Failed to load consultation configs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const refreshConsultations = async () => {
    if (!user) return;
    try {
      const conRes = await apiFetch(`/api/consultations/${user.id}`);
      if (conRes.ok) {
        const conData = await conRes.json();
        setConsultations(conData);
      }
    } catch (err) {
      console.error('Refresh consultations error:', err);
    }
  };

  const handleStartBooking = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setSelectedPatient('Self');
    setSymptoms('');
    setShowBookingDrawer(true);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;
    
    // Trigger Payment
    setShowBookingDrawer(false);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    if (!user || !selectedDoctor) return;

    try {
      const bookingPayload = {
        userId: user.id,
        patientName: selectedPatient === 'Self' ? user.name : selectedPatient,
        doctorName: selectedDoctor.name,
        doctorSpecialization: selectedDoctor.specialization,
        type: 'video', // Defaults to video consultation
        amount: selectedDoctor.fee
      };

      const res = await apiFetch('/api/consultations/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.consultation) {
          setShowPaymentModal(false);
          // Set call active immediately!
          setActiveCallId(data.consultation.id);
          setActiveCallDocName(data.consultation.doctorName);
        }
      }
    } catch (err) {
      console.error('Booking creation failed:', err);
      alert('Failed to register booking on server. / बुकिंग दर्ज करने में विफल।');
    }
  };

  const handleCallFinished = async () => {
    setActiveCallId(null);
    setLoading(true);
    await refreshConsultations();
    setLoading(false);
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">{t('consultTitle')}</h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
          {t('consultSubtitle')}
        </p>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground">Loading doctor dashboard... / डॉक्टर सूची लोड की जा रही है...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT SIDE: Doctor catalog (Takes 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-base font-black text-foreground/90 uppercase tracking-wide">
              {t('availableDoctors')} / उपलब्ध डॉक्टर
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {doctors.map((doc) => (
                <div 
                  key={doc.id} 
                  className={`bg-card border p-5 rounded-3xl shadow-sm transition-all flex flex-col justify-between gap-4 ${
                    doc.available ? 'border-border hover:border-primary/20 hover:shadow-md' : 'border-border/40 opacity-75'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-sm text-foreground">{doc.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase ${
                        doc.available ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {doc.available ? 'Online' : 'Offline'}
                      </span>
                    </div>

                    <p className="text-xs font-black text-primary">{doc.specialization}</p>

                    <div className="text-[10px] space-y-1 text-muted-foreground">
                      <p>🗣️ <strong>{t('languagesSpoken')}:</strong> {doc.languages.join(', ')}</p>
                      <p>💵 <strong>{t('consultationFee')}:</strong> <span className="text-foreground font-bold">₹{doc.fee}</span></p>
                    </div>
                  </div>

                  {doc.available ? (
                    <button
                      onClick={() => handleStartBooking(doc)}
                      className="w-full py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-black rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm"
                    >
                      <Video size={14} />
                      <span>{t('bookNow')}</span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2 bg-muted text-muted-foreground font-bold rounded-xl text-xs border border-border"
                    >
                      Currently Unavailable
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE: Past consultations list */}
          <div className="space-y-4">
            <h2 className="text-base font-black text-foreground/90 uppercase tracking-wide">
              {t('consultationHistory')} / परामर्श इतिहास
            </h2>

            {consultations.length === 0 ? (
              <div className="bg-card border border-dashed border-border p-6 rounded-3xl text-center text-xs text-muted-foreground">
                <span>🩺</span>
                <p className="mt-1">{t('noConsultations')}</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {consultations.map((con) => {
                  const dateStr = new Date(con.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <div key={con.id} className="bg-card border border-border p-4 rounded-2xl shadow-sm space-y-3">
                      <div className="flex justify-between items-start text-xs">
                        <div>
                          <h4 className="font-bold text-foreground">{con.doctorName}</h4>
                          <p className="text-[10px] text-muted-foreground">{con.doctorSpecialization}</p>
                        </div>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                          {dateStr}
                        </span>
                      </div>

                      <div className="text-[10px] text-muted-foreground flex justify-between items-center">
                        <p>Patient: <strong className="text-foreground">{con.patientName}</strong></p>
                        <span className={`font-black uppercase tracking-wider ${
                          con.status === 'completed' ? 'text-green-600' : 'text-primary'
                        }`}>
                          {con.status}
                        </span>
                      </div>

                      {con.status === 'completed' && con.prescription && (
                        <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle size={12} />
                            <span>Prescription Ready</span>
                          </span>
                          <DownloadReportButton
                            type="prescription"
                            data={con}
                            label={t('viewPrescription')}
                            className="!py-1 !px-2.5 shadow-none text-[10px]"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* 1. Booking Details Input Drawer Drawer Overlay */}
      {showBookingDrawer && selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <form 
            onSubmit={handleConfirmBooking}
            className="w-full max-w-md bg-card text-card-foreground p-6 rounded-t-3xl sm:rounded-3xl border border-border shadow-2xl space-y-4 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="font-black text-sm uppercase text-primary tracking-wider">
                Booking Details / परामर्श जानकारी
              </h3>
              <button 
                type="button" 
                onClick={() => setShowBookingDrawer(false)}
                className="text-xs text-muted-foreground hover:text-foreground font-black"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-3 bg-muted rounded-2xl text-xs space-y-1">
              <p className="text-muted-foreground">Doctor: <strong className="text-foreground">{selectedDoctor.name}</strong></p>
              <p className="text-muted-foreground">Fee: <strong className="text-primary font-black">₹{selectedDoctor.fee}</strong></p>
            </div>

            {/* Select Patient */}
            <div>
              <label className="block text-xs font-bold text-foreground/80 mb-1">{t('patientName')} / मरीज कौन है?</label>
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-bold focus:ring-primary focus:ring-2 focus:outline-none"
              >
                <option value="Self">Self / स्वयं ({user.name})</option>
                {familyMembers.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.relation}: {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Symptoms Input */}
            <div>
              <label className="block text-xs font-bold text-foreground/80 mb-1">{t('describeSymptom')}</label>
              <textarea
                required
                rows={3}
                placeholder={t('symptomPlaceholder')}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-bold focus:ring-primary focus:ring-2 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary hover:bg-primary/95 text-primary-foreground font-black rounded-xl text-xs uppercase shadow-md active:scale-95 transition-all"
            >
              Next: Payment / भुगतान के लिए आगे बढ़ें
            </button>
          </form>
        </div>
      )}

      {/* 2. Settle Fee Payment Drawer Overlay */}
      {showPaymentModal && selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-card text-card-foreground p-6 rounded-3xl border border-border shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div>
              <h3 className="font-black text-base text-foreground">Settle Consultation Fee</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Please pay doctor's fee to initiate call / डॉक्टर फीस का भुगतान करें</p>
            </div>

            {/* Payment Method picker */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => setPaymentMethod('UPI')}
                className={`py-2 px-1 rounded-xl border-2 font-bold flex flex-col items-center gap-1 ${
                  paymentMethod === 'UPI' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <span>📲</span>
                <span>UPI</span>
              </button>
              <button
                onClick={() => setPaymentMethod('Card')}
                className={`py-2 px-1 rounded-xl border-2 font-bold flex flex-col items-center gap-1 ${
                  paymentMethod === 'Card' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <span>💳</span>
                <span>Card</span>
              </button>
              <button
                onClick={() => setPaymentMethod('Wallet')}
                className={`py-2 px-1 rounded-xl border-2 font-bold flex flex-col items-center gap-1 ${
                  paymentMethod === 'Wallet' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <span>👛</span>
                <span>Wallet</span>
              </button>
            </div>

            {paymentMethod === 'UPI' && (
              <div className="space-y-4">
                <div className="w-36 h-36 bg-white border border-slate-200 p-2 mx-auto rounded-xl flex flex-col items-center justify-center gap-1 shadow-inner">
                  {/* Mock QR Drawing */}
                  <div className="grid grid-cols-4 gap-1 w-24 h-24 opacity-80">
                    <div className="bg-slate-900 rounded-sm" /><div className="bg-slate-200 rounded-sm" /><div className="bg-slate-900 rounded-sm" /><div className="bg-slate-900 rounded-sm" />
                    <div className="bg-slate-900 rounded-sm" /><div className="bg-slate-900 rounded-sm" /><div className="bg-slate-200 rounded-sm" /><div className="bg-slate-900 rounded-sm" />
                    <div className="bg-slate-200 rounded-sm" /><div className="bg-slate-900 rounded-sm" /><div className="bg-slate-900 rounded-sm" /><div className="bg-slate-200 rounded-sm" />
                    <div className="bg-slate-900 rounded-sm" /><div className="bg-slate-200 rounded-sm" /><div className="bg-slate-900 rounded-sm" /><div className="bg-slate-900 rounded-sm" />
                  </div>
                  <span className="text-[7px] font-bold text-slate-800 tracking-wider">UPI: consult@ruralcare</span>
                </div>
                <p className="text-xs font-bold text-primary">Pay Doctor Fee: ₹{selectedDoctor.fee}</p>
              </div>
            )}

            {paymentMethod !== 'UPI' && (
              <div className="py-4 text-center">
                <p className="text-xs font-bold text-muted-foreground">Debit card/wallet verification pending...</p>
                <p className="text-[10px] text-primary font-black mt-1">Total Fee: ₹{selectedDoctor.fee}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-2 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white font-bold rounded-xl transition-all text-xs border border-destructive/20"
              >
                Cancel / रद्द करें
              </button>
              
              <button
                onClick={handlePaymentSuccess}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all text-xs"
              >
                ✔️ Settle & Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Mount Simulated Video Call Wrapper Overlay */}
      {activeCallId && (
        <VideoCall
          consultationId={activeCallId}
          doctorName={activeCallDocName}
          onClose={() => setActiveCallId(null)}
          onCallCompleted={handleCallFinished}
        />
      )}

    </div>
  );
};
