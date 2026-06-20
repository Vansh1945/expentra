import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { MdEmojiEvents, MdFlashOn, MdCheckCircle, MdLock } from 'react-icons/md';
import confetti from 'canvas-confetti';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Challenges = () => {
    const [loading, setLoading] = useState(true);
    const [streakCount, setStreakCount] = useState(0);
    const [badges, setBadges] = useState([]);
    const [quests, setQuests] = useState([]);

    const fetchStatus = async () => {
        try {
            const res = await axios.get(`${API_URL}/challenges/status`);
            setStreakCount(res.data.streakCount);
            setBadges(res.data.badges);
            setQuests(res.data.quests);
        } catch (error) {
            toast.error('Failed to load challenges status');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const handleClaimQuest = async (questId) => {
        try {
            const res = await axios.post(`${API_URL}/challenges/complete-quest`, { questId });
            if (res.data.success) {
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 }
                });
                toast.success('Challenge completed successfully! Keep it up!');
                fetchStatus();
            }
        } catch (error) {
            toast.error('Failed to complete challenge');
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse bg-transparent">
                <div className="h-8 bg-card rounded-xl w-48"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="h-32 bg-card rounded-xl md:col-span-1"></div>
                    <div className="h-32 bg-card rounded-xl md:col-span-2"></div>
                </div>
                <div className="h-64 bg-card rounded-xl"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-4">
            {/* Header */}
            <div>
                <h1 className="h1-premium flex items-center gap-1.5">
                    <MdEmojiEvents className="text-success text-xl animate-bounce" />
                    Financial Fitness Quests
                </h1>
                <p className="text-xs text-textMuted mt-0.5">
                    Complete quests, keep saving streaks active, and unlock rare achievement badges!
                </p>
            </div>

            {/* Top Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Streak Card */}
                <div className="card-premium flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute -right-8 -top-8 bg-warning/10 w-20 h-20 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500"></div>
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <h3 className="label-premium">Savings Streak</h3>
                            <MdFlashOn className="text-warning text-xl animate-pulse" />
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-textColor flex items-baseline gap-1">
                            {streakCount} <span className="text-xs font-semibold text-textMuted">Days</span>
                        </p>
                    </div>
                    <p className="text-[10px] text-textMuted mt-2 leading-relaxed">
                        Log transaction data daily to grow your financial logging streak!
                    </p>
                </div>

                {/* Quests Status Card */}
                <div className="card-premium md:col-span-2 flex flex-col justify-between">
                    <div>
                        <h3 className="label-premium mb-2.5">Today's Progress</h3>
                        <div className="space-y-2">
                            {quests.map(quest => (
                                <div key={quest.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-2 bg-slate-50/50 rounded-lg border border-slate-100">
                                    <div>
                                        <h4 className="text-xs font-bold text-textColor">{quest.title}</h4>
                                        <p className="text-[9px] text-textMuted mt-0.5">{quest.description}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {quest.isCompleted ? (
                                            <span className="flex items-center gap-0.5 text-[9px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
                                                <MdCheckCircle className="text-xs" /> Completed
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleClaimQuest(quest.id)}
                                                className="btn-primary text-[9px] px-2.5 py-1 font-semibold"
                                            >
                                                Complete Challenge
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Badge Achievements Gallery */}
            <div className="card-premium">
                <h3 className="text-xs font-bold text-textColor tracking-tight mb-3">Achievement Badges</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {badges.map(badge => (
                        <div
                            key={badge.id}
                            className={`p-3 rounded-xl border transition-all duration-300 flex items-start gap-2.5 ${
                                badge.isUnlocked
                                    ? 'bg-gradient-to-br from-primary/5 to-success/5 border-primary/10 shadow-sm'
                                    : 'bg-slate-50/50 border-slate-100 grayscale opacity-60'
                            }`}
                        >
                            <div className="text-xl p-1.5 bg-card rounded-md shadow-sm select-none border border-slate-100 shrink-0">
                                {badge.isUnlocked ? badge.icon : <MdLock className="text-textColor opacity-40 text-base" />}
                            </div>
                            <div className="space-y-0.5">
                                <h4 className="font-bold text-xs text-textColor flex items-center gap-1 flex-wrap">
                                    {badge.title}
                                    {badge.isUnlocked && (
                                        <span className="text-[8px] uppercase font-bold tracking-wider px-1 py-0.5 bg-success/10 text-success rounded">
                                            Unlocked
                                        </span>
                                    )}
                                </h4>
                                <p className="text-[9px] text-textMuted leading-relaxed">{badge.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Challenges;
