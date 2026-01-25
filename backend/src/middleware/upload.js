const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Ensure avatars directory exists
const avatarDir = path.join(uploadDir, 'avatars');
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

// Ensure products directory exists
const productDir = path.join(uploadDir, 'products');
if (!fs.existsSync(productDir)) {
  fs.mkdirSync(productDir, { recursive: true });
}

// Configure storage for general uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Configure storage for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarDir);
  },
  filename: function (req, file, cb) {
    // Sử dụng user ID từ token để tạo tên file unique
    const userId = req.user ? req.user.id : 'unknown';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${userId}-${uniqueSuffix}${ext}`);
  }
});

// File filter for CSV
const csvFilter = (req, file, cb) => {
  const allowedMimes = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
  const allowedExts = ['.csv'];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExts.includes(ext) || allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file CSV'), false);
  }
};

// File filter for images (avatar)
const imageFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExts.includes(ext) && allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)'), false);
  }
};

// Upload middleware for CSV
const uploadCSV = multer({
  storage: storage,
  fileFilter: csvFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Upload middleware for Avatar
const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for avatars
  }
});

// Configure storage for product images
const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, productDir);
  },
  filename: function (req, file, cb) {
    const productId = req.params.id || 'new';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `product-${productId}-${uniqueSuffix}${ext}`);
  }
});

// Upload middleware for Product Images
const uploadProductImage = multer({
  storage: productStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for product images
  }
});

// Upload multiple product images (max 5)
const uploadProductImages = multer({
  storage: productStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 5 // Max 5 files
  }
});

// Error handler middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File quá lớn'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

module.exports = {
  uploadCSV,
  uploadAvatar,
  uploadProductImage,
  uploadProductImages,
  handleMulterError,
  avatarDir,
  uploadDir,
  productDir
};
