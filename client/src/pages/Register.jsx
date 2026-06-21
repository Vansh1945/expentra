import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext, API } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import PublicNavbar from '../components/PublicNavbar';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { FcGoogle } from 'react-icons/fc';

import logoImg from '../assets/logo.png';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'personal',
    });

    const { login, user, token } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (token && user) {
            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard');
            }
        }
    }, [token, user, navigate]);

    useEffect(() => {
        const checkRedirectResult = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result?.user) {
                    sessionStorage.removeItem('isGoogleRedirecting');
                    const user = result.user;
                    const res = await axios.post(`${API}/auth/google`, {
                        name: user.displayName,
                        email: user.email,
                        photoURL: user.photoURL,
                    });

                    const { token, role } = res.data;
                    login(token, res.data, role);
                    toast.success('Registration via Google successful!');
                    if (role === 'admin') {
                        navigate('/admin/dashboard');
                    } else {
                        navigate('/dashboard');
                    }
                } else if (sessionStorage.getItem('isGoogleRedirecting') === 'true') {
                    sessionStorage.removeItem('isGoogleRedirecting');
                    toast.error('Google Sign-in failed because your browser blocked third-party storage. Please allow popups in the URL bar and try again.');
                }
            } catch (error) {
                sessionStorage.removeItem('isGoogleRedirecting');
                console.error("Google redirect registration error:", error);
                toast.error(error.response?.data?.message || 'Google signup failed. Please try again.');
            }
        };
        checkRedirectResult();
    }, [navigate, login]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API}/auth/register`, formData);
            const { token, role } = res.data;
            login(token, res.data, role);
            toast.success('Registration successful! Welcome.');
            if (role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
            console.error(error);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            const res = await axios.post(`${API}/auth/google`, {
                name: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
            });

            const { token, role } = res.data;
            login(token, res.data, role);
            toast.success('Registration via Google successful!');
            
            if (role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            if (error.code === 'auth/popup-closed-by-user') {
                toast.warning('Authentication cancelled');
            } else if (error.code === 'auth/popup-blocked') {
                sessionStorage.setItem('isGoogleRedirecting', 'true');
                toast.info('Popup blocked. Redirecting to Google sign in...');
                try {
                    await signInWithRedirect(auth, googleProvider);
                } catch (redirectError) {
                    sessionStorage.removeItem('isGoogleRedirecting');
                    toast.error('Failed to redirect. Please enable popups or try a different browser.');
                    console.error(redirectError);
                }
            } else {
                toast.error(error.response?.data?.message || 'Google signup failed. Please try again.');
                console.error(error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <PublicNavbar />

            <div className="flex-grow flex items-center justify-center py-4 px-3">
                <div className="w-full max-w-3xl bg-card rounded-xl shadow-md border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[400px]">

                    {/* Visual Identity Panel */}
                    <div className="hidden md:flex md:w-[42%] bg-gradient-to-br from-primary to-indigo-800 p-6 text-white flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mt-24 blur-2xl" />
                        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mb-24 blur-2xl" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-6">
                                <img src={logoImg} alt="FinVibe Logo" className="h-12 object-contain bg-white rounded-lg p-1 shadow-sm" />
                            </div>
 
                            <h2 className="text-xl font-bold leading-tight mb-2">
                                Create Your <br />
                                <span className="text-success bg-white/10 px-1.5 py-0.5 rounded-md">Free Account.</span>
                            </h2>
                            <p className="text-[11px] text-white/70 leading-relaxed max-w-[180px]">
                                Start tracking your money and expenses in seconds.
                            </p>
                        </div>
 
                        <div className="relative z-10 space-y-2">
                            <div className="flex items-center gap-2.5 bg-white/10 p-2.5 rounded-lg border border-white/5">
                                <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center text-[10px] font-bold text-white">✓</div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/90">Bank Grade Security</p>
                            </div>
                            <div className="flex items-center gap-2.5 bg-white/10 p-2.5 rounded-lg border border-white/5 opacity-70">
                                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold text-white">✓</div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/90">100% Privacy Choice</p>
                            </div>
                        </div>
                    </div>
 
                    {/* Registration Form Panel */}
                    <div className="w-full md:w-[58%] p-6 lg:p-8 flex flex-col justify-center bg-card">
                        <div className="max-w-sm mx-auto w-full">
                            <div className="mb-4">
                                <h1 className="h2-premium mb-0.5">Create Account</h1>
                                <p className="text-[10px] text-textMuted uppercase tracking-wider font-semibold">
                                    Join the FinVibe family
                                </p>
                            </div>
 
                            <form className="space-y-3.5" onSubmit={handleSubmit}>
                                <div>
                                    <label className="label-premium">
                                        Name
                                    </label>
                                    <input
                                        name="name"
                                        type="text"
                                        className="input-premium"
                                        placeholder="Your Name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
 
                                <div>
                                    <label className="label-premium">
                                        Email
                                    </label>
                                    <input
                                        name="email"
                                        type="email"
                                        className="input-premium"
                                        placeholder="your@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
 
                                <div>
                                    <label className="label-premium">
                                        Password
                                    </label>
                                    <input
                                        name="password"
                                        type="password"
                                        className="input-premium"
                                        placeholder="••••••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
 
                                <button
                                    type="submit"
                                    className="btn-primary w-full py-2 text-xs font-bold uppercase tracking-wider mt-1"
                                >
                                    Create Account
                                </button>
                            </form>
 
                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-100"></div>
                                </div>
                                <div className="relative flex justify-center text-[9px] uppercase">
                                    <span className="bg-card px-2 text-textMuted/60 font-semibold tracking-wider">Or continue with</span>
                                </div>
                            </div>
 
                            <button
                                onClick={handleGoogleLogin}
                                className="btn-secondary w-full py-2 text-xs font-bold uppercase tracking-wider"
                            >
                                <FcGoogle className="text-sm" />
                                <span>Google</span>
                            </button>
 
                            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                                <div className="text-left w-full sm:w-auto">
                                    <p className="text-[9px] text-textMuted/60 uppercase tracking-wider mb-0.5">Already have an account?</p>
                                    <p className="text-[11px] font-semibold text-textColor">Login to your account</p>
                                </div>
                                <Link
                                    to="/login"
                                    className="btn-success text-xs px-3 py-1.5 w-full sm:w-auto text-center"
                                >
                                    Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;