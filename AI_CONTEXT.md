# Vorratskammer – Projektdokumentation

> Intelligente Lebensmittel-Vorratsverwaltungsapp mit Barcode-Scanner, Haltbarkeits-Tracking und Rezeptvorschlägen zur Lebensmittelrettung.

## Herkunft

Das Projekt wurde ursprünglich als **Google AI Studio Applet** erstellt.  
AI Studio App-ID: `9a53c49c-89f4-4ed8-96e6-cc8627bda5d5`

---

## Tech-Stack

| Bereich | Technologie | Version |
|---|---|---|
| **Framework** | React + TypeScript | React 19 |
| **Build Tool** | Vite | 6.x |
| **Styling** | Tailwind CSS (Vite-Plugin) | 4.x |
| **Datenbank** | Firebase Firestore (Cloud) | 12.x |
| **Auth** | Firebase Auth (Google OAuth) | 12.x |
| **Animationen** | Motion (framer-motion) | 12.x |
| **Icons** | Lucide React | 0.546+ |
| **Barcode-Scanner** | html5-qrcode | 2.3.x |
| **Produktdaten-API** | Open Food Facts | v0 |
| **AI (vorbereitet)** | Google Gemini API (@google/genai) | 1.29+ |
| **Fonts** | Manrope (Headlines) + Inter (Body) | Google Fonts |
| **Utilities** | clsx, tailwind-merge, date-fns | – |

---

## Projektstruktur

```
FoodTrack/
├── firebase-applet-config.json   # Firebase-Konfiguration (Project ID, API Key, DB ID)
├── firebase-blueprint.json       # Datenmodell-Schema (PantryItem)
├── firestore.rules               # Firestore Security Rules
├── metadata.json                 # AI Studio Applet-Metadaten
├── vite.config.ts                # Vite + Tailwind + React Config
├── index.html                    # Entry HTML
├── src/
│   ├── main.tsx                  # React Entry Point
│   ├── App.tsx                   # Haupt-App-Komponente (Routing, State, Firebase-Listener)
│   ├── types.ts                  # TypeScript Interfaces (PantryItem, Recipe, Screen)
│   ├── constants.ts              # Mock-Daten (Items + Rezepte)
│   ├── firebase.ts               # Firebase Init, Auth-Helpers, Error-Handling
│   ├── index.css                 # Tailwind-Import, Design-Tokens, Custom Keyframes
│   ├── lib/
│   │   └── utils.ts              # cn(), calculateStatus(), getRemainingDays()
│   └── components/
│       ├── Layout.tsx            # App-Shell mit Header + Bottom Navigation
│       ├── Dashboard.tsx         # Startseite: Hero, Ablauf-Alerts, sicherer Vorrat
│       ├── Inventory.tsx         # Inventar: Filterbarer Bestand mit Delete
│       ├── AddProduct.tsx        # Barcode-Scanner + Produktformular
│       ├── Recipes.tsx           # Retter-Rezepte (aktuell Mock-Daten)
│       └── ErrorBoundary.tsx     # React Error Boundary
```

---

## Screens / Navigation

Die App nutzt eine einfache Screen-basierte Navigation (kein React Router):

| Screen | Typ | Beschreibung |
|---|---|---|
| `start` | Dashboard | Übersicht: Hero, Ablauf-Warnungen, sicherer Vorrat |
| `inventar` | Inventory | Alle Produkte filterbar nach Kategorie, mit Lösch-Funktion |
| `add` | AddProduct | Barcode-Scanner + Formular zum Hinzufügen |
| `rezepte` | Recipes | Rezeptvorschläge aus ablaufenden Vorräten |
| `profil` | – | **Noch nicht implementiert** |

**Navigation:** Bottom Tab Bar (Layout.tsx) + Floating Action Buttons auf Dashboard/Inventar.

---

## Datenmodell

### PantryItem (Firestore Collection: `items`)

```typescript
interface PantryItem {
  id: string;              // Firestore Document ID
  name: string;            // Produktname (1–100 Zeichen)
  category: Category;      // 'Kühlschrank' | 'Speisekammer' | 'Gefrierfach' | 'Obst & Gemüse'
  quantity: string;        // Menge mit Einheit (z.B. "500g", "1.2L")
  expiryDate: string;      // ISO-Datum
  status: Status;          // 'fresh' | 'safe' | 'warning' | 'expired' (dynamisch berechnet)
  imageUrl?: string;       // Produktbild-URL (von Open Food Facts oder Platzhalter)
  tags?: string[];         // Tags (z.B. Kategorie-Tags)
  uid: string;             // Firebase Auth User-ID (Owner)
  createdAt?: string;      // ISO-Timestamp
}
```

### Status-Logik (berechnet in `lib/utils.ts`)

| Status | Bedingung | Farbe |
|---|---|---|
| `expired` | Tage < 0 | 🔴 Tertiary (Rot) |
| `warning` | Tage ≤ 3 | 🟡 Secondary (Gelb) |
| `safe` | Tage ≤ 7 | 🟢 Primary (Grün) |
| `fresh` | Tage > 7 | 🟢 Primary (Grün) |

