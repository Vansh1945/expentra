# EXISTING_FEATURES.md

An exhaustive audit of the **Expentra** Expense Management system, detailing all currently implemented core capabilities, database models, file paths, and API endpoints.

---

## 1. Authentication & Security Features

### JWT-Based User Authentication
* **Description:** Provides secure user registration, password hashing (bcrypt), JWT generation, token verification, and cookie-based authorization state management.
* **Status:** Completed
* **Files Used:**
  * Backend: [userModel.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/models/userModel.js), [userRoutes.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/routes/userRoutes.js), [userController.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/controllers/userController.js), [authMiddleware.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/middleware/authMiddleware.js)
  * Frontend: [AuthContext.jsx](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/client/src/context/AuthContext.jsx), [Login.jsx](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/client/src/pages/Login.jsx), [Register.jsx](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/client/src/pages/Register.jsx), [ProtectedRoute.jsx](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/client/src/components/ProtectedRoute.jsx)
* **APIs Used:**
  * `POST /api/auth/register` (Register user)
  * `POST /api/auth/login` (Login user)
  * `POST /api/auth/logout` (Clear session)
  * `GET /api/auth/profile` (Get active profile details)
* **Database Tables Used:** `users` (MongoDB Collection)
* **Improvement Suggestions:** Implement email verification on signup using a free SMTP server/Nodemailer and security questions or standard MFA (Multi-Factor Authentication).

### IP Rate Limiting & CORs Security
* **Description:** Protects the Express backend API against DDoS or brute-force attacks via rate limits (15-min window, 2000 requests max) and locks down allowed origins.
* **Status:** Completed
* **Files Used:**
  * Backend: [server.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/server.js)
* **APIs Used:** Global middleware intercepting all API requests.
* **Database Tables Used:** None (In-memory rate limiter).
* **Improvement Suggestions:** Move rate limiting store to a persistent cache (like a free Redis layer or MongoDB storage) to prevent counters resetting on server restarts.

---

## 2. Personal Expense & Income Management

### CRUD Expense Tracking
* **Description:** Allows logging expenditures with title, amount, date, notes, geocached locations, payment methods (Cash, UPI, Card, NetBanking, Other), and optional recurring flags.
* **Status:** Completed
* **Files Used:**
  * Backend: [expenseModel.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/models/expenseModel.js), [expenseRoutes.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/routes/expenseRoutes.js), [expenseController.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/controllers/expenseController.js)
  * Frontend: [Expenses.jsx](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/client/src/pages/Expenses.jsx)
