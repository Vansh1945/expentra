import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    MdDashboard,
    MdAttachMoney,
    MdPieChart,
    MdGroup,
    MdAnalytics,
    MdAdminPanelSettings,
    MdHome,
    MdHandshake,
    MdEmojiEvents,
} from 'react-icons/md';
import { FaMoneyBillWave } from 'react-icons/fa';

import logoImg from '../assets/logo.png';

const Sidebar = ({ role }) => {
    const location = useLocation();
    const { appMode, setAppMode } = useContext(AuthContext);
    const [showMoreMenu, setShowMoreMenu] = useState(false);

    const getNavItems = () => {
        const isAdminPath = location.pathname.startsWith('/admin');
        const isGroupPath = location.pathname.startsWith('/groups');

        // Admin panel navigation
        if (role === 'admin' && isAdminPath) {
            return [
                { name: 'Dashboard', path: '/admin/dashboard', icon: MdDashboard },
                { name: 'Users', path: '/admin/users', icon: MdGroup },
                { name: 'Categories', path: '/admin/categories', icon: MdPieChart },
                { name: 'Reports', path: '/admin/reports', icon: MdAnalytics },
                { name: 'Profile', path: '/admin/profile', icon: MdAdminPanelSettings },
                { name: 'Personal Mode', path: '/dashboard', icon: MdHome, action: () => setAppMode('personal') },
            ];
        }

        // Group navigation
        if (isGroupPath || appMode === 'group') {
            const items = [
                { name: 'Dashboard', path: '/groups/dashboard', icon: MdDashboard },
                { name: 'Expenses', path: '/groups/expenses', icon: MdAttachMoney },
                { name: 'Settlements', path: '/groups/settlement', icon: MdHandshake },
                { name: 'Members', path: '/groups/members', icon: MdGroup },
                { name: 'Analysis', path: '/groups/analytics', icon: MdAnalytics },
                { name: 'Reports', path: '/groups/reports', icon: MdPieChart },
                { name: 'Personal Mode', path: '/dashboard', icon: MdHome, action: () => setAppMode('personal') },
            ];

            if (role === 'admin') {
                items.push({ name: 'Admin', path: '/admin/dashboard', icon: MdAdminPanelSettings });
            }
            return items;
        }

        // Personal navigation (Rearranged to put Budget as the 4th item)
        const items = [
            { name: 'Dashboard', path: '/dashboard', icon: MdDashboard },
            { name: 'Income', path: '/income', icon: FaMoneyBillWave },
            { name: 'Expenses', path: '/expenses', icon: FaMoneyBillWave },
            { name: 'Budget', path: '/budget', icon: MdAttachMoney },
            { name: 'Reports', path: '/reports', icon: MdPieChart },
            { name: 'Analysis', path: '/analysis', icon: MdAnalytics },
            { name: 'Quests & Badges', path: '/challenges', icon: MdEmojiEvents },
            { name: 'Group Mode', path: '/groups', icon: MdGroup, action: () => setAppMode('group') },
        ];

        if (role === 'admin') {
            items.push({ name: 'Admin', path: '/admin/dashboard', icon: MdAdminPanelSettings, action: () => setAppMode('personal') });
        }
        return items;
    };

    const navItems = getNavItems();
    const mainItems = navItems.slice(0, 4);
    const moreItems = navItems.slice(4);

    return (
        <>
            {/* Desktop Sidebar (hidden on mobile) */}
            <aside className="hidden md:flex flex-col w-64 bg-card text-textColor border-r border-slate-100">
                {/* Header / Logo Section */}
                <div className="flex items-center gap-3 h-16 px-5 border-b border-slate-100 bg-card">
                    <img src={logoImg} alt="FinVibe Logo" className="h-12 object-contain" />
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    <div className="space-y-1.5">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path ||
                                location.pathname.startsWith(item.path + '/');

                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => item.action?.()}
                                    className={`
                                         flex items-center gap-3 px-3.5 py-2.5
                                         rounded-lg text-sm font-semibold
                                         transition-all duration-200
                                         group relative
                                         ${isActive
                                            ? 'bg-primary/10 text-primary shadow-sm'
                                            : 'text-textColor hover:bg-slate-50 hover:text-primary'
                                        }
                                     `}
                                >
                                    <Icon className={`
                                         w-5 h-5 transition-all duration-200
                                         ${isActive ? 'text-primary' : 'opacity-60 group-hover:text-primary'}
                                     `} />
                                    <span className="flex-1">{item.name}</span>
                                    {isActive && (
                                        <div className="absolute left-0 w-0.5 h-6 bg-primary rounded-r-lg"></div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            </aside>

            {/* Mobile Bottom Navigation Bar (hidden on desktop) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-slate-100 flex items-center justify-around z-50 shadow-lg px-2">
                {mainItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path ||
                        location.pathname.startsWith(item.path + '/');
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => {
                                setShowMoreMenu(false);
                                item.action?.();
                            }}
                            className={`flex flex-col items-center justify-center flex-1 py-1 text-center transition-all ${isActive ? 'text-primary' : 'text-textColor/60 hover:text-primary'
                                }`}
                        >
                            <Icon className="w-5.5 h-5.5 mb-0.5" />
                            <span className="text-[10px] font-bold tracking-tight truncate max-w-[68px]">{item.name}</span>
                        </Link>
                    );
                })}

                {/* 5th Button: More */}
                <button
                    onClick={() => setShowMoreMenu(prev => !prev)}
                    className={`flex flex-col items-center justify-center flex-1 py-1 text-center transition-all ${showMoreMenu ? 'text-primary' : 'text-textColor/60 hover:text-primary'
                        }`}
                >
                    <div className="flex gap-0.5 mb-1.5 mt-0.5 items-center justify-center">
                        <span className={`w-1.5 h-1.5 rounded-full ${showMoreMenu ? 'bg-primary' : 'bg-textColor/60'}`}></span>
                        <span className={`w-1.5 h-1.5 rounded-full ${showMoreMenu ? 'bg-primary' : 'bg-textColor/60'}`}></span>
                        <span className={`w-1.5 h-1.5 rounded-full ${showMoreMenu ? 'bg-primary' : 'bg-textColor/60'}`}></span>
                    </div>
                    <span className="text-[10px] font-bold tracking-tight">More</span>
                </button>
            </div>

            {/* More Items Popover overlay */}
            {showMoreMenu && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-[1px] md:hidden"
                        onClick={() => setShowMoreMenu(false)}
                    />
                    <div className="md:hidden fixed bottom-20 right-4 bg-card border border-slate-100 rounded-2xl shadow-xl p-3.5 z-50 min-w-[200px] animate-in slide-in-from-bottom-5 duration-200">
                        <div className="space-y-1">
                            {moreItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path ||
                                    location.pathname.startsWith(item.path + '/');
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        onClick={() => {
                                            setShowMoreMenu(false);
                                            item.action?.();
                                        }}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-primary/10 text-primary' : 'text-textColor hover:bg-slate-50 hover:text-primary'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5 opacity-80" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default Sidebar;