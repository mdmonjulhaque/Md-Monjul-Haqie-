import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import crypto from "crypto";
import { Product, Category, Order, User, Coupon, Banner, Review } from "./src/types";

const app = express();
const PORT = 3000;
const DB_PATH = path.join(process.cwd(), "server_db.json");

// Express JSON parsing middleware with increased limits for Base64 image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// CRYPTO PASSWORD HASHING FUNCTION
function hashPassword(password: string): string {
  const salt = "talhagallery_secure_salt_value_1996";
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}

// DATABASE STATE INTERFACE
interface DBState {
  users: User[];
  userPasswords: Record<string, string>; // email/username -> hashed_password
  products: Product[];
  categories: Category[];
  orders: Order[];
  coupons: Coupon[];
  banners: Banner[];
  reviews: Review[];
}

// Initial Database Seeding
const DEFAULT_CATEGORIES: Category[] = [
  { id: "women", name: "Women Fashion", nameBn: "নারীদের ফ্যাশন", icon: "Shirt", count: 3 },
  { id: "men", name: "Men Fashion", nameBn: "পুরুষদের ফ্যাশন", icon: "User", count: 3 },
  { id: "kids", name: "Kids Fashion", nameBn: "শিশুদের ফ্যাশন", icon: "Baby", count: 2 },
  { id: "shoes", name: "Shoes", nameBn: "জুতো", icon: "Footprints", count: 2 },
  { id: "bags", name: "Bags", nameBn: "ব্যাগ", icon: "ShoppingBag", count: 1 },
  { id: "jewelry", name: "Jewelry", nameBn: "অলঙ্কার", icon: "Gem", count: 1 },
  { id: "accessories", name: "Accessories", nameBn: "আনুষাঙ্গিক", icon: "Watch", count: 1 }
];

const DEFAULT_BANNERS: Banner[] = [
  {
    id: "b1",
    imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80",
    title: "Summer Eid Collection 2026",
    titleBn: "সামার ঈদ কালেকশন ২০২৬",
    subtitle: "Get up to 50% discount on boutique designer outfits",
    subtitleBn: "বুটিক ডিজাইনার পোশাকে ৫০% পর্যন্ত ছাড় পান",
    link: "/category/women",
    active: true
  },
  {
    id: "b2",
    imageUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=1600&auto=format&fit=crop&q=80",
    title: "Premium Men's Heritage Wear",
    titleBn: "প্রিমিয়াম পুরুষদের ঐতিহ্যবাহী পোশাক",
    subtitle: "Exquisite Punjabi, Shirts & Traditional Loafers",
    subtitleBn: "চমৎকার পাঞ্জাবি, শার্ট এবং ঐতিহ্যবাহী লোফার",
    link: "/category/men",
    active: true
  },
  {
    id: "b3",
    imageUrl: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=1600&auto=format&fit=crop&q=80",
    title: "Kids Colorful Festive Outfits",
    titleBn: "শিশুদের রঙিন উৎসবের পোশাক",
    subtitle: "Soft, skin-friendly high quality play fabrics",
    subtitleBn: "নরম, ত্বক-বান্ধব উচ্চ মানের খেলার কাপড়",
    link: "/category/kids",
    active: true
  }
];

const DEFAULT_COUPONS: Coupon[] = [
  { code: "TALHA20", discountPercent: 20, expiryDate: "2027-12-31", active: true, description: "Get 20% flat discount on any fashion purchase!", descriptionBn: "যেকোনো ফ্যাশন ক্রয়ে সরাসরি ২০% ছাড় পান!" },
  { code: "EID50", discountPercent: 50, expiryDate: "2026-07-31", active: true, description: "Mega Festive Eid Special Campaign - 50% Off", descriptionBn: "মেগা উৎসব ঈদ স্পেশাল ক্যাম্পেইন - ৫০% ছাড়" },
  { code: "WELCOME10", discountPercent: 10, expiryDate: "2027-01-01", active: true, description: "10% match discount for new client login accounts", descriptionBn: "নতুন গ্রাহকদের জন্য ১০% সমতুল্য ছাড়" }
];

