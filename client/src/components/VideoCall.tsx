import React, { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../utils/fetchHelper';
import { useLanguage } from '../context/LanguageContext';

interface VideoCallProps {
  consultationId: string;
  doctorName: string;
  onClose: () => void;
  onCallCompleted: () => void;
}

export const VideoCall: React.FC<VideoCallProps> = ({
  consultationId,
  doctorName,
  onClose,
  onCallCompleted
}) => {
  const { t } = useLanguage();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'completed'>('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [doctorSubtitles, setDoctorSubtitles] = useState('');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<any>(null);

  // Subtitle script to simulate doctor talk
  const script = [
    { time: 3, text: `Hello, Namaste! I am ${doctorName}. How are you feeling today? / नमस्ते! मैं ${doctorName} हूँ। आज आप कैसा महसूस कर रहे हैं?` },
    { time: 10, text: "Okay, I see. Can you tell me more about your symptoms? How long have you had this? / ठीक है, मैं समझ गया। क्या आप मुझे अपने लक्षणों के बारे में अधिक बता सकते हैं? यह कब से है?" },
    { time: 20, text: "I understand. Please show me your throat or press below your ribs if it hurts. / मैं समझता हूँ। कृपया मुझे अपना गला दिखाएं या यदि दर्द हो तो अपनी पसलियों के नीचे दबाएं।" },
    { time: 32, text: "Got it. Nothing to worry about. I am prescribing you some medicine and typing advice. / समझ गया। चिंता की कोई बात नहीं है। मैं आपको कुछ दवा लिख रहा हूँ और सलाह टाइप कर रहा हूँ।" },
    { time: 42, text: "Take rest for 2 days and check back if fever stays. Take care, bye! / २ दिन आराम करें और बुखार बने रहने पर दोबारा जांच कराएं। ध्यान रखें, अलविदा!" }
  ];

  // Request camera and microphone
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        // Simulate connecting delay
        setTimeout(() => {
          setConnectionStatus('connected');
          startTimer();
        }, 2000);

      } catch (err) {
        console.error('Camera block / error:', err);
        // Fallback to connection without camera
        setTimeout(() => {
          setConnectionStatus('connected');
          startTimer();
        }, 2000);
      }
    };

    startCamera();

    return () => {
      stopAllMedia();
    };
  }, []);

  // Sync subtitle timeline
  useEffect(() => {
    if (connectionStatus !== 'connected') return;

    const matchedScript = script.find(item => item.time === callDuration);
    if (matchedScript) {
      setDoctorSubtitles(matchedScript.text);
    }
  }, [callDuration, connectionStatus]);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopAllMedia = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff(!isCameraOff);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleHangUp = async () => {
    stopAllMedia();
    setConnectionStatus('completed');

    try {
      // API call to complete consultation and generate prescription
      const res = await apiFetch('/api/consultations/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultationId }),
      });
      if (res.ok) {
        onCallCompleted();
      } else {
        alert('Failed to finalize report on server. / सर्वर पर रिपोर्ट दर्ज करने में विफल।');
        onClose();
      }
    } catch (err) {
      console.error('Call completion fail:', err);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 text-white flex flex-col md:flex-row overflow-hidden">
      {/* Remote Doctor Video Screen Area */}
      <div className="flex-1 relative flex flex-col justify-between p-4 bg-slate-950">
        
        {/* Call status header */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center glass px-4 py-2 rounded-full text-slate-800 dark:text-white border border-slate-700/50">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500 animate-spin'}`} />
            <span className="font-semibold text-sm">
              {connectionStatus === 'connecting' ? t('connecting') : `Connected with ${doctorName}`}
            </span>
          </div>
          {connectionStatus === 'connected' && (
            <span className="font-mono bg-red-600/90 text-white px-3 py-0.5 rounded-full text-xs animate-pulse">
              LIVE {formatTime(callDuration)}
            </span>
          )}
        </div>

        {/* Remote Stream Simulation View */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {connectionStatus === 'connecting' ? (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
              <p className="text-lg font-medium text-slate-400">{t('connecting')}</p>
            </div>
          ) : (
            <div className="text-center space-y-6">
              {/* Doctor Avatar Mockup */}
              <div className="relative w-40 h-40 md:w-52 md:h-52 rounded-full bg-slate-800 border-4 border-emerald-500 p-1 flex items-center justify-center pulse-glow overflow-hidden mx-auto">
                <span className="text-6xl">🩺</span>
                {/* Simulated speaking audio wave dots */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                  <span className="w-1.5 h-4 bg-green-400 rounded-full animate-bounce delay-100" />
                  <span className="w-1.5 h-6 bg-green-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-4 bg-green-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold">{doctorName}</h3>
                <p className="text-sm text-slate-400">Consulting Pediatrician / General Medicine</p>
              </div>
            </div>
          )}
        </div>

        {/* Doctor Speech Subtitle Display */}
        {connectionStatus === 'connected' && doctorSubtitles && (
          <div className="mx-auto max-w-xl bg-black/60 border border-slate-700/50 rounded-xl px-4 py-3 text-center mb-16 text-sm md:text-base leading-relaxed text-yellow-300">
            {doctorSubtitles}
          </div>
        )}

        {/* Call control action buttons */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-6 z-15">
          <button
            onClick={toggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
              isMuted ? 'bg-red-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Mute Mic"
          >
            {isMuted ? '🔇' : '🎙️'}
          </button>
          
          <button
            onClick={handleHangUp}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-lg transform active:scale-95 transition-all text-2xl"
            title={t('hangUp')}
          >
            📞
          </button>

          <button
            onClick={toggleCamera}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
              isCameraOff ? 'bg-red-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Toggle Camera"
          >
            {isCameraOff ? '🚫' : '📹'}
          </button>
        </div>
      </div>

      {/* Local Patient Video Preview Side-Card */}
      <div className="w-full md:w-80 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 p-4 flex flex-col justify-between items-center relative">
        <h4 className="text-sm font-semibold text-slate-400 mb-2 self-start hidden md:block">
          Your Camera Preview / आपका कैमरा
        </h4>
        
        <div className="w-full aspect-[4/3] rounded-lg bg-slate-950 border border-slate-800 overflow-hidden relative flex items-center justify-center">
          {isCameraOff ? (
            <div className="text-center text-xs text-slate-500">
              <span>📷</span>
              <p>Camera is Off</p>
            </div>
          ) : localStream ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <div className="text-center text-xs text-slate-500 p-4">
              <span>⚠️</span>
              <p>Allow camera permissions in browser to show video feed</p>
            </div>
          )}
          
          {/* Muted label overlay */}
          {isMuted && (
            <span className="absolute bottom-2 left-2 bg-red-500/80 text-white text-[10px] px-2 py-0.5 rounded">
              Muted
            </span>
          )}
        </div>

        {/* Rural care brand watermark */}
        <div className="mt-4 text-center hidden md:block">
          <span className="text-xs text-slate-600 block">RuralCare telemedicine node</span>
          <span className="text-[10px] text-slate-700">Encrypted call link</span>
        </div>
      </div>
    </div>
  );
};
