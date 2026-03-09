import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { MdAdd } from 'react-icons/md';

const GroupExpenses = () => {
    const navigate = useNavigate();
    const { selectedGroupId } = useContext(AuthContext);
    const [expenses, setExpenses] = useState([]);
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!selectedGroupId) return;

        const fetchData = async () => {
            try {
                const [expRes, groupRes] = await Promise.all([
                    api.get(`/group-expenses/${selectedGroupId}`),
                    api.get(`/groups/${selectedGroupId}`)
                ]);
                setExpenses(expRes.data);
                setGroupData(groupRes.data);
            } catch (error) {
                toast.error("Failed to load expenses");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedGroupId]);

    if (!selectedGroupId) {
        return <div className="p-8 text-center bg-white rounded-xl shadow mt-8">Please select a group first.</div>;
    }

    if (loading) return <div className="p-8">Loading expenses...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">{groupData?.name} - Expenses</h1>
                <button
                    onClick={() => navigate('/groups/add-expense')}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm hover:shadow-md"
                >
                    <MdAdd className="mr-2" /> Add Expense
                </button>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden tracking-wide text-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-4 font-semibold text-gray-700">Date</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Title</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Paid By</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.map(exp => {
                            // Determine display name for Paid By
                            let paidByDisplay = 'Unknown';
                            if (Array.isArray(exp.paidBy) && exp.paidBy.length > 0) {
                                if (exp.paidBy.length === 1) {
                                    paidByDisplay = exp.paidBy[0].name || 'User';
                                } else {
                                    paidByDisplay = `${exp.paidBy.length} people`;
                                }
                            } else if (exp.paidBy && typeof exp.paidBy === 'string') {
                                paidByDisplay = groupData?.members.find(m => m.user?.toString() === exp.paidBy || m._id?.toString() === exp.paidBy)?.name || 'Unknown';
                            }

                            return (
                                <tr key={exp._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 text-gray-500">{new Date(exp.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{exp.title}</td>
                                    <td className="px-6 py-4 text-gray-600">{paidByDisplay}</td>
                                    <td className="px-6 py-4 text-right font-bold text-gray-900">₹{exp.amount.toLocaleString()}</td>
                                </tr>
                            );
                        })}
                        {expenses.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No expenses added yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GroupExpenses;
