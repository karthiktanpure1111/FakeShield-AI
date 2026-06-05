import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { ShieldCheck, Mail, Lock, ArrowRight, Zap, Info } from 'lucide-react';
import axios from 'axios';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/api/login' : '/api/register';
    try {
      const resp = await axios.post(`http://127.0.0.1:5000${endpoint}`, { email, password });
      localStorage.setItem('token', resp.data.token);
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const payload = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      const resp = await axios.post('http://127.0.0.1:5000/api/google-login', { email: payload.email });
      localStorage.setItem('token', resp.data.token);
      window.location.href = '/';
    } catch (err) {
      setError('Google Login failed via backend');
    }
  };

  return (
    <div className="h-full w-full overflow-auto bg-[#070b14] font-sans text-[#e8f5ee] flex flex-col pt-10">
      <div className="grid-bg fixed inset-0 pointer-events-none z-0"></div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 fade-up relative z-10 w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
           <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#00ff88] to-[#00aa55] mb-4 shadow-[0_0_20px_rgba(0,255,136,0.2)]">
             <ShieldCheck className="h-8 w-8 text-[#070b14]" />
           </div>
           <h1 className="text-4xl font-extrabold tracking-tight mb-2 font-mono">FakeShield<span className="text-[#00ff88]">AI</span></h1>
           <p className="text-white/50 text-base max-w-sm mx-auto">Upload and secure your media with deepfake detection capabilities.</p>
        </div>

        {/* Form Box */}
        <div className="w-full max-w-[400px] rounded-2xl border border-[#00ff88]/15 bg-[#0a1220]/80 p-8 backdrop-blur-xl shadow-2xl relative">
          {error && (
            <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-center text-sm font-medium text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 h-5 w-5 text-white/30" />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#070b14]/50 py-3 pl-12 pr-4 text-sm text-white placeholder-white/40 focus:border-[#00ff88] focus:outline-none focus:ring-1 focus:ring-[#00ff88] transition-all"
                />
              </div>
            </div>
            <div>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 h-5 w-5 text-white/30" />
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#070b14]/50 py-3 pl-12 pr-4 text-sm text-white placeholder-white/40 focus:border-[#00ff88] focus:outline-none focus:ring-1 focus:ring-[#00ff88] transition-all"
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="w-full rounded-xl shimmer-btn py-3 text-sm font-bold text-black flex items-center justify-center gap-2 mt-2"
            >
              {isLogin ? 'Sign In to Account' : 'Create Free Account'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-sm text-white/30">
            <div className="h-px flex-1 bg-white/10"></div>
            OR LOGIN WITH
            <div className="h-px flex-1 bg-white/10"></div>
          </div>

          <div className="flex justify-center mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Login Failed')}
              theme="filled_black"
              shape="rectangular"
              text="continue_with"
            />
          </div>

          <p className="text-center text-sm text-white/50 pt-2 border-t border-white/5">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button 
              onClick={() => {setIsLogin(!isLogin); setError('');}}
              className="font-semibold text-[#00ff88] hover:underline"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>

        <div className="mt-8 max-w-md w-full">
           <div className="p-4 rounded-xl text-center bg-[#00ff88]/[0.06] border border-[#00ff88]/15">
             <p className="text-xs text-[#00ff88] font-medium flex items-center justify-center gap-1.5 focus">
               <Zap className="w-3.5 h-3.5" /> Start for free! All new users immediately receive 50 Tokens upon registration.
             </p>
           </div>
        </div>

      </div>
    </div>
  );
}
