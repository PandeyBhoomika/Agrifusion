import Scheme from '../models/Scheme.js';

// Get schemes (optionally filter by state)
export const getSchemes = async (req, res) => {
    try {
        const { state } = req.query; // Check if frontend passed ?state=Kerala

        let query = { isActive: true };

        // If state is provided, show National schemes AND the user's state schemes
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