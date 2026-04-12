import React, { useState, useRef, useEffect } from 'react';
import { Settings, QrCode, Lock, Copy, Check } from 'lucide-react';
import QR from 'qrcode';
import { useTaskStore } from '../store/taskStore';

export default function SettingsView() {
    const store = useTaskStore();
    const activeChildId = store.activeChildId;
    const activeChild = activeChildId ? store.children.find((c) => c.id === activeChildId) : null;

    const childQRRef = useRef<HTMLCanvasElement>(null);
    const appQRRef = useRef<HTMLCanvasElement>(null);

    const [showChildQR, setShowChildQR] = useState(false);
    const [showAppQR, setShowAppQR] = useState(false);
    const [showPinChange, setShowPinChange] = useState(false);
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [pinError, setPinError] = useState('');
    const [copied, setCopied] = useState<'childurl' | 'appurl' | null>(null);

    const appUrl = window.location.origin;
    const childUrl = activeChildId ? `${appUrl}?child=${activeChildId}` : '';

    // Generate QR codes when they're shown
    useEffect(() => {
        if (showChildQR && childQRRef.current) {
            QR.toCanvas(childQRRef.current, childUrl, { width: 256 });
        }
    }, [showChildQR, childUrl]);

    useEffect(() => {
        if (showAppQR && appQRRef.current) {
            QR.toCanvas(appQRRef.current, appUrl, { width: 256 });
        }
    }, [showAppQR, appUrl]);

    const handleCopyUrl = (url: string, type: 'childurl' | 'appurl') => {
        navigator.clipboard.writeText(url);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleChangePIN = (e: React.FormEvent) => {
        e.preventDefault();
        setPinError('');

        if (!newPin) {
            setPinError('Please enter a new PIN');
            return;
        }

        if (!/^\d{4,6}$/.test(newPin)) {
            setPinError('PIN must be 4-6 digits');
            return;
        }

        if (newPin !== confirmPin) {
            setPinError('PINs do not match');
            return;
        }

        if (activeChild && activeChildId) {
            store.updateChild(activeChildId, { pin: newPin });
            setNewPin('');
            setConfirmPin('');
            setShowPinChange(false);
        }
    };

    const handleRemovePIN = () => {
        if (activeChild && activeChildId && confirm('Remove PIN protection from this child?')) {
            store.updateChild(activeChildId, { pin: undefined });
        }
    };

    if (!activeChildId || !activeChild) {
        return <div className="p-4 text-gray-500">Please select a child first</div>;
    }

    return (
        <div className="space-y-6">
            {/* Settings Header */}
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                    <Settings size={24} className="text-gray-600" />
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
                        <p className="text-sm text-gray-600">Manage {activeChild.name}'s security and sharing</p>
                    </div>
                </div>
            </div>

            {/* PIN Security Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Lock size={20} className="text-blue-600" />
                        <h3 className="font-semibold text-gray-800">PIN Protection</h3>
                    </div>
                    <span
                        className={`text-sm px-3 py-1 rounded-full ${
                            activeChild.pin ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                        {activeChild.pin ? '🔒 Protected' : 'Unprotected'}
                    </span>
                </div>

                {activeChild.pin && <p className="text-sm text-gray-600 mb-4">This child is protected with a PIN</p>}

                <div className="space-y-3">
                    {!showPinChange ? (
                        <>
                            {activeChild.pin && (
                                <button
                                    onClick={() => setShowPinChange(true)}
                                    className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition"
                                >
                                    Change PIN
                                </button>
                            )}
                            {activeChild.pin && (
                                <button
                                    onClick={handleRemovePIN}
                                    className="w-full px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded font-medium transition"
                                >
                                    Remove PIN
                                </button>
                            )}
                            {!activeChild.pin && (
                                <button
                                    onClick={() => setShowPinChange(true)}
                                    className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-medium transition"
                                >
                                    Add PIN
                                </button>
                            )}
                        </>
                    ) : (
                        <form onSubmit={handleChangePIN} className="space-y-3">
                            {pinError && (
                                <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded">{pinError}</div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New PIN</label>
                                <input
                                    type="password"
                                    value={newPin}
                                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                                    placeholder="0000"
                                    maxLength={6}
                                    className="w-full px-3 py-2 border rounded text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm PIN</label>
                                <input
                                    type="password"
                                    value={confirmPin}
                                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                                    placeholder="0000"
                                    maxLength={6}
                                    className="w-full px-3 py-2 border rounded text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-medium transition"
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPinChange(false);
                                        setNewPin('');
                                        setConfirmPin('');
                                        setPinError('');
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded font-medium transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* QR Code Sharing Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <QrCode size={20} className="text-purple-600" />
                    <h3 className="font-semibold text-gray-800">Share with QR Code</h3>
                </div>

                <div className="space-y-4">
                    {/* Child-Specific QR Code */}
                    <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-700 mb-3">Child Data Link</h4>
                        <p className="text-sm text-gray-600 mb-3">
                            Share this QR code to let others access {activeChild.name}'s data directly
                        </p>
                        <button
                            onClick={() => setShowChildQR(!showChildQR)}
                            className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded font-medium transition"
                        >
                            {showChildQR ? 'Hide' : 'Show'} Child QR Code
                        </button>
                        {showChildQR && (
                            <div className="mt-4 flex flex-col items-center gap-3">
                                <div className="p-4 bg-white border-2 border-purple-200 rounded">
                                    <canvas ref={childQRRef} />
                                </div>
                                <div className="w-full">
                                    <p className="text-xs text-gray-600 mb-2">URL:</p>
                                    <div className="flex gap-2">
                                        <input type="text" value={childUrl} readOnly className="flex-1 px-3 py-2 bg-gray-100 border rounded text-sm" />
                                        <button
                                            onClick={() => handleCopyUrl(childUrl, 'childurl')}
                                            className={`px-3 py-2 rounded transition ${
                                                copied === 'childurl' ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                                            }`}
                                        >
                                            {copied === 'childurl' ? <Check size={16} /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* App-Only QR Code */}
                    <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-700 mb-3">App Link</h4>
                        <p className="text-sm text-gray-600 mb-3">
                            Share this QR code to let others access the app (without selecting a specific child)
                        </p>
                        <button
                            onClick={() => setShowAppQR(!showAppQR)}
                            className="w-full px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded font-medium transition"
                        >
                            {showAppQR ? 'Hide' : 'Show'} App QR Code
                        </button>
                        {showAppQR && (
                            <div className="mt-4 flex flex-col items-center gap-3">
                                <div className="p-4 bg-white border-2 border-indigo-200 rounded">
                                    <canvas ref={appQRRef} />
                                </div>
                                <div className="w-full">
                                    <p className="text-xs text-gray-600 mb-2">URL:</p>
                                    <div className="flex gap-2">
                                        <input type="text" value={appUrl} readOnly className="flex-1 px-3 py-2 bg-gray-100 border rounded text-sm" />
                                        <button
                                            onClick={() => handleCopyUrl(appUrl, 'appurl')}
                                            className={`px-3 py-2 rounded transition ${
                                                copied === 'appurl' ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                                            }`}
                                        >
                                            {copied === 'appurl' ? <Check size={16} /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">About</h3>
                <div className="space-y-2 text-sm text-gray-600">
                    <p>
                        <strong>App:</strong> Kids Task Tracker v1.0
                    </p>
                    <p>
                        <strong>Storage:</strong> Local (with optional backend sync)
                    </p>
                    <p>
                        <strong>Features:</strong> Tasks, Activities, Budget tracking, QR sharing
                    </p>
                    <p>
                        <strong>Progressive Web App:</strong> Works offline and can be installed
                    </p>
                </div>
            </div>
        </div>
    );
}