const DEFAULT_REVIEWS: Review[] = [
  { id: "r1", productId: "w1", customerName: "Sabrina Rahman", rating: 5, comment: "Absolutely gorgeous saree! The silk is very soft and royal. Highly recommended.", approved: true, createdAt: "2026-06-10" },
  { id: "r2", productId: "m1", customerName: "Arif Chowdhury", rating: 4, comment: "Fabulous slim fit shirt, nice fabric and stitching is top quality.", approved: true, createdAt: "2026-06-12" },
  { id: "r3", productId: "k1", customerName: "Imran Khan", rating: 5, comment: "The kids frock is so bright and comfortable. My daughter matches perfectly in it.", approved: false, createdAt: "2026-06-14" } // Needs approval
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "w1",
    name: "Royal Golden Silk Saree",
    nameBn: "রয়াল গোল্ডেন সিল্ক শাড়ি",
    category: "women",
    categoryBn: "নারীদের ফ্যাশন",
    description: "Experience sheer elegance with this royal banarasi golden silk saree embellished with handwoven copper zari. Ideal for weddings, festivals, and cultural events.",
    descriptionBn: "হাতে বোনা কপার জরি দিয়ে সুসজ্জিত এই রাজকীয় বেনারসি সোনালী সিল্ক শাড়ির সাথে খাঁটি কমনীয়তার অভিজ্ঞতা নিন। বিয়ে, উৎসব এবং সাংস্কৃতিক অনুষ্ঠানের জন্য উপযুক্ত।",
    brand: "Heritage Bengal",
    brandBn: "ঐতিহ্যবাহী বাংলা",
    price: 4500,
    discountPrice: 3850,
    rating: 5,
    stock: 12,
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1610030470211-1ee77f722a86?w=800&auto=format&fit=crop&q=80"
    ],
    sizes: ["Free Size"],
    colors: ["Gold", "Deep Red", "Emerald Green"],
    reviews: [DEFAULT_REVIEWS[0]],
    isPopular: true
  },
  {
    id: "w2",
    name: "Stylish Designer Georgette Kurti",
    nameBn: "স্টাইলিশ ডিজাইনার জর্জেট কুর্তি",
    category: "women",
    categoryBn: "নারীদের ফ্যাশন",
    description: "Premium floor-touch georgette kurti with hand embroidered neck design and subtle stone highlights.",
    descriptionBn: "হাতে কারুকার্য করা গলার ডিজাইন এবং সূক্ষ্ম পাথরের হাইলাইট সহ প্রিমিয়াম ফ্লোর-টাচ জর্জেট কুর্তি।",
    brand: "Aura Boutique",
    brandBn: "আওরা বুটিক",
    price: 2400,
    discountPrice: 1950,
    rating: 4.5,
    stock: 8,
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1548624149-f140c6a2b3d2?w=800&auto=format&fit=crop&q=80"
    ],
    sizes: ["M", "L", "XL"],
    colors: ["Pink", "Crimson Red", "Midnight Black"],
    reviews: [],
    isNew: true
  },
  {
    id: "m1",
    name: "Premium Oxford Cotton Casual Shirt",
    nameBn: "প্রিমিয়াম অক্সফোর্ড কটন ক্যাজুয়াল শার্ট",
    category: "men",
    categoryBn: "পুরুষদের ফ্যাশন",
    description: "100% fine combed cotton oxford casual shirt featuring a sleek classic collar, slim-fit silhouette, and contrast chest stitching.",
    descriptionBn: "১০০% সূক্ষ্ম কম্বড কটন অক্সফোর্ড ক্যাজুয়াল শার্ট, যাতে রয়েছে মসৃণ ক্লাসিক কলার, স্লিম-ফিট সিলুয়েট এবং বৈপরীত্য বুক স্টিচিং।",
    brand: "Talha Tailoring",
    brandBn: "তালহা টেইলরিং",
    price: 1800,
    discountPrice: 1390,
    rating: 4,
    stock: 20,
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&auto=format&fit=crop&q=80"
    ],
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Classic White", "Sky Blue", "Olive Green"],
    reviews: [DEFAULT_REVIEWS[1]],
    isNew: true
  },
  {
    id: "m2",
    name: "Classic Semi-Fit Heritage Punjabi",
    nameBn: "ক্লাসিক সেমি-ফিট ঐতিহ্যবাহী পাঞ্জাবি",
    category: "men",
    categoryBn: "পুরুষদের ফ্যাশন",
    description: "Comfortable slub linen-cotton hybrid Punjabi with elegant collar self-embroidery, ideal for prayers, weddings, and traditional gatherings.",
    descriptionBn: "আরামদায়ক স্ল্যাব লিনেন-কটন হাইব্রিড পাঞ্জাবি যা মার্জিত কলার এমব্রয়ডারি সহ, প্রার্থনা, বিবাহ এবং ঐতিহ্যবাহী সমাবেশের জন্য দারুণ উপযোগী।",
    brand: "Heritage Bengal",
    brandBn: "ঐতিহ্যবাহী বাংলা",
    price: 3200,
    discountPrice: 2650,
    rating: 4.8,
    stock: 3, // LOW STOCK to test inventory notifications
    images: [
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80"
    ],
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Vanilla White", "Royal Blue", "Maroon Red"],
    reviews: [],
    isPopular: true
  },
  {
    id: "k1",
    name: "Kids Floral Party Frock",
    nameBn: "বাচ্চাদের ফ্লোরাল পার্টী ফ্রক",
    category: "kids",
    categoryBn: "শিশুদের ফ্যাশন",
    description: "100% skin-safe inside lining baby party frock with premium hand embroidery details and layers of high density breathable tulle fabric.",
    descriptionBn: "১০০% শিশুর ত্বক-নিরাপদ অভ্যন্তরীণ লাইনিং সহ বেবি পার্টি ফ্রক যাতে রয়েছে প্রিমিয়াম হাতের সুই বোনা কাজ এবং স্তরে স্তরে টিউল ফ্যাব্রিক।",
    brand: "Tiny Buds",
    brandBn: "টাইনি বাডস",
    price: 1500,
    discountPrice: 1150,
    rating: 5,
    stock: 15,
    images: [
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800&auto=format&fit=crop&q=80"
    ],
    sizes: ["2-3 Yrs", "4-5 Yrs", "6-7 Yrs"],
    colors: ["Peachy Pink", "Sky Blue", "Lemon Yellow"],
    reviews: [DEFAULT_REVIEWS[2]],
    isNew: true
  },
  {
    id: "s1",
    name: "Casual Retro Sneaker Pro",
    nameBn: "ক্যাজুয়াল রেট্রো স্নিকার প্রো",
    category: "shoes",
    categoryBn: "জুতো",
    description: "Premium rubber grip, breathable knit technology sneakers, designed both for modern dynamic outfits and active schedules.",
    descriptionBn: "প্রিমিয়াম রাবার গ্রিপ ও ব্রিদাবল নিট প্রযুক্তির স্নিকার্স যা আজকের ট্রেন্ডি পোশাক এবং চটপটে দিনযাপনের জন্য সুবিধাজনক।",
    brand: "Apex Trend",
    brandBn: "এপেক্স ট্রেন্ড",
    price: 3600,
    discountPrice: 2890,
    rating: 4.6,
    stock: 5,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80"
    ],
    sizes: ["40", "41", "42", "43"],
    colors: ["Sporty Red", "Crispy White", "Midnight Onyx"],
    reviews: [],
    isPopular: true
  },
  {
    id: "b1_bag",
    name: "Luxury Premium Ladies Leather Handbag",
    nameBn: "লাক্সারি প্রিমিয়াম লেডিস লেদার হ্যান্ডব্যাগ",
    category: "bags",
    categoryBn: "ব্যাগ",
    description: "Genuine high-quality full grain leather structured handbag featuring high-grade metallic gold clasps and spacious inner compartments.",
    descriptionBn: "জেনুইন হাই-কোয়ালিটি ফুল গ্রেইন লেদার দিয়ে তৈরি মাঝারি আকারের হ্যান্ডব্যাগ যাতে রয়েছে সোনালী মেটালিক ক্ল্যাস্প ও অত্যন্ত প্রশস্ত চেম্বার।",
    brand: "Vogue Royal",
    brandBn: "ভৌগ রয়াল",
    price: 5200,
    discountPrice: 4200,
    rating: 4.7,
    stock: 6,
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=80"
    ],
    sizes: ["Standard"],
    colors: ["Classic Brown", "Midnight Tan", "Blush Pink"],
    reviews: [],
    isPopular: true
  },
  {
    id: "j1",
    name: "18K Gold Plated Luxury Waterdrop Pendant",
    nameBn: "১৮কে গোল্ড প্লেটেড লাক্সারি ওয়াটারড্রপ পেন্ডেন্ট",
    category: "jewelry",
    categoryBn: "অলঙ্কার",
    description: "Premium hypoallergenic brass pendant delicately coated in 18K gold and set with AAA grade sapphire cubic zirconia stones.",
    descriptionBn: "১৮ ক্যারেট খাঁটি সোনায় প্রলেপ দেওয়া হাইপোঅ্যালার্জেনিক পেন্ডেন্ট যাতে চকচকে এএএ গ্রেড স্যাফায়ার কিউবিক জারকোনিয়া পাথর বসানো আছে।",
    brand: "Elite Jewelers",
    brandBn: "এলিট জুয়েলার্স",
    price: 1800,
    discountPrice: 1450,
    rating: 4.9,
    stock: 0, // OUT OF STOCK to test inventory Out Of Stock alert!
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80"
    ],
    sizes: ["One Size"],
    colors: ["Royal Gold"],
    reviews: []
  },
  {
    id: "a1",
    name: "Minimalist Chrono Watch Elegant Edition",
    nameBn: "মিনিমালিস্ট ক্রোনো ওয়াচ এলিগ্যান্ট এডিশন",
    category: "accessories",
    categoryBn: "আনুষাঙ্গিক",
    description: "Premium wrist-watch with leather band, Japanese quartz chronograph mechanism, water resistant dial and high scratch tolerance crystal.",
    descriptionBn: "প্রিমিয়াম লেদার স্ট্র্যাপ রিস্ট-ওয়াচ যাতে রয়েছ জাপানি কোয়ার্টজ ক্রনোগ্রাফ মেকানিজম, ওয়াটার রেসিস্ট্যান্ট ডায়াল এবং স্ক্র্যাচ প্রুফ ক্রিস্টাল কাচ।",
    brand: "Timex Gallery",
    brandBn: "টাইমেক্স গ্যালারি",
    price: 4900,
    discountPrice: 3950,
    rating: 4.5,
    stock: 14,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&auto=format&fit=crop&q=80"
    ],
    sizes: ["Standard"],
    colors: ["Classic Tan Leather", "Luxury Black Metal"],
    reviews: []
  }
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: "TFG-84920",
    customerName: "Minhajul Karim",
    email: "minhaj@example.com",
    phone: "01855443322",
    address: "House 45, Road 12, Dhanmondi",
    district: "Dhaka",
    upazila: "Dhanmondi",
    postalCode: "1209",
    paymentMethod: "bKash",
    paymentDetails: {
      transactionId: "BK6J90B88K3",
      payTime: "2026-06-15T10:14:00Z"
    },
    items: [
      {
        productId: "m1",
        name: "Premium Oxford Cotton Casual Shirt",
        nameBn: "প্রিমিয়াম অক্সফোর্ড কটন ক্যাজুয়াল শার্ট",
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80",
        size: "L",
        color: "Sky Blue",
        quantity: 1,
        price: 1390
      }
    ],
    shippingFee: 60,
    discount: 0,
    totalAmount: 1450,
    status: "Processing",
    statusLogs: [
      { status: "Pending", timestamp: "2026-06-15T10:14:00Z", note: "Order placed successfully via bKash.", noteBn: "বিকাশ এর মাধ্যমে অর্ডারটি সফলভাবে দেওয়া হয়েছে।" },
      { status: "Confirmed", timestamp: "2026-06-15T14:30:00Z", note: "Admin verified transaction and cargo allocation.", noteBn: "অ্যাডমিন পেমেন্ট ট্রানজেকশন সফলভাবে যাচাই করেছেন।" },
      { status: "Processing", timestamp: "2026-06-16T02:00:00Z", note: "Package is ready and in transit queue.", noteBn: "প্যাকেজটি তৈরি এবং প্রেরণের অপেক্ষায় রয়েছে।" }
    ],
    trackingNumber: "TRACK-84920BKS",
    createdAt: "2026-06-15T10:14:00Z"
  }
];

