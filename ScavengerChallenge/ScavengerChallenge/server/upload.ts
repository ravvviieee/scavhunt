import path from 'path';
import multer from 'multer';
import fs from 'fs';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// Create file size limit (5MB)
const fileSize = 5 * 1024 * 1024;

// Check file type
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and GIF files are allowed.'));
  }
};

// Create multer upload instance
export const upload = multer({ 
  storage, 
  limits: { fileSize },
  fileFilter
});

// Get image URL from filename
export const getImageUrl = (filename: string) => {
  return `/uploads/${filename}`;
};