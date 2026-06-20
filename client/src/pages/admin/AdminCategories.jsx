import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext, API } from '../../context/AuthContext';
import {
    MdAdd, MdDelete, MdEdit, MdToggleOn, MdToggleOff, MdCategory,
    MdClose, MdCheck, MdRefresh, MdSearch, MdFilterList,
    MdAttachMoney, MdTrendingUp, MdWarning
} from 'react-icons/md';
import CategoryIcon from '../../utils/CategoryIcon';

const AVAILABLE_ICONS = [
    // Essentials & Shopping
    'MdStore', 'MdShoppingCart', 'MdShoppingBag', 'MdLocalMall', 'MdStorefront', 'MdAddShoppingCart',
    // Food & Drink
    'MdRestaurant', 'MdLocalCafe', 'MdFastfood', 'MdLocalPizza', 'MdLocalBar', 'MdRestaurantMenu', 'MdBakeryDining', 'MdIcecream',
    // Transport & Travel
    'MdDirectionsCar', 'MdCommute', 'MdFlight', 'MdLocalGasStation', 'MdDirectionsBike', 'MdDirectionsBus', 'MdDirectionsSubway', 'MdDirectionsWalk', 'MdDirectionsBoat', 'MdTram',
    // Housing & Utilities
    'MdHome', 'MdFlashOn', 'MdCleaningServices', 'MdHandyman', 'MdWaterDrop', 'MdAir', 'MdLightbulb', 'MdPropane', 'MdSolarPower',
    // Finance & Work
    'MdAttachMoney', 'MdWork', 'MdPayments', 'MdAccountBalance', 'MdReceipt', 'MdSavings', 'MdPaid', 'MdMonetizationOn', 'MdCreditCard', 'MdAccountBalanceWallet',
    // Entertainment & Lifestyle
    'MdTheaterComedy', 'MdMovie', 'MdGamepad', 'MdMusicNote', 'MdSportsEsports', 'MdTv', 'MdLocalActivity', 'MdEvent', 'MdCameraAlt',
    // Health & Fitness
    'MdLocalHospital', 'MdFitnessCenter', 'MdSelfImprovement', 'MdMedicalServices', 'MdVaccines', 'MdSpa',
    // Education & Personal
    'MdSchool', 'MdPets', 'MdCake', 'MdCheckroom', 'MdPerson', 'MdGroup', 'MdElderly', 'MdChildCare',
    // Tech & Electronics
    'MdSmartphone', 'MdComputer', 'MdPhonelink', 'MdLaptop', 'MdWatch', 'MdHeadset', 'MdPrint', 'MdRouter',
    // Others
    'MdBuild', 'MdSecurity', 'MdCardGiftcard', 'MdSubscriptions', 'MdLandscape', 'MdPool', 'MdSmokingRooms', 'MdStyle', 'MdVolunteerActivism', 'MdPark'
];

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', type: 'expense', isActive: true, icon: 'MdCategory', keywords: '' });
    const [editId, setEditId] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [iconSearchTerm, setIconSearchTerm] = useState('');

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${API}/admin/categories`);
            setCategories(res.data);
        } catch (error) {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                await axios.delete(`${API}/admin/categories/${id}`);
                toast.success('Category deleted');
                fetchCategories();
            } catch (error) {
                toast.error('Failed to delete category');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k !== '')
            };

            if (editId) {
                await axios.put(`${API}/admin/categories/${editId}`, dataToSend);
                toast.success('Category updated successfully');
            } else {
                await axios.post(`${API}/admin/categories`, dataToSend);
                toast.success('Category created successfully');
            }
            setShowModal(false);
            setEditId(null);
            setFormData({ name: '', type: 'expense', isActive: true, icon: 'MdCategory', keywords: '' });
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving category');
        }
    };

    const openEdit = (category) => {
        setFormData({
            name: category.name,
            type: category.type,
            isActive: category.isActive,
            icon: category.icon || 'MdCategory',
            keywords: category.keywords ? category.keywords.join(', ') : ''
        });
        setEditId(category._id);
        setShowModal(true);
    };

    const handleToggleActive = async (category) => {
        try {
            await axios.put(`${API}/admin/categories/${category._id}`, {
                isActive: !category.isActive
            });
            toast.success(`Category ${!category.isActive ? 'activated' : 'deactivated'}`);
            fetchCategories();
        } catch (error) {
            toast.error('Failed to update category status');
        }
    };

    const filteredCategories = categories.filter(cat => {
        if (filterType !== 'all' && cat.type !== filterType) return false;
        if (searchTerm && !cat.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    const expenseCount = categories.filter(c => c.type === 'expense' && c.isActive).length;
    const incomeCount = categories.filter(c => c.type === 'income' && c.isActive).length;
    const totalActive = categories.filter(c => c.isActive).length;

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-card rounded w-1/4 animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-40 bg-card rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/5 rounded-lg">
                        <MdCategory className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="h1-premium">Category Management</h1>
                        <p className="small-premium mt-0.5">Manage expense and income categories</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setEditId(null);
                        setFormData({ name: '', type: 'expense', isActive: true, icon: 'MdCategory', keywords: '' });
                        setShowModal(true);
                    }}
                    className="btn-primary py-1 px-2.5 text-xs"
                >
                    <MdAdd className="text-sm" />
                    New Category
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="card-premium p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-semibold text-textMuted uppercase tracking-wider">Total Categories</p>
                            <p className="text-lg md:text-xl font-bold text-textColor mt-0.5">{categories.length}</p>
                        </div>
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <MdCategory className="w-4 h-4 text-primary" />
                        </div>
                    </div>
                    <p className="text-[10px] text-textMuted mt-1.5 font-medium">{totalActive} active</p>
                </div>

                <div className="card-premium p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-semibold text-textMuted uppercase tracking-wider">Expense Categories</p>
                            <p className="text-lg md:text-xl font-bold text-danger mt-0.5">{expenseCount}</p>
                        </div>
                        <div className="w-8 h-8 bg-danger/10 rounded-lg flex items-center justify-center">
                            <MdTrendingUp className="w-4 h-4 text-danger" />
                        </div>
                    </div>
                    <p className="text-[10px] text-textMuted mt-1.5 font-medium">For spending</p>
                </div>

                <div className="card-premium p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-semibold text-textMuted uppercase tracking-wider">Income Categories</p>
                            <p className="text-lg md:text-xl font-bold text-success mt-0.5">{incomeCount}</p>
                        </div>
                        <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                            <MdAttachMoney className="w-4 h-4 text-success" />
                        </div>
                    </div>
                    <p className="text-[10px] text-textMuted mt-1.5 font-medium">For earnings</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row justify-between gap-3">
                <div className="flex gap-1.5">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-all duration-200 border ${
                            filterType === 'all'
                                ? 'bg-primary text-white border-primary shadow-sm'
                                : 'bg-card text-textColor border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilterType('expense')}
                        className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-all duration-200 border ${
                            filterType === 'expense'
                                ? 'bg-danger text-white border-danger shadow-sm'
                                : 'bg-card text-textColor border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        Expenses
                    </button>
                    <button
                        onClick={() => setFilterType('income')}
                        className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-all duration-200 border ${
                            filterType === 'income'
                                ? 'bg-success text-white border-success shadow-sm'
                                : 'bg-card text-textColor border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        Income
                    </button>
                </div>
                <div className="relative">
                    <MdSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-textMuted text-xs" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="input-premium pl-8 py-1 w-full sm:w-56 text-xs"
                    />
                </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredCategories.map((cat) => (
                    <div
                        key={cat._id}
                        className={`card-premium p-3 relative transition-all duration-200 ${
                            !cat.isActive ? 'opacity-70 bg-slate-50/50' : ''
                        }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cat.isActive
                                        ? cat.type === 'expense' ? 'bg-danger/10' : 'bg-success/10'
                                        : 'bg-slate-100'
                                    }`}>
                                    <CategoryIcon
                                        iconName={cat.icon || 'MdCategory'}
                                        className={`w-4 h-4 ${cat.isActive
                                                ? cat.type === 'expense' ? 'text-danger' : 'text-success'
                                                : 'text-textMuted/60'
                                            }`}
                                    />
                                </div>
                                <div>
                                    <h3 className={`font-bold text-xs ${cat.isActive ? 'text-textColor' : 'text-textColor/60'}`}>
                                        {cat.name}
                                    </h3>
                                    <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full mt-0.5 inline-block ${cat.type === 'expense'
                                            ? 'bg-danger/10 text-danger'
                                            : 'bg-success/10 text-success'
                                        }`}>
                                        {cat.type}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-0.5">
                                <button
                                    onClick={() => openEdit(cat)}
                                    className="p-1 text-textMuted hover:text-primary hover:bg-primary/5 rounded-md transition-all duration-200"
                                    title="Edit"
                                >
                                    <MdEdit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(cat._id, cat.name)}
                                    className="p-1 text-textMuted hover:text-danger hover:bg-danger/5 rounded-md transition-all duration-200"
                                    title="Delete"
                                >
                                    <MdDelete className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {cat.keywords && cat.keywords.length > 0 && (
                            <div className="mb-2">
                                <div className="flex flex-wrap gap-1">
                                    {cat.keywords.slice(0, 3).map((kw, i) => (
                                        <span key={i} className="text-[9px] font-medium px-1.5 py-0.5 bg-slate-50 text-textMuted border border-slate-100 rounded-md">
                                            {kw}
                                        </span>
                                    ))}
                                    {cat.keywords.length > 3 && (
                                        <span className="text-[9px] font-medium px-1.5 py-0.5 text-textMuted/60">
                                            +{cat.keywords.length - 3}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                            <div className="text-[9px] text-textMuted font-medium">
                                {cat.keywords?.length || 0} keywords
                            </div>
                            <button
                                onClick={() => handleToggleActive(cat)}
                                className={`flex items-center gap-0.5 text-xs font-semibold transition-all duration-200 ${cat.isActive
                                        ? 'text-primary hover:text-primary/80'
                                        : 'text-textMuted/60 hover:text-textMuted/80'
                                    }`}
                            >
                                {cat.isActive ? (
                                    <>
                                        <MdToggleOn className="w-5 h-5 text-primary" />
                                        <span className="text-[9px] font-bold uppercase tracking-wider">Active</span>
                                    </>
                                ) : (
                                    <>
                                        <MdToggleOff className="w-5 h-5" />
                                        <span className="text-[9px] font-bold uppercase tracking-wider">Inactive</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredCategories.length === 0 && (
                <div className="card-premium py-12 text-center">
                    <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MdCategory className="w-6 h-6 text-textMuted/50" />
                    </div>
                    <h3 className="text-base font-bold text-textColor">No Categories Found</h3>
                    <p className="small-premium mt-1 uppercase tracking-wide">
                        {searchTerm ? 'Try a different search term' : 'Create your first category to get started'}
                    </p>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border border-slate-100">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center flex-shrink-0 bg-slate-50/50">
                            <h2 className="text-sm font-bold text-textColor uppercase tracking-wider">
                                {editId ? 'Edit Category' : 'Create New Category'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 hover:bg-slate-100 rounded-lg transition-all duration-200 text-textMuted"
                            >
                                <MdClose className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
                            <div className="p-5 space-y-4 overflow-y-auto">
                                <div>
                                    <label className="label-premium">
                                        Category Name <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input-premium"
                                        placeholder="e.g., Groceries, Salary"
                                    />
                                </div>

                                <div>
                                    <label className="label-premium">Type</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                value="expense"
                                                checked={formData.type === 'expense'}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                className="w-4 h-4 text-danger focus:ring-danger/20 border-slate-300"
                                            />
                                            <span className="text-xs font-semibold text-textColor">Expense</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                value="income"
                                                checked={formData.type === 'income'}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                className="w-4 h-4 text-success focus:ring-success/20 border-slate-300"
                                            />
                                            <span className="text-xs font-semibold text-textColor">Income</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="label-premium !mb-0">
                                            Select Icon <span className="text-danger">*</span>
                                        </label>
                                        <a 
                                            href="https://react-icons.github.io/react-icons/icons/md" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-[9px] font-bold text-primary hover:underline uppercase tracking-wide"
                                        >
                                            Browse Icons
                                        </a>
                                    </div>
                                    
                                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                                        {/* Icon Preview & Search */}
                                        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-card rounded-lg flex items-center justify-center border border-slate-200 shadow-sm">
                                                    <CategoryIcon iconName={formData.icon} className="w-5 h-5 text-primary" />
                                                </div>
                                                <div className="text-[10px]">
                                                    <p className="font-bold text-textColor">Preview</p>
                                                    <p className="text-textMuted/60 text-[9px] break-all font-semibold">{formData.icon}</p>
                                                </div>
                                            </div>
                                            <div className="relative flex-1 max-w-[150px]">
                                                <MdSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-textMuted" />
                                                <input
                                                    type="text"
                                                    placeholder="Search icons..."
                                                    value={iconSearchTerm}
                                                    onChange={(e) => setIconSearchTerm(e.target.value)}
                                                    className="w-full pl-7 pr-3 py-1.5 text-xs bg-card border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200"
                                                />
                                            </div>
                                        </div>

                                        {/* Icon Grid */}
                                        <div className="h-40 overflow-y-auto p-2 bg-card">
                                            {iconSearchTerm && !AVAILABLE_ICONS.some(icon => icon.toLowerCase() === iconSearchTerm.toLowerCase()) && (
                                                <div className="mb-2 px-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, icon: iconSearchTerm })}
                                                        className={`w-full py-1.5 px-3 rounded-lg flex items-center gap-3 transition-all ${
                                                            formData.icon === iconSearchTerm 
                                                                ? 'bg-primary text-white shadow-sm' 
                                                                : 'bg-primary/5 text-primary hover:bg-primary/10 border border-primary/20'
                                                        }`}
                                                    >
                                                        <CategoryIcon iconName={iconSearchTerm} className="w-4 h-4" />
                                                        <span className="text-xs font-semibold truncate">Use Custom: {iconSearchTerm}</span>
                                                    </button>
                                                    <div className="h-px bg-slate-100 my-2"></div>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-6 gap-1.5">
                                                {AVAILABLE_ICONS.filter(icon => 
                                                    icon.toLowerCase().includes(iconSearchTerm.toLowerCase())
                                                ).map((icon) => (
                                                    <button
                                                        key={icon}
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData({ ...formData, icon });
                                                            setIconSearchTerm('');
                                                        }}
                                                        className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${
                                                            formData.icon === icon 
                                                                ? 'bg-primary text-white shadow-sm ring-2 ring-primary/20' 
                                                                : 'bg-slate-50 text-textMuted hover:bg-slate-100'
                                                        }`}
                                                        title={icon}
                                                    >
                                                        <CategoryIcon iconName={icon} className="w-5 h-5" />
                                                    </button>
                                                ))}
                                            </div>

                                            {AVAILABLE_ICONS.filter(icon => 
                                                icon.toLowerCase().includes(iconSearchTerm.toLowerCase())
                                            ).length === 0 && !iconSearchTerm && (
                                                <div className="text-center py-6 text-textMuted/60 text-xs font-medium">
                                                    No icons found. Try searching.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="label-premium">
                                        Auto Keywords (comma separated)
                                    </label>
                                    <textarea
                                        value={formData.keywords}
                                        onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                                        className="input-premium resize-none"
                                        placeholder="e.g., grocery, supermarket, walmart"
                                        rows="2"
                                    />
                                    <p className="text-[10px] text-textMuted/60 mt-1 font-semibold">
                                        If expense description contains these words, this category will be auto-selected.
                                    </p>
                                </div>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-4 h-4 text-primary focus:ring-primary/20 rounded border-slate-300"
                                    />
                                    <span className="text-xs font-semibold text-textColor">Active (Users can select this category)</span>
                                </label>
                            </div>

                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary flex-1"
                                >
                                    {editId ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;