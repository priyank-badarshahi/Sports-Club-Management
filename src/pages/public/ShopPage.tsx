import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store';
import { Product, ProductCategory, Order, SportType, OrderStatus } from '../../types';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Heart, 
  Check, 
  Truck, 
  Clock, 
  MapPin, 
  CreditCard, 
  Sparkles, 
  X, 
  Plus, 
  Minus, 
  ArrowRight, 
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  SlidersHorizontal,
  Package,
  Eye,
  Tag
} from 'lucide-react';
import { formatINR, formatDateTime, getTierBadgeClass } from '../../lib/formatters';
import { getMemberShopDiscountPercent, getAvailableStock } from '../../lib/inventory';

export const SPORT_FILTER_TABS = [
  { id: 'all', label: 'All Products', icon: '🏆' },
  { id: 'box_cricket', label: 'Box Cricket', icon: '🏏' },
  { id: 'badminton', label: 'Badminton', icon: '🏸' },
  { id: 'table_tennis', label: 'Table Tennis', icon: '🏓' },
  { id: 'volleyball', label: 'Volleyball', icon: '🏐' },
  { id: 'kho_kho', label: 'Kho Kho', icon: '🏃' },
  { id: 'hockey', label: 'Hockey', icon: '🏑' },
  { id: 'football', label: 'Football', icon: '⚽' },
  { id: 'kabaddi', label: 'Kabaddi', icon: '🤼' },
];

