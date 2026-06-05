import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Zap, Scan, UploadCloud, Image as ImageIcon, Video, 
  FileText, Info, AlertTriangle, CheckCircle, RefreshCw, LogOut, Coins 
} from 'lucide-react';
import axios from 'axios';
import TokenModal from '../components/TokenModal';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const resp = await axios.get('http://127.0.0.1:5000/api/me', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setUser(resp.data);
      } catch (e) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 50 * 1024 * 1024) {
        setError('File too large. Maximum size is 50MB.');
        return;
      }
      setFile(selected);
      setError('');
      setResult(null);
      if (selected.type.startsWith('image')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(selected);
      } else {
        setPreview(null);
      }
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError('');
  };

  const analyzeFile = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    const form = new FormData();
    form.append('file', file);
    
    try {
      const resp = await axios.post('http://127.0.0.1:5000/predict', form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setResult(resp.data);
      setUser(prev => ({ ...prev, tokens: resp.data.tokens_remaining }));
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to analyze media');
      if (e.response?.status === 403) {
        setShowModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="min-h-screen bg-[#070b14] flex items-center justify-center"><div className="w-10 h-10 border-4 border-[#00ff88]/30 border-t-[#00ff88] rounded-full animate-spin"></div></div>;

  const isVideo = file?.type?.startsWith('video');

  return (
    <div className="h-full w-full overflow-auto bg-[#070b14] font-sans text-[#e8f5ee]">
      <div className="grid-bg fixed inset-0 pointer-events-none z-0"></div>

      {showModal && <TokenModal onClose={() => setShowModal(false)} onSuccess={(newTokens) => {
        setUser(prev => ({...prev, tokens: newTokens}));
        setShowModal(false);
      }} />}

      {/* Nav */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-[#00ff88]/10 bg-[#070b14]/85 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#00ff88] to-[#00aa55]">
            <ShieldCheck className="w-5 h-5 text-[#070b14]" />
          </div>
          <span className="text-lg font-bold tracking-tight font-mono text-[#e8f5ee]">FakeShield AI</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-[#e8f5ee]/50">
          <a href="#upload" className="hover:text-[#00ff88] transition-colors cursor-pointer">Analyze</a>
          <a href="#features" className="hover:text-[#00ff88] transition-colors cursor-pointer">Features</a>
          <a href="#how" className="hover:text-[#00ff88] transition-colors cursor-pointer">How It Works</a>
        </nav>
        
        <div className="flex items-center gap-3">
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/20 hover:bg-[#00ff88]/20 transition-all font-mono text-sm text-[#00ff88]">
            <Coins className="w-4 h-4" />
            <span className="font-bold">{user.tokens}</span>
          </button>
          
          <button onClick={handleLogout} className="flex items-center justify-center p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all text-white/70">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-16 pb-10 fade-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6 bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88]">
          <Zap className="w-3 h-3" /> <span>AI-Powered Detection Engine</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-5 text-[#e8f5ee]">
          Detect <span className="text-[#00ff88]">AI-Generated</span><br/>Content Instantly
        </h1>
        <p className="max-w-xl mx-auto text-base md:text-lg mb-8 text-[#e8f5ee]/55">
          Upload any image or video and our advanced detection algorithms will determine whether it was created by AI or captured in the real world.
        </p>
        <div className="flex justify-center gap-3 text-white/50 text-sm font-medium mb-6">
          <span>Image: -10 Tokens</span>
          <span>•</span>
          <span>Video: -25 Tokens</span>
        </div>
        <div className="flex justify-center gap-3">
          <a href="#upload" className="shimmer-btn px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 text-[#070b14] hover:opacity-90">
            <Scan className="w-4 h-4" /> Start Analyzing
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-xl fade-up-d1 bg-[#00ff88]/[0.04] border border-[#00ff88]/[0.08]">
            <div className="text-2xl font-bold font-mono text-[#00ff88]">97.8%</div>
            <div className="text-xs mt-1 text-[#e8f5ee]/45">Accuracy Rate</div>
          </div>
          <div className="text-center p-4 rounded-xl fade-up-d2 bg-[#00ff88]/[0.04] border border-[#00ff88]/[0.08]">
            <div className="text-2xl font-bold font-mono text-[#00ff88]">2.1M+</div>
            <div className="text-xs mt-1 text-[#e8f5ee]/45">Files Analyzed</div>
          </div>
          <div className="text-center p-4 rounded-xl fade-up-d3 bg-[#00ff88]/[0.04] border border-[#00ff88]/[0.08]">
            <div className="text-2xl font-bold font-mono text-[#00ff88]">&lt;2s</div>
            <div className="text-xs mt-1 text-[#e8f5ee]/45">Avg. Scan Time</div>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload" className="relative z-10 max-w-2xl mx-auto px-6 pb-16 fade-up-d2">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#e8f5ee]">Upload & Analyze</h2>
        
        {error && (
          <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-center text-sm font-medium text-red-400 flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {error}
          </div>
        )}

        {!file && !loading && !result ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="drop-zone scan-line relative rounded-2xl p-10 text-center cursor-pointer overflow-hidden bg-[#0a1220]/80 border-2 border-dashed border-[#00ff88]/30 hover:border-[#00ff88]/70 hover:bg-[#00ff88]/5 transition-all group shadow-2xl"
          >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />
            <div className="relative z-10">
              <div className="float-icon inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#00ff88]/10 border border-[#00ff88]/15 mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-7 h-7 text-[#00ff88]" />
              </div>
              <p className="text-base font-medium mb-1 text-[#e8f5ee]">Drop your file here or click to browse</p>
              <p className="text-sm text-[#e8f5ee]/40">Supports JPG, PNG, GIF, WEBP, MP4, WEBM • Max 50MB</p>
            </div>
          </div>
        ) : loading ? (
          <div className="mt-8 text-center bg-[#0a1220]/80 border border-white/10 rounded-2xl p-10 shadow-2xl">
            <div className="w-10 h-10 border-4 border-[#00ff88]/20 border-t-[#00ff88] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-medium font-mono text-[#00ff88]">Scanning content...</p>
            <p className="text-xs mt-1 text-[#e8f5ee]/40">Running multi-layer detection algorithms</p>
          </div>
        ) : result ? (
          <div className="mt-8">
            <div className="result-card glow-card rounded-2xl p-6 bg-[#0a1220]/80 border border-[#00ff88]/15 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-[#e8f5ee]">Analysis Result</h3>
              </div>
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 border-2 
                  ${result.prediction === 'Fake' ? 'bg-red-500/10 border-red-500' : 'bg-[#00ff88]/10 border-[#00ff88]'}`}>
                  {result.prediction === 'Fake' ? <AlertTriangle className="w-7 h-7 text-red-500" /> : <CheckCircle className="w-7 h-7 text-[#00ff88]" />}
                </div>
                <div className={`text-2xl font-bold mb-1 font-mono uppercase ${result.prediction === 'Fake' ? 'text-red-500' : 'text-[#00ff88]'}`}>
                  {result.prediction === 'Fake' ? 'AI-Generated' : 'Likely Authentic'}
                </div>
                <div className="text-sm text-[#e8f5ee]/50">Confidence: <span className={`font-mono font-bold ${result.prediction === 'Fake' ? 'text-red-500' : 'text-[#00ff88]'}`}>{(result.confidence * 100).toFixed(1)}%</span></div>
              </div>
              <div className="pt-4 text-center border-t border-[#00ff88]/10 flex flex-col items-center">
                 <p className="text-sm text-white/40 mb-4">Cost: {result.cost} Tokens • Remaining: {result.tokens_remaining}</p>
                 <button onClick={clearFile} className="text-sm font-medium px-5 py-2 rounded-lg text-[#00ff88] bg-[#00ff88]/10 border border-[#00ff88]/15 hover:bg-[#00ff88]/20 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5" /> Analyze Another
                 </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#0a1220]/80 border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
            <div className="flex flex-col items-center gap-3">
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-48 rounded-xl border border-[#00ff88]/15 object-contain" />
              ) : (
                <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-[#00ff88]/10 border border-[#00ff88]/15">
                  <Video className="w-6 h-6 text-[#00ff88]" />
                </div>
              )}
              <p className="font-medium text-sm text-[#e8f5ee]">{file.name}</p>
              <p className="text-xs text-[#e8f5ee]/40">{(file.size / (1024*1024)).toFixed(2)} MB</p>
              <div className="flex gap-4 mt-4 w-full justify-center">
                <button onClick={clearFile} className="px-5 py-2 rounded-lg text-xs text-red-400 bg-red-400/10 border border-red-400/20 hover:bg-red-400/20">Remove</button>
                <button onClick={analyzeFile} className="shimmer-btn px-6 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 text-[#070b14]">
                  <Scan className="w-4 h-4" /> Analyze
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold mb-8 text-center fade-up text-[#e8f5ee]">Detection Capabilities</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="feature-card p-5 rounded-xl fade-up-d1 bg-[#0a1220]/60 border border-[#00ff88]/10 hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-[#00ff88]/10">
              <ImageIcon className="w-[18px] h-[18px] text-[#00ff88]" />
            </div>
            <h3 className="font-semibold mb-1.5 text-[#e8f5ee]">Image Analysis</h3>
            <p className="text-sm leading-relaxed text-[#e8f5ee]/45">Detect AI-generated images from DALL·E, Midjourney, Stable Diffusion, and more through artifact analysis.</p>
          </div>
          <div className="feature-card p-5 rounded-xl fade-up-d2 bg-[#0a1220]/60 border border-[#00ff88]/10 hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-[#00ff88]/10">
              <Video className="w-[18px] h-[18px] text-[#00ff88]" />
            </div>
            <h3 className="font-semibold mb-1.5 text-[#e8f5ee]">Video Detection</h3>
            <p className="text-sm leading-relaxed text-[#e8f5ee]/45">Frame-by-frame analysis to spot deepfakes, AI-generated clips, and synthetic video content.</p>
          </div>
          <div className="feature-card p-5 rounded-xl fade-up-d3 bg-[#0a1220]/60 border border-[#00ff88]/10 hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-[#00ff88]/10">
              <FileText className="w-[18px] h-[18px] text-[#00ff88]" />
            </div>
            <h3 className="font-semibold mb-1.5 text-[#e8f5ee]">Detailed Reports</h3>
            <p className="text-sm leading-relaxed text-[#e8f5ee]/45">Get comprehensive breakdowns with confidence scores, artifact maps, and metadata forensics.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="relative z-10 max-w-3xl mx-auto px-6 pb-16">
         <h2 className="text-2xl font-bold mb-8 text-center fade-up text-[#e8f5ee]">How It Works</h2>
         <div className="space-y-4">
           {[{
             num: '01', title: 'Upload Content', desc: 'Drag & drop or browse for any image or video file you want to verify.'
           }, {
             num: '02', title: 'AI Scans & Analyzes', desc: 'Our neural network examines pixel patterns, compression artifacts, and metadata signatures.'
           }, {
             num: '03', title: 'Get Your Verdict', desc: 'Receive a report with confidence percentage and token deduction breakdown.'
           }].map((step, i) => (
             <div key={i} className={`flex items-start gap-4 p-5 rounded-xl fade-up-d${i+1} bg-[#0a1220]/60 border border-[#00ff88]/10`}>
                <div className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-sm bg-[#00ff88]/15 text-[#00ff88] font-mono">
                  {step.num}
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-[#e8f5ee]">{step.title}</h3>
                  <p className="text-sm text-[#e8f5ee]/45">{step.desc}</p>
                </div>
             </div>
           ))}
         </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-6 text-center border-t border-[#00ff88]/10">
        <p className="text-xs text-[#e8f5ee]/25">© 2026 FakeShield AI — AI Content Detection Platform</p>
      </footer>

    </div>
  );
}
