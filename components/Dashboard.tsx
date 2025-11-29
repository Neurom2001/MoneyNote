import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { 
  getTransactions, saveTransaction, deleteTransaction, updateTransaction, logoutUser,
  getBudgetSettings, saveBudgetSettings, deleteBudgetSettings 
} from '../services/storageService';
import { supabase } from '../services/supabaseClient';
import { 
  LogOut, Plus, Trash2, Home, Download, Loader2, ArrowUpDown, ArrowUp, ArrowDown, 
  X, Edit, Save, CheckCircle2, AlertCircle, Search, PieChart, BarChart3, LineChart as LineChartIcon,
  Utensils, Bus, ShoppingBag, Stethoscope, Zap, Gift, Smartphone, Briefcase, GraduationCap, CircleDollarSign,
  Banknote, TrendingUp, Wallet, ArrowLeftRight, Heart, Copyright, Filter, Lock, HelpCircle, Mail, Send, Settings, Target, AlertTriangle, Globe, SlidersHorizontal, Check, Languages, Coins
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area 
} from 'recharts';
import { TRANSLATIONS, Language } from '../utils/translations';

interface DashboardProps {
  currentUser: string;
  onLogout: () => void;
}

type SortKey = 'date' | 'label' | 'amount';
type SortDirection = 'asc' | 'desc';
type ChartType = 'bar' | 'line' | 'area';

const CURRENCIES = [
  { id: 'MMK', label: 'MMK', symbol: 'ကျပ်' },
  { id: 'USD', label: 'USD', symbol: '$' },
  { id: 'THB', label: 'THB', symbol: '฿' },
  { id: 'SGD', label: 'SGD', symbol: 'S$' },
];

const LANGUAGES = [
  { code: 'my', label: 'Myanmar' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: 'Japanese' },
];

