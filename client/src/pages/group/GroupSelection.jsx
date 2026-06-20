import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext, API } from '../../context/AuthContext';
import { MdAdd, MdGroup, MdEdit, MdDelete, MdClose, MdCheck, MdContentCopy, MdPeople, MdCreate, MdLogin } from 'react-icons/md';
import { toast } from 'react-toastify';

const GroupSelection = () => {
    const { inviteCode: urlInviteCode } = useParams();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(urlInviteCode ? 'join' : 'select');
    const [newGroup, setNewGroup] = useState({ name: '', description: '' });
    const [inviteCode, setInviteCode] = useState(urlInviteCode || '');

    const [editingGroup, setEditingGroup] = useState(null);
    const [editData, setEditData] = useState({ name: '', description: '' });

    const { setAppMode, setSelectedGroupId, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        fetchGroups();
        if (urlInviteCode) {
            setActiveTab('join');
            setInviteCode(urlInviteCode);
        }
    }, [urlInviteCode]);

    const fetchGroups = async () => {
        try {
            const res = await axios.get(`${API}/groups`);
            setGroups(res.data);
        } catch (error) {
            toast.error("Failed to load groups");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!newGroup.name.trim()) {
            toast.error("Please enter a group name");
            return;
        }
        try {
            const res = await axios.post(`${API}/groups`, newGroup);
            setGroups([res.data, ...groups]);
            setNewGroup({ name: '', description: '' });
            setActiveTab('select');
            toast.success("Group created successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create group");
        }
    };

    const handleJoinGroup = async (e) => {
        e.preventDefault();
        if (!inviteCode.trim()) {
            toast.error("Please enter an invite code");
            return;
        }
        try {
            await axios.post(`${API}/groups/join`, { inviteCode: inviteCode.toUpperCase() });
            setInviteCode('');
            setActiveTab('select');
            fetchGroups();
            toast.success("Joined group successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid invite code");
        }
    };

    const handleSelectGroup = (groupId) => {
        setSelectedGroupId(groupId);
        setAppMode('group');
        navigate('/groups/dashboard');
    };

    const handleUpdateGroup = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`${API}/groups/${editingGroup._id}`, editData);
            setGroups(groups.map(g => g._id === editingGroup._id ? res.data : g));
            setEditingGroup(null);
            toast.success("Group updated successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update group");
        }
    };

    const handleDeleteGroup = async (groupId, groupName) => {
        if (!window.confirm(`Are you sure you want to delete "${groupName}"?`)) return;
        try {
            await axios.delete(`${API}/groups/${groupId}`);
            setGroups(groups.filter(g => g._id !== groupId));
            toast.success("Group deleted successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete group");
        }
    };

    const startEditing = (e, group) => {
        e.stopPropagation();
        setEditingGroup(group);
        setEditData({ name: group.name, description: group.description || '' });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-4 px-3 sm:px-4">
            <div className="max-w-5xl mx-auto space-y-4 text-textColor">
                {/* Header Section */}
                <div className="text-center space-y-1">
                    <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-lg mb-0.5 transition-transform hover:scale-105">
                        <MdGroup className="w-5 h-5 text-primary" />
                    </div>
                    <h1 className="h1-premium">Group Selection</h1>
                    <p className="body-premium max-w-md mx-auto">
                        Track shared expenses, manage group bills, and collaborate seamlessly with friends and family.
                    </p>
                </div>
 
                {/* Tab Navigation */}
                <div className="flex justify-center">
                    <div className="bg-card p-0.5 rounded-lg flex gap-0.5 border border-slate-150 shadow-sm">
                        <button
                            onClick={() => setActiveTab('select')}
                            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'select'
                                ? 'bg-slate-50 text-primary shadow-sm border border-slate-100'
                                : 'text-textMuted hover:text-textColor hover:bg-slate-50/50'
                                }`}
                        >
                            <MdGroup className="text-xs" />
                            My Groups
                        </button>
                        <button
                            onClick={() => setActiveTab('create')}
                            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'create'
                                ? 'bg-slate-50 text-primary shadow-sm border border-slate-100'
                                : 'text-textMuted hover:text-textColor hover:bg-slate-50/50'
                                }`}
                        >
                            <MdCreate className="text-xs" />
                            Create Group
                        </button>
                        <button
                            onClick={() => setActiveTab('join')}
                            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'join'
                                ? 'bg-slate-50 text-primary shadow-sm border border-slate-100'
                                : 'text-textMuted hover:text-textColor hover:bg-slate-50/50'
                                }`}
                        >
                            <MdLogin className="text-xs" />
                            Join Group
                        </button>
                    </div>
                </div>
 
                {/* Content Area */}
                <div>
                    {/* My Groups Tab */}
                    {activeTab === 'select' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {groups.length === 0 ? (
                                <div className="text-center py-10 bg-card rounded-xl border border-slate-100 shadow-sm">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-100">
                                        <MdGroup className="w-6 h-6 text-textMuted/50" />
                                    </div>
                                    <h3 className="h3-premium">No groups found</h3>
                                    <p className="body-premium mt-1 max-w-xs mx-auto">
                                        You aren't a member of any groups yet. Create a new one or join with an invite code.
                                    </p>
                                    <div className="mt-4 flex gap-2 justify-center">
                                        <button
                                            onClick={() => setActiveTab('create')}
                                            className="btn-primary text-xs px-3 py-1.5"
                                        >
                                            Create Group
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('join')}
                                            className="btn-secondary text-xs px-3 py-1.5"
                                        >
                                            Join Group
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {groups.map((group) => {
                                        const isCreator = user && group.createdBy &&
                                            group.createdBy.toString() === (user._id || user.id).toString();
                                        return (
                                            <div
                                                key={group._id}
                                                onClick={() => handleSelectGroup(group._id)}
                                                className="group card-premium cursor-pointer overflow-hidden flex flex-col justify-between"
                                            >
                                                <div>
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                            <MdGroup className="w-4 h-4 text-primary" />
                                                        </div>
                                                        {isCreator && (
                                                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                                                <button
                                                                    onClick={(e) => startEditing(e, group)}
                                                                    className="p-1 text-textMuted hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                                                    title="Edit Group"
                                                                >
                                                                    <MdEdit className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteGroup(group._id, group.name);
                                                                    }}
                                                                    className="p-1 text-textMuted hover:text-danger hover:bg-danger/5 rounded-lg transition-all"
                                                                    title="Delete Group"
                                                                >
                                                                    <MdDelete className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <h3 className="text-xs font-bold text-textColor mb-1 group-hover:text-primary transition-colors">{group.name}</h3>
                                                    <p className="body-premium line-clamp-2 min-h-[32px]">
                                                        {group.description || 'Manage shared expenses and split bills with your team.'}
                                                    </p>
                                                </div>
                                                <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between group-hover:bg-slate-50/50 transition-colors">
                                                    <div className="flex items-center gap-1 text-[11px] font-medium text-textMuted">
                                                        <MdPeople className="text-primary w-3.5 h-3.5" />
                                                        <span>{group.members?.length || 1} members</span>
                                                    </div>
                                                    <div className="text-primary text-[11px] font-bold flex items-center gap-0.5">
                                                        Open <span className="transition-transform group-hover:translate-x-0.5">→</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
 
                    {/* Create Group Tab */}
                    {activeTab === 'create' && (
                        <div className="max-w-md mx-auto bg-card rounded-xl border border-slate-150 shadow-sm overflow-hidden transition-all duration-350 animate-in zoom-in-95">
                            <div className="bg-slate-50/50 px-4 py-2.5 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-card rounded-md border border-slate-100 text-primary">
                                        <MdCreate className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-xs font-bold text-textColor">Create New Group</h2>
                                        <p className="text-[10px] text-textMuted">Launch a new space for your shared expenses</p>
                                    </div>
                                </div>
                            </div>
                            <form onSubmit={handleCreateGroup} className="p-4 space-y-3">
                                <div className="space-y-1">
                                    <label className="label-premium">Group Name</label>
                                    <input
                                        type="text"
                                        value={newGroup.name}
                                        onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                                        placeholder="e.g., Goa Trip, Roommates"
                                        className="input-premium"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="label-premium">Description (Optional)</label>
                                    <textarea
                                        value={newGroup.description}
                                        onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                                        placeholder="What is this group for?"
                                        className="input-premium resize-none"
                                        rows="2"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn-primary w-full py-1.5 text-xs"
                                >
                                    Create Group
                                </button>
                            </form>
                        </div>
                    )}
 
                    {/* Join Group Tab */}
                    {activeTab === 'join' && (
                        <div className="max-w-md mx-auto bg-card rounded-xl border border-slate-150 shadow-sm overflow-hidden transition-all duration-350 animate-in zoom-in-95">
                            <div className="bg-slate-50/50 px-4 py-2.5 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-card rounded-md border border-slate-100 text-secondary">
                                        <MdLogin className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-xs font-bold text-textColor">Join a Group</h2>
                                        <p className="text-[10px] text-textMuted">Enter the secret invite code shared with you</p>
                                    </div>
                                </div>
                            </div>
                            <form onSubmit={handleJoinGroup} className="p-4 space-y-4">
                                <div className="space-y-2">
                                    <label className="label-premium text-center block">Enter 6-Character Invite Code</label>
                                    <input
                                        type="text"
                                        value={inviteCode}
                                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                        placeholder="CODE24"
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card focus:border-primary transition-all text-center text-lg font-bold tracking-widest text-textColor placeholder:text-slate-350 uppercase"
                                        maxLength={6}
                                        required
                                    />
                                    <p className="text-[9px] text-textMuted/80 text-center font-medium">
                                        Invite codes are case-sensitive and must be exactly 6 characters.
                                    </p>
                                </div>
                                <button
                                    type="submit"
                                    className="btn-primary w-full py-1.5 text-xs"
                                >
                                    Join Group Now
                                </button>
                            </form>
                        </div>
                    )}
                </div>
 
                {/* Edit Modal */}
                {editingGroup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-card rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100 transform transition-all animate-in zoom-in-95 duration-200">
                            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xs font-bold text-textColor">Edit Group</h2>
                                    <p className="text-[10px] text-textMuted">Update group name or description</p>
                                </div>
                                <button
                                    onClick={() => setEditingGroup(null)}
                                    className="p-1 hover:bg-slate-100 rounded-lg transition-all text-textMuted hover:text-textColor"
                                >
                                    <MdClose className="w-4 h-4" />
                                </button>
                            </div>
                            <form onSubmit={handleUpdateGroup} className="p-4 space-y-3">
                                <div className="space-y-1">
                                    <label className="label-premium">Group Name</label>
                                    <input
                                        type="text"
                                        value={editData.name}
                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                        className="input-premium"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="label-premium">Description</label>
                                    <textarea
                                        value={editData.description}
                                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                        className="input-premium resize-none"
                                        rows="2"
                                    />
                                </div>
                                <div className="flex gap-2.5 pt-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setEditingGroup(null)}
                                        className="btn-secondary flex-1 py-1.5 text-xs"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary flex-1 py-1.5 text-xs"
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GroupSelection;