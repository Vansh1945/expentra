import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext, API } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
    MdTrendingUp, MdCategory, MdPerson, MdGroup, MdAttachMoney,
    MdShowChart, MdReceipt, MdAutoGraph, MdTrendingDown, MdHealthAndSafety
} from 'react-icons/md';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC489A', '#06B6D4', '#84CC16'];

const GroupAnalytics = () => {
    const { selectedGroupId } = useContext(AuthContext);
    const [expenses, setExpenses] = useState([]);
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!selectedGroupId) return;

        const fetchData = async () => {
            try {
                const [expRes, groupRes] = await Promise.all([
                    axios.get(`${API}/group-expenses/${selectedGroupId}`),
                    axios.get(`${API}/groups/${selectedGroupId}`)
                ]);
                setExpenses(expRes.data);
                setGroupData(groupRes.data);
            } catch (error) {
                toast.error("Failed to load group analytics data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedGroupId]);

    if (!selectedGroupId) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="bg-card rounded-lg border border-background p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-4">
                        <MdGroup className="w-8 h-8 text-textColor/50" />
                    </div>
                    <h3 className="text-xl font-semibold text-textColor">No Group Selected</h3>
                    <p className="text-textColor/70 mt-2">Please select a group from the Groups menu first.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="space-y-4">
                    <div className="h-8 bg-card rounded w-1/4 animate-pulse"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-28 bg-card rounded-lg animate-pulse"></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="h-96 bg-card rounded-lg animate-pulse"></div>
                        <div className="h-96 bg-card rounded-lg animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    const totalSpent = expenses.reduce((acc, exp) => acc + exp.amount, 0);

    // Category wise spending
    const categoryMap = {};
    expenses.forEach(exp => {
        const cat = exp.category || 'General';
        categoryMap[cat] = (categoryMap[cat] || 0) + exp.amount;
    });
    const categoryData = Object.keys(categoryMap).map(key => ({
        name: key,
        value: categoryMap[key]
    })).sort((a, b) => b.value - a.value);

    // Who paid how much
    const paidByMap = {};
    expenses.forEach(exp => {
        if (Array.isArray(exp.paidBy)) {
            exp.paidBy.forEach(payer => {
                const name = payer.name || 'Unknown';
                paidByMap[name] = (paidByMap[name] || 0) + payer.amount;
            });
        } else {
            const name = exp.paidBy?.name || 'Unknown';
            paidByMap[name] = (paidByMap[name] || 0) + exp.amount;
        }
    });
    const paidByData = Object.keys(paidByMap).map(key => ({
        name: key,
        amount: paidByMap[key]
    })).sort((a, b) => b.amount - a.amount);

    // Monthly trend data
    const monthlyMap = {};
    expenses.forEach(exp => {
        const date = new Date(exp.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        const monthName = date.toLocaleString('default', { month: 'short' });
        if (!monthlyMap[monthKey]) {
            monthlyMap[monthKey] = { month: monthName, amount: 0, count: 0 };
        }
        monthlyMap[monthKey].amount += exp.amount;
        monthlyMap[monthKey].count += 1;
    });
    const monthlyData = Object.values(monthlyMap).sort((a, b) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.indexOf(a.month) - months.indexOf(b.month);
    });

    const topPayer = paidByData[0]?.name || 'N/A';
    const topCategory = categoryData[0]?.name || 'N/A';

    return (
        <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
            {/* Header */}
            <div>
                <h1 className="h1-premium">Group Analytics</h1>
                <p className="small-premium mt-0.5">
                    {groupData?.name} • Spending insights
                </p>
            </div>

            {expenses.length === 0 ? (
                <div className="bg-card rounded-xl border border-slate-100 p-10 text-center shadow-sm">
                    <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-100">
                        <MdShowChart className="w-6 h-6 text-textMuted/50" />
                    </div>
                    <h3 className="h3-premium">No Data Available</h3>
                    <p className="body-premium mt-1.5">Add expenses to this group to see analytics.</p>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    {/* Unified Insight Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Total Spending */}
                        <div className="card-premium">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="bg-slate-50 rounded-lg p-1.5 border border-slate-100">
                                    <MdAttachMoney className="w-4 h-4 text-primary" />
                                </div>
                                <h3 className="label-premium">Total Group Spend</h3>
                            </div>
                            <p className="text-lg md:text-xl font-bold text-textColor">₹{totalSpent.toLocaleString()}</p>
                            <p className="text-[9px] font-bold text-primary mt-1">{expenses.length} transactions recorded</p>
                        </div>

                        {/* Top Payer */}
                        <div className="card-premium">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="bg-slate-50 rounded-lg p-1.5 border border-slate-100">
                                    <MdPerson className="w-4 h-4 text-primary" />
                                </div>
                                <h3 className="label-premium">Top Contributor</h3>
                            </div>
                            <p className="text-lg md:text-xl font-bold text-textColor truncate">{topPayer}</p>
                            <p className="text-[9px] font-bold text-primary mt-1">Highest squad contributor</p>
                        </div>

                        {/* Top Category */}
                        <div className="card-premium">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="bg-slate-50 rounded-lg p-1.5 border border-slate-100">
                                    <MdCategory className="w-4 h-4 text-primary" />
                                </div>
                                <h3 className="label-premium">Top Spending Cat</h3>
                            </div>
                            <p className="text-lg md:text-xl font-bold text-textColor truncate">{topCategory}</p>
                            <p className="text-[9px] font-bold text-primary mt-1">Most frequent group expense</p>
                        </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Category Pie Chart */}
                        <div className="bg-card rounded-xl border border-slate-100 p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                    <MdCategory className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-textColor">Spending by Category</h3>
                                    <p className="text-[8px] font-medium text-textMuted uppercase tracking-widest leading-none mt-0.5">Mix Breakdown</p>
                                </div>
                            </div>
                            <div className="h-48 w-full mt-1">
                                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            innerRadius={36}
                                            outerRadius={52}
                                            paddingAngle={3}
                                            dataKey="value"
                                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                            labelLine={false}
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', fontSize: '10px' }}
                                            formatter={(value) => [`₹${value.toLocaleString()}`, 'Spent']}
                                        />
                                        <Legend
                                            iconType="circle"
                                            layout="horizontal"
                                            verticalAlign="bottom"
                                            align="center"
                                            wrapperStyle={{ fontSize: '8px', fontWeight: 'bold', paddingTop: '5px' }}
                                            formatter={(value, _entry) => {
                                                const item = categoryData.find(d => d.name === value);
                                                return <span className="text-textMuted">{value}: ₹{item?.value.toLocaleString()}</span>;
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Contributions Bar Chart */}
                        <div className="bg-card rounded-xl border border-slate-100 p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-textMuted">
                                    <MdPerson className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-textColor">Member Shares</h3>
                                    <p className="text-[8px] font-medium text-textMuted uppercase tracking-widest leading-none mt-0.5">Individual Contributions</p>
                                </div>
                            </div>
                            <div className="h-48 w-full mt-1">
                                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                    <BarChart data={paidByData} layout="vertical" margin={{ left: 5 }}>
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748B', fontSize: 8, fontWeight: 'bold' }}
                                            width={90}
                                            tickFormatter={(value) => {
                                                const item = paidByData.find(d => d.name === value);
                                                return `${value} (₹${item?.amount.toLocaleString()})`;
                                            }}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', fontSize: '10px' }}
                                            formatter={(value) => [`₹${value.toLocaleString()}`, 'Paid']}
                                        />
                                        <Bar dataKey="amount" radius={[0, 4, 4, 0]} maxBarSize={16}>
                                            {paidByData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Monthly Trend Chart */}
                        {monthlyData.length > 0 && (
                            <div className="bg-card rounded-xl border border-slate-100 p-4 shadow-sm md:col-span-2">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                        <MdTrendingUp className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold text-textColor">Spending Trend</h3>
                                        <p className="text-[8px] font-medium text-textMuted uppercase tracking-widest leading-none mt-0.5">Monthly Flow</p>
                                    </div>
                                </div>
                                <div className="h-48 w-full">
                                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                        <LineChart data={monthlyData} margin={{ top: 5, right: 15, left: 5, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 9, fontWeight: 'bold' }} dy={6} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 9 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', fontSize: '10px' }}
                                                formatter={(value) => [`₹${value.toLocaleString()}`, 'Spent']}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="amount"
                                                stroke="#4F46E5"
                                                strokeWidth={2.5}
                                                dot={{ r: 3, fill: '#4F46E5', strokeWidth: 1, stroke: '#FFFFFF' }}
                                                activeDot={{ r: 4.5, fill: '#4F46E5', strokeWidth: 1, stroke: '#FFFFFF' }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default GroupAnalytics;