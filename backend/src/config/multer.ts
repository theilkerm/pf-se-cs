import multer from 'multer';
import path from 'path';

/**
 * Storage configuration
 * Files are saved under public/uploads with unique filenames.
 */
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

/**
 * File type filter
 * Only allow common image mime types (JPG, PNG, WEBP)
 */
const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only JPG, PNG, and WEBP images are allowed'));
  }
  cb(null, true);
};

/**
 * Multer instance with size limit (2 MB) and file filter.
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2 MB
});
