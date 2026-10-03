import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { Product, ProductCategory } from '../../types';
import { SportsGraphic } from '../../components/common/SportsGraphic';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  X,
  CreditCard,
  Truck,
  MapPin,
  Sparkles,
  Lock,
} from 'lucide-react';

export const PublicShop: React.FC = () => {
  const {
    products,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    checkoutCart,
    currentUser,
    isAuthenticated,
    setCurrentView,
    setAuthIntent,
    members,
  } = useClub();

  const [selectedCategory, setSelectedCategory] = useState<'All' | ProductCategory>('All');
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Checkout form state
  const activeMember = currentUser.role === 'member' ? members.find((m) => m.memberId === currentUser.memberId) : undefined;
  const [customerName, setCustomerName] = useState(activeMember?.name || currentUser.name || 'Club Member');
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [address, setAddress] = useState('Flat 402, Royal Palms, Golf Course Road');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Cash' | 'Online'>('UPI');

  const categories: ('All' | ProductCategory)[] = ['All', 'Rackets', 'Balls', 'Shoes', 'Accessories', 'Apparel'];

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    return true;
  });

  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const memberDiscountRate = activeMember ? activeMember.discountRate : 0.20; // Default demo Gold rate if Rahul Patel
  const discountAmount = Math.round(cartSubtotal * memberDiscountRate);
  const cartTotal = cartSubtotal - discountAmount;
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleExecuteCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    const result = checkoutCart({
      customerName,
      memberId: activeMember?.memberId || 'M001',
      deliveryType,
      address: deliveryType === 'delivery' ? address : undefined,
      paymentMethod,
    });

    if (result.success && result.orderId) {
      setOrderSuccessId(result.orderId);
      setCheckoutModalOpen(false);
    } else {
      setCheckoutError(result.error || 'Failed to process shop checkout.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & Cart Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-emerald-600 font-semibold">
            Official Equipment & Apparel
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Champions Sports Pro Shop
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Shared live inventory with front counter POS · Member discounts automatically deducted at checkout.
          </p>
        </div>

        {/* View Cart Button */}
        <button
          onClick={() => setCartDrawerOpen(true)}
          className="relative px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-all self-start sm:self-auto"
        >
          <ShoppingBag className="w-4 h-4 text-white" />
          <span>Review Cart</span>
          {totalCartItems > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-white text-blue-700 font-bold font-mono text-[11px]">
              {totalCartItems}
            </span>
          )}
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const isLowStock = product.stock <= product.minStock && product.stock > 0;
          const isOutOfStock = product.stock === 0;

          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between hover:shadow-md transition-all group shadow-xs"
            >
              <div>
                {/* Visual Area */}
                <div
                  onClick={() => setDetailProduct(product)}
                  className="h-44 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer overflow-hidden relative mb-3 group-hover:scale-[1.01] transition-transform"
                >
                  <SportsGraphic type={product.imageType as any} className="w-full h-full" />

                  {/* Stock Badges - Public Availability */}
                  <div className="absolute top-2.5 left-2.5">
                    {isOutOfStock ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-sans font-bold flex items-center gap-1 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                        Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-sans font-bold flex items-center gap-1 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Low Stock
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-sans font-bold flex items-center gap-1 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        In Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="text-[10px] font-mono uppercase text-slate-400">{product.category} · SKU: {product.sku}</div>
                <h3
                  onClick={() => setDetailProduct(product)}
                  className="text-xs font-bold text-slate-900 mt-1 line-clamp-1 cursor-pointer hover:text-blue-600 transition-colors"
                >
                  {product.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>

                {/* Price Display */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-baseline justify-between font-mono">
                  <div>
                    <span className="text-base font-extrabold text-slate-900">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {product.memberPrice && (
                    <div className="text-[10px] text-blue-600 font-semibold">
                      Member: ₹{product.memberPrice.toLocaleString('en-IN')}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 flex items-center gap-2">
                <button
                  disabled={isOutOfStock}
                  onClick={() => addToCart(product, 1)}
                  className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    isOutOfStock
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Product Details Modal */}
      {detailProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 relative overflow-hidden">
            <button
              onClick={() => setDetailProduct(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="h-64 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden">
                <SportsGraphic type={detailProduct.imageType as any} className="w-full h-full" />
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 font-semibold">
                    {detailProduct.category} · SKU: {detailProduct.sku}
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                    {detailProduct.name}
                  </h2>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {detailProduct.description}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="font-semibold text-slate-900">Key Features:</div>
                  {detailProduct.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900">
                      ₹{detailProduct.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-blue-600 font-bold">
                      Gold Member: ₹{detailProduct.memberPrice?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 font-sans font-medium">
                    <span>Availability:</span>
                    {detailProduct.stock === 0 ? (
                      <span className="text-rose-600 font-bold">Currently Unavailable</span>
                    ) : detailProduct.stock <= detailProduct.minStock ? (
                      <span className="text-amber-600 font-bold">Limited Availability</span>
                    ) : (
                      <span className="text-emerald-600 font-bold">In Stock</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    disabled={detailProduct.stock === 0}
                    onClick={() => {
                      addToCart(detailProduct, 1);
                      setDetailProduct(null);
                      setCartDrawerOpen(true);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={() => setDetailProduct(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-6 animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-base">Your Sports Cart</h3>
                  <span className="text-xs text-slate-400 font-mono">({totalCartItems} items)</span>
                </div>
                <button
                  onClick={() => setCartDrawerOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="mt-4 max-h-[55vh] overflow-y-auto space-y-3 pr-1">
                {cart.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                    <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
                    <p>Your cart is empty. Add tournament balls, apparel, or rackets.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex-1 pr-2">
                        <div className="font-bold text-slate-900 truncate">{item.product.name}</div>
                        <div className="text-[11px] font-mono text-slate-500">
                          ₹{item.product.price} each · <span className="text-emerald-600 font-semibold">{item.product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-slate-300 rounded-lg bg-white">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 text-slate-500 hover:text-slate-900"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 font-mono text-xs font-bold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            disabled={item.quantity >= item.product.stock}
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Subtotal & Checkout Button */}
            {cart.length > 0 && (
              <div className="pt-4 border-t border-slate-200 space-y-3 font-mono text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-blue-600 font-semibold">
                  <span>Member Tier Discount (20%):</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-100">
                  <span>Final Total:</span>
                  <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>

                <button
                  onClick={() => {
                    setCartDrawerOpen(false);
                    if (!isAuthenticated) {
                      setAuthPromptOpen(true);
                      return;
                    }
                    setCheckoutModalOpen(true);
                  }}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs flex items-center justify-center gap-2 transition-colors font-sans"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auth Prompt Modal (Required for Checkout) */}
      {authPromptOpen && (
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
              <h3 className="text-xl font-bold text-slate-900">Account Required for Checkout</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Please login or create an account to continue with your order. Your cart items will be saved!
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono flex items-center justify-between">
              <span className="text-slate-600">Cart Total ({totalCartItems} items):</span>
              <span className="font-extrabold text-slate-900 text-sm">₹{cartSubtotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setAuthIntent({ view: 'public_shop', message: 'Please login to complete your pro sports shop order.' });
                  setAuthPromptOpen(false);
                  setCurrentView('public_login');
                }}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <span>Log In to Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setAuthIntent({ view: 'public_shop', message: 'Create an account to complete your sports gear order.' });
                  setAuthPromptOpen(false);
                  setCurrentView('public_signup');
                }}
                className="w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs transition-colors"
              >
                Sign Up for New Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 relative">
            <button
              onClick={() => setCheckoutModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleExecuteCheckout} className="space-y-4">
              <div>
                <div className="text-xs font-mono uppercase text-blue-600 font-semibold">
                  Pro Shop Checkout
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  Confirm Order & Inventory Reduction
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Ordering directly syncs with unified club inventory.
                </p>
              </div>

              {checkoutError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs">
                  {checkoutError}
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer / Member</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Delivery Options */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fulfillment Option</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('pickup')}
                      className={`p-2.5 rounded-lg border text-left flex items-start gap-2 ${
                        deliveryType === 'pickup'
                          ? 'border-blue-500 bg-blue-50 text-blue-950 font-semibold'
                          : 'border-slate-300 bg-white text-slate-600'
                      }`}
                    >
                      <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <div>Collect at Club</div>
                        <div className="text-[10px] text-slate-500">Pick up from Front Counter</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType('delivery')}
                      className={`p-2.5 rounded-lg border text-left flex items-start gap-2 ${
                        deliveryType === 'delivery'
                          ? 'border-blue-500 bg-blue-50 text-blue-950 font-semibold'
                          : 'border-slate-300 bg-white text-slate-600'
                      }`}
                    >
                      <Truck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <div>Home Delivery</div>
                        <div className="text-[10px] text-slate-500">Delivered within 24 hrs</div>
                      </div>
                    </button>
                  </div>
                </div>

                {deliveryType === 'delivery' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Delivery Address</label>
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* Payment Method */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2 font-semibold">
                    {(['UPI', 'Card', 'Cash'] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`py-2 px-2 rounded-lg border flex items-center justify-center gap-1.5 ${
                          paymentMethod === method
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>{method}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bill Summary */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>Items ({totalCartItems}):</span>
                    <span>₹{cartSubtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-blue-600 font-bold">
                    <span>Gold Discount:</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-1 border-t border-slate-200">
                    <span>Payable:</span>
                    <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCheckoutModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                >
                  Confirm & Deduct Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Success Confirmation */}
      {orderSuccessId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">Order Confirmed!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your sports shop order has been recorded and stock levels updated.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono text-xs text-left space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-blue-600 font-bold">ORDER NUMBER</span>
                <span className="text-slate-900 font-bold">{orderSuccessId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="text-slate-900 font-semibold">{customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fulfillment:</span>
                <span className="text-blue-600 capitalize font-medium">{deliveryType}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
                <span className="text-slate-700">Amount Paid:</span>
                <span className="text-slate-900">₹{cartTotal.toLocaleString('en-IN')} ({paymentMethod})</span>
              </div>
            </div>

            <button
              onClick={() => setOrderSuccessId(null)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
