import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from 'axios';
import { AuthContext, API } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    MdGroup, MdTrendingUp, MdTrendingDown, MdAccountBalance,
    MdAttachMoney, MdLightbulb, MdArrowForward, MdFlashOn, MdWarning
} from 'react-icons/md';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', '#EC4899', '#0EA5E9'];

// ==========================================
// PERSONAL DASHBOARD
// ==========================================
// Renders financial health scores, predictive analytics, and smart insights
const Dashboard = () => {
    const { setAppMode, setSelectedGroupId } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [analysis, setAnalysis] = useState(null);
    const [monthlyReport, setMonthlyReport] = useState(null);
    const [budgetStatus, setBudgetStatus] = useState(null);
    const [challenges, setChallenges] = useState(null);
    const [monthExpenses, setMonthExpenses] = useState([]);

    // ==========================================
    // DATA SYNCHRONIZATION
    // ==========================================
    // Executes concurrent API calls to fetch analysis, reports, and budgets
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const today = new Date();
                const month = today.getMonth() + 1;
                const year = today.getFullYear();

                const [analysisRes, reportRes, budgetRes, challengesRes, expensesRes] = await Promise.all([
                    axiosInstance.get(`${API}/analysis/summary`).catch(() => ({ data: null })),
                    axiosInstance.get(`${API}/reports/monthly?month=${month}&year=${year}`).catch(() => ({ data: null })),
                    axiosInstance.get(`${API}/budget?month=${month}&year=${year}`).catch(() => ({ data: null })),
                    axiosInstance.get(`${API}/challenges/status`).catch(() => ({ data: null })),
                    axiosInstance.get(`${API}/expenses?month=${month}&year=${year}`).catch(() => ({ data: null }))
                ]);

                setAnalysis(analysisRes.data);
                setMonthlyReport(reportRes.data);
                setBudgetStatus(budgetRes.data);
                setChallenges(challengesRes.data);
                setMonthExpenses(expensesRes.data || []);
            } catch (error) {
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleSwitchToGroup = async () => {
        try {
            const res = await axiosInstance.get(`${API}/groups`);
            if (res.data.length > 0) {
                setSelectedGroupId(res.data[0]._id);
                setAppMode('group');
                navigate('/groups/dashboard');
            } else {
                toast.info("You don't have any groups yet. Please create one.");
                navigate('/groups');
            }
        } catch (error) {
            toast.error("Failed to load groups");
            navigate('/groups');
        }
    };

    // Calculate simple linear regression projection
    const getForecast = () => {
        if (!monthExpenses || monthExpenses.length === 0) return null;
        
        const dailyTotals = {};
        monthExpenses.forEach(exp => {
            const day = new Date(exp.date).getDate();
            dailyTotals[day] = (dailyTotals[day] || 0) + exp.amount;
        });

        const todayDay = new Date().getDate();
        const x = [];
        const y = [];
        let cumulative = 0;

        for (let d = 1; d <= todayDay; d++) {
            cumulative += dailyTotals[d] || 0;
            x.push(d);
            y.push(cumulative);
        }

        const n = x.length;
        if (n < 2) {
            const currentSpent = y[y.length - 1] || 0;
            const projected = (currentSpent / todayDay) * 30;
            return {
                projected,
                willBreach: budgetStatus?.budget ? projected > budgetStatus.budget : false,
                breachDay: budgetStatus?.budget && projected > budgetStatus.budget ? Math.ceil(budgetStatus.budget / (currentSpent / todayDay)) : null
            };
        }

        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        for (let i = 0; i < n; i++) {
            sumX += x[i];
            sumY += y[i];
            sumXY += x[i] * y[i];
            sumXX += x[i] * x[i];
        }

        const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const c = (sumY - m * sumX) / n;

        const projected = Math.max(0, m * 30 + c);

        let breachDay = null;
        let willBreach = false;
        if (budgetStatus?.budget && projected > budgetStatus.budget) {
            willBreach = true;
            if (m > 0) {
                const day = (budgetStatus.budget - c) / m;
                breachDay = Math.min(30, Math.max(1, Math.ceil(day)));
            } else {
                breachDay = todayDay;
            }
        }

        return {
            projected,
            willBreach,
            breachDay
        };
    };

    const forecast = getForecast();

    if (loading) {
        return (
            <div className="space-y-6 bg-transparent animate-pulse">
                <div className="h-10 bg-card rounded-xl w-48"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-card rounded-2xl"></div>)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-96 bg-card rounded-2xl"></div>
                    <div className="h-96 bg-card rounded-2xl"></div>
                </div>
            </div>
        );
    }

    const categoryData = monthlyReport?.categoryWise?.map(cat => ({
        name: cat.category,
        value: cat.totalAmount
    })) || [];

    const incomePercentage = monthlyReport?.totalIncome ?
        ((monthlyReport.totalSpent / monthlyReport.totalIncome) * 100) : 0;

    const budgetPercentage = budgetStatus?.budget ?
        ((budgetStatus.totalSpent / budgetStatus.budget) * 100) : 0;

    return (
        <div className="space-y-4 pb-4">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <h1 className="h1-premium">Dashboard Overview</h1>
                    <p className="text-[10px] text-textMuted mt-0.5">Real-time financial tracking and insights</p>
                </div>
                <div className="flex gap-1.5">
                    {challenges && (
                        <Link
                            to="/challenges"
                            className="flex items-center gap-1 px-2 py-1 bg-warning/10 border border-warning/20 text-warning font-semibold rounded-md hover:bg-warning/25 transition-all text-[10px] shadow-sm"
                        >
                            <MdFlashOn className="text-sm animate-bounce" />
                            <span>Streak: {challenges.streakCount} Days</span>
                        </Link>
                    )}
                    <button
                        onClick={handleSwitchToGroup}
                        className="btn-secondary py-1 px-2.5 text-xs"
                    >
                        <MdGroup className="text-sm text-primary" />
                        <span>Switch to Group</span>
                        <MdArrowForward className="text-xs opacity-40" />
                    </button>
                </div>
            </div>

            {/* Linear Regression Forecast warning indicator */}
            {forecast && forecast.willBreach && (
                <div className="bg-danger/5 border border-danger/20 rounded-lg p-2.5 flex items-start gap-2 shadow-sm">
                    <MdWarning className="text-danger text-base shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-danger text-[10px]">Budget Exceed Warning (Linear Regression Forecast)</h4>
                        <p className="text-textColor/90 text-[10px] mt-0.5 leading-relaxed">
                            At your current spending rate, you are projected to spend <strong>₹{Math.round(forecast.projected).toLocaleString()}</strong> by the end of this month, exceeding your budget ceiling of <strong>₹{(budgetStatus?.budget || 0).toLocaleString()}</strong>.
                            You will likely breach your budget limit around <strong>Day {forecast.breachDay}</strong> of the month.
                        </p>
                    </div>
                </div>
            )}

            {/* Smart Decision Support System: Displays predictive insights */}
            {analysis?.insights && analysis.insights.length > 0 && (
                <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-2.5 shadow-sm">
                    <div className="flex items-center gap-1 mb-1 px-0.5">
                        <MdLightbulb className="text-primary text-xs" />
                        <h3 className="text-[10px] font-bold text-textColor tracking-tight">Decision Support Insights</h3>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        {analysis.insights.map((insight, idx) => (
                            <div key={idx} className="flex items-start gap-1 px-0.5">
                                <span className="text-[10px] shrink-0">{insight.icon}</span>
                                <p className="text-textMuted font-medium text-[10px] leading-relaxed">{insight.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Top Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Total Income */}
                <div className="card-premium flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between mb-1.5">
                        <p className="label-premium">Total Income</p>
                        <div className="p-1 bg-success/10 rounded-md">
                            <MdAttachMoney className="text-success text-base" />
                        </div>
                    </div>
                    <p className="text-lg md:text-xl font-bold text-textColor tracking-tight">₹{(monthlyReport?.totalIncome || 0).toLocaleString()}</p>
                    <div className="mt-2.5 w-full h-1 bg-background rounded-full overflow-hidden">
                        <div className="h-full bg-success rounded-full w-full opacity-80"></div>
                    </div>
                </div>

                {/* Total Expense */}
                <div className="card-premium flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between mb-1.5">
                        <p className="label-premium">Total Expense</p>
                        <div className="p-1 bg-danger/10 rounded-md">
                            <MdTrendingUp className="text-danger text-base" />
                        </div>
                    </div>
                    <p className="text-lg md:text-xl font-bold text-textColor tracking-tight">₹{(monthlyReport?.totalSpent || 0).toLocaleString()}</p>
                    <div className="mt-2.5 w-full h-1 bg-background rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${incomePercentage > 90 ? 'bg-danger' : 'bg-primary'}`}
                             style={{ width: `${Math.min(incomePercentage, 100)}%` }}>
                        </div>
                    </div>
                </div>

                {/* Remaining Budget */}
                <div className="card-premium flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between mb-1.5">
                        <p className="label-premium">Remaining Budget</p>
                        <div className="p-1 bg-primary/10 rounded-md">
                            <MdAccountBalance className="text-primary text-base" />
                        </div>
                    </div>
                    <p className={`text-lg md:text-xl font-bold tracking-tight ${budgetStatus?.isExceeded ? 'text-danger' : 'text-textColor'}`}>
                        ₹{(budgetStatus?.remaining || 0).toLocaleString()}
                    </p>
                    <div className="mt-2.5 w-full h-1 bg-background rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${budgetStatus?.isExceeded ? 'bg-danger' : 'bg-primary opacity-60'}`}
                             style={{ width: `${Math.min(budgetPercentage, 100)}%` }}>
                        </div>
                    </div>
                </div>

                {/* Balance */}
                <div className="card-premium flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between mb-1.5">
                        <p className="label-premium">Net Balance</p>
                        <div className="p-1 bg-success/10 rounded-md">
                            <MdTrendingDown className="text-success text-base rotate-180" />
                        </div>
                    </div>
                    <p className={`text-lg md:text-xl font-bold tracking-tight ${monthlyReport?.remainingBalance < 0 ? 'text-danger' : 'text-textColor'}`}>
                        ₹{(monthlyReport?.remainingBalance || 0).toLocaleString()}
                    </p>
                    <p className="text-[8px] text-textMuted uppercase font-semibold tracking-wider mt-2.5">Income vs Outcome Flow</p>
                </div>
            </div>

            {/* Charts & Insights Section */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                {/* Category Distribution (Left: 4 Units) */}
                <div className="lg:col-span-4 card-premium">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <h3 className="h3-premium text-sm">Category Distribution</h3>
                            <p className="text-[10px] text-textMuted mt-0.5">Monthly spending breakdown</p>
                        </div>
                    </div>

                    {categoryData.length > 0 ? (
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            {/* Donut Chart */}
                            <div className="h-36 w-36 shrink-0 min-w-[144px] min-h-[144px]">
                                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            innerRadius={40}
                                            outerRadius={60}
                                            paddingAngle={3}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '6px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', fontSize: '10px' }}
                                            formatter={(val) => `₹${val.toLocaleString()}`}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Detailed Legend */}
                            <div className="w-full space-y-1.5">
                                {categoryData.slice(0, 4).map((cat, index) => (
                                    <div key={cat.name} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                            <span className="text-[11px] font-semibold text-textColor">{cat.name}</span>
                                        </div>
                                        <span className="text-[11px] font-bold text-textColor">₹{cat.value.toLocaleString()}</span>
                                    </div>
                                ))}
                                {categoryData.length > 4 && (
                                    <p className="text-center text-[8px] text-textMuted font-bold uppercase pt-0.5">+{categoryData.length - 4} More Categories</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-36 flex flex-col items-center justify-center bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                            <MdAccountBalance className="text-2xl text-textMuted opacity-20 mb-1" />
                            <p className="text-xs text-textMuted font-medium">No spending data to visualize</p>
                        </div>
                    )}
                </div>

                {/* Smart Analysis (Right: 3 Units) */}
                <div className="lg:col-span-3 flex flex-col gap-3">
                    <div className="h-full bg-gradient-to-br from-primary to-indigo-800 rounded-xl p-4 text-white relative overflow-hidden shadow-md group">
                        <div className="absolute -right-12 -top-12 bg-white/5 w-36 h-36 rounded-full blur-2xl group-hover:scale-105 transition-transform duration-700"></div>
                        <div className="absolute -left-12 -bottom-12 bg-white/5 w-32 h-32 rounded-full blur-xl"></div>

                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex items-center gap-1.5 mb-2.5">
                                <div className="p-1.5 bg-white/10 rounded-md backdrop-blur-sm">
                                    <MdLightbulb className="text-sm text-white" />
                                </div>
                                <h3 className="font-bold text-xs tracking-tight text-white">Smart Analysis</h3>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-[9px] font-bold text-white/50 uppercase tracking-wider mb-0.5">Top Spending Pattern</p>
                                    <p className="text-base font-bold text-white leading-tight">
                                        {analysis?.spendingPattern?.topCategory || 'Gathering insights...'}
                                    </p>
                                </div>

                                {analysis?.patternControl && (
                                    <div className="pt-2.5 border-t border-white/10">
                                        <p className="text-[9px] font-bold text-white/50 uppercase tracking-wider mb-0.5">Expense Control</p>
                                        <p className="text-[11px] text-white/90 leading-relaxed font-medium">
                                            Daily average <strong className="text-white">₹{Number(analysis.patternControl.averageDailyExpense).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong> — expected monthly <strong className="text-white">₹{Number(analysis.patternControl.expectedMonthly).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
                                        </p>
                                    </div>
                                )}

                                <div className="pt-2.5 border-t border-white/10">
                                    <p className="text-[9px] font-bold text-white/50 uppercase tracking-wider mb-0.5">Prediction Next Month</p>
                                    <div className="flex items-baseline gap-1.5">
                                        <p className="text-lg font-bold text-white">
                                            ₹{Number(analysis?.futureExpensePrediction || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                        </p>
                                        <div className="bg-white/10 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase text-white/80">Est.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;