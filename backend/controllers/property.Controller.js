// const Property = require('../model/Property.model.js');

// // Create a new property listing
// exports.createProperty = async (req, res) => {
//   try {
//     console.log('File:', req.file);
//     console.log('Body:', req.body);

//     const { title, description, price, location } = req.body;
//     const image = req.file ? req.file.path : null;

//     const property = new Property({
//       title,
//       description,
//       price,
//       location,
//       seller: req.user.id,
//       image,
//       verified: false,
//     });

//     await property.save();
//     res.status(201).json({ message: 'Property listed successfully', property });
//   } catch (error) {
//     console.error('Error creating property:', error);
//     res.status(500).json({ message: 'Error listing property', error: error.message });
//   }
// };

// // Get only verified properties
// exports.getVerifiedProperties = async (req, res) => {
//   try {
//     const properties = await Property.find({ verified: true }).populate('seller', 'name email');
//     res.status(200).json(properties);
//   } catch (error) {
//     console.error('Error fetching verified properties:', error);
//     res.status(500).json({ message: 'Error fetching properties', error: error.message });
//   }
// };

// // Get all properties (Admin only)
// exports.getAllProperties = async (req, res) => {
//   try {
//     if (!req.user || !req.user.isAdmin) {
//       return res.status(403).json({ message: 'Unauthorized access' });
//     }

//     const properties = await Property.find().populate('seller', 'name email');
//     res.status(200).json(properties);
//   } catch (error) {
//     console.error('Error fetching all properties:', error);
//     res.status(500).json({ message: 'Error fetching properties', error: error.message });
//   }
// };

// // Get a single property by ID
// exports.getPropertyById = async (req, res) => {
//   try {
//     const property = await Property.findById(req.params.id).populate('seller', 'name email');
//     if (!property) {
//       return res.status(404).json({ message: 'Property not found' });
//     }
//     res.status(200).json(property);
//   } catch (error) {
//     console.error('Error fetching property:', error);
//     res.status(500).json({ message: 'Error fetching property', error: error.message });
//   }
// };

// // Update a property listing by ID
// exports.updateProperty = async (req, res) => {
//   try {
//     const { title, description, price, location } = req.body;
//     const property = await Property.findById(req.params.id);

//     if (!property) {
//       return res.status(404).json({ message: 'Property not found' });
//     }

//     if (property.seller.toString() !== req.user.id) {
//       return res.status(403).json({ message: 'Unauthorized to update this property' });
//     }

//     property.title = title || property.title;
//     property.description = description || property.description;
//     property.price = price || property.price;
//     property.location = location || property.location;

//     if (req.file) {
//       property.image = req.file.path;
//     }

//     await property.save();
//     res.status(200).json({ message: 'Property updated successfully', property });
//   } catch (error) {
//     console.error('Error updating property:', error);
//     res.status(500).json({ message: 'Error updating property', error: error.message });
//   }
// };

// // Delete a property listing by ID
// exports.deleteProperty = async (req, res) => {
//   try {
//     const property = await Property.findById(req.params.id);

//     if (!property) {
//       return res.status(404).json({ message: 'Property not found' });
//     }

//     if (property.seller.toString() !== req.user.id) {
//       return res.status(403).json({ message: 'Unauthorized to delete this property' });
//     }

//     await Property.findByIdAndDelete(req.params.id);
//     res.status(200).json({ message: 'Property deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting property:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// // Verify a property listing by ID (Admin only)
// exports.verifyProperty = async (req, res) => {
//   try {
//     const property = await Property.findById(req.params.id);

//     if (!property) {
//       return res.status(404).json({ message: 'Property not found' });
//     }

//     property.verified = true;
//     await property.save();

//     res.status(200).json({ message: 'Property verified successfully', property });
//   } catch (error) {
//     console.error('Error verifying property:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// // Search properties with filters
// exports.searchProperties = async (req, res) => {
//   try {
//     const { location, propertyType, minPrice, maxPrice } = req.query;

