import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext, API } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import {
    MdAdminPanelSettings, MdSecurity, MdPerson, MdEmail,
    MdLock, MdSave, MdHistory, MdLocationOn, MdVerifiedUser,
    MdInfoOutline, MdCheckCircle, MdWarning
} from 'react-icons/md';

const AdminProfile = () => {
    const { user, setUser } = useContext(AuthContext);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const loginActivities = user?.loginActivities || [];

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const body = { name, email };
            if (password) body.password = password;

            const res = await axios.put(`${API}/auth/profile`, body);
            toast.success('Admin profile updated successfully');

            if (setUser && res.data.user) {
                setUser(res.data.user);
            }

            setPassword('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/5 rounded-lg">
                        <MdAdminPanelSettings className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="h1-premium">Admin Profile</h1>
                        <p className="small-premium mt-0.5">Manage your account settings and security</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2.5 py-0.5 bg-primary/5 rounded-full border border-primary/10">
                        <MdVerifiedUser className="w-3 h-3 text-primary" />
                        <span className="text-[9px] font-bold text-primary uppercase tracking-wider">Administrator</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Profile Form - Main Column */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="card-premium !p-0 overflow-hidden">
                        <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100">
                            <div className="flex items-center gap-1.5">
                                <MdSecurity className="w-4 h-4 text-primary" />
                                <h2 className="text-xs font-bold text-textColor uppercase tracking-wider">Security & Credentials</h2>
                            </div>
                            <p className="small-premium mt-0.5">Update your primary administrative contact and password</p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-3">
                            <div>
                                <label className="label-premium">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input-premium py-1 text-xs"
                                    placeholder="Your full name"
                                />
                            </div>

                            <div>
                                <label className="label-premium">
                                    Admin Email
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-premium py-1 text-xs"
                                    placeholder="admin@example.com"
                                />
                            </div>

                            <div>
                                <label className="label-premium">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input-premium pr-10 py-1 text-xs"
                                        placeholder="Leave blank to keep current password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-textMuted/60 hover:text-textColor text-xs"
                                    >
                                        {showPassword ? "🙈" : "👁️"}
                                    </button>
                                </div>
                                <p className="text-[9px] text-textMuted/60 mt-0.5 font-semibold">
                                    Minimum 6 characters. Only update if you want to change your password.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-1.5 font-bold uppercase tracking-wider text-xs"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full w-3.5 h-3.5 border-2 border-white border-t-transparent"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <MdSave className="text-sm" />
                                        Update Settings
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Info Card */}
                    <div className="bg-primary/5 rounded-xl border border-primary/10 p-3">
                        <div className="flex items-start gap-2.5">
                            <MdInfoOutline className="w-4 h-4 text-primary mt-0.5" />
                            <div>
                                <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Security Tips</p>
                                <ul className="text-[10px] text-textMuted mt-1.5 space-y-1.5 font-medium">
                                    <li className="flex items-center gap-1.5">
                                        <MdCheckCircle className="text-xs text-primary/70" />
                                        Use a strong, unique password for your admin account
                                    </li>
                                    <li className="flex items-center gap-1.5">
                                        <MdCheckCircle className="text-xs text-primary/70" />
                                        Never share your login credentials with others
                                    </li>
                                    <li className="flex items-center gap-1.5">
                                        <MdCheckCircle className="text-xs text-primary/70" />
                                        Review your login activity regularly for suspicious access
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Login Activity */}
                <div className="space-y-4">
                    <div className="card-premium !p-0 overflow-hidden">
                        <div className="px-3.5 py-2 bg-slate-50/50 border-b border-slate-100">
                            <div className="flex items-center gap-1.5">
                                <MdHistory className="w-4 h-4 text-primary" />
                                <h3 className="font-bold text-textColor text-xs">Login Activity</h3>
                            </div>
                            <p className="small-premium mt-0.5">Recent sign-ins to your account</p>
                        </div>

                        <div className="max-h-64 overflow-y-auto">
                            {loginActivities.length === 0 ? (
                                <div className="p-6 text-center">
                                    <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <MdHistory className="w-5 h-5 text-textMuted/50" />
                                    </div>
                                    <p className="text-xs font-semibold text-textColor">No activity recorded</p>
                                    <p className="small-premium mt-1 uppercase tracking-wide">Sign-ins will appear here</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {[...loginActivities].reverse().map((log, index) => (
                                        <div key={index} className="p-2.5 hover:bg-slate-50/30 transition-all duration-200">
                                            <div className="flex items-start gap-2">
                                                <div className="w-7 h-7 bg-primary/5 rounded-lg flex items-center justify-center shrink-0">
                                                    <MdLocationOn className="w-3.5 h-3.5 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-textColor">
                                                        {new Date(log.date).toLocaleDateString(undefined, {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                    <p className="text-[10px] text-textMuted font-medium">
                                                        {new Date(log.date).toLocaleTimeString()}
                                                    </p>
                                                    <p className="text-[9px] font-mono text-textMuted/60 mt-0.5 font-semibold">
                                                        IP: {log.ip || 'Unknown'}
                                                    </p>
                                                </div>
                                                {log.isNewDevice && (
                                                    <span className="text-[8px] font-bold uppercase tracking-wider bg-warning/10 text-warning px-1.5 py-0.5 rounded-full">
                                                        New
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Admin Stats Card */}
                    <div className="card-premium p-3">
                        <div className="flex items-center gap-1.5 mb-2.5">
                            <MdVerifiedUser className="w-4 h-4 text-primary" />
                            <h3 className="font-bold text-textColor text-xs">Account Summary</h3>
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                                <span className="text-[11px] font-semibold text-textMuted">Role</span>
                                <span className="text-[11px] font-bold text-primary uppercase tracking-wide">Super Admin</span>
                            </div>
                            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                                <span className="text-[11px] font-semibold text-textMuted">Account Status</span>
                                <span className="text-[11px] font-bold text-success flex items-center gap-0.5 uppercase tracking-wide">
                                    <MdCheckCircle className="text-xs" />
                                    Active
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                                <span className="text-[11px] font-semibold text-textMuted">Member Since</span>
                                <span className="text-[11px] font-bold text-textColor">
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-1.5">
                                <span className="text-[11px] font-semibold text-textMuted">Total Logins</span>
                                <span className="text-[11px] font-bold text-textColor">{loginActivities.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Security Warning */}
                    {!password && (
                        <div className="bg-warning/5 rounded-xl border border-warning/15 p-3">
                            <div className="flex items-start gap-2">
                                <MdWarning className="w-4 h-4 text-warning mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-bold text-warning uppercase tracking-wider">Security Recommendation</p>
                                    <p className="text-[10px] text-textMuted mt-0.5 leading-relaxed font-medium">
                                        Consider updating your password regularly to maintain account security.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;