# Expentra — Client (Frontend)

> A modern, intelligent React-based frontend for the Expentra Smart Expense & Financial Control System.

---

## 📋 Table of Contents

1. [Frontend Overview](#frontend-overview)
2. [UI Pages](#ui-pages)
3. [Features — Detailed](#features--detailed)
4. [State Management](#state-management)
5. [API Integration](#api-integration)
6. [Folder Structure](#folder-structure)
7. [Technologies Used](#technologies-used)
8. [Environment Variables](#environment-variables)
9. [Setup & Installation](#setup--installation)

---

## 🌐 Frontend Overview

The Expentra client is a **React 19 + Vite** single-page application (SPA) with full PWA (Progressive Web App) support. It is designed around a dual-mode workspace — **personal finance mode** and **group expense mode** — switchable at runtime without a page reload. The frontend is deeply integrated with Firebase for Google OAuth and real-time Firebase Cloud Messaging (FCM) push notifications with deep-linking.

The application uses **Axios** with global request/response interceptors for authentication, **React Router v7** for client-side routing, **Recharts** for data visualizations, **React Toastify** for in-app notification toasts, and **Tailwind CSS** for utility-first styling.

---

## 🖥️ UI Pages

### Public Pages

| Route | Component | Description |
|---|---|---|
| `/` | `Home.jsx` | Landing page with product introduction and CTAs |
| `/login` | `Login.jsx` | Email/password login + Google OAuth sign-in |
| `/register` | `Register.jsx` | New user registration with strong password validation |

### Protected Pages (Personal Mode)

| Route | Component | Description |
|---|---|---|
| `/dashboard` | `Dashboard.jsx` | Central financial hub — summary cards, spending charts, insights |
| `/expenses` | `Expenses.jsx` | Full expense management with add/edit/delete and filters |
| `/income` | `Income.jsx` | Income entry and monthly income history |
| `/budget` | `Budget.jsx` | Monthly budget setup with live utilization progress bar |
| `/reports` | `Reports.jsx` | Monthly/category-based report generation with PDF export |
| `/analysis` | `Analysis.jsx` | AI-style insights, monthly growth, and predicted expenses |
| `/alerts` | `Alerts.jsx` | Notification centre — all persistent smart alerts and warnings |

### Protected Pages (Group Mode)

| Route | Component | Description |
|---|---|---|
| `/groups` | `GroupSelection.jsx` | Create, browse, or join groups via invite code |
| `/groups/dashboard` | `GroupDashboard.jsx` | Group-level financial summary and overview |
| `/groups/expenses` | `GroupExpenses.jsx` | View all group expenses with filtering |
| `/groups/add-expense` | `AddGroupExpense.jsx` | Add or edit a group expense with split logic |
| `/groups/settlement` | `Settlement.jsx` | View optimized debt settlement plan for the active group |
| `/groups/members` | `Members.jsx` | Manage group members — add, edit, remove |
| `/groups/analytics` | `GroupAnalytics.jsx` | Group-level analytics and category breakdowns |
| `/groups/reports` | `GroupReports.jsx` | Group expense reports with export functionality |
| `/join-group/:inviteCode` | `GroupSelection.jsx` | Deep-link handler to auto-join a group via invite link |

### Admin Pages (Role-restricted)

| Route | Component | Description |
|---|---|---|
| `/admin/dashboard` | `AdminDashboard.jsx` | Platform-wide usage stats |
| `/admin/users` | `AdminUsers.jsx` | User management — block/unblock accounts |
| `/admin/categories` | `AdminCategories.jsx` | Manage global expense/income categories |
| `/admin/reports` | `AdminReports.jsx` | Platform-wide expense reports |
| `/admin/profile` | `AdminProfile.jsx` | Admin profile settings |

---

## ✨ Features — Detailed

### 1. Budget Monitoring UI

**File:** `Budget.jsx`

- User sets a `limitAmount` and optional `savingGoal` for a given month/year
- A **progress bar** renders the utilization percentage (`totalSpent / limitAmount * 100`)
- Color changes dynamically:
  - **Green** → below 80% used
  - **Orange** → 80%–100% (warning zone: `isNearLimit === true`)
  - **Red** → exceeded (`isExceeded === true`)
- Warning messages fetched live from the backend:
  - `"⚠️ You have used X% of your budget. You are approaching your limit!"` at 80%
  - `"⚠️ You have exceeded your monthly budget by ₹X!"` at 100%
- Remaining balance and saving goal are also rendered in summary cards

### 2. Analysis Insights Cards

**File:** `Analysis.jsx`

Calls `GET /api/analysis` and renders the full analysis payload:

| Card | Data Source |
|---|---|
| **Top Spending Category** | `spendingPattern.topCategory` |
| **Monthly Growth %** | `monthlyGrowthPercentage` |
| **Predicted Monthly Expense** | `futureExpensePrediction` |
| **Financial Health Score** | `financialHealthScore` (0-100) |
| **Avg Daily Expense** | `patternControl.averageDailyExpense` |
| **Expected Monthly (Pattern)** | `patternControl.expectedMonthly` |

**Insights Panel:** Each insight from the `insights[]` array is rendered as a colored card:
- `critical` → red alert (overspending by more than 100%)
- `warning` → orange alert (80%–100% of category budget)
- `info` → blue (month-over-month increase)
- `success` → green (month-over-month decrease)

### 3. Notification Handling with Deep Linking

**Files:** `AuthContext.jsx`, `utils/getFCMToken.js`, `firebase.js`

**Foreground FCM Setup (on user login):**
1. `getFCMToken()` is called — requests browser notification permission, waits for service worker readiness, retrieves an FCM device token using the `VITE_VAPID_KEY`
2. The token is `POST`-ed to `/api/auth/fcm-token` to register the device server-side
3. `onMessage(messaging, callback)` listens for foreground FCM messages
4. A **duplicate prevention** mechanism uses a `useRef` Set to deduplicate payloads by `messageId` or `title+body`
5. On message receipt:
   - `fetchNotifications()` is triggered to sync the notification bell
   - A **clickable toast** is shown via React Toastify with the notification title and body
   - Clicking the toast extracts `payload.data.route` and redirects the user (deep linking)

**Background FCM:** Handled by the PWA service worker registered by `vite-plugin-pwa`

**Alerts Page (`Alerts.jsx`):**
- Lists all persistent notifications fetched from `GET /api/notifications`
- Each item shows type badge, message, timestamp
- Actions: **Mark as Read**, **Dismiss**
- Bulk actions: **Mark All Read**, **Clear All**

### 4. Charts and Analytics

**Libraries:** Recharts v3

| Page | Charts Used |
|---|---|
| `Dashboard.jsx` | BarChart (monthly spend), PieChart (category split) |
| `Analysis.jsx` | LineChart (trend), card-based insight metrics |
| `Reports.jsx` | BarChart (income vs expense), PieChart (category distribution) |
| `GroupAnalytics.jsx` | BarChart (per-member spend), PieChart (category breakdown) |
| `GroupReports.jsx` | Monthly spend trends across group members |

### 5. Group Expense Split System

**File:** `AddGroupExpense.jsx`

Supports three split types:
- **Equal** — total ÷ number of members, with automatic floating-point correction
- **Exact** — each member's share entered manually
- **Percentage** — percentage shares entered, converted to absolute amounts

The resulting split is posted to `POST /api/group-expenses` and the server calculates the settlement matrix automatically.

### 6. Smart Settlement View

**File:** `Settlement.jsx`

- Fetches `GET /api/group-expenses/:groupId/settlements`
- Renders the **optimized settlement plan** returned by the server's Debt Optimization Algorithm
- Shows: who owes whom, how much, with a "Mark as Paid" button
- After marking paid, an FCM notification is dispatched to the payee by the server

### 7. PDF Report Export

**File:** `Reports.jsx`

- Uses `html2pdf.js` to export the rendered report section as a downloadable PDF
- Filters available by month and category

### 8. Google OAuth Login

**File:** `Login.jsx`

- Uses Firebase `GoogleAuthProvider` and `signInWithPopup`
- On success, the Google profile (`name`, `email`, `photoURL`) is sent to `POST /api/auth/google`
- Server creates or retrieves the account and returns a JWT
- No password required for OAuth users

### 9. Category Auto-Detection

When creating an expense, the `title` field is matched against category keywords in the database. The client simply submits the title — the server automatically assigns the most relevant category.

### 10. Application Mode (Personal / Group)

- `AuthContext` stores `appMode` (`'personal'` or `'group'`) in `localStorage`
- The `Sidebar.jsx` renders different navigation links depending on the active mode
- Group mode selection stores `selectedGroupId` and fetches the active group metadata
- Mode persists across browser refreshes

---

## 🔄 State Management

All global application state is managed through a single **React Context API** provider:

**File:** `src/context/AuthContext.jsx`

| State | Type | Purpose |
|---|---|---|
| `token` | `string \| null` | JWT auth token (persisted in `localStorage`) |
| `user` | `object \| null` | Logged-in user info (`_id`, `name`, `email`, `role`) |
| `role` | `string \| null` | `'personal'` or `'admin'` |
| `appMode` | `string` | Active workspace mode: `'personal'` or `'group'` |
| `selectedGroupId` | `string \| null` | ID of the currently active group |
| `activeGroup` | `object \| null` | Full group object for the active group |
| `notifications` | `array` | List of persistent server notifications |
| `unreadCount` | `number` | Count of unread notifications for the badge |
| `loading` | `boolean` | Global loading state |
| `notificationsLoading` | `boolean` | Notification fetch state |

**Context-exposed functions:**

| Function | Description |
|---|---|
| `login(token, user, role)` | Sets auth state and persists to localStorage |
| `logout()` | Clears state, localStorage, redirects to `/login` |
| `setAppMode(mode)` | Switches between `'personal'` and `'group'` mode |
| `setSelectedGroupId(id)` | Sets active group and fetches group metadata |
| `fetchNotifications()` | Fetches all unread notifications from server |
| `markAsRead(id)` | Marks a single notification as read |
| `markAllAsRead()` | Marks all notifications as read |
| `deleteNotification(id)` | Soft-deletes (dismisses) a notification |
| `clearAllNotifications()` | Dismisses all notifications |
| `markAsSeen()` | Updates `notificationsLastSeen` in localStorage |

---

## 📡 API Integration

**File:** `src/App.jsx` (global Axios configuration)

### Base URL

```javascript
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

### Request Interceptor

Automatically attaches the JWT `Bearer` token from `localStorage` to every outgoing request:

```javascript
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Response Interceptor

Handles **401 Unauthorized** globally — clears token and redirects to `/login`:

```javascript
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Route Protection

**File:** `src/components/ProtectedRoute.jsx`

- Checks for a valid token in `AuthContext`
- Redirects unauthenticated users to `/login`
- Supports `allowedRoles` prop for admin-only route protection

---

## 📁 Folder Structure

```
client/
├── public/                    # Static assets (PWA icons, manifest)
├── src/
│   ├── App.jsx                # Root app: routing, Axios config, interceptors
│   ├── main.jsx               # React DOM entry point
│   ├── firebase.js            # Firebase SDK init (Auth, Messaging, Analytics)
│   ├── App.css                # Global CSS overrides
│   ├── index.css              # Tailwind directives
│   │
│   ├── context/
│   │   └── AuthContext.jsx    # Global state: auth, mode, notifications, FCM
│   │
│   ├── components/
│   │   ├── Layout.jsx         # App shell wrapper for protected pages
│   │   ├── Navbar.jsx         # Top navigation bar with notification bell
│   │   ├── Sidebar.jsx        # Role/mode-aware left sidebar navigation
│   │   ├── PublicNavbar.jsx   # Navigation for public (unauthenticated) pages
│   │   ├── ProtectedRoute.jsx # Route guard with role checks
│   │   ├── Button.jsx         # Reusable button component
│   │   └── Card.jsx           # Reusable card wrapper
│   │
│   ├── pages/
│   │   ├── Home.jsx           # Public landing page
│   │   ├── Login.jsx          # Auth: email/password + Google OAuth
│   │   ├── Register.jsx       # New account registration
│   │   ├── Dashboard.jsx      # Personal finance dashboard with charts
│   │   ├── Expenses.jsx       # Expense CRUD + filters
│   │   ├── Income.jsx         # Income management
│   │   ├── Budget.jsx         # Budget setup + utilization tracking
│   │   ├── Reports.jsx        # Monthly reports + PDF export
│   │   ├── Analysis.jsx       # Financial insights + predictions
│   │   ├── Alerts.jsx         # Notification centre (persistent alerts)
│   │   │
│   │   ├── group/
│   │   │   ├── GroupSelection.jsx     # Create/join/select group
│   │   │   ├── GroupDashboard.jsx     # Group financial overview
│   │   │   ├── GroupExpenses.jsx      # Group expense list
│   │   │   ├── AddGroupExpense.jsx    # Add/edit group expense + split logic
│   │   │   ├── Settlement.jsx         # Optimized debt settlement view
│   │   │   ├── Members.jsx            # Member management
│   │   │   ├── GroupAnalytics.jsx     # Group-level charts
│   │   │   └── GroupReports.jsx       # Group expense reports
│   │   │
│   │   └── admin/
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminUsers.jsx
│   │       ├── AdminCategories.jsx
│   │       ├── AdminReports.jsx
│   │       └── AdminProfile.jsx
│   │
│   └── utils/
│       ├── getFCMToken.js     # FCM permission request + token generation
│       ├── categoryDetector.js # Client-side keyword-based category matching
│       └── CategoryIcon.jsx   # Icon mapping for expense categories
│
├── index.html                 # HTML entry point
├── vite.config.js             # Vite config with PWA plugin
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS config
└── package.json
```

---

## 🛠️ Technologies Used

| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.0 | UI framework |
| Vite | 7.3.1 | Build tool + dev server |
| React Router DOM | 7.13.1 | Client-side routing |
| Axios | 1.13.6 | HTTP client with interceptors |
| Firebase SDK | 12.11.0 | Google Auth + FCM messaging |
| Recharts | 3.7.0 | Data visualization charts |
| React Toastify | 11.0.5 | In-app toast notifications |
| React Icons | 5.5.0 | Icon library |
| html2pdf.js | 0.14.0 | PDF generation from DOM |
| date-fns | 4.1.0 | Date formatting utilities |
| Tailwind CSS | 3.4.19 | Utility-first CSS framework |
| vite-plugin-pwa | 1.2.0 | Progressive Web App support |

---

## 🔐 Environment Variables

Create a `.env` file in the `client/` directory:

```env
VITE_API_URL=http://localhost:5000/api

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# FCM Web Push VAPID Key
VITE_VAPID_KEY=your_vapid_key
```

---

## 🚀 Setup & Installation

### Prerequisites

- Node.js v18+
- npm v9+
- A Firebase project with Authentication and Cloud Messaging enabled

### Steps

```bash
# 1. Navigate to the client directory
cd client

# 2. Install dependencies
npm install

# 3. Create and populate your .env file (see above)

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output will be in `client/dist/`.

---

## 🔗 Related

- [Server README](../server/README.md) — Backend API documentation
- [Root README](../README.md) — Full system documentation