### Recipe (aktuell nur Mock-Daten in constants.ts)

```typescript
interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  savedItems: string[];    // Zutaten die aus Vorräten "gerettet" werden
  time: string;
  imageUrl: string;
  category?: string;
}
```

---

## Design-System

### Farbpalette (Material Design 3-inspiriert, Tailwind 4 `@theme`)

Das Farbsystem folgt einer **Ampel-Logik** passend zum Lebensmittel-Thema:

| Token | Hex | Verwendung |
|---|---|---|
| `primary` | `#006b1b` | Grün – Frisch/Sicher, CTAs, Branding |
| `primary-container` | `#91f78e` | Helles Grün – Badges, Gradients |
| `secondary` | `#755700` | Gelb-Braun – Warnungen |
| `secondary-container` | `#ffca4d` | Gelb – Warning-Badges |
| `tertiary` | `#b71211` | Rot – Abgelaufen/Kritisch |
| `tertiary-container` | `#ff9385` | Helles Rot – Error-Hintergründe |
| `background` | `#f3f7f4` | Heller Hintergrund mit Grünstich |
| `surface-container-lowest` | `#ffffff` | Karten |
| `on-surface` | `#2b302e` | Haupttext |
| `on-surface-variant` | `#585c5a` | Sekundärtext |
| `outline` | `#737876` | Inaktive Elemente |

### Typografie

- **Headlines:** `Manrope` (font-headline) – extrabold, tight tracking
- **Body:** `Inter` (font-body) – regular bis semibold

### UI-Patterns

- Abgerundete Karten mit `rounded-3xl` / `rounded-[2rem]`
- Glasmorphism-Elemente (backdrop-blur + semi-transparente Backgrounds)
- Farbige Seitenleisten an Karten als Status-Indikator
- Gradient-Buttons (`bg-gradient-to-br from-primary to-primary-container`)
- Mobile-first Design mit Bottom Navigation

---

## Kernfunktionen im Detail

### 1. Barcode-Scanner (AddProduct.tsx)

- Nutzt `html5-qrcode` mit Kamera-Zugriff
- Unterstützt: EAN-13, EAN-8, UPC-A, UPC-E, CODE-128, CODE-39
- Versucht erst Rückkamera (`environment`), dann Frontkamera als Fallback
- Flashlight-Support wenn verfügbar
- Vibriert bei erfolgreichem Scan (`navigator.vibrate`)
- Overlay mit animierter Scan-Linie

### 2. Produkterkennung (Open Food Facts API)

```
GET https://world.openfoodfacts.org/api/v0/product/{barcode}.json
```
- Holt automatisch Produktname + Produktbild
- Fallback auf manuelle Eingabe bei unbekanntem Barcode

### 3. Firebase-Integration

- **Realtime-Listener** via `onSnapshot` – Änderungen sofort sichtbar
- **User-bezogene Daten** – jeder User sieht nur seine eigenen Items (`where('uid', '==', user.uid)`)
- **Firestore Security Rules** mit Validierung (Pflichtfelder, Kategorien, Status-Werte, URL-Format)
- **Admin-Rolle** für `luziepfeiffer@gmail.com` (hardcoded in Rules)

### 4. Gemini AI (vorbereitet, noch nicht aktiv)

- `@google/genai` ist installiert
- `GEMINI_API_KEY` wird über Vite-Env-Vars durchgereicht
- **Noch nicht im Code genutzt** – wahrscheinlich geplant für KI-gestützte Rezeptgenerierung

---

## Lokale Entwicklung

```bash
# Dependencies installieren
npm install

# .env.local erstellen mit:
GEMINI_API_KEY="dein-api-key"

# Dev-Server starten (Port 3000)
npm run dev
```

### Verfügbare Scripts

| Script | Befehl | Beschreibung |
|---|---|---|
| `dev` | `vite --port=3000 --host=0.0.0.0` | Entwicklungsserver |
| `build` | `vite build` | Produktions-Build |
| `preview` | `vite preview` | Build-Vorschau |
| `clean` | `rm -rf dist` | Build-Artefakte löschen |
| `lint` | `tsc --noEmit` | TypeScript Type-Check |

---

## Offene Punkte / TODOs

- [ ] **Profil-Screen** – Navigation existiert, Screen fehlt
- [ ] **Rezepte mit Gemini AI** – Rezeptvorschläge basierend auf echten Vorräten generieren
- [ ] **Rezepte aus Firestore** – Aktuell nur Mock-Daten
- [ ] **Swipe-to-Delete** – UI ist vorbereitet (roter Hintergrund), Swipe-Geste fehlt
- [ ] **Suche** – Such-Button im Header existiert, Funktion fehlt
- [ ] **Menü/Sidebar** – Hamburger-Menü-Button existiert, Funktion fehlt
- [ ] **Obst & Gemüse Kategorie** – In Types/Rules definiert, aber nicht im Inventar-Filter
- [ ] **Produktbild-Upload** – Aktuell nur URLs von Open Food Facts oder Platzhalter
