import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext, API } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import {
    MdHandshake,
    MdAccountBalanceWallet,
    MdCallMade,
    MdCallReceived,
    MdCheckCircle,
    MdPriorityHigh,
    MdPayment,
    MdClose
} from 'react-icons/md';

const Settlement = () => {
    const { selectedGroupId, user } = useContext(AuthContext);
    const [data, setData] = useState(null);
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSettlement, setSelectedSettlement] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paying, setPaying] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [groupRes, settleRes] = await Promise.all([
                axios.get(`${API}/groups/${selectedGroupId}`),
                axios.get(`${API}/group-expenses/${selectedGroupId}/settlements`)
            ]);
            setGroupData(groupRes.data);
            setData(settleRes.data);
        } catch (error) {
            toast.error("Failed to load settlements");
        } finally {
            setLoading(false);
        }
    }, [selectedGroupId]);

    useEffect(() => {
        if (!selectedGroupId) return;
        fetchData();
    }, [selectedGroupId, fetchData]);

    // ── Mark paid: per-expense sub-document settlement ──────────────────────
    const handleMarkAsPaid = async () => {
        if (!selectedSettlement) return;
        setPaying(true);
        try {
            await axios.patch(
                `${API}/group-expenses/${selectedGroupId}/settlements/${selectedSettlement.expenseId}/${selectedSettlement._id}/paid`,
                { paymentMethod }
            );
            toast.success("Settlement recorded!");
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Failed to record payment");
        } finally {
            setPaying(false);
        }
    };

    // ── Mark paid: optimized (computed) net-debt settlement ─────────────────
    const handleMarkOptimizedAsPaid = async () => {
        if (!selectedSettlement) return;
        setPaying(true);
        try {
            const res = await axios.post(
                `${API}/group-expenses/${selectedGroupId}/settlements/optimized/pay`,
                {
                    from: selectedSettlement.from,
                    to:   selectedSettlement.to,
                    amount: selectedSettlement.amount,
                    paymentMethod,
                    settlementDocId: selectedSettlement._id || null,
                }
            );

            toast.success("Payment recorded!");
            setIsModalOpen(false);

            // Optimistic update — flip the card immediately without full reload
            const docId = res.data?._id;
            setData(prev => {
                if (!prev) return prev;
                const updatedPending = prev.pendingReimbursements.filter(s => {
                    const key = s._id || s.tempId;
                    const selKey = selectedSettlement._id || selectedSettlement.tempId;
                    return key !== selKey;
                });
                const newPaid = [
                    ...prev.paidReimbursements,
                    {
                        ...selectedSettlement,
                        _id: docId || selectedSettlement._id,
                        reimbursementStatus: 'paid',
                        isOptimized: true,
                        paymentMethod,
                        paymentDate: new Date().toISOString(),
                    }
                ];
                return {
                    ...prev,
                    pendingReimbursements: updatedPending,
                    optimizedSettlements: updatedPending,
                    paidReimbursements: newPaid,
                };
            });
        } catch (error) {
            toast.error("Failed to record payment");
            fetchData(); // fallback: re-sync from server
        } finally {
            setPaying(false);
        }
    };

    const openModal = (settlement) => {
        setSelectedSettlement(settlement);
        setPaymentMethod('cash');
        setIsModalOpen(true);
    };

    if (!selectedGroupId) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="bg-card rounded-lg border border-background p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-4">
                        <MdHandshake className="w-8 h-8 text-primary" />
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
                    <div className="h-32 bg-card rounded-lg animate-pulse"></div>
                    <div className="h-24 bg-card rounded-lg animate-pulse"></div>
                    <div className="h-24 bg-card rounded-lg animate-pulse"></div>
                </div>
            </div>
        );
    }

    const {
        balances = [],
        totalOwedToUser = 0,
        totalUserOwes = 0,
        pendingReimbursements = [],
        overdueReimbursements = []
    } = data || {};

    // ── Settlement Card ──────────────────────────────────────────────────────
    const SettlementCard = ({ settlement, status }) => {
        const userId = user?._id || user?.id;
        const isFromMe = settlement.from.user?.toString() === userId;
        const isToMe   = settlement.to.user?.toString()   === userId;
        const isOpt    = settlement.isOptimized;

        return (
            <div className="card-premium flex flex-col justify-between">
                <div className="mb-2">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                                {isFromMe ? (
                                    <MdCallMade className="w-4 h-4 text-danger" />
                                ) : isToMe ? (
                                    <MdCallReceived className="w-4 h-4 text-success" />
                                ) : (
                                    <MdHandshake className="w-4 h-4 text-primary" />
                                )}
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-textMuted/60 uppercase tracking-wider leading-none">
                                    {isFromMe ? `You owe ${settlement.to.name}` :
                                        isToMe ? `${settlement.from.name} owes you` :
                                            `${settlement.from.name} → ${settlement.to.name}`}
                                </p>
                                <h4 className={`text-base font-bold tracking-tight mt-0.5 ${isFromMe ? 'text-danger' : isToMe ? 'text-success' : 'text-textColor'}`}>
                                    ₹{settlement.amount.toLocaleString()}
                                </h4>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-0.5">
                            {status === 'overdue' && (
                                <div className="px-1.5 py-0.5 bg-danger/10 text-danger rounded text-[7px] font-bold uppercase tracking-wider">
                                    Overdue
                                </div>
                            )}
                            {isOpt && status !== 'paid' && (
                                <div className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[7px] font-bold uppercase tracking-wider">
                                    Net Optimized
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Action area ────────────────────────────────────────── */}
                {status !== 'paid' && (
                    <div className="mt-auto pt-1">
                        {/* Per-expense settlement: always show button if there's an expenseId */}
                        {!isOpt && settlement.expenseId && (
                            <button
                                onClick={() => openModal(settlement)}
                                className="btn-primary w-full py-1 text-xs font-semibold"
                            >
                                <MdPayment className="text-xs" /> Record Payment
                            </button>
                        )}

                        {/* Optimized settlement: show button only for the person who owes */}
                        {isOpt && isFromMe && (
                            <button
                                onClick={() => openModal(settlement)}
                                className="btn-primary w-full py-1 text-xs font-semibold"
                            >
                                <MdPayment className="text-xs" /> Mark as Paid
                            </button>
                        )}

                        {/* Optimized settlement: payee sees a "waiting" badge */}
                        {isOpt && !isFromMe && !isToMe && (
                            <div className="flex items-center justify-center gap-1 py-1 text-primary/70 bg-primary/5 rounded border border-primary/10">
                                <MdCheckCircle className="text-xs" />
                                <span className="text-[8px] font-bold uppercase tracking-wider">Optimized Net Debt</span>
                            </div>
                        )}

                        {/* Payee side of optimized debt — waiting for payment */}
                        {isOpt && isToMe && (
                            <div className="flex items-center justify-center gap-1 py-1 text-success/70 bg-success/5 rounded border border-success/10">
                                <MdCallReceived className="text-xs" />
                                <span className="text-[8px] font-bold uppercase tracking-wider">Awaiting Payment</span>
                            </div>
                        )}
                    </div>
                )}

                {status === 'paid' && (
                    <div className="flex items-center justify-center gap-1 py-1 text-success bg-success/5 border border-success/10 rounded mt-auto">
                        <MdCheckCircle className="text-xs" />
                        <span className="text-[8px] font-bold uppercase tracking-wider">Settled</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4 bg-transparent pb-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="h1-premium">Settlements</h1>
                    <p className="small-premium mt-0.5 uppercase tracking-wider font-semibold">
                        Group: {groupData?.name || 'Active Group'}
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="card-premium flex items-start gap-3">
                    <div className="bg-success/10 p-2 rounded-lg">
                        <MdCallReceived className="text-success text-lg" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-textMuted uppercase tracking-wide">Total Receivable</p>
                        <p className="text-lg md:text-xl font-bold text-success mt-0.5">₹{totalOwedToUser.toLocaleString()}</p>
                        <p className="text-[9px] text-textMuted/60 uppercase mt-0.5">Expected reimbursement</p>
                    </div>
                </div>

                <div className="card-premium flex items-start gap-3">
                    <div className="bg-danger/10 p-2 rounded-lg">
                        <MdCallMade className="text-danger text-lg" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-textMuted uppercase tracking-wide">Total Payable</p>
                        <p className="text-lg md:text-xl font-bold text-danger mt-0.5">₹{totalUserOwes.toLocaleString()}</p>
                        <p className="text-[9px] text-textMuted/60 uppercase mt-0.5">To be settled by you</p>
                    </div>
                </div>
            </div>

            {/* Overdue / Pending / Optimized Sections */}
            <div className="space-y-4">
                {overdueReimbursements.length > 0 && (
                    <div>
                        <div className="flex items-center gap-1.5 mb-2 px-1">
                            <div className="w-1 h-3 bg-danger rounded-full" />
                            <h3 className="h3-premium !text-xs uppercase tracking-wider">Overdue Payments</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {overdueReimbursements.map(s => (
                                <SettlementCard key={s._id} settlement={s} status="overdue" />
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <div className="flex items-center gap-1.5 mb-2 px-1">
                        <div className="w-1 h-3 bg-primary rounded-full" />
                        <h3 className="h3-premium !text-xs uppercase tracking-wider">Optimized Settlements</h3>
                    </div>

                    {pendingReimbursements.length === 0 && overdueReimbursements.length === 0 ? (
                        <div className="card-premium py-8 text-center">
                            <MdCheckCircle className="w-10 h-10 text-success/30 mx-auto mb-2" />
                            <h4 className="text-sm font-bold text-textColor">All Settled!</h4>
                            <p className="small-premium mt-0.5 uppercase tracking-wide">You are all squared with the group.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {pendingReimbursements.map(s => (
                                <SettlementCard
                                    key={s._id || s.tempId}
                                    settlement={s}
                                    status="pending"
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Net Balance Breakdown Table */}
            <div className="card-premium !p-0 overflow-hidden mb-8">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-xs font-bold text-textColor uppercase tracking-wider flex items-center gap-1.5">
                        <MdAccountBalanceWallet className="text-primary text-base" /> Group Net Balances
                    </h3>
                    <span className="text-[9px] font-bold text-textMuted/60 uppercase tracking-widest">{balances.length} Members</span>
                </div>
                <div className="divide-y divide-slate-100">
                    {balances.map((bal, idx) => {
                        const amt = bal.balance;
                        const isPos = amt > 0.01;
                        const isNeg = amt < -0.01;
                        return (
                            <div key={idx} className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50/30 transition-all duration-200">
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm ${
                                        isPos ? 'bg-success/10 text-success' :
                                        isNeg ? 'bg-danger/10 text-danger' :
                                            'bg-slate-100 text-textMuted/50'
                                    }`}>
                                        {bal.memberInfo.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-textColor">{bal.memberInfo.name}</p>
                                        <p className="text-[8px] font-bold text-textMuted/60 uppercase tracking-wider">
                                            {isPos ? 'Receivable' : isNeg ? 'Payable' : 'Settled'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-bold ${
                                        isPos ? 'text-success' :
                                        isNeg ? 'text-danger' :
                                            'text-textColor/30'
                                    }`}>
                                        {isPos ? '+' : ''}₹{Math.abs(amt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Settlement Modal */}
            {isModalOpen && selectedSettlement && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-sm rounded-xl shadow-xl overflow-hidden border border-slate-100">
                        <div className="px-4 py-2.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xs font-bold text-textColor uppercase tracking-wider">Confirm Settlement</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-textMuted/60 hover:text-textColor transition-colors"
                            >
                                <MdClose className="text-lg" />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-[8px] font-bold text-textMuted/60 uppercase tracking-wider mb-0.5">
                                    Settling to {selectedSettlement?.to.name}
                                </p>
                                <h2 className="text-xl font-bold text-textColor">
                                    ₹{selectedSettlement?.amount.toLocaleString()}
                                </h2>
                                {selectedSettlement?.isOptimized && (
                                    <p className="text-[8px] text-primary/80 mt-0.5 font-semibold uppercase tracking-wider">Optimized Net Debt</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="label-premium">
                                    Payment Method
                                </label>
                                <div className="space-y-1">
                                    {['cash', 'upi', 'bank_transfer'].map(method => (
                                        <button
                                            key={method}
                                            onClick={() => setPaymentMethod(method)}
                                            className={`w-full px-3 py-1.5 rounded-lg border text-left transition-all duration-200 flex items-center justify-between ${
                                                paymentMethod === method
                                                    ? 'border-primary bg-primary/5 text-primary'
                                                    : 'border-slate-200 text-textMuted bg-card hover:bg-slate-50'
                                                }`}
                                        >
                                            <span className="text-xs font-bold uppercase tracking-wide">
                                                {method.replace('_', ' ')}
                                            </span>
                                            {paymentMethod === method && (
                                                <MdCheckCircle className="text-primary text-base" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={selectedSettlement.isOptimized ? handleMarkOptimizedAsPaid : handleMarkAsPaid}
                                disabled={paying}
                                className="btn-primary w-full py-2 text-xs font-bold uppercase tracking-wider"
                            >
                                {paying ? 'Recording…' : 'Record Payment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settlement;