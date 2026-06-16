import React, { useState, useEffect } from "react";
import { 
  ShoppingCart, Heart, Search, User, Eye, Trash2, Plus, Minus, 
  Check, CheckCircle2, AlertTriangle, MessageSquare, Phone, 
  ArrowLeftRight, ChevronLeft, ChevronRight, X, LogIn, LogOut, 
  Percent, HelpCircle, Shield, FileText, Lock, Globe, Star, Sparkles 
} from "lucide-react";
import { Product, Category, Order, User as UserType, Coupon, Banner, Review, CartItem, LiveMessage } from "./types";
import AdminPanel from "./AdminPanel";

// Dictionary for multilingual support
const DICTIONARY = {
  en: {
    title: "Talha Fashion Gallery",
    subtitle: "Premium Wardrobe Destination",
    trackOrder: "Track Order",
    searchPlaceholder: "Search our collection...",
    cart: "Shopping Cart",
    wishlist: "Wishlist",
    account: "Account",
    home: "HOME",
    women: "WOMEN",
    men: "MEN",
    kids: "KIDS",
    shoes: "SHOES",
    bags: "BAGS",
    jewelry: "JEWELRY",
    accessories: "ACCESSORIES",
    newArrivals: "NEW ARRIVALS",
    bestSellers: "BEST SELLERS",
    sale: "SALE",
    freeDelivery: "Free Delivery",
    securePayment: "Secure Payment",
    easyReturn: "Easy Return",
    bestQuality: "Best Quality",
    support: "24/7 Support",
    shopByCategory: "Shop By Category",
    trending: "Trending Products",
    flashSale: "Flash Sale Ends In:",
    addToCart: "Add To Cart",
    quickView: "Quick View",
    outOfStock: "Out of Stock",
    lowStock: "Low Stock Alert",
    selectSize: "Select Size:",
    selectColor: "Select Color:",
    reviews: "Product Reviews",
    submitReview: "Write a Review",
    relatedProducts: "Related Products",
    checkout: "Checkout Details",
    paymentMethod: "Payment Method",
    placeOrder: "Place Order Now",
    recentViewed: "Recently Viewed",
    compareTitle: "Product Comparison",
    compareBtn: "Compare Products",
    chatTitle: "Gallery Helpdesk",
    chatPlaceholder: "Ask our fashion assistant...",
    adminControl: "Administrative CEO Mode"
  },
  bn: {
    title: "তালহা ফ্যাশন গ্যালারি",
    subtitle: "প্রিমিয়াম পোশাকের নির্ভরযোগ্য ঠিকানা",
    trackOrder: "অর্ডার ট্র্যাক",
    searchPlaceholder: "আমাদের কালেকশন খুঁজুন...",
    cart: "শপিং কার্ট",
    wishlist: "উইশলিস্ট",
    account: "অ্যাকাউন্ট",
    home: "হোম",
    women: "নারীদের ফ্যাশন",
    men: "পুরুষদের ফ্যাশন",
    kids: "শিশুদের ফ্যাশন",
    shoes: "জুতো",
    bags: "ব্যাগ",
    jewelry: "অলঙ্কার",
    accessories: "অ্যাক্সেসরিজ",
    newArrivals: "নতুন কালেকশন",
    bestSellers: "সেরা বিক্রি",
    sale: "বিশেষ ছাড়",
    freeDelivery: "ফ্রি ডেলিভারি",
    securePayment: "নিরাপদ পেমেন্ট",
    easyReturn: "সহজ রিটার্ন",
    bestQuality: "সেরা কোয়ালিটি",
    support: "২৪/৭ কাস্টমার সাপোর্ট",
    shopByCategory: "ক্যাটাগরি অনুযায়ী কিনুন",
    trending: "চলতি ট্রেন্ডিং পণ্যসমূহ",
    flashSale: "ফ্ল্যাশ সেল শেষ হতে বাকি:",
    addToCart: "কার্টে যোগ করুন",
    quickView: "এক নজরে দেখুন",
    outOfStock: "স্টক শেষ",
    lowStock: "সীমিত স্টক অ্যালার্ট",
    selectSize: "সাইজ নির্বাচন করুন:",
    selectColor: "রঙ নির্বাচন করুন:",
    reviews: "ক্রেতাদের মতামত",
    submitReview: "আপনার রিভিউ দিন",
    relatedProducts: "সংশ্লিষ্ট অন্যান্য পণ্য",
    checkout: "চেকআউট বিবরণী",
    paymentMethod: "পেমেন্ট মাধ্যম",
    placeOrder: "অর্ডার নিশ্চিত করুন",
    recentViewed: "সম্প্রতি দেখা পণ্য",
    compareTitle: "পণ্যের তুলনা",
    compareBtn: "পণ্য তুলনা করুন",
    chatTitle: "গ্যালারি হেল্পডেস্ক",
    chatPlaceholder: "ফ্যাশন অ্যাসিস্ট্যান্টকে জিজ্ঞাসা করুন...",
    adminControl: "অ্যাডমিন প্যানেল"
  }
};

