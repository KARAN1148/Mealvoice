import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, PhoneCall, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, subtotal, deliveryFee, tax, total } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-black text-gray-900">Your Cart is Empty</h2>
        <p className="text-gray-600 font-semibold max-w-md mx-auto">
          Explore our top restaurants and add delicious dishes to your order!
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/restaurants"
            className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold shadow-lg"
          >
            Browse Menu
          </Link>
          <a
            href="tel:1800-472-6326"
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-lg flex items-center gap-2"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call to Order</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Your Order Cart</h1>
          <p className="text-sm font-semibold text-gray-500 mt-1">
            Ordering from <strong className="text-gray-900">{cart[0].restaurantName}</strong>
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={item.menuItem.id}
              className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.menuItem.imageUrl}
                  alt={item.menuItem.name}
                  className="w-16 h-16 rounded-2xl object-cover shrink-0"
                />
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">{item.menuItem.name}</h3>
                  <div className="text-sm font-bold text-gray-700">₹{item.menuItem.price}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-gray-100 px-3 py-1.5 rounded-xl font-extrabold border border-gray-200">
                  <button onClick={() => updateQuantity(item.menuItem.id, -1)}>
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="text-sm font-bold text-gray-900">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.menuItem.id, 1)}>
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <div className="text-right font-black text-gray-900 w-16">
                  ₹{item.menuItem.price * item.quantity}
                </div>

                <button
                  onClick={() => removeFromCart(item.menuItem.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xl space-y-4 h-fit">
          <h3 className="font-black text-lg text-gray-900 border-b border-gray-100 pb-3">Bill Summary</h3>

          <div className="space-y-2 text-sm font-semibold text-gray-700">
            <div className="flex justify-between">
              <span>Item Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee (Distance base)</span>
              <span>₹{deliveryFee}</span>
            </div>
            <div className="flex justify-between">
              <span>GST & Restaurant Tax (5%)</span>
              <span>₹{tax}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-black text-gray-900">
              <span>Grand Total</span>
              <span className="text-brand-600">₹{total}</span>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="tel:1800-472-6326"
              className="w-full py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              <span>[Call Instead]</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
