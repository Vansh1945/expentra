import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext, API } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import {
    MdDownload, MdFilterList, MdOutlineReceiptLong, MdPerson,
    MdGroup, MdCategory, MdDateRange, MdAttachMoney,
    MdReceipt, MdCompareArrows, MdInfoOutline, MdClear
} from 'react-icons/md';
import CategoryIcon from '../../utils/CategoryIcon';

const GroupReports = () => {
    const { selectedGroupId } = useContext(AuthContext);
    const [activities, setActivities] = useState([]);
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [categoryMetadata, setCategoryMetadata] = useState({});
    const [allCategories, setAllCategories] = useState([]);

    const [filterCategory, setFilterCategory] = useState('');
    const [filterPaidBy, setFilterPaidBy] = useState('');
    const [filterType, setFilterType] = useState('');
    const [sortBy, setSortBy] = useState('date-desc');

    useEffect(() => {
        if (!selectedGroupId) return;

        const fetchData = async () => {
            try {
                const [expRes, grpRes, catRes] = await Promise.all([
                    axios.get(`${API}/group-expenses/${selectedGroupId}`),
                    axios.get(`${API}/groups/${selectedGroupId}`),
                    axios.get(`${API}/categories`)
                ]);

                const rawExpenses = expRes.data;
                const transformedActivities = [];
                const settlementAggregator = {};

                rawExpenses.forEach(exp => {
                    transformedActivities.push({
                        id: exp._id,
                        type: 'expense',
                        title: exp.title,
                        amount: exp.amount,
                        date: exp.date,
                        category: exp.category || 'General',
                        paidBy: exp.paidBy.map(p => p.name).join(', '),
                        note: exp.note
                    });

                    if (exp.settlements && exp.settlements.length > 0) {
                        exp.settlements.forEach(s => {
                            if (s.reimbursementStatus === 'paid') {
                                const payDate = s.paymentDate || exp.date;
                                const dateStr = format(new Date(payDate), 'yyyy-MM-dd HH:mm');
                                const key = `${dateStr}_${s.from.name}_${s.to.name}`;

                                if (!settlementAggregator[key]) {
                                    settlementAggregator[key] = {
                                        id: `agg_s_${key}`,
                                        type: 'settlement',
                                        title: `${s.from.name} → ${s.to.name}`,
                                        amount: s.amount,
                                        date: payDate,
                                        category: 'Settlement',
                                        paidBy: s.from.name,
                                        note: `Method: ${s.paymentMethod || 'cash'}`
                                    };
                                } else {
                                    settlementAggregator[key].amount += s.amount;
                                }
                            }
                        });
                    }
                });

                Object.values(settlementAggregator).forEach(aggS => {
                    transformedActivities.push(aggS);
                });

                const categoryMap = {
                    'settlement': 'MdCompareArrows',
                    'general': 'MdCategory'
                };
                catRes.data.forEach(c => {
                    categoryMap[c.name.toLowerCase()] = c.iconName;
                });
                setCategoryMetadata(categoryMap);
                setAllCategories(catRes.data.map(c => c.name));

                setActivities(transformedActivities);
                setGroupData(grpRes.data);
            } catch (error) {
                toast.error("Failed to load group reports");
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
                    <div className="h-32 bg-card rounded-lg animate-pulse"></div>
                    <div className="h-96 bg-card rounded-lg animate-pulse"></div>
                </div>
            </div>
        );
    }

    const categories = [...new Set([...allCategories, ...activities.map(a => a.category)])].filter(Boolean).sort();
    const members = groupData?.members || [];

    let filteredActivities = activities.filter(act => {
        if (filterType && act.type !== filterType) return false;
        if (filterCategory && act.category !== filterCategory) return false;
        if (filterPaidBy && !act.paidBy.toLowerCase().includes(filterPaidBy.toLowerCase())) return false;
        return true;
    });

    filteredActivities.sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
        if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
    });

    const totalFilteredAmount = filteredActivities.reduce((sum, act) => sum + act.amount, 0);
    const expenseTotal = filteredActivities.filter(a => a.type === 'expense').reduce((sum, a) => sum + a.amount, 0);
    const settlementTotal = filteredActivities.filter(a => a.type === 'settlement').reduce((sum, a) => sum + a.amount, 0);

    const clearFilters = () => {
        setFilterCategory('');
        setFilterPaidBy('');
        setFilterType('');
        setSortBy('date-desc');
    };

    const hasActiveFilters = filterCategory || filterPaidBy || filterType;

    const handleDownloadCSV = () => {
        if (filteredActivities.length === 0) {
            toast.info("No data to download");
            return;
        }

        const headers = ["Date", "Type", "Description", "Category", "Amount", "Payer/From"];
        const rows = filteredActivities.map(act => [
            format(new Date(act.date), 'dd MMM yyyy'),
            act.type.toUpperCase(),
            `"${act.title.replace(/"/g, '""')}"`,
            act.category,
            act.amount,
            `"${act.paidBy.replace(/"/g, '""')}"`
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${groupData.name.replace(/\s+/g, '_')}_financial_report.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-4 space-y-4 bg-background min-h-screen pb-16">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="h1-premium">Group Reports</h1>
                    <p className="small-premium mt-0.5">{groupData?.name} • Financial activity</p>
                </div>
                <button
                    onClick={handleDownloadCSV}
                    className="btn-primary"
                >
                    <MdDownload className="text-sm" /> Export CSV
                </button>
            </div>

            {/* Overview Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="card-premium">
                    <div className="flex items-center justify-between mb-1.5">
                        <p className="label-premium">Total Value</p>
                        <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                            <MdAttachMoney className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <p className="text-lg md:text-xl font-bold text-textColor tracking-tight">₹{totalFilteredAmount.toLocaleString()}</p>
                </div>

                <div className="card-premium">
                    <div className="flex items-center justify-between mb-1.5">
                        <p className="label-premium text-danger">Gross Expenses</p>
                        <div className="w-7 h-7 bg-danger/5 rounded-lg flex items-center justify-center text-danger">
                            <MdReceipt className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <p className="text-lg md:text-xl font-bold text-danger tracking-tight">₹{expenseTotal.toLocaleString()}</p>
                </div>

                <div className="card-premium">
                    <div className="flex items-center justify-between mb-1.5">
                        <p className="label-premium text-secondary">Total Settlements</p>
                        <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-textMuted">
                            <MdCompareArrows className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <p className="text-lg md:text-xl font-bold text-textColor/75 tracking-tight">₹{settlementTotal.toLocaleString()}</p>
                </div>
            </div>

            {/* Smart Filters Container */}
            <div className="bg-card rounded-xl border border-slate-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center text-primary border border-slate-100">
                            <MdFilterList className="w-3.5 h-3.5" />
                        </div>
                        <h3 className="text-xs font-bold text-textColor uppercase tracking-wider">Advanced Filters</h3>
                    </div>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="text-[9px] font-black text-primary hover:text-primary/70 transition-all uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded border border-primary/10"
                        >
                            <MdClear className="inline text-xs mb-0.5 mr-0.5" /> Reset
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="space-y-1">
                        <label className="label-premium">Type</label>
                        <select
                            value={filterType}
                            onChange={e => setFilterType(e.target.value)}
                            className="select-premium font-bold"
                        >
                            <option value="">All Transactions</option>
                            <option value="expense">Expenses Only</option>
                            <option value="settlement">Settlements Only</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="label-premium">Category</label>
                        <select
                            value={filterCategory}
                            onChange={e => setFilterCategory(e.target.value)}
                            className="select-premium font-bold"
                            disabled={filterType === 'settlement'}
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="label-premium">Paid By / From</label>
                        <select
                            value={filterPaidBy}
                            onChange={e => setFilterPaidBy(e.target.value)}
                            className="select-premium font-bold"
                        >
                            <option value="">Any Member</option>
                            {members.map(m => (
                                <option key={m.user || m.name} value={m.name}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="label-premium">Sorting</label>
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="select-premium font-bold"
                        >
                            <option value="date-desc">Timeline (Newest)</option>
                            <option value="date-asc">Timeline (Oldest)</option>
                            <option value="amount-desc">Value (High to Low)</option>
                            <option value="amount-asc">Value (Low to High)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Results Table View */}
            <div className="bg-card rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <p className="text-[9px] font-bold text-textMuted uppercase tracking-wider">
                        Activity Stream <span className="text-primary font-black ml-0.5">({filteredActivities.length})</span>
                    </p>
                    <p className="text-[9px] font-bold text-textMuted uppercase tracking-wider">
                        Total Value: <span className="text-textColor font-black ml-0.5">₹{totalFilteredAmount.toLocaleString()}</span>
                    </p>
                </div>

                <div className="overflow-x-auto">
                    {filteredActivities.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2 border border-slate-100">
                                <MdOutlineReceiptLong className="w-5 h-5 text-textMuted/40" />
                            </div>
                            <p className="text-textColor font-bold text-xs">No results found</p>
                            <p className="text-textMuted text-[9px] mt-0.5">Try adjusting your filters to see more activity.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/20 border-b border-slate-100">
                                    <th className="px-3.5 py-2 text-[9px] font-bold text-textMuted uppercase tracking-wider">Description</th>
                                    <th className="px-3.5 py-2 text-[9px] font-bold text-textMuted uppercase tracking-wider">Category</th>
                                    <th className="px-3.5 py-2 text-[9px] font-bold text-textMuted uppercase tracking-wider">Member / From</th>
                                    <th className="px-3.5 py-2 text-[9px] font-bold text-textMuted uppercase tracking-wider text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredActivities.map((act) => (
                                    <tr key={act.id} className="group hover:bg-slate-50/30 transition-all duration-200">
                                        <td className="px-3.5 py-2">
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-bold text-textColor tracking-tight">{act.title}</p>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[8px] font-bold text-textMuted/70 flex items-center gap-0.5 uppercase tracking-wide">
                                                        <MdDateRange className="text-xs" /> {format(new Date(act.date), 'dd MMM yyyy')}
                                                    </span>
                                                    {act.note && (
                                                        <span className="text-[7px] font-bold text-primary bg-primary/5 px-1 py-0.25 rounded flex items-center gap-0.5">
                                                            <MdInfoOutline className="text-xs" /> {act.note}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3.5 py-2">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-primary border border-slate-100 transition-transform group-hover:scale-105">
                                                    <CategoryIcon iconName={categoryMetadata[act.category?.toLowerCase()] || 'MdCategory'} className="w-3.5 h-3.5" />
                                                </div>
                                                <p className="text-xs font-semibold text-textColor tracking-tight">{act.category}</p>
                                            </div>
                                        </td>
                                        <td className="px-3.5 py-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black bg-primary/5 text-primary border border-primary/5 transition-transform group-hover:scale-105">
                                                    {act.paidBy.includes(',') ? 'M' : (act.paidBy.charAt(0) || 'U').toUpperCase()}
                                                </div>
                                                <p className="text-xs font-semibold text-textColor truncate max-w-[120px] tracking-tight">{act.paidBy || 'Unknown'}</p>
                                            </div>
                                        </td>
                                        <td className="px-3.5 py-2 text-right">
                                            <p className={`text-xs font-bold tracking-tight ${act.type === 'expense' ? 'text-danger' : 'text-success'}`}>
                                                ₹{act.amount.toLocaleString()}
                                            </p>
                                            <p className="text-[7px] font-bold text-textMuted/60 uppercase tracking-wider opacity-60 leading-none">{act.type}</p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GroupReports;