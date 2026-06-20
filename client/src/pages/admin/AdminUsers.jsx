import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext, API } from '../../context/AuthContext';
import {
    MdDelete, MdBlock, MdCheckCircle, MdList, MdEdit,
    MdPeople, MdSearch, MdFilterList, MdClose, MdPerson,
    MdEmail, MdAdminPanelSettings, MdPersonOutline, MdCalendarToday,
    MdAttachMoney, MdCategory, MdReceipt, MdInfoOutline,
    MdWarning, MdLock, MdSave
} from 'react-icons/md';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    const [selectedUser, setSelectedUser] = useState(null);
    const [userExpenses, setUserExpenses] = useState([]);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [loadingExpenses, setLoadingExpenses] = useState(false);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({ id: '', name: '', email: '', role: '', password: '', status: '' });
    const [savingUser, setSavingUser] = useState(false);

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API}/admin/users`);
            setUsers(res.data);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleEditClick = (user) => {
        setEditFormData({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            password: '',
            status: user.status || (user.isBlocked ? 'blocked' : 'active')
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        setSavingUser(true);
        try {
            const payload = {
                name: editFormData.name,
                email: editFormData.email,
                role: editFormData.role,
                status: editFormData.status
            };
            if (editFormData.password.trim() !== '') {
                payload.password = editFormData.password;
            }
            await axios.put(`${API}/admin/users/${editFormData.id}`, payload);
            toast.success('User details updated');
            setShowEditModal(false);
            fetchUsers();
        } catch (error) {
            toast.error('Failed to update user');
        } finally {
            setSavingUser(false);
        }
    };

    const handleToggleBlock = async (user) => {
        try {
            const newStatus = user.status === 'blocked' || user.isBlocked ? 'active' : 'blocked';
            await axios.put(`${API}/admin/users/${user._id}`, { status: newStatus });
            toast.success(`User ${!user.isBlocked ? 'blocked' : 'unblocked'} successfully`);
            fetchUsers();
        } catch (error) {
            toast.error('Failed to update user status');
        }
    };

    const handleDeleteUser = async (id, name) => {
        if (window.confirm(`Are you sure you want to permanently delete "${name}"?`)) {
            try {
                await axios.delete(`${API}/admin/users/${id}`);
                toast.success('User deleted successfully');
                fetchUsers();
            } catch (error) {
                toast.error('Failed to delete user');
            }
        }
    };

    const handleViewExpenses = async (user) => {
        setSelectedUser(user);
        setShowExpenseModal(true);
        setLoadingExpenses(true);
        try {
            const res = await axios.get(`${API}/admin/users/${user._id}/expenses`);
            setUserExpenses(res.data);
        } catch (error) {
            toast.error('Failed to load user expenses');
        } finally {
            setLoadingExpenses(false);
        }
    };

    const handleDeleteExpense = async (expenseId) => {
        if (window.confirm('Delete this user expense permanently?')) {
            try {
                await axios.delete(`${API}/admin/users/${selectedUser._id}/expenses/${expenseId}`);
                toast.success('Expense deleted');
                setUserExpenses(userExpenses.filter(e => e._id !== expenseId));
            } catch (error) {
                toast.error('Failed to delete expense');
            }
        }
    };

    const filteredUsers = users.filter(user => {
        if (searchTerm && !user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !user.email.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (filterRole !== 'all' && user.role !== filterRole) return false;
        const isBlocked = user.status === 'blocked' || user.isBlocked;
        if (filterStatus === 'active' && isBlocked) return false;
        if (filterStatus === 'blocked' && !isBlocked) return false;
        return true;
    });

    const activeUsers = users.filter(u => !(u.status === 'blocked' || u.isBlocked)).length;
    const blockedUsers = users.filter(u => u.status === 'blocked' || u.isBlocked).length;
    const adminCount = users.filter(u => u.role === 'admin').length;

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-slate-50 rounded w-1/4 animate-pulse"></div>
                <div className="h-12 bg-slate-50 rounded-xl animate-pulse"></div>
                <div className="h-96 bg-slate-50 rounded-xl animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-primary/5 rounded-lg">
                        <MdPeople className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="h1-premium">User Management</h1>
                        <p className="small-premium mt-0.5">Manage platform users and their accounts</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="card-premium">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-textMuted uppercase tracking-wide">Total Users</p>
                            <p className="text-lg md:text-xl font-bold text-textColor mt-0.5">{users.length}</p>
                        </div>
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <MdPeople className="w-4 h-4 text-primary" />
                        </div>
                    </div>
                </div>

                <div className="card-premium">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-textMuted uppercase tracking-wide">Active</p>
                            <p className="text-lg md:text-xl font-bold text-success mt-0.5">{activeUsers}</p>
                        </div>
                        <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                            <MdCheckCircle className="w-4 h-4 text-success" />
                        </div>
                    </div>
                </div>

                <div className="card-premium">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-textMuted uppercase tracking-wide">Blocked</p>
                            <p className="text-lg md:text-xl font-bold text-danger mt-0.5">{blockedUsers}</p>
                        </div>
                        <div className="w-8 h-8 bg-danger/10 rounded-lg flex items-center justify-center">
                            <MdBlock className="w-4 h-4 text-danger" />
                        </div>
                    </div>
                </div>

                <div className="card-premium">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-textMuted uppercase tracking-wide">Admins</p>
                            <p className="text-lg md:text-xl font-bold text-primary mt-0.5">{adminCount}</p>
                        </div>
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <MdAdminPanelSettings className="w-4 h-4 text-primary" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textMuted/50 text-xs" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="input-premium !pl-9"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={filterRole}
                        onChange={e => setFilterRole(e.target.value)}
                        className="select-premium font-bold"
                    >
                        <option value="all">All Roles</option>
                        <option value="personal">Personal</option>
                        <option value="admin">Admin</option>
                    </select>
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="select-premium font-bold"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="card-premium !p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50/20 border-b border-slate-100">
                            <tr>
                                <th className="px-3 py-1.5 text-left text-[9px] font-bold text-textMuted uppercase tracking-wider">User</th>
                                <th className="px-3 py-1.5 text-left text-[9px] font-bold text-textMuted uppercase tracking-wider">Email</th>
                                <th className="px-3 py-1.5 text-left text-[9px] font-bold text-textMuted uppercase tracking-wider">Role</th>
                                <th className="px-3 py-1.5 text-left text-[9px] font-bold text-textMuted uppercase tracking-wider">Status</th>
                                <th className="px-3 py-1.5 text-left text-[9px] font-bold text-textMuted uppercase tracking-wider">Joined</th>
                                <th className="px-3 py-1.5 text-right text-[9px] font-bold text-textMuted uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.map((user) => {
                                const isBlocked = user.status === 'blocked' || user.isBlocked;
                                return (
                                    <tr key={user._id} className="hover:bg-slate-50/30 transition-all duration-200">
                                        <td className="px-3 py-2 animate-none">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center shrink-0">
                                                    <span className="text-[10px] font-bold text-primary">
                                                        {user.name.charAt(0).toUpperCase()}
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
                                                {user.role === 'admin' && <MdAdminPanelSettings className="text-[9px]" />}
                                                {user.role || 'personal'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${isBlocked
                                                    ? 'bg-danger/10 text-danger'
                                                    : 'bg-success/10 text-success'
                                                }`}>
                                                {isBlocked ? <MdBlock className="text-[8px]" /> : <MdCheckCircle className="text-[8px]" />}
                                                {isBlocked ? 'Blocked' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-xs text-textMuted font-medium">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            <div className="flex justify-end gap-0.5">
                                                <button
                                                    onClick={() => handleEditClick(user)}
                                                    className="p-1 text-textMuted/60 hover:text-primary hover:bg-primary/5 rounded transition-all duration-200"
                                                    title="Edit User"
                                                >
                                                    <MdEdit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleViewExpenses(user)}
                                                    className="p-1 text-textMuted/60 hover:text-primary hover:bg-primary/5 rounded transition-all duration-200"
                                                    title="View Expenses"
                                                >
                                                    <MdList className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleBlock(user)}
                                                    className={`p-1 rounded transition-all duration-200 ${isBlocked
                                                            ? 'text-textMuted/60 hover:text-success hover:bg-success/5'
                                                            : 'text-textMuted/60 hover:text-danger hover:bg-danger/5'
                                                        }`}
                                                    title={isBlocked ? "Unblock User" : "Block User"}
                                                >
                                                    {isBlocked ? <MdCheckCircle className="w-3.5 h-3.5" /> : <MdBlock className="w-3.5 h-3.5" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user._id, user.name)}
                                                    className="p-1 text-textMuted/60 hover:text-danger hover:bg-danger/5 rounded transition-all duration-200"
                                                    title="Delete User"
                                                >
                                                    <MdDelete className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-3 py-8 text-center">
                                        <p className="text-xs font-semibold text-textMuted">No users found matching your filters</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Expenses Modal */}
            {showExpenseModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-slate-100">
                        <div className="px-4 py-2.5 bg-slate-50/50 border-b border-slate-100 rounded-t-xl flex justify-between items-center">
                            <div>
                                <h2 className="text-xs font-bold text-textColor">User Expenses</h2>
                                <p className="small-premium mt-0.5">{selectedUser.name} • {selectedUser.email}</p>
                            </div>
                            <button
                                onClick={() => setShowExpenseModal(false)}
                                className="p-1 hover:bg-slate-100 rounded transition-all duration-200 text-textMuted/60 hover:text-textColor"
                            >
                                <MdClose className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            {loadingExpenses ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full w-6 h-6 border-2 border-primary border-t-transparent"></div>
                                </div>
                            ) : userExpenses.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <MdReceipt className="w-5 h-5 text-textMuted/50" />
                                    </div>
                                    <p className="text-xs font-semibold text-textMuted">No expenses found for this user</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {userExpenses.map(exp => (
                                        <div key={exp._id} className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-lg border border-slate-100 hover:border-slate-200 transition-all duration-200">
                                            <div className="flex items-center gap-2.5 flex-1">
                                                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                                                    <MdCategory className="w-4 h-4 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-textColor truncate">{exp.title || 'No description'}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[9px] text-textMuted font-semibold flex items-center gap-0.5 uppercase tracking-wider">
                                                            <MdCalendarToday className="text-[9px]" />
                                                            {new Date(exp.date).toLocaleDateString()}
                                                        </span>
                                                        <span className="text-[8px] px-1.5 py-0.25 bg-primary/10 text-primary font-bold uppercase tracking-wider rounded-full">
                                                            {exp.category}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-sm font-bold text-success">₹{exp.amount.toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteExpense(exp._id)}
                                                className="p-1 text-textMuted/60 hover:text-danger hover:bg-danger/5 rounded transition-all duration-200 ml-2"
                                                title="Delete Expense"
                                            >
                                                <MdDelete className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                    <div className="mt-3 p-2.5 card-premium">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider">Total Expenses</span>
                                            <span className="text-base font-bold text-primary">
                                                ₹{userExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-100">
                        <div className="px-4 py-2.5 bg-slate-50/50 border-b border-slate-100 rounded-t-xl">
                            <h2 className="text-xs font-bold text-textColor">Edit User</h2>
                            <p className="small-premium mt-0.5">Modify user details and permissions</p>
                        </div>
                        <form onSubmit={handleSaveEdit} className="p-4 space-y-3">
                            <div>
                                <label className="label-premium">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                    className="input-premium"
                                />
                            </div>
                            <div>
                                <label className="label-premium">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    value={editFormData.email}
                                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                    className="input-premium"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="label-premium">Role</label>
                                    <select
                                        value={editFormData.role}
                                        onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                                        className="select-premium font-bold"
                                    >
                                        <option value="personal">Personal</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label-premium">Status</label>
                                    <select
                                        value={editFormData.status}
                                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                        className="select-premium font-bold"
                                    >
                                        <option value="active">Active</option>
                                        <option value="blocked">Blocked</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="label-premium">Force Password Reset</label>
                                <input
                                    type="text"
                                    placeholder="Leave blank to keep current"
                                    value={editFormData.password}
                                    onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                                    className="input-premium"
                                />
                                <p className="text-[8px] text-textMuted font-bold mt-1 uppercase tracking-wider">
                                    If provided, the user's password will be immediately updated.
                                </p>
                            </div>
                            <div className="flex gap-2 pt-1.5">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="btn-secondary flex-1 py-1.5 text-xs font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingUser}
                                    className="btn-primary flex-1 py-1.5 text-xs font-semibold"
                                >
                                    {savingUser ? (
                                        <>
                                            <div className="animate-spin rounded-full w-3 h-3 border-2 border-white border-t-transparent"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <MdSave className="text-xs" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;