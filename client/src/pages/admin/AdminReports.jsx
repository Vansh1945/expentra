import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext, API } from '../../context/AuthContext';
import {
    MdDownload, MdDateRange, MdPerson, MdCategory, MdAttachMoney,
    MdReceipt, MdTrendingUp, MdFileDownload, MdRefresh, MdWarning,
    MdCheckCircle, MdInfoOutline, MdClear
} from 'react-icons/md';

const AdminReports = () => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    const defaultEndDate = today.toISOString().split('T')[0];
    const defaultStartDate = lastWeek.toISOString().split('T')[0];

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(defaultStartDate);
    const [endDate, setEndDate] = useState(defaultEndDate);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        axios.get(`${API}/admin/users`)
            .then(res => setUsers(res.data))
            .catch(err => console.error(err));
            
        // Fetch initial data for the default 1-week range
        fetchReports();
    }, []);

    const fetchReports = async (e) => {
        if (e) e.preventDefault();
        try {
            setLoading(true);
            let query = '';
            if (startDate && endDate) query += `?startDate=${startDate}&endDate=${endDate}`;
            if (selectedUser) {
                query += query ? `&userId=${selectedUser}` : `?userId=${selectedUser}`;
            }

            const res = await axios.get(`${API}/admin/reports${query}`);
            setReports(res.data);

            const totalAmount = res.data.reduce((sum, r) => sum + r.amount, 0);
            const categoryBreakdown = {};
            res.data.forEach(r => {
                categoryBreakdown[r.category] = (categoryBreakdown[r.category] || 0) + r.amount;
            });
            setSummary({
                totalAmount,
                count: res.data.length,
                categories: Object.keys(categoryBreakdown).length,
                topCategory: Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
            });

            if (res.data.length === 0) toast.info('No records found for these filters');
        } catch (error) {
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
        setSelectedUser('');
        setReports([]);
        setSummary(null);
    };

    const exportCSV = () => {
        if (!reports.length) {
            toast.info('No data to export');
            return;
        }

        const headers = ['Date', 'User Name', 'User Email', 'Category', 'Amount (₹)', 'Description'];
        const rows = reports.map(item => [
            new Date(item.date).toLocaleDateString(),
            item.userId?.name || 'Unknown',
            item.userId?.email || 'Unknown',
            item.category,
            item.amount,
            `"${(item.title || '').replace(/"/g, '""')}"`
        ]);

        let csvContent = headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Admin_System_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('CSV exported successfully');
    };

    const hasActiveFilters = startDate || endDate || selectedUser;

    return (
        <div className="space-y-4" id="admin-report-content">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/5 rounded-lg">
                        <MdReceipt className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="h1-premium">System Reports</h1>
                        <p className="small-premium mt-0.5">Extract and analyze financial transactions</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={exportCSV}
                        disabled={reports.length === 0}
                        className="btn-success py-1 px-2.5 text-xs"
                    >
                        <MdDownload className="text-sm" />
                        CSV
                    </button>
                </div>
            </div>

            {/* Filters Card */}
            <div className="card-premium !p-0 overflow-hidden">
                <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <MdDateRange className="w-4 h-4 text-primary" />
                            <h2 className="text-xs font-bold text-textColor uppercase tracking-wider">Filter Reports</h2>
                        </div>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-0.5 text-[9px] font-bold text-textMuted/60 hover:text-textColor uppercase tracking-wider transition-all duration-200"
                            >
                                <MdClear className="text-xs" />
                                Clear filters
                            </button>
                        )}
                    </div>
                </div>
                <form onSubmit={fetchReports} className="p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                            <label className="label-premium">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="input-premium py-1 text-xs"
                            />
                        </div>
                        <div>
                            <label className="label-premium">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="input-premium py-1 text-xs"
                            />
                        </div>
                        <div>
                            <label className="label-premium">Filter by User</label>
                            <select
                                value={selectedUser}
                                onChange={e => setSelectedUser(e.target.value)}
                                className="select-premium py-1 text-xs"
                            >
                                <option value="">All Users</option>
                                {users.map(u => (
                                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="btn-primary w-full py-1 text-xs"
                            >
                                <MdRefresh className="text-sm" />
                                Generate Report
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Summary Cards */}
            {summary && reports.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="card-premium p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-semibold text-textMuted uppercase tracking-wider">Total Amount</p>
                                <p className="text-lg md:text-xl font-bold text-textColor mt-0.5">₹{summary.totalAmount.toLocaleString()}</p>
                            </div>
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <MdAttachMoney className="w-4 h-4 text-primary" />
                            </div>
                        </div>
                        <p className="text-[10px] text-textMuted mt-1.5 font-medium">{summary.count} transactions</p>
                    </div>

                    <div className="card-premium p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-semibold text-textMuted uppercase tracking-wider">Categories Used</p>
                                <p className="text-lg md:text-xl font-bold text-textColor mt-0.5">{summary.categories}</p>
                            </div>
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <MdCategory className="w-4 h-4 text-primary" />
                            </div>
                        </div>
                        <p className="text-[10px] text-textMuted mt-1.5 font-medium">Unique categories</p>
                    </div>

                    <div className="card-premium p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-semibold text-textMuted uppercase tracking-wider">Top Category</p>
                                <p className="text-xs md:text-sm font-bold text-textColor mt-0.5 truncate max-w-[100px]" title={summary.topCategory}>{summary.topCategory}</p>
                            </div>
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <MdTrendingUp className="w-4 h-4 text-primary" />
                            </div>
                        </div>
                        <p className="text-[10px] text-textMuted mt-1.5 font-medium">Highest spending</p>
                    </div>

                    <div className="card-premium p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-semibold text-textMuted uppercase tracking-wider">Avg Transaction</p>
                                <p className="text-lg md:text-xl font-bold text-textColor mt-0.5">
                                    ₹{Math.round(summary.totalAmount / summary.count).toLocaleString()}
                                </p>
                            </div>
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <MdReceipt className="w-4 h-4 text-primary" />
                            </div>
                        </div>
                        <p className="text-[10px] text-textMuted mt-1.5 font-medium">Per transaction</p>
                    </div>
                </div>
            )}

            {/* Results Table */}
            <div className="card-premium !p-0 overflow-hidden">
                <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <MdReceipt className="w-4 h-4 text-primary" />
                            <h3 className="font-bold text-textColor text-xs">
                                Transactions {reports.length > 0 && `(${reports.length})`}
                            </h3>
                        </div>
                        {loading && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                                <div className="animate-spin rounded-full w-3 h-3 border-2 border-primary border-t-transparent"></div>
                                Loading...
                            </div>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="p-6 text-center">
                        <div className="animate-pulse space-y-1.5">
                            <div className="h-8 bg-slate-50 rounded w-full"></div>
                            <div className="h-8 bg-slate-50 rounded w-full"></div>
                            <div className="h-8 bg-slate-50 rounded w-full"></div>
                        </div>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <MdReceipt className="w-5 h-5 text-textMuted/50" />
                        </div>
                        <h3 className="text-sm font-bold text-textColor">No Transactions Found</h3>
                        <p className="small-premium mt-1 uppercase tracking-wide">
                            {hasActiveFilters ? 'Try adjusting your filters' : 'Select date range and generate report'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50/20 border-b border-slate-100">
                                <tr>
                                    <th className="px-3 py-2 text-left text-[9px] font-bold text-textMuted uppercase tracking-wider">Date</th>
                                    <th className="px-3 py-2 text-left text-[9px] font-bold text-textMuted uppercase tracking-wider">User</th>
                                    <th className="px-3 py-2 text-left text-[9px] font-bold text-textMuted uppercase tracking-wider">Category</th>
                                    <th className="px-3 py-2 text-left text-[9px] font-bold text-textMuted uppercase tracking-wider">Description</th>
                                    <th className="px-3 py-2 text-right text-[9px] font-bold text-textMuted uppercase tracking-wider">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {reports.map((rp) => (
                                    <tr key={rp._id} className="hover:bg-slate-50/30 transition-all duration-200">
                                        <td className="px-3 py-2 text-xs text-textMuted font-medium whitespace-nowrap">
                                            {new Date(rp.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-3 py-2">
                                            <div>
                                                <p className="text-xs font-semibold text-textColor">{rp.userId?.name || 'Unknown'}</p>
                                                <p className="text-[9px] text-textMuted/60 font-medium">{rp.userId?.email || 'No email'}</p>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-wider rounded-full">
                                                <MdCategory className="text-[9px]" />
                                                {rp.category}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">
                                            <p className="text-xs text-textMuted max-w-xs truncate font-medium" title={rp.title}>
                                                {rp.title || '—'}
                                            </p>
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            <span className="text-xs font-bold text-textColor">
                                                ₹{rp.amount.toLocaleString()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-slate-50/50 border-t border-slate-100">
                                <tr>
                                    <td colSpan="4" className="px-3 py-2 text-right text-[10px] font-bold text-textMuted uppercase tracking-wider">
                                        Total:
                                    </td>
                                    <td className="px-3 py-2 text-right text-xs font-bold text-primary">
                                        ₹{reports.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>

            {/* Info Note */}
            <div className="bg-primary/5 rounded-xl border border-primary/10 p-3">
                <div className="flex items-start gap-2.5">
                    <MdInfoOutline className="w-4 h-4 text-primary mt-0.5 animate-pulse" />
                    <div>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Report Information</p>
                        <p className="text-[10px] text-textMuted mt-0.5 leading-relaxed font-medium">
                            Reports include all expense and income transactions across the platform.
                            Use date filters to narrow down results. Export to CSV for offline analysis.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
