import React, { useState, useEffect, useContext, useMemo } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { MdAdd, MdWork, MdDonutLarge, MdSearch, MdFilterList, MdDateRange } from 'react-icons/md';

const CompanyProjects = () => {
    const { user } = useContext(AuthContext);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    // Search and Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [formData, setFormData] = useState({
        name: '',
        budget: '',
        startDate: '',
        endDate: ''
    });

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const res = await api.get('/projects');
            setProjects(res.data);
        } catch (error) {
            toast.error('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            await api.post('/projects', formData);
            toast.success('Project Created!');
            setShowCreate(false);
            setFormData({ name: '', budget: '', startDate: '', endDate: '' });
            fetchProjects();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error creating project');
        }
    };

    // Derived Statistics
    const stats = useMemo(() => {
        const total = projects.length;
        const active = projects.filter(p => p.status === 'active').length;
        const overBudget = projects.filter(p => p.budget > 0 && p.spent >= p.budget).length;
        return { total, active, overBudget };
    }, [projects]);

    // Filtered Projects
    const filteredProjects = useMemo(() => {
        return projects.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [projects, searchTerm, statusFilter]);

    if (loading) return <div className="p-8 text-center text-gray-500 flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Project Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Allocate budgets, track timelines, and monitor active spending</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="flex items-center px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap">
                    <MdAdd className="mr-2 w-5 h-5" /> Launch Project
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-indigo-500 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Projects</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-full text-indigo-500">
                        <MdWork size={28} />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-emerald-500 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Projects</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.active}</p>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-full text-emerald-500">
                        <MdDonutLarge size={28} />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-rose-500 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Over Budget</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.overBudget}</p>
                    </div>
                    <div className="p-3 bg-rose-50 rounded-full text-rose-500">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MdSearch className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search projects by name..."
                        className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2.5 transition-shadow"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative min-w-[200px]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MdFilterList className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                        className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2.5 bg-white appearance-none cursor-pointer"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="on-hold">On Hold</option>
                    </select>
                </div>
            </div>

            {/* Project Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                {filteredProjects.map(project => {
                    const pctSpent = project.budget > 0 ? (project.spent / project.budget) * 100 : 0;
                    const isOverBudget = pctSpent >= 100;
                    const isWarning = pctSpent >= 80 && !isOverBudget;

                    const displayStatus = project.status || 'Active'; // default fallback
                    const statusColors = {
                        'active': 'bg-emerald-100 text-emerald-700 border-emerald-200',
                        'completed': 'bg-blue-100 text-blue-700 border-blue-200',
                        'on-hold': 'bg-amber-100 text-amber-700 border-amber-200',
                        'default': 'bg-gray-100 text-gray-700 border-gray-200'
                    };
                    const statusStyle = statusColors[project.status?.toLowerCase()] || statusColors.default;

                    const formatDate = (dateString) => {
                        if (!dateString) return 'Not set';
                        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    };

                    return (
                        <div key={project._id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 flex flex-col overflow-hidden group">
                            {/* Color Header Banner */}
                            <div className={`h-2 w-full ${isOverBudget ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-indigo-500'}`}></div>

                            <div className="p-6 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1 pr-4">
                                            <h3 className="font-bold text-gray-900 text-xl truncate group-hover:text-indigo-600 transition-colors">{project.name}</h3>
                                            <div className="flex items-center mt-2 text-sm text-gray-500 gap-3">
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium border uppercase tracking-wider ${statusStyle}`}>
                                                    {displayStatus}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`p-2 rounded-lg ${isOverBudget ? 'bg-rose-50 text-rose-500' : 'bg-gray-50 text-gray-400'}`}>
                                            <MdWork size={24} />
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    {(project.startDate || project.endDate) && (
                                        <div className="flex items-center text-xs text-gray-500 mb-5 bg-gray-50 p-2 rounded-lg gap-2">
                                            <MdDateRange className="w-4 h-4 text-gray-400" />
                                            <span>{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
                                        </div>
                                    )}

                                    {/* Financials Setup */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <span className="text-xs text-gray-500 block mb-1">Total Budget</span>
                                            <span className="font-bold text-gray-900 text-lg">₹{project.budget.toLocaleString()}</span>
                                        </div>
                                        <div className={`${isOverBudget ? 'bg-rose-50' : isWarning ? 'bg-amber-50' : 'bg-gray-50'} rounded-lg p-3`}>
                                            <span className={`text-xs block mb-1 ${isOverBudget ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-gray-500'}`}>Current Spend</span>
                                            <span className={`font-bold text-lg ${isOverBudget ? 'text-rose-700' : isWarning ? 'text-amber-700' : 'text-gray-900'}`}>
                                                ₹{project.spent.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar Area */}
                                <div className="mt-auto">
                                    <div className="flex justify-between text-sm font-medium mb-2">
                                        <span className={isOverBudget ? 'text-rose-600 font-bold' : 'text-gray-700'}>
                                            {pctSpent.toFixed(1)}% {isOverBudget && 'Over Budget!'}
                                        </span>
                                        <span className="text-gray-500">
                                            ₹{Math.max(project.budget - project.spent, 0).toLocaleString()} left
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-200">
                                        <div
                                            className={`h-3 rounded-full transition-all duration-1000 ease-out custom-pulse ${isOverBudget ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-indigo-500'}`}
                                            style={{ width: `${Math.min(pctSpent, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filteredProjects.length === 0 && (
                    <div className="col-span-full py-16 px-4 bg-white border-2 border-dashed rounded-2xl border-gray-200 flex flex-col items-center justify-center text-center">
                        <div className="bg-indigo-50 p-4 rounded-full mb-4">
                            <MdDonutLarge className="h-10 w-10 text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">No Projects Found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            {searchTerm || statusFilter !== 'all'
                                ? "We couldn't find any projects matching your current filters. Try relaxing your search criteria."
                                : "Get started by launching your first project and allocating a budget to track expenses against."}
                        </p>
                        {(!searchTerm && statusFilter === 'all') && (
                            <button onClick={() => setShowCreate(true)} className="mt-6 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                                Launch First Project
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Create Project Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md transform transition-all translate-y-0 opacity-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Launch Project</h2>
                            <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateProject} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Project Name <span className="text-rose-500">*</span></label>
                                <input type="text" required placeholder="e.g. Q4 Marketing Campaign" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Total Budget (₹) <span className="text-rose-500">*</span></label>
                                <input type="number" required placeholder="10000" min="0" step="100" value={formData.budget} onChange={e => setFormData({ ...formData, budget: e.target.value })} className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date</label>
                                    <input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="block w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-shadow text-gray-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">End Date</label>
                                    <input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="block w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-shadow text-gray-600" />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 px-4 py-3 bg-gray-100 font-medium rounded-xl text-gray-700 hover:bg-gray-200 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-3 bg-indigo-600 font-medium rounded-xl text-white hover:bg-indigo-700 transition-colors shadow-sm">Launch Project</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyProjects;
