import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import { AuthContext } from '../context/AuthContext';
import { MdAddCircle, MdShowChart, MdPieChart } from 'react-icons/md';

const features = [
    {
        icon: <MdAddCircle className="text-3xl text-primary" />,
        title: 'Add Expense',
        description: 'Easily log your daily expenses with categories and tags to keep everything organized.',
    },
    {
        icon: <MdShowChart className="text-3xl text-success" />,
        title: 'Track Expenses',
        description: 'Monitor your spending habits over time with beautiful, interactive visualizations.',
    },
    {
        icon: <MdPieChart className="text-3xl text-primary" />,
        title: 'Analytics',
        description: 'Get deep insights into your financial health with detailed reports and predictions.',
    },
];

const Home = () => {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            navigate('/dashboard');
        }
    }, [token, navigate]);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <PublicNavbar />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="py-16 px-6 text-center max-w-4xl mx-auto">
                    <h1 className="h1-premium text-3xl md:text-5xl leading-tight mb-4">
                        Manage Your <span className="text-primary bg-primary/5 px-2.5 py-0.5 rounded-lg">Expenses</span> Smartly
                    </h1>
                    <p className="body-premium text-base mb-8 max-w-2xl mx-auto">
                        Take control of your finances with FinVibe. Track spending, set budgets, and achieve your financial goals with ease.
                    </p>
                    <div className="flex justify-center gap-3">
                        <Link
                            to="/register"
                            className="btn-primary px-6 py-2.5 text-sm"
                        >
                            Get Started
                        </Link>
                        <Link
                            to="/dashboard"
                            className="btn-secondary px-6 py-2.5 text-sm"
                        >
                            View Dashboard
                        </Link>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-12 bg-card border-y border-slate-100">
                    <div className="max-w-6xl mx-auto px-6">
                        <h2 className="h2-premium text-center mb-10">
                            Why Choose FinVibe?
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="p-5 rounded-xl bg-background border border-slate-100 hover:shadow-md transition-all duration-300 group"
                                >
                                    <div className="mb-4 transform transition-transform group-hover:scale-105 duration-300">
                                        {feature.icon}
                                    </div>
                                    <h3 className="h3-premium text-base mb-1">
                                        {feature.title}
                                    </h3>
                                    <p className="body-premium text-xs">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-12 px-6">
                    <div className="bg-gradient-to-br from-primary to-indigo-800 rounded-2xl p-8 md:p-12 text-center text-white shadow-lg max-w-4xl mx-auto relative overflow-hidden">
                        <div className="absolute -right-12 -top-12 bg-white/5 w-48 h-48 rounded-full blur-3xl"></div>
                        <div className="relative z-10">
                            <h2 className="text-xl md:text-2xl font-bold mb-2">
                                Ready to Take Charge of Your Finances?
                            </h2>
                            <p className="text-white/80 text-sm mb-6 max-w-2xl mx-auto">
                                Join thousands of users who are already saving more and spending smarter with FinVibe.
                            </p>
                            <Link
                                to="/register"
                                className="inline-block bg-white text-primary px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all duration-200 shadow-sm"
                            >
                                Join Now — It's Free!
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-8 border-t border-slate-100 bg-card text-center">
                <p className="text-xs text-textMuted/60">
                    &copy; 2026 FinVibe. All rights reserved.
                </p>
            </footer>
        </div>
    );
};

export default Home;
