import { ReactNode } from "react";

export type Language = 'my' | 'en' | 'ja';

export const TRANSLATIONS = {
  my: {
    // App Info
    appName: "MoneyNote",
    appDesc: "Smart Finance Tracker",
    welcome: "မင်္ဂလာပါ",
    
    // Auth
    loginTitle: "ကြိုဆိုပါတယ်",
    loginSubtitle: "သင့်ငွေကြေးများကို စီမံခန့်ခွဲရန် ဝင်ရောက်ပါ",
    registerTitle: "အကောင့်သစ်စတင်ရန်",
    registerSubtitle: "မိနစ်ပိုင်းအတွင်း အကောင့်ဖွင့်ပြီး စတင်လိုက်ပါ",
    username: "အသုံးပြုသူအမည် (User Name)",
    usernamePlaceholder: "ဥပမာ - mgmg",
    password: "စကားဝှက် (Password)",
    passwordPlaceholder: "အနည်းဆုံး ၆ လုံး",
    loginBtn: "ဝင်ရောက်မည်",
    registerBtn: "စာရင်းသွင်းမည်",
    noAccount: "အကောင့်မရှိသေးဘူးလား?",
    hasAccount: "အကောင့်ရှိပြီးသားလား?",
    createAccount: "အကောင့်သစ် ဖွင့်ပါ",
    signIn: "အကောင့်သို့ ဝင်ရောက်ပါ",
    warningTitle: "သတိပြုရန်:",
    warningText: "ဤစနစ်သည် အီးမေးလ်မလိုဘဲ အသုံးပြုနိုင်သော်လည်း၊ စကားဝှက်မေ့သွားပါက ပြန်ယူ၍ မရနိုင်ပါ။ ထို့ကြောင့် User Name နှင့် Password ကို သေချာစွာ မှတ်သားထားပါ။",
    
    // Features
    feat1: "ဝင်ငွေ/ထွက်ငွေ စာရင်းများကို လွယ်ကူစွာ မှတ်သားနိုင်ခြင်း",
    feat2: "လစဉ် သုံးစွဲမှုများကို ဇယားများဖြင့် အသေးစိတ်ကြည့်ရှုနိုင်ခြင်း",
    feat3: "လျာထားချက် (Budget) သတ်မှတ်၍ ငွေကြေးစီမံနိုင်ခြင်း",
    feat4: "လုံခြုံစိတ်ချရသော ကိုယ်ပိုင်အကောင့်စနစ်",

    // Dashboard
    income: "ဝင်ငွေ",
    expense: "ထွက်ငွေ",
    balance: "လလက်ကျန်",
    budgetTitle: "လစဉ် သုံးစွဲငွေ လျာထားချက် (Budget)",
    setBudget: "လစဉ်သုံးငွေ လျာထားချက် သတ်မှတ်မည်",
    setBudgetDesc: "ချွေတာလိုသော ပမာဏကို သတ်မှတ်ပြီး စီမံပါ",
    spent: "သုံးစွဲမှု",
    limit: "လျာထားချက်",
    overSpent: "ပိုသုံးမိနေပါပြီ",
    warning: "သတိပြုရန်",
    warningDesc: "ကျော်နေပါပြီ။ ချွေတာပါ။",
    normalState: "ပုံမှန်အခြေအနေတွင် ရှိနေပါသည်။",
    dangerState: "အန္တရာယ်အဆင့် ရောက်ရှိနေပါသည်",
    overBudgetMsg: "လျာထားချက်ထက် ပိုသုံးမိနေပါပြီ။",
    
    // Transaction Form
    addTransaction: "စာရင်းသစ် ထည့်ရန်",
    editTransaction: "စာရင်း ပြင်ဆင်ရန်",
    amount: "ပမာဏ",
    label: "အကြောင်းအရာ",
    labelPlaceholderIncome: "ဥပမာ - လစာ",
    labelPlaceholderExpense: "ဥပမာ - မနက်စာ",
    save: "သိမ်းဆည်းမည်",
    add: "စာရင်းသွင်းမည်",
    
    // Table & Search
    searchPlaceholder: "အမျိုးအစား သို့မဟုတ် ပမာဏဖြင့် ရှာရန်...",
    filters: "Filters:",
    date: "ရက်စွဲ",
    noData: "စာရင်းမရှိသေးပါ",
    items: "ခု",
    
    // Actions
    edit: "ပြင်ဆင်မည်",
    delete: "ဖျက်မည်",
    cancel: "မလုပ်တော့ပါ",
    confirmDelete: "ဤစာရင်းကို ဖျက်ရန် သေချာပါသလား?",
    readOnly: "လဟောင်းစာရင်းများကို ပြင်ဆင်ခွင့် ပိတ်ထားပါသည်။",
    
    // Chart
    chartTitle: "နေ့စဉ် ငွေဝင်/ထွက် နှိုင်းယှဉ်ချက်",
    
    // History
    historyTitle: "လဟောင်း စာရင်းများ",
    noHistory: "လဟောင်းစာရင်း မရှိသေးပါ",
    backToCurrent: "လက်ရှိလသို့ ပြန်သွားမည်",
    
    // Settings
    settings: "Settings",
    changeCurrency: "Change Currency",
    changeLanguage: "ဘာသာစကား",
    changeTheme: "ဒီဇိုင်း (Theme) ပြောင်းရန်",
    dayMode: "နေ့ခင်းပုံစံ (Day Mode)",
    nightMode: "ညပုံစံ (Night Mode)",
    feedback: "Feedback",
    export: "Export CSV",
    logout: "Logout",
    logoutConfirm: "အကောင့်မှ ထွက်ရန် သေချာပါသလား?",
    exportConfirm: "လက်ရှိစာရင်းများကို CSV ဖိုင်အနေဖြင့် ဒေါင်းလုဒ်ရယူမည်လား?",
    get: "ရယူမည်",
    
    // Budget Settings
    budgetSettingsTitle: "Budget Settings",
    budgetSettingsDesc: "လစဉ်သုံးငွေ လျာထားချက်နှင့် သတိပေးချက်များကို ချိန်ညှိပါ။",
    budgetAmount: "လျာထားချက် ပမာဏ",
    warningAlert: "Warning Alert",
    criticalAlert: "Critical Alert",
    warningMsg: "သုံးငွေ %s%% ကျော်လွန်ပါက အဝါရောင်ဖြင့် သတိပေးပါမည်။",
    criticalMsg: "သုံးငွေ %s%% ကျော်လွန်ပါက အနီရောင်ဖြင့် အန္တရာယ်ပြပါမည်။",

    // Categories (Expense)
    cat_food: 'အစားအသောက်',
    cat_transport: 'လမ်းစရိတ်',
    cat_shopping: 'ဈေးဝယ်',
    cat_health: 'ကျန်းမာရေး',
    cat_bill: 'မီတာ/အင်တာနက်',
    cat_phone: 'ဖုန်းဘေလ်',
    cat_gift: 'လက်ဆောင်/အလှူ',
    cat_work: 'လုပ်ငန်းသုံး',
    cat_education: 'ပညာရေး',
    cat_general: 'အထွေထွေ',
    
    // Categories (Income)
    cat_salary: 'လစာ',
    cat_bonus: 'ဘောနပ်စ်',
    cat_sales: 'လုပ်ငန်း/အရောင်း',
    cat_pocket: 'မုန့်ဖိုး',
    cat_refund: 'ပြန်ရငွေ',
  },
  en: {
    // App Info
    appName: "MoneyNote",
    appDesc: "Smart Finance Tracker",
    welcome: "Welcome",
    
    // Auth
    loginTitle: "Welcome Back",
    loginSubtitle: "Sign in to manage your finances",
    registerTitle: "Create Account",
    registerSubtitle: "Get started in minutes",
    username: "Username",
    usernamePlaceholder: "e.g. johndoe",
    password: "Password",
    passwordPlaceholder: "Min 6 characters",
    loginBtn: "Sign In",
    registerBtn: "Sign Up",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    createAccount: "Create Account",
    signIn: "Sign In",
    warningTitle: "Warning:",
    warningText: "This system uses username only. If you forget your password, it cannot be recovered. Please remember your credentials.",
    
    // Features
    feat1: "Easily track income and expenses",
    feat2: "Detailed monthly visualization charts",
    feat3: "Manage finances with budget goals",
    feat4: "Secure personal account system",

    // Dashboard
    income: "Income",
    expense: "Expense",
    balance: "Balance",
    budgetTitle: "Monthly Budget Goal",
    setBudget: "Set Monthly Budget",
    setBudgetDesc: "Set a limit to manage savings",
    spent: "Spent",
    limit: "Limit",
    overSpent: "Overspent",
    warning: "Warning",
    warningDesc: "Limit exceeded. Please save.",
    normalState: "Spending is within normal limits.",
    dangerState: "Critical Level Reached",
    overBudgetMsg: "Overspent by",
    
    // Transaction Form
    addTransaction: "Add Transaction",
    editTransaction: "Edit Transaction",
    amount: "Amount",
    label: "Label",
    labelPlaceholderIncome: "e.g. Salary",
    labelPlaceholderExpense: "e.g. Breakfast",
    save: "Save Changes",
    add: "Add Transaction",
    
    // Table & Search
    searchPlaceholder: "Search by category or amount...",
    filters: "Filters:",
    date: "Date",
    noData: "No transactions yet",
    items: "items",
    
    // Actions
    edit: "Edit",
    delete: "Delete",
    cancel: "Cancel",
    confirmDelete: "Are you sure you want to delete this?",
    readOnly: "Past months are read-only.",
    
    // Chart
    chartTitle: "Daily Income/Expense Comparison",
    
    // History
    historyTitle: "History",
    noHistory: "No history available",
    backToCurrent: "Back to Current Month",
    
    // Settings
    settings: "Settings",
    changeCurrency: "Change Currency",
    changeLanguage: "Language",
    changeTheme: "Change Theme",
    dayMode: "Day Mode",
    nightMode: "Night Mode",
    feedback: "Feedback",
    export: "Export CSV",
    logout: "Logout",
    logoutConfirm: "Are you sure you want to logout?",
    exportConfirm: "Do you want to download current data as CSV?",
    get: "Download",
    
    // Budget Settings
    budgetSettingsTitle: "Budget Settings",
    budgetSettingsDesc: "Adjust budget limit and alert thresholds.",
    budgetAmount: "Budget Amount",
    warningAlert: "Warning Alert",
    criticalAlert: "Critical Alert",
    warningMsg: "Warn when spending exceeds %s%%.",
    criticalMsg: "Show critical alert when spending exceeds %s%%.",

    // Categories (Expense)
    cat_food: 'Food',
    cat_transport: 'Transport',
    cat_shopping: 'Shopping',
    cat_health: 'Health',
    cat_bill: 'Bills/Internet',
    cat_phone: 'Phone Bill',
    cat_gift: 'Gift/Donation',
    cat_work: 'Work',
    cat_education: 'Education',
    cat_general: 'General',
    
    // Categories (Income)
    cat_salary: 'Salary',
    cat_bonus: 'Bonus',
    cat_sales: 'Business/Sales',
    cat_pocket: 'Allowance',
    cat_refund: 'Refund',
  },
  ja: {
    // App Info
    appName: "MoneyNote",
    appDesc: "スマート家計簿",
    welcome: "ようこそ",
    
    // Auth
    loginTitle: "お帰りなさい",
    loginSubtitle: "ログインして家計を管理しましょう",
    registerTitle: "アカウント作成",
    registerSubtitle: "数分で始められます",
    username: "ユーザー名",
    usernamePlaceholder: "例：yamada",
    password: "パスワード",
    passwordPlaceholder: "6文字以上",
    loginBtn: "ログイン",
    registerBtn: "登録",
    noAccount: "アカウントをお持ちでないですか？",
    hasAccount: "すでにアカウントをお持ちですか？",
    createAccount: "アカウント作成",
    signIn: "ログイン",
    warningTitle: "注意:",
    warningText: "このシステムはユーザー名のみを使用します。パスワードを忘れた場合、復元できません。認証情報を忘れないようにしてください。",
    
    // Features
    feat1: "収入と支出を簡単に記録",
    feat2: "月ごとの詳細なグラフ表示",
    feat3: "予算目標を設定して管理",
    feat4: "安全な個人アカウントシステム",

    // Dashboard
    income: "収入",
    expense: "支出",
    balance: "残高",
    budgetTitle: "月間予算目標",
    setBudget: "月間予算を設定",
    setBudgetDesc: "貯蓄を管理するための上限を設定",
    spent: "使用済み",
    limit: "上限",
    overSpent: "超過",
    warning: "注意",
    warningDesc: "上限を超えています。節約してください。",
    normalState: "支出は正常範囲内です。",
    dangerState: "危険レベルに達しました",
    overBudgetMsg: "予算超過額:",
    
    // Transaction Form
    addTransaction: "取引を追加",
    editTransaction: "取引を編集",
    amount: "金額",
    label: "内容",
    labelPlaceholderIncome: "例：給料",
    labelPlaceholderExpense: "例：朝食",
    save: "保存",
    add: "追加",
    
    // Table & Search
    searchPlaceholder: "カテゴリまたは金額で検索...",
    filters: "フィルタ:",
    date: "日付",
    noData: "取引はまだありません",
    items: "件",
    
    // Actions
    edit: "編集",
    delete: "削除",
    cancel: "キャンセル",
    confirmDelete: "本当に削除しますか？",
    readOnly: "過去の月は閲覧専用です。",
    
    // Chart
    chartTitle: "日次収支比較",
    
    // History
    historyTitle: "履歴",
    noHistory: "履歴はありません",
    backToCurrent: "今月に戻る",
    
    // Settings
    settings: "設定",
    changeCurrency: "通貨変更",
    changeLanguage: "言語変更",
    changeTheme: "テーマ変更",
    dayMode: "デイモード",
    nightMode: "ナイトモード",
    feedback: "フィードバック",
    export: "CSV出力",
    logout: "ログアウト",
    logoutConfirm: "ログアウトしてもよろしいですか？",
    exportConfirm: "現在のデータをCSVとしてダウンロードしますか？",
    get: "ダウンロード",
    
    // Budget Settings
    budgetSettingsTitle: "予算設定",
    budgetSettingsDesc: "予算上限とアラートしきい値を調整します。",
    budgetAmount: "予算額",
    warningAlert: "警告アラート",
    criticalAlert: "危険アラート",
    warningMsg: "支出が %s%% を超えたら警告します。",
    criticalMsg: "支出が %s%% を超えたら危険アラートを表示します。",

    // Categories (Expense)
    cat_food: '食費',
    cat_transport: '交通費',
    cat_shopping: '買い物',
    cat_health: '医療費',
    cat_bill: '光熱費/ネット',
    cat_phone: '通信費',
    cat_gift: '交際費/寄付',
    cat_work: '事業経費',
    cat_education: '教育費',
    cat_general: 'その他',
    
    // Categories (Income)
    cat_salary: '給料',
    cat_bonus: 'ボーナス',
    cat_sales: '事業売上',
    cat_pocket: 'お小遣い',
    cat_refund: '返金',
  }
};
