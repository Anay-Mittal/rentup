// const express = require('express');
// const router = express.Router();
// const propertyController = require('../controllers/property.Controller.js');
// const authMiddleware = require('../middlewear/authMiddleware.js');
// const adminMiddleware = require('../middlewear/admin.middlewear.js');
// const upload = require('../middlewear/upload.middlewear.js');

// // Route to get only verified properties (accessible to all users)
// router.get('/verified', propertyController.getVerifiedProperties);

// // Route to get all properties (admin only)
// router.get('/all', authMiddleware, adminMiddleware, propertyController.getAllProperties);

// // Route to search properties
// router.get('/search', propertyController.searchProperties);

// // Route to list a property (Protected route with image upload)
// router.post('/list', authMiddleware, upload.single('image'), propertyController.createProperty);

// // Route to get a single property by ID
// router.get('/:id', propertyController.getPropertyById);

// // Route to update a property listing by ID (Protected route with optional image upload)
// router.put('/:id', authMiddleware, upload.single('image'), propertyController.updateProperty);

// // Route to delete a property listing by ID (Protected route)
// router.delete('/:id', authMiddleware, propertyController.deleteProperty);

// // Admin-only route to verify a property listing by ID
// router.post('/verify/:id', authMiddleware, adminMiddleware, propertyController.verifyProperty);

// module.exports = router;
const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/property.Controller.js'); // Ensure this matches the actual file name
const authMiddleware = require('../middlewear/authMiddleware.js'); // Ensure paths and names are correct
const adminMiddleware = require('../middlewear/admin.middlewear.js'); // Ensure paths and names are correct
const upload = require('../middlewear/upload.middlewear.js'); // Middleware for handling file uploads

// Route to get only verified properties (accessible to all users)
router.get('/verified', propertyController.getVerifiedAvailableProperties);

// Route to get all properties (admin only)
router.get('/all', authMiddleware, adminMiddleware, propertyController.getAllProperties);

// Route to search properties with filters
router.get('/search', propertyController.searchProperties);

// Route to find verified properties within a radius (geo)
router.get('/nearby', propertyController.getNearbyProperties);

// Route to list a property (protected route with image upload)
router.post(
  '/list',
  authMiddleware,
  upload.array('images', 10), // Handles up to 10 image uploads
  propertyController.createProperty
);

// Route to get a single property by ID
router.get('/:id', propertyController.getPropertyById);

// Route to update a property listing by ID (protected route with optional image upload)
router.put(
  '/:id',
  authMiddleware,
  upload.array('images', 10), // Optional multi-image upload during update
  propertyController.updateProperty
);

// Route to delete a property listing by ID (protected route)
router.delete('/:id', authMiddleware, propertyController.deleteProperty);

// Admin-only route to verify a property listing by ID
router.post(
  '/verify/:id',
  authMiddleware,
  adminMiddleware, // Ensures the user is an admin
  propertyController.verifyProperty
);

// Route to purchase a property by ID (protected route)
router.post('/:id/purchase', authMiddleware, propertyController.purchaseProperty);

// Route to get all properties listed by a specific user
router.get('/user/:userId', propertyController.getUserProperties);


module.exports = router;
