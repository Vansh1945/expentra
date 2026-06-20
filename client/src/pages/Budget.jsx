import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { MdWarning, MdAccountBalance, MdTrendingUp, MdSavings, MdTrackChanges, MdAttachMoney } from 'react-icons/md';
import { API } from '../context/AuthContext';

const SemiCircleProgress = ({ title, value, max, colorClass, isRed }) => {
    let percentage = 0;
    if (max > 0) percentage = Math.min(100, Math.max(0, (value / max) * 100));
    else if (value > 0) percentage = 100;
 
    const circumference = 125.66; // Math.PI * 40
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
 
    return (
        <div className="card-premium flex flex-col items-center justify-between">
            <h3 className={`text-xs font-semibold mb-2.5 ${isRed ? 'text-danger' : 'text-primary'}`}>
                {title}
            </h3>
            
            <div className="relative flex flex-col items-center w-full">
                <div className="w-[110px] sm:w-[95px] lg:w-[120px] relative mt-0.5">
                    <svg viewBox="0 0 100 55" className="w-full overflow-visible fallbacks">
                        {/* Background Arc */}
                        <path
                            d="M 10 50 A 40 40 0 0 1 90 50"
                            fill="none"
                            className="stroke-slate-100"
                            strokeWidth="11"
                            strokeLinecap="round"
                        />
                        {/* Foreground Arc */}
                        <path
                            d="M 10 50 A 40 40 0 0 1 90 50"
                            fill="none"
                            className={`stroke-current ${colorClass}`}
                            strokeWidth="11"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            style={{ transition: 'all 1s ease-out' }}
                        />
                    </svg>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex flex-col items-center w-full">
                        <span className="text-xs md:text-sm font-bold text-textColor">₹{Number(value).toLocaleString()}</span>
                        <span className="text-[9px] font-semibold text-textMuted mt-0.5">{percentage.toFixed(1)}%</span>
                    </div>
                </div>
            </div>
            
            <p className="text-[9px] text-textMuted/60 mt-4 pt-2 w-full text-center border-t border-slate-100">
                Current month data
            </p>
        </div>
    );
};

