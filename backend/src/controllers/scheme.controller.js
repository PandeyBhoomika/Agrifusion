import Scheme from '../models/Scheme.js';

// GET /api/schemes?state=Maharashtra
export const getSchemes = async (req, res) => {
    try {
        const { state } = req.query;

        let query = { isActive: true };

        // Show National schemes + the user's state schemes
        if (state) {
            query.state = { $in: ['National', state] };
        }

        const schemes = await Scheme.find(query).sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: schemes.length, data: schemes });
    } catch (error) {
        console.error('Error fetching schemes:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// GET /api/schemes/categories  — returns unique category list
export const getSchemeCategories = async (req, res) => {
    try {
        const categories = await Scheme.distinct('category', { isActive: true });
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