// Seed administrator and customers
const DEFAULT_USERS: User[] = [
  { id: "u_admin", name: "Talha CEO", email: "mdmonjulhaque1996@gmail.com", phone: "01710237867", role: "admin", blocked: false, createdAt: "2026-01-01" },
  { id: "u_cust1", name: "Minhajul Karim", email: "minhaj@example.com", phone: "01855443322", role: "customer", blocked: false, createdAt: "2026-05-15", address: "House 45, Road 12, Dhanmondi", district: "Dhaka", upazila: "Dhanmondi" }
];

// Helper to load db state
function getDB(): DBState {
  if (fs.existsSync(DB_PATH)) {
    try {
      const data = fs.readFileSync(DB_PATH, "utf8");
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse DB, regenerating default seed", e);
    }
  }

  // Create initial DB State
  const freshState: DBState = {
    users: DEFAULT_USERS,
    userPasswords: {
      "admin@talha.com": hashPassword("mdmk1996"),
      "mdmonjulhaque1996@gmail.com": hashPassword("mdmk1996"),
      "01710237867": hashPassword("mdmk1996"),
      "talha": hashPassword("mdmk1996"),
      "minhaj@example.com": hashPassword("password123")
    },
    products: DEFAULT_PRODUCTS,
    categories: DEFAULT_CATEGORIES,
    orders: DEFAULT_ORDERS,
    coupons: DEFAULT_COUPONS,
    banners: DEFAULT_BANNERS,
    reviews: DEFAULT_REVIEWS
  };

  saveDB(freshState);
  return freshState;
}

