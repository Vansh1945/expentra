import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext, API } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import CategoryIcon from '../../utils/CategoryIcon';
import {
    MdAdd, MdReceipt, MdKeyboardArrowDown, MdKeyboardArrowUp,
    MdCompareArrows, MdEdit, MdDelete, MdGroup, MdAttachMoney,
    MdPerson, MdCalendarToday, MdInfoOutline, MdCheckCircle
} from 'react-icons/md';

const GroupExpenses = () => {
    const navigate = useNavigate();
    const { selectedGroupId } = useContext(AuthContext);
    const [activities, setActivities] = useState([]);
    const [groupData, setGroupData] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedActivity, setExpandedActivity] = useState(null);

    const fetchData = async () => {
        try {
            const [expRes, groupRes, catRes] = await Promise.all([
                axios.get(`${API}/group-expenses/${selectedGroupId}`),
                axios.get(`${API}/groups/${selectedGroupId}`),
                axios.get(`${API}/categories`)
            ]);

            const rawExpenses = expRes.data;
            const transformedActivities = [];
            const settlementAggregator = {};

            rawExpenses.forEach(exp => {
                transformedActivities.push({
                    ...exp,
                    activityType: 'expense'
                });

                if (exp.settlements && exp.settlements.length > 0) {
                    exp.settlements.forEach(s => {
                        if (s.reimbursementStatus === 'paid') {
                            const dateKey = s.paymentDate ? new Date(s.paymentDate).getTime() : new Date(exp.date).getTime();
                            const fromKey = s.from.user || s.from.name;
                            const toKey = s.to.user || s.to.name;
                            const key = `${dateKey}_${fromKey}_${toKey}`;

                            if (!settlementAggregator[key]) {
                                settlementAggregator[key] = {
                                    _id: `settle_${key}`,
                                    activityType: 'settlement',
                                    title: `Settled: ${s.from.name} → ${s.to.name}`,
                                    amount: s.amount,
                                    date: new Date(dateKey),
                                    note: `Settled for group of expenses`,
                                    paymentMethod: s.paymentMethod,
                                    expensesCount: 1,
                                    underlyingExpenses: [{
                                        title: exp.title,
                                        amount: s.amount
                                    }]
                                };
                            } else {
                                settlementAggregator[key].amount += s.amount;
                                settlementAggregator[key].expensesCount += 1;
                                settlementAggregator[key].underlyingExpenses.push({
                                    title: exp.title,
                                    amount: s.amount
                                });
                            }
                        }
                    });
                }
            });

            Object.values(settlementAggregator).forEach(aggS => {
                transformedActivities.push(aggS);
            });

            transformedActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
            setActivities(transformedActivities);
            setGroupData(groupRes.data);
            setCategories(catRes.data);
        } catch (error) {
            toast.error("Failed to load activities");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!selectedGroupId) return;
        fetchData();
    }, [selectedGroupId]);

    const handleDeleteExpense = async (expenseId) => {
        if (!window.confirm("Are you sure you want to delete this expense?")) {
            return;
        }
        try {
            await axios.delete(`${API}/group-expenses/${selectedGroupId}/${expenseId}`);
            toast.success("Expense deleted successfully");
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete expense");
        }
    };

    if (!selectedGroupId) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="bg-card rounded-lg border border-background p-12 text-center shadow-sm">
                    <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center mx-auto mb-4">
                        <MdGroup className="w-10 h-10 text-primary" />
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
                    <div className="h-32 bg-card rounded-lg animate-pulse"></div>
                    <div className="h-24 bg-card rounded-lg animate-pulse"></div>
                    <div className="h-24 bg-card rounded-lg animate-pulse"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8 text-textColor">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-xl">
                        <MdGroup className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="h1-premium">{groupData?.name}</h1>
                        <p className="small-premium mt-0.5">Activity and settlement history</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/groups/add-expense')}
                    className="btn-primary"
                >
                    <MdAdd className="text-base" />
                    Add Expense
                </button>
            </div>

            {/* Activities Table */}
            <div className="bg-card rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-slate-50/70 border-b border-slate-100">
                                <th className="px-3.5 py-2 text-left text-[9px] font-bold text-textMuted uppercase tracking-wider">Date</th>
                                <th className="px-3.5 py-2 text-left text-[9px] font-bold text-textMuted uppercase tracking-wider">Description</th>
                                <th className="px-3.5 py-2 text-left text-[9px] font-bold text-textMuted uppercase tracking-wider">Payers / Method</th>
                                <th className="px-3.5 py-2 text-left text-[9px] font-bold text-textMuted uppercase tracking-wider">Category</th>
                                <th className="px-3.5 py-2 text-left text-[9px] font-bold text-textMuted uppercase tracking-wider">Amount</th>
                                <th className="px-3.5 py-2 text-right text-[9px] font-bold text-textMuted uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {activities.map((act) => {
                                const isExpense = act.activityType === 'expense';
                                return (
                                    <React.Fragment key={act._id}>
                                        <tr 
                                            onClick={() => setExpandedActivity(expandedActivity === act._id ? null : act._id)}
                                            className={`group cursor-pointer transition-all duration-205 ${expandedActivity === act._id ? 'bg-primary/5' : 'hover:bg-slate-50/50'}`}
                                        >
                                            <td className="px-3.5 py-2 whitespace-nowrap text-xs font-semibold text-textMuted">
                                                <div className="flex items-center gap-1">
                                                    <div className={`transition-transform duration-200 ${expandedActivity === act._id ? 'rotate-180' : ''}`}>
                                                        <MdKeyboardArrowDown className="text-primary opacity-50" />
                                                    </div>
                                                    {new Date(act.date).toLocaleDateString('en-IN', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-3.5 py-2">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-textColor">{act.title}</span>
                                                    {act.note && (
                                                        <span className="text-[9px] text-textMuted italic mt-0.5 line-clamp-1">{act.note}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3.5 py-2 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    {isExpense ? (
                                                        <div className="flex -space-x-1">
                                                            {act.paidBy?.map((p, idx) => (
                                                                <div key={idx} className="w-5 h-5 rounded-full bg-primary/10 border border-card flex items-center justify-center text-[7px] font-black text-primary uppercase" title={p.name}>
                                                                    {p.name.charAt(0)}
                                                                </div>
                                                            ))}
                                                            <span className="text-[9px] text-textMuted font-medium ml-1.5 self-center">
                                                                    {act.paidBy?.length > 1 ? `${act.paidBy[0].name} +${act.paidBy.length - 1}` : act.paidBy?.[0]?.name}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-textMuted text-[9px] font-bold uppercase tracking-tighter">
                                                            Settlement ({act.paymentMethod || 'cash'})
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3.5 py-2 whitespace-nowrap">
                                                {isExpense ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-5.5 h-5.5 rounded bg-slate-50 border border-slate-100 flex items-center justify-center p-1 shadow-sm">
                                                            <CategoryIcon
                                                                iconName={categories.find(c => c.name === act.category)?.icon || 'Category'}
                                                                className="text-primary w-full h-full"
                                                            />
                                                        </div>
                                                        <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded bg-slate-50 border border-slate-100 text-textMuted">
                                                            {act.category || 'Other'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-300">—</span>
                                                )}
                                            </td>
                                            <td className="px-3.5 py-2 whitespace-nowrap">
                                                <span className={`text-xs font-bold ${isExpense ? 'text-danger' : 'text-success'}`}>
                                                    ₹{act.amount.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-3.5 py-2 whitespace-nowrap text-right">
                                                {isExpense ? (
                                                    <div className="flex justify-end gap-0.5" onClick={e => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => navigate(`/groups/expenses/edit/${act._id}`)}
                                                            className="p-1 text-primary hover:bg-primary/5 rounded transition-colors"
                                                            title="Edit"
                                                        >
                                                            <MdEdit className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteExpense(act._id)}
                                                            className="p-1 text-danger hover:bg-danger/5 rounded transition-colors"
                                                            title="Delete"
                                                        >
                                                            <MdDelete className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-[8px] font-bold text-textMuted/40 px-1.5 cursor-default">SYSTEM</span>
                                                )}
                                            </td>
                                        </tr>

                                        {/* Expanded Settlement Details */}
                                        {expandedActivity === act._id && (
                                            <tr className="bg-slate-50/30 border-b border-slate-100">
                                                <td colSpan="6" className="px-4 py-2.5">
                                                    <div className="flex flex-col gap-2 animate-in fade-in duration-200">
                                                        <div className="flex items-center gap-1 text-primary">
                                                            <MdCompareArrows className="text-xs" />
                                                            <h4 className="text-[8px] font-bold uppercase tracking-wider text-textMuted">
                                                                {isExpense ? 'Settlement Breakdown' : 'Included Expenses'}
                                                            </h4>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                            {isExpense ? (
                                                                act.settlements?.map((s, idx) => (
                                                                    <div key={idx} className="bg-card border border-slate-100 rounded-lg p-2 shadow-sm flex items-center justify-between gap-3">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="flex items-center gap-1 min-w-0">
                                                                                <span className="text-[9px] font-bold text-textColor truncate">{s.from.name}</span>
                                                                                <MdKeyboardArrowUp className="rotate-90 text-primary opacity-40 text-xs shrink-0" />
                                                                                <span className="text-[9px] font-bold text-textColor truncate">{s.to.name}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex flex-col items-end shrink-0">
                                                                            <span className="text-xs font-bold text-textColor">₹{s.amount.toLocaleString()}</span>
                                                                            <span className={`text-[7px] font-bold uppercase px-1 py-0.25 rounded ${s.reimbursementStatus === 'paid' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                                                                                {s.reimbursementStatus}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                act.underlyingExpenses?.map((ue, idx) => (
                                                                    <div key={idx} className="bg-card border border-slate-100 rounded-lg p-2 shadow-sm flex items-center justify-between gap-3">
                                                                        <span className="text-[9px] font-bold text-textColor truncate">{ue.title}</span>
                                                                        <span className="text-xs font-bold text-textColor shrink-0">₹{ue.amount.toLocaleString()}</span>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>

                                                        {isExpense && (!act.settlements || act.settlements.length === 0) && (
                                                            <p className="text-[8px] font-bold text-textMuted/50 italic">No settlement needed for this expense.</p>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                            {activities.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-5 py-8 text-center">
                                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3 border border-slate-100">
                                            <MdReceipt className="w-6 h-6 opacity-30 text-textMuted" />
                                        </div>
                                        <p className="text-xs font-bold text-textMuted">No activity history found</p>
                                        <button
                                            onClick={() => navigate('/groups/add-expense')}
                                            className="mt-3 text-primary font-bold text-[9px] uppercase tracking-wider hover:underline"
                                        >
                                            Add First Expense
                                        </button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GroupExpenses;