export const ShopPage: React.FC = () => {
  const { products, currentUser, orders, recordSale, addToast } = useAppStore();

  // Active View Tab: 'catalog' | 'tracking' | 'wishlist' | 'history'
  const [activeView, setActiveView] = useState<'catalog' | 'tracking' | 'wishlist' | 'history'>('catalog');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'newest' | 'name'>('featured');

  // Cart & Wishlist State
  const [cart, setCart] = useState<{
    product: Product;
    quantity: number;
    selectedVariant?: string;
    serviceDetails?: {
      tensionLbs?: number;
      mainString?: string;
      crossString?: string;
      express?: boolean;
    };
  }[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Product Quick-View Modal
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [modalSelectedVariant, setModalSelectedVariant] = useState<string>('');
  const [modalTension, setModalTension] = useState<number>(26);
  const [modalExpress, setModalExpress] = useState<boolean>(false);
  const [modalQty, setModalQty] = useState<number>(1);

  // Checkout Form State
  const [deliveryType, setDeliveryType] = useState<'online_pickup' | 'online_delivery'>('online_pickup');
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '14, Palm Grove Residency, 100ft Road, Indiranagar',
    apartment: 'Apt 402',
    city: 'Bengaluru',
    postalCode: '560038',
    deliveryNotes: 'Call upon arrival at security gate',
  });
  const [deliverySlot, setDeliverySlot] = useState('Today (6:00 PM - 8:00 PM)');
  const [pickupSlot, setPickupSlot] = useState('Today at Pro Shop Desk (6:00 PM)');
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<'upi' | 'card' | 'pay_at_club'>('upi');
  const [customerInfo, setCustomerInfo] = useState({
    name: currentUser.name || 'Priya Sharma',
    phone: (currentUser as any).phone || '+91 98201 55432',
    email: currentUser.email || 'customer@example.com',
  });

  // Tracking Order Number
  const [trackingOrderNumber, setTrackingOrderNumber] = useState('');

  // Tier discount calculations
  const tier = currentUser.tier || 'walk_in';
  const discountPct = getMemberShopDiscountPercent(tier);

  const getTierPrice = (mrp: number) => {
    return Math.round(mrp * (1 - discountPct / 100));
  };

  // Unique Brands in Catalog
  const brands = useMemo(() => {
    const set = new Set(products.map((p) => p.brand).filter(Boolean));
    return Array.from(set);
  }, [products]);

  // Filtered Catalog
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch = !q || 
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.sport.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.shortDescription || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.material || '').toLowerCase().includes(q) ||
          (p.skillLevel || '').toLowerCase().includes(q);
        
        const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
        const matchesSport = selectedSport === 'all' || p.sport === selectedSport;
        const matchesBrand = selectedBrand === 'all' || p.brand === selectedBrand;

        const effectivePrice = Math.round(p.price * (1 - discountPct / 100));
        const matchesPrice = (() => {
          if (selectedPriceRange === 'all') return true;
          if (selectedPriceRange === 'under_500') return effectivePrice < 500;
          if (selectedPriceRange === '500_1500') return effectivePrice >= 500 && effectivePrice <= 1500;
          if (selectedPriceRange === '1500_5000') return effectivePrice > 1500 && effectivePrice <= 5000;
          if (selectedPriceRange === '5000_plus') return effectivePrice > 5000;
          return true;
        })();

        const matchesSkill = selectedSkillLevel === 'all' ||
          !p.skillLevel ||
          p.skillLevel === selectedSkillLevel ||
          p.skillLevel === 'All Levels' ||
          selectedSkillLevel === 'All Levels';

        const avail = getAvailableStock(p);
        const matchesStock = !inStockOnly || p.isServiceItem || avail > 0;

        return matchesSearch && matchesCat && matchesSport && matchesBrand && matchesPrice && matchesSkill && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === 'price_low') return a.price - b.price;
        if (sortBy === 'price_high') return b.price - a.price;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'newest') return (b.id || '').localeCompare(a.id || '');
        // featured sort: featured products first
        if ((b.featured ? 1 : 0) !== (a.featured ? 1 : 0)) return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        return 0;
      });
  }, [products, searchQuery, selectedCategory, selectedSport, selectedBrand, selectedPriceRange, selectedSkillLevel, inStockOnly, sortBy, discountPct]);

  // Wishlist Toggle
  const toggleWishlist = (productId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Cart Operations
  const addToCart = (
    product: Product, 
    variantInfo?: string, 
    serviceDetails?: { tensionLbs?: number; express?: boolean }
  ) => {
    const available = getAvailableStock(product);
    const existing = cart.find(
      (item) => item.product.id === product.id && item.selectedVariant === variantInfo
    );
    const currentQty = existing ? existing.quantity : 0;

    if (!product.isServiceItem && available <= currentQty) {
      addToast({
        type: 'error',
        title: 'Stock Limit Reached',
        message: `Only ${available} unit(s) available in inventory.`,
      });
      return;
    }

    setCart((prev) => {
      const idx = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedVariant === variantInfo
      );
      if (idx >= 0) {
        return prev.map((item, i) => i === idx ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1, selectedVariant: variantInfo, serviceDetails }];
    });

    addToast({
      type: 'success',
      title: 'Added to Bag',
      message: `${product.name} added to your cart.`,
    });
  };

  const updateCartQuantity = (index: number, delta: number) => {
    setCart((prev) => {
      const item = prev[index];
      if (!item) return prev;
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      const available = getAvailableStock(item.product);
      if (!item.product.isServiceItem && newQty > available) {
        addToast({
          type: 'warning',
          title: 'Max Stock Reached',
          message: `Only ${available} units available.`,
        });
        return prev;
      }
      return prev.map((it, i) => i === index ? { ...it, quantity: newQty } : it);
    });
  };

  // Cart Calculations
  const cartCalculations = useMemo(() => {
    let subtotalMrp = 0;
    let totalDiscount = 0;

    const items = cart.map((c) => {
      const mrp = c.product.price;
      const tierPrice = getTierPrice(mrp);
      const discount = mrp - tierPrice;
      const expressExtra = c.serviceDetails?.express ? 250 : 0;
      const lineFinal = (tierPrice + expressExtra) * c.quantity;

      subtotalMrp += mrp * c.quantity;
      totalDiscount += discount * c.quantity;

      return {
        productId: c.product.id,
        sku: c.product.sku,
        productName: c.product.name,
        unitPrice: tierPrice,
        quantity: c.quantity,
        discountPercent: discountPct,
        finalPrice: lineFinal,
        variantInfo: c.selectedVariant,
        serviceDetails: c.serviceDetails,
      };
    });

    const netSubtotal = subtotalMrp - totalDiscount;
    const deliveryFee = deliveryType === 'online_delivery' ? (netSubtotal > 3000 ? 0 : 150) : 0;
    const gstAmount = Math.round(netSubtotal * 0.18);
    const totalAmount = netSubtotal + gstAmount + deliveryFee;

    return {
      items,
      subtotalMrp,
      totalDiscount,
      netSubtotal,
      deliveryFee,
      gstAmount,
      totalAmount,
      totalItemsCount: cart.reduce((acc, c) => acc + c.quantity, 0),
    };
  }, [cart, discountPct, deliveryType]);

  // Order Placement
  const handlePlaceOrder = () => {
    if (cart.length === 0) return;

    const order = recordSale({
      type: deliveryType,
      memberId: currentUser.memberId,
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      customerEmail: customerInfo.email,
      tier,
      items: cartCalculations.items,
      subtotal: cartCalculations.subtotalMrp,
      discountTotal: cartCalculations.totalDiscount,
      deliveryFee: cartCalculations.deliveryFee,
      gstAmount: cartCalculations.gstAmount,
      totalAmount: cartCalculations.totalAmount,
      paymentMethod: checkoutPaymentMethod,
      isPaid: checkoutPaymentMethod !== 'pay_at_club',
      status: 'placed',
      deliveryAddress: deliveryType === 'online_delivery' ? deliveryAddress : undefined,
      deliverySlot: deliveryType === 'online_delivery' ? deliverySlot : undefined,
      pickupSlot: deliveryType === 'online_pickup' ? pickupSlot : undefined,
    });

    if (order) {
      setCart([]);
      setIsCheckoutModalOpen(false);
      setIsCartDrawerOpen(false);
      setTrackingOrderNumber(order.orderNumber);
      setActiveView('tracking');
    }
  };

  // Reorder previously purchased item
  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        addToCart(prod, item.variantInfo);
      }
    });
    setIsCartDrawerOpen(true);
  };

  // Active Tracked Order
  const trackedOrder = useMemo(() => {
    if (!trackingOrderNumber) {
      return orders[0] || null;
    }
    return orders.find(
      (o) => o.orderNumber.toLowerCase() === trackingOrderNumber.trim().toLowerCase()
    ) || null;
  }, [orders, trackingOrderNumber]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-lime-400">
              Champions Club Sports Equipment Store
            </span>
            {discountPct > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950 uppercase">
                {discountPct}% {tier} Discount Applied
              </span>
            )}
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white mt-1">
            Champions Club ProShop
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Official equipment, protective gear, apparel &amp; accessories for Box Cricket, Badminton, Hockey, Football, Volleyball, Table Tennis, Kho Kho &amp; Kabaddi.
          </p>
        </div>

        {/* View Switchers & Cart Pill */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveView('catalog')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeView === 'catalog' ? 'bg-lime-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Catalog
            </button>
            <button
              onClick={() => setActiveView('tracking')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeView === 'tracking' ? 'bg-lime-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Track Order
            </button>
            <button
              onClick={() => setActiveView('history')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeView === 'history' ? 'bg-lime-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Order History
            </button>
            <button
              onClick={() => setActiveView('wishlist')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                activeView === 'wishlist' ? 'bg-lime-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Heart className="w-3 h-3" />
              <span>Saved ({wishlistIds.length})</span>
            </button>
          </div>

          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="relative px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-heading font-extrabold text-xs shadow-md shadow-lime-400/20 flex items-center gap-2 transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Bag ({cartCalculations.totalItemsCount})</span>
            {cartCalculations.totalItemsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping absolute -top-1 -right-1" />
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: CATALOG & PRODUCT BROWSING */}
      {/* ========================================================================= */}
      {activeView === 'catalog' && (
        <div className="space-y-6">
          {/* Main Sport Filter Navigation Bar */}
          <div className="p-3.5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
                Official Club Sports Equipment
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {products.length} Items Catalogued
              </span>
            </div>

            {/* 10 Main Sport Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {SPORT_FILTER_TABS.map((sport) => {
                const isSelected = selectedSport === sport.id;
                const count = sport.id === 'all'
                  ? products.length
                  : products.filter(p => p.sport === sport.id || (p.compatibleSports && p.compatibleSports.includes(sport.id as any))).length;

                return (
                  <button
                    key={sport.id}
                    onClick={() => {
                      setSelectedSport(sport.id);
                      setSelectedCategory('all');
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                      isSelected
                        ? 'bg-lime-400 text-slate-950 shadow-lg shadow-lime-400/25 scale-[1.02]'
                        : 'bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800'
                    }`}
                  >
                    <span className="text-sm">{sport.icon}</span>
                    <span>{sport.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Combined Filters & Search Bar */}
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
            {/* Row 1: Search Input */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by product name, brand, sport, material, skill level, or specification..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
              />
            </div>

            {/* Row 2: Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {[
                { id: 'all', label: 'All Equipment' },
                { id: 'bats', label: 'Bats' },
                { id: 'rackets', label: 'Racquets' },
                { id: 'balls', label: 'Balls & Shuttles' },
                { id: 'equipment', label: 'Court Nets & Gear' },
                { id: 'protective', label: 'Protective Gear' },
                { id: 'shoes', label: 'Footwear' },
                { id: 'bags', label: 'Bags & Kitbags' },
                { id: 'apparel', label: 'Jerseys & Apparel' },
                { id: 'accessories', label: 'Accessories' },
                { id: 'strings', label: 'Strings & Grips' },
                { id: 'services', label: 'Workshop Services' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat.id
                      ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/20'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Row 3: Dropdown Filters (Price Range, Skill Level, Brand, Sort, In-Stock) */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mr-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-lime-400" />
                <span>Filters:</span>
              </div>

              {/* Price Range Filter */}
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">Price: All Ranges</option>
                <option value="under_500">Under ₹500</option>
                <option value="500_1500">₹500 - ₹1,500</option>
                <option value="1500_5000">₹1,500 - ₹5,000</option>
                <option value="5000_plus">₹5,000 &amp; Above</option>
              </select>

              {/* Skill Level Filter */}
              <select
                value={selectedSkillLevel}
                onChange={(e) => setSelectedSkillLevel(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">Skill: All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Professional">Professional</option>
              </select>

              {/* Brand Filter */}
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">Brand: All Brands</option>
                {brands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
              >
                <option value="featured">Sort: Recommended</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="newest">Sort: Newest</option>
                <option value="name">Product Name (A-Z)</option>
              </select>

              {/* In-Stock Toggle */}
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-300 cursor-pointer whitespace-nowrap ml-auto">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="accent-lime-400 rounded"
                />
                <span>In-Stock Only</span>
              </label>
            </div>
          </div>

          {/* Results summary + clear filters */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-slate-400">
              Showing <span className="text-white font-bold">{filteredProducts.length}</span> matching product{filteredProducts.length !== 1 ? 's' : ''}
              {selectedSport !== 'all' && <span> in <span className="text-lime-400 font-bold capitalize">{selectedSport.replace(/_/g, ' ')}</span></span>}
              {selectedCategory !== 'all' && <span> • Category: <span className="text-slate-200 font-semibold capitalize">{selectedCategory}</span></span>}
              {selectedPriceRange !== 'all' && <span> • Filtered by Price</span>}
              {selectedSkillLevel !== 'all' && <span> • Skill: <span className="text-slate-200">{selectedSkillLevel}</span></span>}
              {inStockOnly && <span> • In-Stock</span>}
            </span>
            {(selectedSport !== 'all' || selectedCategory !== 'all' || selectedBrand !== 'all' || selectedPriceRange !== 'all' || selectedSkillLevel !== 'all' || inStockOnly || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedSport('all');
                  setSelectedCategory('all');
                  setSelectedBrand('all');
                  setSelectedPriceRange('all');
                  setSelectedSkillLevel('all');
                  setInStockOnly(false);
                  setSearchQuery('');
                  setSortBy('featured');
                }}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800"
              >
                <RotateCcw className="w-3 h-3 text-lime-400" />
                Clear All Filters
              </button>
            )}
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const available = getAvailableStock(product);
              const isService = product.isServiceItem;
              const isOut = !isService && available === 0;
              const isLow = !isService && available <= product.reorderLevel && available > 0;
              const tierPrice = getTierPrice(product.price);
              const isSaved = wishlistIds.includes(product.id);

              return (
                <div
                  key={product.id}
                  onClick={() => {
                    setSelectedProductForModal(product);
                    setModalSelectedVariant(product.variants?.[0]?.size || '');
                    setModalQty(1);
                  }}
                  className="rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition overflow-hidden flex flex-col justify-between shadow-xl group cursor-pointer relative"
                >
                  <div>
                    <div className="relative h-52 w-full overflow-hidden bg-slate-950 p-2">
                      <img
                        src={product.image}
                        alt={product.name}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/images/proshop/placeholder.svg'; }}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Brand & Stock Status Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 text-white border border-slate-700 backdrop-blur-md">
                          {product.brand}
                        </span>
                        {discountPct > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950 shadow-sm">
                            {discountPct}% TIER PRICE
                          </span>
                        )}
                      </div>

                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <button
                          onClick={(e) => toggleWishlist(product.id, e)}
                          className={`p-2 rounded-full backdrop-blur-md transition ${
                            isSaved ? 'bg-rose-500 text-white' : 'bg-slate-950/70 text-slate-300 hover:text-white'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Stock Level Badge */}
                      <div className="absolute bottom-3 left-3">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold shadow-md ${
                          isService
                            ? 'bg-purple-500/90 text-white'
                            : isOut
                              ? 'bg-rose-600 text-white'
                              : isLow
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-950/80 text-slate-300 border border-slate-700'
                        }`}>
                          {isService ? 'Workshop Service' : isOut ? 'Out of Stock' : isLow ? `Only ${available} Left!` : 'In Stock'}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>{product.sku}</span>
                        <span className="text-lime-400 capitalize">{product.sport.replace(/_/g, ' ')} • {product.category}</span>
                      </div>
                      <h3 className="font-heading font-bold text-sm text-white line-clamp-2 group-hover:text-lime-300 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2">{product.shortDescription || product.description}</p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-slate-800/80 mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-heading font-extrabold text-base text-white">
                          {formatINR(tierPrice)}
                        </span>
                        {discountPct > 0 && (
                          <span className="text-xs text-slate-500 line-through">
                            {formatINR(product.price)}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">+ {product.gstPercent || 18}% GST</span>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProductForModal(product);
                          setModalSelectedVariant(product.variants?.[0]?.size || '');
                          setModalQty(1);
                        }}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1"
                        title="View Full Specifications & Details"
                      >
                        <Eye className="w-3.5 h-3.5 text-lime-400" />
                        <span>View Details</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        disabled={isOut}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                          isOut
                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                            : 'bg-lime-400 hover:bg-lime-300 text-slate-950 shadow-md shadow-lime-400/20'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>{isService ? 'Configure' : 'Add to Cart'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: ORDER TRACKING PAGE */}
      {/* ========================================================================= */}
      {activeView === 'tracking' && (
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl max-w-2xl mx-auto space-y-4">
            <div className="text-center space-y-1">
              <span className="text-xs font-bold text-lime-400 uppercase tracking-wider">Live Fulfillment Status</span>
              <h2 className="font-heading font-extrabold text-2xl text-white">Track Pro Shop Order</h2>
              <p className="text-xs text-slate-400">Enter your order ID (e.g. ORD-2026-1082) to view live status.</p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Order Number..."
                value={trackingOrderNumber}
                onChange={(e) => setTrackingOrderNumber(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-white font-mono text-sm uppercase focus:outline-none focus:border-lime-400"
              />
              <button
                onClick={() => {}}
                className="px-5 py-2.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow-md shadow-lime-400/20"
              >
                Track
              </button>
            </div>
          </div>

          {trackedOrder ? (
            <div className="max-w-3xl mx-auto rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-2xl">
              {/* Order Header Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <span className="font-mono text-xs text-lime-400 font-bold">{trackedOrder.orderNumber}</span>
                  <h3 className="font-heading font-bold text-lg text-white">
                    Order for {trackedOrder.customerName}
                  </h3>
                  <span className="text-xs text-slate-400">Placed on {formatDateTime(trackedOrder.createdAt)}</span>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                    trackedOrder.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    trackedOrder.status === 'ready_for_pickup' || trackedOrder.status === 'out_for_delivery' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                    'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {trackedOrder.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm font-extrabold text-white block mt-1">{formatINR(trackedOrder.totalAmount)}</span>
                </div>
              </div>

              {/* Live Tracking Stepper */}
              <div className="space-y-4">
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-400">Fulfillment Pipeline</h4>
                <div className="relative pl-6 space-y-6 border-l-2 border-slate-800 ml-3">
                  {(trackedOrder.trackingEvents || [
                    { status: 'placed', timestamp: trackedOrder.createdAt, title: 'Order Placed Online', notes: 'Stock reserved across single inventory.' },
                  ]).map((event, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-lime-400 ring-4 ring-slate-900 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-bold text-white text-xs block">{event.title}</span>
                        <p className="text-[11px] text-slate-400">{event.notes}</p>
                        <span className="text-[10px] text-slate-500 font-mono block">{formatDateTime(event.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items in this Order */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-400">Ordered Items</h4>
                <div className="divide-y divide-slate-800/60">
                  {trackedOrder.items.map((it, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">{it.productName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {it.quantity} x {formatINR(it.unitPrice)} {it.variantInfo ? `[${it.variantInfo}]` : ''}
                        </div>
                      </div>
                      <span className="font-heading font-extrabold text-white">{formatINR(it.finalPrice)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Package className="w-12 h-12 mx-auto text-slate-700 mb-2" />
              <p className="text-xs">No orders found matching this number. Check your order confirmation.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: WISHLIST / SAVED ITEMS */}
      {/* ========================================================================= */}
      {activeView === 'wishlist' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-xl text-white">Saved Gear ({wishlistIds.length})</h3>
            <button onClick={() => setActiveView('catalog')} className="text-xs text-lime-400 hover:underline">
              ← Back to Catalog
            </button>
          </div>

          {wishlistIds.length === 0 ? (
            <div className="text-center py-16 text-slate-500 space-y-3">
              <Heart className="w-12 h-12 mx-auto text-slate-700" />
              <p className="text-xs">You have not saved any gear items yet.</p>
              <button
                onClick={() => setActiveView('catalog')}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products
                .filter((p) => wishlistIds.includes(p.id))
                .map((product) => {
                  const available = getAvailableStock(product);
                  const isOut = available === 0;
                  const tierPrice = getTierPrice(product.price);

                  return (
                    <div
                      key={product.id}
                      className="rounded-3xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between shadow-xl"
                    >
                      <div>
                        <img src={product.image} alt={product.name} className="w-full h-44 object-cover rounded-2xl mb-3 bg-slate-950" />
                        <span className="text-[10px] font-bold uppercase text-lime-400">{product.brand}</span>
                        <h4 className="font-heading font-bold text-sm text-white mt-1">{product.name}</h4>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="font-heading font-extrabold text-base text-white">{formatINR(tierPrice)}</span>
                          <span className="text-[10px] text-slate-500 block">{available} available</span>
                        </div>
                        <button
                          onClick={() => addToCart(product)}
                          disabled={isOut}
                          className="px-3 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs"
                        >
                          Add to Bag
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: ORDER HISTORY & REORDER */}
      {/* ========================================================================= */}
      {activeView === 'history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-xl text-white">Your Past Pro Shop Purchases</h3>
            <span className="text-xs text-slate-400">{orders.length} orders on record</span>
          </div>

          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <span className="font-mono text-xs font-bold text-lime-400">{order.orderNumber}</span>
                    <span className="text-xs text-slate-400 ml-2">({formatDateTime(order.createdAt)})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      order.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    <span className="font-heading font-extrabold text-sm text-white">{formatINR(order.totalAmount)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <div>
                        <div className="font-bold text-white">{it.productName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{it.quantity} x {formatINR(it.unitPrice)}</div>
                      </div>
                      <span className="font-extrabold text-white">{formatINR(it.finalPrice)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Payment: {order.paymentMethod.toUpperCase()}</span>
                  <button
                    onClick={() => handleReorder(order)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1.5 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-lime-400" />
                    <span>Reorder Items</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CART DRAWER */}
      {/* ========================================================================= */}
      {isCartDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 h-full border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-lime-400" />
                  <h3 className="font-heading font-bold text-lg text-white">Your Pro Shop Bag</h3>
                </div>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-20 text-slate-500 space-y-2">
                  <ShoppingBag className="w-12 h-12 mx-auto text-slate-700" />
                  <p className="text-xs">Your shopping bag is empty.</p>
                </div>
              ) : (
                <div className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto pr-1 divide-y divide-slate-800/60">
                  {cart.map((item, idx) => {
                    const mrp = item.product.price;
                    const tierPrice = getTierPrice(mrp);

                    return (
                      <div key={idx} className="pt-3 flex items-center justify-between gap-3 text-xs">
                        <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded-xl object-cover bg-slate-950 shrink-0" />
                        <div className="flex-1">
                          <div className="font-bold text-white line-clamp-1">{item.product.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {item.selectedVariant ? `[${item.selectedVariant}] ` : ''}
                            {formatINR(tierPrice)} each
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateCartQuantity(idx, -1)}
                            className="w-6 h-6 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold text-white w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(idx, 1)}
                            className="w-6 h-6 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-white font-mono">{formatINR(cartCalculations.netSubtotal)}</span>
                  </div>
                  {discountPct > 0 && (
                    <div className="flex justify-between text-lime-400">
                      <span>{tier.toUpperCase()} Member Savings</span>
                      <span className="font-mono font-bold">-{formatINR(cartCalculations.totalDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Estimated GST (18%)</span>
                    <span className="text-white font-mono">{formatINR(cartCalculations.gstAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-heading font-extrabold text-white pt-1 border-t border-slate-800">
                    <span>Estimated Total</span>
                    <span className="text-lime-400 text-base">{formatINR(cartCalculations.totalAmount)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    setIsCheckoutModalOpen(true);
                  }}
                  className="w-full py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-heading font-extrabold text-sm shadow-xl shadow-lime-400/20 flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CHECKOUT MODAL: PICKUP AT CLUB OR HOME DELIVERY */}
      {/* ========================================================================= */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-heading font-bold text-lg text-white">Complete Pro Shop Order</h3>
              <button onClick={() => setIsCheckoutModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Delivery Mode Toggle */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType('online_pickup')}
                className={`p-4 rounded-2xl border text-left space-y-1 transition ${
                  deliveryType === 'online_pickup'
                    ? 'bg-lime-400/10 border-lime-400 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-lime-400 uppercase">
                  <MapPin className="w-4 h-4" />
                  <span>Pickup at Club Counter</span>
                </div>
                <p className="text-[11px] text-slate-400">Collect free at the Pro Shop front desk within 30 mins.</p>
                <span className="text-[10px] text-emerald-400 font-bold block">Free Pickup</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('online_delivery')}
                className={`p-4 rounded-2xl border text-left space-y-1 transition ${
                  deliveryType === 'online_delivery'
                    ? 'bg-lime-400/10 border-lime-400 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-lime-400 uppercase">
                  <Truck className="w-4 h-4" />
                  <span>Doorstep Home Delivery</span>
                </div>
                <p className="text-[11px] text-slate-400">Delivered directly to your residence across Bengaluru.</p>
                <span className="text-[10px] text-slate-400 font-bold block">
                  {cartCalculations.netSubtotal > 3000 ? 'Free Delivery (Over ₹3,000)' : '₹150 Flat Delivery Fee'}
                </span>
              </button>
            </div>

            {/* Contact Details */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <span className="font-bold text-white uppercase text-[11px] block">Customer Contact</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
            </div>

            {/* Delivery Address Form if Home Delivery */}
            {deliveryType === 'online_delivery' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <span className="font-bold text-white uppercase text-[11px] block">Delivery Address & Preferred Slot</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Street Address / Society"
                    value={deliveryAddress.street}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                    className="col-span-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Apartment / Villa Number"
                    value={deliveryAddress.apartment}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, apartment: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={deliveryAddress.postalCode}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, postalCode: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 text-[11px]">Preferred Delivery Slot</label>
                  <select
                    value={deliverySlot}
                    onChange={(e) => setDeliverySlot(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  >
                    <option value="Today (6:00 PM - 8:00 PM)">Today Evening (6:00 PM - 8:00 PM)</option>
                    <option value="Tomorrow Morning (9:00 AM - 12:00 PM)">Tomorrow Morning (9:00 AM - 12:00 PM)</option>
                    <option value="Tomorrow Evening (5:00 PM - 8:00 PM)">Tomorrow Evening (5:00 PM - 8:00 PM)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Payment Options */}
            <div className="space-y-2">
              <label className="text-slate-400 block text-[11px] font-bold uppercase">Select Payment Mode</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'upi', label: 'Instant UPI / QR', icon: Sparkles },
                  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
                  { id: 'pay_at_club', label: 'Pay at Club Counter', icon: MapPin },
                ].map((pm) => {
                  const Icon = pm.icon;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setCheckoutPaymentMethod(pm.id as any)}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                        checkoutPaymentMethod === pm.id
                          ? 'bg-lime-400 text-slate-950 font-bold border-lime-400 shadow-md'
                          : 'bg-slate-950 text-slate-300 border-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px]">{pm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Order Total & Submit */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Total Amount (Incl. GST & Delivery)</span>
                <span className="font-heading font-extrabold text-xl text-lime-400">
                  {formatINR(cartCalculations.totalAmount)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  className="px-6 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-heading font-extrabold text-xs shadow-lg shadow-lime-400/20"
                >
                  Confirm & Place Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUICK VIEW / DETAIL MODAL */}
      {/* ========================================================================= */}
      {selectedProductForModal && (() => {
        const mp = selectedProductForModal;
        const available = getAvailableStock(mp);
        const tierPrice = getTierPrice(mp.price);
        const isOut = !mp.isServiceItem && available === 0;
        const relatedProducts = products
          .filter(p => p.sport === mp.sport && p.id !== mp.id)
          .slice(0, 4);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="w-full max-w-2xl bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl my-4">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-lime-400 font-bold">{mp.sku}</span>
                  {mp.skillLevel && (
                    <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold capitalize">
                      {mp.skillLevel}
                    </span>
                  )}
                </div>
                <button onClick={() => setSelectedProductForModal(null)} className="text-slate-400 hover:text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Image + Core Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <img
                      src={mp.image}
                      alt={mp.name}
                      onError={(e) => { (e.target as HTMLImageElement).src = '/images/proshop/placeholder.svg'; }}
                      className="w-full h-56 object-contain p-3 rounded-2xl bg-slate-950"
                    />
                    {/* Additional images if available */}
                    {mp.images && mp.images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto">
                        {mp.images.slice(1, 4).map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt={`${mp.name} view ${i + 2}`}
                            onError={(e) => { (e.target as HTMLImageElement).src = '/images/proshop/placeholder.svg'; }}
                            className="w-16 h-16 object-cover rounded-xl bg-slate-950 border border-slate-800 flex-shrink-0"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 text-xs">
                    {/* Brand + Sport */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase text-lime-400">{mp.brand}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-[10px] text-slate-400 capitalize">{mp.sport.replace('_', ' ')}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-[10px] text-slate-400 capitalize">{mp.category}</span>
                    </div>

                    {/* Name */}
                    <h3 className="font-heading font-bold text-lg text-white leading-tight">{mp.name}</h3>

                    {/* Description */}
                    <p className="text-slate-400 leading-relaxed">{mp.description}</p>

                    {/* Price */}
                    <div className="pt-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-heading font-extrabold text-xl text-white">
                          {formatINR(tierPrice)}
                        </span>
                        {discountPct > 0 && (
                          <>
                            <span className="text-sm text-slate-500 line-through">{formatINR(mp.price)}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-400 font-bold">{discountPct}% off</span>
                          </>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">+ {mp.gstPercent || 18}% GST</span>
                    </div>

                    {/* Stock Status */}
                    <div>
                      {mp.isServiceItem ? (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-semibold">Workshop Service</span>
                      ) : isOut ? (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 font-semibold">Out of Stock</span>
                      ) : (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                          In Stock — {available} available
                        </span>
                      )}
                    </div>

                    {/* Variants */}
                    {mp.variants && mp.variants.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <label className="text-slate-400 block text-[10px] uppercase font-bold">Size / Variant</label>
                        <div className="flex flex-wrap gap-1.5">
                          {mp.variants.map((v) => (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => setModalSelectedVariant(v.size || '')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                                modalSelectedVariant === v.size
                                  ? 'bg-lime-400 text-slate-950 border-lime-400'
                                  : 'bg-slate-950 text-slate-300 border-slate-700'
                              } ${v.stockQty === 0 ? 'opacity-40 line-through' : ''}`}
                            >
                              {v.size} {v.weight ? `· ${v.weight}` : ''}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Specifications Grid */}
                {(mp.material || mp.skillLevel || mp.intendedUse || mp.warranty || mp.specifications) && (
                  <div className="bg-slate-950 rounded-2xl p-4 space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Specifications</h4>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                      {mp.material && (
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Material</span>
                          <span className="text-xs text-white font-medium">{mp.material}</span>
                        </div>
                      )}
                      {mp.skillLevel && (
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Skill Level</span>
                          <span className="text-xs text-white font-medium">{mp.skillLevel}</span>
                        </div>
                      )}
                      {mp.intendedUse && (
                        <div className="col-span-2">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Intended Use</span>
                          <span className="text-xs text-white font-medium">{mp.intendedUse}</span>
                        </div>
                      )}
                      {mp.warranty && (
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Warranty</span>
                          <span className="text-xs text-white font-medium">{mp.warranty}</span>
                        </div>
                      )}
                      {mp.specifications && Object.entries(mp.specifications).map(([key, val]) => (
                        <div key={key}>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">{key}</span>
                          <span className="text-xs text-white font-medium">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      More from {mp.sport.replace(/_/g, ' ')}
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                      {relatedProducts.map(rp => (
                        <button
                          key={rp.id}
                          onClick={() => {
                            setSelectedProductForModal(rp);
                            setModalSelectedVariant(rp.variants?.[0]?.size || '');
                            setModalQty(1);
                          }}
                          className="group rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-600 overflow-hidden transition text-left"
                        >
                          <img
                            src={rp.image}
                            alt={rp.name}
                            onError={(e) => { (e.target as HTMLImageElement).src = '/images/proshop/placeholder.svg'; }}
                            className="w-full h-16 object-cover group-hover:opacity-80 transition"
                          />
                          <div className="p-1.5">
                            <p className="text-[10px] text-white font-semibold line-clamp-2 leading-tight">{rp.name}</p>
                            <p className="text-[10px] text-lime-400 font-bold mt-0.5">{formatINR(getTierPrice(rp.price))}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-5 pt-0 border-t border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Qty:</span>
                  <div className="flex items-center gap-1 bg-slate-950 rounded-lg border border-slate-700 p-0.5">
                    <button
                      onClick={() => setModalQty(q => Math.max(1, q - 1))}
                      className="w-7 h-7 rounded-md text-white hover:bg-slate-800 flex items-center justify-center transition"
                    ><Minus className="w-3 h-3" /></button>
                    <span className="text-xs text-white font-bold w-6 text-center">{modalQty}</span>
                    <button
                      onClick={() => setModalQty(q => Math.min(available || 999, q + 1))}
                      className="w-7 h-7 rounded-md text-white hover:bg-slate-800 flex items-center justify-center transition"
                    ><Plus className="w-3 h-3" /></button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProductForModal(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      for (let i = 0; i < modalQty; i++) {
                        addToCart(mp, modalSelectedVariant);
                      }
                      setSelectedProductForModal(null);
                    }}
                    disabled={isOut}
                    className={`px-5 py-2 rounded-xl text-xs font-heading font-extrabold shadow-md transition ${
                      isOut
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        : 'bg-lime-400 hover:bg-lime-300 text-slate-950 shadow-lime-400/20'
                    }`}
                  >
                    {isOut ? 'Out of Stock' : `Add ${modalQty > 1 ? `×${modalQty}` : ''} to Bag`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
