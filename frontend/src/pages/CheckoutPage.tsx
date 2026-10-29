import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, Banknote, MapPin, CheckCircle2, ShieldCheck, QrCode, Lock, AlertCircle, Building2, ChevronRight, RefreshCw } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';
import { useDemoMode } from '../context/DemoModeContext';

export const CheckoutPage: React.FC = () => {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const { showNotification } = useDemoMode();
  const navigate = useNavigate();

  // Address State
  const [address, setAddress] = useState('42, 4th Cross, 10th Main, Indiranagar, Bengaluru');
  const [landmark, setLandmark] = useState('Near BDA Complex & Metro Pillar 84');
  const [contactPhone, setContactPhone] = useState(user?.phone || '+91 98765 43210');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NET_BANKING' | 'COD'>('UPI');
  
  // UPI Sub-options
  const [upiMode, setUpiMode] = useState<'QR' | 'VPA'>('QR');
  const [upiId, setUpiId] = useState('karan@okhdfcbank');
  const [isVpaVerified, setIsVpaVerified] = useState(true);
  const [qrCountdown, setQrCountdown] = useState(300);

  // Card Sub-options
  const [cardNumber, setCardNumber] = useState('4532 8912 3456 7890');
  const [cardHolder, setCardHolder] = useState('KARAN VENKATESAN');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('789');

  // Net Banking Option
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // OTP Verification Modal
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // QR Timer countdown
  useEffect(() => {
    if (paymentMethod !== 'UPI' || upiMode !== 'QR') return;
    const interval = setInterval(() => {
      setQrCountdown((prev) => (prev > 0 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(interval);
  }, [paymentMethod, upiMode]);

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  // Format card number with spaces
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const parts = raw.match(/[\s\S]{1,4}/g) || [];
    setCardNumber(parts.join(' '));
  };

  // Detect card brand
  const getCardBrand = (num: string) => {
    const clean = num.replace(/\D/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (clean.startsWith('5')) return 'Mastercard';
    if (clean.startsWith('6') || clean.startsWith('508')) return 'RuPay';
    if (clean.startsWith('3')) return 'Amex';
    return 'Card';
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let customerId = user?.roleProfileId;
      if (!customerId) {
        const profile = await apiRequest<any>('/customers/profile');
        customerId = profile.id;
      }

      const orderData = {
        customerId,
        restaurantId: cart[0].restaurantId,
        items: cart.map((i) => ({ menuItemId: i.menuItem.id, quantity: i.quantity })),
        deliveryAddress: `${address} (Landmark: ${landmark})`,
        landmark,
        specialInstructions,
        paymentMethod,
        source: 'ONLINE',
        paymentDetails: {
          method: paymentMethod,
          upiId: paymentMethod === 'UPI' ? upiId : undefined,
          bankName: paymentMethod === 'NET_BANKING' ? selectedBank : undefined,
          cardDetails: paymentMethod === 'CARD' ? {
            cardNumber,
            cardHolder,
            expiry: cardExpiry,
            brand: getCardBrand(cardNumber)
          } : undefined
        }
      };

      const res = await apiRequest<any>('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });

      // If Card or Net Banking, trigger 3DS OTP verification
      if (paymentMethod === 'CARD' || paymentMethod === 'NET_BANKING') {
        setPendingOrderId(res.id);
        setShowOtpModal(true);
        setIsSubmitting(false);
        return;
      }

      // If COD or UPI, complete immediately
      completeOrderSuccess(res.id, res.orderNumber);
    } catch (err: any) {
      alert(err.message || 'Order creation failed');
      setIsSubmitting(false);
    }
  };

  const completeOrderSuccess = (orderId: string, orderNumber: string) => {
    clearCart();
    showNotification(`Order ${orderNumber} confirmed! Official SMS dispatched to ${contactPhone}.`);
    navigate(`/orders/${orderId}`);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (pendingOrderId) {
      completeOrderSuccess(pendingOrderId, 'MV-2026-CONFIRMED');
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Secure Checkout</h1>
        <p className="text-gray-500 font-medium text-sm mt-1">
          Review delivery details and complete your payment via UPI, Card, Net Banking, or Cash on Delivery.
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address & Contact */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-lg text-gray-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-600" />
                <span>Delivery Address & Contact</span>
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Verified Address
              </span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">House / Flat & Street</label>
              <textarea
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 font-medium text-sm focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Landmark</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 font-medium text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Delivery Contact Phone</label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 font-medium text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Delivery & Kitchen Instructions</label>
              <input
                type="text"
                placeholder="e.g. Ring bell, leave package at door, extra cutlery"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 font-medium text-sm focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          {/* PAYMENT METHOD SELECTION */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-lg text-gray-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-600" />
                <span>Payment Gateway</span>
              </h3>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>256-Bit SSL Encrypted</span>
              </div>
            </div>

            {/* Methods Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'UPI', label: 'UPI / QR', icon: Smartphone, badge: 'Zero Fee' },
                { id: 'CARD', label: 'Credit / Debit Card', icon: CreditCard, badge: 'All Banks' },
                { id: 'NET_BANKING', label: 'Net Banking', icon: Building2, badge: '50+ Banks' },
                { id: 'COD', label: 'Cash on Delivery', icon: Banknote, badge: 'Doorstep' }
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/50 shadow-md ring-2 ring-brand-500/20'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-brand-600' : 'text-gray-500'}`} />
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {m.badge}
                      </span>
                    </div>
                    <span className="font-black text-xs text-gray-900">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* UPI DETAILS */}
            {paymentMethod === 'UPI' && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setUpiMode('QR')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      upiMode === 'QR' ? 'bg-white shadow text-brand-900 border border-brand-200' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Scan Instant QR Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpiMode('VPA')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      upiMode === 'VPA' ? 'bg-white shadow text-brand-900 border border-brand-200' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Enter UPI ID (VPA)
                  </button>
                </div>

                {upiMode === 'QR' ? (
                  <div className="flex flex-col sm:flex-row items-center gap-6 bg-white p-5 rounded-2xl border border-slate-200">
                    {/* Dynamic QR Display */}
                    <div className="w-36 h-36 bg-white p-2 rounded-2xl border-2 border-slate-900 shadow-md flex flex-col items-center justify-center shrink-0">
                      <svg className="w-full h-full" viewBox="0 0 100 100" fill="currentColor">
                        {/* Realistic QR Matrix Pattern */}
                        <rect x="5" y="5" width="28" height="28" fill="#0f172a" rx="4" />
                        <rect x="11" y="11" width="16" height="16" fill="#ffffff" />
                        <rect x="15" y="15" width="8" height="8" fill="#0f172a" />

                        <rect x="67" y="5" width="28" height="28" fill="#0f172a" rx="4" />
                        <rect x="73" y="11" width="16" height="16" fill="#ffffff" />
                        <rect x="77" y="15" width="8" height="8" fill="#0f172a" />

                        <rect x="5" y="67" width="28" height="28" fill="#0f172a" rx="4" />
                        <rect x="11" y="73" width="16" height="16" fill="#ffffff" />
                        <rect x="15" y="77" width="8" height="8" fill="#0f172a" />

                        <rect x="40" y="8" width="6" height="6" fill="#0f172a" />
                        <rect x="52" y="8" width="8" height="6" fill="#0f172a" />
                        <rect x="40" y="20" width="8" height="8" fill="#0f172a" />
                        <rect x="52" y="22" width="6" height="12" fill="#0f172a" />

                        <rect x="8" y="42" width="18" height="6" fill="#0f172a" />
                        <rect x="30" y="40" width="14" height="14" fill="#ea580c" rx="2" />
                        <rect x="48" y="44" width="12" height="6" fill="#0f172a" />
                        <rect x="66" y="40" width="8" height="18" fill="#0f172a" />
                        <rect x="80" y="42" width="14" height="8" fill="#0f172a" />

                        <rect x="40" y="66" width="16" height="8" fill="#0f172a" />
                        <rect x="60" y="68" width="8" height="16" fill="#0f172a" />
                        <rect x="74" y="66" width="18" height="8" fill="#0f172a" />
                        <rect x="42" y="80" width="10" height="12" fill="#0f172a" />
                        <rect x="74" y="80" width="14" height="12" fill="#0f172a" />
                      </svg>
                    </div>

                    <div className="space-y-2 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-slate-700">
                        <span>Scan with any UPI App</span>
                        <span className="text-emerald-600 font-extrabold">• Active</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        Open Google Pay, PhonePe, Paytm, or BHIM and point camera at the QR code.
                      </p>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-extrabold">
                        <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                        <span>Expires in {formatTimer(qrCountdown)}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        UPI VPA: pay.mealvoice@hdfcbank
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase">Your UPI ID / VPA</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => {
                          setUpiId(e.target.value);
                          setIsVpaVerified(e.target.value.includes('@'));
                        }}
                        placeholder="username@bank"
                        className="flex-1 p-3 rounded-xl border border-slate-300 font-mono text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setIsVpaVerified(true)}
                        className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
                      >
                        Verify
                      </button>
                    </div>
                    {isVpaVerified && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Verified: KARAN VENKATESAN (HDFC Bank)</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* CARD DETAILS */}
            {paymentMethod === 'CARD' && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">Card Number</label>
                    <span className="text-xs font-extrabold text-brand-700 uppercase">
                      {getCardBrand(cardNumber)}
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    maxLength={19}
                    className="w-full p-3 rounded-xl border border-slate-300 font-mono text-sm tracking-wider focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="4532 •••• •••• 7890"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cardholder</label>
                    <input
                      type="text"
                      required
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                      className="w-full p-3 rounded-xl border border-slate-300 font-bold text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                      placeholder="NAME ON CARD"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Valid Thru</label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      maxLength={5}
                      className="w-full p-3 rounded-xl border border-slate-300 font-mono text-sm text-center focus:ring-2 focus:ring-brand-500 outline-none"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">CVV / CVC</label>
                    <input
                      type="password"
                      required
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.slice(0, 4))}
                      maxLength={4}
                      className="w-full p-3 rounded-xl border border-slate-300 font-mono text-sm text-center focus:ring-2 focus:ring-brand-500 outline-none"
                      placeholder="•••"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-600 font-medium cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-brand-600 focus:ring-brand-500" />
                  <span>Securely save this card according to RBI tokenization guidelines.</span>
                </label>
              </div>
            )}

            {/* NET BANKING */}
            {paymentMethod === 'NET_BANKING' && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in">
                <label className="block text-xs font-bold text-slate-700 uppercase">Select Your Bank</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Punjab National'].map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`p-3 rounded-xl border text-xs font-extrabold text-left transition-all ${
                        selectedBank === bank
                          ? 'border-brand-600 bg-brand-50 text-brand-900 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  You will be securely routed to {selectedBank}'s 3D authentication gateway to verify your payment.
                </p>
              </div>
            )}

            {/* CASH ON DELIVERY */}
            {paymentMethod === 'COD' && (
              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 space-y-2 text-emerald-950 animate-in fade-in">
                <div className="font-extrabold text-sm flex items-center gap-2 text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Doorstep Payment Available</span>
                </div>
                <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                  Pay ₹{total} in cash or via rider's UPI QR upon delivery. Please ensure exact change when possible.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ORDER SUMMARY & SUBMIT */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xl space-y-5 h-fit">
          <h3 className="font-black text-lg text-gray-900 border-b border-gray-100 pb-3">Bill Details</h3>

          <div className="space-y-2.5 text-xs font-semibold text-gray-600">
            <div className="flex justify-between">
              <span>Item Total</span>
              <span className="font-bold text-gray-900">₹{cart.reduce((acc, i) => acc + i.menuItem.price * i.quantity, 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Standard Delivery Fee</span>
              <span className="font-bold text-emerald-600">₹40</span>
            </div>
            <div className="flex justify-between">
              <span>GST & Restaurant Packaging</span>
              <span className="font-bold text-gray-900">₹{Math.round(total * 0.05)}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
            <span className="font-black text-base text-gray-900">To Pay</span>
            <span className="text-3xl font-black text-brand-600">₹{total}</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 active:scale-[0.99] text-white font-black text-base shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Lock className="w-5 h-5" />
            <span>{isSubmitting ? 'Processing Order...' : `Pay ₹${total} & Place Order`}</span>
          </button>

          <div className="text-[11px] text-gray-400 text-center font-medium">
            By placing this order you agree to MealVoice Terms of Service and Cancellation Policy.
          </div>
        </div>
      </form>

      {/* 3D SECURE OTP MODAL (AUTHENTIC BANK CHECKOUT SIMULATION) */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <span className="font-black text-sm text-gray-900 uppercase tracking-wider">HDFC 3D-Secure 2.0</span>
              </div>
              <span className="text-xs font-mono font-bold text-gray-500">OTP-AUTH</span>
            </div>

            <div className="space-y-1">
              <h4 className="font-black text-lg text-gray-900">Enter Bank One-Time Password</h4>
              <p className="text-xs text-gray-600">
                A 6-digit verification code was sent to registered mobile <span className="font-mono font-bold">• • • • • • 4321</span> for transaction amount <span className="font-bold text-gray-900">₹{total}</span>.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full text-center tracking-[0.5em] font-mono text-2xl font-bold p-3 rounded-xl border-2 border-brand-500 focus:ring-4 focus:ring-brand-200 outline-none"
                />
              </div>

              <div className="flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={() => setOtpCode('123456')}
                  className="text-brand-600 font-bold hover:underline"
                >
                  ⚡ Auto-fill Test Code (123456)
                </button>
                <span className="text-gray-400 font-medium">Expires in 02:45</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-300 font-bold text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify & Authorize</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
