import React, { createContext, useContext, useState, useEffect } from 'react';
export type Language = 'en' | 'hi';
export type Theme = 'dark' | 'light';
interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
  plan: 'free' | 'pro';
}
interface AppContextType {
  // Auth
  user: User | null;
  isLoggedIn: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}
// ── Translations ──────────────────────────────────────────────────────────────
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    'nav.upload': 'Upload',
    'nav.repository': 'Repository',
    'nav.templates': 'Templates',
    'nav.settings': 'Settings',
    'nav.profile': 'Profile',
    // Auth
    'auth.signin': 'Sign In',
    'auth.signup': 'Sign Up',
    'auth.signout': 'Sign Out',
    'auth.signinGoogle': 'Continue with Google',
    'auth.signinEmail': 'Sign in with Email',
    'auth.email': 'Email address',
    'auth.password': 'Password',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.welcome': 'Welcome back',
    'auth.tagline': 'AI-powered contract intelligence for Indian MSMEs',
    'auth.signInToContinue': 'Sign in to continue',
    // Profile
    'profile.title': 'Profile',
    'profile.personalInfo': 'Personal Information',
    'profile.displayName': 'Display Name',
    'profile.email': 'Email',
    'profile.phone': 'Phone Number',
    'profile.account': 'Account',
    'profile.plan': 'Plan',
    'profile.security': 'Security',
    'profile.changePassword': 'Change Password',
    'profile.currentPassword': 'Current Password',
    'profile.newPassword': 'New Password',
    'profile.confirmPassword': 'Confirm New Password',
    'profile.notifications': 'Notifications',
    'profile.emailAlerts': 'Email alerts for risk flags',
    'profile.weeklyDigest': 'Weekly contract digest',
    'profile.dangerZone': 'Danger Zone',
    'profile.deleteAccount': 'Delete Account',
    'profile.saveChanges': 'Save Changes',
    'profile.contractsAnalyzed': 'Contracts Analyzed',
    'profile.clausesFlagged': 'Clauses Flagged',
    'profile.reportsGenerated': 'Reports Generated',
    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.appearance': 'Appearance',
    'settings.theme': 'Theme',
    'settings.darkMode': 'Dark Mode',
    'settings.lightMode': 'Light Mode',
    'settings.analysisDefaults': 'Analysis Defaults',
    'settings.riskThreshold': 'Default Risk Threshold',
    'settings.maxClauses': 'Max Clauses to Analyze',
    'settings.ocrEnabled': 'Enable OCR for Scanned PDFs',
    'settings.dataPrivacy': 'Data & Privacy',
    'settings.exportData': 'Export My Data',
    'settings.clearHistory': 'Clear Analysis History',
    'settings.about': 'About',
    'settings.version': 'App Version',
    'settings.changelog': 'View Changelog',
    'settings.saveSettings': 'Save Settings',
    // Settings descriptions
    'settings.sub': 'Manage your preferences and application settings.',
    'settings.language.desc': 'Choose the language for the entire application interface.',
    'settings.appearance.desc': 'Switch between dark and light mode.',
    'settings.analysisDefaults.desc': 'Configure how Vakya analyses your contracts by default.',
    'settings.ocrEnabled.desc': 'Automatically detect and process image-based PDFs.',
    'settings.dataPrivacy.desc': 'Manage your stored data and privacy options.',
    'settings.exportData.desc': 'Download all your contracts and reports as a ZIP file.',
    'settings.clearHistory.desc': 'Remove all past analyses and cached results.',
    'settings.about.desc': 'Application details and update information.',
    'settings.riskThreshold.low': 'Flag every clause with any potential issue (more alerts).',
    'settings.riskThreshold.medium': 'Flag medium and high risk clauses only (recommended).',
    'settings.riskThreshold.high': 'Only flag critical risks (fewer, higher-priority alerts).',
    'settings.build': 'Build',
    'settings.llmModel': 'LLM Model',
    // Profile descriptions
    'profile.personalInfo.desc': 'Update your public display name and contact details.',
    'profile.security.desc': 'Change your password and manage active sessions.',
    'profile.notifications.desc': 'Choose which updates you want to receive.',
    'profile.dangerZone.desc': 'Irreversible actions that affect your account.',
    'profile.email.readonly': 'Email cannot be changed after signup.',
    'profile.accountType': 'Account Type',
    'profile.currentSession': 'Current session',
    'profile.currentSession.desc': 'This device · Active now',
    'profile.riskAlerts': 'Instant risk alerts via email',
    'profile.signOutAll': 'Sign Out All',
    'profile.signOutAll.desc': 'This will end all active sessions immediately.',
    'profile.deleteAccount.desc': 'This action is irreversible and will delete all your data.',
    'profile.deleteConfirm': 'Delete account?',
    'profile.deleteConfirm.desc': 'This will permanently delete all your contracts, reports, and account data. This cannot be undone.',
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.delete': 'Delete',
    'common.freePlan': 'Free Plan',
    'common.proPlan': 'Pro Plan',
    'common.export': 'Export',
    'common.clear': 'Clear',
    'common.active': 'Active',
  },
  hi: {
    // Nav
    'nav.upload': 'अपलोड',
    'nav.repository': 'रिपोजिटरी',
    'nav.templates': 'टेम्पलेट',
    'nav.settings': 'सेटिंग्स',
    'nav.profile': 'प्रोफ़ाइल',
    // Auth
    'auth.signin': 'साइन इन करें',
    'auth.signup': 'साइन अप करें',
    'auth.signout': 'साइन आउट',
    'auth.signinGoogle': 'Google से जारी रखें',
    'auth.signinEmail': 'ईमेल से साइन इन करें',
    'auth.email': 'ईमेल पता',
    'auth.password': 'पासवर्ड',
    'auth.noAccount': 'खाता नहीं है?',
    'auth.hasAccount': 'पहले से खाता है?',
    'auth.welcome': 'वापस स्वागत है',
    'auth.tagline': 'भारतीय MSMEs के लिए AI-संचालित अनुबंध विश्लेषण',
    'auth.signInToContinue': 'जारी रखने के लिए साइन इन करें',
    // Profile
    'profile.title': 'प्रोफ़ाइल',
    'profile.personalInfo': 'व्यक्तिगत जानकारी',
    'profile.displayName': 'प्रदर्शन नाम',
    'profile.email': 'ईमेल',
    'profile.phone': 'फोन नंबर',
    'profile.account': 'खाता',
    'profile.plan': 'प्लान',
    'profile.security': 'सुरक्षा',
    'profile.changePassword': 'पासवर्ड बदलें',
    'profile.currentPassword': 'वर्तमान पासवर्ड',
    'profile.newPassword': 'नया पासवर्ड',
    'profile.confirmPassword': 'नया पासवर्ड पुष्टि करें',
    'profile.notifications': 'सूचनाएं',
    'profile.emailAlerts': 'जोखिम के लिए ईमेल अलर्ट',
    'profile.weeklyDigest': 'साप्ताहिक अनुबंध सारांश',
    'profile.dangerZone': 'खतरनाक क्षेत्र',
    'profile.deleteAccount': 'खाता हटाएं',
    'profile.saveChanges': 'बदलाव सहेजें',
    'profile.contractsAnalyzed': 'विश्लेषित अनुबंध',
    'profile.clausesFlagged': 'चिह्नित खंड',
    'profile.reportsGenerated': 'उत्पन्न रिपोर्ट',
    // Settings
    'settings.title': 'सेटिंग्स',
    'settings.language': 'भाषा',
    'settings.appearance': 'रूप-रंग',
    'settings.theme': 'थीम',
    'settings.darkMode': 'डार्क मोड',
    'settings.lightMode': 'लाइट मोड',
    'settings.analysisDefaults': 'विश्लेषण डिफ़ॉल्ट',
    'settings.riskThreshold': 'डिफ़ॉल्ट जोखिम सीमा',
    'settings.maxClauses': 'अधिकतम विश्लेषण खंड',
    'settings.ocrEnabled': 'स्कैन किए PDF के लिए OCR सक्षम करें',
    'settings.dataPrivacy': 'डेटा और गोपनीयता',
    'settings.exportData': 'मेरा डेटा निर्यात करें',
    'settings.clearHistory': 'विश्लेषण इतिहास साफ़ करें',
    'settings.about': 'जानकारी',
    'settings.version': 'ऐप संस्करण',
    'settings.changelog': 'परिवर्तन लॉग देखें',
    'settings.saveSettings': 'सेटिंग्स सहेजें',
    // Settings descriptions
    'settings.sub': 'अपनी प्राथमिकताएं और एप्लिकेशन सेटिंग्स प्रबंधित करें।',
    'settings.language.desc': 'पूरे एप्लिकेशन इंटरफेस के लिए भाषा चुनें।',
    'settings.appearance.desc': 'डार्क और लाइट मोड के बीच स्विच करें।',
    'settings.analysisDefaults.desc': 'Vakya डिफ़ॉल्ट रूप से आपके अनुबंधों का विश्लेषण कैसे करे, इसे कॉन्फ़िगर करें।',
    'settings.ocrEnabled.desc': 'इमेज-आधारित PDF को स्वचालित रूप से पहचानें और प्रोसेस करें।',
    'settings.dataPrivacy.desc': 'अपना संग्रहीत डेटा और गोपनीयता विकल्प प्रबंधित करें।',
    'settings.exportData.desc': 'अपने सभी अनुबंध और रिपोर्ट ZIP फ़ाइल के रूप में डाउनलोड करें।',
    'settings.clearHistory.desc': 'सभी पिछले विश्लेषण और कैश्ड परिणाम हटाएं।',
    'settings.about.desc': 'एप्लिकेशन विवरण और अपडेट जानकारी।',
    'settings.riskThreshold.low': 'किसी भी संभावित समस्या वाले हर खंड को चिह्नित करें (अधिक अलर्ट)।',
    'settings.riskThreshold.medium': 'केवल मध्यम और उच्च जोखिम वाले खंडों को चिह्नित करें (अनुशंसित)।',
    'settings.riskThreshold.high': 'केवल गंभीर जोखिमों को चिह्नित करें (कम, उच्च-प्राथमिकता अलर्ट)।',
    'settings.build': 'बिल्ड',
    'settings.llmModel': 'LLM मॉडल',
    // Profile descriptions
    'profile.personalInfo.desc': 'अपना सार्वजनिक प्रदर्शन नाम और संपर्क विवरण अपडेट करें।',
    'profile.security.desc': 'अपना पासवर्ड बदलें और सक्रिय सत्र प्रबंधित करें।',
    'profile.notifications.desc': 'चुनें कि आप कौन से अपडेट प्राप्त करना चाहते हैं।',
    'profile.dangerZone.desc': 'अपरिवर्तनीय क्रियाएं जो आपके खाते को प्रभावित करती हैं।',
    'profile.email.readonly': 'साइनअप के बाद ईमेल नहीं बदला जा सकता।',
    'profile.accountType': 'खाता प्रकार',
    'profile.currentSession': 'वर्तमान सत्र',
    'profile.currentSession.desc': 'यह डिवाइस · अभी सक्रिय',
    'profile.riskAlerts': 'ईमेल द्वारा तत्काल जोखिम अलर्ट',
    'profile.signOutAll': 'सभी से साइन आउट करें',
    'profile.signOutAll.desc': 'यह सभी सक्रिय सत्र तुरंत समाप्त कर देगा।',
    'profile.deleteAccount.desc': 'यह क्रिया अपरिवर्तनीय है और आपका सारा डेटा हटा देगी।',
    'profile.deleteConfirm': 'खाता हटाएं?',
    'profile.deleteConfirm.desc': 'यह आपके सभी अनुबंध, रिपोर्ट और खाता डेटा स्थायी रूप से हटा देगा। यह पूर्ववत नहीं किया जा सकता।',
    // Common
    'common.save': 'सहेजें',
    'common.cancel': 'रद्द करें',
    'common.confirm': 'पुष्टि करें',
    'common.delete': 'हटाएं',
    'common.freePlan': 'फ्री प्लान',
    'common.proPlan': 'प्रो प्लान',
    'common.export': 'निर्यात करें',
    'common.clear': 'साफ़ करें',
    'common.active': 'सक्रिय',
  },
};
const AppContext = createContext<AppContextType | null>(null);
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('vakya_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('vakya_lang') as Language) || 'en';
  });
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('vakya_theme') as Theme) || 'dark';
  });
  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('vakya_theme', theme);
  }, [theme]);
  // Apply language class to <html>
  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
    localStorage.setItem('vakya_lang', language);
  }, [language]);
  const login = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('vakya_user', JSON.stringify(newUser));
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem('vakya_user');
  };
  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('vakya_user', JSON.stringify(updated));
  };
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };
  const setTheme = (t: Theme) => {
    setThemeState(t);
  };
  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  };
  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };
  return (
    <AppContext.Provider value={{
      user, isLoggedIn: !!user, login, logout, updateUser,
      language, setLanguage, t,
      theme, setTheme, toggleTheme,
    }}>
      {children}
    </AppContext.Provider>
  );
};
export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
