import { useState } from 'react';
import { Trash2, Calendar, CheckCircle, Plus } from 'lucide-react';
import { Category, PantryItem } from '../types';
import { cn } from '../lib/utils';

interface InventoryProps {
  items: PantryItem[];
  onAddClick: () => void;
  onDelete: (id: string) => void;
}

export default function Inventory({ items, onAddClick, onDelete }: InventoryProps) {
  const [activeTab, setActiveTab] = useState<Category | 'Alle'>('Alle');

  const filteredItems = activeTab === 'Alle' 
    ? items 
    : items.filter(item => item.category === activeTab);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' });
    } catch (e) {
      return dateStr;
    }
  };

  const getStatusText = (item: PantryItem) => {
    if (item.status === 'expired') return 'Abgelaufen';
    if (item.status === 'warning') return 'Läuft bald ab';
    if (item.status === 'fresh') return 'Frisch';
    return 'Haltbar';
  };


  return (
    <div className="px-6 pt-4">
      {/* Segmented Filter Control */}
      <section className="mb-8">
        <div className="bg-surface-container-low p-1.5 rounded-3xl flex items-center justify-between shadow-sm overflow-x-auto no-scrollbar">
          {['Alle', 'Kühlschrank', 'Speisekammer', 'Gefrierfach'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-2xl text-sm font-semibold transition-all duration-300 whitespace-nowrap",
                activeTab === tab 
                  ? "bg-white shadow-sm text-primary" 
                  : "text-outline hover:text-primary"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {/* Inventory List Header */}
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="font-headline font-bold text-2xl tracking-tight">Läuft bald ab</h2>
        <span className="text-xs font-bold uppercase tracking-widest text-outline">NACH HALTBARKEIT SORTIERT</span>
      </div>

      {/* Inventory Items */}
      <div className="space-y-4">
        {filteredItems.map(item => (
          <div key={item.id} className="relative overflow-hidden group">
            {/* Swipe Action Reveal (Simulated) */}
            <div className="absolute inset-0 bg-tertiary flex items-center justify-end px-8 rounded-3xl">
              <Trash2 className="w-6 h-6 text-white" />
            </div>
            
            {/* Main Card */}
            <div className={cn(
              "relative bg-surface-container-lowest p-4 rounded-3xl shadow-[0_4px_12px_rgba(43,48,46,0.04)] flex items-center gap-4 border-l-[6px] translate-x-0 transition-transform duration-300",
              item.status === 'expired' ? "border-tertiary" : 
              item.status === 'warning' ? "border-secondary" : "border-primary"
            )}>
              <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center overflow-hidden shrink-0">
                <img 
                  className="w-full h-full object-cover" 
                  src={item.imageUrl} 
                  alt={item.name}
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col">
                  <span className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase w-fit mb-1",
                    item.status === 'expired' ? "bg-tertiary/10 text-tertiary" : 
                    item.status === 'warning' ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"
                  )}>
                    {getStatusText(item)}
                  </span>
                  <h3 className="font-headline font-bold text-on-surface line-clamp-2 leading-tight text-sm sm:text-base">{item.name}</h3>
                </div>
                
                <div className="flex items-center gap-2 mt-1.5">
                  {item.status === 'expired' ? (
                    <Calendar className="w-3.5 h-3.5 text-tertiary" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5 text-primary" />
                  )}
                  <p className={cn(
                    "text-[11px] font-semibold",
                    item.status === 'expired' ? "text-tertiary" : "text-on-surface-variant"
                  )}>
                    {item.status === 'expired' ? `Abgelaufen am ${formatDate(item.expiryDate)}` : `Läuft ab am ${formatDate(item.expiryDate)}`}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0 min-w-[60px]">
                <button 
                  onClick={() => onDelete(item.id)}
                  className="p-2 text-outline hover:text-tertiary transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="text-right">
                  <p className="text-base font-bold font-headline leading-none">{item.quantity}</p>
                  <p className="text-[9px] uppercase font-bold text-outline mt-1 tracking-wider">{item.category}</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State Contextual Hint */}
        {filteredItems.length === 0 && (
          <div className="pt-8 pb-4 text-center">
            <div className="bg-surface-container-low rounded-3xl p-8 border-2 border-dashed border-outline-variant/30">
              <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-3">
                <Plus className="w-6 h-6 text-outline-variant" />
              </div>
              <p className="text-on-surface-variant font-medium text-sm">Keine Artikel in dieser Kategorie gefunden.</p>
              <button 
                onClick={onAddClick}
                className="mt-4 text-primary font-bold text-sm tracking-tight flex items-center justify-center gap-2 w-full"
              >
                Ersten Artikel hinzufügen <CheckCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FAB */}
      <button 
        onClick={onAddClick}
        className="fixed bottom-28 right-6 w-16 h-16 bg-gradient-to-br from-primary to-primary-container text-white rounded-full shadow-[0_8px_24px_rgba(0,107,27,0.3)] flex items-center justify-center z-40 active:scale-90 transition-transform duration-200"
      >
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
}
