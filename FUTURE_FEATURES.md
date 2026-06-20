# FUTURE_FEATURES.md

A blueprint of innovative, startup-level features designed to transform **Expentra** into the most comprehensive, engaging, and secure expense management ecosystem.

> [!IMPORTANT]
> **No-Cost Technology Guarantee:** All proposed features rely exclusively on free, open-source libraries, client-side APIs, and local computations. No paid subscription APIs or SaaS dependencies are recommended.

---

## 1. Competitive Gap Analysis

| Competitor | Core Strengths | Expentra's Competitive Advantages | Key Opportunities to Win |
| :--- | :--- | :--- | :--- |
| **Splitwise** | Excellent group splits and settlement notifications. | Expentra integrates personal budgeting, reports, and groups in one place, whereas Splitwise lacks holistic personal financial planning. | UPI deep linking on mobile; fully offline group queueing with local IndexedDB caches. |
| **YNAB (You Need A Budget)** | Envelope budgeting philosophy, highly disciplined. | Expentra is completely free/open-source; YNAB charges premium subscription rates. | Client-side rule engine allowing users to customize auto-classification logic without complex setups. |
| **Monzo / Revolut** | Connected bank feeds, instant transaction notifications. | Expentra is bank-agnostic and maintains strict user privacy; no direct bank account linkages needed. | Client-side OCR receipt ingestion, WhatsApp copy-paste formatting, and Telegram text parsing engines. |

---

## 2. Dynamic Feature Proposals (50+ Innovations)

### Category A: AI & Intelligent Analytics (Local & Serverless)

#### 1. Client-Side AI Spending Habit Classifier
* **Problem Solved:** Traditional category tags miss the emotional driver behind expenses.
* **User Benefit:** Automatically flags habits like "Late-Night Emotional Ordering" or "Impulsive Weekend Retail" based on notes and logs.
* **Technical Complexity:** Medium
* **Free Technologies:** `Transformers.js` (running a lightweight NLP classifier directly inside the browser using WebGPU/Web Assembly).
* **Database Changes:** Add `habitTags: [String]` array to the `expenses` collection.
* **UI Screens:** Added as a smart badge overlay on the transaction detail card and a "Habit Insights" section on the Analysis page.
* **Priority:** High

#### 2. AI-Based Budget Overrun Projection Engine
* **Problem Solved:** Static warnings trigger only *after* budget limits are breached.
* **User Benefit:** Foresees potential overruns 10 days before they occur, giving users time to adjust.
* **Technical Complexity:** Low
* **Free Technologies:** Simple client-side polynomial linear regression calculations in JavaScript.
* **Database Changes:** None (computes on-the-fly using historical month-to-date data).
* **UI Screens:** Dashboard budget gauge turns from green to dynamic warning amber with text: *"At current pace, you will overrun by the 22nd of this month."*
* **Priority:** High

#### 3. Intelligent Savings Opportunity Engine
* **Problem Solved:** Users rarely know where to start cutting back.
* **User Benefit:** Performs micro-audit of monthly expenses to highlight low-impact cuts (e.g., swapping recurring takeout for meal-prepping to save ₹2,000).
* **Technical Complexity:** Low
* **Free Technologies:** Custom JS matching heuristic engine.
* **Database Changes:** None.
* **UI Screens:** "Opportunities Panel" under the Analysis page displaying actionable saving card options.
* **Priority:** Medium

#### 4. Weighted Financial Health Index (FHI)
* **Problem Solved:** Health scores are often too simplistic, looking only at total spent vs income.
* **User Benefit:** A single, composite metric (0-100) reflecting savings velocity, category budget compliance, and recurring bill punctuality.
* **Technical Complexity:** Low
* **Free Technologies:** Custom JS weighted calculation algorithms.
* **Database Changes:** None.
* **UI Screens:** Prominent FHI rings on the top header of the personal dashboard.
* **Priority:** Medium

#### 5. Local Chatbot Assistant (Conversational Coach)
* **Problem Solved:** Setting up budgets is boring and tedious for non-technical users.
* **User Benefit:** Guides users through budget creation and reviews their financial status using conversational natural language.
* **Technical Complexity:** High
* **Free Technologies:** `WebLLM` or local WebGPU-accelerated models (running Llama-3-8B locally in browser threads).
* **Database Changes:** Create `chatlogs` model schema.
* **UI Screens:** Sliding chat panel widget on the bottom right corner of the app.
* **Priority:** Low

