import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { MdArrowBack, MdCalculate } from 'react-icons/md';

const AddGroupExpense = () => {
    const navigate = useNavigate();
    const { selectedGroupId } = useContext(AuthContext);
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [paidByAmounts, setPaidByAmounts] = useState({});

    // For calculating settlement preview locally
    const [previewSettlements, setPreviewSettlements] = useState(null);

    useEffect(() => {
        if (!selectedGroupId) {
            navigate('/groups');
            return;
        }
        const fetchGroup = async () => {
            try {
                const res = await api.get(`/groups/${selectedGroupId}`);
                setGroupData(res.data);
                // Initialize paid amounts to 0
                const initialPaid = {};
                res.data.members.forEach(m => {
                    const id = m.user ? m.user.toString() : m.name;
                    initialPaid[id] = 0;
                });
                setPaidByAmounts(initialPaid);
            } catch (error) {
                toast.error("Failed to load group data");
            } finally {
                setLoading(false);
            }
        };
        fetchGroup();
    }, [selectedGroupId, navigate]);

    const handlePaidChange = (id, val) => {
        setPaidByAmounts({
            ...paidByAmounts,
            [id]: val === '' ? '' : Number(val)
        });
    };

    const handleCalculate = (e) => {
        e.preventDefault();
        if (!amount || Number(amount) <= 0) {
            return toast.error("Please enter a valid total expense amount.");
        }

        const totalPaid = Object.values(paidByAmounts).reduce((a, b) => a + (Number(b) || 0), 0);
        if (Math.abs(totalPaid - Number(amount)) > 0.01) {
            return toast.error(`Total paid (₹${totalPaid}) must equal the total expense (₹${amount}).`);
        }

        if (!title) {
            return toast.error("Please enter a title.");
        }

        // Preview local calculation
        const numMembers = groupData.members.length;
        const equalShare = Math.round((Number(amount) / numMembers) * 100) / 100;

        const balances = {};
        groupData.members.forEach(m => {
            const id = m.user ? m.user.toString() : m.name;
            const paid = Number(paidByAmounts[id]) || 0;
            balances[id] = {
                memberInfo: m,
                balance: Math.round((paid - equalShare) * 100) / 100
            };
        });

        const debtors = [];
        const creditors = [];

        Object.keys(balances).forEach(id => {
            const bal = balances[id];
            if (bal.balance < 0) debtors.push({ ...bal, identifier: id });
            else if (bal.balance > 0) creditors.push({ ...bal, identifier: id });
        });

        debtors.sort((a, b) => a.balance - b.balance);
        creditors.sort((a, b) => b.balance - a.balance);

        const simplifiedDebts = [];
        let i = 0, j = 0;

        while (i < debtors.length && j < creditors.length) {
            const debtor = debtors[i];
            const creditor = creditors[j];

            let amountToSettle = Math.min(Math.abs(debtor.balance), creditor.balance);
            amountToSettle = Math.round(amountToSettle * 100) / 100;

            simplifiedDebts.push({
                from: debtor.memberInfo,
                to: creditor.memberInfo,
                amount: amountToSettle,
            });

            debtor.balance = Math.round((debtor.balance + amountToSettle) * 100) / 100;
            creditor.balance = Math.round((creditor.balance - amountToSettle) * 100) / 100;

            if (Math.abs(debtor.balance) === 0) i++;
            if (creditor.balance === 0) j++;
        }

        setPreviewSettlements(simplifiedDebts);
    };

    const handleSubmit = async () => {
        const totalPaid = Object.values(paidByAmounts).reduce((a, b) => a + (Number(b) || 0), 0);
        if (Math.abs(totalPaid - Number(amount)) > 0.01) {
            return toast.error("Split sum does not match exact total visually.");
        }

        const paidBy = groupData.members
            .filter(m => {
                const id = m.user ? m.user.toString() : m.name;
                return Number(paidByAmounts[id]) > 0;
            })
            .map(m => {
                const id = m.user ? m.user.toString() : m.name;
                return {
                    user: m.user || null,
                    name: m.name,
                    amount: Number(paidByAmounts[id])
                };
            });

        const splitBetween = groupData.members.map(m => {
            const numMembers = groupData.members.length;
            const splitAmt = Math.round((Number(amount) / numMembers) * 100) / 100;

            return {
                user: m.user || null,
                name: m.name,
                amount: splitAmt
            };
        });

        // ensure strict equal split sums correctly to avoid trailing cent error
        let currentSplitSum = splitBetween.reduce((a, b) => a + b.amount, 0);
        if (currentSplitSum !== Number(amount)) {
            // Adjust the first member to take the extra cent
            splitBetween[0].amount = Math.round((splitBetween[0].amount + (Number(amount) - currentSplitSum)) * 100) / 100;
        }

        try {
            await api.post('/group-expenses', {
                groupId: selectedGroupId,
                title,
                amount: Number(amount),
                paidBy,
                splitBetween
            });
            toast.success("Expense added successfully");
            navigate('/groups/expenses');
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add expense");
        }
    };

    if (loading) return <div className="p-8">Loading group...</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center space-x-4 mb-6">
                <button onClick={() => navigate('/groups/expenses')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                    <MdArrowBack className="w-6 h-6 text-gray-700" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Add Group Expense</h1>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <form className="space-y-6" onSubmit={handleCalculate}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expense Title</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500" placeholder="e.g. Dinner" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Total Expense Amount (₹)</label>
                            <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required min="1" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500" />
                        </div>
                    </div>

                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Who Paid How Much?</h3>
                        <p className="text-sm text-gray-500 mb-4">Enter how much each member paid. The total must equal the expense amount.</p>

                        <div className="space-y-3">
                            {groupData?.members.map(m => {
                                const id = m.user ? m.user.toString() : m.name;
                                return (
                                    <div key={id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                        <span className="font-medium text-gray-700">{m.name}</span>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-gray-500">₹</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={paidByAmounts[id] === 0 && !amount ? '' : paidByAmounts[id]}
                                                onChange={(e) => handlePaidChange(id, e.target.value)}
                                                className="w-32 px-3 py-1 border border-gray-300 rounded bg-white shadow-sm"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="pt-4 border-t flex flex-col items-center">
                        <button type="submit" className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center justify-center text-lg transition shadow-lg hover:shadow-xl">
                            <MdCalculate className="mr-2 w-6 h-6" /> Calculate Settlement
                        </button>
                    </div>
                </form>
            </div>

            {previewSettlements && (
                <div className="bg-white p-6 rounded-xl shadow border-t-4 border-green-500">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Preview Settlement</h2>

                    {previewSettlements.length === 0 ? (
                        <p className="text-green-600 font-medium py-2">Everyone is settled automatically for this expense!</p>
                    ) : (
                        <div className="space-y-3 mb-6">
                            {previewSettlements.map((debt, index) => (
                                <div key={index} className="flex flex-col sm:flex-row items-center p-3 bg-green-50 rounded-lg border border-green-100">
                                    <div className="flex-1 flex items-center mb-2 sm:mb-0">
                                        <span className="font-semibold text-gray-900 mx-2">{debt.from.name}</span>
                                        <span className="text-gray-600">pays</span>
                                        <span className="font-semibold text-gray-900 mx-2">{debt.to.name}</span>
                                    </div>
                                    <div className="font-bold text-green-700 bg-white px-4 py-1 rounded-full shadow-sm border border-green-200">
                                        ₹{debt.amount.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-end gap-4 mt-6">
                        <button onClick={() => setPreviewSettlements(null)} className="px-6 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">
                            Edit Amounts
                        </button>
                        <button onClick={handleSubmit} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-md hover:shadow-lg transition">
                            Confirm & Save Expense
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddGroupExpense;
