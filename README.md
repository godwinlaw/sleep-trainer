# Sleep Training Tracker

A web app for tracking an infant's sleep-training progress based on the **"Twelve Hours in Twelve Weeks"** methodology. Tracks three pillars:

1. **Daytime feeds** — stretching intervals from 3h to 4h in 15-minute increments
2. **Nighttime feeds** — gradually eliminating feeds between 8 PM and 8 AM
3. **Naps** — hitting morning (60 min) and afternoon (120 min) duration targets

## Tech Stack

- **Next.js 16** + TypeScript
- **Tailwind CSS v4** — custom calming palette (slate-blue, soft-teal, warm-cream, muted-rose)
- **Framer Motion** — animations, micro-interactions, milestone celebrations
- **Firebase Firestore** — real-time data persistence

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd sleep-training
npm install
```

### 2. Configure Firebase

Create a `.env` file in the project root with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_APP_PASSWORD=your-chosen-password
```

In the Firebase console:
- Create a Firestore database
- Create two collections: `feeds` and `naps` (they'll be created automatically on first write)
- Set up Firestore rules as needed

### 3. Run locally

```bash
npm run dev      # Development server at http://localhost:3000
npm run build    # Production build
npm test         # Run test suite
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Today View — dashboard with timeline, oz counter, quick-log buttons |
| `/feed` | Feed list for today |
| `/nap` | Nap list for today |
| `/history` | Browse past days via calendar picker |
| `/progress` | Progress dashboard — interval, night, and nap trends |
| `/log/feed` | Log or edit a feed |
| `/log/nap` | Log or edit a nap |
| `/settings` | Configure baby name, interval goal, daily oz minimum |

## Architecture

```
src/
├── app/           # Next.js App Router pages
├── components/    # UI (Card, Button, etc.), layout, feed, nap, today, history, progress, settings
├── hooks/         # useFeeds, useNaps, useSettings, useDailySummary, useProgress
├── lib/           # Firebase, types, constants, calculations, date-utils, CRUD
└── __tests__/     # Unit tests for calculations, date-utils, feed-logic, progress-logic
```
