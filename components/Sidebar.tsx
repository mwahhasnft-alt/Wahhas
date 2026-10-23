import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  X, 
  Building2, 
  Settings, 
  LogOut, 
  BarChart3, 
  Atom, 
  ChevronRight,
  Database,
  Cloud,
  Home
} from 'lucide-react';
import { ChatSession, Lang, UserProfile, ModalType } from '../types';
import Logo from './Logo';
import { signInWithGoogle, signOutUser } from "../services/firebase";
import { ROLE_TRANSLATIONS } from '../App';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  lang: Lang;
  user: UserProfile;
  onOpenModal: (type: ModalType) => void;
  onSwitchRole: () => void;
  onFirebaseLoginSuccess?: (user: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  lang,
  user,
  onOpenModal,
  onSwitchRole,
}) => {
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const isAr = lang === 'ar';

  const handleFirebaseGoogleLogin = async () => {
    setIsAuthLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Firebase Google Login failed:", error);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleFirebaseLogout = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error("Firebase Signout error:", error);
    }
  };

  const isFirebaseConnected = user.isFirebaseUser || !!user.uid;
  const roleLabel = ROLE_TRANSLATIONS[user.role]?.[lang] || user.role;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* macOS-style Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 ${isAr ? 'right-0' : 'left-0'} z-40 w-72 max-w-[85vw] bg-[#F5F5F7] dark:bg-[#121214] text-neutral-800 dark:text-neutral-200 transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col border-r ${isAr ? 'border-r-0 border-l' : ''} border-black/[0.06] dark:border-white/[0.08] md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : (isAr ? 'translate-x-full' : '-translate-x-full')
        }`}
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Top Header with Clickable Logo to return Home */}
        <div className="p-4 flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.06]">
          <button 
            onClick={() => {
              onSwitchRole();
              onClose();
            }}
            className="flex items-center hover:opacity-80 transition-opacity text-left rtl:text-right"
            title={isAr ? 'الصفحة الرئيسية: اختيار الدور' : 'Home: Choose Role'}
          >
            <Logo size="md" lang={lang} />
          </button>
          <button 
            onClick={onClose} 
            className="md:hidden p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1C1C1E] text-neutral-800 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-[#252528] border border-black/[0.06] dark:border-white/[0.08] shadow-sm text-sm font-medium transition-all group active:scale-[0.99]"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#0071E3] stroke-[2]" />
              <span>{isAr ? 'محادثة جديدة' : 'New Chat'}</span>
            </span>
            <span className="text-[11px] font-mono text-neutral-400 opacity-60">⌘K</span>
          </button>
        </div>

        {/* Navigation Section */}
        <div className="px-3 py-1 space-y-1">
          {/* Home / Role Selection Button */}
          <button
            onClick={() => {
              onSwitchRole();
              onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-neutral-900 dark:text-neutral-100 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.07] dark:hover:bg-white/[0.10] border border-black/[0.04] dark:border-white/[0.06] transition-colors"
            title={isAr ? 'الصفحة الرئيسية: التبديل بين مشتري، بائع، مستثمر' : 'Home: Switch between Buyer, Seller, Investor'}
          >
            <span className="flex items-center gap-2.5">
              <Home className="w-4 h-4 text-[#0071E3] stroke-[1.8]" />
              <span>{isAr ? 'الرئيسية (اختيار الاهتمام)' : 'Home (Choose Role)'}</span>
            </span>
            <span className="text-[10px] text-[#0071E3] font-medium bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md">
              {roleLabel}
            </span>
          </button>

          <button
            onClick={() => {
              onOpenModal('properties');
              onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 stroke-[1.6]" />
              <span>{isAr ? 'تصفح العقارات' : 'Browse Properties'}</span>
            </span>
            <ChevronRight className={`w-3.5 h-3.5 opacity-40 ${isAr ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={() => {
              onOpenModal('market_insights');
              onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <BarChart3 className="w-4 h-4 stroke-[1.6]" />
              <span>{isAr ? 'رؤى السوق العقاري' : 'Market Insights'}</span>
            </span>
            <ChevronRight className={`w-3.5 h-3.5 opacity-40 ${isAr ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={() => {
              onOpenModal('science');
              onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <Atom className="w-4 h-4 stroke-[1.6]" />
              <span>{isAr ? 'العلوم البيئية والتربة' : 'Science & Geotechnics'}</span>
            </span>
            <ChevronRight className={`w-3.5 h-3.5 opacity-40 ${isAr ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Divider */}
        <div className="my-2 mx-4 h-px bg-black/[0.04] dark:bg-white/[0.06]" />

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5 scrollbar-thin">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            {isAr ? 'المحادثات الأخيرة' : 'Recent'}
          </div>

          {sessions.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-neutral-400">
              {isAr ? 'لا توجد محادثات سابقة' : 'No conversations yet'}
            </div>
          ) : (
            sessions.map((session) => {
              const isSelected = session.id === currentSessionId;
              const displayTitle = (session.title === "New Chat" || session.title === "محادثة جديدة")
                ? (isAr ? "محادثة جديدة" : "New Chat")
                : (session.title || (isAr ? "محادثة" : "Chat"));

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    onClose();
                  }}
                  className={`group flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs transition-colors ${
                    isSelected 
                      ? 'bg-black/[0.08] dark:bg-white/[0.10] text-neutral-900 dark:text-white font-medium' 
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate flex-1">
                    <MessageSquare className="w-3.5 h-3.5 stroke-[1.5] opacity-50 shrink-0" />
                    <span className="truncate">{displayTitle}</span>
                  </div>
                  
                  <button
                    onClick={(e) => onDeleteSession(session.id, e)}
                    className="opacity-70 md:opacity-0 md:group-hover:opacity-100 p-1.5 hover:text-red-500 transition-opacity"
                    title={isAr ? 'حذف' : 'Delete'}
                    aria-label="Delete chat"
                  >
                    <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Apple ID Style Account Footer */}
        <div className="p-3 border-t border-black/[0.06] dark:border-white/[0.08] bg-white/40 dark:bg-black/20">
          {isFirebaseConnected ? (
            <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-semibold text-xs overflow-hidden shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
                <div className="truncate text-left rtl:text-right">
                  <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                    {user.name}
                  </div>
                  <div className="text-[11px] text-neutral-400 truncate">
                    {roleLabel}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onOpenModal('settings')}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors"
                  title={isAr ? 'الإعدادات' : 'Settings'}
                >
                  <Settings className="w-4 h-4 stroke-[1.6]" />
                </button>
                <button
                  onClick={handleFirebaseLogout}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors"
                  title={isAr ? 'تسجيل الخروج' : 'Log out'}
                >
                  <LogOut className="w-4 h-4 stroke-[1.6]" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleFirebaseGoogleLogin}
              disabled={isAuthLoading}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] text-xs font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-[#252528] shadow-sm transition-all"
            >
              <Cloud className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>{isAuthLoading ? (isAr ? 'جاري الاتصال...' : 'Connecting...') : (isAr ? 'تسجيل الدخول عبر Google' : 'Sign in with Google')}</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
