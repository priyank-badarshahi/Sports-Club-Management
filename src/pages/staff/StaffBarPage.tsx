import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store';
import { 
  MenuItem, 
  MenuItemCategory, 
  Table, 
  Tab, 
  BarOrderItem, 
  BarOrder, 
  BarStaffShift, 
  MembershipTier, 
  TableStatus 
} from '../../types';
import { 
  Coffee, 
  Plus, 
  Check, 
  CreditCard, 
  DollarSign, 
  X, 
  AlertCircle, 
  Search, 
  Flame, 
  Users, 
  ArrowRightLeft, 
  Layers, 
  Clock, 
  Sparkles, 
  Split, 
  Trash2, 
  ShieldAlert, 
  FileText, 
  Printer, 
  Download, 
  TrendingUp, 
  UserCheck, 
  Wine, 
  Utensils, 
  ChefHat, 
  CheckCircle2, 
  SlidersHorizontal,
  Edit,
  User,
  Zap,
  Tag,
  AlertTriangle
} from 'lucide-react';
import { formatINR, formatDateTime, getTierBadgeClass } from '../../lib/formatters';
import { 
  getMemberBarDiscountPercent, 
  getMemberTabLimit, 
  calculateTabTotals, 
  splitTabEqually, 
  splitTabByItems, 
  getKdsTicketUrgency, 
  generateZReportData, 
  exportZReportToCSV 
} from '../../lib/bar';

