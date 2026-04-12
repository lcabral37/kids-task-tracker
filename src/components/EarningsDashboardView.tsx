import React, { useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import BudgetChart from './BudgetChart';

export default function EarningsDashboardView() {
    const store = useTaskStore();
    const activeChildId = store.activeChildId;

    const [adjustmentAmount, setAdjustmentAmount] = useState('');
    const [transferFrom, setTransferFrom] = useState('');
    const [transferTo, setTransferTo] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [showAdjustment, setShowAdjustment] = useState(false);
    const [showTransfer, setShowTransfer] = useState(false);

    const handleAdjustBalance = () => {
        if (!activeChildId || !adjustmentAmount) return;

        const amount = parseFloat(adjustmentAmount);
        if (isNaN(amount)) {
            alert('Please enter a valid amount');
            return;
        }

        store.updateChildBalance(activeChildId, amount);
        setAdjustmentAmount('');
        setShowAdjustment(false);
    };

    const handleTransfer = () => {
        if (!transferFrom || !transferTo || !transferAmount) {
            alert('Please fill in all fields');
            return;
        }

        const amount = parseFloat(transferAmount);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        store.transferBalance(transferFrom, transferTo, amount);
        setTransferFrom('');
        setTransferTo('');
        setTransferAmount('');
        setShowTransfer(false);
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
            store.resetStore();
        }
    };

    if (!activeChildId) {
        return <div className="p-4 text-gray-500">Please select a child first</div>;
    }

    const balance = store.getChildBalance(activeChildId);
    const totalEarned = store.getChildTotalEarnings(activeChildId);
    const totalSpent = store.getChildTotalSpending(activeChildId);
    const child = store.children.find((c) => c.id === activeChildId);

    return (
        <div className="space-y-6">
            {/* Balance Summary */}
            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs text-green-600 uppercase">Total Earned</p>
                    <p className="text-2xl font-bold text-green-700">{totalEarned}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-xs text-red-600 uppercase">Total Spent</p>
                    <p className="text-2xl font-bold text-red-700">{totalSpent}</p>
                </div>
                <div className={`p-4 rounded-lg border ${balance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200'}`}>
                    <p className={`text-xs uppercase ${balance >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>
                        Current Balance
                    </p>
                    <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-700' : 'text-yellow-700'}`}>
                        {balance}
                    </p>
                </div>
            </div>

            {/* Budget Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-semibold mb-4">Budget Trend</h3>
                <BudgetChart childId={activeChildId} />
            </div>

            {/* Manual Balance Adjustment */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <button
                    onClick={() => setShowAdjustment(!showAdjustment)}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                    {showAdjustment ? '▼' : '▶'} Adjust Balance
                </button>
                {showAdjustment && (
                    <div className="mt-4 space-y-3">
                        <p className="text-xs text-gray-600">
                            Current manual adjustment: {child?.manualAdjustment || 0}
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={adjustmentAmount}
                                onChange={(e) => setAdjustmentAmount(e.target.value)}
                                placeholder="Amount (+ or -)"
                                step="0.5"
                                className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={handleAdjustBalance}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Adjust
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Balance Transfer */}
            {store.children.length > 1 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <button
                        onClick={() => setShowTransfer(!showTransfer)}
                        className="text-sm font-semibold text-purple-600 hover:text-purple-800"
                    >
                        {showTransfer ? '▼' : '▶'} Transfer Balance
                    </button>
                    {showTransfer && (
                        <div className="mt-4 space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
                                <select
                                    value={transferFrom}
                                    onChange={(e) => setTransferFrom(e.target.value)}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">Select a child</option>
                                    {store.children.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({store.getChildBalance(c.id)})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
                                <select
                                    value={transferTo}
                                    onChange={(e) => setTransferTo(e.target.value)}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">Select a child</option>
                                    {store.children.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({store.getChildBalance(c.id)})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Amount</label>
                                <input
                                    type="number"
                                    value={transferAmount}
                                    onChange={(e) => setTransferAmount(e.target.value)}
                                    placeholder="0"
                                    min="0"
                                    step="0.5"
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <button
                                onClick={handleTransfer}
                                className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                            >
                                Transfer
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Reset Button */}
            <button
                onClick={handleReset}
                className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium"
            >
                Reset All Data
            </button>
        </div>
    );
}
