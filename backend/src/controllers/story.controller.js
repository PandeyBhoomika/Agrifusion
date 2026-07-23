// controllers/story.controller.js
import Story from '../models/Story.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ─── Helper to get user ID from token ─────────────────────────────────────
const getUserId = (req) => req.user.userId || req.user._id;

// ─── Multer setup for image uploads ───────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/stories';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `story_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Images only'), false);
};

// ✅ FIXED — bumped from 5MB to 25MB to support full-resolution, uncompressed
// photos straight from a phone camera (which can easily be 8-15MB each).
export const upload = multer({ storage, fileFilter, limits: { fileSize: 25 * 1024 * 1024 } });

// ─── GET all active stories grouped by user ────────────────────────────────
export const getStories = async (req, res) => {
  try {
    const now = new Date();
    const currentUserId = getUserId(req).toString();

    const stories = await Story.find({ expiresAt: { $gt: now } })
      .sort({ createdAt: -1 })
      .populate('userId', 'fullName state')
      .lean();

    const grouped = {};
    for (const story of stories) {
      const uid = story.userId._id.toString();
      if (!grouped[uid]) {
        grouped[uid] = {
          userId: story.userId._id,
          userName: story.userId.fullName,
          userState: story.userId.state || '',
          stories: [],
          hasUnseenStory: false,
        };
      }
      const seen = story.viewers.map(String).includes(currentUserId);
      if (!seen) grouped[uid].hasUnseenStory = true;

      grouped[uid].stories.push({
        _id: story._id,
        imageUrl: story.imageUrl,
        caption: story.caption,
        viewCount: story.viewers.length,
        hasSeen: seen,
        createdAt: story.createdAt,
        expiresAt: story.expiresAt,
      });
    }

    res.json({ success: true, data: Object.values(grouped) });
  } catch (err) {
    console.error('getStories error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch stories' });
  }
};

// ─── GET my own stories ────────────────────────────────────────────────────
export const getMyStories = async (req, res) => {
  try {
    const stories = await Story.find({
      userId: getUserId(req),
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: stories });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch your stories' });
  }
};

// ─── CREATE a story (image upload) ────────────────────────────────────────
export const createStory = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }

    const userId = getUserId(req);
    const imageUrl = `${process.env.BASE_URL || 'http://localhost:4000'}/uploads/stories/${req.file.filename}`;

    const story = await Story.create({
      userId,
      imageUrl,
      caption: req.body.caption || '',
    });

    await story.populate('userId', 'fullName state');

    res.status(201).json({ success: true, data: story });
  } catch (err) {
    console.error('createStory error:', err);
    res.status(500).json({ success: false, message: 'Failed to create story' });
  }
};

// ─── MARK story as viewed ──────────────────────────────────────────────────
export const viewStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = getUserId(req);

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found or expired' });
    }

    if (!story.viewers.map(String).includes(userId.toString())) {
      story.viewers.push(userId);
      await story.save();
    }

    res.json({ success: true, message: 'Story marked as viewed', viewCount: story.viewers.length });
  } catch (err) {
    console.error('viewStory error:', err);
    res.status(500).json({ success: false, message: 'Failed to mark story as viewed' });
  }
};

// ─── DELETE own story ──────────────────────────────────────────────────────
export const deleteStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = getUserId(req).toString();

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    if (story.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const filePath = story.imageUrl.split('/uploads/')[1];
    if (filePath) {
      const fullPath = `uploads/${filePath}`;
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }

    await story.deleteOne();
    res.json({ success: true, message: 'Story deleted' });
  } catch (err) {
    console.error('deleteStory error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete story' });
  }
};
