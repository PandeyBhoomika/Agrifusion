// In-memory store (legacy reference — not used in production)
// All data is now persisted via MongoDB/Mongoose models

export const users = [];       // { id, mobile, role, points, profile? }
export const otps = {};        // { [mobile]: { code, expiresAt } }
