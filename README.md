# WebChat

A real-time group chat application built with Next.js, TypeScript, Tailwind CSS, and Firebase.

## Features

- Email/password authentication
- Google Sign-In
- Real-time group chat rooms powered by Firestore
- Create and browse chat groups
- User profile display (name + avatar)
- Dark UI inspired by Discord/Slack

## Prerequisites

- Node.js 18+
- A Firebase project (free Spark plan is sufficient)

## Firebase Setup

### 1. Create a Firebase project

1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Click **Add project** and follow the wizard (you can disable Google Analytics)
3. Once created, click the web icon (`</>`) to register a web app
4. Copy the `firebaseConfig` values shown — you will need them in the next step

### 2. Enable Authentication

1. In the Firebase console, go to **Build > Authentication**
2. Click **Get started**
3. Enable **Email/Password** provider
4. Enable **Google** provider (set a support email when prompted)

### 3. Enable Firestore

1. Go to **Build > Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode** (the security rules in `firestore.rules` will handle access)
4. Select a region and click **Enable**

### 4. Deploy Firestore security rules

Option A — via the Firebase CLI:
```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # select your project, accept defaults
firebase deploy --only firestore:rules
```

Option B — paste the contents of `firestore.rules` directly in the Firebase console under **Firestore > Rules**.

### 5. Configure environment variables

Edit `.env.local` and fill in your project credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

All values are found in the Firebase console under **Project settings > General > Your apps**.

## Running the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
  app/
    layout.tsx              # Root layout with AuthProvider
    page.tsx                # Redirect to /chat or /login
    login/page.tsx          # Login page (email + Google)
    register/page.tsx       # Registration page
    chat/page.tsx           # Main chat page
  components/
    GroupList.tsx           # Sidebar: group list + search + user info
    ChatRoom.tsx            # Message feed + send input
    CreateGroupModal.tsx    # Modal to create a new group
  contexts/
    AuthContext.tsx         # Firebase auth state provider
  lib/
    firebase.ts             # Firebase app initialisation
  middleware.ts             # Next.js middleware (route matcher)
firestore.rules             # Firestore security rules
.env.local                  # Environment variables (fill in your credentials)
```

## Deployment

The easiest option is [Vercel](https://vercel.com/):

1. Push the project to a GitHub repository
2. Import it in Vercel
3. Add all `NEXT_PUBLIC_FIREBASE_*` environment variables in the Vercel project settings
4. Deploy
