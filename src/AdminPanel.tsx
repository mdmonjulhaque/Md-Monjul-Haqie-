import React, { useState, useEffect } from "react";
import { 
  Plus, Edit2, Trash2, Check, X, Shield, Lock, 
  Tag, Percent, Image, MapPin, AlertTriangle, FileText, CheckCircle2 
} from "lucide-react";
import { Product, Category, Order, User, Coupon, Banner, Review } from "./types";

interface AdminPanelProps {
  catalog: {
    products: Product[];
    categories: Category[];
    banners: Banner[];
    coupons: Coupon[];
    reviews: Review[];
  };
  onRefreshCatalog: () => void;
  lang: "en" | "bn";
  currentUser?: User | null;
  onUserLogin?: (user: User) => void;
}

export default function AdminPanel({ catalog, onRefreshCatalog, lang, currentUser, onUserLogin }: AdminPanelProps) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [adminTab, setAdminTab] = useState<"dashboard" | "products" | "categories" | "orders" | "customers" | "coupons" | "banners" | "reviews">("dashboard");
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);

  // Product edit states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "", nameBn: "", category: "women", categoryBn: "নারীদের ফ্যাশন",
    brand: "", brandBn: "", price: 0, discountPrice: 0, stock: 10,
    description: "", descriptionBn: "", images: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800",
    sizes: "M, L, XL", colors: "Red, Blue, Black"
  });

  // Category new states
  const [newCat, setNewCat] = useState({ name: "", nameBn: "", icon: "Shirt" });
  // Coupon new states
  const [newCoupon, setNewCoupon] = useState({ code: "", discountPercent: 10, expiryDate: "2026-12-31" });
  // Banner new states
  const [newBanner, setNewBanner] = useState({ imageUrl: "", title: "", titleBn: "", subtitle: "", subtitleBn: "", link: "/" });

  // Load orders and customers for admin
  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchAdminData();
    }
  }, [isAdminLoggedIn]);

  useEffect(() => {
    if (currentUser && currentUser.role === "admin") {
      setIsAdminLoggedIn(true);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!isAdminLoggedIn) {
      try {
        const stored = localStorage.getItem("tfg_user");
        if (stored) {
          const u = JSON.parse(stored);
          if (u && u.role === "admin") {
            setIsAdminLoggedIn(true);
            if (onUserLogin) onUserLogin(u);
          }
        }
      } catch (err) {
        console.error("Local storage CEO check failed", err);
      }
    }
  }, [isAdminLoggedIn]);

  const fetchAdminData = async () => {
    try {
      const oRes = await fetch("/api/orders");
      const oData = await oRes.json();
      setOrders(oData);

      const cRes = await fetch("/api/customers");
      const cData = await cRes.json();
      setCustomers(cData);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail: cleanUsername, password: cleanPassword })
      });
      const data = await res.json();
      if (res.ok && data.success && data.user.role === "admin") {
        setIsAdminLoggedIn(true);
        localStorage.setItem("tfg_user", JSON.stringify(data.user));
        if (onUserLogin) onUserLogin(data.user);
      } else {
        setErrorMsg(data.error || "Access denied. Only authorized admins allowed.");
      }
    } catch (err) {
      setErrorMsg("Connection to security server failed.");
    }
  };

  // Product Operations
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse individual image URLs from newline or comma separation
    const imageUrlList = productForm.images
      .split(/[\r\n,]+/)
      .map(img => img.trim())
      .filter(img => img !== "");

    const payload = {
      ...productForm,
      price: Number(productForm.price),
      discountPrice: Number(productForm.discountPrice),
      stock: Number(productForm.stock),
      sizes: productForm.sizes.split(",").map(s => s.trim()).filter(Boolean),
      colors: productForm.colors.split(",").map(c => c.trim()).filter(Boolean),
      images: imageUrlList.length > 0 ? imageUrlList : ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800"]
    };

    const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
    const method = editingProduct ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setEditingProduct(null);
      setIsAddingProduct(false);
      onRefreshCatalog();
      alert("Product saved successfully!");
    } else {
      alert("Failed to save product.");
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("Please select image files only.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProductForm((prev) => {
          const currentList = prev.images
            .split(/[\r\n,]+/)
            .map(i => i.trim())
            .filter(i => i !== "");
          currentList.push(base64String);
          return {
            ...prev,
            images: currentList.join("\n")
          };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImageRecord = (indexToRemove: number) => {
    setProductForm((prev) => {
      const currentList = prev.images
        .split(/[\r\n,]+/)
        .map(i => i.trim())
        .filter(i => i !== "");
      
      const updatedList = currentList.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        images: updatedList.join("\n")
      };
    });
  };

  const startEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name, nameBn: p.nameBn, category: p.category, categoryBn: p.categoryBn,
      brand: p.brand, brandBn: p.brandBn, price: p.price, discountPrice: p.discountPrice, stock: p.stock,
      description: p.description, descriptionBn: p.descriptionBn, images: p.images ? p.images.join("\n") : "",
      sizes: p.sizes.join(", "), colors: p.colors.join(", ")
    });
    setIsAddingProduct(true);
  };

  const deleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        onRefreshCatalog();
      }
    }
  };

  // Category Operations
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.name) return;
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCat)
    });
    if (res.ok) {
      setNewCat({ name: "", nameBn: "", icon: "Shirt" });
      onRefreshCatalog();
    }
  };

  const deleteCategory = async (id: string) => {
    if (confirm("Delete this category?")) {
      await fetch(`/api/categories/${id}`, { method: "DELETE" });
      onRefreshCatalog();
    }
  };

  // Order Operations
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        status: newStatus,
        note: `Order status upgraded to ${newStatus} by CEO Admin.`,
        noteBn: `প্রধান অ্যাডমিন দ্বারা অর্ডারের অবস্থা ${newStatus} এ উন্নীত করা হয়েছে।`
      })
    });
    if (res.ok) {
      fetchAdminData();
    }
  };

  // Customer block/delete
  const toggleBlockCustomer = async (id: string) => {
    const res = await fetch(`/api/customers/${id}/block`, { method: "PUT" });
    if (res.ok) {
      fetchAdminData();
    }
  };

  const deleteCustomer = async (id: string) => {
    if (confirm("Delete customer profile forever?")) {
      await fetch(`/api/customers/${id}`, { method: "DELETE" });
      fetchAdminData();
    }
  };

  // Coupon operations
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code) return;
    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCoupon)
    });
    if (res.ok) {
      setNewCoupon({ code: "", discountPercent: 10, expiryDate: "2026-12-31" });
      onRefreshCatalog();
    }
  };

  const deleteCoupon = async (code: string) => {
    await fetch(`/api/coupons/${code}`, { method: "DELETE" });
    onRefreshCatalog();
  };

  // Banner operations
  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBanner.imageUrl) return;
    const res = await fetch("/api/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBanner)
    });
    if (res.ok) {
      setNewBanner({ imageUrl: "", title: "", titleBn: "", subtitle: "", subtitleBn: "", link: "/" });
      onRefreshCatalog();
    }
  };

  const deleteBanner = async (id: string) => {
    await fetch(`/api/banners/${id}`, { method: "DELETE" });
    onRefreshCatalog();
  };

  // Review Operations
  const approveReview = async (id: string) => {
    const res = await fetch(`/api/reviews/${id}/approve`, { method: "PUT" });
    if (res.ok) onRefreshCatalog();
  };

  const deleteReview = async (id: string) => {
    await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    onRefreshCatalog();
  };

  // Analytics Computation
  const totalSales = orders.filter(o => o.status !== "Cancelled").length;
  const totalRevenue = orders.filter(o => o.status !== "Cancelled").reduce((acc, curr) => acc + curr.totalAmount, 0);
  const outOfStockCount = catalog.products.filter(p => p.stock === 0).length;
  const lowStockCount = catalog.products.filter(p => p.stock > 0 && p.stock < 5).length;

  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 dark-card rounded-2xl shadow-xl">
        <div className="text-center mb-6">
          <Shield className="w-12 h-12 text-[#D4AF37] mx-auto mb-2" />
          <h2 className="text-2xl font-serif italic text-white">Talha CEO Panel</h2>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">তালহা ফ্যাশন গ্যালারি এডমিন</p>
        </div>

        {errorMsg && (
          <div className="bg-red-950/40 border border-red-500/30 text-red-200 text-xs p-3 rounded mb-4">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Username / Email</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. talha"
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
          <button 
            type="submit"
            className="w-full gold-bg text-black hover:bg-yellow-500 font-bold py-2 px-4 rounded text-xs uppercase tracking-widest transition-colors"
          >
            Authenticate API Connection
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-[#0c0c0c] min-h-screen border border-white/5 rounded-2xl p-6 my-6 text-white">
      {/* Admin header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#D4AF37]" />
            <h1 className="text-2xl font-serif italic text-white">Talha Executive Dashboard</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">Enterprise CMS of Talha Fashion Gallery • Secured Session Authorized</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsAdminLoggedIn(false)}
            className="text-xs bg-red-950/50 border border-red-500/20 text-red-200 px-3 py-1.5 rounded hover:bg-red-950"
          >
            Logout Executive Session
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-6 border-b border-white/5 no-scrollbar">
        {[
          { id: "dashboard", label: "Dashboard Stats", labelBn: "মূল বোর্ড" },
          { id: "products", label: "Products Catalog", labelBn: "পণ্য তালিকা" },
          { id: "categories", label: "Categories", labelBn: "ক্যাটাগরি" },
          { id: "orders", label: "Orders List", labelBn: "অর্ডারসমূহ" },
          { id: "customers", label: "Customers", labelBn: "গ্রাহক" },
          { id: "coupons", label: "Campaign Coupons", labelBn: "কুপনসমূহ" },
          { id: "banners", label: "Banners Slider", labelBn: "ব্যানার" },
          { id: "reviews", label: "Reviews Mode", labelBn: "রিভিউ" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setAdminTab(tab.id as any)}
            className={`whitespace-nowrap px-4 py-2 rounded text-xs uppercase tracking-wider font-semibold transition-all ${
              adminTab === tab.id 
                ? "gold-bg text-black" 
                : "bg-white/5 hover:bg-white/10 text-gray-300"
            }`}
          >
            {lang === "en" ? tab.label : tab.labelBn}
          </button>
        ))}
      </div>

      {/* RENDER ACTIVE TAB */}
      
      {/* 1. Dashboard */}
      {adminTab === "dashboard" && (
        <div className="space-y-8">
          {/* Top Numbers */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="dark-card p-4 rounded-xl flex flex-col justify-between">
              <span className="text-xs text-gray-400 uppercase tracking-widest">Total Sales</span>
              <span className="text-3xl font-serif text-[#D4AF37] mt-2">৳{totalRevenue.toLocaleString()} BDT</span>
              <span className="text-[10px] text-gray-500 mt-1">{totalSales} approved orders</span>
            </div>
            <div className="dark-card p-4 rounded-xl flex flex-col justify-between">
              <span className="text-xs text-gray-400 uppercase tracking-widest">Catalog Products</span>
              <span className="text-3xl font-serif text-white mt-2">{catalog.products.length} Items</span>
              <span className="text-[10px] text-gray-500 mt-1">across {catalog.categories.length} segments</span>
            </div>
            <div className="dark-card p-4 rounded-xl flex flex-col justify-between">
              <span className="text-xs text-gray-400 uppercase tracking-widest">Total Customers</span>
              <span className="text-3xl font-serif text-white mt-2">{customers.length} Accounts</span>
              <span className="text-[10px] text-gray-500 mt-1">registered on system</span>
            </div>
            <div className="dark-card p-4 rounded-xl flex flex-col justify-between border-red-500/20">
              <span className="text-xs text-rose-400 uppercase tracking-widest flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> Out of Stock
              </span>
              <span className="text-3xl font-serif text-rose-500 mt-2">{outOfStockCount} Items</span>
              <span className="text-[10px] text-gray-500 mt-1">requires immediate reload</span>
            </div>
            <div className="dark-card p-4 rounded-xl flex flex-col justify-between">
              <span className="text-xs text-yellow-400 uppercase tracking-widest">Low Stock Alert</span>
              <span className="text-3xl font-serif text-yellow-400 mt-2">{lowStockCount} Items</span>
              <span className="text-[10px] text-gray-500 mt-1">under 5 items in inventory</span>
            </div>
          </div>

          {/* SVG Analytical Chart */}
          <div className="dark-card p-6 rounded-xl">
            <h3 className="text-lg font-serif italic text-white mb-4">Monthly Revenue Analytics (2026 Campaign Year)</h3>
            <div className="h-64 flex items-end justify-between pt-4 pb-2 px-2 border-b border-l border-white/10 gap-2">
              {/* Dummy SVG representation for elegant representation */}
              {[
                { month: "Jan", sales: 12000 },
                { month: "Feb", sales: 18000 },
                { month: "Mar", sales: 25000 },
                { month: "Apr", sales: 31000 },
                { month: "May", sales: 45000 },
                { month: "Jun", sales: 58000 }
              ].map((m, idx) => {
                const maxVal = 60000;
                const pct = (m.sales / maxVal) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer">
                    <span className="text-[10px] text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-1">
                      ৳{m.sales.toLocaleString()}
                    </span>
                    <div 
                      style={{ height: `${pct}%` }} 
                      className="w-full bg-gradient-to-t from-yellow-700 to-[#D4AF37] rounded-t transition-all group-hover:from-yellow-600 group-hover:to-yellow-300"
                    ></div>
                    <span className="text-[10px] text-gray-400 uppercase mt-2 tracking-widest">{m.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inventory warning section */}
          <div className="dark-card p-6 rounded-xl space-y-4">
            <h3 className="text-lg font-serif italic text-white">Stock Warnings & Alerts</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400">
                    <th className="py-2">Product Name</th>
                    <th className="py-2">Stock Level</th>
                    <th className="py-2">Category</th>
                    <th className="py-2">Regular Price</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {catalog.products.filter(p => p.stock < 5).map(p => (
                    <tr key={p.id} className="hover:bg-white/5">
                      <td className="py-2.5 font-medium">{p.name}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded font-bold ${p.stock === 0 ? "bg-red-950 text-red-400" : "bg-yellow-950 text-yellow-400"}`}>
                          {p.stock === 0 ? "OUT OF STOCK" : `${p.stock} Left`}
                        </span>
                      </td>
                      <td className="py-2.5 text-gray-400 capitalize">{p.category}</td>
                      <td className="py-2.5">৳{p.price}</td>
                      <td className="py-2.5 text-right">
                        <button 
                          onClick={() => startEditProduct(p)}
                          className="bg-white/5 border border-white/15 hover:border-[#D4AF37] hover:text-[#D4AF37] px-2 py-1 rounded text-[10px] uppercase font-bold"
                        >
                          Replenish Stock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Products Catalog */}
      {adminTab === "products" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-serif italic text-white">Manage Products</h3>
            {!isAddingProduct && (
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    name: "", nameBn: "", category: "women", categoryBn: "নারীদের ফ্যাশন",
                    brand: "Heritage Bengal", brandBn: "ঐতিহ্যবাহী বাংলা", price: 2000, discountPrice: 1500, stock: 15,
                    description: "High quality premium fashion wear.", descriptionBn: "উচ্চ মানসম্পন্ন প্রিমিয়াম ফ্যাশন পোশাক।",
                    images: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800",
                    sizes: "S, M, L, XL", colors: "Black, Royal Gold, White"
                  });
                  setIsAddingProduct(true);
                }}
                className="gold-bg text-black hover:bg-yellow-500 font-bold px-4 py-2 rounded text-xs uppercase tracking-widest flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Premium Product
              </button>
            )}
          </div>

          {/* ADD / EDIT PRODUCT FORM */}
          {isAddingProduct && (
            <form onSubmit={handleProductSubmit} className="dark-card p-6 rounded-xl space-y-4">
              <h4 className="text-sm uppercase font-bold text-[#D4AF37] tracking-wider border-b border-white/5 pb-2">
                {editingProduct ? "Edit Product Form" : "Add New Premium Item"}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400">English Title</label>
                  <input type="text" required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 font-serif">বাংলা নাম (Bangla Title)</label>
                  <input type="text" required value={productForm.nameBn} onChange={e => setProductForm({...productForm, nameBn: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400">Category Tag</label>
                  <select value={productForm.category} onChange={e => {
                    const matchedCat = catalog.categories.find(c => c.id === e.target.value);
                    setProductForm({
                      ...productForm, 
                      category: e.target.value,
                      categoryBn: matchedCat ? matchedCat.nameBn : "অন্যান্য"
                    });
                  }} className="w-full bg-[#111] border border-white/10 rounded p-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]">
                    {catalog.categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400">Brand Name</label>
                  <input type="text" value={productForm.brand} onChange={e => setProductForm({...productForm, brand: e.target.value, brandBn: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400">Regular Price (BDT)</label>
                  <input type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400">Discount Camp Price (BDT)</label>
                  <input type="number" value={productForm.discountPrice} onChange={e => setProductForm({...productForm, discountPrice: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 font-bold text-yellow-400">Stock Quantity</label>
                  <input type="number" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm text-white focus:outline-none" />
                </div>
                <div className="md:col-span-2 space-y-3 bg-white/5 p-4 rounded-lg border border-white/10">
                  <span className="block text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                    Product Images (ছবি যুক্ত করুন)
                  </span>

                  {/* Direct file upload picker block */}
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-5 text-center cursor-pointer hover:border-[#D4AF37] hover:bg-white/[0.02] transition-colors relative">
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={handleImageFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="space-y-1.5">
                      <p className="text-sm text-gray-200 font-bold">
                        📁 Click to Upload PNG/JPG Files Direct 
                      </p>
                      <p className="text-xs text-amber-400 font-medium">
                        (ডাইরেক্ট কম্পিউটার/মোবাইল থেকে ছবি আপলোড করতে এখানে ক্লিক করুন)
                      </p>
                      <p className="text-[10px] text-gray-500">
                        You can select multiple photos at once. They will convert to direct saved images!
                      </p>
                    </div>
                  </div>

                  {/* Or input text area for custom remote URLs */}
                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                      Remote Image URLs / Base64 Data List (or edit manually below)
                    </label>
                    <textarea 
                      rows={3} 
                      value={productForm.images} 
                      onChange={e => setProductForm({...productForm, images: e.target.value})} 
                      placeholder="https://images.unsplash.com/...&#10;https://images.unsplash.com/second-image"
                      className="w-full bg-white/5 border border-white/10 rounded p-2 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37]" 
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-[10px] text-gray-500">
                        এখানে প্রতি লাইনে একটি করে ছবির লিংক বা কমা দিয়ে আলাদা করে যত খুশি তত ছবি যুক্ত করতে পারেন।
                      </p>
                      <button 
                        type="button"
                        onClick={() => setProductForm({...productForm, images: ""})}
                        className="text-[10px] bg-red-500/20 hover:bg-red-500/40 text-red-400 px-2.5 py-0.5 rounded transition"
                      >
                        Clear All / ছবি সব মুছুন
                      </button>
                    </div>
                  </div>
                  
                  {/* Image Live Previews */}
                  {productForm.images && (
                    <div className="mt-2">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1">
                        Image Previews ({productForm.images.split(/[\r\n,]+/).map(i => i.trim()).filter(i => i.startsWith("http") || i.startsWith("data:image/")).length}):
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {productForm.images
                          .split(/[\r\n,]+/)
                          .map(img => img.trim())
                          .filter(img => img.startsWith("http") || img.startsWith("data:image/"))
                          .map((img, index) => (
                            <div key={index} className="w-14 h-14 bg-black border border-white/10 rounded overflow-hidden relative group">
                              <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <button
                                type="button"
                                onClick={() => handleRemoveImageRecord(index)}
                                className="absolute top-0 right-0 bg-red-600/90 text-white rounded-bl p-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-[8px]"
                                title="Remove photo"
                              >
                                ✕
                              </button>
                              <span className="absolute bottom-0 right-0 bg-black/80 text-[8px] text-[#D4AF37] px-1 rounded-tl">
                                #{index + 1}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-400">Available Sizes (comma separated)</label>
                  <input type="text" value={productForm.sizes} onChange={e => setProductForm({...productForm, sizes: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm text-white focus:outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-400">Available Colors (comma separated)</label>
                  <input type="text" value={productForm.colors} onChange={e => setProductForm({...productForm, colors: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm text-[#D4AF37] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400">English Description</label>
                  <textarea rows={3} value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400">বাংলা বিবরণ (Bangla Description)</label>
                  <textarea rows={3} value={productForm.descriptionBn} onChange={e => setProductForm({...productForm, descriptionBn: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded p-2 text-sm text-white focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setIsAddingProduct(false)} className="bg-white/10 text-white px-4 py-2 rounded text-xs uppercase tracking-wider font-bold">Cancel</button>
                <button type="submit" className="gold-bg text-black px-6 py-2 rounded text-xs uppercase tracking-wider font-bold">Save Changes</button>
              </div>
            </form>
          )}

          {/* PRODUCTS LIST */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {catalog.products.map(p => (
              <div key={p.id} className="dark-card rounded-lg p-4 flex gap-3 relative">
                <div className="w-20 h-20 bg-black rounded overflow-hidden flex-shrink-0">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-[#D4AF37] uppercase tracking-wider block">{p.category}</span>
                  <h4 className="text-xs font-serif font-bold text-white truncate">{lang === 'en' ? p.name : p.nameBn}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-white">৳{p.discountPrice || p.price}</span>
                    {p.discountPrice && <span className="text-[10px] line-through text-gray-500">৳{p.price}</span>}
                  </div>
                  <span className={`text-[10px] font-bold block mt-1 ${p.stock === 0 ? "text-red-500" : "text-gray-400"}`}>
                    Stock: {p.stock} units
                  </span>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => startEditProduct(p)} className="text-[10px] text-yellow-400 hover:underline uppercase font-bold flex items-center gap-0.5">
                      <Edit2 className="w-2.5 h-2.5" /> Edit
                    </button>
                    <button onClick={() => deleteProduct(p.id)} className="text-[10px] text-red-500 hover:underline uppercase font-bold flex items-center gap-0.5">
                      <Trash2 className="w-2.5 h-2.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Categories Management */}
      {adminTab === "categories" && (
        <div className="space-y-6">
          <h3 className="text-lg font-serif italic text-white">Category Management</h3>
          <form onSubmit={handleCreateCategory} className="dark-card p-4 rounded-xl flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1">New English Category Name</label>
              <input type="text" required placeholder="e.g. Traditional Wear" value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none" />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1">বাংলা নাম (Bangla Name)</label>
              <input type="text" required placeholder="যেমন: ঐতিহ্যবাহী পোশাক" value={newCat.nameBn} onChange={e => setNewCat({...newCat, nameBn: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none" />
            </div>
            <div>
              <button type="submit" className="gold-bg text-black hover:bg-yellow-500 font-bold px-4 py-2 rounded text-xs uppercase tracking-widest">
                Add Segment
              </button>
            </div>
          </form>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {catalog.categories.map(c => (
              <div key={c.id} className="dark-card p-4 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-white">{c.name}</p>
                  <p className="text-[10px] text-gray-400 font-serif">{c.nameBn}</p>
                </div>
                <button 
                  onClick={() => deleteCategory(c.id)}
                  className="p-1 px-2 rounded bg-red-950/20 text-red-400 hover:bg-red-900/50 border border-red-500/10 text-xs font-serif"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Orders management with Invoice generation */}
      {adminTab === "orders" && (
        <div className="space-y-6">
          <h3 className="text-lg font-serif italic text-white">Executive Purchase Orders & Dispatch</h3>
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="dark-card p-6 rounded-xl space-y-4">
                <div className="flex flex-col md:flex-row justify-between border-b border-white/5 pb-3 items-start md:items-center gap-2">
                  <div>
                    <span className="text-xs text-[#D4AF37] font-bold tracking-widest block uppercase">Order ID: {order.id}</span>
                    <span className="text-[10px] text-gray-400">Placed on: {new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs uppercase tracking-wider font-bold">Status:</span>
                    <select
                      value={order.status}
                      onChange={e => updateOrderStatus(order.id, e.target.value)}
                      className="bg-black border border-white/10 rounded px-2 py-1 text-xs text-yellow-400 font-bold focus:outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <h4 className="font-bold uppercase text-white tracking-widest mb-2">Recipient Customer</h4>
                    <p className="text-gray-300">Name: {order.customerName}</p>
                    <p className="text-gray-300">Phone: {order.phone}</p>
                    <p className="text-gray-300">Email: {order.email}</p>
                    <p className="text-gray-300 leading-relaxed">
                      Shipping Address: {order.address}, {order.upazila}, {order.district} - {order.postalCode}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold uppercase text-white tracking-widest mb-2">Invoice Summary</h4>
                    <p className="text-gray-300">Payment Channel: <span className="font-bold text-yellow-400">{order.paymentMethod}</span></p>
                    <p className="text-gray-300">Subtotal items: ৳{order.totalAmount - order.shippingFee + order.discount} BDT</p>
                    <p className="text-gray-300">Shipping Delivery Fee: ৳{order.shippingFee} BDT</p>
                    {order.discount > 0 && <p className="text-emerald-400">Coupon Discount: -৳{order.discount} BDT</p>}
                    <p className="text-white font-bold text-sm mt-1">Total Paid Amount: ৳{order.totalAmount} BDT</p>
                  </div>
                </div>

                {/* Items Ordered List */}
                <div className="border border-white/5 rounded-lg p-3 bg-black/30 text-xs">
                  <p className="font-bold uppercase text-gray-400 text-[10px] tracking-wider mb-2">Purchased Products</p>
                  <div className="divide-y divide-white/5">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="py-2 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <img src={it.image} className="w-8 h-8 rounded object-cover" />
                          <div>
                            <p className="font-bold text-white">{it.name}</p>
                            <p className="text-[10px] text-gray-500">Color: {it.color} | Size: {it.size}</p>
                          </div>
                        </div>
                        <p className="font-bold text-[#D4AF37]">{it.quantity}x ৳{it.price}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* INVOICE GENERATION PANEL (Dynamic HTML printable document) */}
                <div className="bg-white text-black p-6 rounded-lg font-sans space-y-4 shadow-sm border border-black/10">
                  <div className="flex justify-between items-start border-b-2 border-black pb-4">
                    <div>
                      <h4 className="text-lg font-extrabold uppercase tracking-tight">Talha Fashion Gallery</h4>
                      <p className="text-[10px] text-gray-600">Dhanmondi, Dhaka, Bangladesh • Phone: 01710237867</p>
                      <p className="text-[10px] text-gray-600">Email: mdmonjulhaque1996@gmail.com • VAT Res Reg: 485903</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold uppercase block text-gray-800">OFFICIAL INVOICE</span>
                      <p className="text-xs text-gray-600">Order Ref: <span className="font-mono font-bold">{order.id}</span></p>
                      <p className="text-xs text-gray-600">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-gray-500 font-extrabold uppercase">BILLED TO RECIPIENT:</p>
                      <p className="font-bold">{order.customerName}</p>
                      <p>{order.address}</p>
                      <p>{order.upazila}, {order.district} - {order.postalCode}</p>
                      <p>Contact: {order.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 font-extrabold uppercase">DELIVERY DISPATCH DETAILS:</p>
                      <p>Gateway: <span className="font-bold">{order.paymentMethod}</span></p>
                      <p>Shipment Tracking: <span className="font-mono font-bold text-gray-800">{order.trackingNumber}</span></p>
                      <p>Status Log: <span className="font-bold text-green-700">{order.status}</span></p>
                    </div>
                  </div>

                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-300 text-gray-700">
                        <th className="p-2">Item Design Description</th>
                        <th className="p-2 text-center">Size</th>
                        <th className="p-2 text-center">Qty</th>
                        <th className="p-2 text-right">Unit Price</th>
                        <th className="p-2 text-right">Total Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {order.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-semibold text-gray-900">{it.name} <span className="text-[10px] text-gray-500 uppercase">({it.color})</span></td>
                          <td className="p-2 text-center text-gray-700">{it.size}</td>
                          <td className="p-2 text-center text-gray-700">{it.quantity}</td>
                          <td className="p-2 text-right text-gray-700">৳{it.price}</td>
                          <td className="p-2 text-right font-bold text-gray-900">৳{it.price * it.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="text-right text-xs pr-2 space-y-1 pt-2 border-t-2 border-gray-300">
                    <p className="text-gray-600">Product Subtotal: ৳{order.totalAmount - order.shippingFee + order.discount} BDT</p>
                    <p className="text-gray-600">Bespoke Courier Shipping Fee: ৳{order.shippingFee} BDT</p>
                    {order.discount > 0 && <p className="text-red-600 font-bold">Festive Coupon Discount: -৳{order.discount} BDT</p>}
                    <p className="text-sm font-extrabold text-gray-900 border-t border-gray-200 pt-1">Grand Payable Total: ৳{order.totalAmount} BDT</p>
                  </div>

                  <div className="text-center text-[9px] text-gray-500 border-t border-gray-100 pt-4">
                    Thank you for matching your premium wardrobe with Talha Fashion Gallery! Complete satisfaction is our guarantee.
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Customers management */}
      {adminTab === "customers" && (
        <div className="space-y-6">
          <h3 className="text-lg font-serif italic text-white">Registered Customer Profiles</h3>
          <div className="dark-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-white/5 text-gray-400 border-b border-white/5 uppercase tracking-wider">
                    <th className="p-3">Customer Full Name</th>
                    <th className="p-3">Registered Contact Info</th>
                    <th className="p-3">Address Book</th>
                    <th className="p-3">Account Status</th>
                    <th className="p-3 text-right">Moderator actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {customers.map(cust => (
                    <tr key={cust.id} className="hover:bg-white/5">
                      <td className="p-3">
                        <p className="font-bold text-white">{cust.name}</p>
                        <p className="text-[10px] text-gray-500">Joined ID: {cust.id}</p>
                      </td>
                      <td className="p-3">
                        <p>{cust.email}</p>
                        <p className="text-gray-400">{cust.phone}</p>
                      </td>
                      <td className="p-3 text-gray-400 max-w-xs truncate">
                        {cust.address ? `${cust.address}, ${cust.upazila}, ${cust.district}` : "No address specified yet"}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cust.blocked ? "bg-red-950 text-red-400" : "bg-green-950 text-green-400"}`}>
                          {cust.blocked ? "BLOCKED / SUSPENDED" : "ACTIVE ACCOUNT"}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <button 
                          onClick={() => toggleBlockCustomer(cust.id)}
                          className={`text-[10px] px-2 py-1 rounded font-bold uppercase transition bg-white/5 border hover:bg-white/10 ${cust.blocked ? "border-emerald-500/20 text-emerald-400" : "border-amber-500/20 text-amber-400"}`}
                        >
                          {cust.blocked ? "Unblock" : "Block Customer"}
                        </button>
                        <button 
                          onClick={() => deleteCustomer(cust.id)}
                          className="text-[10px] px-2 py-1 bg-red-950/20 text-red-400 border border-red-500/20 rounded font-bold uppercase hover:bg-red-950/50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. Coupons management */}
      {adminTab === "coupons" && (
        <div className="space-y-6">
          <h3 className="text-lg font-serif italic text-white font-bold">Campaign Promotional Coupons</h3>
          <form onSubmit={handleCreateCoupon} className="dark-card p-4 rounded-xl flex flex-col md:flex-row gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Coupon Promo Code</label>
              <input type="text" required placeholder="e.g. SUMMER30" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value})} className="w-full uppercase bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs text-white uppercase focus:outline-none focus:border-[#D4AF37]" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Discount Percent (%)</label>
              <input type="number" min="1" max="99" value={newCoupon.discountPercent} onChange={e => setNewCoupon({...newCoupon, discountPercent: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Expiry Date</label>
              <input type="date" value={newCoupon.expiryDate} onChange={e => setNewCoupon({...newCoupon, expiryDate: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none" />
            </div>
            <div>
              <button type="submit" className="gold-bg text-black hover:bg-yellow-500 font-bold px-4 py-2 rounded text-xs uppercase tracking-widest">
                Deploy Promo Coupon
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {catalog.coupons.map((coupon, idx) => (
              <div key={idx} className="dark-card p-4 rounded-lg flex justify-between items-center bg-gradient-to-br from-yellow-950/20 to-black border-dashed border-[#D4AF37]/40">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-[#D4AF37]" />
                    <span className="font-mono font-bold text-base text-white tracking-widest">{coupon.code}</span>
                  </div>
                  <p className="text-xs text-[#D4AF37] font-bold mt-1">Flat {coupon.discountPercent}% Off All Apparel</p>
                  <p className="text-[10px] text-gray-400">Valid until: {coupon.expiryDate}</p>
                </div>
                <button 
                  onClick={() => deleteCoupon(coupon.code)}
                  className="bg-red-950/40 text-red-400 border border-red-500/15 p-1 px-2.5 rounded text-[10px] uppercase font-bold"
                >
                  Recall
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Banner slider management */}
      {adminTab === "banners" && (
        <div className="space-y-6">
          <h3 className="text-lg font-serif italic text-white">Dynamic Hero Banners Config</h3>
          <form onSubmit={handleCreateBanner} className="dark-card p-4 rounded-xl space-y-4">
            <h4 className="text-xs uppercase font-bold text-[#D4AF37] tracking-widest border-b border-white/5 pb-2">Deploy Live Home Slider Banner</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Banner Headline (English)</label>
                <input type="text" required placeholder="Luxury Festive Punjabi" value={newBanner.title} onChange={e => setNewBanner({...newBanner, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">ব্যানার শিরোনাম (Bangla Headline)</label>
                <input type="text" required placeholder="লাক্সারি উৎসবের পাঞ্জাবি" value={newBanner.titleBn} onChange={e => setNewBanner({...newBanner, titleBn: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Promotion Tagline (English)</label>
                <input type="text" required placeholder="Flat 40% Off on exclusive weaves" value={newBanner.subtitle} onChange={e => setNewBanner({...newBanner, subtitle: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">প্রচার ট্যাগলাইন (Bangla Tagline)</label>
                <input type="text" required placeholder="এক্সক্লুসিভ বুননে ফ্ল্যাট ৪০% ছাড়" value={newBanner.subtitleBn} onChange={e => setNewBanner({...newBanner, subtitleBn: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Slider Photo URL (Unsplash/Pexels background)</label>
                <input type="text" required placeholder="https://images.unsplash.com/photo-..." value={newBanner.imageUrl} onChange={e => setNewBanner({...newBanner, imageUrl: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Naviguational Category Redirect link</label>
                <input type="text" required placeholder="/category/men" value={newBanner.link} onChange={e => setNewBanner({...newBanner, link: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white focus:outline-none" />
              </div>
            </div>
            <button type="submit" className="gold-bg text-black font-bold px-4 py-2 rounded text-xs uppercase tracking-widest">
              Publish Banner
            </button>
          </form>

          {/* Active banners list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {catalog.banners.map((b, idx) => (
              <div key={idx} className="dark-card p-4 rounded-xl flex gap-3">
                <img src={b.imageUrl} className="w-24 h-16 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate text-xs">{b.title}</p>
                  <p className="text-[10px] text-gray-400 truncate">{b.subtitle}</p>
                  <p className="text-[10px] text-[#D4AF37] mt-1 font-mono">Redirect: {b.link}</p>
                </div>
                <button 
                  onClick={() => deleteBanner(b.id)}
                  className="bg-red-950/40 text-red-400 hover:bg-red-950 p-1 px-2.5 rounded text-[10px] uppercase font-bold"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Review Approvals / Moderator */}
      {adminTab === "reviews" && (
        <div className="space-y-6">
          <h3 className="text-lg font-serif italic text-white">Review System Moderation</h3>
          <div className="space-y-4">
            {catalog.reviews.map((rev, idx) => (
              <div key={idx} className="dark-card p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-xs">{rev.customerName}</span>
                    <span className="text-[10px] text-gray-400">• Posted on PRODUCT ID: {rev.productId}</span>
                  </div>
                  <div className="flex text-yellow-400 text-xs my-1">
                    {"★".repeat(rev.rating)}{"☆".repeat(5-rev.rating)}
                  </div>
                  <p className="text-xs text-gray-300 italic">"{rev.comment}"</p>
                  <span className={`text-[10px] font-bold block mt-1.5 ${rev.approved ? "text-emerald-400" : "text-amber-400"}`}>
                    Status: {rev.approved ? "✓ Approved Display" : "⏰ Awaiting Verification"}
                  </span>
                </div>
                <div className="flex gap-2 text-xs">
                  {!rev.approved && (
                    <button 
                      onClick={() => approveReview(rev.id)}
                      className="bg-emerald-950/50 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-900 px-3 py-1 rounded uppercase font-bold text-[10px]"
                    >
                      Approve Review
                    </button>
                  )}
                  <button 
                    onClick={() => deleteReview(rev.id)}
                    className="bg-red-950/50 border border-red-500/20 text-red-400 hover:bg-red-900 px-3 py-1 rounded uppercase font-bold text-[10px]"
                  >
                    Delete Objectionable Content
                  </button>
                </div>
              </div>
            ))}

            {catalog.reviews.length === 0 && (
              <p className="text-xs text-gray-400 italic">No buyer reviews pending on system archives.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
