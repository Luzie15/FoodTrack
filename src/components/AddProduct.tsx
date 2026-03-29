import { useState, FormEvent, useEffect, useRef } from 'react';
import { Scan, Flashlight, RefreshCw, Save, CheckCircle, Zap, Loader2, X } from 'lucide-react';
import { PantryItem, Category } from '../types';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface AddProductProps {
  onSave: (item: Omit<PantryItem, 'id' | 'status' | 'uid'>) => void;
  onBack: () => void;
}

export default function AddProduct({ onSave, onBack }: AddProductProps) {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState<Category>('Speisekammer');
  const [quantity, setQuantity] = useState('1');
  const [expiryDate, setExpiryDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  });
  const [imageUrl, setImageUrl] = useState('https://picsum.photos/seed/newproduct/200/200');
  const [isScanning, setIsScanning] = useState(true);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [hasFlash, setHasFlash] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    let isMounted = true;
    let timer: NodeJS.Timeout;

    if (isScanning) {
      const startScanner = async () => {
        // Clear previous error
        setScanError(null);
        
        // Small delay to ensure DOM is ready
        await new Promise(resolve => {
          timer = setTimeout(resolve, 500);
        });

        if (!isMounted) return;

        try {
          const formatsToSupport = [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
          ];

          // Ensure any previous instance is cleaned up
          if (html5QrCodeRef.current) {
            try {
              if (html5QrCodeRef.current.isScanning) {
                await html5QrCodeRef.current.stop();
              }
              html5QrCodeRef.current.clear();
            } catch (e) {
              console.warn("Cleanup of previous scanner failed", e);
            }
          }

          const html5QrCode = new Html5Qrcode("reader", { verbose: false, formatsToSupport });
          html5QrCodeRef.current = html5QrCode;
          
          const config = { 
            fps: 15, // Lower FPS for better stability on some devices
            qrbox: { width: 280, height: 180 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true
          };
          
          // Try with environment camera first, then fallback to any camera
          try {
            await html5QrCode.start(
              { facingMode: "environment" }, 
              config, 
              onScanSuccess, 
              onScanFailure
            );
          } catch (firstErr) {
            console.warn("Failed to start with environment camera, trying default", firstErr);
            await html5QrCode.start(
              { facingMode: "user" }, // Try user camera as fallback or just any
              config, 
              onScanSuccess, 
              onScanFailure
            );
          }

          if (!isMounted) return;

          // Check for flashlight support
          try {
            const track = (html5QrCode as any).getRunningTrack();
            if (track) {
              const capabilities = track.getCapabilities();
              if (capabilities.torch) {
                setHasFlash(true);
              }
            }
          } catch (e) {
            console.warn("Flashlight support check failed", e);
          }
        } catch (err) {
          console.error("Unable to start scanning.", err);
          if (isMounted) {
            setScanError("Kamera konnte nicht gestartet werden. Bitte stelle sicher, dass du den Kamerazugriff erlaubt hast.");
          }
        }
      };
      
      startScanner();
    }

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(err => console.error("Failed to stop scanner", err));
      }
    };
  }, [isScanning]);

  const toggleFlash = async () => {
    if (!html5QrCodeRef.current || !hasFlash) return;
    
    try {
      const track = (html5QrCodeRef.current as any).getRunningTrack();
      const newState = !isFlashOn;
      await track.applyConstraints({
        advanced: [{ torch: newState }] as any
      });
      setIsFlashOn(newState);
    } catch (err) {
      console.error("Failed to toggle flash", err);
    }
  };

  async function onScanSuccess(decodedText: string) {
    console.log(`Scan success: ${decodedText}`);
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (e) {
        console.error("Failed to stop scanner on success", e);
      }
    }
    setIsScanning(false);
    fetchProductData(decodedText);
  }

  function onScanFailure(error: any) {
    // Too many logs if we log every failure
  }

  async function fetchProductData(barcode: string) {
    setIsLoadingProduct(true);
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();
      if (data.status === 1) {
        setProductName(data.product.product_name || 'Unbekanntes Produkt');
        if (data.product.image_url) {
          setImageUrl(data.product.image_url);
        }
      } else {
        setProductName(`Barcode: ${barcode}`);
      }
    } catch (error) {
      console.error("Error fetching product data", error);
      setProductName(`Barcode: ${barcode}`);
    } finally {
      setIsLoadingProduct(false);
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Submitting product:", { productName, category, quantity, expiryDate });
    onSave({
      name: productName || 'Neues Produkt',
      category,
      quantity,
      expiryDate: expiryDate || new Date().toISOString(),
      imageUrl,
      tags: [category]
    });
  };

  return (
    <div className="max-w-md mx-auto px-6 pt-4 space-y-8 pb-32">
      {/* Scanner Viewfinder Section */}
      <section className="relative overflow-hidden rounded-[2rem] aspect-[4/3] bg-on-surface group">
        {isScanning ? (
          <div className="w-full h-full relative bg-black">
            <div id="reader" className="w-full h-full overflow-hidden rounded-[2rem]"></div>
            
            {/* Overlay for Scanning */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
              <div className="w-[280px] h-[180px] border-2 border-primary/40 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                
                {/* Scanning Line Animation */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/80 shadow-[0_0_15px_rgba(0,107,27,0.8)] animate-[scan_2.5s_ease-in-out_infinite]" />
              </div>
              <p className="mt-8 text-white/90 text-[10px] font-bold tracking-widest uppercase bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                Barcode im Rahmen platzieren
              </p>
            </div>

            {scanError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-6 text-center z-10">
                <X className="w-12 h-12 text-tertiary mb-4" />
                <p className="font-bold mb-6">{scanError}</p>
                <div className="flex flex-col gap-3 w-full max-w-[200px]">
                  <button 
                    onClick={() => {
                      setIsScanning(false);
                      setTimeout(() => setIsScanning(true), 100);
                    }}
                    className="w-full py-3 bg-primary rounded-xl text-sm font-bold shadow-lg"
                  >
                    Erneut versuchen
                  </button>
                  <button 
                    onClick={() => setIsScanning(false)}
                    className="w-full py-3 bg-white/10 rounded-xl text-sm font-bold border border-white/20"
                  >
                    Manuell eingeben
                  </button>
                </div>
              </div>
            )}
            <button 
              onClick={() => setIsScanning(false)}
              className="absolute top-4 right-4 p-2 bg-black/40 rounded-full text-white z-20"
            >
              <X className="w-6 h-6" />
            </button>
            {hasFlash && (
              <button 
                onClick={toggleFlash}
                className={`absolute bottom-4 right-4 p-3 rounded-full z-20 transition-colors ${isFlashOn ? 'bg-primary text-white' : 'bg-black/40 text-white'}`}
              >
                <Zap className={`w-6 h-6 ${isFlashOn ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        ) : (
          <div className="w-full h-full relative">
            <img 
              alt="Product" 
              className="w-full h-full object-cover" 
              src={imageUrl} 
              referrerPolicy="no-referrer"
            />
            <button 
              onClick={() => setIsScanning(true)}
              className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-bold gap-2"
            >
              <RefreshCw className="w-6 h-6" />
              Erneut scannen
            </button>
          </div>
        )}
      </section>

      {isScanning && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-on-surface-variant text-[11px] font-medium text-center px-8">
            <span className="text-primary font-bold">Tipp:</span> Halte das Handy ruhig und achte auf ausreichend Licht für ein optimales Scan-Ergebnis.
          </p>
          <button 
            onClick={() => setIsScanning(false)}
            className="text-primary font-bold text-sm flex items-center gap-2 py-2.5 px-6 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            <Scan className="w-4 h-4" />
            Barcode manuell eingeben
          </button>
        </div>
      )}

      {/* Product Entry Form */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="font-headline font-extrabold text-2xl text-on-surface tracking-tight">Produktdetails</h2>
          <p className="text-on-surface-variant text-sm">Überprüfe die gescannten Daten und lege das Ablaufdatum fest.</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Product Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-primary uppercase tracking-widest ml-1">PRODUKTNAME</label>
            <div className="relative">
              <input 
                className="w-full bg-surface-container-low border-transparent focus:border-primary focus:ring-0 rounded-xl px-5 py-4 text-on-surface font-semibold text-lg transition-all outline outline-variant/15" 
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder={isLoadingProduct ? "Lade Produktdaten..." : "Produktname eingeben"}
                required
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary">
                {isLoadingProduct ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : productName && (
                  <CheckCircle className="w-6 h-6 fill-primary-container" />
                )}
              </div>
            </div>
          </div>

          {/* Category & Quantity Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">KATEGORIE</label>
              <select 
                className="w-full bg-surface-container-low border-transparent focus:border-primary focus:ring-0 rounded-xl px-5 py-4 text-on-surface font-medium transition-all outline outline-variant/15 appearance-none"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
              >
                <option value="Speisekammer">Speisekammer</option>
                <option value="Kühlschrank">Kühlschrank</option>
                <option value="Gefrierfach">Gefrierfach</option>
                <option value="Obst & Gemüse">Obst & Gemüse</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">MENGE</label>
              <input 
                className="w-full bg-surface-container-low border-transparent focus:border-primary focus:ring-0 rounded-xl px-5 py-4 text-on-surface font-medium transition-all outline outline-variant/15" 
                type="text" 
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Expiry Date Picker */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">ABLAUFDATUM (MHD)</label>
            <input 
              className="w-full bg-surface-container-low border-transparent focus:border-primary focus:ring-0 rounded-xl px-5 py-4 text-on-surface font-medium transition-all outline outline-variant/15" 
              type="date" 
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
            />
          </div>

          {/* Save Action */}
          <div className="pt-6">
            <button 
              type="submit"
              className="w-full py-5 rounded-xl font-headline font-extrabold text-lg text-white bg-gradient-to-br from-primary to-primary-container shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Save className="w-6 h-6" />
              In Vorratskammer speichern
            </button>
            <button 
              type="button"
              onClick={onBack}
              className="w-full mt-4 py-4 text-on-surface-variant font-bold text-sm hover:text-primary transition-colors"
            >
              Eintrag abbrechen
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
