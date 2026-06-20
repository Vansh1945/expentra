import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API } from '../context/AuthContext';
import { MdAdd, MdDelete, MdEdit, MdTrendingUp } from 'react-icons/md';
import CategoryIcon from '../utils/CategoryIcon';
import { detectCategory } from '../utils/categoryDetector';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Income = () => {
    const [incomes, setIncomes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const today = new Date();
    const [filterMonth, setFilterMonth] = useState(today.getMonth() + 1);
    const [filterYear, setFilterYear] = useState(today.getFullYear());

    const defaultForm = { title: '', amount: '', category: '', note: '', date: '' };
    const [formData, setFormData] = useState(defaultForm);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [incRes, catRes] = await Promise.all([
                axios.get(`${API}/incomes?month=${filterMonth}&year=${filterYear}`),
                axios.get(`${API}/categories`)
            ]);
            setIncomes(incRes.data);
            const incomeCats = catRes.data.filter(c => c.type === 'income' && c.isActive !== false);
            setCategories(incomeCats);
            if (!formData.category && incomeCats.length > 0) {
                setFormData(prev => ({ ...prev, category: incomeCats[0].name }));
            }
        } catch (error) {
            toast.error('Failed to load income data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filterMonth, filterYear]);

    const openAdd = () => {
        setEditingId(null);
        setFormData({
            title: '',
            amount: '',
            category: categories[0]?.name || 'Other',
            note: '',
            date: new Date().toISOString().split('T')[0]
        });
        setShowModal(true);
    };

    const openEdit = (income) => {
        setEditingId(income._id);
        setFormData({
            title: income.title || income.description || '',
            amount: income.amount,
            category: income.category,
            note: income.note || '',
            date: income.date ? income.date.substring(0, 10) : ''
        });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const sendData = {
                title: formData.title,
                amount: formData.amount,
                category: formData.category,
                description: formData.note || formData.title,
                date: formData.date,
            };
            if (editingId) {
                await axios.put(`${API}/incomes/${editingId}`, sendData);
                toast.success('Income updated successfully');
            } else {
                await axios.post(`${API}/incomes`, sendData);
                toast.success('Income added successfully');
            }
            setShowModal(false);
            setEditingId(null);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving income');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this income entry?')) return;
        try {
            await axios.delete(`${API}/incomes/${id}`);
            setIncomes(prev => prev.filter(i => i._id !== id));
            toast.success('Income deleted');
        } catch (error) {
            toast.error('Failed to delete income');
        }
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        const detected = detectCategory(title, categories);
        setFormData(prev => ({ ...prev, title: title, category: detected }));
    };

    const getDisplayCategory = (income) => {
        const lowerTitle = (income.title || income.description || '').toLowerCase();
        const matched = categories.find(cat =>
            cat.keywords?.some(k => lowerTitle.includes(k.toLowerCase()))
        );
        return matched || categories.find(c => c.name === income.category) || { name: income.category, icon: 'Other' };
    };

    const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-card rounded w-1/3 animate-pulse"></div>
                <div className="h-32 bg-card rounded-xl animate-pulse"></div>
                <div className="h-64 bg-card rounded-xl animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-4">
            {/* Header Section */}
            <div className="flex flex-wrap justify-between items-center gap-2">
                <div>
                    <h1 className="h1-premium">Income Log</h1>
                    <p className="text-xs text-textMuted mt-0.5">
                        {MONTHS[filterMonth - 1]} {filterYear}
                    </p>
                </div>

                <div className="flex gap-1.5 items-center flex-wrap">
                    <select
                        value={filterMonth}
                        onChange={e => setFilterMonth(Number(e.target.value))}
                        className="select-premium py-1 px-2.5 text-xs w-auto h-8"
                    >
                        {MONTHS.map((m, i) => (
                            <option key={m} value={i + 1}>{m}</option>
                        ))}
                    </select>

                    <select
                        value={filterYear}
                        onChange={e => setFilterYear(Number(e.target.value))}
                        className="select-premium py-1 px-2.5 text-xs w-auto h-8"
                    >
                        {[0, 1, 2].map(o => {
                            const y = today.getFullYear() - o;
                            return <option key={y} value={y}>{y}</option>;
                        })}
                    </select>

                    <button
                        onClick={openAdd}
                        className="btn-primary py-1.5 px-3 text-xs font-semibold"
                    >
                        <MdAdd className="text-sm" /> Record Income
                    </button>
                </div>
            </div>

            {/* Total Income Card with Solid Sleek Background */}
            <div className="bg-slate-900 rounded-xl p-3.5 shadow-sm text-white relative overflow-hidden">
                <div className="absolute -right-12 -top-12 bg-white/5 w-36 h-36 rounded-full blur-2xl"></div>
                <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                            <MdTrendingUp className="text-xl text-white" />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                Total Income — {MONTHS[filterMonth - 1]} {filterYear}
                            </p>
                            <p className="text-lg md:text-xl font-bold text-white mt-0.5">₹{totalIncome.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-base font-bold text-white">{incomes.length}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider font-bold">Total Entries</p>
                    </div>
                </div>
            </div>

            {/* Income Table */}
            <div className="bg-card rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-3.5 py-2 text-left text-[9px] font-semibold text-textColor/70 uppercase tracking-wider">Date</th>
                                <th className="px-3.5 py-2 text-left text-[9px] font-semibold text-textColor/70 uppercase tracking-wider">Source / Description</th>
                                <th className="px-3.5 py-2 text-left text-[9px] font-semibold text-textColor/70 uppercase tracking-wider">Category</th>
                                <th className="px-3.5 py-2 text-left text-[9px] font-semibold text-textColor/70 uppercase tracking-wider">Amount</th>
                                <th className="px-3.5 py-2 text-right text-[9px] font-semibold text-textColor/70 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {incomes.map((income, idx) => (
                                <tr key={income._id} className="hover:bg-slate-50/50 transition-colors duration-150">
                                    <td className="px-3.5 py-2 whitespace-nowrap text-xs text-textColor/70">
                                        {new Date(income.date).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-3.5 py-2 text-xs text-textColor font-semibold">
                                        <div className="flex flex-col">
                                            <span>{income.title || income.description}</span>
                                            {income.title && income.description && income.title !== income.description && (
                                                <span className="text-[9px] text-textColor/50 font-normal mt-0.5">{income.description}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-3.5 py-2 whitespace-nowrap">
                                        {(() => {
                                            const cat = getDisplayCategory(income);
                                            return (
                                                <span className="px-1.5 py-0.5 inline-flex items-center gap-1 text-[9px] font-semibold rounded bg-slate-100 text-textColor">
                                                    <CategoryIcon iconName={cat.icon} className="w-2.5 h-2.5 text-primary" />
                                                    {cat.name}
                                                </span>
                                            );
                                        })()}
                                    </td>
                                    <td className="px-3.5 py-2 whitespace-nowrap text-xs font-semibold text-textColor">
                                        ₹{Number(income.amount).toLocaleString()}
                                    </td>
                                    <td className="px-3.5 py-2 whitespace-nowrap text-right">
                                        <button
                                            onClick={() => openEdit(income)}
                                            className="text-textColor/60 hover:text-primary mr-1.5 transition-colors"
                                            title="Edit"
                                        >
                                            <MdEdit className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(income._id)}
                                            className="text-textColor/60 hover:text-danger transition-colors"
                                            title="Delete"
                                        >
                                            <MdDelete className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {incomes.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-3.5 py-6 text-center">
                                        <p className="text-textColor/75 font-semibold text-xs">
                                            No entries for {MONTHS[filterMonth - 1]} {filterYear}
                                        </p>
                                        <p className="text-[10px] text-textMuted mt-0.5">
                                            Click "Record Income" to add your first entry.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-200">
                    <div className="bg-card rounded-xl shadow-lg p-4 w-full max-w-sm mx-4 border border-slate-100">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="bg-primary rounded-lg p-1 animate-pulse">
                                <MdTrendingUp className="text-white text-base" />
                            </div>
                            <h2 className="text-xs font-bold text-textColor">
                                {editingId ? 'Edit Income Entry' : 'Log New Income'}
                            </h2>
                        </div>

                        <form onSubmit={handleSave} className="space-y-2.5">
                            <div>
                                <label className="label-premium">
                                    Title <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={handleTitleChange}
                                    placeholder="e.g. Salary, Freelance, Rent Income"
                                    className="input-premium"
                                />
                            </div>

                            <div>
                                <label className="label-premium">
                                    Amount (₹) <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    required
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="0.00"
                                    className="input-premium"
                                />
                            </div>

                            <div>
                                <label className="label-premium">
                                    Category (Auto-detected)
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.category}
                                        disabled
                                        className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-textColor/60 cursor-not-allowed"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                        <CategoryIcon
                                            iconName={categories.find(c => c.name === formData.category)?.icon || 'Category'}
                                            className="text-primary w-3 h-3"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="label-premium">
                                    Note <span className="text-textMuted text-[9px] font-normal normal-case">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.note}
                                    onChange={e => setFormData({ ...formData, note: e.target.value })}
                                    placeholder="Any extra details..."
                                    className="input-premium"
                                />
                            </div>

                            <div>
                                <label className="label-premium">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="input-premium"
                                />
                            </div>

                            <div className="flex justify-end gap-1.5 pt-1.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingId(null);
                                    }}
                                    className="btn-secondary text-[11px] px-3 py-1.5"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary text-[11px] px-3 py-1.5"
                                >
                                    {editingId ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Income;