#### 6. Smart Expense K-Means Clustering
* **Problem Solved:** Flat lists hide relational spending patterns (e.g., high Uber costs associated only with dining out).
* **User Benefit:** Groups expenses into cohesive relational bubbles, explaining *why* money was spent.
* **Technical Complexity:** Medium
* **Free Technologies:** Simple client-side K-Means clustering algorithm.
* **Database Changes:** None.
* **UI Screens:** Interconnected bubble chart in Recharts inside the Reports screen.
* **Priority:** Medium

---

### Category B: Smart Automation

#### 7. Auto Recurring Billing Detector
* **Problem Solved:** Users forget to budget for subscriptions that bill automatically.
* **User Benefit:** Scans historical lists and flags items occurring on similar dates at fixed rates as recurring.
* **Technical Complexity:** Low
* **Free Technologies:** Date interval standard deviation checking algorithm in JS.
* **Database Changes:** None.
* **UI Screens:** A popup drawer prompt: *"We detected Netflix repeats on the 5th of every month. Convert to a scheduled recurring expense?"*
* **Priority:** High

#### 8. Semantic Category Similarity Matcher
* **Problem Solved:** Auto-detection fails if transaction names do not match exact keywords set by admins.
* **User Benefit:** If user logs "Quick Cab" and manually selects transport, similar entries like "Fast Taxi" auto-classify as transport.
* **Technical Complexity:** Medium
* **Free Technologies:** Jaro-Winkler string similarity calculations.
* **Database Changes:** None (computes client-side based on user's personal histories).
* **UI Screens:** Silently pre-selects inputs during creation with a subtle badge reading *"Auto-predicted category"*.
* **Priority:** Medium

#### 9. Heuristic Duplicate Transaction Catcher
* **Problem Solved:** Double-clicks on slow internet connections write duplicates.
* **User Benefit:** Prevents duplicate expenses from muddying reports.
* **Technical Complexity:** Low
* **Free Technologies:** Express middleware validator.
* **Database Changes:** None.
* **UI Screens:** In-app toast modal: *"You just logged 'Starbucks ₹240' 1 minute ago. Is this a duplicate entry?"*
* **Priority:** High

#### 10. Zombie Subscription Waste Alerting
* **Problem Solved:** Users pay for streaming services or gym trials they don't use.
* **User Benefit:** Flags recurring expenses that have not had active note or logging activity associated with their category.
* **Technical Complexity:** Low
* **Free Technologies:** Custom JS filtering.
* **Database Changes:** None.
* **UI Screens:** Smart decision cards on Dashboard warning of potential subscription waste.
* **Priority:** Medium

#### 11. Location-Aware Vendor Suggestion
* **Problem Solved:** Manually filling out vendor details when typing takes too long.
* **User Benefit:** Auto-suggests nearby supermarkets or cafes as vendors when adding transactions.
* **Technical Complexity:** Medium
* **Free Technologies:** Browser Geolocation API & free OpenStreetMap/Leaflet APIs.
* **Database Changes:** Add `coordinates: { lat: Number, lng: Number }` to `expenses`.
* **UI Screens:** Location pin selectors in transaction creator.
* **Priority:** Low

---

### Category C: Gamification & Engagement

#### 12. Savings Streak & Freeze Badges
* **Problem Solved:** Financial logging apps are abandoned because they feel like chores.
* **User Benefit:** Encourages daily logging by building streaks; users earn "Freeze Badges" to protect streaks on days they exceed budgets.
* **Technical Complexity:** Low
* **Free Technologies:** Custom JavaScript calendar streaks check.
* **Database Changes:** Add `currentStreak: Number`, `longestStreak: Number`, `streakFreezes: Number` to `users`.
* **UI Screens:** Top status bar showing flame icons with numbers.
* **Priority:** High

#### 13. Financial Fitness Quests
* **Problem Solved:** Goals are too long-term (e.g., save for a house in 5 years).
* **User Benefit:** Daily or weekly quests (e.g., "No-Spend Weekend Challenge" or "Coffee Cutback Week") make savings immediate.
* **Technical Complexity:** Low
* **Free Technologies:** JS quests validation engine.
* **Database Changes:** Create `quests` model (userId, questType, targetProgress, isCompleted).
* **UI Screens:** A "Quests & Challenges" page with progress meters.
* **Priority:** High

#### 14. Retro Achievement Badges
* **Problem Solved:** Positive reinforcement is lacking in budget applications.
* **User Benefit:** Earn cool SVG badges for accomplishments (e.g., "Budget Hero" for 3 months under limit).
* **Technical Complexity:** Low
* **Free Technologies:** Inline SVGs.
* **Database Changes:** Add `badges: [String]` to `users`.
* **UI Screens:** Profile tab displaying an unlocked trophy gallery.
* **Priority:** Medium

#### 15. Shared Family Savings Tournament
* **Problem Solved:** Teaching children or getting partners to save is hard.
* **User Benefit:** Compete within groups to see who saves the highest percentage of discretionary allowance.
* **Technical Complexity:** Medium
* **Free Technologies:** Group aggregates.
* **Database Changes:** Add `points: Number` to group member metadata.
* **UI Screens:** Leaderboard rank board inside Group Dashboard.
* **Priority:** Medium

#### 16. Financial Milestone Growth Tree
* **Problem Solved:** Numeric balances feel disconnected from progress.
* **User Benefit:** A virtual seed grows into a giant tree as users move money into savings.
* **Technical Complexity:** Low
* **Free Technologies:** HTML5 Canvas or CSS keyframes animations.
* **Database Changes:** Add `treeStage: Number` to `budgets` or `users`.
* **UI Screens:** Plant widget rendered on the home screen.
* **Priority:** Low

#### 17. Save-to-Spend Guilt-Free Vaults
* **Problem Solved:** Users feel guilty spending money on luxuries.
* **User Benefit:** Locks funds in visual sub-vaults; the vault unlocks only when core saving goals are met.
* **Technical Complexity:** Low
* **Free Technologies:** JS locking functions.
* **Database Changes:** Add `vaultLimit`, `vaultCurrent`, `isLocked` to budgets.
* **UI Screens:** Interactive safe-lock UI screen in the Budget tab.
* **Priority:** Medium

---

### Category D: Community Features

#### 18. Zero-Knowledge Anonymous Benchmarking
* **Problem Solved:** Users don't know if their rent or food expenses are normal.
* **User Benefit:** Compare spending percentiles anonymously against users of similar income classes.
* **Technical Complexity:** High
* **Free Technologies:** Backend aggregated group statistics.
* **Database Changes:** Add optional `incomeBracket: String` to `users`.
* **UI Screens:** Benchmark comparison overlay charts (Recharts) on the Reports page.
* **Priority:** Medium

#### 19. Community Saving Goals
* **Problem Solved:** Individual saving feels isolating.
* **User Benefit:** Join global community goals (e.g., *"Let's save ₹1,000,000 collectively this weekend"*).
* **Technical Complexity:** Medium
* **Free Technologies:** Mongoose aggregate updates.
* **Database Changes:** Create a global `communityGoals` collection.
* **UI Screens:** Community board page showing group progress trackers.
* **Priority:** Low

#### 20. Need vs Want Crowdsourced Sentiment
* **Problem Solved:** Impulse buyers categorize luxuries as necessities.
* **User Benefit:** Query the community: *"Is buying an iPad a Need or a Want?"* with anonymous polling.
* **Technical Complexity:** Low
* **Free Technologies:** Real-time polling API.
* **Database Changes:** Create `sentimentPolls` model.
* **UI Screens:** Mini poll selector cards.
* **Priority:** Low

#### 21. Cheap Vendor Pinner
* **Problem Solved:** Finding affordable cafes or shops is word-of-mouth.
* **User Benefit:** Pins cheap local grocery stores or restaurants on a map for group access.
* **Technical Complexity:** Medium
* **Free Technologies:** Leaflet map with free OpenStreetMap tiles.
* **Database Changes:** Create `pinnedVendors` schema.
* **UI Screens:** Map screen in Groups.
* **Priority:** Low

#### 22. Saving Guilds
* **Problem Solved:** Solo budgets fail.
* **User Benefit:** Form guilds with friends to meet shared financial benchmarks without revealing exact transaction values.
* **Technical Complexity:** Medium
* **Free Technologies:** Backend aggregate updates.
* **Database Changes:** Create `guilds` model.
* **UI Screens:** Guild ranking board.
* **Priority:** Low

---

### Category E: Advanced Financial Analytics

#### 23. Lifestyle Inflation Tracker
* **Problem Solved:** As salary grows, savings stagnate due to higher spending.
* **User Benefit:** Visualizes the gap between salary growth rate and discretionary spending over time.
* **Technical Complexity:** Low
* **Free Technologies:** Recharts multi-axis line graphs.
* **Database Changes:** None.
* **UI Screens:** Dedicated chart under reports.
* **Priority:** High

#### 24. Spending Intensity Heatmaps
* **Problem Solved:** Users don't realize what times of week they blow cash.
* **User Benefit:** GitHub-style contribution grid calendar showing which hours or days are spending peaks.
* **Technical Complexity:** Low
* **Free Technologies:** Custom CSS grid styling.
* **Database Changes:** None.
* **UI Screens:** Heatmap grid inside Reports.
* **Priority:** Medium

#### 25. Micro-Leak Detector
* **Problem Solved:** Small, recurring costs (like ₹50 platform fees) are ignored but add up.
* **User Benefit:** Calculates annual projections of small, frequent payments to highlight hidden financial drains.
* **Technical Complexity:** Low
* **Free Technologies:** Simple multiplication algorithms in JS.
* **Database Changes:** None.
* **UI Screens:** Money leaks list on the dashboard.
* **Priority:** High

#### 26. Goal Achievement Probability (Monte Carlo Sim)
* **Problem Solved:** Fixed projections fail when daily income/expenses fluctuate.
* **User Benefit:** Calculates chance of reaching goal (e.g. *"94% chance of saving ₹50k by October"*).
* **Technical Complexity:** Medium
* **Free Technologies:** Client-side randomized path simulation algorithms in JS.
* **Database Changes:** None.
* **UI Screens:** Goal detail popup with gauge meter.
* **Priority:** Medium

#### 27. Price-Creep Subscription Auditor
* **Problem Solved:** Subscriptions slowly increase rates without warning.
* **User Benefit:** Alerts the user if Netflix or Spotify has increased their price compared to 6 months ago.
* **Technical Complexity:** Low
* **Free Technologies:** Historical cost matching logic.
* **Database Changes:** None.
* **UI Screens:** Alert indicator next to subscription logs.
* **Priority:** Low

#### 28. Financial Runway Forecaster
* **Problem Solved:** Users don't know how long they can survive if they lose their job.
* **User Benefit:** Calculates survival runway in months based on current balance vs average living costs.
* **Technical Complexity:** Low
* **Free Technologies:** JS calculators.
* **Database Changes:** None.
* **UI Screens:** Runway indicator on Dashboard.
* **Priority:** High

---

### Category F: Family & Households

#### 29. Centralized Family Wallet
* **Problem Solved:** Keeping track of household expenditures across partners is tedious.
* **User Benefit:** Set up a central pool where parents check and review combined spends.
* **Technical Complexity:** Medium
* **Free Technologies:** Group wallet logic.
* **Database Changes:** Add `isFamilyWallet: Boolean` to groups.
* **UI Screens:** Joint Wallet overview dashboard.
* **Priority:** High

#### 30. Gamified Child Allowance Tracker
* **Problem Solved:** Parents struggle to track chores and allowance payouts.
* **User Benefit:** Assign point values to chores; kids earn points that convert to money in the app.
* **Technical Complexity:** Medium
* **Free Technologies:** Mongoose schemas.
* **Database Changes:** Create `childAllowances` schema.
* **UI Screens:** Kid profile board inside app.
* **Priority:** Medium

#### 31. Roommate Bill Splitting Reminders
* **Problem Solved:** Roommates neglect shared utility split settlements.
* **User Benefit:** Auto-formats and pre-populates WhatsApp billing templates for quick sharing.
* **Technical Complexity:** Low
* **Free Technologies:** HTML `whatsapp://send?text=` deep links.
* **Database Changes:** None.
* **UI Screens:** Tap "Remind Roommate" button to open WhatsApp.
* **Priority:** High

#### 32. Wishlist Matching Engine
* **Problem Solved:** Impulse spending on personal wishlists.
* **User Benefit:** Match wishlist item cost with excess savings; items unlock only when budget has run-off room.
* **Technical Complexity:** Low
* **Free Technologies:** JS calculators.
* **Database Changes:** Create `wishlist` schema.
* **UI Screens:** Wishlist tracker screen.
* **Priority:** Low

#### 33. Accessibility High-Contrast Interface
* **Problem Solved:** Seniors struggle with small font interfaces.
* **User Benefit:** Switch app to high contrast, simplified layouts with speech prompts.
* **Technical Complexity:** Low
* **Free Technologies:** CSS variables switching.
* **Database Changes:** None.
* **UI Screens:** Accessibility preferences in Settings.
* **Priority:** Low

---

### Category G: Offline & PWA Sync

#### 34. IndexedDB Client Sync Queue (Dexie.js)
* **Problem Solved:** App crashes or loses logs if user opens it in basement subways.
* **User Benefit:** Create, edit, delete offline; syncs automatically when connection is restored.
* **Technical Complexity:** High
* **Free Technologies:** `Dexie.js` database layer + Service Workers listener.
* **Database Changes:** Add `synchronized: Boolean` flag to models.
* **UI Screens:** Sync status indicator dot in navigation bar.
* **Priority:** High

#### 35. Offline Conflict Diff Screen
* **Problem Solved:** Updates to the same expense offline vs online cause conflicts.
* **User Benefit:** Choose which version to keep (local vs server).
* **Technical Complexity:** Medium
* **Free Technologies:** Diff comparison modal.
* **Database Changes:** Add `updatedAt` tracking fields.
* **UI Screens:** Conflict resolution modal popup.
* **Priority:** Medium

#### 36. Local Receipt Image Queue
* **Problem Solved:** Photos fail to save during poor connection.
* **User Benefit:** Save photos offline inside PWA cache; uploads when connection returns.
* **Technical Complexity:** Medium
* **Free Technologies:** IndexedDB Blob storage.
* **Database Changes:** None.
* **UI Screens:** Gallery icon updates.
* **Priority:** High

#### 37. Offline Analytics Caching
* **Problem Solved:** Charts show blank screens offline.
* **User Benefit:** Aggregated chart payloads are saved locally so dashboards remain functional offline.
* **Technical Complexity:** Low
* **Free Technologies:** LocalStorage caching.
* **Database Changes:** None.
* **UI Screens:** Dashboard displays cached statistics.
* **Priority:** Medium

---

### Category H: Security & Auditing

#### 38. Expense Receipt Verification Scanner
* **Problem Solved:** Shared expense fraud in corporate/roommate accounts.
* **User Benefit:** Compares manual entry details against uploaded receipts and flags anomalies.
* **Technical Complexity:** Medium
* **Free Technologies:** Client-side OCR + logic checking.
* **Database Changes:** None.
* **UI Screens:** Warning text under Group settlement details.
* **Priority:** High

#### 39. Velocity Spindle Detector
* **Problem Solved:** Fraudulent attempts or stolen phone transactions.
* **User Benefit:** Block or notify users if 5+ expenses are logged in under 5 minutes.
* **Technical Complexity:** Low
* **Free Technologies:** Rate limiting controllers.
* **Database Changes:** None.
* **UI Screens:** Push notifications.
* **Priority:** Medium

#### 40. Encrypted JSON Backup (AES-GCM)
* **Problem Solved:** Users fear cloud lock-in.
* **User Benefit:** Export fully encrypted offline copies of budgets.
* **Technical Complexity:** Medium
* **Free Technologies:** Web Crypto API.
* **Database Changes:** None.
* **UI Screens:** Backup/Restore pane in Settings.
* **Priority:** High

#### 41. Biometric Passkey Local Lock
* **Problem Solved:** Friends picking up user's phone can view personal finances.
* **User Benefit:** FaceID/Fingerprint lock options to unlock local app dashboards.
* **Technical Complexity:** Medium
* **Free Technologies:** WebAuthn API.
* **Database Changes:** None.
* **UI Screens:** Fingerprint prompt before entering dashboard.
* **Priority:** Medium

---

### Category I: Productivity & Speed

#### 42. Web Speech Parsing Engine
* **Problem Solved:** Typing out description and category takes too long.
* **User Benefit:** Speak: *"spent two hundred rupees on lunch"* to instantly populate entry fields.
* **Technical Complexity:** Medium
* **Free Technologies:** Web Speech API (native browser audio parsing).
* **Database Changes:** None.
* **UI Screens:** Microphone icon inside the quick action drawer.
* **Priority:** High

#### 43. Copy-Paste Command Loggers
* **Problem Solved:** Fast entry is needed without clicking buttons.
* **User Benefit:** Paste a string like `/add 200 coffee` directly into a search bar to instantly log.
* **Technical Complexity:** Low
* **Free Technologies:** Regex parsing inside input.
* **Database Changes:** None.
* **UI Screens:** Direct quick-entry input field on Dashboard.
* **Priority:** High

#### 44. Client-side OCR Receipt Scanner
* **Problem Solved:** Manual data entry feels like tedious work.
* **User Benefit:** Snapshot a bill receipt, and the app auto-fills title, total amount, and date.
* **Technical Complexity:** Medium
* **Free Technologies:** `Tesseract.js` (runs completely client-side in the browser).
* **Database Changes:** None.
* **UI Screens:** "Scan Receipt" button in the log transaction screen.
* **Priority:** High

#### 45. Interactive CSV/Excel Columns Mapper
* **Problem Solved:** Migrating from older apps is complicated.
* **User Benefit:** Upload CSV exports, select column headers in a preview grid, and batch import transactions.
* **Technical Complexity:** Medium
* **Free Technologies:** `PapaParse` library.
* **Database Changes:** Bulk insert endpoints on Backend.
* **UI Screens:** Drag-and-drop file upload mapping dashboard.
* **Priority:** High

#### 46. One-Tap Quick Log Widgets
* **Problem Solved:** Users skip logging because the app takes too long to load.
* **User Benefit:** Home screen shortcuts to quickly log standard items (e.g. "Commute ₹50").
* **Technical Complexity:** Low
* **Free Technologies:** Manifest shortcuts settings inside PWA structure.
* **Database Changes:** None.
* **UI Screens:** Launcher shortcuts configuration in settings.
* **Priority:** Medium

---

### Category J: Viral Growth & Retention Drivers

#### 47. Shareable Weekly Milestone Infographics
* **Problem Solved:** Budgeting apps lack viral sharing features.
* **User Benefit:** Generate summary infographics of saving streaks or low-spend days to post.
* **Technical Complexity:** Low
* **Free Technologies:** HTML5 Canvas image rendering.
* **Database Changes:** None.
* **UI Screens:** "Share Milestone" popups.
* **Priority:** High

#### 48. Invite Badges
* **Problem Solved:** Low user referral velocity.
* **User Benefit:** Inviting group members unlocks custom application themes or special badges.
* **Technical Complexity:** Low
* **Free Technologies:** Theme switching classes.
* **Database Changes:** Add `inviteReferralsCount: Number` to `users`.
* **UI Screens:** Invite tab.
* **Priority:** Medium

#### 49. Dynamic Morning Digest Push Notifications
* **Problem Solved:** Daily budgeting apps suffer from low engagement.
* **User Benefit:** Morning greeting outlining how much you can spend today based on budget runway.
* **Technical Complexity:** Low
* **Free Technologies:** Server cron triggers.
* **Database Changes:** None.
* **UI Screens:** Custom FCM alerts.
* **Priority:** High

#### 50. Goal Countdown Desktop Widgets
* **Problem Solved:** Saving goals are easily forgotten when out of sight.
* **User Benefit:** Mini dashboard panel widget to pin on the screen, showing the countdown for desired purchases.
* **Technical Complexity:** Low
* **Free Technologies:** Browser-native widgets or overlay flags.
* **Database Changes:** None.
* **UI Screens:** Widget configuration modal.
* **Priority:** Low

#### 51. Zero-Spend Day Confetti celebration
* **Problem Solved:** Staying under budget doesn't feel celebratory.
* **User Benefit:** Instantly explodes confetti when logging a zero-spend day at midnight.
* **Technical Complexity:** Low
* **Free Technologies:** `canvas-confetti` JS library.
* **Database Changes:** None.
* **UI Screens:** Interactive full-screen celebrations.
* **Priority:** Low

#### 52. Gamified Calibration Setup
* **Problem Solved:** Initial onboarding forms are boring, leading to user drops.
* **User Benefit:** Setup budgets by answering quick personality questions (e.g. *"Are you a Saver or a Spender?"*).
* **Technical Complexity:** Low
* **Free Technologies:** Simple multi-step routing.
* **Database Changes:** None.
* **UI Screens:** Fun, wizard onboarding wizard pages.
* **Priority:** High
