import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MdLogout, MdAccountCircle, MdMenu, MdNotifications } from 'react-icons/md';
import { Link } from 'react-router-dom';

const Navbar = ({ user, setIsSidebarOpen }) => {
    const { logout, appMode, activeGroup, unreadCount, markAsSeen } = useContext(AuthContext);

    return (
        <header className="bg-card px-6 h-16 flex items-center justify-between border-b border-slate-100 sticky top-0 z-10">
            {/* Left side: Menu toggle and Title */}
            {/* Left side: App name on mobile / Dynamic Portal title on desktop */}
            <div className="flex items-center gap-3">
                {/* Mobile App logo and name */}
                <div className="flex items-center gap-2 md:hidden">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-indigo-600 rounded-lg flex items-center justify-center shadow-sm p-1.5">
                        <span className="font-bold text-white text-sm">E</span>
                    </div>
                    <span className="font-bold text-base bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent tracking-tight">Expentra</span>
                </div>

                {/* Desktop Portal/Group Title */}
                <div className="hidden md:flex flex-col">
                    <h2 className="text-base md:text-lg font-bold text-textColor capitalize tracking-tight">
                        {appMode === 'group' && activeGroup ? activeGroup.name : `${user?.role} Portal`}
                    </h2>
                </div>
 
                {appMode === 'group' && (
                    <Link
                        to="/groups"
                        className="ml-2 btn-secondary py-1.5 px-3 text-xs md:text-sm hidden sm:flex items-center"
                    >
                        Switch Group
                    </Link>
                )}
            </div>
 
            {/* Right side: Notifications, Profile, and Logout */}
            <div className="flex items-center gap-4">
 
                {/* Notifications and Profile */}
                <div className="flex items-center gap-4 border-r border-slate-100 pr-4">
                    <Link
                        to="/alerts"
                        onClick={markAsSeen}
                        className="relative p-2 text-textColor hover:bg-slate-50 rounded-lg transition-all duration-200"
                    >
                        <MdNotifications className="w-5.5 h-5.5 text-textColor/80" />
                        {unreadCount > 0 && (
                            <span className="absolute top-0.5 right-0.5 flex h-4.5 w-4.5">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-danger opacity-75 animate-ping"></span>
                                <span className="relative inline-flex rounded-full h-4.5 w-4.5 bg-danger text-[10px] font-bold flex items-center justify-center text-white">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            </span>
                        )}
                    </Link>
 
                    <div className="flex items-center gap-2">
                        <MdAccountCircle className="h-8 w-8 text-primary" />
                        <div className="hidden lg:block text-left">
                            <p className="text-xs md:text-sm font-semibold text-textColor">Hi, {user?.name}</p>
                        </div>
                    </div>
                </div>
 
                {/* Logout Button */}
                <button
                    onClick={logout}
                    className="btn-primary py-1.5 px-3.5 text-xs md:text-sm"
                >
                    <MdLogout className="h-4.5 w-4.5" />
                    <span className="hidden sm:inline-block">Logout</span>
                </button>
            </div>
        </header>
    );
};

export default Navbar;