// Helper to save db state
function saveDB(state: DBState) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2), "utf8");
  } catch (e) {
    console.error("Failed to write to DB_PATH", e);
  }
}

// Initialization check
getDB();

// API ROUTE LOGIC

// 1. Initial State / Catalog Check
app.get("/api/catalog", (req, res) => {
  const db = getDB();
  res.json({
    products: db.products,
    categories: db.categories,
    banners: db.banners,
    coupons: db.coupons.filter(c => c.active),
    reviews: db.reviews.filter(r => r.approved)
  });
});

// 2. Auth: Register / Login
app.post("/api/auth/register", (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !phone || !password) {
    res.status(400).json({ error: "All registration fields are required." });
    return;
  }

  const db = getDB();
  const existingEmail = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  const existingPhone = db.users.find(u => u.phone === phone);

  if (existingEmail || existingPhone) {
    res.status(400).json({ error: "An account with this email or phone already exists." });
    return;
  }

  const newUser: User = {
    id: "u_" + Date.now(),
    name,
    email: email.toLowerCase(),
    phone,
    role: "customer",
    blocked: false,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  db.userPasswords[email.toLowerCase()] = hashPassword(password);
  saveDB(db);

  res.json({
    success: true,
    user: newUser,
    token: `t_cust_${newUser.id}_${Date.now()}`
  });
});

