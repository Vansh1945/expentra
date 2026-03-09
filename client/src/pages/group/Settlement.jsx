import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { MdHandshake, MdAccountBalanceWallet } from 'react-icons/md';

const Settlement = () => {
    const { selectedGroupId } = useContext(AuthContext);
    const [settlements, setSettlements] = useState(null);
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!selectedGroupId) return;

        const fetchData = async () => {
            try {
                const [groupRes, settleRes] = await Promise.all([
                    api.get(`/groups/${selectedGroupId}`),
                    api.get(`/group-expenses/${selectedGroupId}/settlements`)
                ]);
                setGroupData(groupRes.data);
                setSettlements(settleRes.data);
            } catch (error) {
                toast.error("Failed to load settlements");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedGroupId]);

    if (!selectedGroupId) {
        return <div className="p-8 text-center bg-white rounded-xl shadow mt-8">Please select a group first.</div>;
    }

    if (loading) return <div className="p-8">Loading settlements...</div>;

    const { balances, simplifiedDebts } = settlements || { balances: [], simplifiedDebts: [] };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">{groupData?.name} - Settlement</h1>

            <div className="bg-white rounded-xl shadow p-6 border-t-4 border-indigo-500">
                <h3 className="text-lg font-semibold mb-6 flex items-center">
                    <MdHandshake className="text-indigo-600 mr-2 w-6 h-6" /> Who Owes Whom
                </h3>

                {simplifiedDebts.length === 0 ? (
                    <div className="text-center py-8">
                        <MdAccountBalanceWallet className="w-16 h-16 text-green-300 mx-auto mb-4" />
                        <h4 className="text-xl font-medium text-gray-800">All Settled Up!</h4>
                        <p className="text-gray-500 mt-2">There are no outstanding balances in this group.</p>
                    </div>
                ) : (
                    <div className="space-y-4 max-w-2xl mx-auto">
                        {simplifiedDebts.map((debt, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center text-lg gap-2">
                                    <span className="font-bold text-red-600">{debt.from.name}</span>
                                    <span className="text-gray-500 font-medium">pays</span>
                                    <span className="font-bold text-green-600">{debt.to.name}</span>
                                </div>
                                <div className="font-bold text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 text-lg">
                                    ₹{debt.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Individual Balances</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {balances.map((bal, idx) => {
                        const amount = bal.balance;
                        const isPositive = amount > 0.01;
                        const isNegative = amount < -0.01;

                        return (
                            <div key={idx} className={`p-4 rounded-lg flex justify-between items-center ${isPositive ? 'bg-green-50 border border-green-100' : isNegative ? 'bg-red-50 border border-red-100' : 'bg-gray-50 border border-gray-100'}`}>
                                <span className="font-medium">{bal.memberInfo.name}</span>
                                <span className={`font-bold ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'}`}>
                                    {isPositive ? '+' : ''}{amount === 0 ? 'Settled' : `₹${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Settlement;
