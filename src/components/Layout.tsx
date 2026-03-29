import React from 'react';
import { Home, List, Utensils, User, Menu, Search } from 'lucide-react';
import { Screen } from '../types';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

export default function Layout({ children, activeScreen, onScreenChange }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-md border-b border-outline-variant/10">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors">
              <Menu className="w-6 h-6 text-primary" />
            </button>
            <h1 className="font-headline font-extrabold text-xl text-primary tracking-tight">
              Vorratskammer
            </h1>
          </div>
          <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors">
            <Search className="w-6 h-6 text-primary" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-surface-container-lowest/80 backdrop-blur-xl border-t border-outline-variant/10 px-4 pb-8 pt-3 z-50 rounded-t-[2.5rem] shadow-[0_-4px_24px_rgba(43,48,46,0.06)]">
        <div className="flex justify-around items-center max-w-md mx-auto relative">
          <NavItem 
            icon={<Home className="w-6 h-6" />} 
            label="Start" 
            active={activeScreen === 'start'} 
            onClick={() => onScreenChange('start')} 
          />
          <NavItem 
            icon={<List className="w-6 h-6" />} 
            label="Inventar" 
            active={activeScreen === 'inventar'} 
            onClick={() => onScreenChange('inventar')} 
          />
          
          {/* Spacer for FAB if needed, but here we just use it as a regular nav item for now */}
          <NavItem 
            icon={<Utensils className="w-6 h-6" />} 
            label="Rezepte" 
            active={activeScreen === 'rezepte'} 
            onClick={() => onScreenChange('rezepte')} 
          />
          <NavItem 
            icon={<User className="w-6 h-6" />} 
            label="Profil" 
            active={activeScreen === 'profil'} 
            onClick={() => onScreenChange('profil')} 
          />
        </div>
      </nav>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center px-4 py-2 rounded-2xl transition-all duration-300",
        active 
          ? "bg-gradient-to-br from-primary to-primary-container text-white scale-105 shadow-lg shadow-primary/20" 
          : "text-outline hover:text-primary"
      )}
    >
      {icon}
      <span className="font-body font-medium text-[10px] uppercase tracking-wider mt-1">
        {label}
      </span>
    </button>
  );
}
