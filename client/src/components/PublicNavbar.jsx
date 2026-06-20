import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MdMenu, MdClose } from 'react-icons/md';

import logoImg from '../assets/logo.png';

const PublicNavbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { pathname } = useLocation();

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Dashboard', path: '/dashboard' },
    ];

    const isActive = (path) => {
        if (path === '/') return pathname === '/';
        return pathname.startsWith(path);
    };

    return (
        <nav className="bg-card shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <img src={logoImg} alt="FinVibe Logo" className="h-11 object-contain" />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-sm font-medium transition-colors duration-200 ${
                                    isActive(link.path)
                                        ? 'text-primary'
                                        : 'text-textColor hover:text-primary'
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Link
                            to="/login"
                            className="btn-primary py-1.5 px-4 text-xs font-semibold"
                        >
                            Login
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-textColor p-2 rounded-md hover:bg-slate-50 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <MdClose size={22} /> : <MdMenu size={22} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden bg-card border-t border-slate-100">
                    <div className="px-4 pt-2 pb-4 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    isActive(link.path)
                                        ? 'text-primary bg-primary/5'
                                        : 'text-textColor hover:bg-slate-50 hover:text-primary'
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Link
                            to="/login"
                            onClick={() => setIsMenuOpen(false)}
                            className="block btn-primary text-xs text-center mt-2"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default PublicNavbar;