* **APIs Used:**
  * `POST /api/expenses` (Create expense)
  * `GET /api/expenses` (Fetch filtered list of user's personal expenses)
  * `PUT /api/expenses/:id` (Update transaction details)
  * `DELETE /api/expenses/:id` (Delete transaction)
* **Database Tables Used:** `expenses`
* **Improvement Suggestions:** Add file attachment support to store receipt pictures locally or in free cloud tiers (like Supabase storage).

### Smart Category Auto-Detection
* **Description:** Scans entered transaction titles and matches them against keywords defined inside active categories to automatically populate the category field.
* **Status:** Completed
* **Files Used:**
  * Backend: [expenseController.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/controllers/expenseController.js)
  * Frontend: [categoryDetector.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/client/src/utils/categoryDetector.js)
* **APIs Used:** `GET /api/categories` or read categories locally.
* **Database Tables Used:** `categories`, `expenses`
* **Improvement Suggestions:** Upgrade the simple keyword scanner to a lightweight client-side TF-IDF or text classification script (e.g., using natural-language processing libraries like `natural` or client-side naive bayes classifier).

### CRUD Income Tracking
* **Description:** Tracks incoming cash flows with title, amount, category, description, and date. Auto-populates month/year tags on database pre-save hooks to expedite monthly accounting queries.
* **Status:** Completed
* **Files Used:**
  * Backend: [incomeModel.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/models/incomeModel.js), [incomeRoutes.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/routes/incomeRoutes.js), [incomeController.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/controllers/incomeController.js)
  * Frontend: [Income.jsx](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/client/src/pages/Income.jsx)
* **APIs Used:**
  * `POST /api/incomes` (Log income source)
  * `GET /api/incomes` (List user incomes with parameters)
  * `PUT /api/incomes/:id` (Update entry)
  * `DELETE /api/incomes/:id` (Remove entry)
* **Database Tables Used:** `incomes`
* **Improvement Suggestions:** Support recurring income sources (salary, investments) that automatically increment balances on specified dates.

---

## 3. Budgeting & Goal Tracking

### Monthly Personal Budget Boundaries
* **Description:** Enables setting monthly budget ceilings and saving targets. The system computes real-time utilization percentages, remainder balances, and flags exceeded limits.
* **Status:** Completed
* **Files Used:**
  * Backend: [budgetModel.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/models/budgetModel.js), [budgetRoutes.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/routes/budgetRoutes.js), [budgetController.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/controllers/budgetController.js)
  * Frontend: [Budget.jsx](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/client/src/pages/Budget.jsx)
* **APIs Used:**
  * `GET /api/budget` (Read month's budget details)
  * `POST /api/budget` (Define a monthly ceiling and target saving)
  * `GET /api/budget/status` (Check total spent vs set budget limit)
* **Database Tables Used:** `budgets`, `expenses`
* **Improvement Suggestions:** Allow users to establish budgets per category (e.g., limit food to ₹5,000, rent to ₹15,000) rather than a single lump sum.

---

## 4. Group Splitting & Households (Splitwise Style)

### Household/Group Selection & Creation
* **Description:** Users can create multiple shared wallets or group workspaces. Generates a custom 6-character alphanumeric code and an invite link for other members to join.
* **Status:** Completed
* **Files Used:**
  * Backend: [groupModel.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/models/groupModel.js), [groupRoutes.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/routes/groupRoutes.js), [groupController.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/controllers/groupController.js)
  * Frontend: [GroupSelection.jsx](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/client/src/pages/group/GroupSelection.jsx), [Members.jsx](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/client/src/pages/group/Members.jsx)
* **APIs Used:**
  * `POST /api/groups` (Create new group)
  * `GET /api/groups` (Get user's joined groups)
  * `GET /api/groups/:id` (Get specific group metadata)
  * `POST /api/groups/join` (Join group using code)
  * `PUT /api/groups/:id/members` (Add user/dummy member by email/name)
  * `DELETE /api/groups/:id/members/:memberId` (Remove member)
* **Database Tables Used:** `groups`
* **Improvement Suggestions:** Support QR code generation for invite links on the client-side using a free library.

### Shared Group Expense Logging & Splits
* **Description:** Records group expenses with complex division types (equal, exact amounts, percentage shares, or custom configurations).
* **Status:** Completed
* **Files Used:**
  * Backend: [groupExpenseModel.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/models/groupExpenseModel.js), [groupExpenseRoutes.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/routes/groupExpenseRoutes.js), [groupExpenseController.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/controllers/groupExpenseController.js)
  * Frontend: [AddGroupExpense.jsx](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/client/src/pages/group/AddGroupExpense.jsx), [GroupExpenses.jsx](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/client/src/pages/group/GroupExpenses.jsx)
* **APIs Used:**
  * `POST /api/group-expenses` (Add split expense)
  * `GET /api/group-expenses/:groupId` (Fetch group history)
  * `PUT /api/group-expenses/:groupId/expenses/:expenseId` (Modify shared expense)
  * `DELETE /api/group-expenses/:groupId/expenses/:expenseId` (Remove shared expense)
* **Database Tables Used:** `groupexpenses`
* **Improvement Suggestions:** Enable uploading a receipt photo for group verification.

### Debt Optimization & Standalone Settlements
* **Description:** Employs a greedy matching algorithm that pairs major debtors with major creditors to minimize the total transactions required to resolve group balances. Standalone settlements track payments between pairs.
* **Status:** Completed
* **Files Used:**
  * Backend: [settlementModel.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/models/settlementModel.js), [groupExpenseController.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/controllers/groupExpenseController.js)
  * Frontend: [Settlement.jsx](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/client/src/pages/group/Settlement.jsx)
* **APIs Used:**
  * `GET /api/group-expenses/:groupId/settlements` (Get calculated net debts & optimization list)
  * `POST /api/group-expenses/:groupId/settlements/mark-paid` (Mark optimized debt as paid)
  * `POST /api/group-expenses/:groupId/expenses/:expenseId/settlements/:settlementId/pay` (Pay per-expense debt)
* **Database Tables Used:** `settlements`, `groupexpenses`
* **Improvement Suggestions:** Integrate UPI deep linking on mobile view to launch local bank apps with pre-filled amounts and VPA addresses.

---

## 5. Reports & Analytics

### Interactive Charts & Visuals
* **Description:** Compiles spending patterns using Recharts to present pie/donut breakdown of expense categories.
* **Status:** Completed
* **Files Used:**
  * Backend: [reportController.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/controllers/reportController.js), [reportRoutes.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/routes/reportRoutes.js)
  * Frontend: [Reports.jsx](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/client/src/pages/Reports.jsx), [Dashboard.jsx](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/client/src/pages/Dashboard.jsx)
* **APIs Used:**
  * `GET /api/reports/monthly` (Retrieve total income, spent, category breakdowns)
* **Database Tables Used:** `expenses`, `incomes`
* **Improvement Suggestions:** Add monthly comparison bar charts showing income vs expense trends over a 6-month period.

### Smart Predictive Analytics
* **Description:** Predicts next month's total spending using a 3-month rolling average. Calculates a 0-100 Financial Health Score based on budget consumption, and forecasts expected monthly expenditures from the last 30 days of rolling data.
* **Status:** Completed
* **Files Used:**
  * Backend: [analysisController.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/controllers/analysisController.js), [analysisRoutes.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/routes/analysisRoutes.js)
  * Frontend: [Analysis.jsx](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/client/src/pages/Analysis.jsx)
* **APIs Used:**
  * `GET /api/analysis/summary` (Detailed analytics payload)
* **Database Tables Used:** `expenses`, `budgets`
* **Improvement Suggestions:** Offer daily suggestions on the dashboard when spending trends path towards breaching the monthly ceiling.

### PDF Report Exporter
* **Description:** Generates formatted, downloadable PDF summaries of monthly financials directly on the client using `html2pdf.js`.
* **Status:** Completed
* **Files Used:**
  * Frontend: [Reports.jsx](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/client/src/pages/Reports.jsx)
* **APIs Used:** None (Client-side HTML DOM conversion).
* **Database Tables Used:** None
* **Improvement Suggestions:** Offer CSV and Excel exports of transactions for users to open in spreadsheet software.

---

## 6. Notifications & Alerts

### Push Notification Orchestrator
* **Description:** Integrates Firebase Cloud Messaging (FCM) to trigger background push notifications for budget overflows, settlement reminders, and new shared expenses.
* **Status:** Completed
* **Files Used:**
  * Backend: [notificationModel.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/models/notificationModel.js), [notificationRoutes.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/routes/notificationRoutes.js), [notificationController.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/controllers/notificationController.js), [notificationHelper.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/utils/notificationHelper.js)
  * Frontend: [Alerts.jsx](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/client/src/pages/Alerts.jsx), [getFCMToken.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/client/src/utils/getFCMToken.js)
* **APIs Used:**
  * `GET /api/notifications` (Fetch alerts history)
  * `PUT /api/notifications/read-all` (Mark all read)
  * `PUT /api/notifications/:id/read` (Mark individual read)
  * `DELETE /api/notifications/:id` (Delete notifications)
  * `POST /api/auth/fcm-token` (Register client FCM tokens)
* **Database Tables Used:** `notifications`
* **Improvement Suggestions:** Allow users to customize push notification preferences (e.g., toggle specific categories of notifications like budget alerts or settlement pings).

---

## 7. Admin Panel & Moderation

### System Stats & User Management
* **Description:** A dedicated interface for administrator roles to monitor registered users, check total expenses, manage categories, check monthly active volumes, and ban/block users.
* **Status:** Completed
* **Files Used:**
  * Backend: [adminRoutes.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/routes/adminRoutes.js), [adminController.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/controllers/adminController.js)
  * Frontend: [AdminDashboard.jsx](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/client/src/pages/admin/AdminDashboard.jsx), [AdminUsers.jsx](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/client/src/pages/admin/AdminUsers.jsx), [AdminCategories.jsx](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/client/src/pages/admin/AdminCategories.jsx), [AdminReports.jsx](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/client/src/pages/admin/AdminReports.jsx), [AdminProfile.jsx](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/client/src/pages/admin/AdminProfile.jsx)
* **APIs Used:**
  * `GET /api/admin/dashboard` (Stats overview)
  * `GET /api/admin/users` (List users)
  * `PUT /api/admin/users/:id` (Block/unblock/change role)
  * `DELETE /api/admin/users/:id` (Delete account and clean up dependencies)
  * `GET /api/admin/analytics/overview` (Advanced usage trends)
* **Database Tables Used:** `users`, `expenses`, `categories`
* **Improvement Suggestions:** Add automated logs reporting which admin performed what moderation action to maintain audit trails.

### System Category Management
* **Description:** Allows admins to create global categories for income/expenses, associate icons, and seed keyword arrays that are evaluated during user transaction logs for auto-categorization.
* **Status:** Completed
* **Files Used:**
  * Backend: [adminController.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/server/controllers/adminController.js)
  * Frontend: [AdminCategories.jsx](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/client/src/pages/admin/AdminCategories.jsx)
* **APIs Used:**
  * `POST /api/admin/categories` (Add category)
  * `PUT /api/admin/categories/:id` (Modify category fields/keywords)
  * `DELETE /api/admin/categories/:id` (Remove category)
* **Database Tables Used:** `categories`
* **Improvement Suggestions:** Implement multi-language translations for default categories to support diverse user bases.

---

## 8. Mobile & PWA Infrastructure

### Offline Support & Service Workers
* **Description:** Utilizes `vite-plugin-pwa` to cache core assets (HTML, JS, CSS, icons) so the website can be installed on home screens and loads instantly, even offline.
* **Status:** Partial
* **Files Used:**
  * Frontend: [vite.config.js](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/client/src/vite.config.js), [package.json](file:///c:/Users/vansh/OneDrive/Desktop/project%20final/Expentra/expentra-main/client/package.json)
* **APIs Used:** Client-side registration of the service worker.
* **Database Tables Used:** None
* **Improvement Suggestions:** Set up IndexedDB (via Dexie.js or localForage) to store queued write actions offline (like creating expenses or settlements) and automatically synchronize with the server once an internet connection is established.