const Budget = () => {
    const [budgetStatus, setBudgetStatus] = useState(null);
    const [amount, setAmount] = useState('');
    const [savingGoal, setSavingGoal] = useState('');
    const [loading, setLoading] = useState(true);
    const [monthlyReport, setMonthlyReport] = useState(null);

    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const fetchBudgetAndReport = async () => {
        try {
            setLoading(true);
            const [budgetRes, reportRes] = await Promise.all([
                axios.get(`${API}/budget?month=${month}&year=${year}`).catch(() => ({ data: null })),
                axios.get(`${API}/reports/monthly?month=${month}&year=${year}`).catch(() => ({ data: null }))
            ]);

            if (budgetRes.data) {
                setBudgetStatus(budgetRes.data);
                setAmount(budgetRes.data.budget || '');
                setSavingGoal(budgetRes.data.savingGoal || '');
            } else {
                setBudgetStatus(null);
            }

            if (reportRes.data) {
                setMonthlyReport(reportRes.data);
            }
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBudgetAndReport();
    }, []);

    const handleSetBudget = async (e) => {
        e.preventDefault();
        if (Number(amount) <= 0) {
            toast.error('Budget amount must be greater than 0');
            return;
        }
        try {
            await axios.post(`${API}/budget`, {
                month,
                year,
                limitAmount: Number(amount),
                savingGoal: savingGoal ? Number(savingGoal) : 0,
            });
            toast.success('Budget saved successfully!');
            fetchBudgetAndReport();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to set budget');
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 bg-transparent">
                <div className="h-8 bg-card rounded w-1/4 animate-pulse"></div>
                <div className="h-32 bg-card rounded-xl animate-pulse"></div>
                <div className="h-64 bg-card rounded-xl animate-pulse"></div>
            </div>
        );
    }

    const incomeToUse = monthlyReport?.totalIncome > 0 ? monthlyReport.totalIncome : (budgetStatus?.budget || 0);
    const currentSavings = incomeToUse - (budgetStatus?.totalSpent || 0);

    const savingsProgress = budgetStatus?.savingGoal > 0
        ? Math.min(100, (Math.max(0, currentSavings) / budgetStatus.savingGoal) * 100)
        : 0;

    return (
        <div className="space-y-4 bg-transparent pb-4">
            {/* Header */}
            <div>
                <h1 className="h1-premium">Budget & Savings</h1>
                <p className="text-xs text-textMuted mt-0.5">Manage limits and track your goals for {MONTHS[month - 1]} {year}</p>
            </div>

            {/* Set Budget Form */}
            <div className="card-premium p-0 overflow-hidden">
                <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xs font-bold text-textColor">Budget Configuration</h2>
                        <p className="text-[10px] text-textMuted mt-0.5">Define your monthly limits</p>
                    </div>
                </div>
                <form onSubmit={handleSetBudget} className="p-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                        <div>
                            <label className="label-premium flex items-center gap-1">
                                <MdAttachMoney className="text-primary text-sm" />
                                Max Spend Limit (₹)
                            </label>
                            <input
                                type="number" required min="1"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                placeholder="e.g. 30000"
                                className="input-premium"
                            />
                        </div>
                        <div>
                            <label className="label-premium flex items-center gap-1">
                                <MdTrackChanges className="text-success text-sm" />
                                Savings Goal (₹)
                                <span className="text-textMuted opacity-60 text-[9px] ml-1">(Optional)</span>
                            </label>
                            <input
                                type="number" min="0"
                                value={savingGoal}
                                onChange={e => setSavingGoal(e.target.value)}
                                placeholder="e.g. 5000"
                                className="input-premium"
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn-primary w-full text-xs font-semibold py-1.5 h-9 md:h-10 mt-1.5 md:mt-0"
                        >
                            Save Configuration
                        </button>
                    </div>
                </form>
            </div>

            {/* Budget Overview */}
            {budgetStatus && (
                <div className="space-y-4">
                    {/* Warning Banner */}
                    {budgetStatus.warning && (
                        <div className="rounded-lg border-l-4 p-2.5 shadow-sm flex items-start gap-2 bg-card border-danger">
                            <MdWarning className="w-4 h-4 shrink-0 text-danger mt-0.5" />
                            <div>
                                <h3 className="font-bold text-danger text-[11px]">
                                    {budgetStatus.isExceeded ? 'Budget Exceeded!' : 'Approaching Budget Limit'}
                                </h3>
                                <p className="mt-0.5 text-[10px] text-danger opacity-85">
                                    {budgetStatus.warning}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Budget vs Income Discrepancy Note */}
                    {budgetStatus.budget > (monthlyReport?.totalIncome || 0) && (
                        <div className="flex items-start gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg text-[9px] text-amber-800 font-semibold w-fit">
                            <MdWarning className="shrink-0 text-xs mt-0.5 text-amber-500" />
                            <span>Your Max Spend Limit (₹{budgetStatus.budget.toLocaleString()}) exceeds your Income (₹{(monthlyReport?.totalIncome || 0).toLocaleString()}). Consider adjusting your budget.</span>
                        </div>
                    )}

                    {/* Top Summary Cards (Horizontal Structure) */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="card-premium flex items-start gap-2.5 h-full">
                            <div className="bg-primary/10 p-1.5 rounded-md shrink-0">
                                <MdAccountBalance className="text-primary text-lg" />
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-textMuted uppercase tracking-wider">Total Budget</p>
                                <p className="text-base font-bold text-textColor mt-0.5">₹{budgetStatus.budget.toLocaleString()}</p>
                                <p className="text-[9px] text-textMuted/60 mt-0.5">Monthly Limit</p>
                            </div>
                        </div>

                        <div className="card-premium flex items-start gap-2.5 h-full">
                            <div className="bg-danger/10 p-1.5 rounded-md shrink-0">
                                <MdTrendingUp className="text-danger text-lg" />
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-textMuted uppercase tracking-wider">Spent Budget</p>
                                <p className="text-base font-bold text-danger mt-0.5">₹{budgetStatus.totalSpent.toLocaleString()}</p>
                                <p className="text-[9px] text-textMuted/60 mt-0.5">
                                    {((budgetStatus.totalSpent / budgetStatus.budget) * 100).toFixed(1)}% used
                                </p>
                            </div>
                        </div>

                        <div className="card-premium flex items-start gap-2.5 h-full">
                            <div className="bg-success/10 p-1.5 rounded-md shrink-0">
                                <MdSavings className="text-success text-lg" />
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-textMuted uppercase tracking-wider">Remaining Budget</p>
                                <p className={`text-base font-bold mt-0.5 ${budgetStatus.remaining < 0 ? 'text-danger' : 'text-success'}`}>
                                    ₹{budgetStatus.remaining.toLocaleString()}
                                </p>
                                <p className="text-[9px] text-textMuted/60 mt-0.5">Available to spend</p>
                            </div>
                        </div>
                    </div>

                    {/* Utilization Sector (Semi-Circles) */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <SemiCircleProgress
                            title="Budget Used"
                            value={budgetStatus.totalSpent}
                            max={budgetStatus.budget}
                            colorClass="text-danger"
                            isRed={true}
                        />
                        <SemiCircleProgress
                            title="Remaining Budget"
                            value={Math.max(0, budgetStatus.remaining)}
                            max={budgetStatus.budget}
                            colorClass="text-primary"
                        />
                        <SemiCircleProgress
                            title="Savings"
                            value={Math.max(0, currentSavings)}
                            max={budgetStatus.savingGoal || budgetStatus.budget}
                            colorClass="text-success"
                        />
                    </div>

                    {/* Goal Tracker */}
                    {budgetStatus.savingGoal > 0 && (
                        <div className="card-premium">
                            <div className="flex items-center justify-between mb-2.5">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 bg-success/10 rounded-md">
                                        <MdTrackChanges className="w-4 h-4 text-success" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-textColor text-xs">Savings Goal Tracker</h3>
                                        <p className="text-[10px] text-textMuted mt-0.5">Track your progress toward your financial target</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-base font-bold text-success">{savingsProgress.toFixed(1)}%</p>
                                    <p className="text-[9px] text-textMuted/60 font-semibold uppercase">Achieved</p>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-end mb-1 text-[11px] font-semibold">
                                <div className="text-textMuted">
                                    Saved: <span className={currentSavings >= budgetStatus.savingGoal ? 'text-success' : 'text-textColor'}>₹{Math.max(0, currentSavings).toLocaleString()}</span>
                                </div>
                                <div className="text-textMuted">
                                    Target: <span>₹{budgetStatus.savingGoal.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="w-full bg-slate-50 border border-slate-100 rounded-full h-2 p-0.5">
                                <div
                                    className="h-full rounded-full bg-success transition-all duration-1000"
                                    style={{ width: `${savingsProgress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {!budgetStatus && !loading && (
                <div className="card-premium p-6 text-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-slate-50 border border-slate-100 shadow-sm rounded-full">
                            <MdAccountBalance className="w-8 h-8 text-textColor opacity-20" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-textColor">No Budget Set</h3>
                            <p className="text-textMuted text-[11px] mt-0.5 max-w-xs">
                                You haven't set a budget for {MONTHS[month - 1]} {year}.
                                Configure your limits above to activate dashboard tracking.
                             </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Budget;