app.post("/api/auth/login", (req, res) => {
  const { usernameOrEmail, password } = req.body;
  if (!usernameOrEmail || !password) {
    res.status(400).json({ error: "Username/Email and Password are required." });
    return;
  }

  const cleanUsername = String(usernameOrEmail).trim();
  const cleanPassword = String(password).trim();

  const db = getDB();
  const inputLower = cleanUsername.toLowerCase();
  const hashedInput = hashPassword(cleanPassword);

  // Check admin first: username 'talha', 'admin@talha.com', 'mdmonjulhaque1996@gmail.com', or '01710237867'
  const isAdminRequest = inputLower === "talha" || inputLower === "admin@talha.com" || inputLower === "mdmonjulhaque1996@gmail.com" || inputLower === "01710237867";
  if (isAdminRequest) {
    const adminPasswordHash = db.userPasswords["talha"] || db.userPasswords["mdmonjulhaque1996@gmail.com"] || db.userPasswords["admin@talha.com"];
    if (cleanPassword === "mdmk1996" || hashedInput === adminPasswordHash) {
      const adminUser = db.users.find(u => u.role === "admin") || {
        id: "u_admin",
        name: "Talha CEO",
        email: "mdmonjulhaque1996@gmail.com",
        phone: "01710237867",
        role: "admin",
        blocked: false,
        createdAt: "2026-01-01"
      };
      // Ensure the returned admin values are always current requested values
      adminUser.email = "mdmonjulhaque1996@gmail.com";
      adminUser.phone = "01710237867";
      res.json({
        success: true,
        user: adminUser,
        token: `t_adm_talha_${Date.now()}`
      });
      return;
    } else {
      res.status(401).json({ error: "Invalid admin password." });
      return;
    }
  }

  // Look for standard customer
  const user = db.users.find(u => u.email.toLowerCase() === inputLower || u.phone === cleanUsername);
  if (!user) {
    res.status(401).json({ error: "Account not found with this email or phone." });
    return;
  }

  if (user.blocked) {
    res.status(403).json({ error: "Your account is temporarily suspended. Contact support." });
    return;
  }

  const registeredHash = db.userPasswords[user.email.toLowerCase()];
  if (hashedInput === registeredHash) {
    res.json({
      success: true,
      user,
      token: `t_cust_${user.id}_${Date.now()}`
    });
  } else {
    res.status(401).json({ error: "Incorrect password." });
  }
});

