export type Category = 'Speisekammer' | 'Kühlschrank' | 'Gefrierfach' | 'Obst & Gemüse';

export interface PantryItem {
  id: string;
  name: string;
  category: Category;
  quantity: string;
  expiryDate: string; // ISO string
  status: 'expired' | 'warning' | 'safe' | 'fresh';
  imageUrl?: string;
  tags?: string[];
  uid: string;
  createdAt?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  savedItems: string[];
  time: string;
  imageUrl: string;
  category?: string;
}

export type Screen = 'start' | 'inventar' | 'rezepte' | 'profil' | 'add';
