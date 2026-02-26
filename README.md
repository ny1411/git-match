# Git Match: The Developer Dating App

**Git Match** is a full-stack, monorepo application designed to match developers based on a blend of their personal interests and professional coding habits drawn from their GitHub profile data.

-----

## 🚀 Project Overview

Git Match is built as a single repository containing a React frontend and an Express/Node.js backend, communicating via a set of secure APIs.

### Core Matching Logic

The matching algorithm relies on two primary data pillars:

1.  **Developer DNA (GitHub Data):** Common languages, tech stack, commit consistency, collaboration style, and coding time (night owl vs. day person).
2.  **Personal Profile Data:** Age, location, gender preference, non-tech interests, and relationship goals, captured during the multi-step onboarding process.

### Architecture

| Component | Technology |
| :--- | :--- |
| **Frontend** | React (TSX), Vite, Tailwind CSS
| **Backend** | Node.js, Express (TypeScript) 
| **Database** | Firebase Firestore | 
| **Authentication** | GitHub OAuth, Firebase Admin SDK |

-----

## 🔐 Authentication & Session Flow

Git Match uses a server-driven authentication flow to maximize security and control. This flow bypasses the Firebase Client SDK for session management by relying on a custom Session Token.

1.  **Sign-up/Login:** User submits credentials or initiates GitHub OAuth.
2.  **Backend Auth:** The backend (`/api/auth/signup` or `/api/auth/login`) verifies the user's identity using Firebase Admin SDK.
3.  **Session Token Minting:** The backend generates a secure **Session Token** (a manual JWT).
4.  **Client Handoff:** The backend returns this Session Token and the initial User Profile data to the frontend.
5.  **Client Session:** The React `AuthContext` stores the Session Token in `localStorage`. For all authenticated API calls (like fetching profile or submitting onboarding data), the token is sent in the `Authorization: Bearer <token>` header.

-----

## 🔑 Key Files & Endpoints

### Frontend Core

| File | Role | Description |
| :--- | :--- | :--- |
| `frontend/src/context/AuthContext.tsx` | **Session Manager** | Centralizes user state, handles local storage persistence of the Session Token, and executes all API calls for sign-up/login. |
| `frontend/src/pages/Onboarding.tsx` | **Onboarding UI** | Multi-step form to collect crucial matching data (Age, Geo, Interests, Goals). **(In Progress)** |
| `frontend/src/config/firebase.ts` | **Client Setup** | Initializes the public Firebase Client SDK for client-side use (e.g., Firestore queries, if needed). |

### Backend API Endpoints

| Endpoint | Method | Role | Status |
| :--- | :--- | :--- | :--- |
| `/api/auth/signup` | POST | Creates a new user in Firebase Auth and saves initial profile to Firestore. | **Operational** |
| `/api/auth/github/callback` | GET | Completes GitHub OAuth handshake, creates/updates Firebase user, and issues Session Token. | **Operational** |
| `/api/users/profile/onboarding` | POST | Saves multi-step onboarding data (Geo, Interests, Goals) to the user's Firestore document. | **Operational** |
| `/api/profile/me` | PUT | Handles comprehensive profile updates (age, location, image upload, etc.). | **Planned** |

-----

## 💻 Local Setup & Development

This project uses npm workspaces to manage the `frontend` (React/Vite) and `backend` (Node/Express) dependencies.

### Prerequisites

1.  Node.js (v18+) and npm (v8+).
2.  **Firebase Project:** Authentication and Firestore must be enabled.
3.  **GitHub OAuth App:** Required for social login.

### 1\. Environment Variables (`.env`)

You need two separate environment files to handle public and private credentials:

#### A. Backend Configuration (`backend/.env`)

Used by the Express server for secrets and service configuration.

```env
# Backend Secrets
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
PORT=...
```

#### B. Frontend Configuration (frontend/.env)
Used by the React app (Vite) for public Firebase credentials. Must start with VITE_.

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
# ... other VITE_ variables
```

### 2\. Installation and Running
Run all commands from the root directory of the repository.

```bash
# 1. Install dependencies for all workspaces
npm install

# 2. Run the full development stack
# The `predev` script ensures the backend is built (tsc) before starting.
npm run dev
```
