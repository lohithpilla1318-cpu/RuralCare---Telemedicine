import React, { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../utils/fetchHelper';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { Camera, Upload, AlertCircle, RefreshCw, ShoppingCart, Check, Info } from 'lucide-react';

interface MedicineMatch {
  id: string;
  name: string;
  genericName: string;
  category: string;
  price: number;
  stock: number;
  dosage: string;
  bilingualLabel: string;
}

export const Search: React.FC = () => {
  const { addToCart, cartItems } = useCart();
  const { t } = useLanguage();

  // Mode select
  const [inputMode, setInputMode] = useState<'camera' | 'upload'>('camera');
  
  // Camera streams
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Upload fields
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Scanning stages
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResults, setScanResults] = useState<MedicineMatch[]>([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (inputMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [inputMode]);

  const startCamera = async () => {
    setCameraError(false);
    setCapturedImage(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Prefer back camera!
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera stream access blocked:', err);
      setCameraError(true);
      setInputMode('upload');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw standard frame
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setHasScanned(false);
    setScanResults([]);
    startCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Type checking
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      alert(t('validationType'));
      return;
    }

    // Size checking (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert(t('validationSize'));
      return;
    }

    setHasScanned(false);
    setScanResults([]);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleStartScan = () => {
    const activeImage = inputMode === 'camera' ? capturedImage : filePreview;
    if (!activeImage) {
      alert('Please take or upload a photo first! / कृपया पहले फोटो लें!');
      return;
    }

    setIsScanning(true);
    setScanProgress(0);

    // Progress bar simulation
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    // Trigger API request
    setTimeout(async () => {
      try {
        const res = await apiFetch('/api/medicines/search-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: activeImage })
        });
        if (res.ok) {
          const data = await res.json();
          setScanResults(data.matches || []);
          setHasScanned(true);
        }
      } catch (err) {
        console.error('Scan API fail:', err);
      } finally {
        setIsScanning(false);
      }
    }, 1600);
  };

  const handleAddToCart = (med: MedicineMatch) => {
    addToCart({
      id: med.id,
      name: med.name,
      genericName: med.genericName,
      price: med.price
    });
    setAddedItemIds(prev => ({ ...prev, [med.id]: true }));
    setTimeout(() => {
      setAddedItemIds(prev => ({ ...prev, [med.id]: false }));
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8 animate-in fade-in duration-300">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">{t('searchTitle')}</h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
          {t('searchSubtitle')}
        </p>
      </div>

      {/* Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT SIDE: Active camera viewport or file upload (Takes 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tabs header selector */}
          <div className="flex bg-muted rounded-2xl p-1 border border-border w-fit">
            <button
              onClick={() => {
                setInputMode('camera');
                setFilePreview(null);
                setHasScanned(false);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                inputMode === 'camera' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Camera size={14} />
              <span>Camera Stream / कैमरा</span>
            </button>
            <button
              onClick={() => {
                setInputMode('upload');
                setCapturedImage(null);
                setHasScanned(false);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                inputMode === 'upload' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Upload size={14} />
              <span>Upload Photo / गैलरी</span>
            </button>
          </div>

          {/* Core media scanner box */}
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm relative aspect-[4/3] max-w-2xl mx-auto flex flex-col justify-center items-center">
            
            {inputMode === 'camera' ? (
              /* CAMERA STREAM MODE */
              <div className="w-full h-full relative">
                {cameraError ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center h-full text-xs">
                    <AlertCircle className="text-destructive mb-2" size={28} />
                    <p className="font-bold">Camera access blocked / कैमरा बंद है</p>
                    <p className="text-muted-foreground mt-1">Please allow camera permissions or switch to Gallery Upload.</p>
                  </div>
                ) : capturedImage ? (
                  /* Captured preview */
                  <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                ) : (
                  /* Live Feed with guide lines */
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Visual scan framing overlay */}
                    <div className="absolute inset-8 border-2 border-dashed border-white/50 rounded-2xl pointer-events-none flex items-center justify-center">
                      <div className="w-48 h-48 border border-white/20 rounded-xl relative">
                        <span className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary" />
                        <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary" />
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary" />
                      </div>
                    </div>
                  </>
                )}
                
                {/* Scanning overlay progress bar and lines */}
                {isScanning && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center p-6 text-white space-y-4">
                    {/* Horizontal scanning laser line */}
                    <div className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_15px_#2563eb] animate-bounce w-full top-1/2" />
                    
                    <div className="text-center z-10 space-y-2">
                      <RefreshCw className="animate-spin mx-auto text-primary" size={32} />
                      <p className="text-sm font-bold">{t('scanning')}</p>
                      <div className="w-48 bg-slate-700 h-2 rounded-full overflow-hidden mx-auto border border-slate-600">
                        <div className="bg-primary h-full transition-all duration-150" style={{ width: `${scanProgress}%` }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* GALLERY UPLOAD MODE */
              <div className="w-full h-full p-6 flex flex-col items-center justify-center relative">
                {filePreview ? (
                  <img src={filePreview} alt="Uploaded preview" className="w-full h-full object-contain rounded-2xl" />
                ) : (
                  <label className="border-2 border-dashed border-border rounded-2xl p-8 hover:bg-muted/30 cursor-pointer flex flex-col items-center gap-2 max-w-sm text-center">
                    <Upload size={32} className="text-primary animate-bounce" />
                    <span className="font-bold text-xs">{t('selectFromGallery')}</span>
                    <span className="text-[10px] text-muted-foreground">{t('validationType')} (Max 5MB)</span>
                    <input 
                      type="file" 
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                  </label>
                )}

                {/* Scanning overlay progress */}
                {isScanning && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center p-6 text-white space-y-4 rounded-3xl">
                    <div className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_15px_#2563eb] animate-bounce w-full top-1/2" />
                    <div className="text-center z-10 space-y-2">
                      <RefreshCw className="animate-spin mx-auto text-primary" size={32} />
                      <p className="text-sm font-bold">{t('scanning')}</p>
                      <div className="w-48 bg-slate-700 h-2 rounded-full overflow-hidden mx-auto border border-slate-600">
                        <div className="bg-primary h-full transition-all duration-150" style={{ width: `${scanProgress}%` }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Actions Controls bar below scanner */}
          <div className="flex justify-center gap-4">
            {inputMode === 'camera' && !capturedImage && !cameraError && (
              <button
                onClick={capturePhoto}
                className="px-6 py-3 bg-primary hover:bg-primary/95 text-primary-foreground font-black rounded-xl text-xs uppercase shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
              >
                📸 {t('takePhoto')}
              </button>
            )}

            {(capturedImage || filePreview) && !isScanning && (
              <>
                <button
                  onClick={inputMode === 'camera' ? handleRetake : () => { setFilePreview(null); setHasScanned(false); }}
                  className="px-6 py-3 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl border border-border text-xs uppercase"
                >
                  ↩️ {t('retakePhoto').split('/')[0]}
                </button>
                <button
                  onClick={handleStartScan}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md text-xs uppercase flex items-center gap-1.5"
                >
                  ⚡ Start Scan / स्कैन शुरू करें
                </button>
              </>
            )}
          </div>

          {/* Results Block */}
          {hasScanned && (
            <div className="bg-card border border-border p-6 rounded-3xl shadow-sm space-y-4 animate-in slide-in-from-top-2 duration-300">
              <h3 className="font-black text-sm uppercase tracking-wider text-emerald-600">
                {t('matchingMeds')}
              </h3>

              {scanResults.length === 0 ? (
                <p className="text-xs text-muted-foreground">{t('noMatch')}</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {scanResults.map((med) => {
                    const isAdded = addedItemIds[med.id];
                    const inCart = cartItems.find(item => item.medicineId === med.id);
                    
                    return (
                      <div key={med.id} className="border border-border p-4 rounded-2xl flex flex-col justify-between gap-3 bg-muted/20">
                        <div>
                          <h4 className="font-bold text-xs text-foreground">{med.name}</h4>
                          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">{med.bilingualLabel}</p>
                          <p className="text-[10px] text-muted-foreground italic mt-1">Generic: {med.genericName}</p>
                          <p className="text-[10px] text-muted-foreground">Dosage: {med.dosage}</p>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-border/60">
                          <span className="font-black text-sm text-primary">₹{med.price}</span>
                          <button
                            onClick={() => handleAddToCart(med)}
                            disabled={isAdded}
                            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 text-[10px] shadow-sm transition-all ${
                              isAdded 
                                ? 'bg-green-600 text-white shadow-green-200' 
                                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                            }`}
                          >
                            {isAdded ? (
                              <Check size={10} />
                            ) : (
                              <>
                                <ShoppingCart size={10} />
                                <span>{inCart ? `(${inCart.quantity})` : 'Add'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT SIDE: Translation tips & info card */}
        <div className="space-y-6">
          <div className="bg-card border border-border p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-black text-sm uppercase tracking-wider text-primary flex items-center gap-2">
              <Info size={18} />
              {t('translateTitle')}
            </h3>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('translateBody')}
            </p>

            <div className="space-y-2.5 pt-2 border-t border-border/85 text-[11px] font-medium text-foreground/80 leading-normal">
              <p>{t('translateStep1')}</p>
              <p>{t('translateStep2')}</p>
              <p>{t('translateStep3')}</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
