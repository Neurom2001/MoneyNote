
import React, { useState, useEffect } from 'react';
import { loginUser, registerUser } from '../services/storageService';
import { Wallet, AlertTriangle, Eye, EyeOff, ShieldCheck, PieChart, TrendingUp, Heart, Copyright, Mail, Send, CheckCircle2, AlertCircle, User, Lock, ArrowRight } from 'lucide-react';
import { TRANSLATIONS, Language } from '../utils/translations';

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
  
  // Use default language or from local storage, but remove selector UI
  const [language] = useState<Language>((localStorage.getItem('language') as Language) || 'my');
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  const t = TRANSLATIONS[language];

  const features = [
    { icon: <TrendingUp size={14} />, text: t.feat1 },
    { icon: <PieChart size={14} />, text: t.feat2 },
    { icon: <Wallet size={14} />, text: t.feat3 },
    { icon: <ShieldCheck size={14} />, text: t.feat4 },
  ];

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000); 
  };

  useEffect(() => {
    if (isLoginView) {
      const regSuccess = localStorage.getItem('registrationSuccess');
      if (regSuccess === 'true') {
        showToast(language === 'my' 
            ? 'အကောင့်ဖွင့်ခြင်း အောင်မြင်ပါသည်။ ကျေးဇူးပြု၍ စကားဝှက်ဖြင့် ပြန်လည်ဝင်ရောက်ပါ။'
            : 'Registration successful. Please login.', 
            'success');
        localStorage.removeItem('registrationSuccess');
      }
    }
  }, [isLoginView, language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username || !password) {
      setError(language === 'my' ? 'အသုံးပြုသူအမည်နှင့် စကားဝှက်ကို ဖြည့်သွင်းပါ။' : 'Please fill in username and password.');
      setIsLoading(false);
      return;
    }

    if (!isLoginView && password.length < 6) {
        setError(language === 'my' ? 'စကားဝှက်သည် အနည်းဆုံး ၆ လုံး ရှိရပါမည်။' : 'Password must be at least 6 characters.');
        setIsLoading(false);
        return;
    }

    try {
      if (isLoginView) {
        localStorage.setItem('loginSuccess', 'true');
        const result = await loginUser(username, password);
        if (result.success) {
           // Success handling handled by App.tsx
        } else {
          localStorage.removeItem('loginSuccess');
          setError(language === 'my' ? 'အကောင့်ဝင်မရပါ (သို့) စကားဝှက်မှားယွင်းနေပါသည်။' : 'Login failed or invalid credentials.');
          setIsLoading(false);
        }
      } else {
        const result = await registerUser(username, password);
        if (result.success) {
          setPassword('');
          localStorage.setItem('registrationSuccess', 'true');
          setIsLoginView(true);
          setIsLoading(false);
        } else {
          setError(result.error || (language === 'my' ? 'အကောင့်ဖွင့်မရပါ။ ထပ်မံကြိုးစားကြည့်ပါ။' : 'Registration failed. Please try again.'));
          setIsLoading(false);
        }
      }
    } catch (err) {
      localStorage.removeItem('loginSuccess');
      setError('System Error: ' + err);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-dark-bg text-white font-sans flex flex-col lg:flex-row min-h-screen lg:h-screen lg:overflow-hidden">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-2 fade-in duration-300 w-11/12 max-w-sm text-center">
          <div className={`flex flex-col items-center gap-2 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-md ${toast.type === 'success' ? 'bg-emerald-900/95 border-emerald-500 text-emerald-100' : 'bg-red-900/95 border-red-500 text-red-100'}`}>
            {toast.type === 'success' ? <CheckCircle2 size={32} className="mb-1" /> : <AlertCircle size={32} className="mb-1" />}
            <span className="text-base font-bold">{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Branding Section */}
      {/* Flex container optimized for desktop centering */}
      <div className="w-full lg:w-1/2 order-2 lg:order-1 bg-slate-900 border-t lg:border-t-0 lg:border-r border-dark-border relative flex flex-col z-10 lg:h-full lg:justify-center">
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20 lg:opacity-10">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50"></div>
         </div>

         <div className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left w-full p-8 lg:p-16 justify-center">
            <div className="flex items-center gap-3 mb-6 lg:mb-8">
                <div className="bg-gradient-to-br from-primary to-emerald-600 p-2.5 rounded-xl shadow-lg shadow-primary/20">
                    <Wallet className="text-slate-900 w-8 h-8 lg:w-9 lg:h-9" />
                </div>
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">{t.appName}</h1>
                    <p className="text-emerald-400 font-medium text-xs tracking-widest uppercase mt-0.5">{t.appDesc}</p>
                </div>
            </div>

            <p className="text-slate-300 text-sm mb-8 leading-relaxed max-w-md hidden lg:block">
                {language === 'my' ? (
                  <>သင့်ငွေကြေးစီမံခန့်ခွဲမှုအတွက် အကောင်းဆုံးလက်ထောက်။ <br/>မြန်မာဘာသာဖြင့် အသုံးပြုရလွယ်ကူပြီး တိကျသေချာသော စာရင်းအင်းစနစ်။</>
                ) : language === 'ja' ? (
                  <>あなたの家計管理のための最高のパートナー。<br/>使いやすく、正確な財務追跡システム。</>
                ) : (
                  <>Your best assistant for financial management. <br/>Easy to use and accurate tracking system.</>
                )}
            </p>

            <div className="space-y-4 mb-auto w-full max-w-sm hidden lg:block">
                {features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-4 text-slate-300 text-sm p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 hover:bg-slate-800/80 transition group">
                        <div className="text-primary bg-primary/10 p-2 rounded-lg group-hover:bg-primary group-hover:text-slate-900 transition duration-300 shrink-0">{feature.icon}</div>
                        <span className="font-medium">{feature.text}</span>
                    </div>
                ))}
            </div>

            <div className="text-center lg:text-left flex flex-col items-center lg:items-start gap-2 w-full pt-10 border-t border-slate-800 lg:border-none mt-auto lg:mt-0">
                 <div className="flex items-center gap-1 font-bold text-slate-500 text-xs">
                     <Copyright size={14} /> {new Date().getFullYear()} {t.appName}. All rights reserved.
                 </div>
                 <div className="flex items-center gap-4 text-primary/80 text-xs">
                     <a href="mailto:bornaskraz@gmail.com" className="flex items-center gap-1.5 font-bold hover:underline hover:text-primary transition">
                        <Mail size={14} /> Email
                     </a>
                     <span className="text-slate-700">|</span>
                     <a href="https://t.me/swelmyel" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 font-bold hover:underline hover:text-primary transition">
                        <Send size={14} /> Telegram
                     </a>
                 </div>
                 <div className="mt-1 text-xs text-slate-600">
                     Made with <Heart size={12} className="inline text-red-500 mx-0.5" fill="currentColor"/> in Myanmar by @swelmyel
                 </div>
            </div>
         </div>
      </div>

      {/* Auth Form Section */}
      <div className="w-full lg:w-1/2 order-1 lg:order-2 bg-slate-800/30 backdrop-blur-sm relative z-20 lg:h-full flex flex-col overflow-y-auto">
        <div className="w-full max-w-md mx-auto p-6 lg:p-16 py-12 my-auto">
            
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-6">
                 <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="bg-primary/20 p-2.5 rounded-lg">
                        <Wallet className="text-primary w-8 h-8" />
                    </div>
                    <span className="text-2xl font-bold text-white">{t.appName}</span>
                 </div>
            </div>

            <div className="text-center lg:text-left">
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                    {isLoginView ? t.loginTitle : t.registerTitle}
                </h2>
                <p className="text-slate-400 text-sm">
                    {isLoginView ? t.loginSubtitle : t.registerSubtitle}
                </p>
            </div>

            <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-4 flex gap-3 items-start text-left shadow-sm mt-6">
                <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <div className="text-xs text-amber-200/80 leading-relaxed">
                    <strong>{t.warningTitle}</strong> {t.warningText}
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm flex items-center gap-3 animate-in shake mt-4">
                    <AlertTriangle size={18} /> {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5 mt-6">
                <div>
                    <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                        {t.username}
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User size={20} className="text-slate-500 group-focus-within:text-primary transition"/>
                        </div>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-slate-700 text-white text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition placeholder-slate-600 shadow-sm"
                            placeholder={t.usernamePlaceholder}
                            disabled={isLoading}
                            autoComplete="username"
                        />
                    </div>
                </div>
                
                <div>
                    <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                        {t.password}
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock size={20} className="text-slate-500 group-focus-within:text-primary transition"/>
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-12 pr-12 py-3.5 bg-slate-900 border border-slate-700 text-white text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition placeholder-slate-600 shadow-sm"
                            placeholder={t.passwordPlaceholder}
                            disabled={isLoading}
                            autoComplete={isLoginView ? "current-password" : "new-password"}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition p-1"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
                
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full bg-gradient-to-r from-emerald-600 to-primary hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-900/30 transition duration-300 transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 group text-sm mt-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            {isLoginView ? t.loginBtn : t.registerBtn}
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition" />
                        </>
                    )}
                </button>
            </form>

            <div className="text-center pt-8 border-t border-slate-700/50 mt-6">
                <p className="text-slate-400 text-sm mb-3">
                    {isLoginView ? t.noAccount : t.hasAccount}
                </p>
                <button
                    onClick={() => {
                        setIsLoginView(!isLoginView);
                        setError('');
                        setToast(null);
                    }}
                    disabled={isLoading}
                    className="text-primary hover:text-emerald-300 font-bold transition flex items-center justify-center gap-1 mx-auto hover:underline decoration-2 underline-offset-4 text-sm"
                >
                    {isLoginView 
                    ? t.createAccount 
                    : t.signIn}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
