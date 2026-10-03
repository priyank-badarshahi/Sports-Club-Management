import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store';
import { Product, ProductCategory, Order } from '../../types';
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
  Wallet,
  Sparkles, 
  X, 
  Plus, 
  Minus, 
  ArrowRight, 
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Package,
  Zap,
  Tag
} from 'lucide-react';
import { formatINR, formatDateTime, getTierBadgeClass } from '../../lib/formatters';
import { getMemberShopDiscountPercent, getAvailableStock } from '../../lib/inventory';

export const MemberShopPage: React.FC = () => {
  const { products, currentUser, orders, members, recordSale, addToast } = useAppStore();

  // Active View Tab: 'catalog' | 'orders' | 'services'
  const [activeTab, setActiveTab] = useState<'catalog' | 'orders' | 'services'>('catalog');

  // Member info
  const member = useMemo(() => {
    return members.find((m) => m.id === currentUser.memberId) || {
      id: currentUser.memberId || 'mem_1',
      fullName: currentUser.name || 'Member',
      tier: currentUser.tier || 'gold',
      walletBalance: 12500,
      activeTabBalance: 1850,
      email: currentUser.email || 'member@championsclub.in',
      phone: (currentUser as any).phone || '+91 98201 44520',
      address: 'Penthouse 4B, Kingfisher Towers, Bengaluru',
    };
  }, [members, currentUser]);

  const tier = member.tier || 'gold';
  const discountPct = getMemberShopDiscountPercent(tier);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSport, setSelectedSport] = useState<string>('all');

  // Cart State
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
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Service Customization Modal
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [serviceConfig, setServiceConfig] = useState({
    tensionLbs: 26,
    mainString: 'Yonex BG65 Ti (White)',
    crossString: 'Yonex BG65 Ti (White)',
    express: false,
    racketModel: 'My Match Racquet',
  });

  // Checkout State
  const [deliveryType, setDeliveryType] = useState<'online_pickup' | 'online_delivery'>('online_pickup');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'member_tab' | 'upi' | 'card'>('wallet');

  const getTierPrice = (mrp: number) => {
    return Math.round(mrp * (1 - discountPct / 100));
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = !searchQuery || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchSport = selectedSport === 'all' || p.sport === selectedSport;
      return matchSearch && matchCat && !p.isServiceItem;
    });
  }, [products, searchQuery, selectedCategory, selectedSport]);

  const serviceProduct = useMemo(() => {
    return products.find((p) => p.isServiceItem) || products[0];
  }, [products]);

  // Cart Operations
  const addToCart = (product: Product, variantInfo?: string) => {
    const available = getAvailableStock(product);
    const existing = cart.find((item) => item.product.id === product.id && item.selectedVariant === variantInfo);
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
      const idx = prev.findIndex((item) => item.product.id === product.id && item.selectedVariant === variantInfo);
      if (idx >= 0) {
        return prev.map((item, i) => i === idx ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1, selectedVariant: variantInfo }];
    });

    addToast({
      type: 'success',
      title: 'Added to Member Bag',
      message: `${product.name} added with ${discountPct}% ${tier.toUpperCase()} discount.`,
    });
  };

  const updateCartQty = (index: number, delta: number) => {
    setCart((prev) => {
      const item = prev[index];
      if (!item) return prev;
      const newQty = item.quantity + delta;
      if (newQty <= 0) return prev.filter((_, i) => i !== index);
      const available = getAvailableStock(item.product);
      if (!item.product.isServiceItem && newQty > available) return prev;
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

  const handleCompleteOrder = () => {
    if (cart.length === 0) return;

    if (paymentMethod === 'wallet' && (member.walletBalance || 0) < cartCalculations.totalAmount) {
      addToast({
        type: 'error',
        title: 'Insufficient Wallet Balance',
        message: `Your balance is ₹${member.walletBalance}. Please top up or choose "Charge to Tab".`,
      });
      return;
    }

    const order = recordSale({
      type: deliveryType,
      memberId: member.id,
      customerName: member.fullName,
      customerPhone: member.phone,
      customerEmail: member.email,
      tier,
      items: cartCalculations.items,
      subtotal: cartCalculations.subtotalMrp,
      discountTotal: cartCalculations.totalDiscount,
      deliveryFee: cartCalculations.deliveryFee,
      gstAmount: cartCalculations.gstAmount,
      totalAmount: cartCalculations.totalAmount,
      paymentMethod,
      isPaid: paymentMethod !== 'member_tab',
      status: 'placed',
      deliverySlot: deliveryType === 'online_delivery' ? 'Today Evening (6:00 PM - 8:00 PM)' : undefined,
      pickupSlot: deliveryType === 'online_pickup' ? 'Today at Pro Shop Counter' : undefined,
    });

    if (order) {
      setCart([]);
      setIsCheckoutModalOpen(false);
      setIsCartDrawerOpen(false);
      setActiveTab('orders');
    }
  };

  const handleAddStringingService = () => {
    if (!serviceProduct) return;
    setCart((prev) => [
      ...prev,
      {
        product: serviceProduct,
        quantity: 1,
        selectedVariant: `${serviceConfig.tensionLbs} lbs (${serviceConfig.racketModel})`,
        serviceDetails: {
          tensionLbs: serviceConfig.tensionLbs,
          mainString: serviceConfig.mainString,
          crossString: serviceConfig.crossString,
          express: serviceConfig.express,
        },
      },
    ]);
    setServiceModalOpen(false);
    addToast({
      type: 'success',
      title: 'Stringing Service Added',
      message: `Configured for ${serviceConfig.tensionLbs} lbs.`,
    });
  };

  const memberOrders = useMemo(() => {
    return orders.filter((o) => o.memberId === member.id || o.customerName === member.fullName);
  }, [orders, member]);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-lime-400">
              Exclusive Member Pro Shop
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-extrabold ${getTierBadgeClass(tier)}`}>
              {tier} ({discountPct}% Entitlement)
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white mt-1">
            Pro Shop & Equipment Workshop
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Automatic tier pricing, express electronic racquet stringing, and direct club wallet / tab settlement.
          </p>
        </div>

        {/* Member Account Overview Cards & Cart */}
        <div className="flex items-center gap-3">
          <div className="p-3 px-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase block">Wallet Balance</span>
            <span className="font-heading font-extrabold text-sm text-lime-400">
              {formatINR(member.walletBalance || 0)}
            </span>
          </div>

          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="relative px-4 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-heading font-extrabold text-xs shadow-md shadow-lime-400/20 flex items-center gap-2 transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Bag ({cartCalculations.totalItemsCount})</span>
            {cartCalculations.totalItemsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping absolute -top-1 -right-1" />
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'catalog' ? 'bg-lime-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Pro Equipment Catalog
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'services' ? 'bg-lime-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Racquet Workshop & Stringing</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'orders' ? 'bg-lime-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          My Orders ({memberOrders.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CATALOG */}
      {/* ========================================================================= */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Search & Category Filter */}
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search gear with member discount..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="rackets">Rackets & Bats</option>
                <option value="strings">Strings</option>
                <option value="grips">Grips</option>
                <option value="balls">Balls & Shuttles</option>
                <option value="shoes">Shoes</option>
                <option value="apparel">Apparel</option>
                <option value="bags">Bags</option>
              </select>

              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">All Sports</option>
                <option value="tennis">Tennis</option>
                <option value="padel">Padel</option>
                <option value="badminton">Badminton</option>
                <option value="cricket">Cricket</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => {
              const available = getAvailableStock(p);
              const isOut = available <= 0;
              const tierPrice = getTierPrice(p.price);

              return (
                <div
                  key={p.id}
                  className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition shadow-xl group"
                >
                  <div>
                    <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-950 mb-3">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-slate-950/80 text-white">
                        {p.brand}
                      </span>
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-400 text-slate-950">
                        {discountPct}% OFF
                      </span>
                    </div>

                    <span className="text-[10px] font-bold uppercase text-lime-400 block">{p.sport}</span>
                    <h4 className="font-heading font-bold text-sm text-white line-clamp-2 mt-0.5">{p.name}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{p.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-heading font-extrabold text-base text-white">{formatINR(tierPrice)}</span>
                        <span className="text-xs text-slate-500 line-through">{formatINR(p.price)}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">{isOut ? 'Sold out' : `${available} in stock`}</span>
                    </div>

                    <button
                      onClick={() => addToCart(p)}
                      disabled={isOut}
                      className="p-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold disabled:bg-slate-800 disabled:text-slate-600 transition"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: WORKSHOP SERVICES (RE-STRINGING) */}
      {/* ========================================================================= */}
      {activeTab === 'services' && (
        <div className="max-w-3xl mx-auto rounded-3xl bg-slate-900 border border-purple-500/40 p-6 space-y-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-white">
                Electronic Constant-Pull Racquet Re-stringing
              </h3>
              <p className="text-xs text-slate-400">
                Calibrated daily to within 0.1 lbs precision with 4-knot tournament finish. Same-day collection.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Your Racquet Model</label>
              <input
                type="text"
                value={serviceConfig.racketModel}
                onChange={(e) => setServiceConfig({ ...serviceConfig, racketModel: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400 font-bold">Tension Specification</label>
                <span className="font-heading font-extrabold text-lime-400 text-sm">{serviceConfig.tensionLbs} lbs</span>
              </div>
              <input
                type="range"
                min="20"
                max="65"
                value={serviceConfig.tensionLbs}
                onChange={(e) => setServiceConfig({ ...serviceConfig, tensionLbs: Number(e.target.value) })}
                className="w-full accent-lime-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Main String</label>
                <select
                  value={serviceConfig.mainString}
                  onChange={(e) => setServiceConfig({ ...serviceConfig, mainString: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                >
                  <option value="Yonex BG65 Ti">Yonex BG65 Ti (Durability)</option>
                  <option value="Yonex BG80 Power">Yonex BG80 Power (Crisp)</option>
                  <option value="Luxilon ALU Power 125">Luxilon ALU Power (Tennis)</option>
                  <option value="Babolat RPM Blast 125">Babolat RPM Blast (Tennis Spin)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Cross String</label>
                <select
                  value={serviceConfig.crossString}
                  onChange={(e) => setServiceConfig({ ...serviceConfig, crossString: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                >
                  <option value="Yonex BG65 Ti">Yonex BG65 Ti</option>
                  <option value="Yonex Aerobite Hybrid">Yonex Aerobite (Cross)</option>
                  <option value="Luxilon ALU Power 125">Luxilon ALU Power</option>
                  <option value="Wilson Sensation Multi">Wilson Sensation Multi</option>
                </select>
              </div>
            </div>

            <label className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/40 flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-bold text-purple-300 block">⚡ Express 30-Minute Priority Stringing (+₹250)</span>
                <span className="text-[11px] text-slate-400">Jump the queue and collect before your court slot begins</span>
              </div>
              <input
                type="checkbox"
                checked={serviceConfig.express}
                onChange={(e) => setServiceConfig({ ...serviceConfig, express: e.target.checked })}
                className="w-4 h-4 accent-purple-400"
              />
            </label>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">Service Fee (with {discountPct}% Tier Discount)</span>
              <span className="font-heading font-extrabold text-xl text-white">
                {formatINR(getTierPrice(499) + (serviceConfig.express ? 250 : 0))}
              </span>
            </div>

            <button
              onClick={handleAddStringingService}
              className="px-6 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-heading font-extrabold text-xs shadow-md"
            >
              Add Stringing Service to Bag
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MEMBER ORDERS */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {memberOrders.length === 0 ? (
            <div className="text-center py-16 text-slate-500 space-y-2">
              <Package className="w-12 h-12 mx-auto text-slate-700" />
              <p className="text-xs">You have no active or previous orders on your member account.</p>
            </div>
          ) : (
            memberOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-3 shadow-xl"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <span className="font-mono text-xs font-bold text-lime-400">{order.orderNumber}</span>
                    <span className="text-xs text-slate-400 ml-2">({formatDateTime(order.createdAt)})</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    order.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-slate-300">
                      <span>{it.quantity} x {it.productName} {it.variantInfo ? `[${it.variantInfo}]` : ''}</span>
                      <span className="font-mono font-bold text-white">{formatINR(it.finalPrice)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Settled via {order.paymentMethod.toUpperCase()}</span>
                  <span className="font-heading font-extrabold text-sm text-lime-400">{formatINR(order.totalAmount)}</span>
                </div>
              </div>
            ))
          )}
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
                  <h3 className="font-heading font-bold text-lg text-white">Member Pro Shop Bag</h3>
                </div>
                <button onClick={() => setIsCartDrawerOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                  <p className="text-xs">Your bag is empty.</p>
                </div>
              ) : (
                <div className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto pr-1 divide-y divide-slate-800/60">
                  {cart.map((item, idx) => (
                    <div key={idx} className="pt-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white line-clamp-1">{item.product.name}</div>
                        <div className="text-[10px] text-lime-400 font-mono">
                          {formatINR(getTierPrice(item.product.price))} ({discountPct}% {tier} rate)
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateCartQty(idx, -1)}
                          className="w-6 h-6 rounded bg-slate-800 text-white font-bold"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-white w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQty(idx, 1)}
                          className="w-6 h-6 rounded bg-slate-800 text-white font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex justify-between text-sm font-heading font-extrabold text-white">
                  <span>Total Amount</span>
                  <span className="text-lime-400 text-base">{formatINR(cartCalculations.totalAmount)}</span>
                </div>

                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    setIsCheckoutModalOpen(true);
                  }}
                  className="w-full py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-heading font-extrabold text-sm shadow-xl shadow-lime-400/20"
                >
                  Checkout with Member Account
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CHECKOUT MODAL */}
      {/* ========================================================================= */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-heading font-bold text-base text-white">Confirm Member Order</h3>
              <button onClick={() => setIsCheckoutModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Delivery mode */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDeliveryType('online_pickup')}
                className={`p-3 rounded-xl border font-bold ${
                  deliveryType === 'online_pickup' ? 'bg-lime-400 text-slate-950 border-lime-400' : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                Pickup at Club Desk
              </button>
              <button
                type="button"
                onClick={() => setDeliveryType('online_delivery')}
                className={`p-3 rounded-xl border font-bold ${
                  deliveryType === 'online_delivery' ? 'bg-lime-400 text-slate-950 border-lime-400' : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                Home Delivery
              </button>
            </div>

            {/* Member Payment Options */}
            <div className="space-y-2 text-xs">
              <label className="text-slate-400 font-bold uppercase text-[10px] block">Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-3 rounded-xl border text-left ${
                    paymentMethod === 'wallet' ? 'bg-lime-400/10 border-lime-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="font-bold text-lime-400 block">Club Wallet</span>
                  <span className="text-[10px]">Balance: ₹{member.walletBalance || 0}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('member_tab')}
                  className={`p-3 rounded-xl border text-left ${
                    paymentMethod === 'member_tab' ? 'bg-lime-400/10 border-lime-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="font-bold text-amber-400 block">Charge to Tab</span>
                  <span className="text-[10px]">Monthly club ledger invoice</span>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Total Due</span>
                <span className="font-heading font-extrabold text-xl text-lime-400">
                  {formatINR(cartCalculations.totalAmount)}
                </span>
              </div>

              <button
                onClick={handleCompleteOrder}
                className="px-6 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-heading font-extrabold text-xs shadow-md"
              >
                Confirm Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