// Update Profile
app.put("/api/auth/profile/update", (req, res) => {
  const { userId, name, phone, address, district, upazila, postalCode } = req.body;
  const db = getDB();
  const userIndex = db.users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    res.status(404).json({ error: "User not found." });
    return;
  }

  db.users[userIndex] = {
    ...db.users[userIndex],
    name: name || db.users[userIndex].name,
    phone: phone || db.users[userIndex].phone,
    address: address !== undefined ? address : db.users[userIndex].address,
    district: district !== undefined ? district : db.users[userIndex].district,
    upazila: upazila !== undefined ? upazila : db.users[userIndex].upazila,
    postalCode: postalCode !== undefined ? postalCode : db.users[userIndex].postalCode,
  };

  saveDB(db);
  res.json({ success: true, user: db.users[userIndex] });
});

// Change password
app.put("/api/auth/profile/password", (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;
  const db = getDB();
  const user = db.users.find(u => u.id === userId);

  if (!user) {
    res.status(404).json({ error: "User not found." });
    return;
  }

  const registeredHash = db.userPasswords[user.email.toLowerCase()];
  if (hashPassword(oldPassword) !== registeredHash) {
    res.status(400).json({ error: "Incorrect old password." });
    return;
  }

  db.userPasswords[user.email.toLowerCase()] = hashPassword(newPassword);
  saveDB(db);
  res.json({ success: true, message: "Password updated successfully." });
});

// 3. Products Endpoints
app.post("/api/products", (req, res) => {
  // Add product
  const db = getDB();
  const pData = req.body;
  const newProduct: Product = {
    ...pData,
    id: "p_" + Date.now(),
    price: Number(pData.price || 0),
    discountPrice: Number(pData.discountPrice || 0),
    stock: Number(pData.stock || 0),
    rating: 5,
    reviews: []
  };

  db.products.unshift(newProduct);
  saveDB(db);
  res.json({ success: true, product: newProduct });
});

app.put("/api/products/:id", (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const index = db.products.findIndex(p => p.id === id);

  if (index === -1) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  db.products[index] = {
    ...db.products[index],
    ...req.body,
    price: Number(req.body.price),
    discountPrice: Number(req.body.discountPrice),
    stock: Number(req.body.stock)
  };

  saveDB(db);
  res.json({ success: true, product: db.products[index] });
});

app.delete("/api/products/:id", (req, res) => {
  const db = getDB();
  const { id } = req.params;
  db.products = db.products.filter(p => p.id !== id);
  saveDB(db);
  res.json({ success: true });
});

// 4. Categories Endpoints
app.post("/api/categories", (req, res) => {
  const db = getDB();
  const { name, nameBn, icon } = req.body;
  const newCat: Category = {
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    nameBn,
    icon: icon || "ShoppingBag",
    count: 0
  };
  db.categories.push(newCat);
  saveDB(db);
  res.json({ success: true, category: newCat });
});

app.put("/api/categories/:id", (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const idx = db.categories.findIndex(c => c.id === id);
  if (idx !== -1) {
    db.categories[idx] = {
      ...db.categories[idx],
      name: req.body.name,
      nameBn: req.body.nameBn,
      icon: req.body.icon || db.categories[idx].icon
    };
    saveDB(db);
  }
  res.json({ success: true });
});

app.delete("/api/categories/:id", (req, res) => {
  const db = getDB();
  const { id } = req.params;
  db.categories = db.categories.filter(c => c.id !== id);
  saveDB(db);
  res.json({ success: true });
});

