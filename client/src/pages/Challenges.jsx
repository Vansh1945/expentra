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
                <div className="h-10 bg-card rounded-xl w-48"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-40 bg-card rounded-2xl md:col-span-1"></div>
                    <div className="h-40 bg-card rounded-2xl md:col-span-2"></div>
                </div>
                <div className="h-96 bg-card rounded-2xl"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-textColor tracking-tight flex items-center gap-3">
                    <MdEmojiEvents className="text-secondary text-3xl animate-bounce" />
                    Financial Fitness Quests
                </h1>
                <p className="text-sm text-textColor opacity-60 mt-1">
                    Complete quests, keep saving streaks active, and unlock rare achievement badges!
                </p>
            </div>

            {/* Top Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Streak Card */}
                <div className="bg-card rounded-2xl p-6 border border-background shadow-sm flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute -right-8 -top-8 bg-warning/10 w-24 h-24 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-textColor opacity-50 uppercase tracking-widest">Savings Streak</h3>
                            <MdFlashOn className="text-warning text-3xl animate-pulse" />
                        </div>
                        <p className="text-5xl font-black text-textColor flex items-baseline gap-2">
                            {streakCount} <span className="text-lg font-bold text-textColor opacity-60">Days</span>
                        </p>
                    </div>
                    <p className="text-xs text-textColor opacity-60 mt-4 leading-relaxed">
                        Log transaction data daily to grow your financial logging streak!
                    </p>
                </div>

                {/* Quests Status Card */}
                <div className="bg-card rounded-2xl p-6 border border-background shadow-sm md:col-span-2 flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-textColor opacity-50 uppercase tracking-widest mb-4">Today's Progress</h3>
                        <div className="space-y-4">
                            {quests.map(quest => (
                                <div key={quest.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-background/50 rounded-xl">
                                    <div>
                                        <h4 className="text-sm font-bold text-textColor">{quest.title}</h4>
                                        <p className="text-xs text-textColor opacity-60 mt-0.5">{quest.description}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {quest.isCompleted ? (
                                            <span className="flex items-center gap-1 text-xs font-bold text-secondary bg-secondary/10 px-3 py-1.5 rounded-full">
                                                <MdCheckCircle className="text-base" /> Completed
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleClaimQuest(quest.id)}
                                                className="text-xs font-semibold px-4 py-2 bg-primary text-card rounded-lg hover:bg-primary/95 transition-all duration-300"
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
            <div className="bg-card rounded-3xl border border-background p-8 shadow-sm">
                <h3 className="text-xl font-bold text-textColor tracking-tight mb-6">Achievement Badges</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {badges.map(badge => (
                        <div
                            key={badge.id}
                            className={`p-6 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                                badge.isUnlocked
                                    ? 'bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 shadow-sm'
                                    : 'bg-background/20 border-background grayscale opacity-50'
                            }`}
                        >
                            <div className="text-4xl p-3 bg-card rounded-xl shadow-sm select-none">
                                {badge.isUnlocked ? badge.icon : <MdLock className="text-textColor opacity-40" />}
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-textColor flex items-center gap-2">
                                    {badge.title}
                                    {badge.isUnlocked && (
                                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-secondary/20 text-secondary rounded">
                                            Unlocked
                                        </span>
                                    )}
                                </h4>
                                <p className="text-xs text-textColor opacity-60 leading-normal">{badge.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Challenges;
