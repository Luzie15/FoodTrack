import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Loader2, Zap } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  onClose: () => void;
  title?: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose, title = "Produkt scannen" }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        
        if (!isMounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          
          const track = stream.getVideoTracks()[0];
          if (track?.getCapabilities) {
            const capabilities = track.getCapabilities() as any;
            if (capabilities && capabilities.torch) setHasFlash(true);
          }

          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(() => {});
            if (isMounted) setIsReady(true);
          };
        }
      } catch (err: any) {
        console.error("Kamera-Fehler:", err);
        if (isMounted) {
          setError("Kamera-Zugriff verweigert oder Fehler aufgetreten. Bitte prüfe deine Browser-Einstellungen.");
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const toggleFlash = async () => {
    if (!videoRef.current?.srcObject || !hasFlash) return;
    try {
      const stream = videoRef.current.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];
      const newState = !isFlashOn;
      await track.applyConstraints({
         advanced: [{ torch: newState }] as any
      });
      setIsFlashOn(newState);
    } catch (err) {
      console.error(err);
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !isReady) return;
    
    setIsProcessing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      // Höchste native Video-Auflösung übernehmen für exzellentes KI-Reading
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 0.8 / 0.9 reicht völlig, Gemini skaliert ohnehin
      const imageData = canvas.toDataURL('image/jpeg', 0.85);

      // Kurzer Visual-Feedback-Delay (0.5s freeze) bevor der Callback triggert
      setTimeout(() => {
        onCapture(imageData);
        // Wir überlassen es dem Parent Component das CameraCapture unzumounten, 
        // weshalb stopCamera() über den useEffect-Cleanup automatisch geregelt wird.
      }, 50);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 to-transparent">
        <h2 className="text-white font-headline font-bold text-lg drop-shadow-md">{title}</h2>
        <button 
          onClick={onClose} 
          className="bg-black/40 text-white p-2 rounded-full backdrop-blur-sm"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Viewfinder */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-white text-center p-6 flex flex-col items-center">
            <X className="w-12 h-12 text-tertiary mb-4" />
            <p className="mb-4 text-sm max-w-[200px]">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2 bg-primary rounded-full font-bold flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Neu laden
            </button>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              className="absolute inset-0 w-full h-full object-cover" 
              muted 
              playsInline 
            />
            {/* Invisibles Canvas fürs Foto-Rendering */}
            <canvas ref={canvasRef} className="hidden" />

            {!isReady && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            )}
            
            {/* Guide Frame (nur visuell, KI sieht alles) */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 opacity-60">
               <div className="w-[85%] aspect-[3/4] max-h-[85%] border-2 border-white/20 rounded-3xl relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                     <div className="w-2 h-2 rounded-full bg-white/40" />
                  </div>
               </div>
            </div>
            
            {hasFlash && (
              <button 
                onClick={toggleFlash}
                className={`absolute bottom-32 right-6 p-4 rounded-full z-20 transition-all shadow-lg ${isFlashOn ? 'bg-white text-black scale-110' : 'bg-black/40 text-white backdrop-blur-md'}`}
              >
                <Zap className={`w-6 h-6 ${isFlashOn ? 'fill-current' : ''}`} />
              </button>
            )}
          </>
        )}
      </div>

      {/* Shutter Button Area */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-black/80 backdrop-blur-lg flex items-center justify-center pb-safe-area-bottom z-20">
        <button 
          onClick={takePhoto}
          disabled={!isReady || isProcessing || !!error}
          className="relative group disabled:opacity-50"
        >
          {/* Outer Ring */}
          <div className="w-20 h-20 rounded-full border-[5px] border-white/80 group-active:border-white transition-colors flex items-center justify-center">
            {/* Inner Shutter */}
            <div className={`w-14 h-14 rounded-full bg-white flex items-center justify-center transition-all ${isProcessing ? 'scale-90 opacity-80' : 'group-active:scale-95'}`}>
              {isProcessing && <Loader2 className="w-6 h-6 text-black animate-spin" />}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
