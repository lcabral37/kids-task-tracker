// PIN caching and verification logic
// Uses sessionStorage to cache PIN after verification (cleared when tab closes)

const SESSION_KEY = 'kid_tracker_verified_pins'; // Maps childId -> true if verified

export const pinManager = {
    // Check if a PIN is correct
    verifyPin: (pin: string, correctPin: string | undefined): boolean => {
        if (!correctPin) return true; // No PIN set, no verification needed
        return pin === correctPin;
    },

    // Mark a child as PIN-verified in session
    markChildVerified: (childId: string) => {
        const verified = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
        verified[childId] = true;
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(verified));
    },

    // Check if a child is currently PIN-verified
    isChildVerified: (childId: string): boolean => {
        const verified = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
        return !!verified[childId];
    },

    // Clear PIN verification for a child
    clearChildVerification: (childId: string) => {
        const verified = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
        delete verified[childId];
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(verified));
    },

    // Clear all PIN verifications (on logout or tab close)
    clearAllVerifications: () => {
        sessionStorage.removeItem(SESSION_KEY);
    },

    // Validate PIN format
    isValidPin: (pin: string): boolean => {
        return /^\d{4,6}$/.test(pin);
    },
};