const Dashboard: React.FC<DashboardProps> = ({ currentUser, onLogout }) => {
  // --- State ---
  const [language, setLanguage] = useState<Language>((localStorage.getItem('language') as Language) || 'my');
  const t = TRANSLATIONS[language];
  
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  // Helper function to generate categories based on current language
  const getExpenseCategories = () => [
    { label: t.cat_food, icon: <Utensils size={20} /> },
    { label: t.cat_transport, icon: <Bus size={20} /> },
    { label: t.cat_shopping, icon: <ShoppingBag size={20} /> },
    { label: t.cat_health, icon: <Stethoscope size={20} /> },
    { label: t.cat_bill, icon: <Zap size={20} /> },
    { label: t.cat_phone, icon: <Smartphone size={20} /> },
    { label: t.cat_gift, icon: <Gift size={20} /> },
    { label: t.cat_work, icon: <Briefcase size={20} /> },
    { label: t.cat_education, icon: <GraduationCap size={20} /> },
    { label: t.cat_general, icon: <CircleDollarSign size={20} /> },
  ];

  const getIncomeCategories = () => [
    { label: t.cat_salary, icon: <Banknote size={20} /> },
    { label: t.cat_bonus, icon: <TrendingUp size={20} /> },
    { label: t.cat_sales, icon: <ShoppingBag size={20} /> },
    { label: t.cat_pocket, icon: <Wallet size={20} /> },
    { label: t.cat_refund, icon: <ArrowLeftRight size={20} /> },
    { label: t.cat_general, icon: <CircleDollarSign size={20} /> },
  ];

  // --- Helpers ---
  const getLocalDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getLocalMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const currentMonth = getLocalMonth();
  const [filterDate, setFilterDate] = useState(currentMonth); 
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Feature 1: Search
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Feature 3: Budget & Custom Thresholds
  const [budgetLimit, setBudgetLimit] = useState<number>(0);
  const [warningPercent, setWarningPercent] = useState<number>(80); // Default 80%
  const [dangerPercent, setDangerPercent] = useState<number>(100); // Default 100%
  
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [tempBudget, setTempBudget] = useState('');
  const [tempWarning, setTempWarning] = useState(80);
  const [tempDanger, setTempDanger] = useState(100);

  // Settings & Currency
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'ကျပ်');
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  
  // New Modals for Settings
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Selection & Editing
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Confirmation Modals
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  
  // PWA Install Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Sorting
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'date',
    direction: 'desc'
  });

  // Visualization
  const [chartType, setChartType] = useState<ChartType>('bar');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Check for login success flag on mount
  useEffect(() => {
    const loginSuccess = localStorage.getItem('loginSuccess');
    if (loginSuccess === 'true') {
        showToast(language === 'my' ? 'ဝင်ရောက်ခြင်း အောင်မြင်ပါသည်' : 'Login successful', 'success');
        localStorage.removeItem('loginSuccess');
    }
  }, []);

  useEffect(() => {
    loadData();
    loadBudget();
    
    // Realtime Subscription for Transactions
    const txChannel = supabase.channel('realtime_transactions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        () => { loadData(); }
      )
      .subscribe();

    // Realtime Subscription for Budgets (Fix for cross-device sync)
    const budgetChannel = supabase.channel('realtime_budgets')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'budgets' },
        () => { loadBudget(); }
      )
      .subscribe();

    // PWA Install Prompt Listener
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      supabase.removeChannel(txChannel);
      supabase.removeChannel(budgetChannel);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);


  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    setShowCurrencyModal(false);
    showToast(language === 'my' 
      ? `ငွေကြေးယူနစ်ကို ${newCurrency} သို့ ပြောင်းလဲလိုက်ပါပြီ` 
      : `Currency changed to ${newCurrency}`, 
    'success');
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    setShowLanguageModal(false);
    const langLabel = LANGUAGES.find(l => l.code === newLang)?.label;
    showToast(newLang === 'my' 
      ? 'ဘာသာစကား ပြောင်းလဲလိုက်ပါပြီ' 
      : `Language changed to ${langLabel}`, 
    'success');
  };

  const loadData = async () => {
    // Only show loading spinner on initial load to avoid flickering during realtime updates
    if (transactions.length === 0) setIsLoading(true);
    const data = await getTransactions();
    setTransactions(data);
    setIsLoading(false);
  };

  const loadBudget = async () => {
    const settings = await getBudgetSettings();
    if (settings) {
        // --- Auto Reset Logic ---
        // Check if the budget is from a previous month
        if (settings.updated_at) {
            const budgetDate = new Date(settings.updated_at);
            const now = new Date();
            
            // If the budget year or month is different from current, it's old.
            // We reset it locally and optionally clear it in DB.
            if (budgetDate.getMonth() !== now.getMonth() || budgetDate.getFullYear() !== now.getFullYear()) {
                console.log("Budget is from previous month. Resetting...");
                // Delete from DB so it doesn't show up again
                await deleteBudgetSettings();
                // Reset local state
                setBudgetLimit(0);
                return;
            }
        }

        setBudgetLimit(settings.limit_amount);
        setWarningPercent(settings.warning_percent);
        setDangerPercent(settings.danger_percent);
    } else {
        // No budget set yet
        setBudgetLimit(0);
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const openBudgetModal = () => {
    setTempBudget(budgetLimit > 0 ? budgetLimit.toString() : '');
    setTempWarning(warningPercent);
    setTempDanger(dangerPercent);
    setShowBudgetModal(true);
  };

  const handleSaveBudget = async () => {
    const val = parseInt(tempBudget);
    
    if (isNaN(val) || val <= 0) {
        showToast(language === 'my' ? 'ကျေးဇူးပြု၍ ပမာဏကို မှန်ကန်စွာထည့်ပါ' : 'Please enter a valid amount', 'error');
        return;
    }

    if (tempWarning >= tempDanger) {
        showToast(language === 'my' ? 'သတိပေးချက် ရာခိုင်နှုန်းသည် အန္တရာယ် ရာခိုင်နှုန်းထက် နည်းရပါမည်' : 'Warning % must be less than Critical %', 'error');
        return;
    }

    const { success, error } = await saveBudgetSettings({
        limit_amount: val,
        warning_percent: tempWarning,
        danger_percent: tempDanger,
        // updated_at is handled in storageService
    });

    if (success) {
        setBudgetLimit(val);
        setWarningPercent(tempWarning);
        setDangerPercent(tempDanger);
        setShowBudgetModal(false);
        showToast(language === 'my' ? 'ဘတ်ဂျက် setting များကို သိမ်းဆည်းပြီးပါပြီ' : 'Budget settings saved');
    } else {
        showToast('Error saving budget: ' + error, 'error');
    }
  };

  const handleRemoveBudget = async () => {
    const { success, error } = await deleteBudgetSettings();
    if (success) {
        setBudgetLimit(0);
        setShowBudgetModal(false);
        showToast(language === 'my' ? 'ဘတ်ဂျက် ဖျက်သိမ်းလိုက်ပါပြီ' : 'Budget removed');
    } else {
        showToast('Error removing budget: ' + error, 'error');
    }
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !label) return;
    setIsSaving(true);

    try {
      if (editingId) {
        const original = transactions.find(t => t.id === editingId);
        if (original) {
          const updatedPayload: Transaction = {
            ...original,
            amount: parseFloat(amount),
            label,
            type,
          };
          const { success, error } = await updateTransaction(updatedPayload);
          if (success) {
            // Optimistic Update
            setTransactions(prev => prev.map(t => t.id === editingId ? updatedPayload : t));
            showToast(language === 'my' ? 'စာရင်း ပြင်ဆင်ပြီးပါပြီ' : 'Transaction updated', 'success');
          } else {
            showToast('Update failed: ' + (error || 'Unknown error'), 'error');
          }
        }
      } else {
        const newTransactionPayload: Transaction = {
          id: '',
          amount: parseFloat(amount),
          label,
          date: getLocalDate(), 
          type,
        };
        const { data, error } = await saveTransaction(newTransactionPayload);
        if (data) {
          // Optimistic Update
          setTransactions(prev => [...prev, data]);
          showToast(language === 'my' ? 'စာရင်းသစ် ထည့်ပြီးပါပြီ' : 'Transaction added', 'success');
        } else {
          showToast('Failed to add: ' + (error || 'Database error'), 'error');
        }
      }
    } catch (error: any) {
       showToast('System Error: ' + error.message, 'error');
    }
    
    setIsSaving(false);
    resetForm();
  };

  const resetForm = () => {
    setAmount('');
    setLabel('');
    setType(TransactionType.EXPENSE);
    setEditingId(null);
    setShowForm(false);
  };

  const handleRowClick = (t: Transaction) => {
    setSelectedTransaction(t);
    setShowDeleteConfirm(false);
  };

  const handleEditClick = () => {
    if (!selectedTransaction) return;
    setAmount(selectedTransaction.amount.toString());
    setLabel(selectedTransaction.label);
    setType(selectedTransaction.type);
    setEditingId(selectedTransaction.id);
    setShowForm(true);
    setSelectedTransaction(null);
  };

  const handleRequestDelete = () => setShowDeleteConfirm(true);

  const confirmDelete = async () => {
    if (!selectedTransaction) return;
    const { success, error } = await deleteTransaction(selectedTransaction.id);
    if (success) {
      // Optimistic Update
      setTransactions(prev => prev.filter(t => t.id !== selectedTransaction.id));
      showToast(language === 'my' ? 'စာရင်း ဖျက်ပြီးပါပြီ' : 'Transaction deleted', 'success');
    } else {
      showToast('Delete failed: ' + (error || 'Unknown error'), 'error');
    }
    setSelectedTransaction(null);
    setShowDeleteConfirm(false);
  };

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    showToast(language === 'my' ? 'အကောင့်မှ ထွက်လိုက်ပါပြီ' : 'Logged out', 'success');
    // Delay slightly to show the toast
    setTimeout(async () => {
        await logoutUser();
        onLogout();
    }, 1000);
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    let csvContent = "data:text/csv;charset=utf-8,Date,Label,Type,Amount\n";
    transactions.forEach(t => {
      csvContent += `${t.date},${t.label},${t.type},${t.amount}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MoneyNote_${currentUser}_${getLocalDate()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportConfirm(false);
    showToast(language === 'my' ? "CSV ဒေါင်းလုဒ်လုပ်ပြီးပါပြီ" : "CSV Downloaded");
  };

  const handleSort = (key: SortKey) => {
    setSortConfig(current => {
      if (current.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortIcon = (columnKey: SortKey) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown size={14} className="ml-1 opacity-30 inline" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={14} className="ml-1 text-primary inline" /> 
      : <ArrowDown size={14} className="ml-1 text-primary inline" />;
  };

  // --- Filtering & Calculations ---

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions.filter(t => t.date.startsWith(filterDate));
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.label.toLowerCase().includes(q) || 
        t.amount.toString().includes(q)
      );
    }

    return filtered.sort((a, b) => {
      let valA: string | number = a[sortConfig.key];
      let valB: string | number = b[sortConfig.key];
      if (sortConfig.key === 'label') {
        valA = a.label.toLowerCase();
        valB = b.label.toLowerCase();
      } else if (sortConfig.key === 'date') {
        if (valA === valB && a.created_at && b.created_at) {
             valA = a.created_at;
             valB = b.created_at;
        }
      }
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [transactions, filterDate, sortConfig, searchQuery]);

  const monthlyStats = useMemo(() => {
    const currentMonthTx = transactions.filter(t => t.date.startsWith(filterDate));
    const income = currentMonthTx.filter(t => t.type === TransactionType.INCOME).reduce((acc, curr) => acc + curr.amount, 0);
    const expense = currentMonthTx.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, curr) => acc + curr.amount, 0);
    return { income, expense, net: income - expense };
  }, [transactions, filterDate]);

  // Budget Calculations
  const budgetUsagePercent = budgetLimit > 0 ? (monthlyStats.expense / budgetLimit) * 100 : 0;
  // Use custom thresholds
  const isDangerZone = budgetUsagePercent >= dangerPercent;
  const isWarningZone = !isDangerZone && budgetUsagePercent >= warningPercent;
  const overSpentAmount = monthlyStats.expense - budgetLimit;

  // Search Categories
  const expenseCats = getExpenseCategories();
  const incomeCats = getIncomeCategories();
  const allSearchCategories = useMemo(() => {
      return Array.from(new Set([...expenseCats, ...incomeCats].map(c => c.label)));
  }, [language]);

  const chartData = useMemo(() => {
    const data: Record<string, { name: string, income: number, expense: number }> = {};
    const currentMonthTx = transactions.filter(t => t.date.startsWith(filterDate));
    
    // Initialize days based on current month/year
    const [year, month] = filterDate.split('-');
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
        const dayStr = String(i).padStart(2, '0');
        data[dayStr] = { name: dayStr, income: 0, expense: 0 };
    }

    currentMonthTx.forEach(t => {
        const day = t.date.split('-')[2];
        if (data[day]) {
            if (t.type === TransactionType.INCOME) data[day].income += t.amount;
            else data[day].expense += t.amount;
        }
    });

    return Object.values(data);
  }, [transactions, filterDate]);

  const historySummaries = useMemo(() => {
    const summaries: Record<string, { income: number, expense: number, net: number }> = {};
    transactions.forEach(t => {
      const monthKey = t.date.slice(0, 7); 
      if (monthKey === filterDate) return; 

      if (!summaries[monthKey]) {
        summaries[monthKey] = { income: 0, expense: 0, net: 0 };
      }
      if (t.type === TransactionType.INCOME) {
        summaries[monthKey].income += t.amount;
        summaries[monthKey].net += t.amount;
      } else {
        summaries[monthKey].expense += t.amount;
        summaries[monthKey].net -= t.amount;
      }
    });
    return Object.entries(summaries)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 12);
  }, [transactions, filterDate]);

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    // JP Format: YYYY/MM/DD or similar, others DD/MM/YYYY
    if (language === 'ja') return `${parts[0]}/${parts[1]}/${parts[2]}`;
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  const getBurmeseMonthName = (dateStr: string) => {
    const [year, month] = dateStr.split('-');
    const monthIndex = parseInt(month) - 1;
    
    if (language === 'my') {
        const months = ["ဇန်နဝါရီ", "ဖေဖော်ဝါရီ", "မတ်", "ဧပြီ", "မေ", "ဇွန်", "ဇူလိုင်", "သြဂုတ်", "စက်တင်ဘာ", "အောက်တိုဘာ", "နိုဝင်ဘာ", "ဒီဇင်ဘာ"];
        return `${year} ${months[monthIndex]}လ`;
    } else if (language === 'ja') {
        return `${year}年 ${parseInt(month)}月`;
    } else {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return `${months[monthIndex]} ${year}`;
    }
  };

  const isCurrentMonth = filterDate === currentMonth;

  // Determine current categories based on selected transaction type
  const currentCategories = type === TransactionType.INCOME ? incomeCats : expenseCats;

  if (isLoading && transactions.length === 0) {
    return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center text-emerald-500">
            <Loader2 className="animate-spin" size={48} />
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg pb-24 text-dark-text font-sans relative flex flex-col">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-2 fade-in duration-300">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl border ${toast.type === 'success' ? 'bg-emerald-900/90 border-emerald-500 text-emerald-100' : 'bg-red-900/90 border-red-500 text-red-100'}`}>
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-medium">{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-dark-card shadow-md sticky top-0 z-20 border-b border-dark-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-2 rounded-lg">
                <Wallet className="text-primary" size={24} />
            </div>
            <div>
                <h1 className="text-xl font-bold text-white leading-tight">{t.appName}</h1>
                <p className="text-[10px] text-dark-muted">{t.appDesc}</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {deferredPrompt && (
                <button onClick={handleInstallClick} className="bg-primary/10 hover:bg-primary/20 text-primary transition text-xs sm:text-sm border border-primary/20 px-3 py-2 rounded-lg flex items-center gap-1 font-bold animate-pulse">
                    <Smartphone size={16} /> <span className="hidden sm:inline">Install App</span>
                </button>
            )}
            
            {/* Settings Dropdown */}
            <div className="relative">
                <button 
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)} 
                  className="bg-slate-700/50 hover:bg-slate-700 text-white p-2.5 rounded-xl border border-dark-border transition flex items-center justify-center"
                >
                    <Settings size={20} />
                </button>

                {showSettingsMenu && (
                    <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowSettingsMenu(false)}></div>
                    <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 rounded-2xl shadow-2xl border border-dark-border z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                        
                        <div className="p-2 space-y-1 bg-slate-800">
                            {/* New: Currency Button */}
                            <button onClick={() => {setShowCurrencyModal(true); setShowSettingsMenu(false);}} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition flex items-center gap-3">
                                <Coins size={18} className="text-amber-400" /> {t.changeCurrency}
                            </button>

                            {/* New: Language Button */}
                            <button onClick={() => {setShowLanguageModal(true); setShowSettingsMenu(false);}} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition flex items-center gap-3">
                                <Languages size={18} className="text-purple-400" /> {t.changeLanguage}
                            </button>
                            
                            <div className="h-px bg-dark-border mx-2 my-1"></div>

                            <button onClick={() => {setShowSupportModal(true); setShowSettingsMenu(false);}} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition flex items-center gap-3">
                                <HelpCircle size={18} className="text-blue-400" /> {t.feedback}
                            </button>
                            <button onClick={() => {setShowExportConfirm(true); setShowSettingsMenu(false);}} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition flex items-center gap-3">
                                <Download size={18} className="text-emerald-400" /> {t.export}
                            </button>
                            
                            <div className="h-px bg-dark-border mx-2 my-1"></div>
                            
                            <button onClick={() => {setShowLogoutConfirm(true); setShowSettingsMenu(false);}} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition flex items-center gap-3 font-bold">
                                <LogOut size={18} /> {t.logout}
                            </button>
                        </div>
                    </div>
                    </>
                )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6 flex-grow w-full">
        
        {/* User Welcome */}
        <div className="flex items-center justify-between text-xs text-dark-muted px-1">
            <span>{t.welcome}, <b className="text-white">{currentUser}</b></span>
            <span>{getLocalDate()}</span>
        </div>

        {/* Monthly Stats Summary */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
             <div className="bg-dark-card p-3 rounded-xl border border-dark-border flex flex-col items-center justify-center shadow-sm">
                 <span className="text-xs text-dark-muted mb-1">{t.income}</span>
                 <span className="text-emerald-400 font-bold text-sm sm:text-lg">+{monthlyStats.income.toLocaleString()}</span>
             </div>
             <div className="bg-dark-card p-3 rounded-xl border border-dark-border flex flex-col items-center justify-center shadow-sm">
                 <span className="text-xs text-dark-muted mb-1">{t.expense}</span>
                 <span className="text-red-400 font-bold text-sm sm:text-lg">-{monthlyStats.expense.toLocaleString()}</span>
             </div>
             <div className="bg-dark-card p-3 rounded-xl border border-dark-border flex flex-col items-center justify-center shadow-sm">
                 <span className="text-xs text-dark-muted mb-1">{t.balance}</span>
                 <span className={`font-bold text-sm sm:text-lg ${monthlyStats.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {monthlyStats.net > 0 ? '+' : ''}{monthlyStats.net.toLocaleString()}
                 </span>
             </div>
        </div>

        {/* Feature 3: Budget Goal */}
        <div className="bg-dark-card rounded-xl p-4 border border-dark-border relative overflow-hidden group">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                   <PieChart size={16} className="text-primary"/> {t.budgetTitle}
                </h3>
                
                {/* Only show settings if budget is set */}
                {budgetLimit > 0 && (
                  <button 
                    onClick={openBudgetModal}
                    className="text-dark-muted hover:text-white transition p-1.5 hover:bg-slate-700 rounded-lg"
                  >
                      <SlidersHorizontal size={18} />
                  </button>
                )}
            </div>
            
            {budgetLimit === 0 ? (
                <div className="py-2 text-center">
                    <button 
                        onClick={openBudgetModal}
                        className="bg-slate-700/50 hover:bg-slate-700 border border-dashed border-slate-500 text-emerald-400 font-bold py-3 px-6 rounded-xl transition w-full flex flex-col items-center justify-center gap-2 group-hover:border-emerald-500/50"
                    >
                        <Target size={24} className="mb-1 text-emerald-500" />
                        <span>🎯 {t.setBudget}</span>
                        <span className="text-[10px] text-dark-muted font-normal">{t.setBudgetDesc}</span>
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex justify-between text-xs text-dark-muted mb-1.5">
                        <span className="font-medium text-white">{t.spent}: {monthlyStats.expense.toLocaleString()}</span>
                        <span>{t.limit}: {budgetLimit.toLocaleString()}</span>
                    </div>
                    <div className="space-y-3 mt-1">
                        <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden relative">
                            <div 
                                className={`h-full rounded-full transition-all duration-700 ease-out ${isDangerZone ? 'bg-red-500' : isWarningZone ? 'bg-yellow-500' : 'bg-primary'}`} 
                                style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
                            ></div>
                        </div>
                        
                        {/* Budget Alerts */}
                        {isDangerZone ? (
                            <div className="flex items-start gap-2 text-xs text-red-200 bg-red-900/30 p-2.5 rounded-lg border border-red-500/30 animate-in fade-in">
                                <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold text-red-400 block mb-0.5">{t.dangerState} ({dangerPercent}%)</span>
                                    {monthlyStats.expense > budgetLimit && (
                                       <span>{t.overBudgetMsg} <b className="text-white">{overSpentAmount.toLocaleString()} {currency}</b></span>
                                    )}
                                </div>
                            </div>
                        ) : isWarningZone ? (
                            <div className="flex items-start gap-2 text-xs text-yellow-200 bg-yellow-900/30 p-2.5 rounded-lg border border-yellow-500/30 animate-in fade-in">
                                <AlertCircle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold text-yellow-400 block mb-0.5">{t.warning} ({warningPercent}%)</span>
                                    <span>{t.warningDesc}</span>
                                </div>
                            </div>
                        ) : (
                             <div className="flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-900/10 px-2 py-1 rounded border border-emerald-500/10 w-fit">
                                <CheckCircle2 size={12}/> {t.normalState}
                             </div>
                        )}
                    </div>
                </>
            )}
        </div>

        {/* Search & Transaction Table */}
        <div className="bg-dark-card rounded-xl shadow-sm border border-dark-border overflow-hidden">
          <div className="p-4 border-b border-dark-border bg-slate-800/50 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-200">
                {getBurmeseMonthName(filterDate)}
              </h3>
              <span className="text-xs text-dark-muted bg-slate-700 px-2 py-1 rounded border border-dark-border">{filteredAndSortedTransactions.length} {t.items}</span>
            </div>
            
            {/* Search Input & Category Filters */}
            <div className="space-y-3">
                 <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <Search size={16} className="text-dark-muted group-focus-within:text-primary transition"/>
                     </div>
                     <input 
                         type="text" 
                         placeholder={t.searchPlaceholder}
                         value={searchQuery}
                         onFocus={() => setIsSearchFocused(true)}
                         onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         className="w-full bg-slate-900 border border-dark-border text-white text-sm rounded-lg pl-10 pr-10 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                     />
                     {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-dark-muted hover:text-white"
                        >
                            <X size={16} />
                        </button>
                     )}
                 </div>
                 
                 {/* Category Chips - Only visible when search is focused or active */}
                 {(isSearchFocused || searchQuery) && (
                     <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide no-scrollbar animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-1 text-dark-muted text-[10px] uppercase font-bold shrink-0">
                            <Filter size={10} /> {t.filters}
                        </div>
                        {allSearchCategories.map(cat => (
                            <button
                              key={cat}
                              onMouseDown={(e) => e.preventDefault()} // Prevent input blur when clicking
                              onClick={() => setSearchQuery(prev => prev === cat ? '' : cat)}
                              className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap border transition flex items-center gap-1 group ${searchQuery === cat ? 'bg-primary text-slate-900 border-primary shadow-sm shadow-emerald-500/20' : 'bg-slate-800 text-dark-muted border-slate-700 hover:border-slate-500 hover:text-white'}`}
                            >
                              {cat}
                              {searchQuery === cat && <X size={12} className="opacity-75 group-hover:bg-slate-900/20 rounded-full"/>}
                            </button>
                        ))}
                     </div>
                 )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-dark-text">
              <thead className="bg-slate-800 text-dark-muted font-medium border-b border-dark-border">
                <tr>
                  <th onClick={() => handleSort('date')} className="px-4 py-3 cursor-pointer hover:bg-slate-700/50 transition w-1/4">
                    <div className="flex items-center">{t.date} {getSortIcon('date')}</div>
                  </th>
                  <th onClick={() => handleSort('label')} className="px-4 py-3 cursor-pointer hover:bg-slate-700/50 transition w-2/4">
                    <div className="flex items-center">{t.label} {getSortIcon('label')}</div>
                  </th>
                  <th onClick={() => handleSort('amount')} className="px-4 py-3 text-right cursor-pointer hover:bg-slate-700/50 transition w-1/4">
                     <div className="flex items-center justify-end">{t.amount} {getSortIcon('amount')}</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {filteredAndSortedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-dark-muted italic">
                      {t.noData}
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedTransactions.map((t) => (
                    <tr key={t.id} onClick={() => handleRowClick(t)} className="hover:bg-slate-800/50 transition cursor-pointer active:bg-slate-800 group">
                      <td className="px-4 py-3 whitespace-nowrap text-dark-muted">{formatDateDisplay(t.date)}</td>
                      <td className="px-4 py-3 font-medium text-white">{t.label}</td>
                      <td className={`px-4 py-3 text-right font-bold ${t.type === TransactionType.INCOME ? 'text-emerald-400' : 'text-red-400'}`}>
                        {t.type === TransactionType.INCOME ? '+' : '-'}{t.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feature 1: Charts Section (Moved to Bottom) */}
        {transactions.length > 0 && (
          <div className="bg-dark-card rounded-xl p-4 border border-dark-border overflow-hidden">
             <div className="flex justify-between items-center mb-4">
                 <h3 className="text-sm font-bold text-white">{t.chartTitle}</h3>
                 <div className="flex bg-slate-800 rounded-lg p-1 gap-1">
                     <button onClick={() => setChartType('bar')} className={`p-1.5 rounded ${chartType === 'bar' ? 'bg-slate-600 text-white' : 'text-dark-muted hover:text-white'}`}><BarChart3 size={16}/></button>
                     <button onClick={() => setChartType('line')} className={`p-1.5 rounded ${chartType === 'line' ? 'bg-slate-600 text-white' : 'text-dark-muted hover:text-white'}`}><LineChartIcon size={16}/></button>
                 </div>
             </div>
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'bar' ? (
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} />
                            <Legend />
                            <Bar dataKey="income" name={t.income} fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expense" name={t.expense} fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    ) : chartType === 'line' ? (
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} />
                            <Legend />
                            <Line type="monotone" dataKey="income" name={t.income} stroke="#10b981" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="expense" name={t.expense} stroke="#ef4444" strokeWidth={2} dot={false} />
                        </LineChart>
                    ) : (
                        <AreaChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} />
                            <Legend />
                            <Area type="monotone" dataKey="income" name={t.income} stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                            <Area type="monotone" dataKey="expense" name={t.expense} stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                        </AreaChart>
                    )}
                </ResponsiveContainer>
             </div>
          </div>
        )}

        {/* Home Button */}
        {!isCurrentMonth && (
            <button onClick={() => setFilterDate(currentMonth)} className="w-full py-3 rounded-xl border border-primary text-primary hover:bg-primary/10 transition flex items-center justify-center gap-2 font-bold">
                <Home size={20} /> {t.backToCurrent}
            </button>
        )}

        {/* History List */}
        <div className="space-y-3 pt-4 border-t border-dark-border">
          <h3 className="text-dark-muted text-sm font-bold uppercase tracking-wider">{t.historyTitle}</h3>
          {historySummaries.length === 0 ? (
             <p className="text-dark-muted text-sm">{t.noHistory}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {historySummaries.map(([monthKey, stats]) => (
                <button 
                  key={monthKey}
                  onClick={() => {
                      setFilterDate(monthKey);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-dark-card p-3 rounded-lg border border-dark-border hover:border-primary/50 transition text-left group"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white group-hover:text-primary transition">{getBurmeseMonthName(monthKey)}</span>
                    <span className={`text-xs font-bold ${stats.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{stats.net > 0 ? '+' : ''}{stats.net.toLocaleString()}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 mt-4 border-t border-dark-border bg-slate-900/50 text-dark-muted text-xs flex flex-col items-center justify-center gap-2">
         <div className="flex items-center gap-1 font-bold text-slate-500">
             <Copyright size={12} /> {new Date().getFullYear()} {t.appName}. All rights reserved.
         </div>
         <div className="flex items-center gap-3 text-primary/80">
             <a href="mailto:bornaskraz@gmail.com" className="flex items-center gap-1 font-bold hover:underline hover:text-primary">
                <Mail size={12} /> Email
             </a>
             <span className="text-slate-700">|</span>
             <a href="https://t.me/swelmyel" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-bold hover:underline hover:text-primary">
                <Send size={12} /> Telegram
             </a>
         </div>
         <div className="mt-2 text-[10px] text-slate-600">
             Made with <Heart size={10} className="inline text-red-500 mx-0.5" fill="currentColor"/> in Myanmar by @swelmyel
         </div>
      </footer>

      {/* FAB */}
      {isCurrentMonth && (
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="fixed bottom-6 right-6 bg-primary hover:bg-emerald-600 text-slate-900 rounded-full p-4 shadow-lg shadow-emerald-900/20 transition hover:scale-105 active:scale-95 z-30"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      )}

      {/* Input Form Modal (Center on desktop, Top on mobile) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 z-40 flex items-start sm:items-center justify-center p-4 pt-2 sm:pt-4">
          <div className="bg-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-700 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingId ? t.editTransaction : t.addTransaction}
              </h2>
              <button onClick={resetForm} className="text-dark-muted hover:text-white transition"><X size={24} /></button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-5">
              <div className="grid grid-cols-2 gap-3 p-1 bg-slate-900 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setType(TransactionType.EXPENSE);
                    setLabel(''); // Reset label when switching type
                  }}
                  className={`py-2.5 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${type === TransactionType.EXPENSE ? 'bg-red-500 text-white shadow-lg' : 'text-dark-muted hover:text-white'}`}
                >
                  <ArrowDown size={16} /> {t.expense}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType(TransactionType.INCOME);
                    setLabel(''); // Reset label when switching type
                  }}
                  className={`py-2.5 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${type === TransactionType.INCOME ? 'bg-emerald-500 text-slate-900 shadow-lg' : 'text-dark-muted hover:text-white'}`}
                >
                  <ArrowUp size={16} /> {t.income}
                </button>
              </div>

              <div>
                <label className="block text-dark-muted text-xs font-bold mb-1.5 uppercase tracking-wider">{t.amount} ({currency})</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-700 text-white text-2xl font-bold px-4 py-3 rounded-xl border-2 border-transparent focus:border-primary focus:outline-none transition placeholder-slate-500"
                  placeholder="0"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-dark-muted text-xs font-bold mb-1.5 uppercase tracking-wider">{t.label}</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl border-2 border-transparent focus:border-primary focus:outline-none transition placeholder-slate-500 mb-2"
                  placeholder={type === TransactionType.INCOME ? t.labelPlaceholderIncome : t.labelPlaceholderExpense}
                />
                
                {/* Feature 2: Category Grid (Dynamic based on Type) */}
                <div className="grid grid-cols-5 gap-2 mt-2">
                    {currentCategories.map((cat, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => setLabel(cat.label)}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border border-slate-600/50 hover:bg-slate-600 transition ${label === cat.label ? 'bg-slate-600 border-primary ring-1 ring-primary' : 'bg-slate-700/30'}`}
                            title={cat.label}
                        >
                            <span className={label === cat.label ? 'text-primary' : 'text-dark-muted'}>{cat.icon}</span>
                            <span className="text-[10px] mt-1 text-dark-muted truncate w-full text-center">{cat.label}</span>
                        </button>
                    ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving || !amount || !label}
                className="w-full bg-primary hover:bg-emerald-600 text-slate-900 font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
              >
                {isSaving ? <Loader2 className="animate-spin" /> : <>{editingId ? <Save size={20} /> : <Plus size={20} />} {editingId ? t.save : t.add}</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Row Action Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => { setSelectedTransaction(null); setShowDeleteConfirm(false); }}>
          <div className="bg-slate-800 rounded-2xl w-full max-w-sm p-6 space-y-6 shadow-2xl border border-slate-700 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <div>
                 <h3 className="text-lg font-bold text-white break-words">{selectedTransaction.label}</h3>
                 <p className="text-dark-muted text-sm">{formatDateDisplay(selectedTransaction.date)}</p>
              </div>
              <button onClick={() => setSelectedTransaction(null)} className="text-dark-muted hover:text-white bg-slate-700 p-1 rounded-full"><X size={20} /></button>
            </div>
            <div className="text-3xl font-bold text-center py-2 bg-slate-900/50 rounded-xl">
              <span className={selectedTransaction.type === TransactionType.INCOME ? 'text-emerald-400' : 'text-red-400'}>
                {selectedTransaction.type === TransactionType.INCOME ? '+' : '-'}{selectedTransaction.amount.toLocaleString()} <span className="text-sm text-dark-muted font-normal">{currency}</span>
              </span>
            </div>
            
            {isCurrentMonth ? (
                // Current Month Actions (Edit/Delete)
                showDeleteConfirm ? (
                     <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                         <div className="flex items-center gap-3 text-red-200">
                             <AlertCircle className="text-red-500 shrink-0" />
                             <p className="font-bold text-sm">{t.confirmDelete}</p>
                         </div>
                         <div className="flex gap-3">
                             <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 font-bold text-sm transition">{t.cancel}</button>
                             <button onClick={confirmDelete} className="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-bold text-sm transition shadow-lg shadow-red-900/20">{t.delete}</button>
                         </div>
                     </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={handleEditClick} className="flex flex-col items-center justify-center gap-2 bg-slate-700 hover:bg-blue-600/20 hover:border-blue-500/50 border border-transparent p-4 rounded-xl transition group">
                        <div className="bg-blue-500/10 p-3 rounded-full group-hover:bg-blue-500 text-blue-400 group-hover:text-white transition"><Edit size={24} /></div>
                        <span className="text-sm font-bold text-blue-100 group-hover:text-blue-400">{t.edit}</span>
                      </button>
                      <button onClick={handleRequestDelete} className="flex flex-col items-center justify-center gap-2 bg-slate-700 hover:bg-red-600/20 hover:border-red-500/50 border border-transparent p-4 rounded-xl transition group">
                         <div className="bg-red-500/10 p-3 rounded-full group-hover:bg-red-500 text-red-400 group-hover:text-white transition"><Trash2 size={24} /></div>
                        <span className="text-sm font-bold text-red-100 group-hover:text-red-400">{t.delete}</span>
                      </button>
                    </div>
                )
            ) : (
                // Past Month (Read Only)
                <div className="bg-slate-700/50 border border-dark-border rounded-xl p-4 flex items-center justify-center gap-3 text-dark-muted">
                    <Lock size={20} />
                    <span className="text-sm font-medium">{t.readOnly}</span>
                </div>
            )}
          </div>
        </div>
      )}

      {/* Currency Selection Modal */}
      {showCurrencyModal && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-slate-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl border border-slate-700 animate-in zoom-in-95 duration-200">
               <div className="flex items-center gap-3">
                   <div className="bg-amber-400/10 p-3 rounded-full">
                       <Coins className="text-amber-400" size={24} />
                   </div>
                   <h3 className="text-lg font-bold text-white">{t.changeCurrency}</h3>
                   <button onClick={() => setShowCurrencyModal(false)} className="ml-auto text-dark-muted hover:text-white"><X size={20}/></button>
               </div>
               
               <div className="grid grid-cols-1 gap-2 pt-2">
                    {CURRENCIES.map(c => (
                        <button 
                            key={c.id} 
                            onClick={() => handleCurrencyChange(c.symbol)}
                            className={`px-4 py-3 rounded-xl border transition flex items-center justify-between group ${currency === c.symbol ? 'bg-primary/20 border-primary text-primary' : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                        >
                            <span className="font-bold">{c.label} ({c.symbol})</span>
                            {currency === c.symbol && <CheckCircle2 size={18} />}
                        </button>
                    ))}
               </div>
           </div>
        </div>
      )}

      {/* Language Selection Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-slate-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl border border-slate-700 animate-in zoom-in-95 duration-200">
               <div className="flex items-center gap-3">
                   <div className="bg-purple-400/10 p-3 rounded-full">
                       <Languages className="text-purple-400" size={24} />
                   </div>
                   <h3 className="text-lg font-bold text-white">{t.changeLanguage}</h3>
                   <button onClick={() => setShowLanguageModal(false)} className="ml-auto text-dark-muted hover:text-white"><X size={20}/></button>
               </div>
               
               <div className="grid grid-cols-1 gap-2 pt-2">
                    {LANGUAGES.map(l => (
                        <button 
                            key={l.code} 
                            onClick={() => handleLanguageChange(l.code as Language)}
                            className={`px-4 py-3 rounded-xl border transition flex items-center justify-between group ${language === l.code ? 'bg-primary/20 border-primary text-primary' : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                        >
                            <span className="font-bold">{l.label}</span>
                            {language === l.code && <CheckCircle2 size={18} />}
                        </button>
                    ))}
               </div>
           </div>
        </div>
      )}

      {/* Budget Settings Modal (Enhanced) */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-slate-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl border border-slate-700 animate-in zoom-in-95 duration-200">
               <div className="flex justify-between items-start">
                   <div className="flex items-center gap-3">
                        <div className="bg-primary/20 p-3 rounded-full">
                            <SlidersHorizontal className="text-primary" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-white">{t.budgetSettingsTitle}</h3>
                   </div>
                   <button onClick={() => setShowBudgetModal(false)} className="text-dark-muted hover:text-white"><X size={20}/></button>
               </div>
               
               <p className="text-dark-muted text-sm border-b border-dark-border pb-3">
                   {t.budgetSettingsDesc}
               </p>

               <div className="space-y-4 pt-1 h-64 overflow-y-auto pr-1">
                   {/* Budget Amount */}
                   <div>
                       <label className="block text-xs font-bold text-white uppercase mb-2">{t.budgetAmount} ({currency})</label>
                       <input 
                          type="number" 
                          value={tempBudget} 
                          onChange={(e) => setTempBudget(e.target.value)}
                          className="w-full bg-slate-700 rounded-xl px-4 py-3 text-white text-lg font-bold border-2 border-transparent focus:border-primary focus:outline-none placeholder-slate-500"
                          placeholder="0"
                       />
                   </div>

                   {/* Warning Threshold */}
                   <div>
                      <div className="flex justify-between text-xs font-bold mb-2">
                          <label className="text-yellow-400 uppercase">{t.warningAlert}</label>
                          <span className="text-yellow-400">{tempWarning}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="50" 
                        max="95" 
                        step="5"
                        value={tempWarning}
                        onChange={(e) => setTempWarning(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                      />
                      <p className="text-[10px] text-dark-muted mt-1">
                          {t.warningMsg.replace('%s', tempWarning.toString())}
                      </p>
                   </div>

                   {/* Danger Threshold */}
                   <div>
                      <div className="flex justify-between text-xs font-bold mb-2">
                          <label className="text-red-400 uppercase">{t.criticalAlert}</label>
                          <span className="text-red-400">{tempDanger}%</span>
                      </div>
                      <input 
                        type="range" 
                        min={tempWarning + 5} 
                        max="100" 
                        step="5"
                        value={tempDanger}
                        onChange={(e) => setTempDanger(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                      />
                      <p className="text-[10px] text-dark-muted mt-1">
                          {t.criticalMsg.replace('%s', tempDanger.toString())}
                      </p>
                   </div>
               </div>

               <div className="flex gap-3 pt-3 border-t border-dark-border">
                   <button onClick={handleRemoveBudget} className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-bold text-sm transition border border-red-500/20">
                       <Trash2 size={16} className="inline mr-1 mb-0.5" /> {t.delete}
                   </button>
                   <button onClick={handleSaveBudget} className="flex-1 py-3 rounded-xl bg-primary text-slate-900 hover:bg-emerald-600 font-bold text-sm transition shadow-lg shadow-emerald-900/20">
                       <Save size={16} className="inline mr-1 mb-0.5" /> {t.save}
                   </button>
               </div>
           </div>
        </div>
      )}

      {/* Support / Feedback Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-slate-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl border border-slate-700 animate-in zoom-in-95 duration-200">
               <div className="flex justify-between items-start">
                   <div className="flex items-center gap-3">
                        <div className="bg-blue-500/10 p-3 rounded-full">
                            <HelpCircle className="text-blue-500" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-white">{t.feedback} & Support</h3>
                   </div>
                   <button onClick={() => setShowSupportModal(false)} className="text-dark-muted hover:text-white"><X size={20}/></button>
               </div>
               
               <p className="text-dark-muted text-sm">
                   {language === 'my' ? 'အကြံပြုချက်များ ပေးပို့ရန် သို့မဟုတ် အကူအညီလိုအပ်ပါက ဆက်သွယ်နိုင်ပါသည်။' : 'Contact us for feedback or support.'}
               </p>
               
               <div className="space-y-3 pt-2">
                   <a href="mailto:bornaskraz@gmail.com" className="flex items-center gap-4 p-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-xl transition group">
                       <div className="bg-slate-600 p-2 rounded-lg group-hover:bg-slate-500 transition"><Mail size={20} className="text-white"/></div>
                       <div>
                           <div className="text-xs text-dark-muted font-bold uppercase">Email</div>
                           <div className="text-sm text-white font-medium">bornaskraz@gmail.com</div>
                       </div>
                   </a>
                   
                   <a href="https://t.me/swelmyel" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-xl transition group">
                       <div className="bg-blue-500/20 p-2 rounded-lg group-hover:bg-blue-500/30 transition"><Send size={20} className="text-blue-400"/></div>
                       <div>
                           <div className="text-xs text-dark-muted font-bold uppercase">Telegram</div>
                           <div className="text-sm text-white font-medium">@swelmyel</div>
                       </div>
                   </a>
               </div>
           </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-slate-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl border border-slate-700 animate-in zoom-in-95 duration-200">
               <div className="flex items-center gap-3">
                   <div className="bg-red-500/10 p-3 rounded-full">
                       <LogOut className="text-red-500" size={24} />
                   </div>
                   <h3 className="text-lg font-bold text-white">{t.logout}</h3>
               </div>
               <p className="text-dark-muted text-sm">{t.logoutConfirm}</p>
               <div className="flex gap-3 pt-2">
                   <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-2.5 rounded-xl bg-slate-700 text-white hover:bg-slate-600 font-bold text-sm transition">{t.cancel}</button>
                   <button onClick={handleLogout} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 font-bold text-sm transition shadow-lg shadow-red-900/20">{t.logout}</button>
               </div>
           </div>
        </div>
      )}

      {/* Export Confirmation Modal */}
      {showExportConfirm && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-slate-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl border border-slate-700 animate-in zoom-in-95 duration-200">
               <div className="flex items-center gap-3">
                   <div className="bg-emerald-500/10 p-3 rounded-full">
                       <Download className="text-emerald-500" size={24} />
                   </div>
                   <h3 className="text-lg font-bold text-white">{t.export}</h3>
               </div>
               <p className="text-dark-muted text-sm">{t.exportConfirm}</p>
               <div className="flex gap-3 pt-2">
                   <button onClick={() => setShowExportConfirm(false)} className="flex-1 py-2.5 rounded-xl bg-slate-700 text-white hover:bg-slate-600 font-bold text-sm transition">{t.cancel}</button>
                   <button onClick={handleExportCSV} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-slate-900 hover:bg-emerald-500 font-bold text-sm transition shadow-lg shadow-emerald-900/20">{t.get}</button>
               </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;