//     let filter = {};

//     if (location) {
//       filter.location = { $regex: location, $options: 'i' };
//     }
//     if (propertyType) {
//       filter.propertyType = { $regex: propertyType, $options: 'i' };
//     }
//     if (minPrice || maxPrice) {
//       filter.price = {};
//       if (minPrice) filter.price.$gte = parseInt(minPrice);
//       if (maxPrice) filter.price.$lte = parseInt(maxPrice);
//     }

//     const properties = await Property.find(filter);
//     res.status(200).json(properties);
//   } catch (error) {
//     console.error('Error searching properties:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };
const Property = require('../model/Property.model.js');
const { geocodeLocation } = require('../utils/geocode.js');

// Create a new property listing
exports.createProperty = async (req, res) => {
  try {
    const { title, description, price, location, listingType, rentPeriod, lat, lng } = req.body;

    const uploadedPaths = Array.isArray(req.files)
      ? req.files.map((f) => f.path)
      : [];
    const primary = uploadedPaths[0] || null;

    const normalizedListingType = listingType === 'rent' ? 'rent' : 'sale';

    // Resolve coordinates: prefer client-supplied lat/lng, else geocode the location string
    let coords;
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (!isNaN(latNum) && !isNaN(lngNum)) {
      coords = { type: 'Point', coordinates: [lngNum, latNum] };
    } else {
      const geo = await geocodeLocation(location);
      if (geo) {
        coords = { type: 'Point', coordinates: [geo.lng, geo.lat] };
      }
    }

    const property = new Property({
      title,
      description,
      price,
      location,
      coordinates: coords,
      listingType: normalizedListingType,
      rentPeriod: normalizedListingType === 'rent' ? (rentPeriod || 'monthly') : undefined,
      seller: req.user.id,
      image: primary,
      images: uploadedPaths,
      verified: false,
      purchased: {
        user: null,
        status: false,
      },
    });

    await property.save();
    res.status(201).json({ message: 'Property listed successfully', property });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ message: 'Error listing property', error: error.message });
  }
};

// Purchase a property
exports.purchaseProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.purchased.status) {
      return res.status(400).json({ message: 'Property already purchased' });
    }

    property.purchased = {
      user: req.user.id,
      status: true,
    };

    await property.save();
    res.status(200).json({ message: 'Property purchased successfully', property });
  } catch (error) {
    console.error('Error purchasing property:', error);
    res.status(500).json({ message: 'Error purchasing property', error: error.message });
  }
};

// Get only verified properties that are available for purchase
exports.getVerifiedAvailableProperties = async (req, res) => {
  try {
    const filter = { verified: true };
    if (req.query.listingType === 'sale' || req.query.listingType === 'rent') {
      filter.listingType = req.query.listingType;
    }
    const properties = await Property.find(filter)
      .populate('seller', 'name email')
      .populate('purchased.user', 'name email');
    res.status(200).json(properties);
  } catch (error) {
    console.error('Error fetching available properties:', error);
    res.status(500).json({ message: 'Error fetching properties', error: error.message });
  }
};

// Get all properties (Admin only)
exports.getAllProperties = async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const properties = await Property.find().populate('seller', 'name email');
    res.status(200).json(properties);
  } catch (error) {
    console.error('Error fetching all properties:', error);
    res.status(500).json({ message: 'Error fetching properties', error: error.message });
  }
};

// Get a single property by ID
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('seller', 'name email');
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.status(200).json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ message: 'Error fetching property', error: error.message });
  }
};