export default function App() {
  const [lang, setLang] = useState<"en" | "bn">("en");
  const [catalog, setCatalog] = useState<{
    products: Product[];
    categories: Category[];
    banners: Banner[];
    coupons: Coupon[];
    reviews: Review[];
  }>({ products: [], categories: [], banners: [], coupons: [], reviews: [] });

  const [activeSegment, setActiveSegment] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("home");

  // Cart & UI drawers
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [comparisonList, setComparisonList] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showCompare, setShowCompare] = useState(false);

  // Authentication & Session
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);
  const [authForm, setAuthForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [authError, setAuthError] = useState("");

  // Product Selection Details Modal
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [activePhoto, setActivePhoto] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

  // Banner slider automatic interval reference index
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  // Checkout page variables
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [deliveryArea, setDeliveryArea] = useState<"inside" | "outside">("inside");
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "shipping" | "done">("cart");
  const [shippingForm, setShippingForm] = useState({
    fullName: "", mobile: "", address: "", district: "Dhaka", upazila: "Dhanmondi", postalCode: "1209", paymentMethod: "Cash On Delivery"
  });
  const [placeOrderDoneId, setPlaceOrderDoneId] = useState<string | null>(null);
  const [placeOrderDoneTracking, setPlaceOrderDoneTracking] = useState<string | null>(null);

  // Order Tracking States
  const [trackingInput, setTrackingInput] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [trackError, setTrackError] = useState("");

  // Live Helpdesk Messages
  const [liveMessages, setLiveMessages] = useState<LiveMessage[]>([
    { id: "1", sender: "bot", text: "Hello! Welcome to Talha Fashion Gallery. Looking for traditional Punjabi, designer Sarees or smart accessories? Let me know, or ask about our home delivery service!", timestamp: "10:00" }
  ]);
  const [chatInput, setChatInput] = useState("");

  // Flash sale timer counters
  const [flashTime, setFlashTime] = useState({ hours: 14, minutes: 42, seconds: 59 });

  // Load Catalog and session data from server
  useEffect(() => {
    fetchCatalog();
    
    // Load local storage states
    const localUser = localStorage.getItem("tfg_user");
    if (localUser) setCurrentUser(JSON.parse(localUser));

    const localCart = localStorage.getItem("tfg_cart");
    if (localCart) setCart(JSON.parse(localCart));

    const localWishlist = localStorage.getItem("tfg_wishlist");
    if (localWishlist) setWishlist(JSON.parse(localWishlist));
  }, []);

  // Save Cart and wishlist to localStorage on updates
  useEffect(() => {
    localStorage.setItem("tfg_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("tfg_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Flash Sale Timer Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setFlashTime(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 }; // Restart cycle
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto Slider Hero Banner
  useEffect(() => {
    if (catalog.banners.length === 0) return;
    const interval = setInterval(() => {
      setActiveBannerIdx(prev => (prev + 1) % catalog.banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [catalog.banners]);

  const fetchCatalog = async () => {
    try {
      const res = await fetch("/api/catalog");
      const data = await res.json();
      setCatalog(data);
    } catch (e) {
      console.error("Error loading product catalog", e);
    }
  };

  // Switch multilingual
  const toggleLang = () => setLang(prev => (prev === "en" ? "bn" : "en"));
  const t = DICTIONARY[lang];

  // Auth Submit Handlers
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const isLogin = authModal === "login";
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const payload = isLogin 
      ? { usernameOrEmail: authForm.email, password: authForm.password }
      : { name: authForm.name, email: authForm.email, phone: authForm.phone, password: authForm.password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setCurrentUser(data.user);
        localStorage.setItem("tfg_user", JSON.stringify(data.user));
        setAuthModal(null);
        setAuthForm({ name: "", email: "", phone: "", password: "" });
      } else {
        setAuthError(data.error || "Authentication check failed.");
      }
    } catch (err) {
      setAuthError("Failed to reach the database server.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("tfg_user");
    setActiveTab("home");
  };

  // Add Item to cart
  const addToCartAction = (product: Product, size: string, color: string) => {
    const finalSize = size || product.sizes[0] || "Standard";
    const finalColor = color || product.colors[0] || "Classic";
    const cartItemId = `${product.id}-${finalSize}-${finalColor}`;

    const existing = cart.find(it => it.id === cartItemId);
    if (existing) {
      setCart(cart.map(it => it.id === cartItemId ? { ...it, quantity: it.quantity + 1 } : it));
    } else {
      setCart([...cart, { id: cartItemId, product, selectedSize: finalSize, selectedColor: finalColor, quantity: 1 }]);
    }
    setShowCartDrawer(true);
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(cart.map(it => {
      if (it.id === id) {
        const newQty = Math.max(1, it.quantity + delta);
        return { ...it, quantity: newQty };
      }
      return it;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(it => it.id !== id));
  };

  // Wishlist Actions
  const toggleWishlist = (product: Product) => {
    const exists = wishlist.some(p => p.id === product.id);
    if (exists) {
      setWishlist(wishlist.filter(p => p.id !== product.id));
    } else {
      setWishlist([...wishlist, product]);
    }
  };

  // Comparison Board Actions
  const toggleComparison = (product: Product) => {
    const exists = comparisonList.some(p => p.id === product.id);
    if (exists) {
      setComparisonList(comparisonList.filter(p => p.id !== product.id));
    } else {
      if (comparisonList.length >= 3) {
        alert("You can compare up to 3 models at a time!");
        return;
      }
      setComparisonList([...comparisonList, product]);
    }
  };

  // Quick View Action
  const handleQuickViewSet = (product: Product) => {
    setQuickViewProduct(product);
    setActivePhoto(product.images && product.images[0] ? product.images[0] : "");
    setSelectedSize(product.sizes[0] || "Free Size");
    setSelectedColor(product.colors[0] || "Default");
    
    // Add to recently viewed products
    if (!recentlyViewed.some(p => p.id === product.id)) {
      setRecentlyViewed([product, ...recentlyViewed.slice(0, 4)]);
    }
  };

  // Submit buyer review
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickViewProduct) return;
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: quickViewProduct.id,
          customerName: currentUser?.name || "Verified Customer",
          rating: reviewForm.rating,
          comment: reviewForm.comment
        })
      });
      if (res.ok) {
        alert("Your review has been captured and sent for Admin Approval!");
        setReviewForm({ rating: 5, comment: "" });
        fetchCatalog(); // Refresh catalog to fetch potential updates
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Category and Search Filtering
  const filteredProducts = catalog.products.filter(p => {
    // Brand or Name match
    const matchesSearch = searchQuery === "" || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.nameBn.includes(searchQuery) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));

    // Segment Filter
    const matchesCategory = activeSegment === "all" || p.category === activeSegment;
    const matchesTab = activeTab === "home" || activeTab === "sale" || 
      (activeTab === "women" && p.category === "women") ||
      (activeTab === "men" && p.category === "men") ||
      (activeTab === "kids" && p.category === "kids") ||
      (activeTab === "shoes" && p.category === "shoes") ||
      (activeTab === "bags" && p.category === "bags") ||
      (activeTab === "jewelry" && p.category === "jewelry") ||
      (activeTab === "accessories" && p.category === "accessories") ||
      (activeTab === "new" && p.isNew) ||
      (activeTab === "bestseller" && p.isPopular);

    return matchesSearch && matchesCategory && matchesTab;
  });

  // Coupon Verification
  const verifyCouponAction = () => {
    const matched = catalog.coupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase());
    if (matched) {
      setAppliedCoupon(matched);
      alert(`Coupon code successfully applied! ${matched.discountPercent}% flat savings activated.`);
    } else {
      alert("Invalid promotional code.");
      setAppliedCoupon(null);
    }
  };

  // Cart financial computation
  const cartSubtotal = cart.reduce((acc, curr) => {
    const pr = curr.product.discountPrice || curr.product.price;
    return acc + (pr * curr.quantity);
  }, 0);

  const shippingCost = deliveryArea === "inside" ? 60 : 120;
  const couponDiscount = appliedCoupon ? Math.round((cartSubtotal * appliedCoupon.discountPercent) / 100) : 0;
  const cartGrandTotal = cartSubtotal + shippingCost - couponDiscount;

  // Checkout order placement
  const handlePlaceOrder = async () => {
    if (!shippingForm.fullName || !shippingForm.mobile || !shippingForm.address) {
      alert("Please specify the recipient's Delivery Information.");
      return;
    }

    const payload = {
      customerName: shippingForm.fullName,
      email: currentUser?.email || "guest@talha.com",
      phone: shippingForm.mobile,
      address: shippingForm.address,
      district: shippingForm.district,
      upazila: shippingForm.upazila,
      postalCode: shippingForm.postalCode,
      paymentMethod: shippingForm.paymentMethod,
      items: cart.map(it => ({
        productId: it.product.id,
        name: it.product.name,
        nameBn: it.product.nameBn,
        image: it.product.images[0],
        size: it.selectedSize,
        color: it.selectedColor,
        quantity: it.quantity,
        price: it.product.discountPrice || it.product.price
      })),
      shippingFee: shippingCost,
      discount: couponDiscount,
      couponCode: appliedCoupon?.code,
      totalAmount: cartGrandTotal
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setPlaceOrderDoneId(data.order.id);
        setPlaceOrderDoneTracking(data.order.trackingNumber);
        setCheckoutStep("done");
        setCart([]); // Clear cart
      } else {
        alert(data.error || "Failed to process order.");
      }
    } catch (err) {
      alert("Error sending order packet to servers.");
    }
  };

  // Tracking query
  const trackSpecificOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError("");
    setTrackedOrder(null);
    if (!trackingInput.trim()) return;

    try {
      const res = await fetch(`/api/orders/track/${trackingInput.trim()}`);
      if (res.ok) {
        const data = await res.json();
        setTrackedOrder(data);
      } else {
        setTrackError("Invalid Tracking Number or Order Ref. Verify and retry.");
      }
    } catch (err) {
      setTrackError("Error query matching order tracker logs.");
    }
  };

  // Chat message engine response logic
  const handleChatSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: LiveMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setLiveMessages(prev => [...prev, userMsg]);
    setChatInput("");

    // Simulate smart customer assistance response
    setTimeout(() => {
      let replyText = "I have recorded your question. A Talha customer representative from Dhanmondi HQ will follow up shortly!";
      const textLower = userMsg.text.toLowerCase();

      if (textLower.includes("delivery") || textLower.includes("shipping") || textLower.includes("পার্সেল")) {
        replyText = "We deliver country-wide! Delivery inside Dhaka is ৳60 (takes 1-2 days). Outside Dhaka is ৳120 (takes 3-4 days). Same-day urgent delivery is available upon phone request.";
      } else if (textLower.includes("bkash") || textLower.includes("payment") || textLower.includes("পেমেন্ট") || textLower.includes("বিকাশ")) {
        replyText = "We accept bKash, Nagad, Rocket and Cash On Delivery! For international customers, secure Stripe and PayPal options are supported at checkout.";
      } else if (textLower.includes("size") || textLower.includes("ফিট") || textLower.includes("সাইজ")) {
        replyText = "All fashion apparel follows standard Bangladeshi slim-fit and comfort sizes. Custom measurements are available for tailored Punjabi wear.";
      } else if (textLower.includes("return") || textLower.includes("রিটার্ন") || textLower.includes("ফেরত")) {
        replyText = "We offer a 7-day hassle-free return policy. If you receive a wrong size, color, or a manufacturing defect, let us know for a free exchange.";
      }

      setLiveMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1000);
  };

  return (
    <div className="bg-[#0A0A0A] min-h-screen text-white font-sans selection:bg-[#D4AF37] selection:text-black">
      
      {/* 1. Header (Navigation & Branding) */}
      <header className="border-b border-white/10 sticky top-0 bg-[#0A0A0A]/95 backdrop-blur z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Multilingual Toggle */}
          <div className="flex items-center gap-4">
            <div className="cursor-pointer" onClick={() => { setActiveTab("home"); setActiveSegment("all"); }}>
              <span className="text-xl font-serif italic tracking-tighter leading-tight text-white block hover:text-[#D4AF37] transition-colors font-extrabold select-none">
                Talha Fashion Gallery
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#D4AF37] block font-bold leading-none mt-0.5">
                তালহা ফ্যাশন গ্যালারি
              </span>
            </div>

            {/* Language Flag Switch */}
            <button 
              onClick={toggleLang}
              className="flex items-center gap-1.5 text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded hover:bg-[#D4AF37] hover:text-black hover:border-transparent font-bold transition-all uppercase tracking-widest"
            >
              <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
              {lang === "en" ? "বাংলা" : "English"}
            </button>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <input 
              type="text" 
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full search-input py-2 pl-4 pr-10 text-xs rounded text-white placeholder-gray-400 focus:outline-none focus:border-[#D4AF37]"
            />
            <div className="absolute right-3 top-2.5 text-gray-400">
              <Search className="w-4 h-4" />
            </div>
          </div>

          {/* Action widgets */}
          <div className="flex items-center gap-5">
            
            {/* Custom Track Order Shortcut */}
            <button 
              onClick={() => setActiveTab("track")}
              className="hidden sm:inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest border border-white/20 px-3.5 py-1.5 rounded transition hover:border-[#D4AF37] hover:text-[#D4AF37]"
            >
              {t.trackOrder}
            </button>

            {/* Dynamic Comparison Badge */}
            {comparisonList.length > 0 && (
              <button 
                onClick={() => setShowCompare(true)}
                className="relative bg-white/5 p-2 rounded hover:text-[#D4AF37]"
                title="Product comparison board"
              >
                <ArrowLeftRight className="w-4 h-4 text-yellow-400" />
                <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {comparisonList.length}
                </span>
              </button>
            )}

            {/* Wishlist Link */}
            <button 
              onClick={() => setActiveTab("dashboard")}
              className="relative hover:text-[#D4AF37] transition"
            >
              <Heart className="w-5 h-5 text-gray-300 hover:text-rose-500" />
              {wishlist.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[9px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Icon */}
            <button 
              onClick={() => setShowCartDrawer(true)}
              className="relative hover:text-[#D4AF37] transition flex items-center gap-1"
            >
              <ShoppingCart className="w-5 h-5 text-gray-300" />
              <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-black text-[9px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center">
                {cart.length}
              </span>
            </button>

            {/* Customer Session Dashboard Trigger */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setActiveTab("dashboard")}
                  className="flex items-center gap-1.5 text-xs text-[#D4AF37] font-bold tracking-wider hover:underline"
                >
                  <User className="w-4 h-4 text-[#D4AF37]" />
                  <span className="hidden lg:inline">{currentUser.name.split(" ")[0]}</span>
                </button>
                <button onClick={handleLogout} className="text-gray-400 hover:text-white" title="Logout">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setAuthModal("login")}
                className="flex items-center gap-1 bg-[#D4AF37] text-black font-bold px-3 py-1.5 rounded text-xs uppercase tracking-widest transition hover:bg-yellow-500"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.account}</span>
              </button>
            )}

          </div>
        </div>
      </header>

      {/* 2. Navigation bar with categories */}
      <nav className="border-b border-white/5 bg-black/40 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 flex justify-between md:justify-center items-center gap-6 sm:gap-8 h-11 text-xs whitespace-nowrap">
          {[
            { id: "home", label: t.home },
            { id: "women", label: t.women },
            { id: "men", label: t.men },
            { id: "kids", label: t.kids },
            { id: "shoes", label: t.shoes },
            { id: "bags", label: t.bags },
            { id: "jewelry", label: t.jewelry },
            { id: "accessories", label: t.accessories },
            { id: "new", label: t.newArrivals },
            { id: "bestseller", label: t.bestSellers },
            { id: "sale", label: t.sale, color: "text-[#D4AF37] font-bold" }
          ].map(lnk => (
            <button
              key={lnk.id}
              onClick={() => { setActiveTab(lnk.id); setActiveSegment("all"); }}
              className={`nav-link text-[11px] uppercase tracking-wider transition ${lnk.color || "text-gray-300"} ${
                activeTab === lnk.id ? "border-b border-[#D4AF37] text-[#D4AF37] pb-1 font-extrabold" : ""
              }`}
            >
              {lnk.label}
            </button>
          ))}
          <button 
            onClick={() => setActiveTab("admin")}
            className="text-[10px] border border-[#D4AF37]/30 px-2.5 py-0.5 rounded text-[#D4AF37] font-bold tracking-widest hover:bg-[#D4AF37]/10"
          >
            {t.adminControl}
          </button>
        </div>
      </nav>

      {/* Main Content routing containers */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        
        {/* CHECK FOR ADMIN DISPLAY */}
        {activeTab === "admin" ? (
          <AdminPanel 
            catalog={catalog} 
            onRefreshCatalog={fetchCatalog} 
            lang={lang} 
            currentUser={currentUser}
            onUserLogin={(user) => setCurrentUser(user)}
          />
        ) : activeTab === "track" ? (
          
          /* TRACK ORDER INTERACTIVE BOARD */
          <div className="max-w-xl mx-auto dark-card p-8 rounded-2xl shadow-xl space-y-6">
            <div className="text-center">
              <Phone className="w-10 h-10 text-[#D4AF37] mx-auto mb-2" />
              <h2 className="text-2xl font-serif italic text-white">Live Logistics Tracker</h2>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Verify order process status logs in real-time</p>
            </div>

            <form onSubmit={trackSpecificOrder} className="flex gap-2">
              <input 
                type="text" 
                required
                value={trackingInput}
                onChange={e => setTrackingInput(e.target.value)}
                placeholder="Enter Order ID (e.g. TFG-84920) or Phone"
                className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]"
              />
              <button type="submit" className="gold-bg text-black px-6 py-2 rounded text-xs uppercase tracking-widest font-extrabold">
                Locate
              </button>
            </form>

            {trackError && <p className="text-xs text-red-400 text-center">{trackError}</p>}

            {trackedOrder && (
              <div className="border border-white/5 p-4 rounded-lg bg-black/40 space-y-4 text-xs">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <div>
                    <p className="font-bold text-white uppercase text-[#D4AF37]">Reference: {trackedOrder.id}</p>
                    <p className="text-[10px] text-gray-500">Tracking Code: {trackedOrder.trackingNumber}</p>
                  </div>
                  <span className="gold-bg text-black font-bold uppercase text-[10px] px-2.5 py-1 rounded">
                    {trackedOrder.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-white mb-1">Shipping Log Pathway:</h4>
                  <div className="space-y-3 mt-2 pl-2 border-l border-white/10">
                    {trackedOrder.statusLogs.map((log, idx) => (
                      <div key={idx} className="relative pl-4">
                        <div className="absolute -left-[11px] top-1 w-2.5 h-2.5 bg-[#D4AF37] rounded-full"></div>
                        <p className="font-semibold text-white uppercase text-[10px]">{log.status} Stage</p>
                        <p className="text-gray-400 text-xs mt-0.5">{lang === 'en' ? log.note : log.noteBn}</p>
                        <span className="text-[9px] text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === "dashboard" ? (
          
          /* MULTI-TAB CUSTOMER DASHBOARD AREA */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Sidebar navigation */}
            <div className="dark-card p-6 rounded-xl space-y-4 lg:col-span-1">
              <div className="text-center pb-4 border-b border-white/15">
                <div className="w-16 h-16 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <User className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <h3 className="font-serif italic font-bold text-lg text-white">{currentUser?.name || "Premium Guest"}</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">{currentUser?.email || "guest@talha.com"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase px-2 mb-2">My Profile Folders</p>
                <div className="px-3 py-1.5 text-xs text-bold bg-white/5 rounded text-white">{t.wishlist} ({wishlist.length})</div>
              </div>
            </div>

            {/* Content main */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Wishlist grid items */}
              <div className="dark-card p-6 rounded-xl space-y-4">
                <h3 className="text-lg font-serif italic text-white flex items-center gap-1.5">
                  <Heart className="w-5 h-5 text-rose-500" />
                  Your Wardrobe Favorites ({wishlist.length} Items)
                </h3>
                
                {wishlist.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Favorites shelf is currently empty. Tap the heart icon inside store catalogs!</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {wishlist.map(p => (
                      <div key={p.id} className="dark-card rounded-lg overflow-hidden flex flex-col justify-between">
                        <div className="h-44 bg-black relative">
                          <img src={p.images[0]} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-3">
                          <h4 className="text-xs font-bold text-white truncate">{lang === 'en' ? p.name : p.nameBn}</h4>
                          <span className="text-[#D4AF37] font-bold text-xs mt-1 block">৳{p.discountPrice || p.price} BDT</span>
                          <button 
                            onClick={() => addToCartAction(p, "", "")}
                            className="mt-3 w-full py-1.5 gold-bg text-black text-[10px] font-bold uppercase tracking-widest rounded"
                          >
                            {t.addToCart}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          
          /* CORE STOREFRONT HOMEPAGE STAGE */
          <>
            {/* 3. Hero rotating banner slider */}
            {catalog.banners.length > 0 && (
              <div className="relative h-80 rounded-2xl overflow-hidden shadow-2xl transition-all duration-700">
                <div className="absolute inset-0 bg-black/60 z-10"></div>
                <img 
                  src={catalog.banners[activeBannerIdx]?.imageUrl} 
                  alt="Talha Banner background" 
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
                />

                <div className="absolute inset-0 z-20 p-8 flex flex-col justify-center max-w-2xl">
                  <div className="space-y-4">
                    <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-3 py-1 rounded-full">
                      Exclusive Campaign 2026
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-serif italic text-white leading-tight">
                      {lang === "en" ? catalog.banners[activeBannerIdx]?.title : catalog.banners[activeBannerIdx]?.titleBn}
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-300 max-w-md">
                      {lang === "en" ? catalog.banners[activeBannerIdx]?.subtitle : catalog.banners[activeBannerIdx]?.subtitleBn}
                    </p>
                    <div className="pt-2 flex gap-3">
                      <button 
                        onClick={() => { setActiveTab("sale"); }}
                        className="gold-bg text-black hover:bg-yellow-500 text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded shadow"
                      >
                        Shop Campaign Now
                      </button>
                    </div>
                  </div>
                </div>

                {/* Left/Right manual slide controls */}
                <button 
                  onClick={() => setActiveBannerIdx(prev => (prev - 1 + catalog.banners.length) % catalog.banners.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/40 border border-white/10 p-2 rounded-full hover:bg-[#D4AF37] hover:text-black hover:border-transparent transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setActiveBannerIdx(prev => (prev + 1) % catalog.banners.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/40 border border-white/10 p-2 rounded-full hover:bg-[#D4AF37] hover:text-black hover:border-transparent transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* 4. Active Service features grid */}
            <div className="service-bar py-4 grid grid-cols-2 md:grid-cols-5 text-center text-[10px] uppercase tracking-widest text-[#D4AF37] gap-4 font-bold bg-[#111111]/40 rounded-xl">
              <div className="flex items-center justify-center gap-1.5"><span>✓</span> {t.freeDelivery}</div>
              <div className="flex items-center justify-center gap-1.5"><span>✓</span> {t.securePayment}</div>
              <div className="flex items-center justify-center gap-1.5"><span>✓</span> {t.easyReturn}</div>
              <div className="flex items-center justify-center gap-1.5"><span>✓</span> {t.bestQuality}</div>
              <div className="flex items-center justify-center gap-1.5"><span>✓</span> {t.support}</div>
            </div>

            {/* Active Flash sale active layout */}
            <div className="dark-card p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-red-950/20 to-black gap-4 border-l-4 border-red-500">
              <div className="space-y-1">
                <h3 className="text-lg font-serif italic text-white font-extrabold flex items-center gap-1.5">
                  <span className="animate-pulse w-2 h-2 rounded-full bg-red-500"></span>
                  Festive Flash Sale live Campaign!
                </h3>
                <p className="text-xs text-gray-400">Get up to 50% discount flat on premium silk Punjabi & boutique designer Sarees.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-gray-300 font-bold">{t.flashSale}</span>
                <div className="flex gap-1.5 text-xs font-mono">
                  <span className="bg-red-950 text-red-400 border border-red-500/20 px-2 py-1 rounded font-bold">{String(flashTime.hours).padStart(2, '0')}h</span>
                  <span className="bg-red-950 text-red-400 border border-red-500/20 px-2 py-1 rounded font-bold">{String(flashTime.minutes).padStart(2, '0')}m</span>
                  <span className="bg-red-950 text-red-400 border border-red-500/20 px-2 py-1 rounded font-bold">{String(flashTime.seconds).padStart(2, '0')}s</span>
                </div>
              </div>
            </div>

            {/* 5. Shop By Category row */}
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-bold">{t.shopByCategory}</p>
              <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                {catalog.categories.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => { setActiveSegment(cat.id); }}
                    className={`flex-shrink-0 cursor-pointer dark-card px-5 py-3 rounded-xl transition-all ${
                      activeSegment === cat.id 
                        ? "bg-[#D4AF37] text-black border-transparent font-bold" 
                        : "bg-[#151515] text-gray-300 hover:border-[#D4AF37]/50"
                    }`}
                  >
                    <span className="text-xs tracking-wider block font-bold uppercase">{lang === 'en' ? cat.name : cat.nameBn}</span>
                  </button>
                ))}
                <button 
                  onClick={() => setActiveSegment("all")}
                  className={`flex-shrink-0 px-5 py-3 rounded-xl text-xs uppercase font-extrabold transition-all ${
                    activeSegment === "all" ? "bg-[#D4AF37] text-black" : "bg-[#151515] border border-white/5 hover:border-[#D4AF37]"
                  }`}
                >
                  Show All Segment
                </button>
              </div>
            </div>

            {/* 6. Trending Products Grid */}
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-serif italic text-white flex items-center gap-1.5">
                    <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                    {t.trending}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Selected signature fashion pieces</p>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] border-b border-[#D4AF37] pb-0.5">
                  Showing {filteredProducts.length} Wardrobe Designs
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map(p => {
                  const isFav = wishlist.some(fav => fav.id === p.id);
                  const isCompared = comparisonList.some(c => c.id === p.id);
                  return (
                    <div key={p.id} className="dark-card rounded-xl overflow-hidden group flex flex-col justify-between relative transition-all duration-300 hover:border-[#D4AF37]/30 shadow-lg">
                      
                      {/* Badge info */}
                      {p.discountPrice && (
                        <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 uppercase rounded">
                          SALE OFF
                        </div>
                      )}

                      {p.stock === 0 && (
                        <div className="absolute top-2 right-2 z-10 bg-red-950 text-red-400 border border-red-500/20 text-[9px] font-bold px-1.5 py-0.5 uppercase rounded">
                          {t.outOfStock}
                        </div>
                      )}

                      {/* Photo wrapper */}
                      <div className="h-56 bg-black relative overflow-hidden">
                        <img 
                          src={p.images[0]} 
                          alt={p.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                          
                          {/* Wishlist toggle */}
                          <button 
                            onClick={() => toggleWishlist(p)}
                            className={`p-2 rounded-full transition ${isFav ? "bg-rose-600 text-white" : "bg-black/60 text-white hover:bg-rose-600"}`}
                          >
                            <Heart className="w-4 h-4" />
                          </button>

                          {/* Quick view */}
                          <button 
                            onClick={() => handleQuickViewSet(p)}
                            className="bg-[#D4AF37] text-black hover:bg-yellow-500 p-2.5 rounded-full transition font-bold"
                            title={t.quickView}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Comparison checkbox switch */}
                          <button 
                            onClick={() => toggleComparison(p)}
                            className={`p-2 rounded-full transition ${isCompared ? "bg-blue-600 text-white" : "bg-black/60 text-white hover:bg-blue-600"}`}
                            title="Add to product compare log"
                          >
                            <ArrowLeftRight className="w-4 h-4" />
                          </button>

                        </div>
                      </div>

                      {/* Descriptions */}
                      <div className="p-4 flex flex-col justify-between flex-1">
                        <div>
                          <div className="flex justify-between items-center text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                            <span>{p.brand}</span>
                            <span className="text-[#D4AF37]">{p.category}</span>
                          </div>
                          
                          <h3 className="text-sm font-bold text-white leading-tight group-hover:text-[#D4AF37] transition-colors">
                            {lang === "en" ? p.name : p.nameBn}
                          </h3>

                          {/* Ratings */}
                          <div className="flex text-yellow-400 text-xs my-1.5 items-center gap-1">
                            <span>{"★".repeat(Math.round(p.rating || 5))}</span>
                            <span className="text-gray-500 text-[10px]">({p.rating || 5}.0)</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-base font-extrabold text-[#D4AF37]">৳{p.discountPrice || p.price} BDT</span>
                            {p.discountPrice && (
                              <span className="text-xs line-through text-gray-500">৳{p.price}</span>
                            )}
                          </div>

                          {p.stock > 0 ? (
                            <button 
                              onClick={() => addToCartAction(p, p.sizes[0], p.colors[0])}
                              className="mt-4 w-full bg-white/5 text-xs text-white hover:bg-[#D4AF37] hover:text-black font-semibold tracking-wider uppercase py-2 border border-white/10 rounded transition"
                            >
                              {t.addToCart}
                            </button>
                          ) : (
                            <button 
                              disabled
                              className="mt-4 w-full bg-red-950/20 text-red-500 text-xs font-semibold py-2 rounded pointer-events-none uppercase border border-red-500/10"
                            >
                              {t.outOfStock}
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12 dark-card rounded-xl">
                  <AlertTriangle className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 italic">No designs match search criteria. Reset segment filters.</p>
                </div>
              )}
            </div>

            {/* Recently Viewed Products Banner */}
            {recentlyViewed.length > 0 && (
              <div className="dark-card p-6 rounded-2xl space-y-4">
                <h3 className="text-sm uppercase tracking-widest text-gray-400 font-bold">{t.recentViewed}</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {recentlyViewed.map(p => (
                    <div key={p.id} onClick={() => handleQuickViewSet(p)} className="cursor-pointer space-y-2 group">
                      <div className="h-28 rounded-lg overflow-hidden bg-black">
                        <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition" />
                      </div>
                      <p className="text-xs text-white font-bold truncate">{lang === 'en' ? p.name : p.nameBn}</p>
                      <p className="text-[11px] text-[#D4AF37] font-bold">৳{p.discountPrice || p.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* 7. Product page Details View overlay Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121212] border border-white/15 max-w-4xl w-full rounded-2xl overflow-hidden shadow-2xl relative block md:flex max-h-[90vh]">
            
            {/* Close */}
            <button 
              onClick={() => setQuickViewProduct(null)} 
              className="absolute top-4 right-4 z-10 bg-white/5 hover:bg-white/10 p-2 rounded-full"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            {/* Photos */}
            <div className="w-full md:w-1/2 bg-black flex flex-col justify-between p-4">
              <div className="h-72 w-full rounded-xl overflow-hidden bg-zinc-900">
                <img src={activePhoto || quickViewProduct.images[0]} className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {quickViewProduct.images.map((img, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setActivePhoto(img)}
                    className={`w-16 h-12 bg-zinc-800 rounded overflow-hidden flex-shrink-0 cursor-pointer border ${
                      (activePhoto || quickViewProduct.images[0]) === img ? "border-[#D4AF37] ring-1 ring-[#D4AF37]" : "border-white/10"
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="w-full md:w-1/2 p-6 overflow-y-auto max-h-[80vh] space-y-5">
              <div>
                <span className="text-[10px] text-[#D4AF37] font-bold tracking-widest uppercase">{quickViewProduct.brand} • {quickViewProduct.category}</span>
                <h2 className="text-2xl font-serif italic text-white mt-1">
                  {lang === "en" ? quickViewProduct.name : quickViewProduct.nameBn}
                </h2>
                
                {/* Prices */}
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-xl font-bold text-[#D4AF37]">৳{quickViewProduct.discountPrice || quickViewProduct.price} BDT</span>
                  {quickViewProduct.discountPrice && (
                    <span className="text-xs line-through text-gray-500">৳{quickViewProduct.price}</span>
                  )}
                </div>
              </div>

              {/* Description box */}
              <p className="text-xs text-gray-400 leading-relaxed border-t border-white/5 pt-3">
                {lang === "en" ? quickViewProduct.description : quickViewProduct.descriptionBn}
              </p>

              {/* Color selections */}
              <div className="space-y-2">
                <span className="text-xs text-gray-400 uppercase font-bold">{t.selectColor}</span>
                <div className="flex gap-2">
                  {quickViewProduct.colors.map(col => (
                    <button 
                      key={col}
                      onClick={() => setSelectedColor(col)}
                      className={`text-xs px-3 py-1 rounded bg-white/5 border text-white transition ${
                        selectedColor === col ? "border-[#D4AF37] text-[#D4AF37]" : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size selections */}
              <div className="space-y-2">
                <span className="text-xs text-gray-400 uppercase font-bold">{t.selectSize}</span>
                <div className="flex gap-2">
                  {quickViewProduct.sizes.map(sz => (
                    <button 
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`text-xs px-3 py-1 rounded bg-white/5 border text-white transition ${
                        selectedSize === sz ? "border-[#D4AF37] text-[#D4AF37]" : "border-white/10"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button 
                  onClick={() => { addToCartAction(quickViewProduct, selectedSize, selectedColor); setQuickViewProduct(null); }}
                  className="flex-1 gold-bg text-black font-extrabold text-xs uppercase tracking-wider py-3 rounded"
                >
                  Buy Dynamic Outfit
                </button>
              </div>

              {/* User Ratings & Submit comments */}
              <div className="border-t border-white/5 pt-4 space-y-4">
                <h4 className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">{t.reviews} ({quickViewProduct.reviews?.length || 0})</h4>
                
                {/* Feedback form */}
                <form onSubmit={handleReviewSubmit} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 uppercase">Rate:</span>
                    <select 
                      value={reviewForm.rating}
                      onChange={e => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                      className="bg-black text-[#D4AF37] border border-white/10 text-xs rounded px-2 py-1"
                    >
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                      <option value="1">1 Star</option>
                    </select>
                  </div>
                  <input 
                    type="text" 
                    required 
                    placeholder="Write your review comment here..." 
                    value={reviewForm.comment}
                    onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                  <button type="submit" className="text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 px-3 py-1 rounded hover:bg-[#D4AF37] hover:text-black uppercase font-bold tracking-widest transition">
                    {t.submitReview}
                  </button>
                </form>

                <div className="space-y-2 mt-2">
                  {catalog.reviews.filter(r => r.productId === quickViewProduct.id).map((r, i) => (
                    <div key={i} className="dark-card p-3 rounded text-[11px] space-y-1">
                      <div className="flex justify-between text-gray-400">
                        <span className="font-bold">{r.customerName}</span>
                        <span>{"★".repeat(r.rating)}</span>
                      </div>
                      <p className="italic text-gray-300">"{r.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 8. Shopping Cart Drawer overlay */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 bg-black/80 flex justify-end">
          <div className="bg-[#121212] border-l border-white/10 w-full max-w-md h-full flex flex-col justify-between p-6 shadow-2xl">
            
            {/* Header drawer */}
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <span className="text-lg font-serif italic text-white flex items-center gap-1.5">
                <ShoppingCart className="w-5 h-5 text-[#D4AF37]" />
                {t.cart} ({cart.length})
              </span>
              <button onClick={() => setShowCartDrawer(false)} className="p-1 px-2.5 bg-white/5 rounded text-xs">
                Close [✕]
              </button>
            </div>

            {/* Cart products stream list */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 no-scrollbar">
              {cart.map(it => {
                const itemPrice = it.product.discountPrice || it.product.price;
                return (
                  <div key={it.id} className="dark-card p-3 rounded-lg flex gap-3 relative">
                    <img src={it.product.images[0]} className="w-16 h-16 rounded object-cover" />
                    <div className="flex-1 min-w-0 text-xs">
                      <h4 className="font-bold text-white truncate">{lang === 'en' ? it.product.name : it.product.nameBn}</h4>
                      <p className="text-[10px] text-gray-400 capitalize">Color: {it.selectedColor} | Size: {it.selectedSize}</p>
                      
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center bg-black rounded border border-white/10">
                          <button onClick={() => updateCartQuantity(it.id, -1)} className="p-1 text-gray-400 hover:text-white"><Minus className="w-3 h-3" /></button>
                          <span className="px-2.5 py-0.5 text-xs text-white font-mono font-bold">{it.quantity}</span>
                          <button onClick={() => updateCartQuantity(it.id, 1)} className="p-1 text-gray-400 hover:text-white"><Plus className="w-3 h-3" /></button>
                        </div>
                        <span className="font-bold text-[#D4AF37]">৳{itemPrice * it.quantity}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(it.id)}
                      className="absolute top-2 right-2 text-red-500 hover:text-white p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

              {cart.length === 0 && (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-zinc-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 uppercase font-bold">Your cart is currently empty.</p>
                </div>
              )}
            </div>

            {/* Calculations & Checkout action buttons */}
            {cart.length > 0 && (
              <div className="border-t border-white/10 pt-4 space-y-4 bg-[#121212]">
                
                {/* Coupon widget */}
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Apply Promo Campaign Code</span>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. TALHA20"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs uppercase focus:outline-none"
                    />
                    <button onClick={verifyCouponAction} className="bg-[#D4AF37] text-black hover:bg-yellow-500 font-bold px-4 rounded text-xs uppercase tracking-widest">
                      Apply
                    </button>
                  </div>
                  {appliedCoupon && (
                    <p className="text-emerald-400 text-[10px] font-bold">✓ Promo {appliedCoupon.code} matches: -{appliedCoupon.discountPercent}% flat discount!</p>
                  )}
                </div>

                {/* Delivery area charge selector */}
                <div className="space-y-1 border-t border-white/5 pt-2">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Courier Shipping Location:</span>
                  <div className="flex gap-2 text-xs">
                    <label className="flex-1 flex items-center gap-1.5 cursor-pointer bg-white/5 border border-white/10 rounded px-2.5 py-1.5">
                      <input 
                        type="radio" 
                        name="del" 
                        checked={deliveryArea === "inside"} 
                        onChange={() => setDeliveryArea("inside")} 
                      />
                      <span>Inside Dhaka (৳60)</span>
                    </label>
                    <label className="flex-1 flex items-center gap-1.5 cursor-pointer bg-white/5 border border-white/10 rounded px-2.5 py-1.5">
                      <input 
                        type="radio" 
                        name="del" 
                        checked={deliveryArea === "outside"} 
                        onChange={() => setDeliveryArea("outside")} 
                      />
                      <span>Outside Dhaka (৳120)</span>
                    </label>
                  </div>
                </div>

                {/* Summaries */}
                <div className="space-y-1.5 text-xs border-t border-white/5 pt-2 font-mono">
                  <div className="flex justify-between"><span>Items Subtotal:</span><span>৳{cartSubtotal} BDT</span></div>
                  <div className="flex justify-between"><span>Shipping Courier Cost:</span><span>৳{shippingCost} BDT</span></div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-400"><span>Coupon Savings:</span><span>-৳{couponDiscount} BDT</span></div>
                  )}
                  <div className="flex justify-between font-serif text-sm font-bold text-white border-t border-white/10 pt-1">
                    <span>Grand Total Payable:</span>
                    <span className="text-[#D4AF37]">৳{cartGrandTotal} BDT</span>
                  </div>
                </div>

                <button 
                  onClick={() => { setShowCartDrawer(false); setCheckoutStep("cart"); setActiveTab("checkout_screen"); }}
                  className="w-full bg-[#D4AF37] text-black text-center font-extrabold py-3 rounded text-xs uppercase tracking-widest block transition hover:bg-yellow-500Selector"
                >
                  Proceed to Secure Checkout
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 9. CHECKOUT PAGE SIMULATION CONTROLLER */}
      {activeTab === "checkout_screen" && (
        <div className="max-w-4xl mx-auto dark-card p-8 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2 border-b border-white/15 pb-4 mb-6">
            <FileText className="w-6 h-6 text-[#D4AF37]" />
            <h2 className="text-2xl font-serif italic text-white">{t.checkout}</h2>
          </div>

          {checkoutStep === "cart" && (
            <div className="space-y-6">
              <h3 className="text-sm uppercase font-bold text-yellow-400">Step 1: Recipient Delivery Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Minhajul Karim" 
                    value={shippingForm.fullName}
                    onChange={e => setShippingForm({ ...shippingForm, fullName: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-1">Mobile Contact Number</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="e.g. 017xx-xxxxxx" 
                    value={shippingForm.mobile}
                    onChange={e => setShippingForm({ ...shippingForm, mobile: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs uppercase text-gray-400 mb-1">Full Delivery Street Address</label>
                  <input 
                    type="text" 
                    required
                    placeholder="House, Road, Apartment Details" 
                    value={shippingForm.address}
                    onChange={e => setShippingForm({ ...shippingForm, address: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-1">District / Division</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Dhaka" 
                    value={shippingForm.district}
                    onChange={e => setShippingForm({ ...shippingForm, district: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-1">Upazila / Thana</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Dhanmondi" 
                    value={shippingForm.upazila}
                    onChange={e => setShippingForm({ ...shippingForm, upazila: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end">
                <button 
                  onClick={() => setCheckoutStep("shipping")}
                  className="gold-bg text-black font-extrabold text-xs uppercase tracking-widest px-8 py-2.5 rounded hover:bg-yellow-500"
                >
                  Proceed to Payment Selection
                </button>
              </div>
            </div>
          )}

          {checkoutStep === "shipping" && (
            <div className="space-y-6">
              <h3 className="text-sm uppercase font-bold text-yellow-400">Step 2: Choose Payment Gateway Selector</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: "Cash On Delivery", info: "Cash on delivery - inside/outside Dhaka" },
                  { id: "bKash", info: "bKash wallet direct transfer" },
                  { id: "Nagad", info: "Nagad wallet online payment" },
                  { id: "Stripe", info: "Credit / Debit Card secure simulation" }
                ].map(gateway => (
                  <label 
                    key={gateway.id}
                    className={`cursor-pointer dark-card p-4 rounded-xl flex flex-col justify-between hover:border-[#D4AF37] ${
                      shippingForm.paymentMethod === gateway.id ? "border-[#D4AF37] text-[#D4AF37]" : "border-white/5"
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="pay_channel"
                      checked={shippingForm.paymentMethod === gateway.id}
                      onChange={() => setShippingForm({ ...shippingForm, paymentMethod: gateway.id })}
                      className="hidden"
                    />
                    <span className="font-extrabold text-white text-xs block">{gateway.id}</span>
                    <span className="text-[9px] text-gray-400 mt-2 block">{gateway.info}</span>
                  </label>
                ))}
              </div>

              {/* Secure interactive placeholder for bKash or credit cards if selected */}
              {shippingForm.paymentMethod === "bKash" && (
                <div className="bg-[#e2136e] text-white p-4 rounded-xl space-y-3 font-mono">
                  <p className="text-xs font-bold uppercase">🔐 BKASH SECURE GATEWAY ENCRYPTION ACTIVE</p>
                  <p className="text-[10px]">Enter your 11 digit bKash wallet number below. A simulated verification OTP pin will follow.</p>
                  <input type="text" placeholder="017xxxxxxxx" className="bg-white text-black p-2 rounded text-xs w-full focus:outline-none" />
                </div>
              )}

              {shippingForm.paymentMethod === "Stripe" && (
                <div className="bg-blue-950 p-4 rounded-xl space-y-3">
                  <p className="text-xs font-bold text-white uppercase">🔐 SECURE STRIPE CREDIT / DEBIT ENCRYPTION</p>
                  <div className="space-y-2">
                    <input type="text" placeholder="Card Number •••• •••• •••• ••••" className="w-full bg-black text-white p-2 rounded text-xs focus:outline-none" />
                    <div className="flex gap-2">
                      <input type="text" placeholder="MM/YY" className="w-1/2 bg-black text-white p-2 rounded text-xs focus:outline-none" />
                      <input type="text" placeholder="CVC" className="w-1/2 bg-black text-white p-2 rounded text-xs focus:outline-none" />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-white/5 flex justify-between">
                <button 
                  onClick={() => setCheckoutStep("cart")}
                  className="bg-white/10 text-white font-extrabold text-xs uppercase tracking-widest px-6 py-2 rounded"
                >
                  Back to Recipient Info
                </button>
                <button 
                  onClick={handlePlaceOrder}
                  className="gold-bg text-black font-extrabold text-xs uppercase tracking-widest px-8 py-2.5 rounded hover:bg-yellow-500"
                >
                  {t.placeOrder}
                </button>
              </div>
            </div>
          )}

          {checkoutStep === "done" && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-green-950 border border-green-500 text-green-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-serif italic text-white">Shukran! Your Order Has Been Received.</h3>
              <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto">
                Your premium outfits have been reserved under Talha Fashion Gallery database log files. We automatically prepared a printable executive PDF invoice inside our database.
              </p>
              
              <div className="bg-[#151515] p-4 rounded-lg max-w-xs mx-auto border border-[#D4AF37]/20 font-mono text-xs">
                <p className="text-gray-400">Order Reference ID:</p>
                <p className="text-white font-bold text-sm tracking-widest">{placeOrderDoneId}</p>
                
                <p className="text-gray-400 mt-2">Logistics Tracker No:</p>
                <p className="text-[#D4AF37] font-bold text-xs tracking-widest">{placeOrderDoneTracking}</p>
              </div>

              <div className="pt-6">
                <button 
                  onClick={() => { setActiveTab("home"); setCheckoutStep("cart"); }}
                  className="gold-bg text-black font-extrabold text-xs uppercase tracking-widest px-8 py-2.5 rounded"
                >
                  Return to Apparel Showcase
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 10. PRODUCT COMPARISON FLOATING OVERLAY MODAL */}
      {showCompare && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-white/15 max-w-4xl w-full rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4">
            
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-lg font-serif italic text-white flex items-center gap-1.5">
                <ArrowLeftRight className="w-5 h-5 text-[#D4AF37]" />
                {t.compareTitle}
              </span>
              <button onClick={() => setShowCompare(false)} className="p-1 px-2.5 bg-white/5 rounded text-xs select-none">
                Close [✕]
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs divide-x divide-white/5">
              {comparisonList.map(p => (
                <div key={p.id} className="px-3 space-y-3">
                  <div className="h-32 bg-black rounded overflow-hidden">
                    <img src={p.images[0]} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm leading-tight truncate">{lang === 'en' ? p.name : p.nameBn}</h4>
                    <p className="text-[#D4AF37] font-bold text-xs mt-1">৳{p.discountPrice || p.price} BDT</p>
                  </div>
                  <div className="space-y-1.5 border-t border-white/5 pt-2 text-[11px] text-gray-300">
                    <p><span className="text-gray-500">Segment:</span> {p.category}</p>
                    <p className="truncate"><span className="text-gray-500">Sizes:</span> {p.sizes.join(", ")}</p>
                    <p className="truncate"><span className="text-gray-500">Colors:</span> {p.colors.join(", ")}</p>
                    <p className="line-clamp-2 italic text-gray-400">"{p.description}"</p>
                  </div>
                  <button 
                    onClick={() => { addToCartAction(p, "", ""); setShowCompare(false); }}
                    className="w-full bg-[#D4AF37] text-black font-extrabold text-[10px] uppercase py-1.5 rounded"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-white/5">
              <button 
                onClick={() => setComparisonList([])}
                className="text-[10px] text-red-500 font-bold uppercase tracking-widest hover:underline"
              >
                Clear comparison list
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 11. SECURITY / AUTH MODAL OVERLAY */}
      {authModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-white/15 max-w-sm w-full rounded-2xl p-6 shadow-2xl space-y-4 relative">
            
            <button onClick={() => setAuthModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
            
            <div className="text-center">
              <Lock className="w-10 h-10 text-[#D4AF37] mx-auto mb-1" />
              <h3 className="text-xl font-serif italic text-white">
                {authModal === "login" ? "Welcome Back Client" : "Register New Account"}
              </h3>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Talha Fashion Gallery Secure Portal</p>
            </div>

            {authError && (
              <p className="text-xs text-red-400 bg-red-950/20 border border-red-500/10 p-2 rounded text-center">
                {authError}
              </p>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3 text-xs">
              {authModal === "register" && (
                <div>
                  <label className="block text-gray-400 mb-1">Full Name</label>
                  <input type="text" required placeholder="e.g. Minhajul Karim" value={authForm.name} onChange={e => setAuthForm({ ...authForm, name: e.target.value })} className="w-full bg-[#151515] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]" />
                </div>
              )}
              {authModal === "register" && (
                <div>
                  <label className="block text-gray-400 mb-1">Mobile Contact Phone</label>
                  <input type="tel" required placeholder="018xxxxxxxx" value={authForm.phone} onChange={e => setAuthForm({ ...authForm, phone: e.target.value })} className="w-full bg-[#151515] border border-white/10 rounded px-3 py-2 text-white focus:outline-none" />
                </div>
              )}
              <div>
                <label className="block text-gray-400 mb-1">{authModal === "login" ? "Username or Email" : "Email Address"}</label>
                <input type="text" required placeholder={authModal === "login" ? "e.g. talha or customer@example.com" : "e.g. customer@example.com"} value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} className="w-full bg-[#151515] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]" />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Account Secure Password</label>
                <input type="password" required placeholder="••••••••" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} className="w-full bg-[#151515] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]" />
              </div>

              <button type="submit" className="w-full gold-bg text-black hover:bg-yellow-500 font-bold py-2 px-4 rounded text-xs uppercase tracking-widest transition-colors mt-2">
                {authModal === "login" ? "Verify Credentials" : "Create Account Session"}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-white/5 text-[11px]">
              {authModal === "login" ? (
                <button onClick={() => { setAuthError(""); setAuthModal("register"); }} className="text-gray-400 hover:text-[#D4AF37]">
                  New back? Create a customer account
                </button>
              ) : (
                <button onClick={() => { setAuthError(""); setAuthModal("login"); }} className="text-gray-400 hover:text-[#D4AF37]">
                  Already have an account? Sign In here
                </button>
              )}
            </div>
            <div className="mt-2 text-center text-[10px] text-gray-500">
              Demo Credentials: minhaj@example.com / password123
            </div>
          </div>
        </div>
      )}

      {/* 12. FLOATING LIVE CHAT HELPDESK & WHATSAPP CHAT BUTTON */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {showChat && (
          <div className="bg-[#121212] border border-white/15 w-80 h-96 rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden">
            
            {/* Header info */}
            <div className="bg-[#151515] border-b border-white/10 p-4 flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></div>
                <span className="font-bold text-white tracking-widest uppercase">{t.chatTitle}</span>
              </div>
              <button onClick={() => setShowChat(false)} className="text-gray-400">✕</button>
            </div>

            {/* Message streams */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar text-xs">
              {liveMessages.map(msg => (
                <div key={msg.id} className={`max-w-[85%] rounded p-2.5 ${
                  msg.sender === "user" 
                    ? "bg-[#D4AF37] text-black ml-auto" 
                    : "bg-white/5 text-gray-200"
                }`}>
                  <p>{msg.text}</p>
                  <span className="text-[8px] opacity-60 block text-right mt-1 font-mono">{msg.timestamp}</span>
                </div>
              ))}
            </div>

            {/* Input send trigger */}
            <form onSubmit={handleChatSendMessage} className="p-3 bg-black flex gap-1.5 border-t border-white/5">
              <input 
                type="text" 
                placeholder={t.chatPlaceholder}
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
              <button type="submit" className="gold-bg text-black px-3 rounded text-xs uppercase font-extrabold">
                Send
              </button>
            </form>

          </div>
        )}

        <div className="flex gap-2">
          {/* Direct WhatsApp link */}
          <a 
            href="https://wa.me/8801710237867" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-green-600 text-white p-3.5 rounded-full shadow-2xl hover:bg-green-500 transition-transform hover:scale-105"
            title="Chat directly on WhatsApp"
          >
            <Phone className="w-5 h-5" />
          </a>

          {/* AI Helpdesk toggle */}
          <button 
            onClick={() => setShowChat(!showChat)}
            className="gold-bg text-black p-3.5 rounded-full shadow-2xl hover:bg-yellow-500 transition-transform hover:scale-105"
            title="Open Live Chat Helpdesk"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 13. Footer (Details, Policies, and Social Handles) */}
      <footer className="border-t border-white/10 bg-black pt-12 pb-6 mt-16 text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <span className="text-sm font-serif italic text-white uppercase block">Talha Fashion Gallery</span>
            <p className="leading-relaxed">
              Dhanmondi, Dhaka-1209, Bangladesh.<br />
              Phone: 01710237867<br />
              Email: mdmonjulhaque1996@gmail.com<br />
              Enterprise authorized boutique garment manufacture of traditional Punjabis, fine georgette Sarees, and premium shoes.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold block">Customer Support</span>
            <a href="#" className="hover:text-white block">Contact Us Support Help</a>
            <a href="#" className="hover:text-white block">Easy Return Policy (7 Days)</a>
            <a href="#" className="hover:text-white block">Sitemap Index XML</a>
            <a href="#" className="hover:text-white block">Privacy Agreement Policy</a>
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold block">Apparel Categories</span>
            <a href="#" className="hover:text-white block">Saree & Kurti Boutique</a>
            <a href="#" className="hover:text-white block">Linen Comfort Punjabi</a>
            <a href="#" className="hover:text-white block">Kids Organic play fabric</a>
            <a href="#" className="hover:text-white block">Accessories Timex Watches</a>
          </div>

          <div className="space-y-3">
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold block">Social Galleries</span>
            <div className="flex gap-3 text-xs">
              <span className="hover:text-[#D4AF37] cursor-pointer">Facebook</span>
              <span className="hover:text-[#D4AF37] cursor-pointer">Instagram</span>
              <span className="hover:text-[#D4AF37] cursor-pointer">YouTube</span>
              <span className="hover:text-[#D4AF37] cursor-pointer">TikTok</span>
            </div>
            <p className="text-[10px] text-gray-600">Secure payments with SSLCommerz, bkash, Stripe.</p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 border-t border-white/5 mt-8 pt-4 flex flex-col sm:flex-row justify-between text-[10px] text-gray-500">
          <span>© 2026 Talha Fashion Gallery. All Rights Reserved.</span>
          <span className="uppercase tracking-widest">Designed for Ultimate Aesthetic Elegance Dark theme</span>
        </div>
      </footer>

    </div>
  );
}
