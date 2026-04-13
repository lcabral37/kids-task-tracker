import React, { useState, useRef, useEffect } from 'react';
import { Settings, QrCode, Lock, Copy, Check, Cloud, CloudOff, Globe } from 'lucide-react';
import QR from 'qrcode';
import { useTaskStore } from '../store/taskStore';
import { syncApi, checkBackendConnectivity, getBackendUrl } from '../services/backend';

export default function SettingsView() {
    const store = useTaskStore();
    const activeChildId = store.activeChildId;
    const activeChild = activeChildId ? store.children.find((c) => c.id === activeChildId) : null;

    const childQRRef = useRef<HTMLCanvasElement>(null);
    const appQRRef = useRef<HTMLCanvasElement>(null);

    const [showChildQR, setShowChildQR] = useState(false);
    const [showAppQR, setShowAppQR] = useState(false);
    const [showPinChange, setShowPinChange] = useState(false);
    const [showEditChild, setShowEditChild] = useState(false);
    const [editName, setEditName] = useState(activeChild?.name || '');
    const [editAge, setEditAge] = useState(activeChild?.age || 0);
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [pinError, setPinError] = useState('');
    const [copied, setCopied] = useState<'childurl' | 'appurl' | 'pwaurl' | 'apiurl' | null>(null);
    const [backendConnected, setBackendConnected] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState('');

    const appUrl = window.location.origin;
    const apiUrl = getBackendUrl();
    const childUrl = activeChildId ? `${appUrl}?child=${activeChildId}` : '';

    // Check backend connectivity on mount and periodically
    useEffect(() => {
        const checkConnection = async () => {
            const connected = await checkBackendConnectivity();
            setBackendConnected(connected);
        };

        checkConnection();
        const interval = setInterval(checkConnection, 5000);
        return () => clearInterval(interval);
    }, []);

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

    const handleSaveChildEdits = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!editName.trim()) {
            alert('Please enter a name');
            return;
        }

        if (editAge < 1 || editAge > 120) {
            alert('Please enter a valid age (1-120)');
            return;
        }

        if (activeChildId) {
            store.updateChild(activeChildId, { 
                name: editName, 
                age: editAge 
            });
            setShowEditChild(false);
        }
    };

    const handleSync = async () => {
        if (!backendConnected || !activeChildId) return;

        setSyncing(true);
        setSyncMessage('Syncing...');

        try {
            const syncData = {
                children: store.children,
                taskTemplates: store.taskTemplates,
                occurrences: store.occurrences,
                version: store.version,
            };

            await syncApi.push(activeChildId, syncData);
            store.setLastSyncTime(Date.now());
            setSyncMessage('✅ Synced successfully!');
            setTimeout(() => setSyncMessage(''), 3000);
        } catch (error) {
            setSyncMessage('❌ Sync failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setSyncing(false);
        }
    };

    const formatLastSync = () => {
        if (!store.lastSyncTime) return 'Never';
        const date = new Date(store.lastSyncTime);
        return date.toLocaleTimeString();
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

            {/* Child Profile Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">Profile</h3>
                    <button
                        onClick={() => {
                            setEditName(activeChild.name);
                            setEditAge(activeChild.age);
                            setShowEditChild(!showEditChild);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        {showEditChild ? 'Cancel' : 'Edit'}
                    </button>
                </div>

                {!showEditChild ? (
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-600">Name</p>
                            <p className="font-medium text-gray-800">{activeChild.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Age</p>
                            <p className="font-medium text-gray-800">{activeChild.age} years old</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSaveChildEdits} className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                            <input
                                type="number"
                                min="1"
                                max="120"
                                value={editAge}
                                onChange={(e) => setEditAge(Math.max(1, Math.min(120, parseInt(e.target.value) || 0)))}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition"
                        >
                            Save Changes
                        </button>
                    </form>
                )}
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

            {/* Backend Sync Section */}
            {backendConnected !== null && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Backend Sync ☁️</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-sm text-gray-700">
                                    Status: {backendConnected ? '🌐 Connected' : '📴 Offline'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Last sync: {formatLastSync()}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleSync}
                                disabled={!backendConnected || syncing}
                                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
                            >
                                {syncing ? 'Syncing...' : 'Sync Now'}
                            </button>
                            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={store.backendEnabled}
                                    onChange={(e) => store.setBackendEnabled(e.target.checked)}
                                    className="rounded"
                                />
                                <span className="text-sm text-gray-700">Auto-sync</span>
                            </label>
                        </div>

                        {syncMessage && (
                            <p className="text-sm text-center p-2 bg-gray-100 rounded">
                                {syncMessage}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Server URLs Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                    <Globe className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="font-semibold text-gray-800">Server URLs</h3>
                </div>
                <div className="space-y-4">
                    {/* PWA URL */}
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">PWA Application</label>
                        <div className="flex items-center mt-1 bg-gray-50 rounded p-3 border border-gray-200">
                            <code className="flex-1 text-xs text-gray-700 break-all font-mono">{appUrl}</code>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(appUrl);
                                    setCopied('pwaurl');
                                    setTimeout(() => setCopied(null), 2000);
                                }}
                                className="ml-2 p-2 hover:bg-gray-200 rounded transition-colors"
                                title="Copy PWA URL"
                            >
                                {copied === 'pwaurl' ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                    <Copy className="w-4 h-4 text-gray-600" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* API URL */}
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">Backend API</label>
                        <div className="flex items-center mt-1 bg-gray-50 rounded p-3 border border-gray-200">
                            <code className="flex-1 text-xs text-gray-700 break-all font-mono">{apiUrl}</code>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(apiUrl);
                                    setCopied('apiurl');
                                    setTimeout(() => setCopied(null), 2000);
                                }}
                                className="ml-2 p-2 hover:bg-gray-200 rounded transition-colors"
                                title="Copy API URL"
                            >
                                {copied === 'apiurl' ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                    <Copy className="w-4 h-4 text-gray-600" />
                                )}
                            </button>
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-3">
                        Use these URLs when accessing the app from another device or for backend integration.
                    </p>
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
