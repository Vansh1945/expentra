import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API } from '../../context/AuthContext';
import {
    MdAdminPanelSettings, MdPeople, MdAttachMoney, MdTrendingUp,
    MdCategory, MdReceipt, MdShowChart, MdWarning,
    MdVerifiedUser, MdTimeline, MdDashboard
} from 'react-icons/md';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC489A', '#06B6D4'];

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [advancedStats, setAdvancedStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [basicRes, advRes] = await Promise.all([
                    axios.get(`${API}/admin/dashboard`),
                    axios.get(`${API}/admin/analytics/overview`)
                ]);
                setStats(basicRes.data);
                setAdvancedStats(advRes.data);
            } catch {
                toast.error('Failed to load admin stats');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-card rounded w-1/4 animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-card rounded-lg animate-pulse"></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-80 bg-card rounded-lg animate-pulse"></div>
                    <div className="h-80 bg-card rounded-lg animate-pulse"></div>
                </div>
            </div>
        );
    }

    const userGrowthData = stats?.usageGraph?.map(item => ({
        month: item.name,
        users: item.users || 0,
        transactions: item.amount || 0
    })) || [];

    const pieData = advancedStats?.topCategories?.slice(0, 6).map(cat => ({
        name: cat.name,
        value: cat.count,
        amount: cat.totalAmount || 0
    })) || [];

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-primary/5 rounded-lg">
                        <MdAdminPanelSettings className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="h1-premium">Admin Dashboard</h1>
                        <p className="small-premium mt-0.5">Platform overview and analytics</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="card-premium">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-textMuted uppercase tracking-wide">Total Users</p>
                            <p className="text-lg md:text-xl font-bold text-textColor mt-0.5">{stats?.totalUsers?.toLocaleString() || 0}</p>
                        </div>
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <MdPeople className="w-4 h-4 text-primary" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-textMuted/80">
                        <MdVerifiedUser className="text-textMuted/60 text-xs" />
                        <span>{stats?.adminCount || 0} Admins</span>
                    </div>
                </div>

                <div className="card-premium">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-textMuted uppercase tracking-wide">Daily Active</p>
                            <p className="text-lg md:text-xl font-bold text-textColor mt-0.5">{advancedStats?.dailyActiveUsers?.toLocaleString() || 0}</p>
                        </div>
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <MdShowChart className="w-4 h-4 text-primary" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-textMuted/80">
                        <MdTimeline className="text-textMuted/60 text-xs" />
                        <span>Last 24 hours</span>
                    </div>
                </div>

                <div className="card-premium">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-textMuted uppercase tracking-wide">Total Transactions</p>
                            <p className="text-lg md:text-xl font-bold text-textColor mt-0.5">{advancedStats?.totalExpensesCount?.toLocaleString() || 0}</p>
                        </div>
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <MdReceipt className="w-4 h-4 text-primary" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-textMuted/80">
                        <MdTrendingUp className="text-textMuted/60 text-xs" />
                        <span>All time</span>
                    </div>
                </div>

                <div className="card-premium">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-textMuted uppercase tracking-wide">Total Volume</p>
                            <p className="text-lg md:text-xl font-bold text-textColor mt-0.5">₹{advancedStats?.totalTransactionAmount?.toLocaleString() || 0}</p>
                        </div>
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <MdAttachMoney className="w-4 h-4 text-primary" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-textMuted/80">
                        <MdDashboard className="text-textMuted/60 text-xs" />
                        <span>System economy</span>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Platform Activity Trend */}
                <div className="card-premium">
                    <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-100">
                        <MdTrendingUp className="w-4 h-4 text-primary" />
                        <h3 className="font-bold text-textColor text-sm">Platform Activity Trend</h3>
                    </div>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <AreaChart data={userGrowthData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 9 }} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 9 }} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 9 }} />
                                <Tooltip contentStyle={{ background: '#FFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: 10 }} />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="users"
                                    name="New Users"
                                    stroke="#4F46E5"
                                    fillOpacity={1}
                                    fill="url(#colorUsers)"
                                />
                                <Area
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="transactions"
                                    name="Transactions (₹)"
                                    stroke="#10B981"
                                    fillOpacity={1}
                                    fill="url(#colorTransactions)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Categories Pie Chart */}
                <div className="card-premium">
                    <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-100">
                        <MdCategory className="w-4 h-4 text-primary" />
                        <h3 className="font-bold text-textColor text-sm">Top Spending Categories</h3>
                    </div>
                    <div className="h-48 w-full">
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                                        outerRadius={54}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value, name, props) => [`${value} transactions`, props.payload.name]} contentStyle={{ fontSize: 10 }} />
                                    <Legend wrapperStyle={{ fontSize: 9 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-textMuted/60 text-xs font-medium">
                                No category data available
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Users & Categories Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent Users Table */}
                <div className="card-premium !p-0 overflow-hidden">
                    <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <MdPeople className="w-4 h-4 text-primary" />
                            <h3 className="font-bold text-textColor text-sm">Recent Users</h3>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50/20">
                                <tr>
                                    <th className="px-3 py-1.5 text-left text-[9px] font-bold text-textMuted uppercase tracking-wider">User</th>
                                    <th className="px-3 py-1.5 text-left text-[9px] font-bold text-textMuted uppercase tracking-wider">Email</th>
                                    <th className="px-3 py-1.5 text-left text-[9px] font-bold text-textMuted uppercase tracking-wider">Role</th>
                                    <th className="px-3 py-1.5 text-left text-[9px] font-bold text-textMuted uppercase tracking-wider">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {stats?.recentUsers?.slice(0, 5).map((user) => (
                                    <tr key={user._id} className="hover:bg-slate-50/30 transition-all duration-200">
                                        <td className="px-3 py-2 animate-none">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center shrink-0">
                                                    <span className="text-[10px] font-bold text-primary">
                                                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-semibold text-textColor">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-xs text-textMuted font-medium">{user.email}</td>
                                        <td className="px-3 py-2">
                                            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${user.role === 'admin'
                                                ? 'bg-primary/10 text-primary'
                                                : 'bg-slate-100 text-textMuted'
                                                }`}>
                                                {user.role === 'admin' && <MdVerifiedUser className="text-[9px]" />}
                                                {user.role || 'user'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-xs text-textMuted font-medium">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
                                    <tr>
                                        <td colSpan="4" className="px-3 py-4 text-center text-textMuted/60 text-xs font-medium">
                                            No users found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Categories Table */}
                <div className="card-premium !p-0 overflow-hidden">
                    <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <MdCategory className="w-4 h-4 text-primary" />
                            <h3 className="font-bold text-textColor text-sm">Top Expense Categories</h3>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50/20">
                                <tr>
                                    <th className="px-3 py-1.5 text-left text-[9px] font-bold text-textMuted uppercase tracking-wider">Category</th>
                                    <th className="px-3 py-1.5 text-right text-[9px] font-bold text-textMuted uppercase tracking-wider">Usage</th>
                                    <th className="px-3 py-1.5 text-right text-[9px] font-bold text-textMuted uppercase tracking-wider">Total Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {advancedStats?.topCategories?.slice(0, 5).map((cat, idx) => (
                                    <tr key={cat.name} className="hover:bg-slate-50/30 transition-all duration-200">
                                        <td className="px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                                <span className="text-xs font-semibold text-textColor capitalize">{cat.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-right text-xs font-bold text-textColor">{cat.count}</td>
                                        <td className="px-3 py-2 text-right text-xs font-bold text-success">
                                            ₹{cat.totalAmount?.toLocaleString() || 0}
                                        </td>
                                    </tr>
                                ))}
                                {(!advancedStats?.topCategories || advancedStats.topCategories.length === 0) && (
                                    <tr>
                                        <td colSpan="3" className="px-3 py-4 text-center text-textMuted/60 text-xs font-medium">
                                            No category data available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* System Health Indicator */}
            <div className="card-premium">
                <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-100">
                    <MdWarning className="w-4 h-4 text-primary" />
                    <h3 className="font-bold text-textColor text-sm">System Health</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded-lg">
                        <span className="text-[10px] font-bold text-textMuted uppercase tracking-wide">Active Groups</span>
                        <span className="text-sm font-bold text-primary">{advancedStats?.activeGroups || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded-lg">
                        <span className="text-[10px] font-bold text-textMuted uppercase tracking-wide">Avg Transaction</span>
                        <span className="text-sm font-bold text-primary">
                            ₹{advancedStats?.averageTransactionAmount?.toLocaleString() || 0}
                        </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded-lg">
                        <span className="text-[10px] font-bold text-textMuted uppercase tracking-wide">User Growth</span>
                        <span className={`text-sm font-bold ${(stats?.growthRate || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                            {(stats?.growthRate || 0) >= 0 ? '+' : ''}{stats?.growthRate || 0}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;