// Update a property listing by ID
exports.updateProperty = async (req, res) => {
  try {
    const { title, description, price, location, listingType, rentPeriod, keepImages } = req.body;
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to update this property' });
    }

    property.title = title || property.title;
    property.description = description || property.description;
    property.price = price || property.price;
    property.location = location || property.location;
    if (listingType === 'sale' || listingType === 'rent') {
      property.listingType = listingType;
      if (listingType === 'rent' && rentPeriod) property.rentPeriod = rentPeriod;
    }

    // Images handling: keepImages (JSON array of existing URLs to keep) + new uploads
    const newUploads = Array.isArray(req.files) ? req.files.map((f) => f.path) : [];
    if (keepImages !== undefined || newUploads.length > 0) {
      let kept = [];
      if (keepImages) {
        try {
          kept = typeof keepImages === 'string' ? JSON.parse(keepImages) : keepImages;
          if (!Array.isArray(kept)) kept = [];
        } catch {
          kept = [];
        }
      } else {
        kept = property.images || [];
      }
      const merged = [...kept, ...newUploads];
      property.images = merged;
      property.image = merged[0] || null;
    }

    await property.save();
    res.status(200).json({ message: 'Property updated successfully', property });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ message: 'Error updating property', error: error.message });
  }
};

// Delete a property listing by ID
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to delete this property' });
    }

    await Property.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify a property listing by ID (Admin only)
exports.verifyProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    property.verified = true;
    await property.save();

    res.status(200).json({ message: 'Property verified successfully', property });
  } catch (error) {
    console.error('Error verifying property:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Search properties with filters
// exports.searchProperties = async (req, res) => {
//   try {
//     const { location, propertyType, minPrice, maxPrice } = req.query;

//     let filter = {};

//     if (location) {
//       filter.location = { $regex: location, $options: 'i' };
//     }
//     if (propertyType) {
//       filter.propertyType = { $regex: propertyType, $options: 'i' };
//     }
//     if (minPrice || maxPrice) {
//       filter.price = {};
//       if (minPrice) filter.price.$gte = parseInt(minPrice);
//       if (maxPrice) filter.price.$lte = parseInt(maxPrice);
//     }

//     // Filter only available properties
//     filter['purchased.status'] = false;

//     const properties = await Property.find(filter);
//     res.status(200).json(properties);
//   } catch (error) {
//     console.error('Error searching properties:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// Search properties with filters
exports.searchProperties = async (req, res) => {
  try {
    const { location, propertyType, minPrice, maxPrice, listingType } = req.query;

    let filter = {};

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }
    if (propertyType) {
      filter.propertyType = { $regex: propertyType, $options: "i" };
    }
    if (listingType === 'sale' || listingType === 'rent') {
      filter.listingType = listingType;
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    const properties = await Property.find(filter);
    res.status(200).json(properties);
  } catch (error) {
    console.error("Error searching properties:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get verified properties within a radius of given coordinates
exports.getNearbyProperties = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = Math.min(parseInt(req.query.radius, 10) || 5000, 50000); // meters, cap 50km

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: 'lat and lng query params are required' });
    }

    const filter = {
      verified: true,
      coordinates: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radius,
        },
      },
    };

    if (req.query.listingType === 'sale' || req.query.listingType === 'rent') {
      filter.listingType = req.query.listingType;
    }

    const properties = await Property.find(filter)
      .populate('seller', 'name email')
      .limit(50);

    res.status(200).json({ count: properties.length, radius, center: { lat, lng }, properties });
  } catch (error) {
    console.error('Error fetching nearby properties:', error);
    res.status(500).json({ message: 'Error fetching nearby properties', error: error.message });
  }
};

// Get all properties listed by a specific user
exports.getUserProperties = async (req, res) => {
  try {
    const userId = req.params.userId; // Assuming user ID is passed as a URL parameter
    const properties = await Property.find({ seller: userId }).populate('seller', 'name email');

    if (!properties.length) {
      return res.status(404).json({ message: 'No properties found for this user' });
    }

    res.status(200).json(properties);
  } catch (error) {
    console.error('Error fetching user properties:', error);
    res.status(500).json({ message: 'Error fetching user properties', error: error.message });
  }
};

