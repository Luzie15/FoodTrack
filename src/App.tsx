import { useState, useEffect, FormEvent } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Recipes from './components/Recipes';
import AddProduct from './components/AddProduct';
import ErrorBoundary from './components/ErrorBoundary';
import { Screen, PantryItem } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { LogIn, Loader2, Mail, Lock, ArrowRight } from 'lucide-react';
import { calculateStatus } from './lib/utils';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('start');
  const [items, setItems] = useState<PantryItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }

    const q = query(collection(db, 'items'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newItems = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          status: calculateStatus(data.expiryDate || new Date().toISOString())
        };
      }) as PantryItem[];
      setItems(newItems);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'items');
    });

    return () => unsubscribe();
  }, [user]);

  const addItem = async (newItem: Omit<PantryItem, 'id' | 'status' | 'uid'>) => {
    if (!user) {
      console.error("Cannot add item: No user logged in");
      return;
    }

    console.log("Adding item to Firestore:", newItem);
    try {
      const itemData = {
        ...newItem,
        uid: user.uid,
        status: calculateStatus(newItem.expiryDate),
        createdAt: new Date().toISOString(),
        serverCreatedAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, 'items'), itemData);
      console.log("Item added successfully with ID:", docRef.id);
      setActiveScreen('inventar');
    } catch (error) {
      console.error("Error adding item to Firestore:", error);
      handleFirestoreError(error, OperationType.CREATE, 'items');
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'items', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `items/${id}`);
    }
  };

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthMessage('');
    setAuthLoading(true);

    try {
      if (authMode === 'login') {
        await loginWithEmail(email, password);
      } else if (authMode === 'register') {
        await registerWithEmail(email, password);
      } else if (authMode === 'forgot') {
        await resetPassword(email);
        setAuthMessage('Passwort-Reset Link wurde an deine E-Mail gesendet.');
      }
    } catch (error: any) {
      console.error("Auth error", error);
      let message = "Ein Fehler ist aufgetreten.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') message = "E-Mail oder Passwort falsch.";
      else if (error.code === 'auth/user-not-found') message = "Kein Benutzer mit dieser E-Mail gefunden.";
      else if (error.code === 'auth/email-already-in-use') message = "Diese E-Mail wird bereits verwendet.";
      else if (error.code === 'auth/weak-password') message = "Das Passwort ist zu schwach (min. 6 Zeichen).";
      else if (error.code === 'auth/invalid-email') message = "Die E-Mail-Adresse ist ungültig.";
      else message = error.message;
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center text-center mb-8 mt-8">
            <div className="w-24 h-24 mb-6 shadow-xl shadow-primary/20 rounded-full overflow-hidden border-4 border-surface-container-lowest">
              <img src="/logo.png" alt="FoodTrack Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="font-headline font-extrabold text-3xl mb-2 text-on-surface">FoodTrack</h1>
            <p className="text-on-surface-variant">
              {authMode === 'login' && 'Melde dich an, um deine Vorräte zu verwalten.'}
              {authMode === 'register' && 'Erstelle ein Konto für deine Vorräte.'}
              {authMode === 'forgot' && 'Setze dein Passwort zurück.'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm mb-6 flex flex-col gap-4">
            
            {(authError || authMessage) && (
              <div className={`p-4 rounded-2xl text-sm font-semibold text-center leading-relaxed ${authError ? 'bg-tertiary-container text-tertiary shadow-sm' : 'bg-primary-container text-primary shadow-sm'}`}>
                {authError || authMessage}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-on-surface mb-2 ml-1">E-Mail Adresse</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hallo@beispiel.de"
                  className="w-full bg-background border-none rounded-2xl py-4 pl-12 pr-4 text-on-surface focus:ring-2 focus:ring-primary outline-none transition-shadow"
                  required
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
              </div>
            </div>

            {authMode !== 'forgot' && (
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2 ml-1">Passwort</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mindestens 6 Zeichen"
                    className="w-full bg-background border-none rounded-2xl py-4 pl-12 pr-4 text-on-surface focus:ring-2 focus:ring-primary outline-none transition-shadow"
                    required
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full mt-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-70 disabled:active:scale-100"
            >
              {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  {authMode === 'login' && 'Anmelden'}
                  {authMode === 'register' && 'Konto erstellen'}
                  {authMode === 'forgot' && 'Reset Link senden'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="flex flex-col gap-3 mt-2">
              {authMode === 'login' && (
                <>
                  <button type="button" onClick={() => {setAuthMode('forgot'); setAuthError(''); setAuthMessage('');}} className="text-secondary font-bold text-sm text-center py-2 transition-colors hover:text-secondary-container">
                    Passwort vergessen?
                  </button>
                  <button type="button" onClick={() => {setAuthMode('register'); setAuthError(''); setAuthMessage('');}} className="text-primary font-bold text-sm text-center py-2 transition-colors opacity-80 hover:opacity-100">
                    Noch kein Konto? Registrieren
                  </button>
                </>
              )}
              {authMode === 'register' && (
                <button type="button" onClick={() => {setAuthMode('login'); setAuthError(''); setAuthMessage('');}} className="text-primary font-bold text-sm text-center py-2 transition-colors opacity-80 hover:opacity-100">
                  Bereits ein Konto? Anmelden
                </button>
              )}
              {authMode === 'forgot' && (
                <button type="button" onClick={() => {setAuthMode('login'); setAuthError(''); setAuthMessage('');}} className="text-primary font-bold text-sm text-center py-2 transition-colors opacity-80 hover:opacity-100">
                  Zurück zur Anmeldung
                </button>
              )}
            </div>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-on-surface-variant bg-background font-semibold">Oder</span>
            </div>
          </div>

          <button
            onClick={loginWithGoogle}
            type="button"
            className="w-full bg-surface-container-lowest text-on-surface font-bold py-4 rounded-2xl shadow-sm flex items-center justify-center gap-3 active:scale-95 transition-transform border border-outline/20 mb-12"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            Mit Google fortfahren
          </button>
        </div>
      </div>
    );
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case 'start':
        return <Dashboard items={items} onAddClick={() => setActiveScreen('add')} />;
      case 'inventar':
        return <Inventory items={items} onAddClick={() => setActiveScreen('add')} onDelete={deleteItem} />;
      case 'rezepte':
        return <Recipes />;
      case 'add':
        return <AddProduct onSave={addItem} onBack={() => setActiveScreen('inventar')} />;
      default:
        return <Dashboard items={items} onAddClick={() => setActiveScreen('add')} />;
    }
  };

  return (
    <Layout activeScreen={activeScreen} onScreenChange={setActiveScreen}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeScreen}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <ErrorBoundary>
            {renderScreen()}
          </ErrorBoundary>
        </motion.div>
      </AnimatePresence>

      <div className="fixed bottom-24 right-4 bg-black/60 backdrop-blur text-white/90 text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full z-[100] shadow-sm pointer-events-none border border-white/10">
        v0.2.1-scanner
      </div>
    </Layout>
  );
}