export const StaffBarPage: React.FC = () => {
  const { 
    tables, 
    tabs, 
    menuItems, 
    barOrders, 
    barStaffShifts, 
    members, 
    currentUser,
    openTab, 
    addTabOrder, 
    addTabOrdersBatch, 
    settleTabComplete, 
    voidTabOrderItem, 
    transferTabTable, 
    mergeTablesAction, 
    updateKdsTicketStatus, 
    addMenuItem, 
    updateMenuItem, 
    deleteMenuItem, 
    clockInBarStaff, 
    clockOutBarStaff, 
    addToast 
  } = useAppStore();

  // Active Main Navigation: 'pos' | 'kds' | 'floor' | 'menu' | 'shifts' | 'zreport'
  const [activeView, setActiveView] = useState<'pos' | 'kds' | 'floor' | 'menu' | 'shifts' | 'zreport'>('pos');

  // ----------------------------------------------------
  // POS & TAB STATE
  // ----------------------------------------------------
  const [selectedTabId, setSelectedTabId] = useState<string>(tabs[0]?.id || '');
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentSeat, setCurrentSeat] = useState<string>('Seat 1');
  const [itemModifiers, setItemModifiers] = useState<string[]>([]);
  const [itemNotes, setItemNotes] = useState('');

  // Modals
  const [isNewTabModalOpen, setIsNewTabModalOpen] = useState(false);
  const [newTabCustomer, setNewTabCustomer] = useState('');
  const [newTabMemberId, setNewTabMemberId] = useState('');
  const [newTabTableId, setNewTabTableId] = useState('');
  const [newTabPartySize, setNewTabPartySize] = useState(4);

  const [isSplitBillModalOpen, setIsSplitBillModalOpen] = useState(false);
  const [splitType, setSplitType] = useState<'equal' | 'by_item'>('equal');
  const [splitCount, setSplitCount] = useState(4);

  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);
  const [voidTargetIndex, setVoidTargetIndex] = useState<number | null>(null);
  const [voidReason, setVoidReason] = useState('Customer changed mind before preparation');
  const [voidManagerPin, setVoidManagerPin] = useState('8888');

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferTargetTableId, setTransferTargetTableId] = useState('');

  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [mergePrimaryTableId, setMergePrimaryTableId] = useState('');
  const [mergeSecondaryTableIds, setMergeSecondaryTableIds] = useState<string[]>([]);

  // Settle Modal & QR Simulation
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [settlePaymentMethod, setSettlePaymentMethod] = useState<'card' | 'upi' | 'cash' | 'wallet' | 'split'>('card');
  const [settleTipAmount, setSettleTipAmount] = useState<number>(0);
  const [isUpiQrShowing, setIsUpiQrShowing] = useState(false);

  // KDS Station Filter
  const [kdsStationFilter, setKdsStationFilter] = useState<'all' | 'kitchen' | 'bar'>('all');

  // Shifts Form
  const [isClockInModalOpen, setIsClockInModalOpen] = useState(false);
  const [clockInStaffName, setClockInStaffName] = useState('Rahul Verma');
  const [clockInRole, setClockInRole] = useState<BarStaffShift['role']>('bartender');
  const [clockInShiftType, setClockInShiftType] = useState<BarStaffShift['shiftType']>('evening');
  const [clockInFloat, setClockInFloat] = useState(5000);

  const [isClockOutModalOpen, setIsClockOutModalOpen] = useState(false);
  const [activeShiftForClockOut, setActiveShiftForClockOut] = useState<BarStaffShift | null>(null);
  const [clockOutCash, setClockOutCash] = useState(0);
  const [clockOutHandoverNotes, setClockOutHandoverNotes] = useState('');

  // Active Selected Tab
  const activeTab = useMemo(() => {
    return tabs.find((t) => t.id === selectedTabId) || tabs.find((t) => t.status === 'open') || tabs[0];
  }, [tabs, selectedTabId]);

  const openTabs = useMemo(() => {
    return tabs.filter((t) => t.status === 'open' || t.status === 'bill_requested');
  }, [tabs]);

  // Member Tier and Discount
  const memberTier: MembershipTier = activeTab ? activeTab.tier : 'walk_in';
  const tierDiscountPercent = getMemberBarDiscountPercent(memberTier);
  const tabLimit = getMemberTabLimit(memberTier);
  const isOverLimit = activeTab ? activeTab.totalAmount > (activeTab.tabLimit || tabLimit) : false;

  // Filtered Menu Items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchSearch = !menuSearch || 
        item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
        item.description.toLowerCase().includes(menuSearch.toLowerCase());
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [menuItems, menuSearch, selectedCategory]);

  // Happy Hour Active Check (5 PM to 8 PM)
  const isHappyHourActive = useMemo(() => {
    const currentHour = new Date().getHours();
    return currentHour >= 17 && currentHour < 20;
  }, []);

  // POS Add item to tab
  const handleAddItemToTab = (item: MenuItem) => {
    if (!activeTab || activeTab.status === 'settled') {
      addToast({
        type: 'error',
        title: 'No Open Tab Selected',
        message: 'Please select or open an active dining tab first.',
      });
      return;
    }

    const price = isHappyHourActive && item.happyHourPrice ? item.happyHourPrice : item.price;

    const orderItem: BarOrderItem = {
      menuItemId: item.id,
      name: item.name,
      price,
      quantity: 1,
      guestSeat: currentSeat,
      station: item.station || (item.category === 'beverages' || item.category === 'bar_craft' || item.category === 'protein_shakes' ? 'bar' : 'kitchen'),
      modifiers: itemModifiers.length > 0 ? [...itemModifiers] : undefined,
      notes: itemNotes || undefined,
    };

    addTabOrder(activeTab.id, orderItem);
    setItemNotes('');
    setItemModifiers([]);
  };

  // Open Tab Handler
  const handleOpenNewTab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTabCustomer) return;

    const member = members.find((m) => m.id === newTabMemberId);
    let tierToUse: MembershipTier = 'walk_in';
    if (member) {
      const today = new Date();
      const expDate = new Date(member.expiryDate);
      if (expDate >= today) {
        tierToUse = member.tier;
      }
    }

    const tab = openTab(
      newTabCustomer,
      tierToUse,
      newTabTableId || undefined,
      newTabMemberId || undefined,
      newTabPartySize
    );

    setSelectedTabId(tab.id);
    setIsNewTabModalOpen(false);
    setNewTabCustomer('');
    setNewTabMemberId('');
    setNewTabTableId('');
    setNewTabPartySize(4);
  };

  // Void Handler
  const handleConfirmVoid = () => {
    if (!activeTab || voidTargetIndex === null) return;
    voidTabOrderItem(activeTab.id, voidTargetIndex, voidReason, `Manager (PIN: ${voidManagerPin})`);
    setIsVoidModalOpen(false);
    setVoidTargetIndex(null);
  };

  // Transfer Handler
  const handleConfirmTransfer = () => {
    if (!activeTab || !transferTargetTableId) return;
    transferTabTable(activeTab.id, transferTargetTableId);
    setIsTransferModalOpen(false);
    setTransferTargetTableId('');
  };

  // Merge Tables Handler
  const handleConfirmMerge = () => {
    if (!mergePrimaryTableId || mergeSecondaryTableIds.length === 0) return;
    mergeTablesAction(mergePrimaryTableId, mergeSecondaryTableIds);
    setIsMergeModalOpen(false);
    setMergePrimaryTableId('');
    setMergeSecondaryTableIds([]);
  };

  // Settle Handler
  const handleConfirmSettle = () => {
    if (!activeTab) return;
    settleTabComplete(activeTab.id, settlePaymentMethod, settleTipAmount);
    setIsSettleModalOpen(false);
    setIsUpiQrShowing(false);
    setSettleTipAmount(0);
  };

  // Z-Report Calculation
  const zReportData = useMemo(() => {
    return generateZReportData(tabs, barStaffShifts);
  }, [tabs, barStaffShifts]);

  const handleDownloadCsvZReport = () => {
    const csvContent = exportZReportToCSV(zReportData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ChampionsClub_Bar_ZReport_${zReportData.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast({ type: 'success', title: 'Z-Report Downloaded', message: 'CSV export complete.' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-lime-400">
              Staff Operations • Courtside Bar & Café
            </span>
            {isHappyHourActive && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-950 font-extrabold flex items-center gap-1 animate-pulse">
                <Sparkles className="w-3 h-3" /> HAPPY HOUR ACTIVE (5-8 PM)
              </span>
            )}
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white mt-1">
            Bar & Cafeteria Operating Terminal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Optimized for rapid 20-person team arrivals, live KDS station routing, table merging, and automatic member discounts.
          </p>
        </div>

        {/* Action Buttons: Open Tab & Merge Tables */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMergeModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Merge Tables (20 Pax)</span>
          </button>

          <button
            onClick={() => setIsNewTabModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow-md shadow-lime-400/20 flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Open Dining Tab</span>
          </button>
        </div>
      </div>

      {/* Main Views Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'pos', label: 'Order-Taking POS', icon: Utensils, badge: openTabs.length > 0 ? `${openTabs.length} Open` : null },
          { id: 'kds', label: 'Kitchen & Bar Display (KDS)', icon: ChefHat, badge: barOrders.filter((b) => b.status !== 'served').length },
          { id: 'floor', label: 'Floorplan & Tables (10)', icon: Users, badge: tables.filter((t) => t.status === 'occupied').length > 0 ? `${tables.filter((t) => t.status === 'occupied').length} Occ` : null },
          { id: 'menu', label: 'Menu Management (32)', icon: Coffee, badge: null },
          { id: 'shifts', label: 'Staff Shifts & Drawer', icon: UserCheck, badge: barStaffShifts.filter((s) => s.status === 'active').length },
          { id: 'zreport', label: 'End-of-Day Z-Report', icon: FileText, badge: 'Daily' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
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
      {/* VIEW 1: ORDER-TAKING POS (OPTIMIZED FOR 20-PERSON RUSH) */}
      {/* ========================================================================= */}
      {activeView === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Active Tabs Selector & Quick Seat Tagger (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-400">
                Active Tabs ({openTabs.length})
              </h3>
              <span className="text-[10px] text-lime-400 font-mono">Live Sync</span>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {openTabs.map((tab) => {
                const isSelected = tab.id === activeTab?.id;
                const isWarning = tab.status === 'bill_requested';
                const limit = tab.tabLimit || getMemberTabLimit(tab.tier);
                const isOver = tab.totalAmount > limit;

                return (
                  <div
                    key={tab.id}
                    onClick={() => setSelectedTabId(tab.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition relative ${
                      isSelected
                        ? 'bg-slate-900 border-lime-400 shadow-lg shadow-lime-400/10'
                        : isWarning
                          ? 'bg-amber-950/30 border-amber-500/40 hover:border-amber-400'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs truncate">{tab.customerName}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-extrabold ${getTierBadgeClass(tab.tier)}`}>
                        {tab.tier}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                      <span>{tab.tableName}</span>
                      <span>{tab.orders.filter((o) => o.status !== 'voided').length} items</span>
                    </div>

                    {isOver && (
                      <div className="mt-1.5 text-[10px] text-rose-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Over Limit (Max ₹{limit})
                      </div>
                    )}

                    <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between items-baseline font-bold text-xs">
                      <span className="text-slate-500 text-[10px] font-mono">{tab.tabNumber || tab.id}</span>
                      <span className="text-lime-400 font-heading font-extrabold text-sm">
                        {formatINR(Math.round(tab.totalAmount))}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center Column: Menu Catalog with Quick Seat Tagger (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Quick Seat Selector for 20-Person Group */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Tag Order to Guest / Seat (20 Pax Support)
                </span>
                <span className="text-[10px] text-lime-400 font-bold">{currentSeat}</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {['Shared Table', 'Seat 1', 'Seat 2', 'Seat 3', 'Seat 4', 'Seat 5', 'Seat 6', 'Seat 7', 'Seat 8', 'Player 9-12', 'Player 13-20'].map((seat) => (
                  <button
                    key={seat}
                    type="button"
                    onClick={() => setCurrentSeat(seat)}
                    className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition text-[11px] ${
                      currentSeat === seat
                        ? 'bg-lime-400 text-slate-950 font-bold shadow'
                        : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {seat}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Search & Category Filter */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Quick search drink, protein shake, meal..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="beverages">Beverages & Coffee</option>
                <option value="protein_shakes">Protein Shakes</option>
                <option value="healthy_bites">Healthy Bites</option>
                <option value="main_plates">Main Plates</option>
                <option value="snacks">Snacks</option>
                <option value="bar_craft">Craft Bar & Beer</option>
                <option value="desserts">Desserts</option>
              </select>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-2 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredMenuItems.map((item) => {
                const isFood = item.station === 'kitchen';
                const effectivePrice = isHappyHourActive && item.happyHourPrice ? item.happyHourPrice : item.price;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleAddItemToTab(item)}
                    className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-lime-400/60 hover:bg-slate-800/80 cursor-pointer transition flex flex-col justify-between shadow-md group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          isFood ? 'bg-orange-500/20 text-orange-300' : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {item.station}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">{item.calories ? `${item.calories} kcal` : ''}</span>
                      </div>
                      <h4 className="font-heading font-bold text-xs text-white line-clamp-1 group-hover:text-lime-300">
                        {item.name}
                      </h4>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                      <div>
                        <span className="font-heading font-extrabold text-xs text-lime-400">
                          {formatINR(effectivePrice)}
                        </span>
                        {isHappyHourActive && item.happyHourPrice && (
                          <span className="text-[9px] text-slate-500 line-through ml-1">{formatINR(item.price)}</span>
                        )}
                      </div>
                      <span className="p-1 rounded-lg bg-lime-400 text-slate-950 group-hover:scale-110 transition-transform">
                        <Plus className="w-3 h-3 stroke-[3]" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Tab Bill Detail, Actions & Settlement (4 cols) */}
          <div className="lg:col-span-4 rounded-3xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between space-y-4 shadow-2xl">
            {activeTab ? (
              <div className="space-y-4">
                {/* Tab Header & Quick Management Toolbar */}
                <div className="pb-3 border-b border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-lime-400 font-bold">{activeTab.tabNumber || activeTab.id}</span>
                      <h3 className="font-heading font-extrabold text-base text-white">{activeTab.customerName}</h3>
                      <span className="text-[11px] text-slate-400">{activeTab.tableName} • {activeTab.partySize || 4} Guests</span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-extrabold ${getTierBadgeClass(activeTab.tier)}`}>
                      {activeTab.tier} ({tierDiscountPercent}% Off)
                    </span>
                  </div>

                  {/* Table Transfer & Bill Split Triggers */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => setIsTransferModalOpen(true)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1"
                    >
                      <ArrowRightLeft className="w-3 h-3 text-cyan-400" />
                      <span>Transfer</span>
                    </button>
                    <button
                      onClick={() => setIsSplitBillModalOpen(true)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1"
                    >
                      <Split className="w-3 h-3 text-amber-400" />
                      <span>Split Bill</span>
                    </button>
                  </div>
                </div>

                {/* Orders List with Seat Attributions & Void Button */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>Running Tab Items ({activeTab.orders.filter((o) => o.status !== 'voided').length})</span>
                    <span className="text-[10px] text-slate-500">Auto Tier Applied</span>
                  </div>

                  {activeTab.orders.length === 0 ? (
                    <div className="text-center py-16 text-slate-500 text-xs">
                      No items ordered yet. Tap menu items to queue orders.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 divide-y divide-slate-800/60">
                      {activeTab.orders.map((order, idx) => {
                        const isVoided = order.status === 'voided';
                        return (
                          <div key={idx} className={`pt-2 flex items-center justify-between text-xs gap-2 ${isVoided ? 'opacity-40 line-through' : ''}`}>
                            <div className="flex-1">
                              <div className="font-bold text-white line-clamp-1">{order.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                                <span className="text-lime-400 font-semibold">{order.guestSeat || 'Shared'}</span>
                                <span>• {order.quantity} x {formatINR(order.price)}</span>
                                {isVoided && <span className="text-rose-400 font-bold">VOIDED</span>}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-heading font-extrabold text-white">
                                {formatINR(order.price * order.quantity)}
                              </span>
                              {!isVoided && (
                                <button
                                  onClick={() => {
                                    setVoidTargetIndex(idx);
                                    setIsVoidModalOpen(true);
                                  }}
                                  className="p-1 rounded text-rose-400 hover:bg-rose-500/20"
                                  title="Void item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Bill Breakdown with Automatic Member Discount Line Item */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span className="font-mono text-white">{formatINR(activeTab.subtotal)}</span>
                  </div>

                  {activeTab.discountAmount > 0 && (
                    <div className="flex justify-between text-lime-400 font-semibold">
                      <span>Automatic {activeTab.tier.toUpperCase()} Discount ({tierDiscountPercent}%):</span>
                      <span className="font-mono font-bold">-{formatINR(Math.round(activeTab.discountAmount))}</span>
                    </div>
                  )}

                  {activeTab.happyHourDiscount ? activeTab.happyHourDiscount > 0 && (
                    <div className="flex justify-between text-amber-400 font-semibold">
                      <span>Happy Hour Craft Discount (20%):</span>
                      <span className="font-mono font-bold">-{formatINR(Math.round(activeTab.happyHourDiscount))}</span>
                    </div>
                  ) : null}

                  <div className="flex justify-between text-slate-400">
                    <span>Restaurant GST (5%):</span>
                    <span className="font-mono text-white">{formatINR(Math.round(activeTab.gstAmount))}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-base text-white">
                    <span>Total Bill:</span>
                    <span className="text-lime-400 font-heading font-extrabold text-lg">
                      {formatINR(Math.round(activeTab.totalAmount))}
                    </span>
                  </div>
                </div>

                {/* Settle Tab Trigger */}
                <button
                  onClick={() => setIsSettleModalOpen(true)}
                  disabled={activeTab.orders.filter((o) => o.status !== 'voided').length === 0}
                  className="w-full py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-heading font-extrabold text-sm shadow-xl shadow-lime-400/20 disabled:bg-slate-800 disabled:text-slate-600 transition flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Settle Bill ({formatINR(Math.round(activeTab.totalAmount))})</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-24 text-slate-500 text-xs">
                Select an active dining tab to manage orders.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: KITCHEN DISPLAY SYSTEM (KDS) */}
      {/* ========================================================================= */}
      {activeView === 'kds' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase">Filter Station:</span>
              <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold">
                <button
                  onClick={() => setKdsStationFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    kdsStationFilter === 'all' ? 'bg-lime-400 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Stations
                </button>
                <button
                  onClick={() => setKdsStationFilter('kitchen')}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                    kdsStationFilter === 'kitchen' ? 'bg-orange-400 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Utensils className="w-3 h-3" /> Kitchen Station
                </button>
                <button
                  onClick={() => setKdsStationFilter('bar')}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                    kdsStationFilter === 'bar' ? 'bg-blue-400 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Wine className="w-3 h-3" /> Bar Station
                </button>
              </div>
            </div>

            <span className="text-xs font-mono text-lime-400 font-bold">
              {barOrders.filter((b) => b.status !== 'served').length} Active Tickets Pending
            </span>
          </div>

          {/* KDS Ticket Board Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: 'ordered', title: 'New Orders (Incoming)', color: 'text-blue-400 border-blue-500/30' },
              { id: 'preparing', title: 'In Preparation', color: 'text-amber-400 border-amber-500/30' },
              { id: 'ready', title: 'Ready to Serve', color: 'text-emerald-400 border-emerald-500/30' },
              { id: 'served', title: 'Completed / Served', color: 'text-slate-400 border-slate-800' },
            ].map((col) => {
              const tickets = barOrders.filter((o) => {
                const matchStation = kdsStationFilter === 'all' || o.station === kdsStationFilter;
                return o.status === col.id && matchStation;
              });

              return (
                <div key={col.id} className="rounded-3xl bg-slate-900 border border-slate-800 p-4 space-y-3 min-h-[500px]">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className={`font-heading font-bold text-xs uppercase tracking-wider ${col.color}`}>
                      {col.title}
                    </span>
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center justify-center">
                      {tickets.length}
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                    {tickets.map((ticket) => {
                      const urgency = getKdsTicketUrgency(ticket.timestamp);

                      return (
                        <div
                          key={ticket.id}
                          className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 space-y-2.5 text-xs shadow-md"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-white text-xs">{ticket.orderNumber || ticket.id}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${urgency.badgeClass}`}>
                              {urgency.elapsedMinutes}m ago
                            </span>
                          </div>

                          <div>
                            <div className="font-bold text-white text-xs">{ticket.tableName}</div>
                            <span className="text-[10px] text-slate-400">Server: {ticket.serverName || 'Staff'}</span>
                          </div>

                          {/* Itemized Order Line Items */}
                          <div className="divide-y divide-slate-800/80 pt-1 border-t border-slate-800">
                            {ticket.items.map((it, idx) => (
                              <div key={idx} className="py-1.5 text-xs">
                                <div className="flex justify-between font-bold text-white">
                                  <span>{it.quantity} x {it.name}</span>
                                  <span className="text-lime-400 text-[10px]">{it.guestSeat}</span>
                                </div>
                                {it.notes && (
                                  <div className="text-[10px] text-amber-300 italic bg-amber-500/10 px-1.5 py-0.5 rounded mt-0.5">
                                    Note: {it.notes}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* KDS State Transitions */}
                          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1">
                            {ticket.status === 'ordered' && (
                              <button
                                onClick={() => updateKdsTicketStatus(ticket.id, 'preparing')}
                                className="w-full py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow"
                              >
                                Start Preparing
                              </button>
                            )}
                            {ticket.status === 'preparing' && (
                              <button
                                onClick={() => updateKdsTicketStatus(ticket.id, 'ready')}
                                className="w-full py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs shadow"
                              >
                                Mark Ready
                              </button>
                            )}
                            {ticket.status === 'ready' && (
                              <button
                                onClick={() => updateKdsTicketStatus(ticket.id, 'served')}
                                className="w-full py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow"
                              >
                                Hand Over / Served
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: FLOORPLAN & TABLES */}
      {/* ========================================================================= */}
      {activeView === 'floor' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-white">Dining Floorplan & 10 Tables Map</h3>
              <p className="text-xs text-slate-400">Click any table to open a new tab or inspect active dining party.</p>
            </div>

            <button
              onClick={() => setIsMergeModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-bold text-xs flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span>Merge Tables for Banquet</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {tables.map((t) => {
              const tab = tabs.find((tb) => tb.id === t.activeTabId);
              const isOccupied = t.status === 'occupied';
              const isBillReq = t.status === 'bill_requested';
              const isReserved = t.status === 'reserved';

              return (
                <div
                  key={t.id}
                  onClick={() => {
                    if (tab) {
                      setSelectedTabId(tab.id);
                      setActiveView('pos');
                    } else {
                      setNewTabTableId(t.id);
                      setIsNewTabModalOpen(true);
                    }
                  }}
                  className={`p-4 rounded-3xl border cursor-pointer transition flex flex-col justify-between min-h-[140px] shadow-xl ${
                    isBillReq
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                      : isOccupied
                        ? 'bg-slate-900 border-lime-400/50'
                        : isReserved
                          ? 'bg-purple-950/40 border-purple-500/40'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{t.section}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                        isBillReq ? 'bg-amber-500 text-slate-950' :
                        isOccupied ? 'bg-lime-400/20 text-lime-400' :
                        isReserved ? 'bg-purple-500/20 text-purple-300' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {t.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <h4 className="font-heading font-extrabold text-sm text-white mt-1">{t.name}</h4>
                    <span className="text-[11px] text-slate-400 block">Cap: {t.capacity} Pax {t.partySize ? `(Party: ${t.partySize})` : ''}</span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-500">{t.assignedServerName || 'Server: Rahul'}</span>
                    {tab && (
                      <span className="font-heading font-extrabold text-lime-400 text-xs">
                        {formatINR(Math.round(tab.totalAmount))}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: MENU MANAGEMENT */}
      {/* ========================================================================= */}
      {activeView === 'menu' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-white">Café & Bar Menu Catalog (32 Items)</h3>
            <span className="text-xs text-slate-400">Manage pricing, happy hour rates, and station routing</span>
          </div>

          <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-semibold uppercase">
                  <th className="py-3 px-4">Menu Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Station</th>
                  <th className="py-3 px-4">Standard Price</th>
                  <th className="py-3 px-4">Happy Hour Price</th>
                  <th className="py-3 px-4">GST %</th>
                  <th className="py-3 px-4">Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {menuItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-4 font-bold text-white flex items-center gap-2">
                      <span className={item.isVegetarian ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {item.isVegetarian ? '🟢' : '🔴'}
                      </span>
                      <span>{item.name}</span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-300 capitalize">{item.category.replace(/_/g, ' ')}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.station === 'kitchen' ? 'bg-orange-500/20 text-orange-300' : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {item.station}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-bold text-white">{formatINR(item.price)}</td>
                    <td className="py-2.5 px-4 text-amber-400 font-mono">
                      {item.happyHourPrice ? formatINR(item.happyHourPrice) : '—'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400">{item.gstPercent}%</td>
                    <td className="py-2.5 px-4">
                      <button
                        onClick={() => updateMenuItem(item.id, { isAvailable: !item.isAvailable })}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.isAvailable ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 5: STAFF SHIFTS & CASH DRAWER */}
      {/* ========================================================================= */}
      {activeView === 'shifts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-white">Bar Staff Shifts & Cash Drawer Reconciliation</h3>
              <p className="text-xs text-slate-400">Track server sales, opening float, and cash drop variance.</p>
            </div>
            <button
              onClick={() => setIsClockInModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow"
            >
              Start New Staff Shift
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {barStaffShifts.map((shift) => (
              <div key={shift.id} className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-extrabold text-sm text-white">{shift.staffName}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                    shift.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {shift.status}
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <div>Role: <strong className="text-white capitalize">{shift.role}</strong> ({shift.shiftType} shift)</div>
                  <div>Clocked In: <span className="font-mono text-slate-300">{formatDateTime(shift.clockIn)}</span></div>
                  <div>Opening Float: <strong className="text-lime-400 font-mono">{formatINR(shift.cashOpening)}</strong></div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total Shift Sales</span>
                    <span className="font-heading font-extrabold text-white text-sm">{formatINR(shift.salesTotal)}</span>
                  </div>

                  {shift.status === 'active' && (
                    <button
                      onClick={() => {
                        setActiveShiftForClockOut(shift);
                        setClockOutCash(shift.cashOpening + shift.salesTotal);
                        setIsClockOutModalOpen(true);
                      }}
                      className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                    >
                      Close Shift
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 6: END-OF-DAY Z-REPORT */}
      {/* ========================================================================= */}
      {activeView === 'zreport' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-lime-400">Hospitality Audit</span>
                <h3 className="font-heading font-extrabold text-2xl text-white">Bar & Cafeteria End-of-Day Z-Report</h3>
                <span className="text-xs text-slate-400">Audit Date: {zReportData.date} • Signed by Manager</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadCsvZReport}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-lime-400" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Z-Report</span>
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Net Revenue</span>
                <span className="font-heading font-extrabold text-xl text-lime-400">{formatINR(zReportData.totalRevenue)}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Covers Served</span>
                <span className="font-heading font-extrabold text-xl text-white">{zReportData.totalCovers} Guests</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Average Bill (Per Tab)</span>
                <span className="font-heading font-extrabold text-xl text-white">{formatINR(zReportData.averageBill)}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Discounts Given</span>
                <span className="font-heading font-extrabold text-xl text-amber-400">-{formatINR(zReportData.totalDiscounts)}</span>
              </div>
            </div>

            {/* Top Items Table */}
            <div className="space-y-2">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-400">Top Selling Menu Items</h4>
              <div className="rounded-2xl border border-slate-800 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase">
                      <th className="py-2.5 px-4">Item Name</th>
                      <th className="py-2.5 px-4">Units Sold</th>
                      <th className="py-2.5 px-4">Gross Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {zReportData.topItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2 px-4 font-bold text-white">{item.name}</td>
                        <td className="py-2 px-4 text-slate-300 font-mono">{item.quantity}</td>
                        <td className="py-2 px-4 font-bold text-lime-400">{formatINR(item.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cash Reconciliation */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-white uppercase text-[11px] block">Cash Drawer Reconciliation</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>Opening: <strong className="text-slate-300">{formatINR(zReportData.cashReconciliation.opening)}</strong></div>
                <div>Cash Sales: <strong className="text-slate-300">{formatINR(zReportData.cashReconciliation.cashSales)}</strong></div>
                <div>Expected Drawer: <strong className="text-slate-300">{formatINR(zReportData.cashReconciliation.expected)}</strong></div>
                <div>Variance: <strong className="text-lime-400 font-bold">{formatINR(zReportData.cashReconciliation.variance)}</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: OPEN NEW DINING TAB */}
      {/* ========================================================================= */}
      {isNewTabModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-heading font-bold text-base text-white">Open New Dining Tab</h3>
              <button onClick={() => setIsNewTabModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOpenNewTab} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Member Lookup (Auto Tier Discount)</label>
                <select
                  value={newTabMemberId}
                  onChange={(e) => {
                    setNewTabMemberId(e.target.value);
                    const mem = members.find((m) => m.id === e.target.value);
                    if (mem) setNewTabCustomer(mem.fullName);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="">Walk-in Guest (No membership discount)</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.memberNumber}) • {m.tier.toUpperCase()} (Wallet: ₹{m.walletBalance})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Customer / Party Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Malhotra or Tennis Doubles Crew"
                  value={newTabCustomer}
                  onChange={(e) => setNewTabCustomer(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Select Table</label>
                  <select
                    value={newTabTableId}
                    onChange={(e) => setNewTabTableId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  >
                    <option value="">Walk-in Counter</option>
                    {tables.map((tbl) => (
                      <option key={tbl.id} value={tbl.id}>{tbl.name} ({tbl.status})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Party Size (Covers)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={newTabPartySize}
                    onChange={(e) => setNewTabPartySize(Number(e.target.value) || 2)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTabModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold shadow-md"
                >
                  Create Tab
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MERGE TABLES (FOR 20 PAX ARRIVALS) */}
      {/* ========================================================================= */}
      {isMergeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 rounded-3xl border border-purple-500/40 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                <h3 className="font-heading font-bold text-base text-white">Merge Tables for Large Groups (20 Pax)</h3>
              </div>
              <button onClick={() => setIsMergeModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-400">
                Combine multiple dining lounge tables into a unified master banquet tab when large sports crews arrive together.
              </p>

              <div>
                <label className="text-slate-400 block mb-1">Primary Master Table</label>
                <select
                  value={mergePrimaryTableId}
                  onChange={(e) => setMergePrimaryTableId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                >
                  <option value="">Select Primary Table...</option>
                  {tables.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} (Cap: {t.capacity})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Secondary Tables to Merge Into Primary</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {tables
                    .filter((t) => t.id !== mergePrimaryTableId)
                    .map((t) => {
                      const isChecked = mergeSecondaryTableIds.includes(t.id);
                      return (
                        <label
                          key={t.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer ${
                            isChecked ? 'bg-purple-500/20 border-purple-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          <span className="font-bold text-xs">{t.name}</span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setMergeSecondaryTableIds([...mergeSecondaryTableIds, t.id]);
                              } else {
                                setMergeSecondaryTableIds(mergeSecondaryTableIds.filter((id) => id !== t.id));
                              }
                            }}
                            className="accent-purple-400"
                          />
                        </label>
                      );
                    })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsMergeModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmMerge}
                disabled={!mergePrimaryTableId || mergeSecondaryTableIds.length === 0}
                className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold shadow-md"
              >
                Confirm Merge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SPLIT BILL (EQUAL OR BY ITEM) */}
      {/* ========================================================================= */}
      {isSplitBillModalOpen && activeTab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-heading font-bold text-base text-white">Split Dining Bill: {activeTab.tableName}</h3>
              <button onClick={() => setIsSplitBillModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <button
                onClick={() => setSplitType('equal')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition ${
                  splitType === 'equal' ? 'bg-lime-400 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Split Equally Across N People
              </button>
              <button
                onClick={() => setSplitType('by_item')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition ${
                  splitType === 'by_item' ? 'bg-lime-400 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Split by Seat / Tagged Guest
              </button>
            </div>

            {splitType === 'equal' ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Number of Guests Splitting:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSplitCount(Math.max(2, splitCount - 1))}
                      className="w-7 h-7 rounded bg-slate-800 text-white font-bold"
                    >
                      -
                    </button>
                    <span className="font-heading font-extrabold text-white text-sm w-6 text-center">{splitCount}</span>
                    <button
                      onClick={() => setSplitCount(Math.min(20, splitCount + 1))}
                      className="w-7 h-7 rounded bg-slate-800 text-white font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Total Tab Amount:</span>
                    <span className="text-white font-mono">{formatINR(Math.round(activeTab.totalAmount))}</span>
                  </div>
                  <div className="flex justify-between text-sm font-heading font-extrabold text-white pt-1 border-t border-slate-800">
                    <span>Each Person Pays ({splitCount} Guests):</span>
                    <span className="text-lime-400 text-base">
                      {formatINR(Math.round(activeTab.totalAmount / splitCount))}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
                {Object.entries(splitTabByItems(activeTab.orders, activeTab.tier)).map(([seat, data]) => (
                  <div key={seat} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{seat}</div>
                      <div className="text-[10px] text-slate-400">{data.items.length} items</div>
                    </div>
                    <span className="font-heading font-extrabold text-lime-400">{formatINR(data.total)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsSplitBillModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SETTLE TAB WITH PAYMENT OPTIONS */}
      {/* ========================================================================= */}
      {isSettleModalOpen && activeTab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-heading font-bold text-base text-white">Settle Dining Tab</h3>
                <p className="text-[11px] text-slate-400">{activeTab.customerName} • {activeTab.tableName}</p>
              </div>
              <button onClick={() => setIsSettleModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Bill Subtotal:</span>
                  <span>{formatINR(activeTab.subtotal)}</span>
                </div>
                {activeTab.discountAmount > 0 && (
                  <div className="flex justify-between text-lime-400 font-bold">
                    <span>{activeTab.tier.toUpperCase()} Discount:</span>
                    <span>-{formatINR(Math.round(activeTab.discountAmount))}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>GST (5%):</span>
                  <span>{formatINR(Math.round(activeTab.gstAmount))}</span>
                </div>
                <div className="flex justify-between text-sm font-heading font-extrabold text-white pt-1 border-t border-slate-800">
                  <span>Final Payable:</span>
                  <span className="text-lime-400 text-base">{formatINR(Math.round(activeTab.totalAmount + settleTipAmount))}</span>
                </div>
              </div>

              {/* Tip Selection */}
              <div>
                <label className="text-slate-400 block mb-1">Add Staff Tip (Optional)</label>
                <div className="flex items-center gap-2">
                  {[0, 50, 100, 200].map((tip) => (
                    <button
                      key={tip}
                      type="button"
                      onClick={() => setSettleTipAmount(tip)}
                      className={`flex-1 py-1 rounded-lg border font-bold ${
                        settleTipAmount === tip ? 'bg-lime-400 text-slate-950 border-lime-400' : 'bg-slate-950 text-slate-300 border-slate-800'
                      }`}
                    >
                      {tip === 0 ? 'No Tip' : `₹${tip}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Settlement Mode */}
              <div>
                <label className="text-slate-400 block mb-1">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'card', label: 'Card (EDC)', icon: CreditCard },
                    { id: 'upi', label: 'UPI QR', icon: Sparkles },
                    { id: 'cash', label: 'Cash', icon: DollarSign },
                    { id: 'wallet', label: 'Member Wallet', icon: UserCheck, disabled: !activeTab.memberId },
                    { id: 'split', label: 'Split Pay', icon: Split },
                  ].map((pm) => {
                    const Icon = pm.icon;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        disabled={pm.disabled}
                        onClick={() => setSettlePaymentMethod(pm.id as any)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 ${
                          settlePaymentMethod === pm.id
                            ? 'bg-lime-400 text-slate-950 font-bold border-lime-400 shadow'
                            : pm.disabled
                              ? 'opacity-40 cursor-not-allowed bg-slate-950 border-slate-900'
                              : 'bg-slate-950 text-slate-300 border-slate-800'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="text-[10px]">{pm.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsSettleModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSettle}
                className="px-5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold shadow-md"
              >
                Confirm Settlement ({formatINR(Math.round(activeTab.totalAmount + settleTipAmount))})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VOID ITEM WITH MANAGER PIN */}
      {/* ========================================================================= */}
      {isVoidModalOpen && activeTab && voidTargetIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-rose-500/40 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <h3 className="font-heading font-bold text-base text-white">Manager Void Authorization</h3>
              </div>
              <button onClick={() => setIsVoidModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Item to Void:</span>
                <span className="font-bold text-white text-sm">{activeTab.orders[voidTargetIndex]?.name}</span>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Reason for Cancellation</label>
                <select
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                >
                  <option value="Customer changed mind before preparation">Customer changed mind before preparation</option>
                  <option value="Wrong item entered by server">Wrong item entered by server</option>
                  <option value="Food quality or allergy issue">Food quality or allergy issue</option>
                  <option value="Drink spilled or remake authorized">Drink spilled or remake authorized</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Manager PIN Code</label>
                <input
                  type="password"
                  value={voidManagerPin}
                  onChange={(e) => setVoidManagerPin(e.target.value)}
                  placeholder="Enter 4-digit PIN..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-center tracking-widest text-sm"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsVoidModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmVoid}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold shadow-md"
              >
                Authorize Void
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TRANSFER TABLE */}
      {/* ========================================================================= */}
      {isTransferModalOpen && activeTab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-heading font-bold text-base text-white">Transfer Tab to Another Table</h3>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-400">Moving tab for <strong>{activeTab.customerName}</strong> currently at {activeTab.tableName}.</p>

              <div>
                <label className="text-slate-400 block mb-1">Select Destination Table</label>
                <select
                  value={transferTargetTableId}
                  onChange={(e) => setTransferTargetTableId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                >
                  <option value="">Select table...</option>
                  {tables
                    .filter((t) => t.id !== activeTab.tableId && t.status === 'available')
                    .map((tbl) => (
                      <option key={tbl.id} value={tbl.id}>{tbl.name} (Capacity: {tbl.capacity})</option>
                    ))}
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTransfer}
                disabled={!transferTargetTableId}
                className="px-5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold shadow-md"
              >
                Move Tab
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
