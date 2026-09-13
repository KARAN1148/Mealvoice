import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PhoneCall, Sparkles, ShoppingBag, ShieldCheck, HeartHandshake, Clock, Users, ArrowRight, CheckCircle2, Mic, Accessibility } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export const LandingPage: React.FC = () => {
  const { isEasyMode } = useAccessibility();
  const navigate = useNavigate();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-500/10 via-white to-gray-50 pt-12 pb-20 rounded-b-[2.5rem] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100 text-brand-900 border border-brand-200 text-xs font-extrabold mb-6 animate-pulse">
            <Accessibility className="w-4 h-4 text-brand-600" />
            <span>Inclusive Food Delivery Platform — No Smartphone Required</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Order Food Your Way
          </h1>
          <p className="mt-4 text-lg sm:text-2xl font-bold text-gray-600 max-w-2xl mx-auto">
            Use the app, order online, or simply call us.
          </p>

          {/* Primary CTA Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/restaurants"
              className="px-8 py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center gap-3 hover:-translate-y-0.5"
            >
              <ShoppingBag className="w-6 h-6" />
              <span>[Order Online]</span>
            </Link>

            <a
              href="tel:1800-472-6326"
              className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center gap-3 hover:-translate-y-0.5 animate-pulse-glow"
            >
              <PhoneCall className="w-6 h-6 text-emerald-200" />
              <span>[Call to Order]</span>
            </a>

            <Link
              to="/easy-order"
              className="px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-extrabold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center gap-3 hover:-translate-y-0.5 border-2 border-amber-500"
            >
              <Sparkles className="w-6 h-6 text-amber-900" />
              <span>[Easy Order]</span>
            </Link>
          </div>

          {/* Dedicated Marketing Story Banner */}
          <div className="mt-14 max-w-3xl mx-auto p-6 rounded-3xl bg-slate-900 text-white shadow-2xl border border-slate-800 text-left relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-black text-2xl shrink-0">
                "
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Food delivery shouldn't require a smartphone.</h3>
                <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                  MealVoice is an independent food delivery company built on true accessibility. Whether you have a basic feature phone, find complex app interfaces frustrating, or simply prefer talking to a real human agent — we've got you covered.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THREE CUSTOMER GROUP ACCESSIBILITY CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-gray-900">Designed for Every Technology Comfort</h2>
          <p className="text-gray-600 font-semibold mt-2">Pick the ordering experience that suits you best</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-emerald-200 hover:border-emerald-500 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-6 group-hover:scale-110 transition-transform">
                <PhoneCall className="w-8 h-8" />
              </div>
              <span className="text-xs font-black uppercase text-emerald-700 tracking-wider">GROUP 1 — NO SMARTPHONE</span>
              <h3 className="text-2xl font-black text-gray-900 mt-1">"Don't have a smartphone?"</h3>
              <p className="text-gray-600 font-medium text-sm mt-3 leading-relaxed">
                Call us and we'll handle your order. Speak directly with a friendly MealVoice call agent. Simply give your food choices & address.
              </p>
              <ul className="mt-4 space-y-2 text-xs font-bold text-gray-700">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Dedicated toll-free phone number</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Order confirmation via SMS</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Cash on Delivery accepted</li>
              </ul>
            </div>
            <a
              href="tel:1800-472-6326"
              className="mt-8 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm text-center shadow-lg flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call 1800-MEAL</span>
            </a>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-amber-200 hover:border-amber-500 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8" />
              </div>
              <span className="text-xs font-black uppercase text-amber-700 tracking-wider">GROUP 2 — EASY APP MODE</span>
              <h3 className="text-2xl font-black text-gray-900 mt-1">"Not comfortable with food apps?"</h3>
              <p className="text-gray-600 font-medium text-sm mt-3 leading-relaxed">
                Use our simple Easy Order mode. Massive buttons, high contrast, step-by-step guidance, repeat previous orders, and built-in voice assistance.
              </p>
              <ul className="mt-4 space-y-2 text-xs font-bold text-gray-700">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600" /> Large touch targets & clear images</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600" /> Voice speech command support</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600" /> One-tap "Call Me For Help" button</li>
              </ul>
            </div>
            <Link
              to="/easy-order"
              className="mt-8 py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-extrabold text-sm text-center shadow-lg flex items-center justify-center gap-2 border border-amber-500"
            >
              <Sparkles className="w-4 h-4" />
              <span>Open Easy Order Mode</span>
            </Link>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-brand-200 hover:border-brand-500 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold mb-6 group-hover:scale-110 transition-transform">
                <HeartHandshake className="w-8 h-8" />
              </div>
              <span className="text-xs font-black uppercase text-brand-700 tracking-wider">GROUP 3 — SMARTPHONE CALLERS</span>
              <h3 className="text-2xl font-black text-gray-900 mt-1">"Prefer talking to someone?"</h3>
              <p className="text-gray-600 font-medium text-sm mt-3 leading-relaxed">
                Just call MealVoice. Smartphone users who simply prefer human conversation can call us to place an order instantly into our unified system.
              </p>
              <ul className="mt-4 space-y-2 text-xs font-bold text-gray-700">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-600" /> Same unified backend database</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-600" /> Same fast restaurant preparation</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-600" /> Dedicated MealVoice riders</li>
              </ul>
            </div>
            <Link
              to="/restaurants"
              className="mt-8 py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm text-center shadow-lg flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Online Menu</span>
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS ARCHITECTURE WORKFLOW */}
      <section className="bg-slate-900 text-white py-16 rounded-3xl max-w-7xl mx-auto px-6 shadow-2xl">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">UNIFIED ECOSYSTEM</span>
          <h2 className="text-3xl sm:text-4xl font-black mt-2">One Unified Delivery Backbone</h2>
          <p className="text-slate-400 mt-2 font-medium">
            Whether created via App or Phone Call, every order flows through the exact same backend engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="font-extrabold text-amber-400 text-lg flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" /> APP ORDER FLOW
            </h4>
            <div className="text-xs font-mono text-slate-300 space-y-2 bg-slate-900 p-4 rounded-xl">
              <div>APP ORDER</div>
              <div className="text-slate-500">↓</div>
              <div>BACKEND API</div>
              <div className="text-slate-500">↓</div>
              <div>ORDER MANAGEMENT</div>
              <div className="text-slate-500">↓</div>
              <div>RESTAURANT KITCHEN</div>
              <div className="text-slate-500">↓</div>
              <div>MEALVOICE RIDER</div>
              <div className="text-slate-500">↓</div>
              <div className="text-emerald-400 font-bold">CUSTOMER DELIVERED</div>
            </div>
          </div>

          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="font-extrabold text-emerald-400 text-lg flex items-center gap-2">
              <PhoneCall className="w-5 h-5" /> PHONE CALL ORDER FLOW
            </h4>
            <div className="text-xs font-mono text-slate-300 space-y-2 bg-slate-900 p-4 rounded-xl">
              <div>CALL ORDER</div>
              <div className="text-slate-500">↓</div>
              <div>CALL AGENT DASHBOARD</div>
              <div className="text-slate-500">↓</div>
              <div className="text-emerald-400 font-bold">SAME BACKEND API</div>
              <div className="text-slate-500">↓</div>
              <div>ORDER MANAGEMENT</div>
              <div className="text-slate-500">↓</div>
              <div>RESTAURANT KITCHEN</div>
              <div className="text-slate-500">↓</div>
              <div>MEALVOICE RIDER</div>
              <div className="text-slate-500">↓</div>
              <div className="text-emerald-400 font-bold">CUSTOMER DELIVERED</div>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR RESTAURANTS & FOOD PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900">Popular Restaurants</h2>
            <p className="text-gray-600 font-semibold">Freshly prepared local favorites</p>
          </div>
          <Link
            to="/restaurants"
            className="text-brand-600 font-extrabold text-sm hover:underline flex items-center gap-1"
          >
            <span>View All Restaurants</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: 'MealVoice Kitchen',
              cuisine: 'South & North Indian Speciality',
              rating: 4.8,
              time: '25-35 mins',
              img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80'
            },
            {
              name: 'Royal Hyderabadi Biryani House',
              cuisine: 'Biryani, Mughlai, Kebabs',
              rating: 4.7,
              time: '30-40 mins',
              img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80'
            },
            {
              name: 'Sri Murugan Pure Veg Tiffin',
              cuisine: 'South Indian Pure Veg',
              rating: 4.9,
              time: '20-30 mins',
              img: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-200 hover:shadow-xl transition-all group"
            >
              <div className="h-48 relative overflow-hidden bg-gray-100">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-black text-gray-900 shadow">
                  ⭐ {item.rating}
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-extrabold text-xl text-gray-900 group-hover:text-brand-600 transition-colors">
                  {item.name}
                </h3>
                <p className="text-xs font-semibold text-gray-500 mt-1">{item.cuisine}</p>
                <div className="flex items-center justify-between mt-4 text-xs font-bold text-gray-700 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-brand-600" />
                    {item.time}
                  </span>
                  <span>Delivery Fee: ₹30</span>
                </div>
                <Link
                  to="/restaurants"
                  className="mt-4 w-full py-2.5 rounded-xl bg-gray-900 hover:bg-brand-600 text-white text-center font-bold text-xs block transition-colors"
                >
                  View Menu & Order
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8" id="faq">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-900">Frequently Asked Questions</h2>
          <p className="text-gray-600 font-semibold mt-1">Everything you need to know about MealVoice</p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "How does phone ordering work without a smartphone?",
              a: "You simply call our dedicated number 1800-MEALVOICE from any feature phone or landline. Our customer support agent takes your order details, creates the order in our unified system, and sends an SMS confirmation."
            },
            {
              q: "What is Easy Order mode?",
              a: "Easy Order mode is a simplified interface designed for elderly users or individuals who find traditional apps confusing. It features enlarged buttons, high contrast, step-by-step meal selection, and voice speech commands."
            },
            {
              q: "Does MealVoice use third-party delivery services?",
              a: "No. MealVoice owns and manages its entire independent delivery network, dedicated riders, and restaurant partners."
            }
          ].map((faq, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h4 className="font-extrabold text-lg text-gray-900">{faq.q}</h4>
              <p className="text-sm font-medium text-gray-600 mt-2 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
