
import React, { useState } from 'react';
import { Lang, Theme } from '../../types';
import { Monitor, Moon, Sun, Globe, Trash2, Database, Shield } from 'lucide-react';

interface SettingsModalProps {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  onClearHistory: () => void;
  onOpenDataControl: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ lang, setLang, theme, setTheme, onClearHistory, onOpenDataControl }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'data'>('general');

  const t = {
    general: lang === 'ar' ? 'عام' : 'General',
    theme: lang === 'ar' ? 'المظهر' : 'Theme',
    language: lang === 'ar' ? 'اللغة' : 'Language',
    data: lang === 'ar' ? 'البيانات' : 'Data Controls',
    clear: lang === 'ar' ? 'مسح سجل المحادثات' : 'Clear Chat History',
    light: lang === 'ar' ? 'فاتح' : 'Light',
    dark: lang === 'ar' ? 'داكن' : 'Dark',
    english: 'English',
    arabic: 'العربية',
    danger: lang === 'ar' ? 'منطقة الحذر' : 'Danger Zone',
    deleteDesc: lang === 'ar' ? 'حذف جميع المحادثات السابقة نهائياً' : 'Permanently delete all chats',
    openControl: lang === 'ar' ? 'فتح مركز التحكم بالبيانات' : 'Open Data Control Center',
    dataDesc: lang === 'ar' ? 'إدارة مصادر البيانات، وظائف الزحف، والتحقق من العقارات.' : 'Manage data sources, scraping jobs, and listing validation.'
  };

  return (
    <div className="flex flex-col md:flex-row h-full min-h-[320px] sm:min-h-[400px]">
      {/* Sidebar Tabs */}
      <div className="w-full md:w-1/4 bg-white dark:bg-slate-950 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-2 flex md:flex-col gap-1 overflow-x-auto shrink-0">
        <button 
          onClick={() => setActiveTab('general')}
          className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'general' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
        >
          <Monitor className="w-4 h-4 shrink-0" />
          <span>{t.general}</span>
        </button>
        <button 
          onClick={() => setActiveTab('data')}
          className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'data' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
        >
          <Database className="w-4 h-4 shrink-0" />
          <span>{t.data}</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-3.5 sm:p-6 bg-slate-50 dark:bg-slate-900 overflow-y-auto">
        
        {activeTab === 'general' && (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
            {/* Theme Section */}
            <section>
              <h3 className="text-xs sm:text-sm font-medium text-slate-500 mb-2 sm:mb-3 uppercase tracking-wider">{t.theme}</h3>
              <div className="flex gap-2 bg-white dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 w-full sm:w-fit">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-xs sm:text-sm transition-all ${theme === 'light' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
                >
                  <Sun className="w-4 h-4 shrink-0" />
                  <span>{t.light}</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-xs sm:text-sm transition-all ${theme === 'dark' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
                >
                  <Moon className="w-4 h-4 shrink-0" />
                  <span>{t.dark}</span>
                </button>
              </div>
            </section>

            <hr className="border-slate-200 dark:border-slate-800" />

            {/* Language Section */}
            <section>
              <h3 className="text-xs sm:text-sm font-medium text-slate-500 mb-2 sm:mb-3 uppercase tracking-wider">{t.language}</h3>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 max-w-sm">
                <button
                  onClick={() => setLang('en')}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium flex items-center justify-between ${lang === 'en' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300'}`}
                >
                  <span>{t.english}</span>
                  {lang === 'en' && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                </button>
                <button
                  onClick={() => setLang('ar')}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium flex items-center justify-between ${lang === 'ar' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300'}`}
                >
                  <span>{t.arabic}</span>
                  {lang === 'ar' && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                </button>
              </div>
            </section>

            <hr className="border-slate-200 dark:border-slate-800" />

            {/* Clear History */}
            <section>
              <h3 className="text-sm font-medium text-red-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4" />
                {t.danger}
              </h3>
              <button
                onClick={onClearHistory}
                className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/10 dark:hover:border-red-900 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                      <Trash2 className="w-5 h-5 text-slate-500 group-hover:text-red-500" />
                  </div>
                  <div className="text-start">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-red-600 dark:group-hover:text-red-400">{t.clear}</div>
                      <div className="text-xs text-slate-500">{t.deleteDesc}</div>
                  </div>
                </div>
              </button>
            </section>
          </div>
        )}

        {activeTab === 'data' && (
           <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in duration-200">
             <div className="p-4 bg-white dark:bg-slate-950 rounded-full shadow-sm">
                <Database className="w-12 h-12 text-slate-300 dark:text-slate-600" />
             </div>
             <div className="max-w-xs">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{t.data}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t.dataDesc}
                </p>
             </div>
             <button 
                onClick={onOpenDataControl}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-md shadow-blue-200 dark:shadow-none flex items-center gap-2"
             >
                <Database className="w-4 h-4" />
                {t.openControl}
             </button>
           </div>
        )}

      </div>
    </div>
  );
};

export default SettingsModal;
