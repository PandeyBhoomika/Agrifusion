// In-memory DB for now

const users = [];        // { id, mobile, role, points, profile? }
const otps = {};         // { [mobile]: { code, expiresAt } }

module.exports = { users, otps };
