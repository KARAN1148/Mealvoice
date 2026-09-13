import React, { useState } from 'react';
import { PhoneCall, HelpCircle, MessageSquare, CheckCircle2, Sparkles } from 'lucide-react';
import { apiRequest } from '../api/client';
import { useDemoMode } from '../context/DemoModeContext';

export const SupportPage: React.FC = () => {
  const [category, setCategory] = useState('ORDER_ISSUE');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [ticketNo, setTicketNo] = useState('');
  const { showNotification } = useDemoMode();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest<any>('/support/ticket', {
        method: 'POST',
        body: JSON.stringify({ category, subject, description })
      });
      setTicketNo(res.ticket.ticketNo);
      setSubmitted(true);
      showNotification(`Support ticket ${res.ticket.ticketNo} created!`);
    } catch (err: any) {
      alert(err.message || 'Ticket creation failed');
    }
  };

  const faqs = [
    { q: 'How do I track my phone order?', a: 'Call our 24/7 support line 1800-MEALVOICE to track any phone-placed order by providing your name and phone number.' },
    { q: 'Can I cancel an order?', a: 'Orders can be cancelled within 5 minutes of placement. Call us or use the cancel button in your order tracking page.' },
    { q: 'What if my food is late?', a: 'If your delivery is past the estimated time, call 1800-MEALVOICE for an immediate status update and compensation options.' },
    { q: 'How does Easy Order mode work?', a: 'Easy Order is a simplified step-by-step ordering interface with large buttons and voice assistance for accessibility.' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900">MealVoice Support</h1>
        <p className="text-gray-600 font-semibold">We're here to help — by app, ticket, or phone call.</p>
      </div>

      {/* Quick Call Banner */}
      <div className="bg-emerald-600 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black">Talk to a Human Support Agent</h2>
          <p className="text-emerald-100 font-medium text-sm mt-1">
            Available 24/7 — No smartphone required. Any type of phone works.
          </p>
        </div>
        <a
          href="tel:1800-472-6326"
          className="px-8 py-4 rounded-2xl bg-white text-emerald-900 font-black text-base shadow-xl flex items-center gap-3 hover:bg-emerald-50 transition-all shrink-0"
        >
          <PhoneCall className="w-6 h-6 text-emerald-600 animate-pulse" />
          <span>1800-MEALVOICE</span>
        </a>
      </div>

      {/* Support Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: '📦', label: 'Order Issue', cat: 'ORDER_ISSUE', desc: 'Wrong item, missing food, order not delivered' },
          { icon: '🛵', label: 'Delivery Issue', cat: 'DELIVERY_ISSUE', desc: 'Rider late, delivery address problem' },
          { icon: '💳', label: 'Payment Issue', cat: 'PAYMENT_ISSUE', desc: 'Charge problem, refund request' },
        ].map((opt) => (
          <button
            key={opt.cat}
            onClick={() => { setCategory(opt.cat); document.getElementById('ticket-form')?.scrollIntoView({ behavior: 'smooth' }); }}
            className={`p-5 rounded-2xl border-2 text-left font-bold transition-all hover:scale-105 ${category === opt.cat ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
          >
            <div className="text-3xl mb-2">{opt.icon}</div>
            <div className="text-base font-black text-gray-900">{opt.label}</div>
            <div className="text-xs text-gray-500 mt-1">{opt.desc}</div>
          </button>
        ))}
      </div>

      {/* Support Ticket Form */}
      <div id="ticket-form" className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xl space-y-5">
        <h3 className="font-extrabold text-xl text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-brand-600" />
          <span>Report an Issue</span>
        </h3>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="text-xl font-black text-emerald-900">Ticket Created!</h4>
            <p className="text-sm font-bold text-emerald-800">Ticket ID: <strong>{ticketNo}</strong></p>
            <p className="text-xs text-emerald-700">Our team will respond within 2-4 hours. You can also call 1800-MEAL for immediate assistance.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1">Issue Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-bold focus:ring-2 focus:ring-brand-500">
                <option value="ORDER_ISSUE">Order Issue</option>
                <option value="DELIVERY_ISSUE">Delivery Issue</option>
                <option value="PAYMENT_ISSUE">Payment Issue</option>
                <option value="RESTAURANT_ISSUE">Restaurant Issue</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1">Subject</label>
              <input type="text" required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief description of your issue" className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1">Details</label>
              <textarea rows={4} required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Please describe your issue in detail..." className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold focus:ring-2 focus:ring-brand-500" />
            </div>
            <button type="submit" className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-base shadow-lg">
              Submit Support Ticket
            </button>
          </form>
        )}
      </div>

      {/* FAQ */}
      <div className="space-y-4">
        <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <HelpCircle className="w-7 h-7 text-brand-600" /> Common Questions
        </h3>
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h4 className="font-extrabold text-base text-gray-900">{faq.q}</h4>
            <p className="text-sm font-medium text-gray-600 mt-2 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupportPage;
