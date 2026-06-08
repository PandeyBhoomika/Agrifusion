import mongoose from 'mongoose';

const schemeSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        eligibility: { type: [String], required: true }, // e.g., ["Small farmer", "Kerala resident"]
        state: { type: String, default: 'National' }, // Or "Kerala", "Maharashtra", etc.
        link: { type: String }, // Official application link
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

export default mongoose.model('Scheme', schemeSchema);