import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API } from '../context/AuthContext';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    MdTrendingUp, MdTrendingDown, MdLightbulb,
    MdHealthAndSafety, MdRefresh, MdAutoGraph
} from 'react-icons/md';

const Analysis = () => {
    const today = new Date();
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    
    const [analysis, setAnalysis] = useState(null);
    const [monthlyData, setMonthlyData] = useState(null);
    const [yearlyData, setYearlyData] = useState(null);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const fetchData = async () => {
        setLoading(true);
        setError(false);
        try {
            const [analysisRes, monthlyRes, yearlyRes] = await Promise.all([
                axios.get(`${API}/analysis/summary`).catch(() => ({ data: null })),
                axios.get(`${API}/reports/monthly?month=${selectedMonth}&year=${selectedYear}`).catch(() => ({ data: null })),
                axios.get(`${API}/reports/yearly?year=${selectedYear}`).catch(() => ({ data: null }))
            ]);

            if (analysisRes.data) setAnalysis(analysisRes.data);
            if (monthlyRes.data) setMonthlyData(monthlyRes.data);
            if (yearlyRes.data) setYearlyData(yearlyRes.data);
            
            if (!analysisRes.data && !monthlyRes.data) setError(true);
        } catch (error) {
            toast.error('Failed to load financial analysis.');
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedMonth, selectedYear]);

    if (loading && !analysis) {
        return (
            <div className="space-y-6 bg-transparent">
                <div className="h-48 bg-card rounded-2xl animate-pulse"></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-card rounded-2xl animate-pulse"></div>)}
                </div>
                <div className="h-72 bg-card rounded-2xl animate-pulse"></div>
            </div>
        );
    }

    if (error && !analysis) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-card rounded-2xl shadow-sm border border-background">
                <p className="text-danger font-medium opacity-80">Could not load analysis data.</p>
                <button
                    onClick={fetchData}
                    className="mt-4 flex items-center gap-1.5 px-5 py-2.5 bg-primary text-card text-sm font-medium rounded-xl hover:opacity-90 transition-all shadow-sm"
                >
                    <MdRefresh className="text-lg" /> Retry Connection
                </button>
            </div>
        );
    }

    // Processing Backend Data
    const prediction = Number(analysis?.futureExpensePrediction) || 0;
    const healthScoreRaw = analysis?.financialHealthScore || '0/100';
    const healthScore = parseInt(healthScoreRaw.split('/')[0], 10) || 0;

    const healthColor = healthScore >= 80 ? 'text-success' : healthScore >= 50 ? 'text-primary' : 'text-danger';
    const healthBarColor = healthScore >= 80 ? 'bg-success' : healthScore >= 50 ? 'bg-primary' : 'bg-danger';

    // Processing Trend Data
    const trendData = MONTHS.map((m, i) => {
        const monthData = yearlyData?.monthlyBreakdown?.find(d => d.month === i + 1);
        return { name: m, spent: monthData?.totalAmount || 0 };
    });

    const averageDailyExpense = monthlyData?.totalSpent ? (monthlyData.totalSpent / new Date(selectedYear, selectedMonth, 0).getDate()).toFixed(0) : 0;
    const savingsRate = monthlyData?.totalIncome > 0 ? (((monthlyData.totalIncome - monthlyData.totalSpent) / monthlyData.totalIncome) * 100).toFixed(1) : 0;

    return (
        <div className="space-y-4 bg-transparent pb-4">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <h1 className="h1-premium">Analysis</h1>
                    <p className="text-xs text-textMuted mt-0.5">Smart financial overview and insights</p>
                </div>
                <div className="flex flex-wrap gap-1.5 items-center">
                    <select
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(Number(e.target.value))}
                        className="select-premium py-1 px-2.5 text-xs w-auto h-8"
                    >
                        {MONTHS.map((m, i) => (
                            <option key={m} value={i + 1}>{m}</option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={e => setSelectedYear(Number(e.target.value))}
                        className="select-premium py-1 px-2.5 text-xs w-auto h-8"
                    >
                        {[0, 1, 2].map(o => {
                            const y = today.getFullYear() - o;
                            return <option key={y} value={y}>{y}</option>;
                        })}
                    </select>
                </div>
            </div>

            {/* Smart Expense Prediction */}
            <div className="bg-gradient-to-br from-primary to-indigo-800 rounded-xl shadow-md p-4 text-white relative overflow-hidden transition-all duration-300">
                <div className="absolute -right-10 -top-10 bg-white/5 w-48 h-48 rounded-full blur-2xl"></div>
                <div className="absolute -left-10 -bottom-10 bg-white/5 w-32 h-32 rounded-full blur-xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-white/10 rounded-lg p-1.5 backdrop-blur-sm shadow-sm">
                                <MdLightbulb className="w-4 h-4 text-white" />
                            </div>
                            <h2 className="text-sm font-bold tracking-wide">Expense Prediction</h2>
                        </div>
                        <p className="text-white/80 text-[11px] max-w-sm leading-relaxed">
                            Based on your rolling average, our intelligence predicts your expenses next month to be:
                        </p>
                    </div>
                    <div className="md:text-right w-full md:w-auto">
                        {prediction > 0 ? (
                            <>
                                <p className="text-xl md:text-2xl font-bold tracking-tight">
                                    ₹{prediction.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </p>
                                <div className="inline-flex mt-1.5 bg-white/10 px-2.5 py-0.5 rounded-full backdrop-blur-md border border-white/10">
                                    <p className="text-[9px] font-bold text-white tracking-wide">
                                        {prediction > (monthlyData?.totalIncome || 0) ? '⚠️ Alert: May exceed current income' : '✓ Spending under control'}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <p className="text-white/90 text-[11px] font-medium italic">
                                Insufficient historical data to construct predictions.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Core Insights Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {/* Health Score */}
                <div className="card-premium">
                    <div className="flex items-center gap-2 mb-2.5">
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-1.5">
                            <MdHealthAndSafety className={`w-3.5 h-3.5 ${healthColor}`} />
                        </div>
                        <h3 className="text-xs font-bold text-textColor">Health Score</h3>
                    </div>
                    <div className="flex items-baseline gap-0.5">
                        <span className={`text-xl font-bold ${healthColor}`}>{healthScore}</span>
                        <span className="text-xs text-textMuted font-semibold">/100</span>
                    </div>
                    <div className="w-full mt-2.5 bg-slate-100 rounded-full h-1">
                        <div
                            className={`h-1 rounded-full transition-all duration-1000 ${healthBarColor}`}
                            style={{ width: `${Math.min(100, healthScore)}%` }}
                        />
                    </div>
                </div>

                {/* Average Daily Expense */}
                <div className="card-premium flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2.5">
                            <div className="bg-slate-50 border border-slate-100 rounded-lg p-1.5">
                                <MdAutoGraph className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <h3 className="text-xs font-bold text-textColor">Daily Spend Rate</h3>
                        </div>
                        <p className="text-lg font-bold text-textColor">₹{Number(averageDailyExpense).toLocaleString()}</p>
                    </div>
                    <p className="text-[9px] text-textMuted/60 font-semibold uppercase mt-2.5">Average spent per day</p>
                </div>

                {/* Savings Rate */}
                <div className="card-premium flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2.5">
                            <div className="bg-slate-50 border border-slate-100 rounded-lg p-1.5">
                                {savingsRate >= 0 ? <MdTrendingUp className="w-3.5 h-3.5 text-success" /> : <MdTrendingDown className="w-3.5 h-3.5 text-danger" />}
                            </div>
                            <h3 className="text-xs font-bold text-textColor">Savings Rate</h3>
                        </div>
                        <p className={`text-lg font-bold ${savingsRate >= 0 ? 'text-success' : 'text-danger'}`}>{savingsRate}%</p>
                    </div>
                    <p className="text-[9px] text-textMuted/60 font-semibold uppercase mt-2.5">Income retention metric</p>
                </div>
            </div>

            {/* Annual Trend Chart */}
            <div className="card-premium">
                <div className="mb-2.5">
                    <h3 className="text-xs font-bold text-textColor">Annual Spending Trend</h3>
                    <p className="text-[10px] text-textMuted mt-0.5">Month-by-month expenditure trajectory</p>
                </div>
                <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                        <LineChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10, fontWeight: 500}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10}} dx={-5} tickFormatter={(val) => `₹${val.toLocaleString()}`} />
                            <Tooltip
                                cursor={{stroke: '#F1F5F9', strokeWidth: 2}}
                                contentStyle={{ borderRadius: '6px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '6px', fontSize: '10px' }}
                            />
                            <Line type="monotone" dataKey="spent" name="Spent" stroke="#4F46E5" strokeWidth={2} dot={{r: 3, fill: '#4F46E5', strokeWidth: 1, stroke: '#FFFFFF'}} activeDot={{r: 5}} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Analysis;