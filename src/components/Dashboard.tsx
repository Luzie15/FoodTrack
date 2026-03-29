import { AlertTriangle, Clock, ChevronRight, Barcode } from 'lucide-react';
import { PantryItem } from '../types';
import { getRemainingDays } from '../lib/utils';

interface DashboardProps {
  items: PantryItem[];
  onAddClick: () => void;
}

export default function Dashboard({ items, onAddClick }: DashboardProps) {
  const expiringSoon = items.filter(item => item.status === 'expired' || item.status === 'warning');
  const safeStock = items.filter(item => item.status === 'safe' || item.status === 'fresh');

  const getDayText = (item: PantryItem) => {
    const days = getRemainingDays(item.expiryDate);
    if (days < 0) return 'Abgelaufen';
    if (days === 0) return 'Heute';
    if (days === 1) return 'Noch 1 Tag';
    return `Noch ${days} Tage`;
  };


  return (
    <div className="px-6 py-8">
      {/* Hero Section */}
      <section className="mb-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
        <div className="md:col-span-7">
          <h2 className="font-headline font-extrabold text-4xl md:text-5xl text-on-surface mb-4 leading-tight">
            Deine Vorratskammer, <br />
            <span className="text-primary italic font-medium">sorgfältig kuratiert.</span>
          </h2>
          <p className="text-on-surface-variant max-w-md text-lg">
            Verwalte deine Vorräte mit Fokus auf Frische und Achtsamkeit.
          </p>
        </div>
        <div className="md:col-span-5 hidden md:block">
          <div className="aspect-[4/3] rounded-[2.5rem] bg-surface-container-high overflow-hidden shadow-sm relative">
            <img 
              className="w-full h-full object-cover grayscale-[20%] opacity-90" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4F9X3dzVcFCI5jsWNWcT3bsx176bQEtkaNV9iDCUkScMnBdEhQLNbZn6iycPvvWOfAfFO8NA-8fUvoeklMzqRPweavJrnCA6ltIb55ebgyRVpu8n-BX7RMTlFAkbXhfeU5WzUeywmfiy7Z22afkvA_dX4Zwrav0FGJ0T32Cji3ViINvSK7k7bcpKiPgf2Wc3g7Rf2gnNwHNZBDxM8pH_esy-5IzoeK3JaGsbfNH0Wv_CybThov5dP3FP1KiD7WjNJbsC64A0C9D4F" 
              alt="Pantry"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-6 left-6 bg-white/40 backdrop-blur-lg p-4 rounded-2xl border border-white/20">
              <span className="text-xs uppercase tracking-widest font-bold text-primary block mb-1">Status</span>
              <p className="font-headline font-bold text-on-surface">{expiringSoon.length} Artikel laufen bald ab</p>
            </div>
          </div>
        </div>
      </section>

      {/* Critical Alerts */}
      <section className="mb-12">
        <div className="flex items-baseline justify-between mb-6 px-2">
          <h3 className="font-headline font-bold text-2xl">Dringend verbrauchen</h3>
          <span className="text-sm font-medium text-primary cursor-pointer">Kalender</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {expiringSoon.map(item => (
            <div 
              key={item.id}
              className="bg-surface-container-lowest rounded-[2rem] p-6 relative overflow-hidden group shadow-[0_-4px_24px_rgba(43,48,46,0.04)] transition-all hover:shadow-lg"
            >
              <div className={item.status === 'expired' ? "absolute left-0 top-0 bottom-0 w-1.5 bg-tertiary" : "absolute left-0 top-0 bottom-0 w-1.5 bg-secondary"} />
              <div className="flex justify-between items-start mb-8">
                <div className={item.status === 'expired' ? "p-3 rounded-2xl bg-tertiary/10 text-tertiary" : "p-3 rounded-2xl bg-secondary/10 text-secondary"}>
                  {item.status === 'expired' ? <AlertTriangle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                </div>
                <span className={item.status === 'expired' ? "bg-tertiary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter" : "bg-secondary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter"}>
                  {getDayText(item).toUpperCase()}
                </span>
              </div>
              <div>
                <h4 className="font-headline font-bold text-xl mb-1 line-clamp-2">{item.name}</h4>
                <p className="text-on-surface-variant text-sm mb-4 line-clamp-1">{item.tags?.join(' • ')}</p>

                <div className="flex items-center gap-2">
                  <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div className={item.status === 'expired' ? "h-full bg-tertiary w-full" : "h-full bg-secondary w-1/4"} />
                  </div>
                  <span className={item.status === 'expired' ? "text-xs font-bold text-tertiary" : "text-xs font-bold text-secondary"}>
                    {getRemainingDays(item.expiryDate)}d
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Safe Stock */}
      <section className="mb-12">
        <h3 className="font-headline font-bold text-2xl mb-6 px-2">Sicherer Vorrat</h3>
        <div className="space-y-4">
          {safeStock.map(item => (
            <div 
              key={item.id}
              className="bg-surface-container-lowest rounded-3xl p-5 flex items-center gap-6 group hover:bg-surface-bright transition-colors"
            >
              <div className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary overflow-hidden">
                <img 
                  className="w-full h-full object-cover" 
                  src={item.imageUrl} 
                  alt={item.name}
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase w-fit mb-1 bg-primary/10 text-primary">
                    SICHER
                  </span>
                  <h4 className="font-headline font-bold text-sm sm:text-base text-on-surface line-clamp-2 leading-tight">{item.name}</h4>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold mt-1">
                    {item.tags?.[0]} • {getDayText(item).toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 min-w-[50px]">
                <p className="text-base font-bold font-headline leading-none">{item.quantity}</p>
                <p className="text-[9px] uppercase font-bold text-outline mt-1 tracking-wider">{item.category}</p>
              </div>
              <div className="w-1 h-12 bg-primary rounded-full" />
            </div>
          ))}
        </div>
      </section>

      {/* FAB: Central Scan Button */}
      <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[60]">
        <button 
          onClick={onAddClick}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-container text-white shadow-xl shadow-green-900/20 flex items-center justify-center active:scale-90 transition-transform duration-200 ring-8 ring-background"
        >
          <Barcode className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