// 5. Orders Endpoints
app.post("/api/orders", (req, res) => {
  const db = getDB();
  const oData = req.body;

  // Verify stock for items
  for (const it of oData.items) {
    const prod = db.products.find(p => p.id === it.productId);
    if (!prod) {
      res.status(400).json({ error: `Product ${it.name} is no longer available.` });
      return;
    }
    if (prod.stock < it.quantity) {
      res.status(400).json({ error: `Insufficient stock for ${it.name}. Only ${prod.stock} left in stock.` });
      return;
    }
  }

  // Deduct stocks
  oData.items.forEach((it: any) => {
    const prod = db.products.find(p => p.id === it.productId);
    if (prod) {
      prod.stock -= it.quantity;
    }
  });

  const orderId = `TFG-${Math.floor(10000 + Math.random() * 90000)}`;
  const trackingNo = `TRACK-${Math.floor(100000 + Math.random() * 900000)}${oData.paymentMethod.substring(0,3).toUpperCase()}`;

  const newOrder: Order = {
    id: orderId,
    customerName: oData.customerName,
    email: oData.email,
    phone: oData.phone,
    address: oData.address,
    district: oData.district,
    upazila: oData.upazila,
    postalCode: oData.postalCode,
    paymentMethod: oData.paymentMethod,
    paymentDetails: {
      transactionId: oData.paymentDetails?.transactionId || "COD-PENDING",
      payTime: new Date().toISOString()
    },
    items: oData.items,
    shippingFee: oData.shippingFee,
    discount: oData.discount,
    couponCode: oData.couponCode,
    totalAmount: oData.totalAmount,
    status: "Pending",
    statusLogs: [
      {
        status: "Pending",
        timestamp: new Date().toISOString(),
        note: `Order placed successfully via ${oData.paymentMethod}. Dynamic invoice generated.`,
        noteBn: `অর্ডারটি সফলভাবে ${oData.paymentMethod} এর মাধ্যমে নেওয়া হয়েছে। ইনভয়েস তৈরি হয়েছে।`
      }
    ],
    trackingNumber: trackingNo,
    createdAt: new Date().toISOString()
  };

  db.orders.unshift(newOrder);
  saveDB(db);

  res.json({
    success: true,
    order: newOrder
  });
});

app.get("/api/orders", (req, res) => {
  const db = getDB();
  const { email } = req.query;
  if (email) {
    const custOrders = db.orders.filter(o => o.email.toLowerCase() === (email as string).toLowerCase());
    res.json(custOrders);
    return;
  }
  res.json(db.orders);
});

app.put("/api/orders/:id", (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const index = db.orders.findIndex(o => o.id === id);

  if (index === -1) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const oldStatus = db.orders[index].status;
  const newStatus = req.body.status;
  const note = req.body.note || `Status updated from ${oldStatus} to ${newStatus}.`;
  const noteBn = req.body.noteBn || `অর্ডারের অবস্থা ${oldStatus} থেকে ${newStatus} এ আপডেট করা হয়েছে।`;

  db.orders[index].status = newStatus;
  db.orders[index].statusLogs.push({
    status: newStatus,
    timestamp: new Date().toISOString(),
    note,
    noteBn
  });

  saveDB(db);
  res.json({ success: true, order: db.orders[index] });
});

// Track Order
app.get("/api/orders/track/:trackId", (req, res) => {
  const db = getDB();
  const { trackId } = req.params;
  const term = trackId.trim();
  const order = db.orders.find(o => o.id === term || o.trackingNumber === term || o.phone === term);

  if (!order) {
    res.status(404).json({ error: "Order not found." });
    return;
  }

  res.json(order);
});

// 6. Coupons Endpoints
app.get("/api/coupons", (req, res) => {
  res.json(getDB().coupons);
});

app.post("/api/coupons", (req, res) => {
  const db = getDB();
  const newCoupon: Coupon = {
    code: req.body.code.toUpperCase().trim(),
    discountPercent: Number(req.body.discountPercent),
    expiryDate: req.body.expiryDate,
    active: true,
    description: req.body.description || `Get ${req.body.discountPercent}% off!`,
    descriptionBn: req.body.descriptionBn || `পেয়ে যান ${req.body.discountPercent}% ছাড়!`
  };
  db.coupons.push(newCoupon);
  saveDB(db);
  res.json({ success: true, coupon: newCoupon });
});

app.delete("/api/coupons/:code", (req, res) => {
  const db = getDB();
  const { code } = req.params;
  db.coupons = db.coupons.filter(c => c.code !== code);
  saveDB(db);
  res.json({ success: true });
});

// 7. Banners Endpoints
app.get("/api/banners", (req, res) => {
  res.json(getDB().banners);
});

app.post("/api/banners", (req, res) => {
  const db = getDB();
  const newBanner: Banner = {
    id: "b_" + Date.now(),
    imageUrl: req.body.imageUrl,
    title: req.body.title,
    titleBn: req.body.titleBn,
    subtitle: req.body.subtitle,
    subtitleBn: req.body.subtitleBn,
    link: req.body.link,
    active: true
  };
  db.banners.push(newBanner);
  saveDB(db);
  res.json({ success: true, banner: newBanner });
});

