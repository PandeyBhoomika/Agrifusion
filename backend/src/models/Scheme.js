import mongoose from 'mongoose';

const schemeSchema = new mongoose.Schema(
    {
        title:       { type: String, required: true },
        description: { type: String, required: true },
        eligibility: { type: [String], required: true },
        state:       { type: String, default: 'National' }, // 'National' | state name
        link:        { type: String },
        category:    { type: String, default: 'general' }, // NEW: financial-assistance, insurance, credit, etc.
        isActive:    { type: Boolean, default: true }
    },
    { timestamps: true }
);

export default mongoose.model('Scheme', schemeSchema);
