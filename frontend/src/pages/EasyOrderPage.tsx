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
  const [voiceSupported, setVoiceSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  const { showNotification } = useDemoMode();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadRestaurants() {
      try {
        const data = await apiRequest<any>('/restaurants');
        // Handle both paginated object { restaurants: [...] } and direct array
        const list: Restaurant[] = Array.isArray(data) ? data : (data?.restaurants || []);
        setRestaurants(list);
      } catch (e) {
        console.error('Failed to load restaurants for Easy Order', e);
        setRestaurants([]);
      }
    }
    loadRestaurants();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
    }
  }, []);

  // Text-To-Speech helper
  const speakAloud = (text: string) => {
    if (!ttsEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
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

  // Real Web Speech Recognition optimized for mobile touch interaction
  const startVoiceOrdering = () => {
    // If TTS is currently speaking, cancel immediately so audio output doesn't clash with mic
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

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
      recognition.maxAlternatives = 1;

      setIsListening(true);
      setVoiceText('Listening to your voice... Speak now!');

      recognition.onresult = (event: any) => {
        setIsListening(false);
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          handleVoicePhrase(transcript);
        } else {
          setVoiceText('Could not understand clearly. Please speak again or tap an item below.');
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error', e);
        setIsListening(false);
        if (e.error === 'not-allowed') {
          setVoiceText('Microphone permission denied. Please allow microphone in mobile browser settings or tap below.');
        } else if (e.error === 'no-speech') {
          setVoiceText('No speech detected. Please tap the button and speak clearly into your phone.');
        } else {
          setVoiceText('Voice capture paused. You can tap again or pick an option below.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error('Speech recognition start error', e);
      setIsListening(false);
      setVoiceText('Could not activate microphone. Tap below to choose your meal.');
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

    if (Array.isArray(restaurants)) {
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
    }

    // Fallback: pick first restaurant's top item if general match
    if (!matchedItem && Array.isArray(restaurants) && restaurants.length > 0) {
      matchedRest = restaurants[0];
      matchedItem = restaurants[0].categories?.[0]?.items[0] || null;
    }

    if (matchedRest && matchedItem) {
      setSelectedRestaurant(matchedRest);
      setSelectedItem(matchedItem);
      setQuantity(detectedQty);
      setStep(5); // Jump directly to review & address

      const reply = `Found ${detectedQty} ${matchedItem.name} from ${matchedRest.name}. Total amount is ₹${matchedItem.price * detectedQty + 40}. Please verify your delivery address to confirm.`;
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
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Accessible Header Banner */}
      <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 p-5 sm:p-8 rounded-3xl shadow-xl border-4 border-amber-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-8 h-8 sm:w-9 sm:h-9 text-amber-950 shrink-0" />
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">EASY ORDER MODE</h1>
          </div>
          <p className="text-sm sm:text-base font-extrabold mt-1 text-amber-950/90">
            Accessible, extra-large touch targets, and full voice command assistance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`flex-1 sm:flex-none p-2.5 sm:p-3 rounded-2xl border-2 font-bold text-xs flex items-center justify-center gap-2 shadow ${
              ttsEnabled ? 'bg-amber-100 border-amber-900 text-amber-950' : 'bg-gray-200 border-gray-400 text-gray-700'
            }`}
            title="Toggle Voice Readout"
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-950" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
            <span>Voiceback: {ttsEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <a
            href="tel:18004726326"
            className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shrink-0"
          >
            <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            <span>Call: 1800-MEAL</span>
          </a>
        </div>
      </div>

      {/* INTERACTIVE VOICE ASSISTANT BAR */}
      <div className="bg-slate-900 text-white p-5 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-4 text-center">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs sm:text-sm uppercase tracking-wider">
            <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>MealVoice Smart Voice Assistant</span>
          </div>
          <span className="text-[10px] sm:text-xs font-mono text-slate-400">
            {voiceSupported ? 'Speech Enabled' : 'Simulated Voice'}
          </span>
        </div>

        <p className="text-slate-300 text-xs sm:text-sm font-medium max-w-xl mx-auto leading-relaxed">
          Tap microphone and speak: e.g. <span className="text-amber-300 font-bold">"Order 2 Biryani"</span> or <span className="text-amber-300 font-bold">"Masala Dosa"</span>.
        </p>

        {/* Live Audio Visualizer Bars */}
        {isListening && (
          <div className="flex items-center justify-center gap-1.5 h-10 sm:h-12">
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

        <div className="flex justify-center">
          {!isListening ? (
            <button
              type="button"
              onClick={startVoiceOrdering}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-amber-500 to-brand-600 hover:scale-105 active:scale-95 text-white font-black text-base sm:text-lg shadow-2xl flex items-center justify-center gap-3 transition-all cursor-pointer"
            >
              <Mic className="w-6 h-6 sm:w-7 sm:h-7" />
              <span>Tap to Speak Your Order</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopVoiceOrdering}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-base sm:text-lg shadow-2xl flex items-center justify-center gap-3 animate-pulse cursor-pointer"
            >
              <MicOff className="w-6 h-6 sm:w-7 sm:h-7" />
              <span>Stop Listening</span>
            </button>
          )}
        </div>

        {/* Voice Feedback Display */}
        {voiceText && (
          <div className="bg-slate-950 p-3 sm:p-3.5 rounded-2xl border border-slate-800 text-xs sm:text-sm font-mono text-amber-300">
            {voiceText}
          </div>
        )}

        {assistantSpokenReply && (
          <div className="bg-emerald-950/80 p-3 sm:p-3.5 rounded-2xl border border-emerald-800 text-xs sm:text-sm font-medium text-emerald-200 flex items-center justify-center gap-2">
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
            <span>Assistant: {assistantSpokenReply}</span>
          </div>
        )}

        {/* Quick Voice Suggestions */}
        <div className="pt-2">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Or tap to simulate voice:</span>
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
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
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                "{phrase}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* STEP-BY-STEP LARGE ACCESSIBLE WIZARD */}
      <div className="bg-white p-5 sm:p-8 rounded-3xl border-4 border-gray-300 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b-2 border-gray-200 pb-4">
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-brand-600">
            STEP {step} OF 6
          </span>
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="text-xs font-black text-gray-700 hover:text-gray-900 flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 px-3 sm:px-4 py-2 rounded-xl transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}
        </div>

        {/* STEP 1: Meal Category */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-3xl font-black text-gray-900 text-center">
              What meal are you having?
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages', 'Desserts'].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setMealType(type);
                    setStep(2);
                    speakAloud(`Selected ${type}. Please choose a restaurant.`);
                  }}
                  className="p-4 sm:p-6 rounded-3xl border-4 border-brand-200 hover:border-brand-600 bg-brand-50 hover:bg-brand-100 text-brand-950 font-black text-base sm:text-xl text-center shadow-md transition-all hover:scale-105 active:scale-95"
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
            <h2 className="text-xl sm:text-3xl font-black text-gray-900 text-center">
              Choose a Restaurant
            </h2>
            <div className="space-y-3">
              {restaurants.length === 0 ? (
                <div className="text-center py-8 text-gray-500 font-bold">
                  Loading available restaurants...
                </div>
              ) : (
                restaurants.map((rest) => (
                  <button
                    key={rest.id}
                    onClick={() => {
                      setSelectedRestaurant(rest);
                      setStep(3);
                      speakAloud(`Selected ${rest.name}. Choose your favorite dish.`);
                    }}
                    className="w-full p-4 sm:p-5 rounded-3xl border-4 border-gray-200 hover:border-brand-500 bg-white hover:bg-brand-50 text-left font-black text-lg sm:text-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm transition-all"
                  >
                    <div>
                      <div className="text-lg sm:text-xl font-black text-gray-900">{rest.name}</div>
                      <div className="text-xs font-bold text-gray-500 mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span>{rest.cuisine}</span>
                        <span>•</span>
                        <span>Rating: ★{rest.rating}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-extrabold">Open Now</span>
                      </div>
                    </div>
                    <span className="text-brand-600 font-black text-sm sm:text-base bg-brand-100 px-3 sm:px-4 py-2 rounded-xl self-stretch sm:self-auto text-center">
                      Select Restaurant →
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Choose Food Item */}
        {step === 3 && selectedRestaurant && (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-3xl font-black text-gray-900 text-center">
              Choose Food from {selectedRestaurant.name}
            </h2>
            <div className="space-y-3">
              {((selectedRestaurant.categories?.flatMap((c) => c.items)) || []).map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item);
                    setStep(4);
                    speakAloud(`Selected ${item.name} for ${item.price} rupees. How many portions would you like?`);
                  }}
                  className="w-full p-4 sm:p-5 rounded-3xl border-4 border-gray-200 hover:border-brand-500 bg-white hover:bg-brand-50 text-left font-black text-lg sm:text-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm transition-all"
                >
                  <div>
                    <div className="text-lg sm:text-xl font-black text-gray-900">{item.name}</div>
                    <div className="text-sm font-extrabold text-brand-600 mt-1">₹{item.price}</div>
                  </div>
                  <span className="text-brand-600 font-black text-sm sm:text-base bg-brand-100 px-3 sm:px-4 py-2 rounded-xl self-stretch sm:self-auto text-center">
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
            <h2 className="text-xl sm:text-3xl font-black text-gray-900">
              How many portions of {selectedItem.name}?
            </h2>

            <div className="flex items-center justify-center gap-4 sm:gap-6 py-4 sm:py-6">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gray-200 text-gray-900 text-2xl sm:text-3xl font-black flex items-center justify-center hover:bg-gray-300 active:scale-95"
              >
                <Minus className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
              <span className="text-4xl sm:text-5xl font-black text-brand-600 w-20 sm:w-24">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gray-200 text-gray-900 text-2xl sm:text-3xl font-black flex items-center justify-center hover:bg-gray-300 active:scale-95"
              >
                <Plus className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
            </div>

            <div className="text-base sm:text-lg font-black text-gray-700">
              Item Subtotal: ₹{selectedItem.price * quantity}
            </div>

            <button
              type="button"
              onClick={() => {
                setStep(5);
                speakAloud(`Confirmed ${quantity} portions. Please confirm your delivery address.`);
              }}
              className="w-full py-3.5 sm:py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-black text-lg sm:text-xl shadow-xl transition-all"
            >
              Confirm Quantity & Continue →
            </button>
          </div>
        )}

        {/* STEP 5: Delivery Address */}
        {step === 5 && (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-3xl font-black text-gray-900 text-center">
              Where should we deliver?
            </h2>

            <div>
              <label className="block text-xs sm:text-sm font-extrabold text-gray-800 uppercase mb-2">
                Your Delivery Address
              </label>
              <textarea
                rows={3}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full p-3 sm:p-4 text-base sm:text-lg font-bold rounded-2xl border-4 border-gray-300 focus:border-brand-500 outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setStep(6);
                speakAloud('Review order details and click place order now.');
              }}
              className="w-full py-3.5 sm:py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-black text-lg sm:text-xl shadow-xl transition-all"
            >
              Continue to Final Review →
            </button>
          </div>
        )}

        {/* STEP 6: Confirm Order */}
        {step === 6 && selectedRestaurant && selectedItem && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Review & Confirm Your Order</h2>

            <div className="p-4 sm:p-6 rounded-3xl bg-amber-50 border-4 border-amber-300 text-left space-y-3">
              <div className="text-xl sm:text-2xl font-black text-gray-900">
                {quantity}× {selectedItem.name}
              </div>
              <div className="text-xs sm:text-sm font-bold text-gray-700">Restaurant: {selectedRestaurant.name}</div>
              <div className="text-xs sm:text-sm font-bold text-gray-700">Delivery Address: {deliveryAddress}</div>
              <div className="text-xl sm:text-2xl font-black text-brand-600 pt-3 border-t border-amber-200">
                Total Amount: ₹{selectedItem.price * quantity + 40} (Cash on Delivery)
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <button
                type="button"
                onClick={handlePlaceEasyOrder}
                disabled={isSubmitting}
                className="w-full py-4 sm:py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-lg sm:text-2xl shadow-2xl flex items-center justify-center gap-3 transition-all"
              >
                <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 shrink-0" />
                <span>{isSubmitting ? 'Placing Order...' : 'Confirm & Place Order Now'}</span>
              </button>

              <a
                href="tel:18004726326"
                className="w-full py-3 sm:py-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 border border-gray-300 block"
              >
                <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 inline" />
                <span>Need Assistance? Call 1800-MEAL</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EasyOrderPage;
