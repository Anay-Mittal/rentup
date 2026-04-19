const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./model/user.model.js');
const Property = require('./model/Property.model.js');

const IMG = (id) => `https://images.unsplash.com/${id}?w=900&q=80&auto=format&fit=crop`;

// [lng, lat] GeoJSON format
const COORDS = {
  bandra: [72.8296, 19.0596],
  whitefield: [77.7500, 12.9698],
  gurgaon43: [77.0891, 28.4419],
  koramangala: [77.6245, 12.9352],
  lowerparel: [72.8295, 18.9980],
  powai: [72.9078, 19.1197],
  jubileehills: [78.4089, 17.4310],
  sholinganallur: [80.2289, 12.9012],
  chhatarpur: [77.1696, 28.5034],
  cybercity: [77.0884, 28.4960],
};

const SAMPLES = [
  {
    title: 'Modern 3BHK Apartment in Bandra',
    description: 'Spacious sea-facing apartment with modular kitchen, 2 balconies and reserved parking.',
    price: 18500000,
    location: 'Bandra West, Mumbai',
    listingType: 'sale',
    coords: COORDS.bandra,
    images: [
      IMG('photo-1512917774080-9991f1c4c750'),
      IMG('photo-1505142468610-359e7d316be0'),
      IMG('photo-1554995207-c18c203602cb'),
    ],
  },
  {
    title: 'Luxury Villa with Private Pool',
    description: '4BHK villa on 5000 sqft plot. Landscaped garden, private swimming pool, home theater.',
    price: 42000000,
    location: 'Whitefield, Bangalore',
    listingType: 'sale',
    coords: COORDS.whitefield,
    images: [
      IMG('photo-1613490493576-7fde63acd811'),
      IMG('photo-1564013799919-ab600027ffc6'),
      IMG('photo-1582268611958-ebfd161ef9cf'),
    ],
  },
  {
    title: 'Cozy 2BHK Flat Near Metro',
    description: 'Fully furnished, walking distance to HUDA City Centre metro, 24x7 security, gym access.',
    price: 9500000,
    location: 'Sector 43, Gurgaon',
    listingType: 'sale',
    coords: COORDS.gurgaon43,
    images: [
      IMG('photo-1502672260266-1c1ef2d93688'),
      IMG('photo-1493809842364-78817add7ffb'),
      IMG('photo-1484154218962-a197022b5858'),
    ],
  },
  {
    title: 'Studio Apartment in Koramangala',
    description: 'Compact studio ideal for working professionals. Close to tech parks and restaurants.',
    price: 5800000,
    location: 'Koramangala, Bangalore',
    listingType: 'sale',
    coords: COORDS.koramangala,
    images: [
      IMG('photo-1522708323590-d24dbb6b0267'),
      IMG('photo-1560185007-c5ca9d2c014d'),
      IMG('photo-1505691938895-1758d7feb511'),
    ],
  },
  {
    title: 'Duplex Penthouse with Skyline View',
    description: '5BHK duplex on the top two floors. Private terrace, jacuzzi, servant quarters.',
    price: 75000000,
    location: 'Lower Parel, Mumbai',
    listingType: 'sale',
    coords: COORDS.lowerparel,
    images: [
      IMG('photo-1600596542815-ffad4c1539a9'),
      IMG('photo-1540541338287-41700207dee6'),
      IMG('photo-1600585154340-be6161a56a0c'),
    ],
  },
  {
    title: 'Furnished 2BHK for Rent — Powai',
    description: 'Fully furnished, near Hiranandani. AC, washing machine, WiFi-ready. Immediate possession.',
    price: 62000,
    location: 'Powai, Mumbai',
    listingType: 'rent',
    rentPeriod: 'monthly',
    coords: COORDS.powai,
    images: [
      IMG('photo-1502005229762-cf1b2da7c5d6'),
      IMG('photo-1586023492125-27b2c045efd7'),
      IMG('photo-1598928506311-c55ded91a20c'),
    ],
  },
  {
    title: 'Independent 3BHK House for Rent',
    description: 'Ground floor of an independent bungalow. Covered parking for 2 cars, small garden.',
    price: 48000,
    location: 'Jubilee Hills, Hyderabad',
    listingType: 'rent',
    rentPeriod: 'monthly',
    coords: COORDS.jubileehills,
    images: [
      IMG('photo-1568605114967-8130f3a36994'),
      IMG('photo-1570129477492-45c003edd2be'),
      IMG('photo-1523217582562-09d0def993a6'),
    ],
  },
  {
    title: 'Serviced 1BHK Near IT Corridor',
    description: 'Housekeeping included, modular furniture, 5 min from ORR. Ideal for IT professionals.',
    price: 32000,
    location: 'Sholinganallur, Chennai',
    listingType: 'rent',
    rentPeriod: 'monthly',
    coords: COORDS.sholinganallur,
    images: [
      IMG('photo-1617104551722-3b2d51366400'),
      IMG('photo-1540518614846-7eded433c457'),
      IMG('photo-1556228453-efd6c1ff04f6'),
    ],
  },
  {
    title: 'Farmhouse on Yearly Lease',
    description: '2-acre farmhouse with mango orchard. Weekend retreat or long-stay rental.',
    price: 450000,
    location: 'Chhatarpur, New Delhi',
    listingType: 'rent',
    rentPeriod: 'yearly',
    coords: COORDS.chhatarpur,
    images: [
      IMG('photo-1449844908441-8829872d2607'),
      IMG('photo-1518780664697-55e3ad937233'),
      IMG('photo-1523217582562-09d0def993a6'),
    ],
  },
  {
    title: 'Commercial Office Space for Rent',
    description: '1200 sqft open floor plan. Glass cabin, meeting room, pantry, 20 workstations.',
    price: 85000,
    location: 'Cyber City, Gurgaon',
    listingType: 'rent',
    rentPeriod: 'monthly',
    coords: COORDS.cybercity,
    images: [
      IMG('photo-1497366216548-37526070297c'),
      IMG('photo-1497366754035-f200968a6e72'),
      IMG('photo-1568992687947-868a62a9f521'),
    ],
  },
];

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI missing from .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const admin = await User.findOne({ isAdmin: true });
  if (!admin) {
    console.error('No admin user found. Run "npm run seed:admin" first.');
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`Using seller: ${admin.email}`);

  let created = 0;
  let updated = 0;

  for (const sample of SAMPLES) {
    const existing = await Property.findOne({
      title: sample.title,
      seller: admin._id,
    });

    if (existing) {
      existing.description = sample.description;
      existing.price = sample.price;
      existing.location = sample.location;
      existing.listingType = sample.listingType;
      if (sample.rentPeriod) existing.rentPeriod = sample.rentPeriod;
      if (sample.images) existing.images = sample.images;
      if (sample.coords) {
        existing.coordinates = { type: 'Point', coordinates: sample.coords };
      }
      existing.verified = true;
      await existing.save();
      updated += 1;
      continue;
    }

    const { coords, ...rest } = sample;
    await Property.create({
      ...rest,
      coordinates: coords
        ? { type: 'Point', coordinates: coords }
        : undefined,
      seller: admin._id,
      verified: true,
      purchased: { user: null, status: false },
    });
    created += 1;
  }

  console.log(`Created: ${created}`);
  console.log(`Updated (existing): ${updated}`);
  console.log(`Total in DB: ${await Property.countDocuments()}`);

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error('Seed failed:', err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
