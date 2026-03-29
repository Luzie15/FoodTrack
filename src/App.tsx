import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Recipes from './components/Recipes';
import AddProduct from './components/AddProduct';
import ErrorBoundary from './components/ErrorBoundary';
import { Screen, PantryItem } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, loginWithGoogle, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { LogIn, Loader2 } from 'lucide-react';
import { calculateStatus } from './lib/utils';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('start');
  const [items, setItems] = useState<PantryItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background px-6 text-center">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8">
          <LogIn className="w-12 h-12 text-primary" />
        </div>
        <h1 className="font-headline font-extrabold text-3xl mb-4">Willkommen bei Vorratskammer</h1>
        <p className="text-on-surface-variant mb-12 max-w-xs">
          Melde dich an, um deine Vorräte sicher in der Cloud zu speichern und von überall darauf zuzugreifen.
        </p>
        <button
          onClick={loginWithGoogle}
          className="w-full max-w-xs bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-transform"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 bg-white rounded-full p-0.5" alt="Google" />
          Mit Google anmelden
        </button>
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
    </Layout>
  );
}

