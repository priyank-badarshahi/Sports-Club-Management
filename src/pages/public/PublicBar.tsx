import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { BarCategory, BarItem } from '../../types';
import { SportsGraphic } from '../../components/common/SportsGraphic';
import {
  Coffee,
  UtensilsCrossed,
  Clock,
  Sparkles,
  Lock,
  ArrowRight,
  CheckCircle2,
  X,
  CreditCard,
} from 'lucide-react';

export const PublicBar: React.FC = () => {
  const {
    barItems,
    isAuthenticated,
    currentUser,
    setCurrentView,
    setAuthIntent,
    addBarOrderItem,
  } = useClub();

  const [selectedCategory, setSelectedCategory] = useState<'All' | BarCategory>('All');
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BarItem | null>(null);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [tableNumber, setTableNumber] = useState(1);

  const categories: ('All' | BarCategory)[] = ['All', 'Food', 'Drinks', 'Snacks', 'Desserts'];

  const filteredItems = barItems.filter((i) => {
    if (selectedCategory !== 'All' && i.category !== selectedCategory) return false;
    return true;
  });

  const handleOrderClick = (item: BarItem) => {
    setSelectedItem(item);
    setOrderQuantity(1);
    if (!isAuthenticated) {
      setAuthPromptOpen(true);
      return;
    }
  };

  const handleConfirmOrder = () => {
    if (!selectedItem) return;
    addBarOrderItem(tableNumber, selectedItem, orderQuantity);
    setOrderSuccessMsg(`Order confirmed: ${orderQuantity}x ${selectedItem.name} sent to kitchen for Table ${tableNumber}!`);
    setSelectedItem(null);
    setTimeout(() => setOrderSuccessMsg(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold mb-3">
          <Coffee className="w-3.5 h-3.5" />
          <span>Courtside Dining & Hospitality</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Champions Bar & Cafeteria
        </h1>
        <p className="text-slate-600 text-sm mt-3 leading-relaxed">
          Nutrient-dense athletic fuel, artisan wood-fired pizzas, gourmet recovery burgers, cold-pressed electrolyte juices, and specialty espresso.
        </p>
      </div>

      {orderSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between font-medium shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{orderSuccessMsg}</span>
          </div>
          <button onClick={() => setOrderSuccessMsg(null)} className="text-emerald-700 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center justify-center gap-2 border-b border-slate-200 pb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Public Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
          >
            <div>
              <div className="h-44 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden mb-4 relative">
                <SportsGraphic
                  type={
                    item.category === 'Food'
                      ? 'burger'
                      : item.category === 'Drinks'
                      ? 'coffee'
                      : 'accessories'
                  }
                  className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-blue-700 border border-slate-200 font-mono text-[10px] font-bold shadow-xs">
                  {item.prepTimeMinutes} mins prep
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  {item.category}
                </span>
                {item.calories && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    {item.calories} kcal
                  </span>
                )}
              </div>

              <h3 className="font-bold text-slate-900 text-base mt-1 line-clamp-1">
                {item.name}
              </h3>
              <p className="text-slate-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="font-mono">
                <div className="text-lg font-extrabold text-slate-900">₹{item.price}</div>
                <div className="text-[10px] text-blue-600 font-semibold">Member Price: ₹{Math.round(item.price * 0.8)}</div>
              </div>

              <button
                onClick={() => handleOrderClick(item)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>Order Now</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL 1: AUTH REQUIRED FOR BAR ORDER (For unauthenticated visitors) */}
      {authPromptOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 relative text-center space-y-4">
            <button
              onClick={() => setAuthPromptOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
              <Lock className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">Login Required</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Login required to place an order at Champions Bar & Cafeteria.
              </p>
            </div>

            {/* Selected item summary */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs font-mono flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 font-sans">{selectedItem.name}</div>
                <div className="text-slate-500 text-[11px]">{selectedItem.category} · ₹{selectedItem.price}</div>
              </div>
              <span className="text-blue-600 font-bold font-mono">Member: ₹{Math.round(selectedItem.price * 0.8)}</span>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setAuthIntent({
                    view: 'public_bar',
                    extraData: { item: selectedItem },
                    message: `Please login to place your order for ${selectedItem.name}.`,
                  });
                  setAuthPromptOpen(false);
                  setCurrentView('public_login');
                }}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <span>Log In to Order</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setAuthIntent({
                    view: 'public_bar',
                    extraData: { item: selectedItem },
                    message: `Create an account to order from Champions Bar & Cafeteria.`,
                  });
                  setAuthPromptOpen(false);
                  setCurrentView('public_signup');
                }}
                className="w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs transition-colors"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM FOOD ORDER (For logged-in Member) */}
      {!authPromptOpen && selectedItem && isAuthenticated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 relative space-y-4">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="text-xs font-mono uppercase text-blue-600 font-semibold">
                Member Dining Order
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                Confirm Cafeteria Order
              </h3>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-slate-900 text-sm">
                <span>{selectedItem.name}</span>
                <span>₹{selectedItem.price * orderQuantity}</span>
              </div>
              <div className="text-slate-500">Ordering as: <span className="font-semibold text-slate-900">{currentUser.name} ({currentUser.role})</span></div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Courtside Table #</label>
                <select
                  value={tableNumber}
                  onChange={(e) => setTableNumber(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      Table {num}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmOrder}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs"
              >
                Send to Kitchen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
