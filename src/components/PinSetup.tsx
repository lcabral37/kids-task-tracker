import React, { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { pinManager } from "../services/pinManager";

interface PinSetupProps {
  onComplete: (pin: string | undefined) => void;
  onCancel: () => void;
}

const PinSetup: React.FC<PinSetupProps> = ({ onComplete, onCancel }) => {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const [skipPin, setSkipPin] = useState(false);

  const handleSetPin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (skipPin) {
      onComplete(undefined);
      return;
    }

    if (!pin) {
      setError("Please enter a PIN");
      return;
    }

    if (!pinManager.isValidPin(pin)) {
      setError("PIN must be 4-6 digits");
      return;
    }

    if (pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }

    onComplete(pin);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b flex items-center gap-3">
          <Lock size={24} className="text-blue-600" />
          <h2 className="text-xl font-semibold">Protect Child Access</h2>
        </div>

        <form onSubmit={handleSetPin} className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Optionally set a 4-6 digit PIN to protect this child's data from
            accidental changes.
          </p>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {!skipPin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PIN
                  </label>
                  <div className="relative">
                    <input
                      type={showPin ? "text" : "password"}
                      value={pin}
                      onChange={(e) =>
                        setPin(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="0000"
                      maxLength={6}
                      className="w-full px-3 py-2 border rounded text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-2.5 text-gray-500"
                    >
                      {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm PIN
                  </label>
                  <input
                    type={showPin ? "text" : "password"}
                    value={confirmPin}
                    onChange={(e) =>
                      setConfirmPin(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="0000"
                    maxLength={6}
                    className="w-full px-3 py-2 border rounded text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={skipPin}
                onChange={(e) => {
                  setSkipPin(e.target.checked);
                  setPin("");
                  setConfirmPin("");
                  setError("");
                }}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-600">
                Skip PIN (no protection)
              </span>
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium transition"
            >
              {skipPin ? "Skip" : "Set PIN"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded font-medium transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PinSetup;
