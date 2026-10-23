import React from 'react';
import { UserRole, Lang, Theme } from '../types';
import { 
  ShoppingBag, 
  Tag, 
  TrendingUp, 
  Users, 
  ArrowRight, 
  Globe, 
  MessageSquare,
  Moon,
  Sun
} from 'lucide-react';
import Logo from './Logo';

interface WelcomeScreenProps {
  onSelectRole: (role: UserRole) => void;
  lang: Lang;
  setLang: (lang: Lang) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  onSignIn: () => void;
  authError: string;
  isSignedIn: boolean;
  onClose?: () => void;
  currentRole?: UserRole;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
  onSelectRole, 
  lang, 
  setLang,
  theme,
  setTheme,
  onSignIn,
  authError,
  isSignedIn,
  onClose,
  currentRole
}) => {
  const isAr = lang === 'ar';

  const t = {
    welcome: isAr ? 'أهلاً بك في عقار AI' : 'Welcome to Aqar AI',
    subtitle: isAr ? 'مستشارك العقاري الذكي المتخصص في الرياض والسوق السعودي' : 'Your intelligent Saudi real estate assistant for Riyadh and KSA market',
    select: isAr ? 'حدد اهتمامك للبدء' : 'Choose your focus to get tailored intelligence',
    backToChat: isAr ? 'العودة للمحادثة' : 'Back to Chat',
    
    buyer: isAr ? 'باحث عن عقار / مستأجر' : 'Buyer & Tenant',
    buyerDesc: isAr ? 'استكشاف الفلل، الشقق، والأراضي، مع فحص الأحياء والأسعار' : 'Explore villas, apartments, and land with district insights',
    
    seller: isAr ? 'مالك / عارض عقار' : 'Property Owner & Seller',
    sellerDesc: isAr ? 'تقييم الوحدات، تسعير المتر العادل، ومعايير البناء' : 'Appraise properties, price per sqm, and building compliance',
    
    investor: isAr ? 'مستثمر عقاري' : 'Real Estate Investor',
    investorDesc: isAr ? 'تحليل العوائد الإيجارية، دراسات الجدوى، والفرص الواعدة' : 'Analyze rental yields, capital growth, and Vision 2030 zones',
    
    agent: isAr ? 'وسيط عقاري معتمد' : 'Real Estate Broker & Agent',
    agentDesc: isAr ? 'إدارة العملاء، مقارنة الوحدات، ومتابعة الصفقات' : 'Lead management, unit comparisons, and Saudi brokerage compliance',
    
    guest: isAr ? 'المتابعة كزائر عام' : 'Continue as Guest',
    activeRole: isAr ? 'الدور الحالي' : 'Current'
  };

  const ROLES_LIST = [
    {
      id: 'buyer' as UserRole,
      title: t.buyer,
      desc: t.buyerDesc,
      icon: ShoppingBag,
      badge: isAr ? 'شراء وإيجار' : 'Buy & Rent'
    },
    {
      id: 'seller' as UserRole,
      title: t.seller,
      desc: t.sellerDesc,
      icon: Tag,
      badge: isAr ? 'تسويق وتقييم' : 'Sell & Appraise'
    },
    {
      id: 'investor' as UserRole,
      title: t.investor,
      desc: t.investorDesc,
      icon: TrendingUp,
      badge: isAr ? 'عوائد واستثمار' : 'Yields & ROI'
    },
    {
      id: 'agent' as UserRole,
      title: t.agent,
      desc: t.agentDesc,
      icon: Users,
      badge: isAr ? 'وساطة وعملاء' : 'Brokerage'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#000000] text-neutral-900 dark:text-neutral-100 flex flex-col items-center justify-between sm:justify-center p-3 sm:p-6 relative select-none overflow-y-auto" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Top Controls Bar */}
      <div className="w-full max-w-2xl sm:max-w-4xl flex items-center justify-between z-20 sm:absolute sm:top-5 sm:inset-x-6 mx-auto mb-3 sm:mb-0 pt-2 sm:pt-0">
        {onClose ? (
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 dark:bg-[#161618]/80 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] rounded-full text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition-all shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5 stroke-[1.8]" />
            <span>{t.backToChat}</span>
          </button>
        ) : (
          <div />
        )}

        <div className="flex flex-wrap justify-end items-center gap-2">
        {!isSignedIn && <button
          onClick={onSignIn}
          className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/80 dark:bg-[#161618]/80 text-neutral-700 dark:text-neutral-300 border border-black/[0.06] dark:border-white/[0.08] shadow-sm"
        >{isAr ? 'تسجيل الدخول' : 'Sign in'}</button>}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 dark:bg-[#161618]/80 border border-black/[0.06] dark:border-white/[0.08] rounded-full text-xs font-medium text-neutral-700 dark:text-neutral-300 shadow-sm"
          aria-label={isAr ? (theme === 'light' ? 'الوضع الداكن' : 'الوضع الفاتح') : (theme === 'light' ? 'Dark mode' : 'Light mode')}
        >
          {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          <span>{isAr ? (theme === 'light' ? 'داكن' : 'فاتح') : (theme === 'light' ? 'Dark' : 'Light')}</span>
        </button>
        <button
          onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 dark:bg-[#161618]/80 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] rounded-full text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition-all shadow-sm"
        >
          <Globe className="w-3.5 h-3.5 stroke-[1.8]" />
          <span>{lang === 'en' ? 'العربية' : 'English'}</span>
        </button>
        </div>
      </div>
      {authError && <p role="alert" className="z-20 text-sm text-red-600 dark:text-red-400 max-w-lg text-center">{authError}</p>}

      {/* Main Container */}
      <div className="z-10 w-full max-w-2xl flex flex-col items-center animate-in fade-in duration-400 py-3 sm:py-6">
        <Logo size="md" lang={lang} className="mb-3 sm:mb-4 sm:hidden" />
        <Logo size="lg" lang={lang} className="mb-4 hidden sm:inline-flex" />
        
        <div className="text-center mb-4 sm:mb-6 space-y-1 sm:space-y-1.5 max-w-md px-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">
            {t.welcome}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-normal">
            {t.subtitle}
          </p>
        </div>

        {/* Compact, Balanced Focus Cards */}
        <div className="w-full space-y-2.5 sm:space-y-3">
          <div className="px-1 text-center sm:text-left rtl:sm:text-right">
            <span className="text-[10px] sm:text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              {t.select}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {ROLES_LIST.map((roleItem) => {
              const Icon = roleItem.icon;
              const isCurrent = currentRole === roleItem.id;

              return (
                <button 
                  key={roleItem.id}
                  onClick={() => onSelectRole(roleItem.id)}
                  className={`group relative flex flex-col items-start p-3 sm:p-4 bg-white dark:bg-[#161618] border rounded-xl sm:rounded-2xl transition-all duration-200 w-full text-left rtl:text-right ${
                    isCurrent 
                      ? 'border-[#0071E3] ring-1.5 ring-[#0071E3]/25 shadow-sm' 
                      : 'border-black/[0.06] dark:border-white/[0.08] hover:border-black/20 dark:hover:border-white/20 hover:shadow-md'
                  }`}
                >
                  <div className="w-full flex items-center justify-between mb-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] text-neutral-800 dark:text-neutral-200 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.8]" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/[0.03] dark:bg-white/[0.05] text-neutral-500 dark:text-neutral-400">
                        {roleItem.badge}
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#0071E3]">
                          {t.activeRole}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xs sm:text-sm font-semibold tracking-tight text-neutral-950 dark:text-neutral-50 mb-0.5 sm:mb-1 transition-colors">
                    {roleItem.title}
                  </h3>
                  
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed min-h-0 sm:min-h-[30px]">
                    {roleItem.desc}
                  </p>

                  <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-[#0071E3] sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <span>{isAr ? 'اختيار ومتابعة' : 'Select'}</span>
                    <ArrowRight className="w-3 h-3 rtl:rotate-180 stroke-[2]" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Continue as Guest option */}
          <div className="pt-2 sm:pt-3 text-center">
            <button 
              onClick={() => onSelectRole('guest')}
              className="text-xs font-medium text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors py-1.5 px-3 rounded-full hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
            >
              {t.guest}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
