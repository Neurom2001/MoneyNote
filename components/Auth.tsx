import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/storageService';
import { Wallet, AlertTriangle, Eye, EyeOff, ShieldCheck, PieChart, TrendingUp, Heart, Copyright, Mail, Send, CheckCircle2, AlertCircle, User, Lock, ArrowRight } from 'lucide-react';

interface AuthProps {
  onLogin: (username: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Toast State
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  const features = [
    { icon: <TrendingUp size={20} />, text: "ဝင်ငွေ/ထွက်ငွေ စာရင်းများကို လွယ်ကူစွာ မှတ်သားနိုင်ခြင်း" },
    { icon: <PieChart size={20} />, text: "လစဉ် သုံးစွဲမှုများကို ဇယားများဖြင့် အသေးစိတ်ကြည့်ရှုနိုင်ခြင်း" },
    { icon: <Wallet size={20} />, text: "လျာထားချက် (Budget) သတ်မှတ်၍ ငွေကြေးစီမံနိုင်ခြင်း" },
    { icon: <ShieldCheck size={20} />, text: "လုံခြုံစိတ်ချရသော ကိုယ်ပိုင်အကောင့်စနစ်" },
  ];

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000); // 4 seconds
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username || !password) {
      setError('အသုံးပြုသူအမည်နှင့် စကားဝှက်ကို ဖြည့်သွင်းပါ။');
      setIsLoading(false);
      return;
    }

    if (!isLoginView && password.length < 6) {
        setError('စကားဝှက်သည် အနည်းဆုံး ၆ လုံး ရှိရပါမည်။');
        setIsLoading(false);
        return;
    }

    try {
      if (isLoginView) {
        const result = await loginUser(username, password);
        if (result.success) {
          showToast('ဝင်ရောက်ခြင်း အောင်မြင်ပါသည်', 'success');
          // Delay briefly so user sees the toast before switching views
          setTimeout(() => {
            onLogin(username);
          }, 1000);
        } else {
          setError('အကောင့်ဝင်မရပါ (သို့) စကားဝှက်မှားယွင်းနေပါသည်။');
          setIsLoading(false);
        }
      } else {
        const result = await registerUser(username, password);
        if (result.success) {
          // Clear fields
          setPassword('');
          // Switch to login view immediately
          setIsLoginView(true);
          // Show clear instruction
          showToast('အကောင့်ဖွင့်ခြင်း အောင်မြင်ပါသည်။ ကျေးဇူးပြု၍ စကားဝှက်ဖြင့် ပြန်လည်ဝင်ရောက်ပါ။', 'success');
          setIsLoading(false);
        } else {
          setError(result.error || 'အကောင့်ဖွင့်မရပါ။ ထပ်မံကြိုးစားကြည့်ပါ။');
          setIsLoading(false);
        }
      }
    } catch (err) {
      setError('System Error: ' + err);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col lg:flex-row text-white font-sans relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-2 fade-in duration-300 w-11/12 max-w-sm text-center">
          <div className={`flex flex-col items-center gap-2 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-md ${toast.type === 'success' ? 'bg-emerald-900/95 border-emerald-500 text-emerald-100' : 'bg-red-900/95 border-red-500 text-red-100'}`}>
            {toast.type === 'success' ? <CheckCircle2 size={32} className="mb-1" /> : <AlertCircle size={32} className="mb-1" />}
            <span className="text-sm font-bold">{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Branding & Features Section */}
      {/* Mobile: Order 2 (Bottom), Desktop: Order 1 (Left) */}
      <div className="lg:w-1/2 p-6 lg:p-12 flex flex-col justify-center bg-slate-900 border-t lg:border-t-0 lg:border-r border-dark-border relative overflow-hidden shrink-0 order-2 lg:order-1">
         {/* Background decoration */}
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20 lg:opacity-10">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50"></div>
         </div>

         <div className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left py-8 lg:py-0">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-primary to-emerald-600 p-3 rounded-2xl shadow-lg shadow-primary/20">
                    <Wallet className="text-slate-900 w-8 h-8 lg:w-10 lg:h-10" />
                </div>
                <div>
                    <h1 className="text-2xl lg:text-4xl font-bold tracking-tight text-white">MoneyNote</h1>
                    <p className="text-emerald-400 font-medium text-xs lg:text-base tracking-widest uppercase">Smart Finance Tracker</p>
                </div>
            </div>

            <p className="text-slate-300 text-base lg:text-lg mb-8 leading-relaxed max-w-md lg:max-w-none">
                သင့်ငွေကြေးစီမံခန့်ခွဲမှုအတွက် အကောင်းဆုံးလက်ထောက်။ <br className="hidden lg:block"/>
                မြန်မာဘာသာဖြင့် အသုံးပြုရလွယ်ကူပြီး တိကျသေချာသော စာရင်းအင်းစနစ်။
            </p>

            <div className="space-y-5 mb-8 w-full max-w-sm lg:max-w-none">
                {features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-4 text-slate-300 text-sm lg:text-base p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 hover:bg-slate-800/80 transition group">
                        <div className="text-primary bg-primary/10 p-2 rounded-lg group-hover:bg-primary group-hover:text-slate-900 transition duration-300 shrink-0">{feature.icon}</div>
                        <span className="font-medium">{feature.text}</span>
                    </div>
                ))}
            </div>

            {/* Footer matching Dashboard style */}
            <div className="mt-8 lg:mt-12 text-center lg:text-left flex flex-col items-center lg:items-start gap-1 w-full pt-6 border-t border-slate-800 lg:border-none">
                 <div className="flex items-center gap-1 font-bold text-slate-500 text-xs">
                     <Copyright size={12} /> {new Date().getFullYear()} MoneyNote. All rights reserved.
                 </div>
                 <div className="flex items-center gap-3 text-primary/80 text-xs">
                     <a href="mailto:bornaskraz@gmail.com" className="flex items-center gap-1 font-bold hover:underline hover:text-primary transition">
                        <Mail size={12} /> Email
                     </a>
                     <span className="text-slate-700">|</span>
                     <a href="https://t.me/swelmyel" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-bold hover:underline hover:text-primary transition">
                        <Send size={12} /> Telegram
                     </a>
                 </div>
                 <div className="mt-1 text-[10px] text-slate-600">
                     Made with <Heart size={10} className="inline text-red-500 mx-0.5" fill="currentColor"/> in Myanmar by @swelmyel
                 </div>
            </div>
         </div>
      </div>

      {/* Auth Form Section */}
      {/* Mobile: Order 1 (Top), Desktop: Order 2 (Right) */}
      <div className="lg:w-1/2 p-6 lg:p-12 flex items-center justify-center bg-slate-800/30 flex-grow order-1 lg:order-2 min-h-[60vh] lg:min-h-auto backdrop-blur-sm">
        <div className="w-full max-w-md space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            
            {/* Mobile Only Header */}
            <div className="lg:hidden text-center mb-6">
                 <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="bg-primary/20 p-2 rounded-lg">
                        <Wallet className="text-primary w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold text-white">MoneyNote</span>
                 </div>
            </div>

            <div className="text-center lg:text-left">
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                    {isLoginView ? 'ကြိုဆိုပါတယ်' : 'အကောင့်သစ်စတင်ရန်'}
                </h2>
                <p className="text-slate-400 text-sm lg:text-base">
                    {isLoginView ? 'သင့်ငွေကြေးများကို စီမံခန့်ခွဲရန် ဝင်ရောက်ပါ' : 'မိနစ်ပိုင်းအတွင်း အကောင့်ဖွင့်ပြီး စတင်လိုက်ပါ'}
                </p>
            </div>

            {/* Critical Warning Box */}
            <div className="bg-amber-900/20 border border-amber-600/30 rounded-xl p-4 flex gap-3 items-start text-left shadow-sm">
                <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                <div className="text-xs lg:text-sm text-amber-200/80 leading-relaxed">
                    <strong>သတိပြုရန်:</strong> ဤစနစ်သည် အီးမေးလ်မလိုဘဲ အသုံးပြုနိုင်သော်လည်း၊ 
                    <span className="text-amber-200 font-bold underline decoration-amber-500 mx-1">စကားဝှက်မေ့သွားပါက ပြန်ယူ၍ မရနိုင်ပါ။</span> 
                    ထို့ကြောင့် User Name နှင့် Password ကို သေချာစွာ မှတ်သားထားပါ။
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-in shake">
                    <AlertTriangle size={16} /> {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                        အသုံးပြုသူအမည် (User Name)
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User size={18} className="text-slate-500 group-focus-within:text-primary transition"/>
                        </div>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full pl-10 pr-4 py-3.5 bg-slate-900 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition placeholder-slate-600 shadow-sm"
                            placeholder="ဥပမာ - mgmg"
                            disabled={isLoading}
                            autoComplete="username"
                        />
                    </div>
                </div>
                
                <div>
                    <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                        စကားဝှက် (Password)
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock size={18} className="text-slate-500 group-focus-within:text-primary transition"/>
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-12 py-3.5 bg-slate-900 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition placeholder-slate-600 shadow-sm"
                            placeholder="အနည်းဆုံး ၆ လုံး"
                            disabled={isLoading}
                            autoComplete={isLoginView ? "current-password" : "new-password"}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition p-1"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>
                
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full bg-gradient-to-r from-emerald-600 to-primary hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-emerald-900/30 transition duration-300 transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 group ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isLoading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            {isLoginView ? 'ဝင်ရောက်မည်' : 'စာရင်းသွင်းမည်'}
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition" />
                        </>
                    )}
                </button>
            </form>

            <div className="text-center pt-6 border-t border-slate-700/50">
                <p className="text-slate-400 text-sm mb-2">
                    {isLoginView ? 'အကောင့်မရှိသေးဘူးလား?' : 'အကောင့်ရှိပြီးသားလား?'}
                </p>
                <button
                    onClick={() => {
                        setIsLoginView(!isLoginView);
                        setError('');
                        setToast(null);
                    }}
                    disabled={isLoading}
                    className="text-primary hover:text-emerald-300 font-bold transition flex items-center justify-center gap-1 mx-auto hover:underline decoration-2 underline-offset-4"
                >
                    {isLoginView 
                    ? 'အကောင့်သစ် ဖွင့်ပါ' 
                    : 'အကောင့်သို့ ဝင်ရောက်ပါ'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;