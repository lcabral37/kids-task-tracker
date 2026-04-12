import React, { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { pinManager } from "../services/pinManager";

interface PinVerificationProps {
  childName: string;
  childPin: string | undefined;
  onVerified: () => void;
  onCancel: () => void;
}

const PinVerification: React.FC<PinVerificationProps> = ({
  childName,
  childPin,
  onVerified,
  onCancel,
}) => {
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

  // If no PIN is set, auto-verify
  React.useEffect(() => {
    if (!childPin) {
      pinManager.markChildVerified(childName);
      onVerified();
    }
  }, [childPin, childName, onVerified]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!pin) {
      setError("Please enter the PIN");
      return;
    }

    if (pinManager.verifyPin(pin, childPin)) {
      pinManager.markChildVerified(childName);
      onVerified();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPin("");

      if (newAttempts >= 3) {
        setError("Too many attempts. Try again later.");
      } else {
        setError(`Incorrect PIN. ${3 - newAttempts} attempts remaining.`);
      }
    }
  };

  // If no PIN is set, don't show modal
  if (!childPin) return null;

  const isLocked = attempts >= 3;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b flex items-center gap-3">
          <Lock size={24} className="text-blue-600" />
          <h2 className="text-xl font-semibold">Access {childName}</h2>
        </div>

        <form
          onSubmit={handleVerify}
          className="p-6 space-y-4"
        >
          <p className="text-sm text-gray-600">
            This child is protected with a PIN. Enter it to continue.
          </p>

          {error && (
            <div
              className={`p-3 rounded text-sm ${
                isLocked
                  ? "bg-red-100 border border-red-300 text-red-700"
                  : "bg-yellow-50 border border-yellow-200 text-yellow-700"
              }`}
            >
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PIN
            </label>
            <div className="relative">
              <input
                type={showPin ? "text" : "password"}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="0000"
                maxLength={6}
                className={`w-full px-3 py-2 border rounded text-lg tracking-widest focus:outline-none focus:ring-2 ${
                  isLocked
                    ? "bg-gray-100 cursor-not-allowed"
                    : "focus:ring-blue-500"
                }`}
                autoFocus
                disabled={isLocked}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-2.5 text-gray-500"
                disabled={isLocked}
              >
                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={isLocked}
              className={`flex-1 px-4 py-2 rounded font-medium transition ${
                isLocked
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              Verify
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isLocked}
              className={`flex-1 px-4 py-2 rounded font-medium transition ${
                isLocked
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-300 hover:bg-gray-400 text-gray-800"
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PinVerification;
