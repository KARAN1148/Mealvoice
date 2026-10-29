import React, { useState } from 'react';
import { PhoneCall, PhoneOff, UserCheck, RotateCcw, Plus, History, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
import { useDemoMode } from '../../context/DemoModeContext';
import { apiRequest } from '../../api/client';

interface CustomerLookupResult {
  exists: boolean;
  customer?: {
    id: string;
    name: string;
    phone: string;
    email: string;
    addresses: Array<{ id: string; street: string; landmark?: string }>;
    lastOrder?: any;
    recentOrders?: any[];
  };
}

interface IncomingCallModalProps {
  onSelectCustomerForOrder?: (customer: any) => void;
  onRepeatLastOrder?: (customer: any, lastOrder: any) => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  onSelectCustomerForOrder,
  onRepeatLastOrder
}) => {
  const { activeCall, endIncomingCall, showNotification } = useDemoMode();
  const [callState, setCallState] = useState<'RINGING' | 'CONNECTED' | 'ENDED'>('RINGING');
  const [customerData, setCustomerData] = useState<CustomerLookupResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // New Customer Form State
  const [newCustName, setNewCustName] = useState('');
  const [newCustStreet, setNewCustStreet] = useState('');
  const [newCustLandmark, setNewCustLandmark] = useState('');

  if (!activeCall) return null;

  const handleAnswerCall = async () => {
    setCallState('CONNECTED');
    setIsLoading(true);

    try {
      // Lookup customer by phone in backend database
      const res = await apiRequest<CustomerLookupResult>(
        `/call-orders/customer-lookup?phone=${encodeURIComponent(activeCall.phoneNumber)}`
      );
      setCustomerData(res);
    } catch (err) {
      console.error('Customer lookup failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustStreet) return;

    try {
      const res = await apiRequest<{ customer: any }>('/call-orders/customer', {
        method: 'POST',
        body: JSON.stringify({
          name: newCustName,
          phone: activeCall.phoneNumber,
          street: newCustStreet,
          landmark: newCustLandmark
        })
      });

      showNotification(`Created customer profile for ${res.customer.name}`);
      setCustomerData({ exists: true, customer: res.customer });
      if (onSelectCustomerForOrder) {
        onSelectCustomerForOrder(res.customer);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border-4 border-emerald-500 animate-in zoom-in-95">
        {/* Ringing Banner */}
        {callState === 'RINGING' && (
          <div className="text-center py-6">
            <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce border-4 border-emerald-300">
              <PhoneCall className="w-12 h-12" />
            </div>
            <span className="text-xs font-extrabold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full uppercase tracking-wider">
              Incoming MealVoice Phone Order Call
            </span>
            <h2 className="text-3xl font-black text-gray-900 mt-2">{activeCall.phoneNumber}</h2>
            <p className="text-sm font-medium text-gray-500 mt-1">
              Caller: {activeCall.customerName || 'Standard Phone User'}
            </p>

            <div className="flex items-center justify-center gap-6 mt-8">
              <button
                onClick={endIncomingCall}
                className="px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black flex items-center gap-2 shadow-lg"
              >
                <PhoneOff className="w-5 h-5" />
                <span>Reject</span>
              </button>

              <button
                onClick={handleAnswerCall}
                className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black flex items-center gap-2 shadow-xl animate-pulse-glow"
              >
                <PhoneCall className="w-5 h-5" />
                <span>[Answer Call]</span>
              </button>
            </div>
          </div>
        )}

        {/* Connected Call Agent Interface */}
        {callState === 'CONNECTED' && (
          <div>
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <PhoneCall className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-lg text-gray-900">{activeCall.phoneNumber}</h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      LIVE CALL
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Agent: Priya Sharma (Call Center)</p>
                </div>
              </div>

              <button
                onClick={endIncomingCall}
                className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200 font-bold text-xs hover:bg-red-100 flex items-center gap-1"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call</span>
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-10 text-gray-500 font-medium">
                Searching customer phone record in database...
              </div>
            ) : customerData?.exists && customerData.customer ? (
              /* Existing Customer Details */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase text-emerald-800 flex items-center gap-1">
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      Existing Customer Found
                    </span>
                    <span className="text-xs font-bold text-gray-500">
                      Language: {customerData.customer.email.includes('phone') ? 'Kannada/English' : 'English'}
                    </span>
                  </div>
                  <h4 className="text-xl font-black text-gray-900">{customerData.customer.name}</h4>

                  {customerData.customer.addresses.length > 0 && (
                    <p className="text-sm font-semibold text-gray-700 mt-1 flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{customerData.customer.addresses[0].street}</span>
                    </p>
                  )}
                </div>

                {/* Last Order Quick Repeat */}
                {customerData.customer.lastOrder && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-amber-800 flex items-center gap-1">
                        <History className="w-4 h-4 text-amber-600" />
                        Previous Order ({customerData.customer.lastOrder.orderNumber})
                      </span>
                      <span className="text-xs font-extrabold text-gray-900">
                        ₹{customerData.customer.lastOrder.totalAmount}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-gray-900">
                      {customerData.customer.lastOrder.restaurant?.name || 'MealVoice Kitchen'}
                    </p>

                    <div className="text-xs text-gray-600 mt-1">
                      {customerData.customer.lastOrder.items?.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>

                    <button
                      onClick={() => {
                        if (onRepeatLastOrder && customerData.customer) {
                          onRepeatLastOrder(customerData.customer, customerData.customer.lastOrder);
                          endIncomingCall();
                        }
                      }}
                      className="mt-3 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs flex items-center justify-center gap-2 shadow-sm"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>[Repeat Last Order Instantly]</span>
                    </button>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      if (onSelectCustomerForOrder && customerData.customer) {
                        onSelectCustomerForOrder(customerData.customer);
                        endIncomingCall();
                      }
                    }}
                    className="flex-1 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Phone Order</span>
                  </button>
                </div>
              </div>
            ) : (
              /* New Customer Registration Form */
              <form onSubmit={handleCreateNewCustomer} className="space-y-4">
                <div className="p-3 rounded-xl bg-blue-50 text-blue-900 text-xs font-bold border border-blue-200">
                  First-time caller detected! Create a caller profile to take their order.
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1">
                    Customer Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Kumar"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1">
                    Delivery Street Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 15, 2nd Main Road, Jayanagar"
                    value={newCustStreet}
                    onChange={(e) => setNewCustStreet(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1">
                    Landmark / Directions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near Water Tank"
                    value={newCustLandmark}
                    onChange={(e) => setNewCustLandmark(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Save Customer & Create Order</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomingCallModal;
