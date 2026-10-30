import React, { useState } from 'react';
import { PhoneCall, HelpCircle, MessageSquare, CheckCircle2, ChevronDown, ChevronUp, Clock, Zap, Shield } from 'lucide-react';
import { apiRequest } from '../api/client';
import { useDemoMode } from '../context/DemoModeContext';

interface FAQ {
  q: string;
  a: string;
  category: string;
}

const faqs: FAQ[] = [
  {
    category: 'Orders',
    q: 'How do I track my phone order?',
    a: 'Call our 24/7 helpline 1800-MEALVOICE and provide your registered phone number. Our agent will give you a real-time status update instantly. You can also check your Order Tracking page if you have an account.'
  },
  {
    category: 'Orders',
    q: 'Can I cancel an order?',
    a: 'Yes — orders can be cancelled within 5 minutes of placement, before the restaurant begins preparing. Use the "Cancel Order" button on the Order Tracking page or call 1800-MEALVOICE for immediate assistance.'
  },
  {
    category: 'Delivery',
    q: 'What if my food is late?',
    a: 'If your delivery exceeds the estimated time by more than 15 minutes, call 1800-MEALVOICE or use this support form. We will update you immediately and may offer a delivery fee waiver or discount coupon for the inconvenience.'
  },
  {
    category: 'Delivery',
    q: 'How does GPS tracking work?',
    a: 'Once your order is picked up by a rider, you can view live location tracking in the Order Tracking page. The map shows your rider\'s position in real-time, updated every 30 seconds.'
  },
  {
    category: 'Accessibility',
    q: 'How does Easy Order mode work?',
    a: 'Easy Order is a simplified, step-by-step ordering interface designed for users who find traditional food apps difficult. It features large buttons, voice commands, and minimal steps — no technical knowledge required.'
  },
  {
    category: 'Accessibility',
    q: 'Can I order without a smartphone?',
    a: 'Absolutely! MealVoice was built specifically for this. Call 1800-MEALVOICE from any phone — basic mobile or landline — and our trained Call Agent will place your order and answer any questions.'
  },
  {
    category: 'Payments',
    q: 'What payment methods do you accept?',
    a: 'We accept UPI (Google Pay, PhonePe, Paytm, etc.), Debit/Credit Cards (Visa, Mastercard, RuPay), Net Banking (SBI, HDFC, ICICI, Axis, Kotak), and Cash on Delivery (COD). All digital payments are secured with 3D Secure authentication.'
  },
  {
    category: 'Payments',
    q: 'How long do refunds take?',
    a: 'Refunds for cancelled pre-paid orders are processed within 5–7 business days and returned to your original payment method. UPI and Card refunds typically reflect faster (1–3 days with your bank).'
  },
  {
    category: 'Account',
    q: 'How do I change my delivery address?',
    a: 'Go to your Profile page and update your saved addresses. Alternatively, you can enter a new address during checkout without saving it.'
  }
];

const faqCategories = ['All', ...Array.from(new Set(faqs.map(f => f.category)))];

