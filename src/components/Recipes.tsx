import { Utensils, Zap, ArrowRight, Heart } from 'lucide-react';
import { MOCK_RECIPES } from '../constants';

export default function Recipes() {
  return (
    <div className="px-6 pt-6 pb-32">
      {/* Hero Header */}
      <section className="mb-10">
        <h2 className="font-headline font-extrabold text-4xl tracking-tight text-on-surface mb-2">Retter-Rezepte</h2>
        <p className="text-on-surface-variant font-medium max-w-md">Köstliche Ideen aus deinen Vorräten, die heute verbraucht werden sollten.</p>
      </section>

      {/* Inspiration Chips */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar mb-10 -mx-6 px-6">
        <button className="bg-primary text-white px-5 py-2.5 rounded-full font-medium text-sm whitespace-nowrap shadow-sm">Alle Treffer</button>
        <button className="bg-surface-container-high text-on-surface px-5 py-2.5 rounded-full font-medium text-sm whitespace-nowrap hover:bg-surface-variant transition-colors">Schnell & Einfach</button>
        <button className="bg-surface-container-high text-on-surface px-5 py-2.5 rounded-full font-medium text-sm whitespace-nowrap hover:bg-surface-variant transition-colors">Vegetarisch</button>
        <button className="bg-surface-container-high text-on-surface px-5 py-2.5 rounded-full font-medium text-sm whitespace-nowrap hover:bg-surface-variant transition-colors">Frühstück</button>
      </div>

      {/* Featured Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
        {/* Hero Recipe Card */}
        <div className="md:col-span-8 group relative overflow-hidden rounded-[2rem] bg-surface-container-lowest shadow-[0_4px_24px_rgba(43,48,46,0.06)] h-[440px]">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
          <img 
            alt={MOCK_RECIPES[0].title} 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            src={MOCK_RECIPES[0].imageUrl}
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-0 left-0 p-8 z-20 w-full">
            <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest mb-4 inline-block">RETTET 4 ARTIKEL</span>
            <h3 className="font-headline font-extrabold text-3xl text-white mb-3 leading-tight">{MOCK_RECIPES[0].title}</h3>
            <div className="flex flex-wrap gap-2 items-center text-white/90 text-sm">
              {MOCK_RECIPES[0].ingredients.map((ing, i) => (
                <span key={ing}>
                  <span className="font-bold text-primary-container">{ing}</span>
                  {i < MOCK_RECIPES[0].ingredients.length - 1 && " • "}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Side Cards */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="flex-1 bg-surface-container-low rounded-[2rem] p-6 flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-on-secondary-container" />
              </div>
              <h4 className="font-headline font-bold text-xl text-on-surface leading-tight">{MOCK_RECIPES[1].title}</h4>
              <p className="text-on-surface-variant text-sm mt-2">
                Zutaten: <span className="font-bold text-secondary">{MOCK_RECIPES[1].ingredients.join(', ')}</span>
              </p>
            </div>
            <div className="mt-4 relative z-10">
              <button className="bg-surface-container-lowest text-on-surface-variant text-xs font-bold px-4 py-2 rounded-xl hover:bg-white transition-all active:scale-95">Rezept ansehen</button>
            </div>
            <Utensils className="absolute -right-4 -bottom-4 w-32 h-32 text-surface-container-highest opacity-30 select-none" />
          </div>

          <div className="flex-1 bg-tertiary-container/20 border border-tertiary/10 rounded-[2rem] p-6 flex flex-col justify-between overflow-hidden relative">
            <div className="relative z-10">
              <span className="text-[10px] font-bold text-tertiary uppercase tracking-wider block mb-2">BALD ABGELAUFEN</span>
              <h4 className="font-headline font-bold text-xl text-on-surface leading-tight">{MOCK_RECIPES[2].title}</h4>
              <p className="text-on-surface-variant text-sm mt-2">
                Zutaten: <span className="font-bold text-tertiary">{MOCK_RECIPES[2].ingredients.join(', ')}</span>
              </p>
            </div>
            <div className="mt-4 flex justify-between items-center relative z-10">
              <span className="text-xs text-on-surface-variant font-medium">{MOCK_RECIPES[2].time} Zubereitung</span>
              <div className="bg-tertiary text-white w-8 h-8 rounded-full flex items-center justify-center">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* More Ideas */}
      <h3 className="font-headline font-bold text-2xl mb-6">Weitere Ideen für dich</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-4">
            <div className="aspect-square rounded-[2rem] overflow-hidden shadow-sm relative group">
              <img 
                alt="Recipe" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                src={`https://picsum.photos/seed/recipe${i}/800/800`}
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-sm">
                <Heart className="w-5 h-5 text-primary fill-primary" />
              </div>
            </div>
            <div className="px-2">
              <h4 className="font-headline font-bold text-lg">Gemüsepfanne</h4>
              <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                Rettet <span className="font-bold text-primary">Brokkoli</span>, <span className="font-bold text-primary">Paprika</span> und <span className="font-bold text-primary">Zuckerschoten</span>.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
