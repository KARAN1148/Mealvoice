import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, PhoneCall, Mic, ArrowLeft, CheckCircle2, Volume2, Plus, Minus } from 'lucide-react';
import { Restaurant, MenuItem } from '../types';
import { apiRequest } from '../api/client';
import { useDemoMode } from '../context/DemoModeContext';
import { useAuth } from '../context/AuthContext';

export const EasyOrderPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [mealType, setMealType] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState('42, Indiranagar 10th Main, Bengaluru');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Voice speech state
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');

  const { showNotification } = useDemoMode();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadRestaurants() {
      try {
        const data = await apiRequest<Restaurant[]>('/restaurants');
        setRestaurants(data);
      } catch (e) {
        console.error(e);
      }
    }
    loadRestaurants();
  }, []);

  // Web Speech Recognition Prototype
  const startVoiceOrdering = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is simulated for your browser environment.');
      simulateVoiceCommand('I want two biryanis from MealVoice Kitchen');
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;

      setIsListening(true);
      setVoiceText('Listening... Speak now!');

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceText(`Detected: "${transcript}"`);
        setIsListening(false);
        parseVoiceCommand(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        simulateVoiceCommand('I want two biryanis from MealVoice Kitchen');
      };

      recognition.start();
    } catch (e) {
      simulateVoiceCommand('I want two biryanis from MealVoice Kitchen');
    }
  };

  const simulateVoiceCommand = (phrase: string) => {
    setIsListening(true);
    setVoiceText('Listening... (Simulating speech input)');
    setTimeout(() => {
      setVoiceText(`Detected: "${phrase}"`);
      setIsListening(false);
      parseVoiceCommand(phrase);
    }, 1500);
  };

  const parseVoiceCommand = (text: string) => {
    const lower = text.toLowerCase();
    const rest = restaurants[0];
    if (rest && rest.categories && rest.categories[0]?.items[0]) {
      setSelectedRestaurant(rest);
      setSelectedItem(rest.categories[0].items[0]);

      if (lower.includes('two') || lower.includes('2')) setQuantity(2);
      else setQuantity(1);

      setStep(5); // Jump to address confirmation
    }
  };

  const handlePlaceEasyOrder = async () => {
    if (!selectedRestaurant || !selectedItem) return;
    setIsSubmitting(true);

    try {
      let customerId = user?.roleProfileId;
      if (!customerId) {
        const profile = await apiRequest<any>('/customers/profile');
        customerId = profile.id;
      }

      const orderData = {
        customerId,
        restaurantId: selectedRestaurant.id,
        items: [{ menuItemId: selectedItem.id, quantity }],
        deliveryAddress,
        paymentMethod: 'COD',
        source: 'EASY_ORDER'
      };

      const res = await apiRequest<any>('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });

      showNotification(`Easy Order ${res.orderNumber} placed!`);
      navigate(`/orders/${res.id}`);
    } catch (err: any) {
      alert(err.message || 'Easy Order placement failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Easy Order Banner Header */}
      <div className="bg-amber-400 text-amber-950 p-6 sm:p-8 rounded-3xl shadow-xl border-4 border-amber-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-amber-900" />
            <h1 className="text-3xl sm:text-4xl font-black">EASY ORDER MODE</h1>
          </div>
          <p className="text-base font-extrabold mt-1">Simple, large, step-by-step ordering for everyone.</p>
        </div>

        <a
          href="tel:1800-472-6326"
          className="px-6 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm flex items-center gap-2 shadow-lg shrink-0"
        >
          <PhoneCall className="w-5 h-5" />
          <span>[Call Me For Help]</span>
        </a>
      </div>

      {/* Voice Assistant Speech Bar */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl text-center space-y-4">
        <h3 className="text-xl font-black flex items-center justify-center gap-2 text-amber-400">
          <Mic className="w-6 h-6" />
          <span>Voice Assisted Ordering</span>
        </h3>
        <p className="text-sm font-medium text-slate-300">
          Tap the button below and speak out loud what you want to eat!
        </p>

        <button
          onClick={startVoiceOrdering}
          className={`px-8 py-4 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-3 mx-auto transition-all ${
            isListening
              ? 'bg-red-600 text-white animate-pulse'
              : 'bg-gradient-to-r from-brand-500 to-amber-500 hover:scale-105 text-white'
          }`}
        >
          <Mic className="w-6 h-6" />
          <span>{isListening ? 'Listening Now...' : '[🎙 Start Voice Ordering]'}</span>
        </button>

        {voiceText && (
          <div className="bg-slate-800 p-3 rounded-xl text-sm font-mono text-amber-300 border border-slate-700">
            {voiceText}
          </div>
        )}
      </div>

      {/* STEP WIZARD CONTAINER */}
      <div className="bg-white p-8 rounded-3xl border-4 border-gray-300 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b-2 border-gray-200 pb-4">
          <span className="text-sm font-black uppercase tracking-wider text-brand-600">
            STEP {step} OF 6
          </span>
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="text-xs font-black text-gray-600 hover:text-gray-900 flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          )}
        </div>

        {/* STEP 1: Meal Category */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 text-center">
              "What would you like to eat?"
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages', 'Desserts'].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setMealType(type);
                    setStep(2);
                  }}
                  className="p-6 rounded-3xl border-4 border-brand-200 hover:border-brand-600 bg-brand-50 hover:bg-brand-100 text-brand-950 font-black text-xl text-center shadow-md transition-all hover:scale-105"
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Choose Restaurant */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 text-center">
              "Choose a restaurant"
            </h2>
            <div className="space-y-4">
              {restaurants.slice(0, 5).map((rest) => (
                <button
                  key={rest.id}
                  onClick={() => {
                    setSelectedRestaurant(rest);
                    setStep(3);
                  }}
                  className="w-full p-5 rounded-3xl border-4 border-gray-200 hover:border-brand-500 bg-white hover:bg-brand-50 text-left font-black text-xl flex items-center justify-between shadow-sm transition-all"
                >
                  <div>
                    <div className="text-xl font-black text-gray-900">{rest.name}</div>
                    <div className="text-xs font-bold text-gray-500 mt-1">{rest.cuisine}</div>
                  </div>
                  <span className="text-brand-600 font-extrabold text-sm">Select →</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Choose Food Item */}
        {step === 3 && selectedRestaurant && (
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 text-center">
              "Choose your food from {selectedRestaurant.name}"
            </h2>
            <div className="space-y-4">
              {(selectedRestaurant.categories?.[0]?.items || []).map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item);
                    setStep(4);
                  }}
                  className="w-full p-5 rounded-3xl border-4 border-gray-200 hover:border-brand-500 bg-white hover:bg-brand-50 text-left font-black text-xl flex items-center justify-between shadow-sm transition-all"
                >
                  <div>
                    <div className="text-xl font-black text-gray-900">{item.name}</div>
                    <div className="text-sm font-extrabold text-brand-600 mt-1">₹{item.price}</div>
                  </div>
                  <span className="text-brand-600 font-extrabold text-sm">Choose →</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Quantity */}
        {step === 4 && selectedItem && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              "How many portions of {selectedItem.name}?"
            </h2>

            <div className="flex items-center justify-center gap-6 py-6">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-16 h-16 rounded-2xl bg-gray-200 text-gray-900 text-3xl font-black flex items-center justify-center hover:bg-gray-300"
              >
                <Minus className="w-8 h-8" />
              </button>
              <span className="text-5xl font-black text-brand-600 w-20">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-16 h-16 rounded-2xl bg-gray-200 text-gray-900 text-3xl font-black flex items-center justify-center hover:bg-gray-300"
              >
                <Plus className="w-8 h-8" />
              </button>
            </div>

            <button
              onClick={() => setStep(5)}
              className="w-full py-4 rounded-2xl bg-brand-600 text-white font-black text-xl shadow-xl"
            >
              Continue to Delivery Address →
            </button>
          </div>
        )}

        {/* STEP 5: Delivery Address */}
        {step === 5 && (
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 text-center">
              "Where should we deliver?"
            </h2>

            <div>
              <label className="block text-sm font-extrabold text-gray-800 uppercase mb-2">Delivery Address</label>
              <textarea
                rows={3}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full p-4 text-xl font-bold rounded-2xl border-4 border-gray-300 focus:border-brand-500"
              />
            </div>

            <button
              onClick={() => setStep(6)}
              className="w-full py-4 rounded-2xl bg-brand-600 text-white font-black text-xl shadow-xl"
            >
              Confirm Order Details →
            </button>
          </div>
        )}

        {/* STEP 6: Confirm Order */}
        {step === 6 && selectedRestaurant && selectedItem && (
          <div className="space-y-6 text-center">
            <h2 className="text-3xl font-black text-gray-900">"Confirm your order"</h2>

            <div className="p-6 rounded-3xl bg-amber-50 border-4 border-amber-300 text-left space-y-3">
              <div className="text-xl font-black text-gray-900">
                {quantity}× {selectedItem.name}
              </div>
              <div className="text-sm font-bold text-gray-600">Restaurant: {selectedRestaurant.name}</div>
              <div className="text-sm font-bold text-gray-600">Address: {deliveryAddress}</div>
              <div className="text-2xl font-black text-brand-600 pt-2 border-t border-amber-200">
                Total Amount: ₹{selectedItem.price * quantity + 30} (Cash on Delivery)
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handlePlaceEasyOrder}
                disabled={isSubmitting}
                className="w-full py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-2xl shadow-2xl flex items-center justify-center gap-3 animate-pulse-glow"
              >
                <CheckCircle2 className="w-8 h-8" />
                <span>{isSubmitting ? 'Placing Order...' : '[Place Order Now]'}</span>
              </button>

              <a
                href="tel:1800-472-6326"
                className="w-full py-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-extrabold text-lg flex items-center justify-center gap-2 border border-gray-300 block"
              >
                <PhoneCall className="w-5 h-5 text-emerald-600 inline" />
                <span>[Call Me For Help]</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EasyOrderPage;
