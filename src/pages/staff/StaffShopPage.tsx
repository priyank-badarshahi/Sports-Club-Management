import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store';
import { 
  Product, 
  ProductCategory, 
  OrderStatus, 
  Order, 
  PurchaseOrder, 
  Supplier, 
  MembershipTier, 
  OrderItem 
} from '../../types';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  AlertTriangle, 
  ArrowUpDown, 
  Check, 
  RefreshCw, 
  Barcode, 
  Printer, 
  User, 
  CreditCard, 
  Wallet, 
  DollarSign, 
  TrendingUp, 
  Package, 
  Truck, 
  RotateCcw, 
  X, 
  Edit, 
  Trash2, 
  Layers, 
  Filter, 
  Sliders, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Eye, 
  FileText,
  Sparkles,
  Zap,
  Info,
  Calendar,
  Phone,
  ShieldCheck,
  Percent,
  Split
} from 'lucide-react';
import { formatINR, formatDateTime, getTierBadgeClass } from '../../lib/formatters';
import { 
  calculateStockValuation, 
  calculateProductVelocity, 
  getMemberShopDiscountPercent, 
  getAvailableStock 
} from '../../lib/inventory';

export const StaffShopPage: React.FC = () => {
  const { 
    products, 
    orders, 
    purchaseOrders, 
    suppliers, 
    stockMovements, 
    members, 
    currentUser,
    recordSale, 
    updateOrderStatus, 
    updateProductStock, 
    adjustProductStock, 
    addProduct, 
    updateProduct, 
    deleteProduct,
    createPurchaseOrder, 
    receivePurchaseOrder, 
    addSupplier,
    addToast 
  } = useAppStore();

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'pos' | 'products' | 'inventory' | 'orders' | 'suppliers'>('pos');

  // ----------------------------------------------------
  // POS STATE
  // ----------------------------------------------------
  const [posSearch, setPosSearch] = useState('');
  const [posCategoryFilter, setPosCategoryFilter] = useState<string>('all');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [posCart, setPosCart] = useState<{
    product: Product;
    quantity: number;
    customDiscountPct?: number;
    variantInfo?: string;
    serviceDetails?: {
      tensionLbs?: number;
      mainString?: string;
      crossString?: string;
      express?: boolean;
    };
  }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi' | 'wallet' | 'member_tab' | 'split'>('card');
  const [splitCash, setSplitCash] = useState<number>(0);
  const [splitDigital, setSplitDigital] = useState<number>(0);
  const [splitDigitalMethod, setSplitDigitalMethod] = useState<'card' | 'upi' | 'wallet'>('upi');
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);

  // Stringing service customization modal in POS
  const [stringingModalOpen, setStringingModalOpen] = useState(false);
  const [selectedStringingProduct, setSelectedStringingProduct] = useState<Product | null>(null);
  const [stringingConfig, setStringingConfig] = useState({
    tensionLbs: 26,
    mainString: 'Yonex BG65 Ti (White)',
    crossString: 'Yonex BG65 Ti (White)',
    express: false,
    racketModel: 'Member Racquet',
  });

  // Selected member for POS
  const selectedMember = useMemo(() => {
    return members.find((m) => m.id === selectedMemberId);
  }, [members, selectedMemberId]);

  const memberTier: MembershipTier = useMemo(() => {
    if (!selectedMember) return 'walk_in';
    const today = new Date();
    const expDate = new Date(selectedMember.expiryDate);
    if (expDate < today) {
      return 'walk_in'; // Expired member gets no discounts
    }
    return selectedMember.tier;
  }, [selectedMember]);

  const tierDiscountPercent = getMemberShopDiscountPercent(memberTier);

  // Quick Add Tiles in POS (Strings, Grips, Balls)
  const quickAddItems = useMemo(() => {
    return products.filter((p) => 
      p.category === 'strings' || 
      p.category === 'grips' || 
      p.category === 'balls' || 
      p.isServiceItem
    ).slice(0, 6);
  }, [products]);

  // POS Product Filtering
  const posFilteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = !posSearch || 
        p.name.toLowerCase().includes(posSearch.toLowerCase()) || 
        p.sku.toLowerCase().includes(posSearch.toLowerCase()) ||
        p.brand.toLowerCase().includes(posSearch.toLowerCase());
      const matchCat = posCategoryFilter === 'all' || p.category === posCategoryFilter;
      return matchSearch && matchCat;
    });
  }, [products, posSearch, posCategoryFilter]);

  // POS Cart Calculations
  const posCartCalculations = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;

    const items: OrderItem[] = posCart.map((c) => {
      const mrp = c.product.price;
      // Effective discount is member tier discount or custom override
      const discountPct = c.customDiscountPct !== undefined ? c.customDiscountPct : tierDiscountPercent;
      const unitPrice = mrp;
      const discountAmount = Math.round(mrp * (discountPct / 100));
      const lineFinalPrice = (mrp - discountAmount) * c.quantity;

      // Add extra if express service selected
      const expressExtra = c.serviceDetails?.express ? (c.product.serviceOptions?.expressCharge || 250) * c.quantity : 0;
      const finalPriceWithService = lineFinalPrice + expressExtra;

      subtotal += mrp * c.quantity;
      totalDiscount += (discountAmount * c.quantity);

      return {
        productId: c.product.id,
        sku: c.product.sku,
        productName: c.product.name,
        unitPrice,
        quantity: c.quantity,
        discountPercent: discountPct,
        finalPrice: finalPriceWithService,
        variantInfo: c.variantInfo,
        serviceDetails: c.serviceDetails,
      };
    });

    const netSubtotal = subtotal - totalDiscount;
    const gstAmount = Math.round(netSubtotal * 0.18);
    const totalAmount = netSubtotal + gstAmount;

    return {
      items,
      subtotal,
      totalDiscount,
      netSubtotal,
      gstAmount,
      totalAmount,
    };
  }, [posCart, tierDiscountPercent]);

  // POS Actions
  const addToPosCart = (product: Product, variantInfo?: string) => {
    if (product.isServiceItem) {
      setSelectedStringingProduct(product);
      setStringingModalOpen(true);
      return;
    }

    const available = getAvailableStock(product);
    const existing = posCart.find((item) => item.product.id === product.id && item.variantInfo === variantInfo);
    const currentQtyInCart = existing ? existing.quantity : 0;

    if (available <= currentQtyInCart) {
      addToast({
        type: 'error',
        title: 'Insufficient Stock',
        message: `Only ${available} unit(s) available for ${product.name}.`,
      });
      return;
    }

    setPosCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id && item.variantInfo === variantInfo);
      if (idx >= 0) {
        return prev.map((item, i) => i === idx ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1, variantInfo }];
    });
  };

  const handleConfirmStringingService = () => {
    if (!selectedStringingProduct) return;
    setPosCart((prev) => [
      ...prev,
      {
        product: selectedStringingProduct,
        quantity: 1,
        variantInfo: `${stringingConfig.tensionLbs} lbs • ${stringingConfig.racketModel}`,
        serviceDetails: {
          tensionLbs: stringingConfig.tensionLbs,
          mainString: stringingConfig.mainString,
          crossString: stringingConfig.crossString,
          express: stringingConfig.express,
        },
      },
    ]);
    setStringingModalOpen(false);
    setSelectedStringingProduct(null);
    addToast({
      type: 'success',
      title: 'Re-stringing Service Added',
      message: `Configured for ${stringingConfig.tensionLbs} lbs tension ${stringingConfig.express ? '(Express Turnaround)' : ''}.`,
    });
  };

  const updatePosCartQty = (index: number, delta: number) => {
    setPosCart((prev) => {
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
          message: `Only ${available} units in stock.`,
        });
        return prev;
      }
      return prev.map((it, i) => i === index ? { ...it, quantity: newQty } : it);
    });
  };

  const handleCompletePosSale = () => {
    if (posCart.length === 0) return;

    if (paymentMethod === 'split') {
      const splitTotal = splitCash + splitDigital;
      if (Math.abs(splitTotal - posCartCalculations.totalAmount) > 2) {
        addToast({
          type: 'error',
          title: 'Split Payment Mismatch',
          message: `Cash (₹${splitCash}) + ${splitDigitalMethod.toUpperCase()} (₹${splitDigital}) must equal total ₹${posCartCalculations.totalAmount}.`,
        });
        return;
      }
    }

    if (paymentMethod === 'member_tab' && !selectedMember) {
      addToast({
        type: 'error',
        title: 'Member Required',
        message: 'Please select an active member to charge to account/tab.',
      });
      return;
    }

    const order = recordSale({
      type: 'pos_counter',
      memberId: selectedMember?.id,
      customerName: selectedMember ? selectedMember.fullName : 'Walk-in Customer',
      customerPhone: selectedMember?.phone,
      customerEmail: selectedMember?.email,
      tier: memberTier,
      items: posCartCalculations.items,
      subtotal: posCartCalculations.subtotal,
      discountTotal: posCartCalculations.totalDiscount,
      gstAmount: posCartCalculations.gstAmount,
      totalAmount: posCartCalculations.totalAmount,
      paymentMethod,
      splitPayments: paymentMethod === 'split' ? [
        { method: 'cash', amount: splitCash },
        { method: splitDigitalMethod, amount: splitDigital },
      ] : undefined,
      isPaid: paymentMethod !== 'member_tab',
      status: 'completed',
    });

    if (order) {
      setLastCompletedOrder(order);
      setIsReceiptModalOpen(true);
      setPosCart([]);
      setSelectedMemberId('');
      setSplitCash(0);
      setSplitDigital(0);
    }
  };

  // ----------------------------------------------------
  // PRODUCTS MANAGEMENT STATE
  // ----------------------------------------------------
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState<string>('all');
  const [productSportFilter, setProductSportFilter] = useState<string>('all');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    sku: '',
    name: '',
    brand: '',
    category: 'rackets',
    sport: 'tennis',
    price: 1999,
    costPrice: 1200,
    gstPercent: 18,
    stockQty: 10,
    reorderLevel: 3,
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=600&q=80',
    description: '',
    supplierId: 'sup_1',
    supplierName: 'Wilson Sports India Pvt Ltd',
  });

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      sku: `PROD-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      brand: 'Wilson',
      category: 'rackets',
      sport: 'tennis',
      price: 2499,
      costPrice: 1500,
      gstPercent: 18,
      stockQty: 12,
      reorderLevel: 4,
      image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=600&q=80',
      description: 'Tour-level precision equipment with advanced carbon dampening.',
      supplierId: suppliers[0]?.id || 'sup_1',
      supplierName: suppliers[0]?.name || 'Wilson Sports India Pvt Ltd',
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({ ...p });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.sku || !productForm.price) {
      addToast({ type: 'error', title: 'Missing fields', message: 'Name, SKU, and Price are required.' });
      return;
    }

    const supplier = suppliers.find((s) => s.id === productForm.supplierId);

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        ...productForm,
        supplierName: supplier?.name || productForm.supplierName,
      });
    } else {
      addProduct({
        sku: productForm.sku!,
        name: productForm.name!,
        brand: productForm.brand || 'Champions Pro',
        category: (productForm.category || 'rackets') as ProductCategory,
        sport: productForm.sport || 'box_cricket',
        featured: !!productForm.featured,
        skillLevel: productForm.skillLevel,
        material: productForm.material,
        price: Number(productForm.price),
        costPrice: Number(productForm.costPrice) || 0,
        gstPercent: Number(productForm.gstPercent) || 18,
        stockQty: Number(productForm.stockQty) || 0,
        reorderLevel: Number(productForm.reorderLevel) || 3,
        image: productForm.image || 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=600&q=80',
        description: productForm.description || '',
        supplierId: productForm.supplierId,
        supplierName: supplier?.name || 'Wilson Sports India Pvt Ltd',
      });
    }
    setIsProductModalOpen(false);
  };

  // ----------------------------------------------------
  // INVENTORY & VALUATION STATE
  // ----------------------------------------------------
  const [stockAdjustmentModalOpen, setStockAdjustmentModalOpen] = useState(false);
  const [adjustTargetProduct, setAdjustTargetProduct] = useState<Product | null>(null);
  const [adjustNewQty, setAdjustNewQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('Stock count discrepancy / Physical audit');

  const stockValuation = useMemo(() => {
    return calculateStockValuation(products);
  }, [products]);

  const productVelocity = useMemo(() => {
    return calculateProductVelocity(products, orders);
  }, [products, orders]);

  const handleOpenAdjustStock = (p: Product) => {
    setAdjustTargetProduct(p);
    setAdjustNewQty(p.stockQty);
    setAdjustReason('Physical stock count audit');
    setStockAdjustmentModalOpen(true);
  };

  const handleConfirmAdjustStock = () => {
    if (!adjustTargetProduct) return;
    adjustProductStock(adjustTargetProduct.id, adjustNewQty, adjustReason);
    setStockAdjustmentModalOpen(false);
  };

  // ----------------------------------------------------
  // PURCHASE ORDERS & SUPPLIERS STATE
  // ----------------------------------------------------
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [selectedPoSupplierId, setSelectedPoSupplierId] = useState<string>(suppliers[0]?.id || 'sup_1');
  const [poItems, setPoItems] = useState<{ productId: string; orderedQty: number; unitCost: number }[]>([]);
  const [receivePoModalOpen, setReceivePoModalOpen] = useState(false);
  const [activeReceivingPo, setActiveReceivingPo] = useState<PurchaseOrder | null>(null);
  const [receiptQuantities, setReceiptQuantities] = useState<{ [productId: string]: number }>({});

  const handleOpenCreatePo = () => {
    setSelectedPoSupplierId(suppliers[0]?.id || 'sup_1');
    const defaultProd = products[0];
    setPoItems(defaultProd ? [{ productId: defaultProd.id, orderedQty: 10, unitCost: defaultProd.costPrice }] : []);
    setIsPoModalOpen(true);
  };

  const handleAddPoItemRow = () => {
    const candidate = products.find((p) => !poItems.some((item) => item.productId === p.id)) || products[0];
    if (candidate) {
      setPoItems([...poItems, { productId: candidate.id, orderedQty: 10, unitCost: candidate.costPrice }]);
    }
  };

  const handleSavePo = () => {
    if (poItems.length === 0) return;
    const supplier = suppliers.find((s) => s.id === selectedPoSupplierId) || suppliers[0];

    let subtotal = 0;
    const formattedItems = poItems.map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const totalCost = item.orderedQty * item.unitCost;
      subtotal += totalCost;
      return {
        productId: item.productId,
        sku: prod?.sku || 'SKU',
        productName: prod?.name || 'Product',
        orderedQty: item.orderedQty,
        receivedQty: 0,
        unitCost: item.unitCost,
        totalCost,
      };
    });

    const gstAmount = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + gstAmount;

    createPurchaseOrder({
      supplierId: supplier.id,
      supplierName: supplier.name,
      items: formattedItems,
      subtotal,
      gstAmount,
      totalAmount,
      status: 'ordered',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    });

    setIsPoModalOpen(false);
  };

  const handleOpenReceivePo = (po: PurchaseOrder) => {
    setActiveReceivingPo(po);
    const initialCounts: { [productId: string]: number } = {};
    po.items.forEach((item) => {
      const pending = Math.max(0, item.orderedQty - item.receivedQty);
      initialCounts[item.productId] = pending;
    });
    setReceiptQuantities(initialCounts);
    setReceivePoModalOpen(true);
  };

  const handleConfirmReceivePo = () => {
    if (!activeReceivingPo) return;
    const receipts = Object.entries(receiptQuantities).map(([productId, receivedQty]) => ({
      productId,
      receivedQty: Number(receivedQty) || 0,
    }));

    receivePurchaseOrder(activeReceivingPo.id, receipts);
    setReceivePoModalOpen(false);
    setActiveReceivingPo(null);
  };

  // ----------------------------------------------------
  // ONLINE ORDERS KANBAN STATE
  // ----------------------------------------------------
  const kanbanColumns: { id: OrderStatus; title: string; color: string }[] = [
    { id: 'placed', title: 'Placed (New)', color: 'border-blue-500/40 text-blue-400' },
    { id: 'confirmed', title: 'Confirmed', color: 'border-amber-500/40 text-amber-400' },
    { id: 'packed', title: 'Packed', color: 'border-purple-500/40 text-purple-400' },
    { id: 'ready_for_pickup', title: 'Ready / Out for Delivery', color: 'border-cyan-500/40 text-cyan-400' },
    { id: 'completed', title: 'Completed', color: 'border-emerald-500/40 text-emerald-400' },
    { id: 'cancelled', title: 'Cancelled / Returned', color: 'border-rose-500/40 text-rose-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-lime-400">
              Staff Operations • Gear Shop & Inventory
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              Single Inventory Ledger
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white mt-1">
            Pro Shop Counter POS & Stock Suite
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Single-source inventory with real-time sync across POS counter, Click & Collect pickup, and Home Delivery orders.
          </p>
        </div>

        {/* Global Valuation Pill */}
        <div className="flex items-center gap-2 p-2 px-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Retail Valuation</span>
            <span className="font-heading font-extrabold text-white text-sm">
              {formatINR(stockValuation.totalRetailValue)}
            </span>
          </div>
          <div className="h-6 w-px bg-slate-800 mx-2" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Profit Margin</span>
            <span className="font-heading font-extrabold text-lime-400 text-sm">
              {stockValuation.profitMarginPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'pos', label: 'Counter POS Terminal', icon: Barcode, badge: posCart.length > 0 ? posCart.length : null },
          { id: 'products', label: 'Products & Variants', icon: Package, badge: products.length },
          { id: 'inventory', label: 'Inventory Control & Health', icon: Layers, badge: stockValuation.lowStockCount > 0 ? `${stockValuation.lowStockCount} low` : null },
          { id: 'orders', label: 'Orders Kanban', icon: Truck, badge: orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled').length },
          { id: 'suppliers', label: 'Suppliers & Purchase Orders', icon: FileText, badge: purchaseOrders.filter((p) => p.status !== 'received').length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                isActive
                  ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                  isActive ? 'bg-slate-950 text-lime-400' : 'bg-lime-400/20 text-lime-400 border border-lime-400/30'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: COUNTER POS TERMINAL */}
      {/* ========================================================================= */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Product Browser & Quick Tiles (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Quick-Add Tiles for Instant Needs (e.g. "String snapped 10 mins before match") */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-lime-400/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-lime-400 animate-pulse" />
                  <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-lime-400">
                    Quick-Add Tiles (Strings • Grips • Balls • Re-stringing Service)
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400">1-Touch Add</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {quickAddItems.map((item) => {
                  const avail = getAvailableStock(item);
                  const isService = item.isServiceItem;
                  return (
                    <button
                      key={item.id}
                      onClick={() => addToPosCart(item)}
                      disabled={!isService && avail <= 0}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition group relative overflow-hidden ${
                        isService 
                          ? 'bg-purple-950/40 border-purple-500/40 hover:border-purple-400' 
                          : avail > 0 
                            ? 'bg-slate-900/90 border-slate-800 hover:border-lime-400/60 hover:bg-slate-800/80' 
                            : 'bg-slate-950 border-slate-900 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{item.brand}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                            isService ? 'bg-purple-500/20 text-purple-300' : avail <= 3 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {isService ? 'Service' : `${avail} left`}
                          </span>
                        </div>
                        <h4 className="font-heading font-bold text-xs text-white line-clamp-1 mt-1 group-hover:text-lime-300">
                          {item.name}
                        </h4>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-heading font-extrabold text-xs text-lime-400">
                          {formatINR(item.price)}
                        </span>
                        <span className="p-1 rounded-lg bg-lime-400 text-slate-950 group-hover:scale-110 transition-transform">
                          <Plus className="w-3 h-3 stroke-[3]" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Catalog Search & Category Filter */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3 flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Scan barcode or search gear by SKU, name, brand..."
                  value={posSearch}
                  onChange={(e) => setPosSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
                />
              </div>

              <select
                value={posCategoryFilter}
                onChange={(e) => setPosCategoryFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="rackets">Rackets & Bats</option>
                <option value="strings">Strings</option>
                <option value="grips">Grips & Overgrips</option>
                <option value="balls">Balls & Shuttles</option>
                <option value="shoes">Footwear</option>
                <option value="apparel">Apparel</option>
                <option value="bags">Bags & Thermoguards</option>
                <option value="accessories">Accessories</option>
                <option value="services">Workshop Services</option>
              </select>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[540px] overflow-y-auto pr-1">
              {posFilteredProducts.map((p) => {
                const avail = getAvailableStock(p);
                const isService = p.isServiceItem;
                const isOutOfStock = !isService && avail <= 0;

                return (
                  <div
                    key={p.id}
                    onClick={() => !isOutOfStock && addToPosCart(p)}
                    className={`rounded-2xl bg-slate-900 border p-3 flex flex-col justify-between cursor-pointer transition select-none ${
                      isOutOfStock 
                        ? 'border-slate-800/40 opacity-50 cursor-not-allowed' 
                        : 'border-slate-800 hover:border-lime-400/60 hover:bg-slate-800/60 shadow-lg'
                    }`}
                  >
                    <div>
                      <div className="relative h-24 w-full rounded-xl overflow-hidden bg-slate-950 mb-2">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-950/80 text-white backdrop-blur-sm">
                          {p.brand}
                        </span>
                        <span className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          isService ? 'bg-purple-500/80 text-white' : isOutOfStock ? 'bg-rose-500 text-white' : 'bg-slate-900/90 text-slate-300'
                        }`}>
                          {isService ? 'Service' : isOutOfStock ? 'Out of Stock' : `${avail} left`}
                        </span>
                      </div>

                      <h4 className="font-heading font-bold text-xs text-white line-clamp-1">{p.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono block">{p.sku}</span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="font-heading font-extrabold text-xs text-white">{formatINR(p.price)}</span>
                        {selectedMember && tierDiscountPercent > 0 && (
                          <span className="text-[10px] text-lime-400 block font-bold">
                            {formatINR(Math.round(p.price * (1 - tierDiscountPercent / 100)))} ({tierDiscountPercent}% off)
                          </span>
                        )}
                      </div>
                      <button
                        disabled={isOutOfStock}
                        className="p-1.5 rounded-lg bg-lime-400 hover:bg-lime-300 text-slate-950 disabled:bg-slate-800 disabled:text-slate-600 font-bold"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: POS Order Cart & Checkout (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between space-y-4 shadow-2xl">
            <div className="space-y-4">
              {/* Member Lookup Header */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <User className="w-3.5 h-3.5 text-lime-400" />
                    <span className="font-bold text-white uppercase text-[11px]">Member Lookup (Auto Tier Discount)</span>
                  </div>
                  {selectedMember && (
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-extrabold ${getTierBadgeClass(selectedMember.tier)}`}>
                      {selectedMember.tier} ({tierDiscountPercent}% Off)
                    </span>
                  )}
                </div>

                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-400"
                >
                  <option value="">Walk-in Customer (Standard Retail MRP)</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.memberNumber}) • {m.tier.toUpperCase()} • Wallet: ₹{m.walletBalance}
                    </option>
                  ))}
                </select>

                {selectedMember && (
                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                    <span>Available Wallet: <strong className="text-lime-400">₹{selectedMember.walletBalance}</strong></span>
                    <span>Active Bar/Shop Tab: <strong className="text-amber-400">₹{selectedMember.activeTabBalance || 0}</strong></span>
                  </div>
                )}
              </div>

              {/* Cart Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider pb-1 border-b border-slate-800">
                  <span>Cart Items ({posCart.reduce((acc, c) => acc + c.quantity, 0)})</span>
                  <button
                    onClick={() => setPosCart([])}
                    className="text-[10px] text-rose-400 hover:underline uppercase"
                  >
                    Clear Cart
                  </button>
                </div>

                {posCart.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 space-y-2">
                    <ShoppingBag className="w-10 h-10 mx-auto text-slate-700" />
                    <p className="text-xs">Cart is empty. Tap items or quick-tiles to build order.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 divide-y divide-slate-800/60">
                    {posCart.map((item, idx) => {
                      const mrp = item.product.price;
                      const discPct = item.customDiscountPct !== undefined ? item.customDiscountPct : tierDiscountPercent;
                      const discountedUnit = Math.round(mrp * (1 - discPct / 100));

                      return (
                        <div key={idx} className="pt-2 flex items-center justify-between text-xs gap-2">
                          <div className="flex-1">
                            <div className="font-bold text-white line-clamp-1">{item.product.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {item.variantInfo ? `[${item.variantInfo}] ` : ''}
                              {discPct > 0 ? (
                                <>
                                  <span className="line-through text-slate-500 mr-1">{formatINR(mrp)}</span>
                                  <span className="text-lime-400 font-bold">{formatINR(discountedUnit)}</span>
                                  <span className="text-amber-400 ml-1">(-{discPct}%)</span>
                                </>
                              ) : (
                                <span>{formatINR(mrp)}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => updatePosCartQty(idx, -1)}
                              className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs"
                            >
                              -
                            </button>
                            <span className="font-mono font-bold text-white w-5 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updatePosCartQty(idx, 1)}
                              className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right w-16">
                            <span className="font-heading font-extrabold text-white">
                              {formatINR(discountedUnit * item.quantity + (item.serviceDetails?.express ? 250 : 0))}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Bill Summary & Payment Methods */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Cart Subtotal (MRP)</span>
                  <span className="text-white font-mono">{formatINR(posCartCalculations.subtotal)}</span>
                </div>
                {posCartCalculations.totalDiscount > 0 && (
                  <div className="flex justify-between text-lime-400">
                    <span>Member Tier Discount ({tierDiscountPercent}%)</span>
                    <span className="font-mono font-bold">-{formatINR(posCartCalculations.totalDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST (18% inclusive/calculated)</span>
                  <span className="text-white font-mono">{formatINR(posCartCalculations.gstAmount)}</span>
                </div>
                <div className="flex justify-between text-sm font-heading font-extrabold text-white pt-1 border-t border-slate-800">
                  <span>Total Payable</span>
                  <span className="text-lime-400 font-extrabold text-base">
                    {formatINR(posCartCalculations.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Payment Mode Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Settlement Method</label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {[
                    { id: 'card', label: 'Card (EDC)', icon: CreditCard },
                    { id: 'upi', label: 'UPI / QR', icon: Barcode },
                    { id: 'cash', label: 'Cash', icon: DollarSign },
                    { id: 'wallet', label: 'Member Wallet', icon: Wallet, disabled: !selectedMember },
                    { id: 'member_tab', label: 'Charge to Tab', icon: FileText, disabled: !selectedMember },
                    { id: 'split', label: 'Split Pay', icon: Split },
                  ].map((pm) => {
                    const Icon = pm.icon;
                    const isSelected = paymentMethod === pm.id;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        disabled={pm.disabled}
                        onClick={() => setPaymentMethod(pm.id as any)}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                          isSelected
                            ? 'bg-lime-400 text-slate-950 border-lime-400 font-bold'
                            : pm.disabled
                              ? 'bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed'
                              : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="text-[10px]">{pm.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Split payment inputs */}
                {paymentMethod === 'split' && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Cash Portion:</span>
                      <input
                        type="number"
                        value={splitCash}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setSplitCash(val);
                          setSplitDigital(Math.max(0, posCartCalculations.totalAmount - val));
                        }}
                        className="w-24 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-right text-white font-mono"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Digital Portion ({splitDigitalMethod.toUpperCase()}):</span>
                      <div className="flex items-center gap-2">
                        <select
                          value={splitDigitalMethod}
                          onChange={(e) => setSplitDigitalMethod(e.target.value as any)}
                          className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white text-[10px]"
                        >
                          <option value="upi">UPI</option>
                          <option value="card">Card</option>
                          <option value="wallet" disabled={!selectedMember}>Wallet</option>
                        </select>
                        <span className="font-mono text-lime-400 font-bold">₹{splitDigital}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Complete POS Button */}
              <button
                onClick={handleCompletePosSale}
                disabled={posCart.length === 0}
                className="w-full py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-heading font-extrabold text-sm shadow-xl shadow-lime-400/20 disabled:bg-slate-800 disabled:text-slate-600 disabled:shadow-none transition flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Complete Sale ({formatINR(posCartCalculations.totalAmount)})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PRODUCTS MANAGEMENT (ADD / EDIT / VARIANTS) */}
      {/* ========================================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by SKU, name, or brand..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
                />
              </div>

              <select
                value={productSportFilter}
                onChange={(e) => setProductSportFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">All Sports</option>
                <option value="box_cricket">Box Cricket</option>
                <option value="badminton">Badminton</option>
                <option value="table_tennis">Table Tennis</option>
                <option value="volleyball">Volleyball</option>
                <option value="kho_kho">Kho Kho</option>
                <option value="hockey">Hockey</option>
                <option value="football">Football</option>
                <option value="kabaddi">Kabaddi</option>
              </select>

              <select
                value={productCatFilter}
                onChange={(e) => setProductCatFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="bats">Bats</option>
                <option value="rackets">Rackets</option>
                <option value="balls">Balls &amp; Shuttles</option>
                <option value="equipment">Equipment &amp; Nets</option>
                <option value="protective">Protective Gear</option>
                <option value="shoes">Shoes &amp; Boots</option>
                <option value="apparel">Apparel</option>
                <option value="bags">Bags</option>
                <option value="accessories">Accessories</option>
                <option value="strings">Strings</option>
                <option value="grips">Grips</option>
                <option value="services">Services</option>
              </select>
            </div>

            <button
              onClick={handleOpenAddProduct}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow-md shadow-lime-400/20 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Product Table */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase">
                    <th className="py-3.5 px-4">Item & SKU</th>
                    <th className="py-3.5 px-4">Category / Sport</th>
                    <th className="py-3.5 px-4">Supplier</th>
                    <th className="py-3.5 px-4">MRP (Selling)</th>
                    <th className="py-3.5 px-4">Cost Price</th>
                    <th className="py-3.5 px-4">Physical / Reserved</th>
                    <th className="py-3.5 px-4">Available</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {products
                    .filter((p) => {
                      const matchS = !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase());
                      const matchCat = productCatFilter === 'all' || p.category === productCatFilter;
                      const matchSport = productSportFilter === 'all' || p.sport === productSportFilter;
                      return matchS && matchCat && matchSport;
                    })
                    .map((p) => {
                      const avail = getAvailableStock(p);
                      const isLow = avail <= p.reorderLevel;
                      const isOut = avail === 0;

                      return (
                        <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.image}
                                alt={p.name}
                                onError={(e) => { (e.target as HTMLImageElement).src = '/images/proshop/placeholder.svg'; }}
                                className="w-10 h-10 rounded-xl object-contain p-1 bg-slate-950 shrink-0"
                              />
                              <div>
                                <div className="font-semibold text-white">{p.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{p.sku} • {p.brand}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-white capitalize">{p.category}</div>
                            <div className="text-[10px] text-lime-400 capitalize">{p.sport}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-400">
                            {p.supplierName || 'Official Distributor'}
                          </td>
                          <td className="py-3 px-4 font-semibold text-white">
                            {formatINR(p.price)}
                          </td>
                          <td className="py-3 px-4 text-slate-400">
                            {formatINR(p.costPrice)}
                          </td>
                          <td className="py-3 px-4 text-slate-300 font-mono">
                            {p.stockQty} / <span className="text-amber-400">{p.reservedQty || 0} res</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              isOut 
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                                : isLow 
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {p.isServiceItem ? 'Service (Unlimited)' : `${avail} Available`}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5">
                            <button
                              onClick={() => handleOpenAdjustStock(p)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                              title="Audit stock count"
                            >
                              Adjust
                            </button>
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                              title="Edit item"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteProduct(p.id)}
                              className="p-1.5 rounded bg-rose-500/20 hover:bg-rose-500/40 text-rose-300"
                              title="Delete item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: INVENTORY CONTROL & HEALTH (VALUATION, VELOCITY, LEDGER) */}
      {/* ========================================================================= */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Low Stock Alert Banner */}
          {stockValuation.lowStockCount > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <h4 className="font-heading font-bold text-xs text-amber-300">
                    Low Stock Threshold Alert ({stockValuation.lowStockCount} items at or below reorder level)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {stockValuation.outOfStockCount} items are completely out of stock. Trigger Purchase Orders to avoid lost counter sales.
                  </p>
                </div>
              </div>
              <button
                onClick={handleOpenCreatePo}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md"
              >
                Create Restock PO
              </button>
            </div>
          )}

          {/* Valuation KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Inventory Cost</span>
              <div className="font-heading font-extrabold text-xl text-white mt-1">
                {formatINR(stockValuation.totalCostValue)}
              </div>
              <span className="text-[11px] text-slate-500">{stockValuation.totalUnitsInStock} total units on hand</span>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Retail Value</span>
              <div className="font-heading font-extrabold text-xl text-lime-400 mt-1">
                {formatINR(stockValuation.totalRetailValue)}
              </div>
              <span className="text-[11px] text-slate-500">Gross realized retail worth</span>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
              <span className="text-[10px] uppercase font-bold text-slate-400">Potential Gross Profit</span>
              <div className="font-heading font-extrabold text-xl text-emerald-400 mt-1">
                {formatINR(stockValuation.potentialProfit)}
              </div>
              <span className="text-[11px] text-emerald-400 font-bold">~{stockValuation.profitMarginPercent}% Margin</span>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
              <span className="text-[10px] uppercase font-bold text-slate-400">Stock Health Status</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-heading font-extrabold text-xl text-amber-400">
                  {stockValuation.lowStockCount}
                </span>
                <span className="text-xs text-slate-400">Low / {stockValuation.outOfStockCount} Out</span>
              </div>
              <span className="text-[11px] text-slate-500">Across {stockValuation.totalProductsCount} SKUs</span>
            </div>
          </div>

          {/* Velocity Report: Fast & Slow Movers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-heading font-bold text-sm text-white">Fast Movers Velocity Report</h3>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold">High Turnover</span>
              </div>

              <div className="divide-y divide-slate-800">
                {productVelocity.fastMovers.slice(0, 5).map((fm) => (
                  <div key={fm.productId} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">{fm.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{fm.sku} • {fm.brand}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-400 block">{fm.unitsSold} units sold</span>
                      <span className="text-[10px] text-slate-500 font-mono">~{fm.daysOfInventoryRemaining} days stock left</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <h3 className="font-heading font-bold text-sm text-white">Slow Movers (Capital Tied Up)</h3>
                </div>
                <span className="text-[10px] text-amber-400 font-bold">Low Turnover</span>
              </div>

              <div className="divide-y divide-slate-800">
                {productVelocity.slowMovers.slice(0, 5).map((sm) => (
                  <div key={sm.productId} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">{sm.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{sm.sku} • Stock: {sm.stockQty}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-400 block">{sm.unitsSold} units sold</span>
                      <span className="text-[10px] text-amber-400 font-mono">Discount candidate</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stock Movements Audit Ledger */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-base text-white">Inventory Stock Movement Ledger</h3>
                <p className="text-xs text-slate-400">Complete audit trail of sales deductions, supplier receipts, and manual adjustments.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-semibold uppercase">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Change</th>
                    <th className="py-3 px-4">Performed By / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {stockMovements.slice(0, 15).map((sm) => (
                    <tr key={sm.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">
                        {formatDateTime(sm.timestamp)}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-white">
                        {sm.productName}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          sm.type === 'sale' 
                            ? 'bg-blue-500/20 text-blue-300' 
                            : sm.type === 'po_receipt' || sm.type === 'restock' 
                              ? 'bg-emerald-500/20 text-emerald-300' 
                              : sm.type === 'return' 
                                ? 'bg-purple-500/20 text-purple-300' 
                                : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {sm.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold">
                        <span className={sm.change > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {sm.change > 0 ? `+${sm.change}` : sm.change}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-400 text-[11px]">
                        {sm.notes} <span className="text-slate-500">({sm.performedBy})</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ORDERS KANBAN (ONLINE & COUNTER LIFECYCLE) */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Drag / Advance orders through fulfillment pipeline with automatic stock synchronization.</span>
            <span className="font-mono text-lime-400 font-bold">{orders.length} Total Orders</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {kanbanColumns.map((col) => {
              const columnOrders = orders.filter((o) => {
                if (col.id === 'ready_for_pickup') {
                  return o.status === 'ready_for_pickup' || o.status === 'out_for_delivery';
                }
                if (col.id === 'cancelled') {
                  return o.status === 'cancelled' || o.status === 'returned';
                }
                return o.status === col.id;
              });

              return (
                <div key={col.id} className="rounded-2xl bg-slate-900/90 border border-slate-800 p-3 space-y-3 flex flex-col justify-between min-h-[500px]">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className={`font-heading font-bold text-xs uppercase tracking-wider ${col.color}`}>
                        {col.title}
                      </span>
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center justify-center">
                        {columnOrders.length}
                      </span>
                    </div>

                    <div className="space-y-2 mt-2 max-h-[580px] overflow-y-auto pr-1">
                      {columnOrders.map((order) => {
                        return (
                          <div
                            key={order.id}
                            className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 space-y-2 text-xs shadow-md"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-white text-[11px]">{order.orderNumber}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                order.type === 'pos_counter' 
                                  ? 'bg-blue-500/20 text-blue-300' 
                                  : order.type === 'online_pickup' 
                                    ? 'bg-cyan-500/20 text-cyan-300' 
                                    : 'bg-purple-500/20 text-purple-300'
                              }`}>
                                {order.type?.replace('online_', '').replace('_', ' ')}
                              </span>
                            </div>

                            <div>
                              <div className="font-semibold text-white">{order.customerName}</div>
                              <div className="text-[10px] text-slate-400">{order.items.length} items • {formatINR(order.totalAmount)}</div>
                            </div>

                            {order.deliveryAddress && (
                              <div className="text-[10px] text-slate-400 bg-slate-900/60 p-1.5 rounded">
                                📍 {order.deliveryAddress.street}, {order.deliveryAddress.city}
                              </div>
                            )}

                            {/* Kanban Action Buttons */}
                            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1">
                              {order.status === 'placed' && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'confirmed', 'Order confirmed by pro shop')}
                                  className="w-full py-1 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[10px]"
                                >
                                  Confirm Order
                                </button>
                              )}
                              {order.status === 'confirmed' && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'packed', 'Packed in pro shop box')}
                                  className="w-full py-1 rounded bg-purple-400 hover:bg-purple-300 text-slate-950 font-bold text-[10px]"
                                >
                                  Mark Packed
                                </button>
                              )}
                              {order.status === 'packed' && (
                                <button
                                  onClick={() => updateOrderStatus(
                                    order.id, 
                                    order.type === 'online_delivery' ? 'out_for_delivery' : 'ready_for_pickup',
                                    'Ready for pickup/delivery'
                                  )}
                                  className="w-full py-1 rounded bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-[10px]"
                                >
                                  {order.type === 'online_delivery' ? 'Dispatch' : 'Ready Pickup'}
                                </button>
                              )}
                              {(order.status === 'ready_for_pickup' || order.status === 'out_for_delivery') && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'completed', 'Customer received items')}
                                  className="w-full py-1 rounded bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-[10px]"
                                >
                                  Complete & Settle
                                </button>
                              )}
                              {order.status !== 'completed' && order.status !== 'cancelled' && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'cancelled', 'Cancelled by staff')}
                                  className="px-2 py-1 rounded bg-rose-500/20 text-rose-300 text-[10px] hover:bg-rose-500/40"
                                  title="Cancel & Release Reserved Stock"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SUPPLIERS & PURCHASE ORDERS */}
      {/* ========================================================================= */}
      {activeTab === 'suppliers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-white">Suppliers & Purchase Order Restocking</h3>
              <p className="text-xs text-slate-400">Order from authorized gear distributors with full partial-receipt support.</p>
            </div>
            <button
              onClick={handleOpenCreatePo}
              className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow-md shadow-lime-400/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Raise Purchase Order</span>
            </button>
          </div>

          {/* Active POs List */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4">
            <h4 className="font-heading font-bold text-sm text-white">Purchase Orders Ledger</h4>
            <div className="rounded-2xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-semibold uppercase">
                    <th className="py-3 px-4">PO Number</th>
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-4">Items / Ordered</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {purchaseOrders.map((po) => {
                    const totalOrdered = po.items.reduce((acc, i) => acc + i.orderedQty, 0);
                    const totalReceived = po.items.reduce((acc, i) => acc + i.receivedQty, 0);

                    return (
                      <tr key={po.id} className="hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-mono font-bold text-white">{po.poNumber}</td>
                        <td className="py-3 px-4 font-semibold text-slate-200">{po.supplierName}</td>
                        <td className="py-3 px-4 text-slate-400">
                          {totalReceived} of {totalOrdered} units received ({po.items.length} SKUs)
                        </td>
                        <td className="py-3 px-4 font-bold text-white">{formatINR(po.totalAmount)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            po.status === 'received' 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                              : po.status === 'partially_received' 
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            {po.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {po.status !== 'received' && (
                            <button
                              onClick={() => handleOpenReceivePo(po)}
                              className="px-3 py-1 rounded bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs"
                            >
                              Receive Delivery
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Supplier Directory Cards */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-white">Authorized Suppliers & Brands</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suppliers.map((sup) => (
                <div key={sup.id} className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-lime-400 font-bold">{sup.code}</span>
                    <span className="text-[10px] text-slate-400">Lead: {sup.leadTimeDays} days</span>
                  </div>
                  <h4 className="font-heading font-bold text-sm text-white">{sup.name}</h4>
                  <div className="text-xs text-slate-400 space-y-0.5">
                    <div>👤 {sup.contactPerson} ({sup.phone})</div>
                    <div>✉️ {sup.email}</div>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">{sup.paymentTerms}</span>
                    <span className="text-lime-400 font-bold">⭐ {sup.rating || 4.8}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RESTOCK / ADJUSTMENT */}
      {/* ========================================================================= */}
      {stockAdjustmentModalOpen && adjustTargetProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-white">Adjust Physical Stock Count</h3>
              <button onClick={() => setStockAdjustmentModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <img src={adjustTargetProduct.image} alt={adjustTargetProduct.name} className="w-12 h-12 rounded-xl object-cover" />
              <div>
                <div className="font-bold text-white text-xs">{adjustTargetProduct.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">Current Stock: {adjustTargetProduct.stockQty} units</div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">New Verified Physical Count</label>
                <input
                  type="number"
                  value={adjustNewQty}
                  onChange={(e) => setAdjustNewQty(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Reason for Adjustment</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                >
                  <option value="Physical stock count audit">Physical stock count audit</option>
                  <option value="Damaged during display / demo">Damaged during display / demo</option>
                  <option value="Inventory shrinkage discrepancy">Inventory shrinkage discrepancy</option>
                  <option value="Supplier shipment count variance">Supplier shipment count variance</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setStockAdjustmentModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAdjustStock}
                className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold shadow-md"
              >
                Save Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SERVICE CUSTOMIZATION (RE-STRINGING) */}
      {/* ========================================================================= */}
      {stringingModalOpen && selectedStringingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 rounded-3xl border border-purple-500/40 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="font-heading font-bold text-base text-white">Precision Electronic Re-Stringing Service</h3>
              </div>
              <button onClick={() => setStringingModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Racquet Model & Owner</label>
                <input
                  type="text"
                  value={stringingConfig.racketModel}
                  onChange={(e) => setStringingConfig({ ...stringingConfig, racketModel: e.target.value })}
                  placeholder="e.g. Wilson Blade 98 v9 (Vikram Malhotra)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400">Tension Calibration</label>
                  <span className="font-heading font-extrabold text-lime-400 text-sm">{stringingConfig.tensionLbs} lbs</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="65"
                  value={stringingConfig.tensionLbs}
                  onChange={(e) => setStringingConfig({ ...stringingConfig, tensionLbs: Number(e.target.value) })}
                  className="w-full accent-lime-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>24 lbs (Badminton control)</span>
                  <span>28 lbs (Badminton power)</span>
                  <span>52 lbs (Tennis control)</span>
                  <span>58 lbs (Tennis power)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Main String</label>
                  <select
                    value={stringingConfig.mainString}
                    onChange={(e) => setStringingConfig({ ...stringingConfig, mainString: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  >
                    <option value="Yonex BG65 Ti">Yonex BG65 Ti (Durability)</option>
                    <option value="Yonex BG80 Power">Yonex BG80 Power (Repulsion)</option>
                    <option value="Luxilon ALU Power 125">Luxilon ALU Power (Tennis)</option>
                    <option value="Babolat RPM Blast 125">Babolat RPM Blast (Tennis Spin)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Cross String</label>
                  <select
                    value={stringingConfig.crossString}
                    onChange={(e) => setStringingConfig({ ...stringingConfig, crossString: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  >
                    <option value="Yonex BG65 Ti">Yonex BG65 Ti (Durability)</option>
                    <option value="Yonex Aerobite Hybrid">Yonex Aerobite (Cross)</option>
                    <option value="Luxilon ALU Power 125">Luxilon ALU Power</option>
                    <option value="Wilson Sensation Multi">Wilson Sensation Multi</option>
                  </select>
                </div>
              </div>

              <label className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-bold text-purple-300 block">⚡ Express 30-Minute Turnaround (+₹250)</span>
                  <span className="text-[11px] text-slate-400">Racquet prioritized on electronic stringing rig immediately</span>
                </div>
                <input
                  type="checkbox"
                  checked={stringingConfig.express}
                  onChange={(e) => setStringingConfig({ ...stringingConfig, express: e.target.checked })}
                  className="w-4 h-4 accent-purple-400"
                />
              </label>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setStringingModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStringingService}
                className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold shadow-md"
              >
                Add Service to POS Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT PRODUCT */}
      {/* ========================================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-heading font-bold text-lg text-white">
                {editingProduct ? 'Edit Catalog Product' : 'Add New Pro Shop Product'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Brand</label>
                  <input
                    type="text"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Product Title / Name</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  >
                    <option value="bats">Bats</option>
                    <option value="rackets">Rackets</option>
                    <option value="balls">Balls &amp; Shuttles</option>
                    <option value="equipment">Equipment &amp; Nets</option>
                    <option value="protective">Protective Gear</option>
                    <option value="shoes">Shoes &amp; Boots</option>
                    <option value="bags">Bags &amp; Kitbags</option>
                    <option value="apparel">Apparel &amp; Jerseys</option>
                    <option value="accessories">Accessories</option>
                    <option value="strings">Strings</option>
                    <option value="grips">Grips</option>
                    <option value="services">Workshop Services</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Sport</label>
                  <select
                    value={productForm.sport}
                    onChange={(e) => setProductForm({ ...productForm, sport: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  >
                    <option value="box_cricket">Box Cricket</option>
                    <option value="badminton">Badminton</option>
                    <option value="table_tennis">Table Tennis</option>
                    <option value="volleyball">Volleyball</option>
                    <option value="kho_kho">Kho Kho</option>
                    <option value="hockey">Hockey</option>
                    <option value="football">Football</option>
                    <option value="kabaddi">Kabaddi</option>
                    <option value="general">Sportswear &amp; Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Supplier</label>
                  <select
                    value={productForm.supplierId}
                    onChange={(e) => setProductForm({ ...productForm, supplierId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Selling MRP (₹)</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    value={productForm.costPrice}
                    onChange={(e) => setProductForm({ ...productForm, costPrice: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">GST %</label>
                  <input
                    type="number"
                    value={productForm.gstPercent}
                    onChange={(e) => setProductForm({ ...productForm, gstPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Initial Physical Stock</label>
                  <input
                    type="number"
                    value={productForm.stockQty}
                    onChange={(e) => setProductForm({ ...productForm, stockQty: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Reorder Level Alert</label>
                  <input
                    type="number"
                    value={productForm.reorderLevel}
                    onChange={(e) => setProductForm({ ...productForm, reorderLevel: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Unsplash Product Image URL</label>
                <input
                  type="text"
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Skill Level</label>
                  <select
                    value={productForm.skillLevel || 'All Levels'}
                    onChange={(e) => setProductForm({ ...productForm, skillLevel: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  >
                    <option value="All Levels">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Professional">Professional</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Material / Construction</label>
                  <input
                    type="text"
                    value={productForm.material || ''}
                    placeholder="e.g. English Willow, Carbon Fiber"
                    onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  >
                  </input>
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
                    <input
                      type="checkbox"
                      checked={!!productForm.featured}
                      onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                      className="accent-lime-400 rounded w-4 h-4"
                    />
                    <span>Featured Product</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RECEIPT PRINT PREVIEW */}
      {/* ========================================================================= */}
      {isReceiptModalOpen && lastCompletedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl p-6 space-y-4 shadow-2xl font-mono text-xs">
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
              <h2 className="font-heading font-extrabold text-lg text-slate-900">CHAMPIONS CLUB PRO SHOP</h2>
              <p className="text-[10px] text-slate-500">Outer Ring Road, Bengaluru • GSTIN: 29AABCU9603R1ZM</p>
              <p className="text-[10px] text-slate-500 font-bold">TAX INVOICE / POS RECEIPT</p>
            </div>

            <div className="space-y-1 text-[11px] text-slate-600">
              <div className="flex justify-between">
                <span>Receipt No:</span>
                <span className="font-bold text-slate-900">{lastCompletedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Date & Time:</span>
                <span>{formatDateTime(lastCompletedOrder.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-bold text-slate-900">{lastCompletedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <span className="uppercase font-bold">{lastCompletedOrder.paymentMethod}</span>
              </div>
            </div>

            <div className="divide-y divide-dashed divide-slate-200 py-2 border-y border-dashed border-slate-300">
              {lastCompletedOrder.items.map((it, idx) => (
                <div key={idx} className="py-1.5 flex justify-between">
                  <div className="flex-1 pr-2">
                    <div className="font-bold text-slate-900">{it.productName}</div>
                    <div className="text-[10px] text-slate-500">
                      {it.quantity} x {formatINR(it.unitPrice)}
                      {it.discountPercent > 0 ? ` (Tier -${it.discountPercent}%)` : ''}
                    </div>
                  </div>
                  <div className="font-bold text-slate-900">{formatINR(it.finalPrice)}</div>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-[11px] text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatINR(lastCompletedOrder.subtotal)}</span>
              </div>
              {lastCompletedOrder.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Tier Discount:</span>
                  <span>-{formatINR(lastCompletedOrder.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>CGST (9%) + SGST (9%):</span>
                <span>{formatINR(lastCompletedOrder.gstAmount)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-300">
                <span>Total Paid:</span>
                <span className="text-base">{formatINR(lastCompletedOrder.totalAmount)}</span>
              </div>
            </div>

            <div className="text-center pt-2 border-t border-dashed border-slate-300 text-[10px] text-slate-500">
              Thank you for playing at Champions Club!<br />
              Returns accepted within 7 days in original condition.
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 font-sans">
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-800 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Thermal Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE PURCHASE ORDER */}
      {/* ========================================================================= */}
      {isPoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-heading font-bold text-base text-white">Create Supplier Purchase Order (PO)</h3>
              <button onClick={() => setIsPoModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Select Supplier</label>
                <select
                  value={selectedPoSupplierId}
                  onChange={(e) => setSelectedPoSupplierId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code}) • Lead: {s.leadTimeDays}d</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Ordered Line Items</span>
                  <button
                    type="button"
                    onClick={handleAddPoItemRow}
                    className="text-[10px] text-lime-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {poItems.map((item, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                      <select
                        value={item.productId}
                        onChange={(e) => {
                          const p = products.find((pr) => pr.id === e.target.value);
                          setPoItems(poItems.map((it, i) => i === idx ? { ...it, productId: e.target.value, unitCost: p?.costPrice || it.unitCost } : it));
                        }}
                        className="flex-1 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-[11px]"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                        ))}
                      </select>

                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.orderedQty}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setPoItems(poItems.map((it, i) => i === idx ? { ...it, orderedQty: val } : it));
                        }}
                        className="w-16 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-[11px] font-mono text-center"
                      />

                      <input
                        type="number"
                        placeholder="Unit Cost"
                        value={item.unitCost}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setPoItems(poItems.map((it, i) => i === idx ? { ...it, unitCost: val } : it));
                        }}
                        className="w-24 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-[11px] font-mono text-right"
                      />

                      <button
                        type="button"
                        onClick={() => setPoItems(poItems.filter((_, i) => i !== idx))}
                        className="p-1 text-rose-400 hover:bg-rose-500/20 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsPoModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePo}
                className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold shadow-md"
              >
                Dispatch Purchase Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RECEIVE PURCHASE ORDER DELIVERIES */}
      {/* ========================================================================= */}
      {receivePoModalOpen && activeReceivingPo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-heading font-bold text-base text-white">
                  Receive Delivery: PO #{activeReceivingPo.poNumber}
                </h3>
                <p className="text-[11px] text-slate-400">{activeReceivingPo.supplierName}</p>
              </div>
              <button onClick={() => setReceivePoModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <span className="text-slate-400 block">
                Enter delivered quantities to update inventory immediately. Supports partial shipments.
              </span>

              <div className="space-y-2 divide-y divide-slate-800">
                {activeReceivingPo.items.map((item) => {
                  const pending = Math.max(0, item.orderedQty - item.receivedQty);
                  return (
                    <div key={item.productId} className="pt-2 flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-semibold text-white">{item.productName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Ordered: {item.orderedQty} • Previously Received: {item.receivedQty} (Pending: {pending})
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">Receiving Now:</span>
                        <input
                          type="number"
                          min="0"
                          max={pending}
                          value={receiptQuantities[item.productId] ?? pending}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            setReceiptQuantities({ ...receiptQuantities, [item.productId]: val });
                          }}
                          className="w-20 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white font-mono text-center font-bold"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setReceivePoModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReceivePo}
                className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold shadow-md"
              >
                Confirm Stock Inward
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
