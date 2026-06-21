import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext, API } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import {
    MdGroupAdd, MdPerson, MdEdit, MdDelete, MdCheck, MdClose,
    MdContentCopy, MdEmail, MdPeople, MdAdminPanelSettings,
    MdInfoOutline, MdLink
} from 'react-icons/md';

const Members = () => {
    const { selectedGroupId, user } = useContext(AuthContext);
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [editingMemberId, setEditingMemberId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');

    const isAdmin = groupData && user && groupData.createdBy?.toString() === user._id?.toString();
    const inviteLink = groupData?.inviteCode 
        ? `${window.location.origin}/join-group/${groupData.inviteCode}` 
        : 'N/A';

    const fetchGroupData = async () => {
        try {
            const res = await axios.get(`${API}/groups/${selectedGroupId}`);
            setGroupData(res.data);
        } catch (error) {
            toast.error("Failed to load group members");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!selectedGroupId) return;
        fetchGroupData();
    }, [selectedGroupId]);

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Name is required");
            return;
        }
        setIsSubmitting(true);
        try {
            await axios.put(`${API}/groups/${selectedGroupId}/members`, {
                name: name.trim(),
                email: email.trim() || undefined
            });
            toast.success(`${name} added to the group!`);
            setName('');
            setEmail('');
            await fetchGroupData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add member");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateMember = async (memberId) => {
        if (!editName.trim()) {
            toast.error("Name is required");
            return;
        }
        setIsSubmitting(true);
        try {
            await axios.put(`${API}/groups/${selectedGroupId}/members/${memberId}`, {
                name: editName.trim(),
                email: editEmail.trim() || ''
            });
            toast.success("Member updated");
            setEditingMemberId(null);
            await fetchGroupData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Update failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteMember = async (memberId, memberName) => {
        if (!window.confirm(`Are you sure you want to remove ${memberName} from the group?`)) return;
        try {
            await axios.delete(`${API}/groups/${selectedGroupId}/members/${memberId}`);
            toast.success("Member removed");
            await fetchGroupData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Delete failed");
        }
    };

    const startEditing = (member) => {
        setEditingMemberId(member._id);
        setEditName(member.name);
        setEditEmail(member.email || '');
    };

    const copyToClipboard = (text, message) => {
        navigator.clipboard.writeText(text);
        toast.success(message);
    };

    if (!selectedGroupId) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="bg-card rounded-lg border border-background p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-4">
                        <MdPeople className="w-8 h-8 text-textColor/50" />
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
                    <div className="h-8 bg-card rounded w-1/3 animate-pulse"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="h-80 bg-card rounded-lg animate-pulse"></div>
                        <div className="h-80 bg-card rounded-lg animate-pulse"></div>
                        <div className="h-96 bg-card rounded-lg animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-4 space-y-4 bg-background min-h-screen pb-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="h1-premium">{groupData?.name}</h1>
                    <p className="small-premium mt-0.5">Manage group members and squad invitations</p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-card rounded-lg border border-slate-100 shadow-sm">
                    <MdPeople className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-semibold text-textColor opacity-70">
                        {groupData?.members?.length || 0} Members
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-4">
                    {/* Invite Options Card */}
                    <div className="bg-card rounded-xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300">
                        <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2">
                            <div className="bg-slate-50 rounded-lg p-1 border border-slate-100">
                                <MdGroupAdd className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <h2 className="text-xs font-bold text-textColor">Quick Invite</h2>
                        </div>
                        <div className="p-4 space-y-3">
                            {/* Invite Code */}
                            <div>
                                <label className="label-premium">
                                    Invite Code
                                </label>
                                <div className="flex items-center gap-1.5">
                                    <div className="flex-1 bg-slate-50 px-3 py-1.5 rounded-lg font-mono text-xs font-bold text-center border border-slate-200 text-textColor tracking-widest shadow-inner">
                                        {groupData?.inviteCode || 'N/A'}
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(groupData?.inviteCode, "Invite code copied!")}
                                        className="p-1.5 bg-slate-50 text-primary rounded-lg border border-slate-200 hover:bg-primary/5 transition-all"
                                        title="Copy Code"
                                    >
                                        <MdContentCopy className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Invite Link */}
                            <div>
                                <label className="label-premium">
                                    Invite Link
                                </label>
                                <div className="flex items-center gap-1.5">
                                    <div className="flex-1 bg-slate-50 px-2 py-1.5 rounded-lg text-[10px] truncate border border-slate-200 text-textColor opacity-60">
                                        {inviteLink}
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(inviteLink, "Invite link copied!")}
                                        className="p-1.5 bg-slate-50 text-primary rounded-lg border border-slate-200 hover:bg-primary/5 transition-all"
                                        title="Copy Link"
                                    >
                                        <MdLink className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => toast.info("Email invitation coming soon!")}
                                className="btn-primary w-full py-1.5"
                            >
                                <MdEmail className="w-3.5 h-3.5" />
                                Invite via Email
                            </button>
                        </div>
                    </div>

                    {/* Add Member Form */}
                    {isAdmin && (
                        <div className="bg-card rounded-xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300">
                            <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2">
                                <div className="bg-slate-50 rounded-lg p-1 border border-slate-100">
                                    <MdPerson className="w-3.5 h-3.5 text-textMuted" />
                                </div>
                                <h2 className="text-xs font-bold text-textColor">Add Member</h2>
                            </div>
                            <form onSubmit={handleAddMember} className="p-4 space-y-3">
                                <div className="space-y-1">
                                    <label className="label-premium">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="input-premium"
                                        placeholder="e.g. John Doe"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="label-premium flex items-center justify-between">
                                        Email <span className="text-[9px] lowercase opacity-50 font-normal tracking-normal">(optional)</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="input-premium"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn-primary w-full py-1.5"
                                >
                                    {isSubmitting ? 'Adding...' : 'Add Member'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Member List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-card rounded-xl border border-slate-100 shadow-sm overflow-hidden h-full flex flex-col min-h-[400px]">
                        <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2">
                            <div className="bg-slate-50 rounded-lg p-1 border border-slate-100">
                                <MdPeople className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <h2 className="text-xs font-bold text-textColor">Active Squad Members</h2>
                        </div>

                        <div className="p-3 flex-1 overflow-y-auto max-h-[600px] scrolling-touch">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {groupData?.members?.map((member) => {
                                    const isCreator = groupData.createdBy?.toString() === (member.user?.toString() || member._id?.toString());
                                    const isCurrentUser = user && member.user?.toString() === user._id?.toString();
                                    const isEditing = editingMemberId === member._id;

                                    return (
                                        <div key={member._id} className={`group p-3 rounded-lg border transition-all duration-300 ${
                                            isEditing ? 'bg-card border-primary shadow-sm' : 'bg-slate-50/50 border-slate-100 hover:border-primary/20 hover:shadow-sm'
                                        }`}>
                                            {isEditing ? (
                                                <div className="space-y-1.5">
                                                    <input
                                                        type="text"
                                                        value={editName}
                                                        onChange={e => setEditName(e.target.value)}
                                                        className="w-full px-2 py-1 bg-card border border-slate-200 rounded text-xs font-medium focus:ring-1 focus:ring-primary/20"
                                                        placeholder="Name"
                                                        autoFocus
                                                    />
                                                    <input
                                                        type="email"
                                                        value={editEmail}
                                                        onChange={e => setEditEmail(e.target.value)}
                                                        className="w-full px-2 py-1 bg-card border border-slate-200 rounded text-xs font-medium focus:ring-1 focus:ring-primary/20"
                                                        placeholder="Email"
                                                    />
                                                    <div className="flex gap-1.5">
                                                        <button
                                                            onClick={() => handleUpdateMember(member._id)}
                                                            className="flex-1 py-1 bg-primary text-white rounded text-[9px] font-semibold hover:opacity-90"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingMemberId(null)}
                                                            className="flex-1 py-1 bg-card border border-slate-200 text-textColor rounded text-[9px] font-semibold hover:bg-slate-50"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col h-full justify-between">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/10">
                                                                {member.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-xs font-semibold text-textColor truncate">{member.name}</p>
                                                                <p className="text-[9px] text-textMuted truncate font-medium">{member.email || 'No email shared'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-0.5">
                                                            {isCreator && (
                                                                <span className="text-[7px] font-bold bg-amber-100 text-amber-700 px-1 py-0.25 rounded uppercase tracking-wide">Admin</span>
                                                            )}
                                                            {isCurrentUser && !isCreator && (
                                                                <span className="text-[7px] font-bold bg-primary/10 text-primary px-1 py-0.25 rounded uppercase tracking-wide">You</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {(isAdmin && !isCreator) && (
                                                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => startEditing(member)}
                                                                className="text-[9px] font-bold text-textMuted hover:text-primary transition-all flex items-center gap-0.5"
                                                            >
                                                                <MdEdit className="w-3 h-3" /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteMember(member._id, member.name)}
                                                                className="text-[9px] font-bold text-textMuted hover:text-danger transition-all flex items-center gap-0.5"
                                                            >
                                                                <MdDelete className="w-3 h-3" /> Remove
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {groupData?.members?.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 text-center text-textMuted">
                                    <MdPeople className="w-10 h-10 mb-2 opacity-25" />
                                    <p className="text-xs font-medium">No members yet</p>
                                    <p className="text-[9px] opacity-60 mt-0.5">Building your squad? Start inviting others!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Access Disclaimer */}
            {!isAdmin && (
                <div className="bg-amber-50 rounded-lg border border-amber-100 p-2.5 flex items-start gap-2">
                    <MdInfoOutline className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-amber-900 leading-none">Security Note</p>
                        <p className="text-[9px] text-amber-800/80 mt-0.5 leading-relaxed">
                            Squad management (adding or removing members) is restricted to Group Admins only. You can still use the invite codes to invite friends.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Members;