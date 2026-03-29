import React, { useState, FormEvent } from 'react';
import { Camera, X, Check, Loader2, PackageOpen, CalendarPlus } from 'lucide-react';
import { Category, AddProductProps } from '../types';
import { CameraCapture } from './CameraCapture';
import { analyzeProductImage, analyzeExpiryDateImage } from '../services/geminiService';

export default function AddProduct({ onSave, onBack }: AddProductProps) {
  // Wizard state
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [captureMode, setCaptureMode] = useState<'product' | 'expiry' | 'none'>('none');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiLoadingText, setAiLoadingText] = useState('');

  // Form states
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState<Category>('Speisekammer');
  const [quantity, setQuantity] = useState('1');
  const [expiryDate, setExpiryDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  });

  async function handleProductCapture(base64Image: string) {
    setCaptureMode('none');
    setIsProcessingAI(true);
    setAiLoadingText("Lese Etikett und Haltbarkeit...");
    try {
      const result = await analyzeProductImage(base64Image);
      if (result.productName) setProductName(result.productName);
      if (result.category) setCategory(result.category);
      
      if (result.expiryDate) {
        setExpiryDate(result.expiryDate);
        setWizardStep(3); // Perfekt: sofort zu Check & Save
      } else {
        setWizardStep(2); // Zu Schritt 2: MHD Foto machen
      }
    } catch (err: any) {
      console.error(err);
      alert("KI konnte das Bild nicht lesen: " + (err?.message || err));
    } finally {
      setIsProcessingAI(false);
    }
  }

  async function handleExpiryCapture(base64Image: string) {
    setCaptureMode('none');
    setIsProcessingAI(true);
    setAiLoadingText("Studiere das Ablaufdatum...");
    try {
      const result = await analyzeExpiryDateImage(base64Image);
      if (result.expiryDate) {
        setExpiryDate(result.expiryDate);
      } else {
        alert("KI konnte leider kein Datum finden. Bitte trage es manuell ein.");
      }
      setWizardStep(3);
    } catch (err: any) {
      console.error(err);
      alert("Fehler bei der MHD-Analyse: " + (err?.message || err));
      setWizardStep(3);
    } finally {
      setIsProcessingAI(false);
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      name: productName || 'Neues Produkt',
      category,
      quantity,
      expiryDate: expiryDate || new Date().toISOString(),
      imageUrl: 'https://picsum.photos/seed/newproduct/200/200',
      tags: [category]
    });
  };

  // 1. Fullscreen Captures
  if (captureMode === 'product') {
    return <CameraCapture title="Produkt fotografieren" onClose={() => setCaptureMode('none')} onCapture={handleProductCapture} />;
  }
  if (captureMode === 'expiry') {
    return <CameraCapture title="Ablaufdatum knipsen" onClose={() => setCaptureMode('none')} onCapture={handleExpiryCapture} />;
  }

  // 2. Fullscreen AI Loading
  if (isProcessingAI) {
    return (
     <div className="max-w-md mx-auto px-6 pt-4 min-h-[100dvh] flex flex-col bg-background">
      <div className="flex items-center justify-between mb-8 opacity-0">
        <button className="p-2"><X className="w-6 h-6" /></button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-pulse">
         <Loader2 className="w-16 h-16 text-primary animate-spin mb-6 mx-auto" />
         <h2 className="font-headline font-bold text-on-surface text-2xl">{aiLoadingText}</h2>
         <p className="text-on-surface-variant text-base mt-2">Das geht blitzschnell über die Cloud...</p>
      </div>
     </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 pt-4 space-y-6 pb-32 min-h-[100dvh] flex flex-col bg-background relative">
      {/* Header Navigation */}
      <div className="flex items-center justify-between mb-2">
        <button onClick={onBack} className="p-2 border border-outline-variant rounded-full text-on-surface hover:bg-surface-container transition-colors">
          <X className="w-6 h-6" />
        </button>
        <span className="font-headline font-bold text-xl text-on-surface">Neues Produkt</span>
        <button className="p-2 rounded-full opacity-0 pointer-events-none">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-2 mb-8">
        <div className={`h-2 rounded-full flex-1 transition-colors duration-500 ${wizardStep >= 1 ? 'bg-primary' : 'bg-surface-container-high'}`} />
        <div className={`h-2 rounded-full flex-1 transition-colors duration-500 ${wizardStep >= 2 ? 'bg-primary' : 'bg-surface-container-high'}`} />
        <div className={`h-2 rounded-full flex-1 transition-colors duration-500 ${wizardStep >= 3 ? 'bg-primary' : 'bg-surface-container-high'}`} />
      </div>

      {/* STEP 1: Produkt-Foto */}
      {wizardStep === 1 && (
        <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-24 h-24 bg-primary-container text-on-primary-container rounded-[2rem] flex items-center justify-center shadow-sm">
            <PackageOpen className="w-12 h-12" />
          </div>
          <div className="space-y-3">
            <h2 className="font-headline font-bold text-2xl text-on-surface">Schritt 1: Das Produkt</h2>
            <p className="text-on-surface-variant text-base max-w-[280px] mx-auto leading-relaxed">
              Bitte fotografiere zuerst das Produkt von vorn, damit wir Name und Marke kennen.
            </p>
          </div>
          
          <button 
            onClick={() => setCaptureMode('product')}
            className="w-full flex items-center justify-center gap-3 bg-primary text-white font-bold text-lg py-5 rounded-[2rem] shadow-lg hover:-translate-y-1 active:scale-95 transition-all mt-8 shadow-green-900/20"
          >
            <Camera className="w-6 h-6" />
            Kamera öffnen
          </button>
          
          <button 
            onClick={() => setWizardStep(3)}
            className="text-on-surface-variant text-sm font-semibold underline decoration-on-surface-variant/30 hover:text-on-surface transition-colors mt-6 p-2"
          >
            Ich möchte das Produkt manuell eintippen
          </button>
        </div>
      )}

      {/* STEP 2: MHD-Foto */}
      {wizardStep === 2 && (
        <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-24 h-24 bg-secondary-container text-on-secondary-container rounded-[2rem] flex items-center justify-center shadow-sm relative">
            <CalendarPlus className="w-12 h-12 relative top-[-2px]" />
          </div>
          <div className="space-y-3">
            <h2 className="font-headline font-bold text-2xl text-on-surface">Schritt 2: Haltbarkeit</h2>
            {productName && (
              <p className="font-bold text-primary mb-1">Erkannt: "{productName}" 🎉</p>
            )}
            <p className="text-on-surface-variant text-base max-w-[280px] mx-auto leading-relaxed">
              Bitte fotografiere jetzt noch das Mindest&shy;haltbarkeits&shy;datum (MHD) ganz nah.
            </p>
          </div>
          
          <button 
            onClick={() => setCaptureMode('expiry')}
            className="w-full flex items-center justify-center gap-3 bg-secondary text-white font-bold text-lg py-5 rounded-[2rem] shadow-lg hover:-translate-y-1 active:scale-95 transition-all mt-8"
          >
            <Camera className="w-6 h-6" />
            Datum einscannen
          </button>
          
          <button 
            onClick={() => setWizardStep(3)}
            className="text-on-surface-variant text-sm font-semibold underline decoration-on-surface-variant/30 hover:text-on-surface transition-colors mt-6 p-2"
          >
            Überspringen (kein MHD zu finden)
          </button>
        </div>
      )}

      {/* STEP 3: Formular (Check & Save) */}
      {wizardStep === 3 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-4">
            <h2 className="font-headline font-bold text-2xl text-on-surface">Schritt 3: Überprüfen</h2>
            <p className="text-on-surface-variant text-sm mt-0.5">Stimmen die Daten? Passe sie ggf. an.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-surface-container p-5 rounded-[2rem] shadow-sm relative z-10 flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-on-surface mb-1.5 pl-1">Produktname</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full bg-background rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary font-medium text-on-surface border border-outline-variant/30 text-sm"
                placeholder="z.B. Bio Hafermilch"
                required
                autoCapitalize="words"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-on-surface mb-1.5 pl-1">Kategorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full bg-background rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary font-medium text-on-surface appearance-none border border-outline-variant/30 text-sm"
              >
                <option value="Kühlschrank">Kühlschrank</option>
                <option value="Speisekammer">Speisekammer</option>
                <option value="Gefrierfach">Gefrierfach</option>
                <option value="Obst & Gemüse">Obst & Gemüse</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-on-surface mb-1.5 pl-1">Anzahl</label>
                <div className="flex bg-background border border-outline-variant/30 rounded-xl overflow-hidden h-11">
                  <button type="button" onClick={() => setQuantity(String(Math.max(1, parseInt(quantity||'1') - 1)))} className="px-3 text-primary font-bold hover:bg-surface-container transition-colors">-</button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-transparent text-center outline-none font-bold text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-on-surface"
                  />
                  <button type="button" onClick={() => setQuantity(String(parseInt(quantity||'0') + 1))} className="px-3 text-primary font-bold hover:bg-surface-container transition-colors">+</button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-on-surface mb-1.5 pl-1 tracking-tight">MHD (Ablaufdatum)</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full h-11 bg-background border border-outline-variant/30 rounded-xl px-3 outline-none focus:ring-2 focus:ring-primary font-medium text-on-surface text-sm leading-none"
                />
              </div>
            </div>
            
            {/* Speichern Button jetzt direkt im Formularfluss */}
            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold text-lg py-3.5 rounded-full shadow-lg hover:-translate-y-1 active:scale-95 transition-all shadow-green-900/20 disabled:opacity-50 mt-4"
              disabled={!productName.trim()}
            >
              <Check className="w-6 h-6" />
              Produkt speichern
            </button>

            {/* Optionaler Neu-Scan-Button versteckt unter dem Formular für manuelle Korrektur */}
            <button 
              type="button"
              onClick={() => {
                setProductName(''); 
                setWizardStep(1);
              }}
              className="w-full text-center text-primary text-xs font-bold pt-2 hover:underline"
            >
              ↻ Nochmal von Vorn scannen
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
