import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext, API } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import {
    MdGroup, MdAccountBalanceWallet,
    MdTrendingUp, MdPriorityHigh, MdShowChart, MdAttachMoney,
    MdArrowBack, MdCalendarToday, MdGroups
} from 'react-icons/md';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

const GroupDashboard = () => {
    const { selectedGroupId, user } = useContext(AuthContext);
    const [groupData, setGroupData] = useState(null);
    const [settlements, setSettlements] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!selectedGroupId) return;
        const fetchGroupDashboard = async () => {
            try {
                const [groupRes, settleRes, expRes] = await Promise.all([
                    axios.get(`${API}/groups/${selectedGroupId}`),
                    axios.get(`${API}/group-expenses/${selectedGroupId}/settlements`),
                    axios.get(`${API}/group-expenses/${selectedGroupId}`)
                ]);
                setGroupData(groupRes.data);
                setSettlements(settleRes.data);
                setExpenses(expRes.data);
            } catch (error) {
                toast.error('Failed to load group dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchGroupDashboard();
    }, [selectedGroupId]);

    if (!selectedGroupId) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-card rounded-3xl border border-background shadow-sm mt-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                    <MdGroup className="w-10 h-10 text-primary opacity-40" />
                </div>
                <h3 className="text-xl font-bold text-textColor">No Group Selected</h3>
                <p className="text-textColor/60 mt-2 max-w-xs mx-auto">Please select a group from the Groups menu to view its dashboard.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="space-y-8 bg-transparent animate-pulse">
                <div className="h-10 bg-card rounded-xl w-64"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-card rounded-2xl"></div>)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 h-96 bg-card rounded-3xl"></div>
                    <div className="h-96 bg-card rounded-3xl"></div>
                </div>
            </div>
        );
    }

    const totalGroupExpense = expenses.reduce((acc, exp) => acc + exp.amount, 0);

    // Payment map
    const paymentMap = {};
    expenses.forEach(exp => {
        exp.paidBy.forEach(p => {
            const id = p.user ? p.user.toString() : p.name;
            paymentMap[id] = (paymentMap[id] || 0) + p.amount;
        });
    });

    // Top payer
    let topPayer = { name: 'N/A', amount: 0 };
    Object.keys(paymentMap).forEach(id => {
        if (paymentMap[id] > topPayer.amount) {
            topPayer = {
                name: groupData.members.find(
                    m => (m.user && m.user.toString() === id) || m.name === id
                )?.name || 'Member',
                amount: paymentMap[id]
            };
        }
    });

    // Top debtor
    let topDebtor = { name: 'All Settled', amount: 0 };
    settlements?.balances?.forEach(b => {
        if (b.balance < topDebtor.amount) {
            topDebtor = { name: b.memberInfo.name, amount: b.balance };
        }
    });

    // My balance
    const myBal = settlements?.balances?.find(
        b => b.memberInfo.user && user && b.memberInfo.user.toString() === user._id.toString()
    )?.balance || 0;
    const balLabel = myBal > 0 ? 'You Get Back' : myBal < 0 ? 'You Owe' : 'Your Balance';
    const allSettlements = [
        ...(settlements?.overdueReimbursements || []),
        ...(settlements?.pendingReimbursements || [])
    ];

    const contributionData = groupData?.members.map(m => {
        const id = m.user ? m.user.toString() : m.name;
        return {
            name: m.name,
            value: paymentMap[id] || 0
        };
    }).filter(d => d.value > 0) || [];

    return (
        <div className="space-y-6 pb-8 text-textColor">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-xl">
                        <MdGroups className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="h1-premium">{groupData?.name}</h1>
                        <p className="small-premium mt-0.5">Group Financial Overview</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-card rounded-lg border border-slate-100 shadow-sm text-xs font-semibold">
                    <MdCalendarToday className="text-primary text-sm" />
                    <span className="text-textMuted">Updated: today</span>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Members */}
                <div className="card-premium">
                    <div className="flex items-center justify-between mb-1.5">
                        <p className="label-premium">Members</p>
                        <div className="p-1 bg-primary/10 rounded-lg">
                            <MdGroup className="text-primary text-xs" />
                        </div>
                    </div>
                    <p className="text-lg md:text-xl font-bold">{groupData?.members?.length || 0}</p>
                    <div className="mt-2.5 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full w-full opacity-80"></div>
                    </div>
                </div>

                {/* My Balance */}
                <div className="card-premium">
                    <div className="flex items-center justify-between mb-1.5">
                        <p className="label-premium">{balLabel}</p>
                        <div className={`p-1 rounded-lg ${myBal < 0 ? 'bg-danger/10' : 'bg-success/10'}`}>
                            <MdAccountBalanceWallet className={`text-xs ${myBal < 0 ? 'text-danger' : 'text-success'}`} />
                        </div>
                    </div>
                    <p className={`text-lg md:text-xl font-bold ${myBal < 0 ? 'text-danger' : 'text-textColor'}`}>
                        ₹{Math.abs(myBal).toLocaleString()}
                    </p>
                    <div className="mt-2.5 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${myBal < 0 ? 'bg-danger' : 'bg-success'}`} style={{ width: '100%' }}></div>
                    </div>
                </div>

                {/* Total Group Expense */}
                <div className="card-premium">
                    <div className="flex items-center justify-between mb-1.5">
                        <p className="label-premium">Total Group</p>
                        <div className="p-1 bg-primary/10 rounded-lg">
                            <MdShowChart className="text-primary text-xs" />
                        </div>
                    </div>
                    <p className="text-lg md:text-xl font-bold">₹{totalGroupExpense.toLocaleString()}</p>
                    <div className="mt-2.5 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary opacity-60 rounded-full w-full"></div>
                    </div>
                </div>

                {/* Top Payer */}
                <div className="card-premium">
                    <div className="flex items-center justify-between mb-1.5">
                        <p className="label-premium">Top Payer</p>
                        <div className="p-1 bg-success/10 rounded-lg">
                            <MdTrendingUp className="text-success text-xs" />
                        </div>
                    </div>
                    <p className="text-xs font-bold truncate" title={topPayer.name}>{topPayer.name}</p>
                    <p className="text-[10px] font-semibold text-textMuted mt-0.5">₹{topPayer.amount.toLocaleString()}</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                {/* Member Contributions (Left: 4 Units) */}
                <div className="lg:col-span-4 bg-card rounded-xl border border-slate-100 p-4 shadow-sm">
                    <div className="mb-4">
                        <h3 className="h3-premium">Member Contributions</h3>
                        <p className="small-premium mt-0.5">Total expenses paid per member</p>
                    </div>

                    {contributionData.length > 0 ? (
                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                            {/* Donut Chart */}
                            <div className="h-36 w-36 shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={contributionData}
                                            innerRadius={36}
                                            outerRadius={54}
                                            paddingAngle={3}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {contributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontSize: '11px' }} 
                                            formatter={(val) => `₹${val.toLocaleString()}`}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Detailed Legend */}
                            <div className="w-full space-y-1.5">
                                {contributionData.map((cat, index) => (
                                    <div key={cat.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100/50 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                            <span className="text-xs font-semibold text-textMuted">{cat.name}</span>
                                        </div>
                                        <span className="text-xs font-bold text-textColor">₹{cat.value.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-36 flex flex-col items-center justify-center bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                            <MdAccountBalanceWallet className="text-2xl text-textMuted/40 mb-1" />
                            <p className="text-xs text-textMuted font-medium">No contribution data yet</p>
                        </div>
                    )}

                    {/* Pending Settlements List */}
                    <div className="mt-5 pt-5 border-t border-slate-100">
                        <h3 className="text-sm font-bold tracking-tight mb-3">Optimized Settlements</h3>
                        {allSettlements.length === 0 ? (
                            <div className="text-center py-3 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                                <p className="text-textMuted font-semibold text-xs">🎉 Everyone is all settled up!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                {allSettlements.map((debt, i) => {
                                    const isOverdue = debt.reimbursementStatus === 'overdue';
                                    return (
                                        <div
                                            key={i}
                                            className={`p-2.5 rounded-lg border transition-all hover:shadow-sm ${isOverdue
                                                    ? 'bg-danger/5 border-danger/10'
                                                    : 'bg-slate-50/50 border-slate-100'
                                                }`}
                                        >
                                            <div className="flex items-center text-[9px] mb-1 gap-1.5">
                                                <span className="font-bold text-textColor">{debt.from.name}</span>
                                                <span className="text-textMuted/60 uppercase tracking-tighter">pays to</span>
                                                <span className="font-bold text-textColor">{debt.to.name}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className={`text-sm font-bold ${isOverdue ? 'text-danger' : 'text-textColor'}`}>
                                                    ₹{debt.amount.toLocaleString()}
                                                </span>
                                                {isOverdue && (
                                                    <span className="text-[7px] font-bold bg-danger text-white px-1 py-0.5 rounded uppercase tracking-tighter">
                                                        Overdue
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column (Insights & Members - 3 Units) */}
                <div className="lg:col-span-3 flex flex-col gap-4">
                    {/* Urgent Settlement Card (Gradient) */}
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-4 text-white relative overflow-hidden shadow-sm group shrink-0">
                        <div className="absolute -right-8 -top-8 bg-white/10 w-32 h-32 rounded-full blur-2xl group-hover:scale-105 transition-transform duration-700"></div>
                        <div className="absolute -left-8 -bottom-8 bg-white/10 w-28 h-28 rounded-full blur-2xl"></div>
                        
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm border border-white/10">
                                    <MdPriorityHigh className="text-sm text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xs tracking-tight text-white">Action Required</h3>
                                    <p className="text-[9px] text-white/60">Settlement Insights</p>
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <div>
                                    <p className="text-[8px] font-bold text-white/50 uppercase tracking-widest mb-0.5">Top Debtor</p>
                                    <p className="text-lg font-bold text-white leading-tight">
                                        {topDebtor.name}
                                    </p>
                                </div>

                                <div className="pt-2.5 border-t border-white/10">
                                    <p className="text-[8px] font-bold text-white/50 uppercase tracking-widest mb-0.5">Total Amount Owed</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-xl font-bold text-white">
                                            ₹{Math.abs(topDebtor.amount).toLocaleString()}
                                        </p>
                                    </div>
                                    {topDebtor.name !== 'All Settled' && (
                                        <p className="text-[9px] text-white/60 mt-1.5 leading-relaxed italic">
                                            "Direct settlements keep the group harmony."
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Group Members List */}
                    <div className="bg-card rounded-xl border border-slate-100 p-4 shadow-sm flex-1">
                        <h3 className="h3-premium mb-3">Group Members</h3>
                        <div className="space-y-1.5">
                            {groupData?.members.map((m) => (
                                <div key={m._id || m.name} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center text-primary font-bold text-xs">
                                            {m.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-textColor">{m.name}</p>
                                            <p className="text-[8px] text-textMuted uppercase font-bold tracking-tighter">
                                                Joined {new Date(m.joinedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-1 bg-slate-50 rounded">
                                        <MdAttachMoney className="text-primary text-[8px] opacity-40" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupDashboard;