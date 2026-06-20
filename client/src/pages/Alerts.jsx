import React, { useState, useEffect, useContext } from 'react';
import { AuthContext, API } from '../context/AuthContext';
import {
    MdNotificationsActive, MdClose, MdWarning, MdPayment,
    MdGroup, MdCheckCircle, MdInfoOutline, MdAttachMoney,
    MdNotificationsNone, MdDelete, MdRefresh
} from 'react-icons/md';
import { toast } from 'react-toastify';

const Alerts = () => {
    const {
        notifications, notificationsLoading, fetchNotifications,
        markAllAsRead,
        deleteNotification, clearAllNotifications
    } = useContext(AuthContext);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleClearAll = async () => {
        if (!window.confirm('Are you sure you want to clear all notifications?')) return;
        await clearAllNotifications();
        toast.success('All notifications cleared');
    };

    const handleDelete = async (id) => {
        await deleteNotification(id);
        toast.success('Notification removed');
    };



    const handleMarkAllRead = async () => {
        await markAllAsRead();
        toast.success('All notifications marked as read');
    };

    const getAlertConfig = (type) => {
        const configs = {
            BUDGET_EXCEEDED: {
                icon: MdWarning,
                accent: 'bg-danger',
                text: 'text-danger',
                lightBg: 'bg-danger/5',
                iconColor: 'text-danger',
                label: 'Budget Exceeded',
                isSmart: false
            },
            SETTLEMENT_PENDING: {
                icon: MdPayment,
                accent: 'bg-amber-500',
                text: 'text-amber-700',
                lightBg: 'bg-amber-50',
                iconColor: 'text-amber-600',
                label: 'Payment Due',
                isSmart: false
            },
            GROUP_EXPENSE: {
                icon: MdGroup,
                accent: 'bg-primary',
                text: 'text-primary',
                lightBg: 'bg-primary/5',
                iconColor: 'text-primary',
                label: 'Group Activity',
                isSmart: false
            },
            PAYMENT_RECEIVED: {
                icon: MdCheckCircle,
                accent: 'bg-success',
                text: 'text-success',
                lightBg: 'bg-success/5',
                iconColor: 'text-success',
                label: 'Payment Received',
                isSmart: false
            },
            BUDGET_WARNING: {
                icon: MdWarning,
                accent: 'bg-danger/50',
                text: 'text-danger',
                lightBg: 'bg-danger/5',
                iconColor: 'text-danger',
                label: 'Budget Warning',
                isSmart: false
            },
            OVERSPENDING_WARNING: {
                icon: MdNotificationsActive,
                accent: 'bg-primary',
                text: 'text-white',
                lightBg: 'bg-primary/10',
                iconColor: 'text-primary',
                label: 'Smart Insight',
                isSmart: true
            },
            SMART_INSIGHT: {
                icon: MdNotificationsActive,
                accent: 'bg-primary',
                text: 'text-white',
                lightBg: 'bg-primary/10',
                iconColor: 'text-primary',
                label: 'Smart Insight',
                isSmart: true
            },
            RECURRING_SUBSCRIPTION: {
                icon: MdAttachMoney,
                accent: 'bg-primary',
                text: 'text-primary',
                lightBg: 'bg-primary/5',
                iconColor: 'text-primary',
                label: 'Subscription',
                isSmart: false
            },
            INFO: {
                icon: MdInfoOutline,
                accent: 'bg-textColor/40',
                text: 'text-textColor/80',
                lightBg: 'bg-background',
                iconColor: 'text-textColor/70',
                label: 'Information',
                isSmart: false
            }
        };
        return configs[type] || configs.INFO;
    };

    const unreadCount = notifications.filter(n => !n.read).length;
    const filteredNotifications = filter === 'all'
        ? notifications
        : filter === 'unread'
            ? notifications.filter(n => !n.read)
            : notifications;

    if (notificationsLoading) {
        return (
            <div className="space-y-4">
                <div className="h-8 bg-card rounded w-1/4 animate-pulse"></div>
                <div className="h-20 bg-card rounded-lg animate-pulse"></div>
                <div className="h-20 bg-card rounded-lg animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="bg-transparent pb-4 max-w-4xl mx-auto space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="relative">
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                            <MdNotificationsActive className="w-4 h-4 text-primary" />
                        </div>
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-white">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <div>
                        <h1 className="h1-premium">Alerts</h1>
                        <p className="text-[10px] text-textMuted mt-0.5">Manage your financial notifications</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="btn-secondary py-1 px-2.5 text-xs"
                        >
                            <MdCheckCircle className="text-xs text-primary" />
                            Mark all read
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className="btn-secondary py-1 px-2.5 text-xs hover:text-danger hover:border-danger/30"
                        >
                            <MdDelete className="text-xs" />
                            Clear all
                        </button>
                    )}
                    <button
                        onClick={fetchNotifications}
                        className="btn-secondary py-1 px-2.5 text-xs"
                    >
                        <MdRefresh className="text-xs" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-0.5 p-0.5 bg-slate-100 rounded-md w-fit">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-0.5 text-xs font-semibold rounded-md transition-all duration-200 ${filter === 'all'
                        ? 'bg-card text-primary shadow-sm'
                        : 'text-textMuted hover:text-textColor'
                        }`}
                >
                    All
                    <span className="ml-1 px-1 py-0.5 bg-slate-200/60 rounded text-[8px] font-bold">{notifications.length}</span>
                </button>
                <button
                    onClick={() => setFilter('unread')}
                    className={`px-3 py-0.5 text-xs font-semibold rounded-md transition-all duration-200 ${filter === 'unread'
                        ? 'bg-card text-primary shadow-sm'
                        : 'text-textMuted hover:text-textColor'
                        }`}
                >
                    Unread
                    <span className="ml-1 px-1 py-0.5 bg-slate-200/60 rounded text-[8px] font-bold">{unreadCount}</span>
                </button>
            </div>

            {/* Notifications List */}
            <div className="space-y-2">
                {filteredNotifications.length === 0 ? (
                    <div className="card-premium p-6 text-center">
                        <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <MdNotificationsNone className="w-5 h-5 text-textMuted" />
                        </div>
                        <h3 className="text-xs font-bold text-textColor">No Notifications</h3>
                        <p className="text-[11px] text-textMuted mt-0.5 max-w-xs mx-auto">
                            {filter === 'unread' ? "You've read all your notifications! Great job managing your finances." : "You're all caught up! No recent activity to show."}
                        </p>
                    </div>
                ) : (
                    filteredNotifications.map((notification, idx) => {
                        const config = getAlertConfig(notification.type);
                        const Icon = config.icon;
                        const isUnread = !notification.read;

                        return (
                            <div
                                key={notification._id || idx}
                                className={`group relative overflow-hidden rounded-xl border transition-all duration-200 ${config.isSmart
                                    ? 'bg-gradient-to-br from-primary to-indigo-800 p-[1px] shadow-sm hover:shadow-md'
                                    : 'bg-card border-slate-100 shadow-sm hover:shadow-md'
                                    }`}
                            >
                                <div className={`relative flex items-start gap-2.5 p-3 ${config.isSmart ? 'bg-gradient-to-br from-primary to-indigo-800 rounded-[11px]' : ''}`}>
                                    {/* Left Status Indicator */}
                                    {!config.isSmart && (
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.accent}`}></div>
                                    )}

                                    {/* Icon */}
                                    <div className={`shrink-0 p-1.5 rounded-lg ${config.isSmart ? 'bg-white/10' : config.lightBg}`}>
                                        <Icon className={`w-4 h-4 ${config.isSmart ? 'text-white' : config.iconColor}`} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                                            <span className={`text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded ${config.isSmart
                                                ? 'bg-white text-primary'
                                                : `${config.lightBg} ${config.iconColor}`
                                                }`}>
                                                {config.label}
                                            </span>
                                            {isUnread && (
                                                <span className={`text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded ${config.isSmart ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
                                                    NEW
                                                </span>
                                            )}
                                            <span className={`text-[9px] font-semibold ${config.isSmart ? 'text-white/60' : 'text-textMuted/60'}`}>
                                                {new Date(notification.createdAt).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <h4 className={`text-[11px] font-bold leading-relaxed ${config.isSmart ? 'text-white' : 'text-textColor'}`}>
                                            {notification.message}
                                        </h4>

                                        {/* Details Section */}
                                        {notification.details && notification.details.length > 0 && (
                                            <div className={`mt-2 p-2 rounded-lg border ${config.isSmart
                                                ? 'bg-white/10 border-white/10'
                                                : 'bg-slate-50 border-slate-100'
                                                }`}>
                                                <p className={`text-[8px] font-bold uppercase tracking-wider mb-1.5 ${config.isSmart ? 'text-white/60' : 'text-textMuted/60'}`}>Detailed Analysis</p>
                                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                                    {notification.details.map((d, i) => (
                                                        <li key={i} className="flex items-center gap-1.5 p-1 rounded bg-card/5">
                                                            <div className={`w-1 h-1 rounded-full ${config.isSmart ? 'bg-white' : 'bg-primary'}`}></div>
                                                            <div className="flex flex-col">
                                                                 <span className={`text-[10px] font-bold ${config.isSmart ? 'text-white' : 'text-textColor'}`}>{d._id?.category}</span>
                                                                 <span className={`text-[8px] ${config.isSmart ? 'text-white/60' : 'text-textMuted/60'}`}>₹{d._id?.amount} • {d.count} sessions</span>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-1.5 shrink-0">
                                        <button
                                            onClick={() => handleDelete(notification._id)}
                                            className={`p-1 rounded-lg transition-colors ${config.isSmart
                                                ? 'text-white hover:bg-white/10'
                                                : 'text-textMuted hover:text-danger hover:bg-danger/5'
                                                }`}
                                            title="Dismiss"
                                        >
                                            <MdClose className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Alerts;