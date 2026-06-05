import React from 'react';
import { X, Zap, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const TokenModal = ({ onClose, onSuccess }) => {
  const plans = [
    { tokens: 100, price: '199₹', popular: false },
    { tokens: 500, price: '399₹', popular: true },
    { tokens: 1000, price: '899₹', popular: false },
  ];

  const handleBuy = async (amount) => {
    try {
      const resp = await axios.post('https://fakeshield-ai-0jvr.onrender.com/api/buy', { tokens: amount }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      onSuccess(resp.data.new_tokens);
    } catch (e) {
      alert("Failed to buy tokens. Is your backend running?");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 fade-up">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#00ff88]/20 bg-[#070b14] p-6 shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Upgrade Your Tokens</h2>
          <p className="text-white/50 text-sm">Get more tokens to continue scanning media.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div 
              key={plan.tokens} 
              className={`relative flex flex-col rounded-xl border p-5 transition-all hover:-translate-y-1 ${
                plan.popular 
                  ? 'border-[#00ff88]/50 bg-[#00ff88]/5' 
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#00ff88] px-3 py-1 text-[10px] font-bold text-black">
                  MOST POPULAR
                </div>
              )}
              
              <div className="mb-4 flex-1">
                <div className="text-white/70 text-sm font-medium mb-1">Tokens</div>
                <div className="text-3xl font-bold text-[#00ff88] font-mono mb-4">{plan.tokens}</div>
                
                <div className="flex items-center gap-2 text-sm text-white/70 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00ff88]" /> Instant access
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <CheckCircle2 className="h-4 w-4 text-[#00ff88]" /> Never expire
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="text-2xl font-bold mb-3">{plan.price}</div>
                <button 
                  onClick={() => handleBuy(plan.tokens)}
                  className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-[#00ff88] text-black hover:bg-[#00cc6a]'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TokenModal;
