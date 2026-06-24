import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(process.cwd(), 'uploads', 'proofs');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || '';
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, unique);
    },
});

export const uploadProofFiles = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
}).fields([
    { name: 'photo', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
]);