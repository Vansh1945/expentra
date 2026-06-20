import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API } from '../context/AuthContext';
import {
    PieChart, Pie, Cell, Tooltip, Legend,
    LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';
import { MdDownload, MdAttachMoney, MdTrendingUp, MdWarning, MdCategory, MdShowChart, MdTrendingDown } from 'react-icons/md';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', '#EC4899', '#0EA5E9', '#64748B'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Reports = () => {
    const today = new Date();
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [monthlyData, setMonthlyData] = useState(null);
    const [yearlyData, setYearlyData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const [monthRes, yearRes] = await Promise.all([
                axios.get(`${API}/reports/monthly?month=${selectedMonth}&year=${selectedYear}`),
                axios.get(`${API}/reports/yearly?year=${selectedYear}`)
            ]);
            setMonthlyData(monthRes.data);
            setYearlyData(yearRes.data);
        } catch (error) {
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [selectedMonth, selectedYear]);

    const exportCSV = () => {
        if (!yearlyData?.monthlyBreakdown) return;
        const headers = ['Month', 'Total Amount (₹)', 'Transaction Count'];
        const rows = yearlyData.monthlyBreakdown.map(item => [
            MONTHS[item.month - 1] || item.month,
            item.totalAmount,
            item.count
        ]);
        let csvContent = 'data:text/csv;charset=utf-8,'
            + headers.join(',') + '\n'
            + rows.map(r => r.join(',')).join('\n');
        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csvContent));
        link.setAttribute('download', `Expentra_Report_${MONTHS[selectedMonth - 1]}_${selectedYear}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const totalIncome = monthlyData?.totalIncome || 0;
    const totalSpent = monthlyData?.totalSpent || 0;
    const remainingBalance = totalIncome - totalSpent;
    const savingsRate = totalIncome > 0 ? ((remainingBalance / totalIncome) * 100).toFixed(1) : 0;

    const categoryData = (monthlyData?.categoryWise || []).map(cat => ({
        name: cat.category,
        value: cat.totalAmount,
        percentage: totalSpent > 0 ? ((cat.totalAmount / totalSpent) * 100).toFixed(1) : 0
    }));

    const currentYear = today.getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];

    if (loading && !monthlyData) {
        return (
            <div className="space-y-6 bg-transparent pb-10">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-card rounded-2xl animate-pulse"></div>)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-80 bg-card rounded-2xl animate-pulse"></div>
                    <div className="h-80 bg-card rounded-2xl animate-pulse"></div>
                </div>
            </div>
        );
    }    return (
        <div className="space-y-4 bg-transparent pb-4">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <h1 className="h1-premium">Reports</h1>
                    <p className="text-xs text-textMuted mt-0.5">Detailed analysis of your income and spending</p>
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
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <button
                        onClick={exportCSV}
                        className="btn-secondary py-1 px-2.5 text-xs font-semibold h-8"
                    >
                        <MdDownload className="text-sm" /> Export CSV
                    </button>
                </div>
            </div>

            {/* Clean KPI row resembling Analysis Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {/* Total Income */}
                <div className="card-premium flex flex-col justify-between h-full">
                    <div>
                        <div className="flex items-center gap-2 mb-2.5">
                            <div className="bg-slate-50 rounded-lg p-1.5">
                                <MdAttachMoney className="w-3.5 h-3.5 text-success" />
                            </div>
                            <h3 className="text-xs font-bold text-textColor">Total Income</h3>
                        </div>
                        <p className="text-lg font-bold text-success">₹{totalIncome.toLocaleString()}</p>
                    </div>
                    <p className="text-[9px] text-textMuted/60 font-semibold uppercase mt-2.5">{MONTHS[selectedMonth - 1]} {selectedYear}</p>
                </div>

                {/* Total Expense */}
                <div className="card-premium flex flex-col justify-between h-full">
                    <div>
                        <div className="flex items-center gap-2 mb-2.5">
                            <div className="bg-slate-50 rounded-lg p-1.5">
                                <MdTrendingUp className="w-3.5 h-3.5 text-danger" />
                            </div>
                            <h3 className="text-xs font-bold text-textColor">Total Expense</h3>
                        </div>
                        <p className="text-lg font-bold text-danger">₹{totalSpent.toLocaleString()}</p>
                    </div>
                    <p className="text-[9px] text-textMuted/60 font-semibold uppercase mt-2.5">{MONTHS[selectedMonth - 1]} {selectedYear}</p>
                </div>

                {/* Remaining Balance */}
                <div className="card-premium flex flex-col justify-between h-full">
                    <div>
                        <div className="flex items-center gap-2 mb-2.5">
                            <div className="bg-slate-50 rounded-lg p-1.5">
                                {remainingBalance >= 0 ? <MdTrendingDown className="w-3.5 h-3.5 text-primary" /> : <MdTrendingUp className="w-3.5 h-3.5 text-danger" />}
                            </div>
                            <h3 className="text-xs font-bold text-textColor">Remaining Balance</h3>
                        </div>
                        <p className={`text-lg font-bold ${remainingBalance >= 0 ? 'text-primary' : 'text-danger'}`}>
                            ₹{remainingBalance.toLocaleString()}
                        </p>
                    </div>
                    <p className="text-[9px] text-textMuted/60 font-semibold uppercase mt-2.5">Savings Rate: {savingsRate}%</p>
                </div>
            </div>

            {/* Warning Message (Moved Below Stats) */}
            {totalSpent > 0 && totalIncome > 0 && totalSpent > totalIncome && (
                <div className="flex items-start gap-2 bg-danger/5 border border-danger/20 px-2.5 py-1.5 rounded-lg text-[10px] text-danger font-semibold w-fit mt-0.5 shadow-sm">
                    <MdWarning className="shrink-0 text-xs mt-0.5" />
                    <span>Warning: You have outspent your total income by ₹{(totalSpent - totalIncome).toLocaleString()} this month.</span>
                </div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Category-wise Pie Chart */}
                <div className="card-premium flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-3 left-3">
                        <h3 className="text-xs font-bold text-textColor">Expense Breakdown</h3>
                        <p className="text-[9px] text-textMuted mt-0.5">Where your money went this month</p>
                    </div>
                    {categoryData.length > 0 ? (
                        <div className="h-44 w-full mt-8">
                            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                <PieChart>
                                    <Pie
                                        isAnimationActive={false}
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={38}
                                        outerRadius={55}
                                        paddingAngle={3}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {categoryData.map((_, index) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '6px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', fontSize: '10px' }} formatter={value => `₹${value.toLocaleString()}`} />
                                    <Legend wrapperStyle={{ fontSize: '9px', paddingTop: '6px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-36 w-full mt-8 flex items-center justify-center text-xs text-textMuted italic bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                            No expenses logged for breakdown
                        </div>
                    )}
                </div>

                {/* Yearly Trend Line Chart */}
                <div className="card-premium flex flex-col justify-center">
                    <div className="mb-2.5">
                        <h3 className="text-xs font-bold text-textColor">Monthly Trend ({selectedYear})</h3>
                        <p className="text-[9px] text-textMuted mt-0.5">Your monthly spending velocity</p>
                    </div>
                    {yearlyData?.monthlyBreakdown?.length > 0 ? (
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                <LineChart data={yearlyData.monthlyBreakdown} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis
                                        dataKey="month"
                                        tickFormatter={val => MONTHS[val - 1] || val}
                                        axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10, fontWeight: 500}} dy={10}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10}} dx={-5} tickFormatter={(val) => `₹${val.toLocaleString()}`} />
                                    <Tooltip
                                        cursor={{stroke: '#F1F5F9', strokeWidth: 2}}
                                        contentStyle={{ borderRadius: '6px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '6px', fontSize: '10px' }}
                                        formatter={v => `₹${v.toLocaleString()}`}
                                        labelFormatter={val => MONTHS[val - 1] || val}
                                    />
                                    <Line
                                        isAnimationActive={false}
                                        type="monotone"
                                        dataKey="totalAmount"
                                        name="Expense"
                                        stroke="#4F46E5"
                                        strokeWidth={2}
                                        dot={{ r: 3, fill: '#4F46E5', strokeWidth: 1, stroke: '#FFFFFF' }}
                                        activeDot={{ r: 5 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-48 w-full flex items-center justify-center text-xs text-textMuted italic bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                            No yearly data available
                        </div>
                    )}
                </div>
            </div>

            {/* Empty State Overlay / Fallback */}
            {categoryData.length === 0 && totalIncome === 0 && (
                <div className="card-premium p-6 text-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-slate-50 border border-slate-100 shadow-sm rounded-full">
                            <MdAttachMoney className="w-8 h-8 text-textColor opacity-20" />
                        </div>
                        <h3 className="text-sm font-bold text-textColor">No Data Available</h3>
                        <p className="text-textMuted text-xs mt-0.5">
                            No income or expense records found for {MONTHS[selectedMonth - 1]} {selectedYear}.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;