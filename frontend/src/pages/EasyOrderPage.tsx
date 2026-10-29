import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, PhoneCall, Mic, MicOff, ArrowLeft, CheckCircle2, Volume2, Plus, Minus, HelpCircle, Utensils, Compass, VolumeX } from 'lucide-react';
import { Restaurant, MenuItem } from '../types';
import { apiRequest } from '../api/client';
import { useDemoMode } from '../context/DemoModeContext';
import { useAuth } from '../context/AuthContext';

export const EasyOrderPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [mealType, setMealType] = useState('Lunch');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState('42, Indiranagar 10th Main, Bengaluru');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Speech Recognition & Synthesis
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [assistantSpokenReply, setAssistantSpokenReply] = useState('');
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const recognitionRef = useRef<any>(null);

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

  // Text-To-Speech helper
  const speakAloud = (text: string) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = 'en-IN';
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis unavailable', err);
    }
  };

  // Real Web Speech Recognition
  const startVoiceOrdering = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      handleVoicePhrase('I want two biryani from MealVoice Kitchen');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      setIsListening(true);
      setVoiceText('Listening to your voice... Speak now!');
      speakAloud('Listening. What would you like to eat?');

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        handleVoicePhrase(transcript);
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error', e);
        setIsListening(false);
        setVoiceText('Could not capture audio clearly. You can speak again or pick an option below.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const stopVoiceOrdering = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setIsListening(false);
  };

  // Natural Language Understanding for Voice Food Orders
  const handleVoicePhrase = (phrase: string) => {
    setVoiceText(`Heard: "${phrase}"`);
    const lower = phrase.toLowerCase();

    // 1. Detect Quantity
    let detectedQty = 1;
    if (lower.includes('two') || lower.includes('2') || lower.includes('double')) detectedQty = 2;
    else if (lower.includes('three') || lower.includes('3')) detectedQty = 3;
    else if (lower.includes('four') || lower.includes('4')) detectedQty = 4;
    else if (lower.includes('five') || lower.includes('5')) detectedQty = 5;

    // 2. Search for food item in all restaurants
    let matchedRest: Restaurant | null = null;
    let matchedItem: MenuItem | null = null;

    for (const rest of restaurants) {
      if (rest.categories) {
        for (const cat of rest.categories) {
          for (const item of cat.items) {
            const itemNameLower = item.name.toLowerCase();
            const words = itemNameLower.split(' ');
            if (lower.includes(itemNameLower) || words.some((w) => w.length > 3 && lower.includes(w))) {
              matchedRest = rest;
              matchedItem = item;
              break;
            }
          }
          if (matchedItem) break;
        }
      }
      if (matchedItem) break;
    }

    // Fallback: pick first restaurant's top item if general match
    if (!matchedItem && restaurants.length > 0) {
      matchedRest = restaurants[0];
      matchedItem = restaurants[0].categories?.[0]?.items[0] || null;
    }

    if (matchedRest && matchedItem) {
      setSelectedRestaurant(matchedRest);
      setSelectedItem(matchedItem);
      setQuantity(detectedQty);
      setStep(5); // Jump directly to review & address

      const reply = `Found ${detectedQty} ${matchedItem.name} from ${matchedRest.name}. Total amount is ₹${matchedItem.price * detectedQty + 30}. Please verify your delivery address to confirm.`;
      setAssistantSpokenReply(reply);
      speakAloud(reply);
    } else {
      const reply = "I didn't quite catch the specific food item. Please choose a meal category below or try speaking again.";
      setAssistantSpokenReply(reply);
      speakAloud(reply);
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

      const confirmSpeech = `Your order ${res.orderNumber} has been placed successfully! Estimated delivery in 30 to 40 minutes.`;
      speakAloud(confirmSpeech);
      showNotification(`Easy Order ${res.orderNumber} placed! SMS notification dispatched.`);
      navigate(`/orders/${res.id}`);
    } catch (err: any) {
      alert(err.message || 'Easy Order placement failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Accessible Header Banner */}
      <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 p-6 sm:p-8 rounded-3xl shadow-xl border-4 border-amber-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-9 h-9 text-amber-950" />
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">EASY ORDER MODE</h1>
          </div>
          <p className="text-base font-extrabold mt-1 text-amber-950/90">
            Accessible, extra-large touch targets, and full voice command assistance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`p-3 rounded-2xl border-2 font-bold text-xs flex items-center gap-2 shadow ${
              ttsEnabled ? 'bg-amber-100 border-amber-900 text-amber-950' : 'bg-gray-200 border-gray-400 text-gray-700'
            }`}
            title="Toggle Voice Readout"
          >
            {ttsEnabled ? <Volume2 className="w-5 h-5 text-amber-950" /> : <VolumeX className="w-5 h-5" />}
            <span>Voice Voiceback: {ttsEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <a
            href="tel:1800-472-6326"
            className="px-6 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm flex items-center gap-2 shadow-lg shrink-0"
          >
            <PhoneCall className="w-5 h-5 animate-pulse" />
            <span>Call Toll-Free: 1800-MEAL</span>
          </a>
        </div>
      </div>

      {/* INTERACTIVE VOICE ASSISTANT BAR */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-4 text-center">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm uppercase tracking-wider">
            <Mic className="w-5 h-5" />
            <span>MealVoice Smart Voice Assistant</span>
          </div>
          <span className="text-xs font-mono text-slate-400">Speech-to-Order Enabled</span>
        </div>

        <p className="text-slate-300 text-sm font-medium max-w-xl mx-auto">
          Tap the microphone button and speak naturally: e.g. <span className="text-amber-300 font-bold">"Order 2 Biryani"</span> or <span className="text-amber-300 font-bold">"Masala Dosa from South Indian Kitchen"</span>.
        </p>

        {/* Live Audio Visualizer Bars */}
        {isListening && (
          <div className="flex items-center justify-center gap-1.5 h-12">
            {[40, 75, 55, 90, 65, 80, 45, 95, 70, 50, 85].map((h, i) => (
              <span
                key={i}
                className="w-1.5 bg-amber-400 rounded-full animate-pulse"
                style={{
                  height: `${h}%`,
                  animationDuration: `${0.4 + (i % 4) * 0.2}s`
                }}
              />
            ))}
          </div>
        )}

        <div className="flex justify-center gap-4">
          {!isListening ? (
            <button
              type="button"
              onClick={startVoiceOrdering}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-amber-500 to-brand-600 hover:scale-105 active:scale-95 text-white font-black text-lg shadow-2xl flex items-center gap-3 transition-all cursor-pointer"
            >
              <Mic className="w-7 h-7" />
              <span>Tap to Speak Your Order</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopVoiceOrdering}
              className="px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-lg shadow-2xl flex items-center gap-3 animate-pulse cursor-pointer"
            >
              <MicOff className="w-7 h-7" />
              <span>Stop Listening</span>
            </button>
          )}
        </div>

        {/* Voice Feedback Display */}
        {voiceText && (
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-sm font-mono text-amber-300">
            {voiceText}
          </div>
        )}

        {assistantSpokenReply && (
          <div className="bg-emerald-950/80 p-3.5 rounded-2xl border border-emerald-800 text-sm font-medium text-emerald-200 flex items-center justify-center gap-2">
            <Volume2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Assistant: {assistantSpokenReply}</span>
          </div>
        )}

        {/* Quick Voice Suggestions */}
        <div className="pt-2">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2">Or click to simulate voice:</span>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              'Order two chicken biryanis',
              'One masala dosa with filter coffee',
              'Paneer butter masala and butter naan',
              'Two veg burgers'
            ].map((phrase) => (
              <button
                key={phrase}
                type="button"
                onClick={() => handleVoicePhrase(phrase)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                "{phrase}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* STEP-BY-STEP LARGE ACCESSIBLE WIZARD */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-4 border-gray-300 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b-2 border-gray-200 pb-4">
          <span className="text-sm font-black uppercase tracking-wider text-brand-600">
            STEP {step} OF 6
          </span>
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="text-xs font-black text-gray-700 hover:text-gray-900 flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Previous Step</span>
            </button>
          )}
        </div>

        {/* STEP 1: Meal Category */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 text-center">
              What meal are you having?
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages', 'Desserts'].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setMealType(type);
                    setStep(2);
                    speakAloud(`Selected ${type}. Please choose a restaurant.`);
                  }}
                  className="p-6 rounded-3xl border-4 border-brand-200 hover:border-brand-600 bg-brand-50 hover:bg-brand-100 text-brand-950 font-black text-xl text-center shadow-md transition-all hover:scale-105 active:scale-95"
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
              Choose a Restaurant
            </h2>
            <div className="space-y-3.5">
              {restaurants.map((rest) => (
                <button
                  key={rest.id}
                  onClick={() => {
                    setSelectedRestaurant(rest);
                    setStep(3);
                    speakAloud(`Selected ${rest.name}. Choose your favorite dish.`);
                  }}
                  className="w-full p-5 rounded-3xl border-4 border-gray-200 hover:border-brand-500 bg-white hover:bg-brand-50 text-left font-black text-xl flex items-center justify-between shadow-sm transition-all"
                >
                  <div>
                    <div className="text-xl font-black text-gray-900">{rest.name}</div>
                    <div className="text-xs font-bold text-gray-500 mt-1 flex items-center gap-2">
                      <span>{rest.cuisine}</span>
                      <span>•</span>
                      <span>Indiranagar</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-extrabold">Open Now</span>
                    </div>
                  </div>
                  <span className="text-brand-600 font-black text-base bg-brand-100 px-4 py-2 rounded-xl">
                    Select Restaurant →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Choose Food Item */}
        {step === 3 && selectedRestaurant && (
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 text-center">
              Choose Food from {selectedRestaurant.name}
            </h2>
            <div className="space-y-3.5">
              {(selectedRestaurant.categories?.flatMap((c) => c.items) || []).map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item);
                    setStep(4);
                    speakAloud(`Selected ${item.name} for ${item.price} rupees. How many portions would you like?`);
                  }}
                  className="w-full p-5 rounded-3xl border-4 border-gray-200 hover:border-brand-500 bg-white hover:bg-brand-50 text-left font-black text-xl flex items-center justify-between shadow-sm transition-all"
                >
                  <div>
                    <div className="text-xl font-black text-gray-900">{item.name}</div>
                    <div className="text-sm font-extrabold text-brand-600 mt-1">₹{item.price}</div>
                  </div>
                  <span className="text-brand-600 font-black text-base bg-brand-100 px-4 py-2 rounded-xl">
                    Choose Item →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Quantity */}
        {step === 4 && selectedItem && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              How many portions of {selectedItem.name}?
            </h2>

            <div className="flex items-center justify-center gap-6 py-6">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-16 h-16 rounded-2xl bg-gray-200 text-gray-900 text-3xl font-black flex items-center justify-center hover:bg-gray-300 active:scale-95"
              >
                <Minus className="w-8 h-8" />
              </button>
              <span className="text-5xl font-black text-brand-600 w-24">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-16 h-16 rounded-2xl bg-gray-200 text-gray-900 text-3xl font-black flex items-center justify-center hover:bg-gray-300 active:scale-95"
              >
                <Plus className="w-8 h-8" />
              </button>
            </div>

            <div className="text-lg font-black text-gray-700">
              Item Subtotal: ₹{selectedItem.price * quantity}
            </div>

            <button
              type="button"
              onClick={() => {
                setStep(5);
                speakAloud(`Confirmed ${quantity} portions. Please confirm your delivery address.`);
              }}
              className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-black text-xl shadow-xl transition-all"
            >
              Confirm Quantity & Continue →
            </button>
          </div>
        )}

        {/* STEP 5: Delivery Address */}
        {step === 5 && (
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 text-center">
              Where should we deliver?
            </h2>

            <div>
              <label className="block text-sm font-extrabold text-gray-800 uppercase mb-2">
                Your Delivery Address
              </label>
              <textarea
                rows={3}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full p-4 text-lg font-bold rounded-2xl border-4 border-gray-300 focus:border-brand-500 outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setStep(6);
                speakAloud('Review order details and click place order now.');
              }}
              className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-black text-xl shadow-xl transition-all"
            >
              Continue to Final Review →
            </button>
          </div>
        )}

        {/* STEP 6: Confirm Order */}
        {step === 6 && selectedRestaurant && selectedItem && (
          <div className="space-y-6 text-center">
            <h2 className="text-3xl font-black text-gray-900">Review & Confirm Your Order</h2>

            <div className="p-6 rounded-3xl bg-amber-50 border-4 border-amber-300 text-left space-y-3">
              <div className="text-2xl font-black text-gray-900">
                {quantity}× {selectedItem.name}
              </div>
              <div className="text-sm font-bold text-gray-700">Restaurant: {selectedRestaurant.name}</div>
              <div className="text-sm font-bold text-gray-700">Delivery Address: {deliveryAddress}</div>
              <div className="text-2xl font-black text-brand-600 pt-3 border-t border-amber-200">
                Total Amount: ₹{selectedItem.price * quantity + 40} (Cash on Delivery)
              </div>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={handlePlaceEasyOrder}
                disabled={isSubmitting}
                className="w-full py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-2xl shadow-2xl flex items-center justify-center gap-3 transition-all"
              >
                <CheckCircle2 className="w-8 h-8" />
                <span>{isSubmitting ? 'Placing Order...' : 'Confirm & Place Order Now'}</span>
              </button>

              <a
                href="tel:1800-472-6326"
                className="w-full py-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-extrabold text-base flex items-center justify-center gap-2 border border-gray-300 block"
              >
                <PhoneCall className="w-5 h-5 text-emerald-600 inline" />
                <span>Need Assistance? Call 1800-472-6326</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EasyOrderPage;
