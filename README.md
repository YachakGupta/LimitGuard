# LimitGuard — Frontend

A minimal, secure, and modern authentication interface for **LimitGuard** (AI Context Firewall).

Built with:
- **React 19**
- **Vite 6**
- **Redux Toolkit & React-Redux**
- **React Router v7**
- **Tailwind CSS v4**
- **Native Browser Fetch API** (`credentials: "include"`, zero external HTTP libraries)

---

## Features

- **Authentication**:
  - Secure Login (Email + Password)
  - Account Registration (Name + Email + Password)
  - Real-time password requirement checklist (8–72 characters, lowercase, uppercase, number, special character)
  - Session check on app initialization (`GET /api/v1/auth/me`)
  - Logout (`POST /api/v1/auth/logout`)
- **Theme Support**:
  - Smooth Light & Dark mode toggle
  - Persistent state in `localStorage`
  - Zero theme-flash script on page load
- **Security**:
  - HTTP-only cookie-based session management (`token`)
  - No client-side token storage in `localStorage`
- **UI Design**:
  - Split-screen layout (50/50 on desktop, single column on mobile)
  - Glassmorphic "Prompt Firewall" demonstration panel with CSS redaction animations

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Ensure `VITE_API_BASE_URL` points to your backend instance:

```env
VITE_API_BASE_URL=https://sarcasm-remember-eastbound.ngrok-free.dev
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173).

### 4. Build for Production

```bash
npm run build
```

---

## Project Structure

```text
limitguard/
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── api/
    │   └── client.js              # Centralized native fetch client
    ├── components/
    │   ├── Logo.jsx               # Shield-check logo mark
    │   ├── PasswordInput.jsx      # Password field with visibility toggle
    │   ├── ThemeToggle.jsx        # Accessible light/dark toggle
    │   └── VisualPanel.jsx       # Hero prompt firewall panel
    ├── features/
    │   ├── auth/
    │   │   └── authSlice.js       # Redux auth slice & async thunks
    │   └── theme/
    │       └── themeSlice.js      # Redux theme state & persistence
    ├── pages/
    │   ├── Home.jsx               # Protected user dashboard
    │   ├── Login.jsx              # Login view
    │   └── Register.jsx           # Registration view with live validation
    ├── store/
    │   └── index.js               # Redux store configuration
    ├── App.jsx                    # Routing & session bootstrap
    ├── index.css                  # Tailwind CSS v4 & custom animations
    └── main.jsx                   # React entry point
```