export const SupportPage: React.FC = () => {
  const [category, setCategory] = useState('ORDER_ISSUE');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [ticketNo, setTicketNo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [faqCategory, setFaqCategory] = useState('All');
  const { showNotification } = useDemoMode();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiRequest<any>('/support/ticket', {
        method: 'POST',
        body: JSON.stringify({ category, subject, description })
      });
      setTicketNo(res.ticket.ticketNo);
      setSubmitted(true);
      showNotification(`✅ Support ticket ${res.ticket.ticketNo} created!`);
    } catch (err: any) {
      alert(err.message || 'Ticket creation failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFaqs = faqCategory === 'All' ? faqs : faqs.filter(f => f.category === faqCategory);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900">MealVoice Support</h1>
        <p className="text-gray-600 font-semibold">We're here to help — by app, ticket, or phone call.</p>
      </div>

      {/* ── Quick Stats ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Clock, label: 'Avg Response', value: '< 2 hours', color: 'blue' },
          { icon: Zap, label: 'Phone Support', value: '24 / 7', color: 'emerald' },
          { icon: Shield, label: 'Issue Resolution', value: '98.5%', color: 'amber' }
        ].map(stat => (
          <div key={stat.label} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-center">
            <stat.icon className={`w-6 h-6 text-${stat.color}-500 mx-auto mb-1`} />
            <div className="text-lg font-black text-gray-900">{stat.value}</div>
            <div className="text-[11px] font-bold text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Call Banner ─────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black">Talk to a Human Agent</h2>
          <p className="text-emerald-100 font-medium text-sm mt-1">
            24/7 support — works from any phone, no smartphone needed.
          </p>
        </div>
        <a
          href="tel:18004726326"
          className="px-8 py-4 rounded-2xl bg-white text-emerald-900 font-black text-base shadow-xl flex items-center gap-3 hover:bg-emerald-50 transition-all shrink-0"
        >
          <PhoneCall className="w-6 h-6 text-emerald-600 animate-pulse" />
          1800-MEALVOICE
        </a>
      </div>

      {/* ── Category Quick-Select ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: '📦', label: 'Order Issue', cat: 'ORDER_ISSUE', desc: 'Wrong item, missing food, incorrect order' },
          { icon: '🛵', label: 'Delivery Issue', cat: 'DELIVERY_ISSUE', desc: 'Rider delay, address problem, non-delivery' },
          { icon: '💳', label: 'Payment Issue', cat: 'PAYMENT_ISSUE', desc: 'Failed charge, duplicate payment, refund' }
        ].map(opt => (
          <button
            key={opt.cat}
            onClick={() => {
              setCategory(opt.cat);
              document.getElementById('ticket-form')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`p-5 rounded-2xl border-2 text-left font-bold transition-all hover:scale-[1.02] active:scale-100 ${
              category === opt.cat ? 'border-brand-500 bg-brand-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300 shadow-sm'
            }`}
          >
            <div className="text-3xl mb-2">{opt.icon}</div>
            <div className="text-base font-black text-gray-900">{opt.label}</div>
            <div className="text-xs text-gray-500 mt-1">{opt.desc}</div>
          </button>
        ))}
      </div>

      {/* ── Ticket Form ─────────────────────────────────────────────────────── */}
      <div id="ticket-form" className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xl space-y-5">
        <h3 className="font-extrabold text-xl text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-brand-600" />
          Report an Issue
        </h3>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-center space-y-3">
            <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
            <h4 className="text-xl font-black text-emerald-900">Ticket Created Successfully!</h4>
            <p className="text-sm font-bold text-emerald-800">
              Ticket ID: <span className="font-black text-emerald-900 bg-emerald-200 px-2 py-0.5 rounded">{ticketNo}</span>
            </p>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Our support team will respond within 2 hours. For urgent issues, call <strong>1800-MEALVOICE</strong> anytime.
            </p>
            <button
              onClick={() => { setSubmitted(false); setSubject(''); setDescription(''); }}
              className="mt-2 text-xs font-bold text-emerald-700 hover:underline"
            >
              Submit another ticket
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1.5">Issue Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-bold text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              >
                <option value="ORDER_ISSUE">📦 Order Issue</option>
                <option value="DELIVERY_ISSUE">🛵 Delivery Issue</option>
                <option value="PAYMENT_ISSUE">💳 Payment Issue</option>
                <option value="RESTAURANT_ISSUE">🍽️ Restaurant Issue</option>
                <option value="ACCESSIBILITY">♿ Accessibility / Easy Order</option>
                <option value="OTHER">❓ Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1.5">Subject</label>
              <input
                type="text"
                required
                maxLength={120}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1.5">Details</label>
              <textarea
                rows={4}
                required
                minLength={20}
                maxLength={1000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide your order number, phone number, and describe what happened in detail..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none"
              />
              <div className="text-right text-[10px] text-gray-400 mt-1">{description.length}/1000</div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-extrabold text-base shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Support Ticket'
              )}
            </button>
          </form>
        )}
      </div>

      {/* ── FAQ Accordion ────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <HelpCircle className="w-7 h-7 text-brand-600" />
            Common Questions
          </h3>
        </div>

        {/* FAQ category filter */}
        <div className="flex gap-2 flex-wrap">
          {faqCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setFaqCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all ${
                faqCategory === cat ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filteredFaqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 mt-0.5 shrink-0">{faq.category}</span>
                  <span className="font-extrabold text-sm text-gray-900">{faq.q}</span>
                </div>
                {openFaq === idx
                  ? <ChevronUp className="w-4 h-4 text-brand-600 shrink-0 ml-3" />
                  : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-3" />
                }
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-4 text-sm font-medium text-gray-600 leading-relaxed border-t border-gray-100 pt-3 ml-0">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
