import type { VercelRequest, VercelResponse } from '@vercel/node';

// Static vehicle data - 30 sample vehicles
const vehicles = [
  {
    id: "v001",
    year: 2024,
    make: "Toyota",
    model: "Camry",
    trim: "XSE",
    price: 32999,
    mileage: 5200,
    bodyStyle: "Sedan",
    seats: 5,
    color: "Pearl White",
    fuelType: "Gasoline",
    transmission: "Automatic",
    drivetrain: "FWD",
    mpgCity: 28,
    mpgHighway: 39,
    features: ["Apple CarPlay", "Android Auto", "Sunroof", "Leather Seats", "Blind Spot Monitor"],
    description: "Nearly new Camry XSE with premium features and excellent fuel economy.",
    imageUrl: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
    isAvailable: true
  },
  {
    id: "v002",
    year: 2023,
    make: "Honda",
    model: "Accord",
    trim: "Sport",
    price: 29500,
    mileage: 12400,
    bodyStyle: "Sedan",
    seats: 5,
    color: "Sonic Gray",
    fuelType: "Gasoline",
    transmission: "Automatic",
    drivetrain: "FWD",
    mpgCity: 29,
    mpgHighway: 37,
    features: ["Honda Sensing", "Wireless CarPlay", "Heated Seats", "Remote Start"],
    description: "Sporty Accord with Honda Sensing safety suite and modern tech.",
    imageUrl: "https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800",
    isAvailable: true
  },
  {
    id: "v003",
    year: 2024,
    make: "Ford",
    model: "F-150",
    trim: "XLT",
    price: 48750,
    mileage: 8900,
    bodyStyle: "Truck",
    seats: 6,
    color: "Oxford White",
    fuelType: "Gasoline",
    transmission: "Automatic",
    drivetrain: "4WD",
    mpgCity: 20,
    mpgHighway: 26,
    features: ["SYNC 4", "Pro Trailer Backup Assist", "360 Camera", "Bed Liner", "Tow Package"],
    description: "America's best-selling truck with 4WD and towing capability.",
    imageUrl: "https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?w=800",
    isAvailable: true
  },
  {
    id: "v004",
    year: 2023,
    make: "Tesla",
    model: "Model 3",
    trim: "Long Range",
    price: 42990,
    mileage: 15600,
    bodyStyle: "Sedan",
    seats: 5,
    color: "Midnight Silver",
    fuelType: "Electric",
    transmission: "Automatic",
    drivetrain: "AWD",
    mpgCity: 134,
    mpgHighway: 126,
    features: ["Autopilot", "Premium Interior", "Glass Roof", "Supercharging", "Over-the-Air Updates"],
    description: "Long range electric sedan with 358 mile range and Autopilot.",
    imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800",
    isAvailable: true
  },
  {
    id: "v005",
    year: 2024,
    make: "BMW",
    model: "X5",
    trim: "xDrive40i",
    price: 67500,
    mileage: 3200,
    bodyStyle: "SUV",
    seats: 5,
    color: "Alpine White",
    fuelType: "Gasoline",
    transmission: "Automatic",
    drivetrain: "AWD",
    mpgCity: 21,
    mpgHighway: 26,
    features: ["iDrive 8", "Panoramic Roof", "Harman Kardon", "Parking Assistant", "Gesture Control"],
    description: "Luxury SUV with cutting-edge technology and refined performance.",
    imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
    isAvailable: true
  },
  {
    id: "v006",
    year: 2023,
    make: "Mercedes-Benz",
    model: "C-Class",
    trim: "C300",
    price: 47800,
    mileage: 9800,
    bodyStyle: "Sedan",
    seats: 5,
    color: "Obsidian Black",
    fuelType: "Gasoline",
    transmission: "Automatic",
    drivetrain: "RWD",
    mpgCity: 23,
    mpgHighway: 33,
    features: ["MBUX", "Burmester Audio", "AMG Line", "360 Camera", "Ambient Lighting"],
    description: "Elegant luxury sedan with MBUX infotainment and premium appointments.",
    imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800",
    isAvailable: true
  },
  {
    id: "v007",
    year: 2024,
    make: "Chevrolet",
    model: "Silverado 1500",
    trim: "LT",
    price: 46200,
    mileage: 6500,
    bodyStyle: "Truck",
    seats: 6,
    color: "Summit White",
    fuelType: "Gasoline",
    transmission: "Automatic",
    drivetrain: "4WD",
    mpgCity: 19,
    mpgHighway: 24,
    features: ["Chevrolet Infotainment 3", "Trailering Package", "Spray-On Bedliner", "Heated Seats"],
    description: "Capable full-size truck with 4WD and comprehensive towing features.",
    imageUrl: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800",
    isAvailable: true
  },
  {
    id: "v008",
    year: 2023,
    make: "Audi",
    model: "Q7",
    trim: "Premium Plus",
    price: 62900,
    mileage: 14200,
    bodyStyle: "SUV",
    seats: 7,
    color: "Navarra Blue",
    fuelType: "Gasoline",
    transmission: "Automatic",
    drivetrain: "AWD",
    mpgCity: 19,
    mpgHighway: 23,
    features: ["Virtual Cockpit", "Bang & Olufsen", "Third Row", "Matrix LED", "Air Suspension"],
    description: "Three-row luxury SUV with quattro AWD and premium audio.",
    imageUrl: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800",
    isAvailable: true
  },
  {
    id: "v009",
    year: 2024,
    make: "Hyundai",
    model: "Tucson",
    trim: "Limited",
    price: 38500,
    mileage: 4800,
    bodyStyle: "SUV",
    seats: 5,
    color: "Amazon Gray",
    fuelType: "Hybrid",
    transmission: "Automatic",
    drivetrain: "AWD",
    mpgCity: 38,
    mpgHighway: 38,
    features: ["Digital Key", "Bose Audio", "Highway Drive Assist", "Ventilated Seats", "Panoramic Roof"],
    description: "Efficient hybrid SUV with bold styling and advanced driver assists.",
    imageUrl: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800",
    isAvailable: true
  },
  {
    id: "v010",
    year: 2023,
    make: "Mazda",
    model: "CX-5",
    trim: "Turbo",
    price: 36900,
    mileage: 11200,
    bodyStyle: "SUV",
    seats: 5,
    color: "Soul Red Crystal",
    fuelType: "Gasoline",
    transmission: "Automatic",
    drivetrain: "AWD",
    mpgCity: 22,
    mpgHighway: 27,
    features: ["Bose Audio", "Heads-Up Display", "Leather Interior", "Adaptive Cruise"],
    description: "Stylish compact SUV with turbocharged power and premium interior.",
    imageUrl: "https://images.unsplash.com/photo-1612825173281-9a193378527e?w=800",
    isAvailable: true
  },
  {
    id: "v011",
    year: 2024,
    make: "Porsche",
    model: "Cayenne",
    trim: "Base",
    price: 78500,
    mileage: 2100,
    bodyStyle: "SUV",
    seats: 5,
    color: "Carrara White",
    fuelType: "Gasoline",
    transmission: "Automatic",
    drivetrain: "AWD",
    mpgCity: 18,
    mpgHighway: 23,
    features: ["Porsche Communication Management", "Sport Chrono", "PASM", "LED Matrix Headlights"],
    description: "Sports car performance in SUV form with Porsche engineering.",
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
    isAvailable: true
  },
  {
    id: "v012",
    year: 2023,
    make: "Lexus",
    model: "RX 350",
    trim: "F Sport",
    price: 54200,
    mileage: 8900,
    bodyStyle: "SUV",
    seats: 5,
    color: "Atomic Silver",
    fuelType: "Gasoline",
    transmission: "Automatic",
    drivetrain: "AWD",
    mpgCity: 21,
    mpgHighway: 28,
    features: ["Mark Levinson Audio", "Panoramic View", "F Sport Suspension", "Head-Up Display"],
    description: "Refined luxury crossover with F Sport handling and premium audio.",
    imageUrl: "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800",
    isAvailable: true
  },
  {
    id: "v013",
    year: 2024,
    make: "Kia",
    model: "Telluride",
    trim: "SX",
    price: 49900,
    mileage: 5600,
    bodyStyle: "SUV",
    seats: 8,
    color: "Gravity Gray",
    fuelType: "Gasoline",
    transmission: "Automatic",
    drivetrain: "AWD",
    mpgCity: 20,
    mpgHighway: 26,
    features: ["Dual Sunroof", "Harman Kardon", "Highway Driving Assist", "Captain Chairs", "Remote Smart Park"],
    description: "Award-winning three-row SUV with premium features and value.",
    imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800",
    isAvailable: true
  },
  {
    id: "v014",
    year: 2023,
    make: "Jeep",
    model: "Grand Cherokee",
    trim: "Limited",
    price: 52800,
    mileage: 12100,
    bodyStyle: "SUV",
    seats: 5,
    color: "Diamond Black",
    fuelType: "Gasoline",
    transmission: "Automatic",
    drivetrain: "4WD",
    mpgCity: 19,
    mpgHighway: 26,
    features: ["Uconnect 5", "Quadra-Trac II", "Air Suspension", "McIntosh Audio", "Night Vision"],
    description: "Iconic SUV with legendary 4x4 capability and refined luxury.",
    imageUrl: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800",
    isAvailable: true
  },
  {
    id: "v015",
    year: 2024,
    make: "Volkswagen",
    model: "ID.4",
    trim: "Pro S",
    price: 44900,
    mileage: 3900,
    bodyStyle: "SUV",
    seats: 5,
    color: "Glacier White",
    fuelType: "Electric",
    transmission: "Automatic",
    drivetrain: "RWD",
    mpgCity: 104,
    mpgHighway: 89,
    features: ["12-inch Touchscreen", "Wireless Charging", "IQ.DRIVE", "Panoramic Roof", "Heat Pump"],
    description: "All-electric SUV with 275 mile range and spacious interior.",
    imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800",
    isAvailable: true
  },
  {
    id: "v016",
    year: 2023,
    make: "Subaru",
    model: "Outback",
    trim: "Touring",
    price: 41500,
    mileage: 16800,
    bodyStyle: "Wagon",
    seats: 5,
    color: "Autumn Green",
    fuelType: "Gasoline",
    transmission: "CVT",
    drivetrain: "AWD",
    mpgCity: 26,
    mpgHighway: 32,
    features: ["EyeSight", "Harman Kardon", "Leather Seats", "Power Liftgate", "X-MODE"],
    description: "Adventure-ready wagon with standard AWD and excellent visibility.",
    imageUrl: "https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=800",
    isAvailable: true
  },
  {
    id: "v017",
    year: 2024,
    make: "GMC",
    model: "Sierra 1500",
    trim: "Denali",
    price: 68900,
    mileage: 4200,
    bodyStyle: "Truck",
    seats: 5,
    color: "Onyx Black",
    fuelType: "Gasoline",
    transmission: "Automatic",
    drivetrain: "4WD",
    mpgCity: 17,
    mpgHighway: 21,
    features: ["Super Cruise", "MultiPro Tailgate", "CarbonPro Bed", "Head-Up Display", "Magnetic Ride Control"],
    description: "Premium full-size truck with Super Cruise hands-free driving.",
    imageUrl: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800",
    isAvailable: true
  },
  {
    id: "v018",
    year: 2023,
    make: "Nissan",
    model: "Altima",
    trim: "SR",
    price: 28500,
    mileage: 18900,
    bodyStyle: "Sedan",
    seats: 5,
    color: "Scarlet Ember",
    fuelType: "Gasoline",
    transmission: "CVT",
    drivetrain: "FWD",
    mpgCity: 28,
    mpgHighway: 39,
    features: ["ProPILOT Assist", "Bose Audio", "Sport Mode", "Intelligent Around View"],
    description: "Sporty midsize sedan with semi-autonomous driving features.",
    imageUrl: "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800",
    isAvailable: true
  },
  {
    id: "v019",
    year: 2024,
    make: "Rivian",
    model: "R1T",
    trim: "Adventure",
    price: 79500,
    mileage: 2800,
    bodyStyle: "Truck",
    seats: 5,
    color: "Forest Green",
    fuelType: "Electric",
    transmission: "Automatic",
    drivetrain: "AWD",
    mpgCity: 74,
    mpgHighway: 66,
    features: ["Gear Tunnel", "Camp Kitchen", "Driver+", "Air Compressor", "Quad Motor"],
    description: "All-electric adventure truck with innovative storage and off-road capability.",
    imageUrl: "https://images.unsplash.com/photo-1617886322168-72b886573c35?w=800",
    isAvailable: true
  },
  {
    id: "v020",
    year: 2023,
    make: "Acura",
    model: "MDX",
    trim: "Type S",
    price: 72900,
    mileage: 7600,
    bodyStyle: "SUV",
    seats: 7,
    color: "Tiger Eye Pearl",
    fuelType: "Gasoline",
    transmission: "Automatic",
    drivetrain: "AWD",
    mpgCity: 17,
    mpgHighway: 21,
    features: ["ELS Studio 3D", "Type S Tuned Suspension", "25-Speaker Audio", "AcuraWatch"],
    description: "Performance-oriented three-row SUV with Type S turbo V6.",
    imageUrl: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800",
    isAvailable: true
  },
  {
    id: "v021",
    year: 2024,
    make: "Genesis",
    model: "GV70",
    trim: "Sport Prestige",
    price: 58500,
    mileage: 4100,
    bodyStyle: "SUV",
    seats: 5,
    color: "Vik Black",
    fuelType: "Gasoline",
    transmission: "Automatic",
    drivetrain: "AWD",
    mpgCity: 21,
    mpgHighway: 27,
    features: ["Lexicon Audio", "Remote Smart Park", "Face Recognition", "3D Digital Cluster"],
    description: "Korean luxury SUV with cutting-edge tech and bold design.",
    imageUrl: "https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800",
    isAvailable: true
  },
  {
    id: "v022",
    year: 2023,
    make: "Land Rover",
    model: "Defender",
    trim: "110 S",
    price: 68200,
    mileage: 11400,
    bodyStyle: "SUV",
    seats: 7,
    color: "Eiger Grey",
    fuelType: "Gasoline",
    transmission: "Automatic",
    drivetrain: "4WD",
    mpgCity: 17,
    mpgHighway: 22,
    features: ["Terrain Response 2", "ClearSight Mirror", "Wade Sensing", "Air Suspension"],
    description: "Legendary off-roader reborn with modern luxury and capability.",
    imageUrl: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800",
    isAvailable: true
  },
  {
    id: "v023",
    year: 2024,
    make: "Volvo",
    model: "XC90",
    trim: "Ultimate",
    price: 74900,
    mileage: 3500,
    bodyStyle: "SUV",
    seats: 7,
    color: "Crystal White",
    fuelType: "Hybrid",
    transmission: "Automatic",
    drivetrain: "AWD",
    mpgCity: 35,
    mpgHighway: 35,
    features: ["Bowers & Wilkins", "Pilot Assist", "Air Purifier", "Lounge Console", "OLED Touchscreen"],
    description: "Scandinavian luxury SUV with plug-in hybrid efficiency.",
    imageUrl: "https://images.unsplash.com/photo-1619976215249-0b56e5e69ae9?w=800",
    isAvailable: true
  },
  {
    id: "v024",
    year: 2023,
    make: "Ram",
    model: "1500",
    trim: "Laramie",
    price: 56800,
    mileage: 13200,
    bodyStyle: "Truck",
    seats: 6,
    color: "Patriot Blue",
    fuelType: "Gasoline",
    transmission: "Automatic",
    drivetrain: "4WD",
    mpgCity: 17,
    mpgHighway: 22,
    features: ["Uconnect 5", "Air Suspension", "Multifunction Tailgate", "Harman Kardon", "RamBox"],
    description: "Smooth-riding full-size truck with innovative storage solutions.",
    imageUrl: "https://images.unsplash.com/photo-1596768576350-0c3c0b258cdc?w=800",
    isAvailable: true
  },
  {
    id: "v025",
    year: 2024,
    make: "Lucid",
    model: "Air",
    trim: "Touring",
    price: 87400,
    mileage: 1900,
    bodyStyle: "Sedan",
    seats: 5,
    color: "Stellar White",
    fuelType: "Electric",
    transmission: "Automatic",
    drivetrain: "AWD",
    mpgCity: 131,
    mpgHighway: 122,
    features: ["DreamDrive Pro", "Glass Canopy Roof", "Surreal Sound", "34-inch Display", "Space Concept Interior"],
    description: "Ultra-luxury electric sedan with 406 mile range and stunning design.",
    imageUrl: "https://images.unsplash.com/photo-1617654112329-c446980a8956?w=800",
    isAvailable: true
  },
  {
    id: "v026",
    year: 2023,
    make: "Infiniti",
    model: "QX60",
    trim: "Sensory",
    price: 59800,
    mileage: 9700,
    bodyStyle: "SUV",
    seats: 7,
    color: "Moonstone White",
    fuelType: "Gasoline",
    transmission: "CVT",
    drivetrain: "AWD",
    mpgCity: 20,
    mpgHighway: 25,
    features: ["ProPILOT Assist", "Bose Audio", "Zero Gravity Seats", "Motion Activated Liftgate"],
    description: "Refined three-row luxury SUV with comfortable seating for seven.",
    imageUrl: "https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?w=800",
    isAvailable: true
  },
  {
    id: "v027",
    year: 2024,
    make: "Cadillac",
    model: "Escalade",
    trim: "Sport",
    price: 98500,
    mileage: 4800,
    bodyStyle: "SUV",
    seats: 7,
    color: "Black Raven",
    fuelType: "Gasoline",
    transmission: "Automatic",
    drivetrain: "4WD",
    mpgCity: 14,
    mpgHighway: 19,
    features: ["Super Cruise", "38-inch OLED Display", "AKG Studio Audio", "Night Vision", "Air Ride"],
    description: "Full-size American luxury SUV with Super Cruise and massive display.",
    imageUrl: "https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=800",
    isAvailable: true
  },
  {
    id: "v028",
    year: 2023,
    make: "Lincoln",
    model: "Navigator",
    trim: "Reserve",
    price: 92800,
    mileage: 8100,
    bodyStyle: "SUV",
    seats: 7,
    color: "Pristine White",
    fuelType: "Gasoline",
    transmission: "Automatic",
    drivetrain: "4WD",
    mpgCity: 16,
    mpgHighway: 22,
    features: ["Revel Ultima Audio", "Perfect Position Seats", "Lincoln Co-Pilot360", "Illumination Package"],
    description: "Luxurious full-size SUV with whisper-quiet cabin and premium amenities.",
    imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
    isAvailable: true
  },
  {
    id: "v029",
    year: 2024,
    make: "Polestar",
    model: "2",
    trim: "Long Range Dual Motor",
    price: 55400,
    mileage: 2600,
    bodyStyle: "Sedan",
    seats: 5,
    color: "Snow",
    fuelType: "Electric",
    transmission: "Automatic",
    drivetrain: "AWD",
    mpgCity: 107,
    mpgHighway: 95,
    features: ["Google Built-In", "Pilot Pack", "Plus Pack", "Performance Pack", "Ohlins Dampers"],
    description: "Swedish electric performance sedan with Google integration.",
    imageUrl: "https://images.unsplash.com/photo-1619317565614-76c11573e3f7?w=800",
    isAvailable: true
  },
  {
    id: "v030",
    year: 2023,
    make: "Alfa Romeo",
    model: "Stelvio",
    trim: "Ti Sport",
    price: 54900,
    mileage: 10200,
    bodyStyle: "SUV",
    seats: 5,
    color: "Alfa Rosso",
    fuelType: "Gasoline",
    transmission: "Automatic",
    drivetrain: "AWD",
    mpgCity: 22,
    mpgHighway: 28,
    features: ["Harman Kardon", "Active Driver Assist", "Sport Exhaust", "Carbon Fiber Trim"],
    description: "Italian performance SUV with passionate design and engaging handling.",
    imageUrl: "https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?w=800",
    isAvailable: true
  }
];

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse query parameters for filtering
    const {
      maxPrice,
      minPrice,
      minYear,
      maxYear,
      maxMiles,
      minMiles,
      make,
      bodyStyle,
      drivetrain,
      fuel,
      transmission,
      color,
      search,
      sort
    } = req.query;

    let filteredVehicles = [...vehicles];

    // Apply filters
    if (maxPrice) {
      filteredVehicles = filteredVehicles.filter(v => v.price <= Number(maxPrice));
    }
    if (minPrice) {
      filteredVehicles = filteredVehicles.filter(v => v.price >= Number(minPrice));
    }
    if (minYear) {
      filteredVehicles = filteredVehicles.filter(v => v.year >= Number(minYear));
    }
    if (maxYear) {
      filteredVehicles = filteredVehicles.filter(v => v.year <= Number(maxYear));
    }
    if (maxMiles) {
      filteredVehicles = filteredVehicles.filter(v => v.mileage <= Number(maxMiles));
    }
    if (minMiles) {
      filteredVehicles = filteredVehicles.filter(v => v.mileage >= Number(minMiles));
    }

    // Array filters
    if (make) {
      const makes = Array.isArray(make) ? make : [make];
      filteredVehicles = filteredVehicles.filter(v =>
        makes.some(m => v.make.toLowerCase().includes(String(m).toLowerCase()))
      );
    }
    if (bodyStyle) {
      const styles = Array.isArray(bodyStyle) ? bodyStyle : [bodyStyle];
      filteredVehicles = filteredVehicles.filter(v =>
        styles.some(s => v.bodyStyle.toLowerCase().includes(String(s).toLowerCase()))
      );
    }
    if (drivetrain) {
      const drivetrains = Array.isArray(drivetrain) ? drivetrain : [drivetrain];
      filteredVehicles = filteredVehicles.filter(v =>
        drivetrains.some(d => v.drivetrain.toLowerCase().includes(String(d).toLowerCase()))
      );
    }
    if (fuel) {
      const fuels = Array.isArray(fuel) ? fuel : [fuel];
      filteredVehicles = filteredVehicles.filter(v =>
        fuels.some(f => v.fuelType.toLowerCase().includes(String(f).toLowerCase()))
      );
    }
    if (transmission) {
      const transmissions = Array.isArray(transmission) ? transmission : [transmission];
      filteredVehicles = filteredVehicles.filter(v =>
        transmissions.some(t => v.transmission.toLowerCase().includes(String(t).toLowerCase()))
      );
    }
    if (color) {
      const colors = Array.isArray(color) ? color : [color];
      filteredVehicles = filteredVehicles.filter(v =>
        colors.some(c => v.color.toLowerCase().includes(String(c).toLowerCase()))
      );
    }

    // Search filter
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      filteredVehicles = filteredVehicles.filter(v =>
        v.make.toLowerCase().includes(searchLower) ||
        v.model.toLowerCase().includes(searchLower) ||
        (v.trim && v.trim.toLowerCase().includes(searchLower)) ||
        (v.description && v.description.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    if (sort) {
      switch (sort) {
        case 'price_asc':
          filteredVehicles.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          filteredVehicles.sort((a, b) => b.price - a.price);
          break;
        case 'year_desc':
          filteredVehicles.sort((a, b) => b.year - a.year);
          break;
        case 'miles_asc':
          filteredVehicles.sort((a, b) => a.mileage - b.mileage);
          break;
        default:
          // Default sort by newest
          filteredVehicles.sort((a, b) => b.year - a.year);
      }
    }

    // Only return available vehicles
    filteredVehicles = filteredVehicles.filter(v => v.isAvailable);

    return res.status(200).json(filteredVehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
}