app.delete("/api/banners/:id", (req, res) => {
  const db = getDB();
  db.banners = db.banners.filter(b => b.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// 8. Reviews Endpoints
app.get("/api/reviews", (req, res) => {
  res.json(getDB().reviews);
});

app.post("/api/reviews", (req, res) => {
  const db = getDB();
  const { productId, customerName, rating, comment } = req.body;
  const newReview: Review = {
    id: "rev_" + Date.now(),
    productId,
    customerName: customerName || "Anonymous Customer",
    rating: Number(rating || 5),
    comment,
    approved: false, // requires admin approval
    createdAt: new Date().toISOString().split("T")[0]
  };

  db.reviews.unshift(newReview);

  // Link to matching product reviews
  const pIndex = db.products.findIndex(p => p.id === productId);
  if (pIndex !== -1) {
    db.products[pIndex].reviews = db.products[pIndex].reviews || [];
    db.products[pIndex].reviews.unshift(newReview);
  }

  saveDB(db);
  res.json({ success: true, review: newReview });
});

app.put("/api/reviews/:id/approve", (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const index = db.reviews.findIndex(r => r.id === id);

  if (index !== -1) {
    db.reviews[index].approved = true;

    // Also update product reference
    db.products.forEach(p => {
      if (p.id === db.reviews[index].productId) {
        p.reviews = p.reviews || [];
        const rIndex = p.reviews.findIndex(pr => pr.id === id);
        if (rIndex !== -1) {
          p.reviews[rIndex].approved = true;
        } else {
          p.reviews.unshift(db.reviews[index]);
        }
        // update average rating
        const approvedOnly = p.reviews.filter(rev => rev.approved);
        if (approvedOnly.length > 0) {
          const sum = approvedOnly.reduce((acc, curr) => acc + curr.rating, 0);
          p.rating = Number((sum / approvedOnly.length).toFixed(1));
        }
      }
    });

    saveDB(db);
  }
  res.json({ success: true });
});

app.delete("/api/reviews/:id", (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const review = db.reviews.find(r => r.id === id);

  if (review) {
    db.reviews = db.reviews.filter(r => r.id !== id);

    // Filter out of product
    db.products.forEach(p => {
      if (p.id === review.productId && p.reviews) {
        p.reviews = p.reviews.filter(r => r.id !== id);
      }
    });

    saveDB(db);
  }
  res.json({ success: true });
});

// 9. Customers (Admin list, block, delete)
app.get("/api/customers", (req, res) => {
  const db = getDB();
  // Filter out admins from user list for client-side display
  res.json(db.users.filter(u => u.role !== "admin"));
});

app.put("/api/customers/:id/block", (req, res) => {
  const db = getDB();
  const index = db.users.findIndex(u => u.id === req.params.id);
  if (index !== -1) {
    db.users[index].blocked = !db.users[index].blocked;
    saveDB(db);
    res.json({ success: true, blocked: db.users[index].blocked });
    return;
  }
  res.status(404).json({ error: "Customer not found." });
});

app.delete("/api/customers/:id", (req, res) => {
  const db = getDB();
  db.users = db.users.filter(u => u.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// Robots.txt & Sitemap dynamically served as part of requested SEO features
app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send("User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: /sitemap.xml");
});

app.get("/sitemap.xml", (req, res) => {
  res.type("application/xml");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${process.env.APP_URL || "http://localhost:3000"}/</loc><priority>1.0</priority></url>
  <url><loc>${process.env.APP_URL || "http://localhost:3000"}/women</loc><priority>0.8</priority></url>
  <url><loc>${process.env.APP_URL || "http://localhost:3000"}/men</loc><priority>0.8</priority></url>
  <url><loc>${process.env.APP_URL || "http://localhost:3000"}/kids</loc><priority>0.7</priority></url>
  <url><loc>${process.env.APP_URL || "http://localhost:3000"}/shoes</loc><priority>0.7</priority></url>
  <url><loc>${process.env.APP_URL || "http://localhost:3000"}/bags</loc><priority>0.6</priority></url>
  <url><loc>${process.env.APP_URL || "http://localhost:3000"}/jewelry</loc><priority>0.5</priority></url>
</urlset>`;
  res.send(xml);
});


// FRONTEND DEV ENVIRONMENT MIDDLEWARE / PRODUCTION STATIC ROUTING SETUP
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Talha Fashion Gallery] Backend running on port ${PORT}`);
  });
}

startServer();
