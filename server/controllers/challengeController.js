import User from '../models/userModel.js';
import Expense from '../models/expenseModel.js';
import Income from '../models/incomeModel.js';

// Predefined available badges in the system
const SYSTEM_BADGES = [
    { id: 'FIRST_STEP', title: 'First Step', description: 'Log your very first transaction', icon: '🌱' },
    { id: 'SAVINGS_STREAK_3', title: 'Streak Starter', description: 'Maintain a 3-day activity streak', icon: '🔥' },
    { id: 'SAVINGS_STREAK_7', title: 'Weekly Warrior', description: 'Maintain a 7-day activity streak', icon: '⚡' },
    { id: 'BUDGET_HERO', title: 'Budget Hero', description: 'Log at least one month of data staying under budget', icon: '🛡️' },
    { id: 'CENTURION', title: 'Centurion', description: 'Log 100 total transactions', icon: '💯' },
    { id: 'SAVINGS_SAVVY', title: 'Savings Savvy', description: 'Save more than 30% of your income this month', icon: '💰' }
];

// Predefined quests in the system
const SYSTEM_QUESTS = [
    { id: 'DAILY_TRACKER', title: 'Daily Tracker', description: 'Log any expense or income today', reward: 'Streak Boost' },
    { id: 'BUDGET_CHECK', title: 'Frugal Day', description: 'Spend less than ₹500 today', reward: 'Frugal Badge Points' },
    { id: 'SAVINGS_CHALLENGE', title: 'Saver Quest', description: 'Log a new income source to boost savings', reward: 'Saver Badge Points' }
];

// Get gamification status
export const getChallengeStatus = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user) {
            res.status(404);
            return next(new Error('User not found'));
        }

        // Dynamically recalculate streak
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Fetch user's latest expense or income date
        const [latestExpense, latestIncome] = await Promise.all([
            Expense.findOne({ userId }).sort({ date: -1 }),
            Income.findOne({ userId }).sort({ date: -1 })
        ]);

        let latestLogDate = null;
        if (latestExpense && latestIncome) {
            latestLogDate = latestExpense.date > latestIncome.date ? latestExpense.date : latestIncome.date;
        } else if (latestExpense) {
            latestLogDate = latestExpense.date;
        } else if (latestIncome) {
            latestLogDate = latestIncome.date;
        }

        let currentStreak = user.streakCount || 0;
        if (latestLogDate) {
            const logDate = new Date(latestLogDate);
            logDate.setHours(0, 0, 0, 0);

            const diffTime = Math.abs(today - logDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (logDate.getTime() === today.getTime()) {
                // Already logged today, streak is safe.
            } else if (logDate.getTime() === yesterday.getTime()) {
                // Logged yesterday, but not today yet. Streak is still active.
            } else {
                // Missed yesterday, reset streak
                currentStreak = 0;
                user.streakCount = 0;
                await user.save();
            }
        } else {
            currentStreak = 0;
        }

        // Dynamically evaluate dynamic quest progression
        const startOfToday = new Date(today);
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);

        const [todaysExpenses, todaysIncomes, totalTxCount] = await Promise.all([
            Expense.find({ userId, date: { $gte: startOfToday, $lte: endOfToday } }),
            Income.find({ userId, date: { $gte: startOfToday, $lte: endOfToday } }),
            Expense.countDocuments({ userId })
        ]);

        const todaysExpenseTotal = todaysExpenses.reduce((sum, e) => sum + e.amount, 0);

        const questProgress = SYSTEM_QUESTS.map(quest => {
            let progress = 0;
            let target = 1;
            let isCompleted = false;

            if (quest.id === 'DAILY_TRACKER') {
                progress = (todaysExpenses.length + todaysIncomes.length) > 0 ? 1 : 0;
                isCompleted = progress >= target;
            } else if (quest.id === 'BUDGET_CHECK') {
                progress = todaysExpenseTotal > 0 && todaysExpenseTotal < 500 ? 1 : 0;
                isCompleted = todaysExpenses.length > 0 && todaysExpenseTotal < 500;
            } else if (quest.id === 'SAVINGS_CHALLENGE') {
                progress = todaysIncomes.length > 0 ? 1 : 0;
                isCompleted = progress >= target;
            }

            return {
                ...quest,
                progress,
                target,
                isCompleted: isCompleted || (user.questsCompleted || []).includes(quest.id)
            };
        });

        // Check and auto-unlock basic badges if applicable
        const unlockedBadges = [...(user.badges || [])];

        // 1. FIRST_STEP Badge
        if (!unlockedBadges.includes('FIRST_STEP') && (totalTxCount > 0 || todaysIncomes.length > 0)) {
            unlockedBadges.push('FIRST_STEP');
        }

        // 2. SAVINGS_STREAK badges
        if (!unlockedBadges.includes('SAVINGS_STREAK_3') && currentStreak >= 3) {
            unlockedBadges.push('SAVINGS_STREAK_3');
        }
        if (!unlockedBadges.includes('SAVINGS_STREAK_7') && currentStreak >= 7) {
            unlockedBadges.push('SAVINGS_STREAK_7');
        }

        // 3. CENTURION
        if (!unlockedBadges.includes('CENTURION') && totalTxCount >= 100) {
            unlockedBadges.push('CENTURION');
        }

        if (unlockedBadges.length !== (user.badges || []).length) {
            user.badges = unlockedBadges;
            await user.save();
        }

        res.json({
            streakCount: currentStreak,
            badges: SYSTEM_BADGES.map(badge => ({
                ...badge,
                isUnlocked: (user.badges || []).includes(badge.id)
            })),
            quests: questProgress
        });

    } catch (error) {
        next(error);
    }
};

// Claim badge/complete quest triggering confetti
export const completeQuest = async (req, res, next) => {
    try {
        const { questId } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            res.status(404);
            return next(new Error('User not found'));
        }

        if (!user.questsCompleted) {
            user.questsCompleted = [];
        }

        if (!user.questsCompleted.includes(questId)) {
            user.questsCompleted.push(questId);
            
            // Increment streak if completed daily tracker
            if (questId === 'DAILY_TRACKER') {
                user.streakCount = (user.streakCount || 0) + 1;
                user.lastActiveDate = new Date();
            }

            await user.save();
        }

        res.json({ success: true, message: 'Quest status updated', streakCount: user.streakCount });
    } catch (error) {
        next(error);
    }
};
