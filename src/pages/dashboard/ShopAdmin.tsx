import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { Product } from '../../types';
import { ShoppingBag, Search, Plus, AlertTriangle, CheckCircle2, RefreshCw, X } from 'lucide-react';

export const ShopAdmin: React.FC = () => {
  const { products, restockProduct } = useClub();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [restockModalProduct, setRestockModalProduct] = useState<Product | null>(null);
  const [restockAmount, setRestockAmount] = useState(20);

  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockModalProduct) return;
    restockProduct(restockModalProduct.id, Number(restockAmount));
    setRestockModalProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-blue-600 font-semibold">
            Unified Commercial Inventory
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Sports Pro Shop & Stock Ledger
          </h1>
          <p className="text-xs text-slate-500">
            {products.length} Catalog SKUs · Synchronized live between Online Shop and Front Desk Counter
          </p>
        </div>

        {lowStockCount > 0 && (
          <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{lowStockCount} Products with Low Inventory</span>
          </div>
        )}
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search SKU or product title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
        >
          <option value="All">All Categories</option>
          <option value="Rackets">Rackets</option>
          <option value="Balls">Balls</option>
          <option value="Shoes">Shoes</option>
          <option value="Accessories">Accessories</option>
          <option value="Apparel">Apparel</option>
          <option value="Cafeteria & Bar">Cafeteria & Bar Consumables</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[780px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-mono uppercase text-slate-500">
                <th className="py-3 px-4">SKU Code</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Live Stock</th>
                <th className="py-3 px-4 text-center">Min Threshold</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4 text-right">Standard Price</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredProducts.map((p) => {
                const isLow = p.stock <= p.minStock && p.stock > 0;
                const isOut = p.stock === 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{p.sku}</td>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-900">
                      {p.name}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{p.category}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900 text-sm">
                      {p.stock}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-400">{p.minStock}</td>
                    <td className="py-3 px-4">
                      {isOut ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1 w-max">
                          <AlertTriangle className="w-3 h-3 text-amber-600" /> Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      ₹{p.price.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={() => {
                          setRestockModalProduct(p);
                          setRestockAmount(20);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200/80 text-xs font-semibold transition-colors"
                      >
                        + Restock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {restockModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 max-w-sm w-full p-6 relative">
            <button
              onClick={() => setRestockModalProduct(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleRestockSubmit} className="space-y-4 text-xs">
              <div>
                <div className="text-xs font-mono uppercase text-blue-600 font-semibold">
                  Inventory Intake
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Restock {restockModalProduct.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  Current Stock: {restockModalProduct.stock} units
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quantity to Add (+ Units)
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-mono text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setRestockModalProduct(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs transition-colors"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
