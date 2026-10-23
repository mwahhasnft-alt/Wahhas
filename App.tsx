import React, { useState, useRef, useEffect } from 'react';
import { 
  MapPin, 
  Building2, 
  Menu, 
  Zap, 
  Brain, 
  Sparkles, 
  Globe, 
  ArrowRight, 
  Bot, 
  Atom, 
  Cloud,
  CheckCircle2,
  TrendingUp,
  ChevronDown,
  Home,
  Settings
} from 'lucide-react';
import MessageBubble from './components/MessageBubble';
import Sidebar from './components/Sidebar';
import { Message, ChatSession, Lang, Theme, UserProfile, ModalType, ChatMode, Property, UserRole } from './types';
import { sendMessageToGemini, startChatSession, transcribeAudio, autoDetectChatMode } from './services/gemini';
import { LiveClient, LiveState } from './services/live';
import LiveSessionOverlay from './components/LiveSessionOverlay';
import { PropertyService } from './services/propertyService'; 
import Logo from './components/Logo';
import ChatInput from './components/ChatInput';
import WelcomeScreen from './components/WelcomeScreen';
import CompareBar from './components/CompareBar';

// Firebase Service
import { 
  auth, 
  signInWithGoogle, 
  signOutUser, 
  savePropertyToFirestore, 
  removeSavedPropertyFromFirestore, 
  getSavedPropertiesFromFirestore, 
  persistChatSession, 
  persistChatMessage, 
  loadUserChatSessions,
  getUserProfile
} from './services/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

// Modals
import Modal from './components/Modal';
import SettingsModal from './components/modals/SettingsModal';
import { ADMIN_VISIBILITY_KEY, Inventory, watchAdminAccess, setAdminButtonVisible } from './services/listingInventory';
import ProfileModal from './components/modals/ProfileModal';
import PropertiesModal from './components/modals/PropertiesModal';
import PropertyDetailsModal from './components/modals/PropertyDetailsModal';
import DataControlModal from './components/modals/DataControlModal';
import MarketInsightsModal from './components/modals/MarketInsightsModal';
import CompareModal from './components/modals/CompareModal';
import ScienceModal from './components/modals/ScienceModal';

export const ROLE_TRANSLATIONS = {
    buyer: { en: 'Buyer', ar: 'باحث عن عقار' },
    seller: { en: 'Seller', ar: 'مالك / عارض' },
    investor: { en: 'Investor', ar: 'مستثمر' },
    agent: { en: 'Agent', ar: 'وسيط عقاري' },
    guest: { en: 'Guest', ar: 'زائر' },
    admin: { en: 'Admin', ar: 'مسؤول النظام' }
};

const TRANSLATIONS = {
  en: {
    welcome: "Hello! I am Aqar AI. How can I help you explore, assess, or invest in Saudi real estate today?",
    greeting: "Hello",
    greetingSub: "How can I help you explore real estate today?",
    placeholder: "Ask about properties, Riyadh districts, prices, or science...",
    listening: "Listening...",
    disclaimer: "Aqar AI can make mistakes. Please verify listing details and official records.",
    speaking: "Speaking...",
    activeMode: "Active Mode:",
    signIn: "Sign in with Google",
    connected: "Connected",
    titles: {
        settings: "Settings",
        profile: "My Profile",
        properties: "Properties",
        property_details: "Property Details",
        data_control: "Data Control",
        market_insights: "Market Insights",
        compare: "Property Comparison",
        science: "Science & Geotechnics"
    },
    modes: {
        smart: "Smart (3.8)",
        fast: "Fast (Lite)",
        thinking: "Deep Think",
        search: "Search Grounded",
        maps: "Maps Grounded",
        science: "Science & Soil"
    },
    status: {
        thinking: "Thinking deeply...",
        searching: "Searching Google web...",
        mapping: "Locating on Google Maps...",
        science: "Querying scientific databases (Europe PMC)...",
        processing: "Processing..."
    }
  },
  ar: {
    welcome: "أهلاً بك في عقار AI. مستشارك العقاري والعلمي الذكي، كيف يمكنني خدمتك في سوق الرياض والعقار السعودي اليوم؟",
    greeting: "أهلاً بك",
    greetingSub: "كيف يمكنني مساعدتك في رحلتك العقارية اليوم؟",
    placeholder: "اسأل عن الأسعار، الأحياء، الخرائط، أبحاث التربة والاستدامة...",
    listening: "جاري الاستماع...",
    disclaimer: "الذكاء الاصطناعي قد يخطئ. يرجى دائماً التحقق من تفاصيل العقار والسجلات الرسمية.",
    speaking: "أتحدث الآن...",
    activeMode: "الوضع النشط:",
    signIn: "تسجيل الدخول عبر Google",
    connected: "متصل بحسابك",
    titles: {
        settings: "الإعدادات العامة",
        profile: "الملف الشخصي",
        properties: "تصفح العقارات",
        property_details: "تفاصيل العقار",
        data_control: "إدارة البيانات",
        market_insights: "رؤى السوق العقاري",
        compare: "مقارنة العقارات",
        science: "العلوم البيئية والتربة"
    },
    modes: {
        smart: "ذكاء شامل",
        fast: "رد سريع",
        thinking: "تحليل عميق",
        search: "بحث الويب المباشر",
        maps: "خرائط جوجل الحية",
        science: "العلوم والأبحاث"
    },
    status: {
        thinking: "جاري التفكير العميق...",
        searching: "جاري البحث المباشر في الويب...",
        mapping: "جاري التحقق من خرائط جوجل...",
        science: "جاري فحص الأبحاث في Europe PMC...",
        processing: "جاري المعالجة..."
    }
  }
};

const DEFAULT_WELCOME_MSG: Message = {
    id: 'welcome',
    role: 'model',
    content: TRANSLATIONS.en.welcome,
    timestamp: new Date()
};

interface CriticalPrompt {
  title: string;
  prompt: string;
  icon: React.ElementType;
}

const getCriticalPrompts = (role: UserRole, lang: Lang): CriticalPrompt[] => {
  const isAr = lang === 'ar';
  if (role === 'buyer') {
    return [
      {
        title: isAr ? 'فلل مودرن في الملقا' : 'Villas in Al Malqa',
        prompt: isAr ? 'أبحث عن فيلا مودرن 4 غرف في حي الملقا مع مسبح ومساحة 400م²' : 'Find a modern 4-bedroom villa in Al Malqa with pool and 400 sqm',
        icon: Building2,
      },
      {
        title: isAr ? 'استكشاف خرائط جوجل' : 'Google Maps Search',
        prompt: isAr ? 'حدد لي مواقع أرقى الأحياء السكنية والمدارس الدولية في شمال الرياض على الخريطة' : 'Locate top residential districts and international schools in North Riyadh on Google Maps',
        icon: MapPin,
      },
      {
        title: isAr ? 'فحص التربة والأساسات' : 'Geotechnical Soil Check',
        prompt: isAr ? 'ما هي مواصفات تربة حي النرجس والياسمين وتوصيات الأساسات وفق كود البناء؟' : 'Analyze soil conditions and foundation recommendations for Al Narjis district in Riyadh',
        icon: Atom,
      },
      {
        title: isAr ? 'مقارنة أسعار الأحياء' : 'District Price Comparison',
        prompt: isAr ? 'قارن بين متوسط سعر المتر في الملقا وحطين والياسمين خلال الربع الأخير' : 'Compare average price per sqm between Al Malqa, Hittin, and Al Yasmin',
        icon: TrendingUp,
      },
    ];
  } else if (role === 'investor') {
    return [
      {
        title: isAr ? 'تحليل العوائد والتدفقات' : 'Yield & Cash Flow ROI',
        prompt: isAr ? 'احسب لي العائد الإيجاري المتوقع للشقق المخدومة في شمال الرياض وفرص النمو' : 'Calculate expected rental yields and capital growth for serviced apartments in North Riyadh',
        icon: TrendingUp,
      },
      {
        title: isAr ? 'أثر الاستدامة ومعيار مستدام' : 'Mostadam Sustainability',
        prompt: isAr ? 'ما هو أثر شهادة مستدام وكفاءة الطاقة على القيمة السوقية للعقار في الرياض؟' : 'What is the impact of Mostadam green building rating on property asset valuation in KSA?',
        icon: Atom,
      },
      {
        title: isAr ? 'مشاريع رؤية 2030' : 'Vision 2030 Corridors',
        prompt: isAr ? 'أبرز الفرص الاستثمارية المحيطة بمشروع حديقة الملك سلمان وبوابة الدرعية' : 'Explore high-potential real estate investment zones surrounding King Salman Park and Diriyah',
        icon: Globe,
      },
      {
        title: isAr ? 'خريطة الأبراج والمكاتب' : 'Commercial Maps Analysis',
        prompt: isAr ? 'استعرض مواقع الأبراج المكتبية ومسار المترو في الرياض على خريطة جوجل' : 'Map prime office corridors and Riyadh Metro transit hubs on Google Maps',
        icon: MapPin,
      },
    ];
  } else if (role === 'seller') {
    return [
      {
        title: isAr ? 'تقييم سعر المتر العادل' : 'Fair Market Valuation',
        prompt: isAr ? 'ما هو متوسط سعر المتر المربع للفلل السكنية في شمال وشرق الرياض حالياً؟' : 'What is the current average market price per sqm for residential villas in Riyadh?',
        icon: TrendingUp,
      },
      {
        title: isAr ? 'جاهزية كود البناء SBC' : 'Saudi Building Code Check',
        prompt: isAr ? 'ما هي متطلبات شهادة إتمام البناء والامتثال للكود السعودي لضمان سرعة البيع؟' : 'What are key Saudi Building Code compliance factors to expedite villa sale?',
        icon: Building2,
      },
      {
        title: isAr ? 'تأهيل العقار ورفع قيمته' : 'Value Enhancement Tips',
        prompt: isAr ? 'كيف أرفع القيمة التقديرية للفيلا قبل طرحها للبيع (عزل حراري، صيانة، حدائق)؟' : 'How can I maximize my villa market appraisal before listing it for sale?',
        icon: Sparkles,
      },
      {
        title: isAr ? 'الدراسات البيئية للعقار' : 'Environmental Factors',
        prompt: isAr ? 'كيف تؤثر الجزيرة الحرارية والعوازل على كفاءة الطاقة وجاذبية العقار؟' : 'How do urban heat island mitigation and thermal insulation boost buyer interest in Riyadh?',
        icon: Atom,
      },
    ];
  } else {
    return [
      {
        title: isAr ? 'استكشاف الفلل المميزة' : 'Explore Featured Listings',
        prompt: isAr ? 'استعرض لي أفضل الفلل المعروضة للبيع في الرياض مع التفاصيل والأسعار' : 'Show me top featured villas for sale in Riyadh with full specs and pricing',
        icon: Building2,
      },
      {
        title: isAr ? 'بحث بالخريطة الحية' : 'Live Google Maps Search',
        prompt: isAr ? 'ابحث في خرائط جوجل عن محطات المترو والخدمات بالقرب من حي النرجس' : 'Search Google Maps for metro stations and amenities near Al Narjis district',
        icon: MapPin,
      },
      {
        title: isAr ? 'أبحاث التربة والمناخ' : 'Soil & Geotechnical Science',
        prompt: isAr ? 'ما هي الأبحاث الجيوتقنية لطبقات التربة في الرياض واحتياطات الأساسات؟' : 'Review geotechnical literature and foundation stability considerations for Riyadh soil',
        icon: Atom,
      },
      {
        title: isAr ? 'مؤشرات الصفقات العقارية' : 'Real Estate Index & Trends',
        prompt: isAr ? 'ما هي أحدث توجهات وأسعار الصفقات العقارية المعتمدة في الرياض؟' : 'What are the latest verified transaction price trends across Riyadh real estate?',
        icon: TrendingUp,
      },
    ];
  }
};

function App() {
  // --- Settings State ---
  const [lang, setLang] = useState<Lang>('en');
  const [theme, setTheme] = useState<Theme>('light');
  const [authError, setAuthError] = useState('');
  const [isInventoryAdmin,setIsInventoryAdmin] = useState(false);
  const [showAdminButton,setShowAdminButton] = useState(() => localStorage.getItem(ADMIN_VISIBILITY_KEY)==='true');
  const [inventoryStatus,setInventoryStatus] = useState<'loading'|'ready'|'error'>('loading');
  useEffect(()=>watchAdminAccess(allowed=>setIsInventoryAdmin(allowed)),[]);
  useEffect(()=>{const update=()=>setShowAdminButton(localStorage.getItem(ADMIN_VISIBILITY_KEY)==='true');window.addEventListener('admin-visibility',update);window.addEventListener('storage',update);return()=>{window.removeEventListener('admin-visibility',update);window.removeEventListener('storage',update)}},[]);
  useEffect(()=>Inventory.subscribe(rows=>{PropertyService.replacePublished(rows);setDisplayedProperties(rows);setInventoryStatus('ready')},()=>{PropertyService.replacePublished([]);setDisplayedProperties([]);setInventoryStatus('error')}),[]);
  const handleGoogleSignIn = async () => {
    setAuthError('');
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error(error);
      setAuthError(lang === 'ar'
        ? 'تعذر تسجيل الدخول عبر Google. تأكد من السماح بالنوافذ المنبثقة وإضافة نطاق التطبيق في إعدادات Firebase.'
        : 'Google sign-in could not finish. Allow popups and ensure this app domain is authorized in Firebase.');
    }
  };
  const [user, setUser] = useState<UserProfile>({
    name: "User",
    email: "user@aqarai.com",
    phone: "",
    role: "guest",
    isFirebaseUser: false
  });
  
  // --- Chat Modes ---
  const [chatMode, setChatMode] = useState<ChatMode>('smart');
  const [isDictating, setIsDictating] = useState(false);

  // --- Modal State ---
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [previousModal, setPreviousModal] = useState<ModalType>(null);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true); 
  
  // Property Data State
  const [displayedProperties, setDisplayedProperties] = useState<Property[]>(PropertyService.getAll());
  const [savedPropertyIds, setSavedPropertyIds] = useState<Set<string>>(new Set());
  const [compareList, setCompareList] = useState<Set<string>>(new Set());

  // --- Chat State ---
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [liveState, setLiveState] = useState<LiveState>({ isConnected: false, isSpeaking: false });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Dynamic Suggestions State
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);

  // --- Refs ---
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const liveClientRef = useRef<LiveClient | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const t = TRANSLATIONS[lang];
  const roleLabel = ROLE_TRANSLATIONS[user.role][lang];
  const isLandingPage = messages.length <= 1 && messages[0]?.id === 'welcome';

  // --- Firebase Auth Listener & Persistent Sync ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        // Fetch existing cloud profile if available
        let cloudProfile = await getUserProfile(fbUser.uid).catch(() => null);
        
        const role = cloudProfile?.role || (fbUser.email === 'm-w781@hotmail.com' ? 'admin' : (user.role !== 'guest' ? user.role : 'buyer'));
        const updatedUser: UserProfile = {
          uid: fbUser.uid,
          name: fbUser.displayName || cloudProfile?.name || fbUser.email?.split('@')[0] || 'User',
          email: fbUser.email || '',
          phone: fbUser.phoneNumber || cloudProfile?.phone || '',
          avatar: fbUser.photoURL || cloudProfile?.avatar || '',
          role: role,
          isFirebaseUser: true
        };
        setUser(updatedUser);
        localStorage.setItem('aqar_ai_user', JSON.stringify(updatedUser));
        setShowWelcomeScreen(false);

        // Load saved properties from Firestore
        try {
          const cloudSavedIds = await getSavedPropertiesFromFirestore(fbUser.uid);
          if (cloudSavedIds && cloudSavedIds.length > 0) {
            setSavedPropertyIds(new Set(cloudSavedIds));
            localStorage.setItem('aqar_ai_saved_props', JSON.stringify(cloudSavedIds));
          }
        } catch (err) {
          console.warn("Could not load cloud saved properties:", err);
        }

        // Load chat sessions from Firestore
        try {
          const cloudSessions = await loadUserChatSessions(fbUser.uid);
          if (cloudSessions && cloudSessions.length > 0) {
            setSessions(cloudSessions);
            if (!currentSessionId && cloudSessions[0]) {
              setCurrentSessionId(cloudSessions[0].id);
              setMessages(cloudSessions[0].messages);
            }
          }
        } catch (err) {
          console.warn("Could not load cloud chat sessions:", err);
        }

      } else {
        // Logged out
        setUser(prev => ({
          ...prev,
          uid: undefined,
          isFirebaseUser: false
        }));
      }
    });

    return () => unsubscribe();
  }, [user.role, currentSessionId]);

  // --- Settings Effects ---
  useEffect(() => {
    const savedLang = localStorage.getItem('aqar_ai_lang') as Lang;
    const savedTheme = localStorage.getItem('aqar_ai_theme') as Theme;
    const savedUser = localStorage.getItem('aqar_ai_user');
    
    if (savedLang) setLang(savedLang);
    if (savedTheme) setTheme(savedTheme);
    if (savedUser) {
        try {
          const u = JSON.parse(savedUser);
          setUser(u);
          if (u.role && u.role !== 'guest') {
              setShowWelcomeScreen(false);
          }
        } catch (e) {
          console.error(e);
        }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('aqar_ai_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('aqar_ai_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleSaveUser = (u: UserProfile) => {
    setUser(u);
    localStorage.setItem('aqar_ai_user', JSON.stringify(u));
    setActiveModal(null);
  };

  const updateSuggestions = (role: UserRole, language: Lang) => {
      if (language === 'ar') {
         if (role === 'buyer') setCurrentSuggestions(["أبحث عن فيلا 3 غرف في الملقا", "عرض الخرائط لأحياء شمال الرياض", "فحص جيوتقنية وتربة حي النرجس"]);
         else if (role === 'seller') setCurrentSuggestions(["كم متوسط سعر المتر في الرياض؟", "نصائح تجهيز العقار للبيع", "معايير الاستدامة لرفع قيمة العقار"]);
         else if (role === 'investor') setCurrentSuggestions(["تحليل العوائد الإيجارية لشمال الرياض", "أبحاث علمية حول الجزيرة الحرارية", "أفضل الأحياء الواعدة 2025"]);
         else if (role === 'agent') setCurrentSuggestions(["عرض العملاء المحتملين", "مقارنة بين فلل الملقا والياسمين", "استخراج مواصفات كود البناء SBC"]);
         else setCurrentSuggestions(["بحث مباشر في خرائط الرياض", "أبحاث التربة والأساسات", "تصفح العقارات المتاحة"]);
      } else {
         if (role === 'buyer') setCurrentSuggestions(["Find 3-bed villa in Al Malqa", "Google Maps location in North Riyadh", "Check soil & foundation for Al Narjis"]);
         else if (role === 'seller') setCurrentSuggestions(["Average price per sqm in Riyadh", "Tips to prep villa for sale", "Mostadam sustainability impact on value"]);
         else if (role === 'investor') setCurrentSuggestions(["Rental yield analysis Riyadh", "Scientific studies on urban heat island", "High growth districts 2025"]);
         else if (role === 'agent') setCurrentSuggestions(["Show active inquiries", "Compare Al Malqa vs Al Yasmin", "Saudi Building Code foundation specs"]);
         else setCurrentSuggestions(["Live Google Maps search", "Geotechnical soil analysis", "Explore available listings"]);
      }
  };

  const handleRoleSelection = (role: UserRole) => {
      const updatedUser = { ...user, role };
      handleSaveUser(updatedUser);
      setShowWelcomeScreen(false);
      
      startChatSession(messages, chatMode, role);
      updateSuggestions(role, lang);
  };

  useEffect(() => {
     updateSuggestions(user.role, lang);
  }, [lang, user.role]);

  const handleSwitchRole = () => {
      setShowWelcomeScreen(true);
      setIsSidebarOpen(false);
  };

  const handleClearHistory = () => {
    if (confirm(lang === 'ar' ? "هل أنت متأكد من حذف سجل المحادثات؟" : "Are you sure you want to delete all chat history?")) {
        setSessions([]);
        setMessages([DEFAULT_WELCOME_MSG]);
        localStorage.removeItem('aqar_ai_sessions');
        setActiveModal(null);
        createNewChat();
    }
  };

  // --- Initialization ---
  useEffect(() => {
    const savedSessions = localStorage.getItem('aqar_ai_sessions');
    const lastSessionId = localStorage.getItem('aqar_ai_last_session_id');
    const savedIds = localStorage.getItem('aqar_ai_saved_props');

    if (savedIds) {
        try {
          setSavedPropertyIds(new Set(JSON.parse(savedIds)));
        } catch (e) {
          console.error(e);
        }
    }
    
    let loadedSessions: ChatSession[] = [];
    if (savedSessions) {
      try {
        loadedSessions = JSON.parse(savedSessions);
      } catch (e) {
        console.error("Failed to parse sessions", e);
      }
    }

    setSessions(loadedSessions);

    if (loadedSessions.length > 0 && lastSessionId) {
        const sessionToLoad = loadedSessions.find(s => s.id === lastSessionId) || loadedSessions[0];
        setCurrentSessionId(sessionToLoad.id);
        setMessages(sessionToLoad.messages);
        startChatSession(sessionToLoad.messages, chatMode, user.role); 
    } else {
        const welcomeMsg = { ...DEFAULT_WELCOME_MSG, content: TRANSLATIONS[lang].welcome };
        createNewChat(loadedSessions, welcomeMsg);
    }
    
    setDisplayedProperties(PropertyService.getAll());
  }, []);

  useEffect(() => {
    if (messages.length > 0 && !showWelcomeScreen) {
        startChatSession(messages, chatMode, user.role);
    }
  }, [chatMode, user.role, showWelcomeScreen]);

  useEffect(() => {
    if (sessions.length > 0) {
        localStorage.setItem('aqar_ai_sessions', JSON.stringify(sessions));
    }
    if (currentSessionId) {
        localStorage.setItem('aqar_ai_last_session_id', currentSessionId);
    }
  }, [sessions, currentSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLandingPage, isLoading]);

  useEffect(() => {
    if (!currentSessionId) return;

    setSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
            let newTitle = session.title;
            if ((session.title === "New Chat" || session.title === "محادثة جديدة" || !session.title) && messages.length > 1) {
                const firstUserMsg = messages.find(m => m.role === 'user');
                if (firstUserMsg) {
                    newTitle = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? "..." : "");
                }
            }
            return {
                ...session,
                messages: messages,
                title: newTitle,
                updatedAt: Date.now()
            };
        }
        return session;
    }));
  }, [messages, currentSessionId]);

  // --- Actions ---
  const createNewChat = (currentSessionsList = sessions, customWelcome?: Message) => {
    const newId = Date.now().toString();
    const welcome = customWelcome || {
        id: 'welcome',
        role: 'model',
        content: TRANSLATIONS[lang].welcome,
        timestamp: new Date()
    };

    const newSession: ChatSession = {
        id: newId,
        title: lang === 'ar' ? "محادثة جديدة" : "New Chat",
        messages: [welcome],
        updatedAt: Date.now()
    };
    
    setSessions(prev => [newSession, ...prev]); 
    setCurrentSessionId(newId);
    setMessages([welcome]);
    startChatSession([], chatMode, user.role); 
    updateSuggestions(user.role, lang);
    setIsSidebarOpen(false); 

    if (user.uid) {
      persistChatSession(user.uid, newId, newSession.title, chatMode).catch(console.warn);
    }
  };

  const loadSession = (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
        setCurrentSessionId(session.id);
        setMessages(session.messages);
        startChatSession(session.messages, chatMode, user.role);
        setIsSidebarOpen(false);
    }
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedSessions = sessions.filter(s => s.id !== id);
    setSessions(updatedSessions);
    localStorage.setItem('aqar_ai_sessions', JSON.stringify(updatedSessions));

    if (id === currentSessionId) {
        if (updatedSessions.length > 0) {
            loadSession(updatedSessions[0].id);
        } else {
            const welcomeMsg = { ...DEFAULT_WELCOME_MSG, content: t.welcome };
            createNewChat(updatedSessions, welcomeMsg);
        }
    }
  };

  const toggleDictation = async () => {
    if (isDictating) {
        mediaRecorderRef.current?.stop();
        setIsDictating(false);
    } else {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            const audioChunks: Blob[] = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64Audio = (reader.result as string).split(',')[1];
                    try {
                        const transcript = await transcribeAudio(base64Audio);
                        setInput(prev => prev + (prev ? ' ' : '') + transcript);
                    } catch (e) {
                        console.error("Transcription failed", e);
                    }
                };
                reader.readAsDataURL(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsDictating(true);
        } catch (e) {
            console.error("Dictation start failed", e);
        }
    }
  };

  const handleSend = async () => {
    const textToSend = input.trim();
    const imageToSend = selectedImage;
    
    if ((!textToSend && !imageToSend) || isLoading) return;

    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    const userMsgId = Date.now().toString();
    const newUserMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: textToSend,
      image: imageToSend || undefined,
      timestamp: new Date()
    };

    const newMessages = [...messages, newUserMsg];
    setMessages(newMessages);

    // Automatically determine the best AI reasoning mode in the background
    const effectiveMode = autoDetectChatMode(textToSend, !!imageToSend);
    setChatMode(effectiveMode);

    // Persist user message to Firestore if authenticated
    if (user.uid && currentSessionId) {
      persistChatMessage(user.uid, currentSessionId, userMsgId, 'user', textToSend).catch(console.warn);
      persistChatSession(user.uid, currentSessionId, textToSend.slice(0, 30), effectiveMode).catch(console.warn);
    }

    try {
      const result = await sendMessageToGemini(textToSend, imageToSend || undefined, newMessages, effectiveMode);
      
      const botMsgId = (Date.now() + 1).toString();
      const botMsg: Message = {
        id: botMsgId,
        role: 'model',
        content: result.text,
        timestamp: new Date(),
        groundingSources: result.groundingSources,
        scienceData: result.scienceData
      };
      
      setMessages([...newMessages, botMsg]);

      // Persist model message to Firestore
      if (user.uid && currentSessionId) {
        persistChatMessage(user.uid, currentSessionId, botMsgId, 'model', result.text, {
          groundingSources: result.groundingSources,
          scienceData: result.scienceData
        }).catch(console.warn);
      }
      
      if (result.suggestions && result.suggestions.length > 0) {
          setCurrentSuggestions(result.suggestions);
      }

    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: error instanceof Error && error.message === 'Gemini AI not initialized'
          ? (lang === 'ar' ? 'المحادثة الذكية غير مفعّلة بعد. يلزم إعداد خدمة Gemini لتشغيلها، ويمكنك متابعة تصفح التطبيق.' : 'AI chat is not configured yet. Set up Gemini to enable it. You can still explore the app.')
          : (lang === 'ar' ? "عذراً، حدث خطأ أثناء الاتصال بالخادم." : "Sorry, an error occurred while connecting to the server."),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Live API Handlers (gemini-3.8-live) ---
  const handleLiveToggle = async () => {
    if (liveState.isConnected) {
        liveClientRef.current?.disconnect();
        setLiveState({ isConnected: false, isSpeaking: false });
        return;
    }

    try {
        const client = new LiveClient(
            (role, text) => {
                console.log(`[${role}] ${text}`);
            },
            (state) => {
                setLiveState(state);
            },
            (propertyIds) => {
                console.log("Showing properties:", propertyIds);
            }
        );
        liveClientRef.current = client;
        await client.connect();
    } catch (e) {
        console.error("Live Connect Error", e);
    }
  };

  // --- UI Actions ---
  const openModal = (type: ModalType, data?: any) => {
    setPreviousModal(activeModal);
    setActiveModal(type);
    if (data) setSelectedProperty(data);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedProperty(null);
  };
  
  const handlePropertyAction = (action: 'view' | 'save' | 'chat' | 'compare', data: any) => {
    if (action === 'view') {
        openModal('property_details', data);
    } else if (action === 'save') {
        const newSet = new Set(savedPropertyIds);
        const isCurrentlySaved = newSet.has(data.id);
        
        if (isCurrentlySaved) {
          newSet.delete(data.id);
          if (user.uid) {
            removeSavedPropertyFromFirestore(user.uid, data.id).catch(console.warn);
          }
        } else {
          newSet.add(data.id);
          if (user.uid) {
            savePropertyToFirestore(user.uid, data).catch(console.warn);
          }
        }
        setSavedPropertyIds(newSet);
        localStorage.setItem('aqar_ai_saved_props', JSON.stringify(Array.from(newSet)));
    } else if (action === 'chat') {
        closeModal();
        const prompt = lang === 'ar' 
            ? `أريد الاستفسار عن العقار: ${data.title} (${data.id}) مع تحليل الموقع والتربة`
            : `I want to inquire about property: ${data.title} (${data.id}) including site and geotechnical analysis`;
        setInput(prompt);
    } else if (action === 'compare') {
        const newSet = new Set(compareList);
        if (newSet.has(data.id)) newSet.delete(data.id);
        else newSet.add(data.id);
        setCompareList(newSet);
    }
  };

  const getCompareProperties = () => {
      return displayedProperties.filter(p => compareList.has(p.id));
  };

  if (showWelcomeScreen) {
      return (
        <WelcomeScreen 
          onSelectRole={handleRoleSelection} 
          lang={lang} 
          setLang={setLang}
          theme={theme}
          setTheme={setTheme}
          onSignIn={handleGoogleSignIn}
          authError={authError}
          isSignedIn={Boolean(user.isFirebaseUser)}
          onClose={() => setShowWelcomeScreen(false)}
          currentRole={user.role}
        />
      );
  }

    const criticalPrompts = getCriticalPrompts(user.role, lang);

    return (
    <div className={`flex h-screen bg-[#FBFBFD] dark:bg-[#000000] text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-200 ${lang === 'ar' ? 'font-arabic' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={loadSession}
        onNewChat={() => createNewChat()}
        onDeleteSession={deleteSession}
        lang={lang}
        user={user}
        onOpenModal={openModal}
        onSwitchRole={handleSwitchRole}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden w-full">
        
        {/* Apple Serene Minimalist Header */}
        <header className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-3 bg-[#FBFBFD]/80 dark:bg-[#000000]/80 backdrop-blur-2xl border-b border-black/[0.05] dark:border-white/[0.06] z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="p-1.5 sm:p-2 -ml-1 sm:-ml-2 rtl:-ml-0 rtl:-mr-1 rtl:sm:-mr-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors md:hidden shrink-0"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5 stroke-[1.8]" />
            </button>
            
            {/* Desktop Brand with Clickable Logo to return Home */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={handleSwitchRole}
                className="hover:opacity-80 transition-opacity"
                title={lang === 'ar' ? 'الصفحة الرئيسية: اختيار الدور (مشتري / بائع / مستثمر)' : 'Home: Choose Role (Buyer / Seller / Investor)'}
              >
                <Logo size="sm" lang={lang} />
              </button>
              
              <div className="h-4 w-px bg-black/[0.08] dark:bg-white/[0.10]" />
              
              {/* Interactive Role Switcher Pill */}
              <button
                onClick={handleSwitchRole}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.10] border border-black/[0.04] dark:border-white/[0.06] text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-all select-none group"
                title={lang === 'ar' ? 'تغيير الدور واختيار الاهتمام (مشتري، بائع، مستثمر)' : 'Switch Role (Buyer, Seller, Investor)'}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-semibold">{roleLabel}</span>
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-normal group-hover:text-[#0071E3] transition-colors">
                  · {lang === 'ar' ? 'تغيير' : 'Switch'} ▾
                </span>
              </button>

              {user.isFirebaseUser && (
                <span className="text-[10px] text-neutral-400 font-normal">
                  · Cloud
                </span>
              )}
            </div>

            {/* Mobile Brand */}
            <div className="md:hidden flex items-center gap-1.5 sm:gap-2 min-w-0">
              <button
                onClick={handleSwitchRole}
                className="hover:opacity-80 transition-opacity shrink-0"
                title={lang === 'ar' ? 'الصفحة الرئيسية' : 'Home'}
              >
                <Logo size="sm" lang={lang} />
              </button>
              <button
                onClick={handleSwitchRole}
                className="text-[10px] sm:text-[11px] font-medium px-1.5 sm:px-2 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-neutral-600 dark:text-neutral-300 max-w-[85px] xs:max-w-[110px] truncate"
              >
                {roleLabel} ▾
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0 w-full sm:w-auto">
            {isInventoryAdmin && showAdminButton && <button className="text-xs px-2 py-1" onClick={()=>{window.location.hash='/admin'}}>الإدارة</button>}
            <button
              onClick={() => openModal('settings')}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-full text-neutral-500 dark:text-neutral-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors flex items-center gap-1.5 text-xs font-medium"
              aria-label={lang === 'ar' ? 'الإعدادات' : 'Settings'}
              title={lang === 'ar' ? 'اللغة والمظهر' : 'Language and theme'}
            >
              <Settings className="w-4 h-4 stroke-[1.8]" />
              <span>{lang === 'ar' ? 'الإعدادات' : 'Settings'}</span>
            </button>
            {/* Quick Home / Role Selection Button */}
            <button
              onClick={handleSwitchRole}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-full text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors flex items-center gap-1.5 text-xs font-medium"
              title={lang === 'ar' ? 'الصفحة الرئيسية: اختيار الدور (مشتري / بائع / مستثمر)' : 'Home: Choose Role (Buyer, Seller, Investor)'}
              aria-label="Home page"
            >
              <Home className="w-4 h-4 text-[#0071E3] stroke-[1.8]" />
              <span>{lang === 'ar' ? 'الرئيسية' : 'Home'}</span>
            </button>

            {/* User Profile / Google Sign-In */}
            {user.isFirebaseUser ? (
              <button
                onClick={() => openModal('profile')}
                className="flex items-center gap-1.5 sm:gap-2 p-1 pl-2 rtl:pl-1 rtl:pr-2 sm:pl-2.5 sm:rtl:pr-2.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.10] border border-black/[0.04] dark:border-white/[0.06] transition-colors"
                title={user.name}
              >
                <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 max-w-[80px] sm:max-w-[100px] truncate hidden sm:inline">
                  {user.name}
                </span>
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center text-[10px] font-semibold overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
              </button>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.10] border border-black/[0.04] dark:border-white/[0.06] text-xs font-medium text-neutral-700 dark:text-neutral-200 transition-colors"
              >
                <Cloud className="w-3.5 h-3.5 text-[#0071E3] stroke-[1.8]" />
                <span>{lang === 'ar' ? 'تسجيل الدخول' : 'Sign in'}</span>
              </button>
            )}
          </div>
        </header>
        {authError && <p role="alert" className="px-4 py-2 text-sm text-red-600 dark:text-red-400">{authError}</p>}
        {inventoryStatus === 'error' && <p role="status" className="px-4 py-2 text-xs text-amber-700">{lang === 'ar' ? 'تعذر تحميل العقارات المنشورة. حاول مجددًا لاحقًا.' : 'Published listings could not be loaded. Please try again later.'}</p>}

        {/* Chat Scroll Viewport */}
        <div className="flex-1 overflow-y-auto px-2.5 sm:px-4 py-3 sm:py-6 scrollbar-thin">
          <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
            
            {/* Landing Page: Clean, Balanced Whitespace & Resized Focus Cards */}
            {isLandingPage ? (
              <div className="flex flex-col items-center justify-center min-h-[40vh] sm:min-h-[44vh] text-center px-2 sm:px-4 py-2 sm:py-4 animate-in fade-in duration-400">
                {/* Refined Architectural Monochrome Glyph */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center text-neutral-900 dark:text-neutral-100 shadow-sm mb-2.5 sm:mb-3.5">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.6]" />
                </div>

                <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white mb-1 sm:mb-1.5">
                  {t.greeting}{user.name && user.name !== 'User' ? `, ${user.name}` : ''}
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-normal max-w-sm leading-relaxed mb-4 sm:mb-6">
                  {t.greetingSub}
                </p>
                
                {/* Resized Main Focus Cards: Compact, Balanced, and Uncluttered */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 w-full max-w-lg text-left rtl:text-right">
                  {criticalPrompts.map((cp, idx) => {
                    const Icon = cp.icon;
                    return (
                      <button 
                        key={idx}
                        onClick={() => {
                          setInput(cp.prompt);
                        }}
                        className="group relative p-2.5 sm:p-3.5 rounded-xl bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] hover:border-black/20 dark:hover:border-white/20 hover:shadow-md hover:shadow-black/[0.02] transition-all duration-200 flex items-center gap-2.5 sm:gap-3 text-left rtl:text-right active:scale-[0.99]"
                      >
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-black/[0.03] dark:bg-white/[0.05] text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:text-[#0071E3] transition-all">
                          <Icon className="w-3.5 h-3.5 stroke-[1.8]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 leading-tight group-hover:text-[#0071E3] transition-colors truncate">
                            {cp.title}
                          </div>
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate leading-normal mt-0.5">
                            {cp.prompt}
                          </div>
                        </div>
                        <ArrowRight className="w-3 h-3 text-neutral-400 dark:text-neutral-500 group-hover:text-[#0071E3] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 rtl:rotate-180" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <MessageBubble 
                    key={msg.id} 
                    role={msg.role} 
                    content={msg.content} 
                    image={msg.image}
                    isStreaming={msg.isStreaming}
                    lang={lang}
                    compareSet={compareList}
                    groundingSources={msg.groundingSources}
                    onPropertyAction={handlePropertyAction}
                  />
                ))}
                
                {/* Typing Indicator - Apple Minimalist */}
                {isLoading && (
                  <div className="flex w-full mb-4 sm:mb-6 justify-start animate-in fade-in duration-300">
                    <div className="flex items-center gap-2.5 sm:gap-3 bg-white/90 dark:bg-[#1C1C1E]/90 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm backdrop-blur-md">
                      <div className="flex gap-1.5 h-4 items-center px-1">
                        <span className="w-1.5 h-1.5 bg-[#0071E3] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-[#0071E3] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-[#0071E3] rounded-full animate-bounce"></span>
                      </div>
                      <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                        {lang === 'ar' ? 'جاري التحليل وصياغة الرد...' : 'Aqar AI is thinking...'}
                      </span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Input Area - Frosted Apple Dock */}
        <div className="p-2 sm:p-4 pb-3 sm:pb-4 bg-[#FBFBFD]/80 dark:bg-[#000000]/80 backdrop-blur-2xl border-t border-black/[0.04] dark:border-white/[0.06] z-20">
          <div className="max-w-3xl mx-auto flex flex-col items-center gap-1.5 sm:gap-2">
            <ChatInput 
              value={input}
              onChange={setInput}
              onSend={handleSend}
              isLoading={isLoading}
              isDictating={isDictating}
              onDictate={toggleDictation}
              liveState={liveState}
              onLiveToggle={handleLiveToggle}
              placeholder={t.placeholder}
              isCentered={isLandingPage}
              suggestions={isLandingPage ? [] : currentSuggestions}
              onSuggestionClick={setInput}
              lang={lang}
              selectedImage={selectedImage}
              onImageSelect={setSelectedImage}
            />
            <div className="text-[10px] sm:text-[11px] text-neutral-400 dark:text-neutral-500 tracking-tight font-normal text-center select-none px-2 max-w-md">
              {t.disclaimer}
            </div>
          </div>
        </div>


        {/* Live Overlay */}
        {liveState.isConnected && (
            <LiveSessionOverlay 
                isSpeaking={liveState.isSpeaking}
                onClose={() => {
                    liveClientRef.current?.disconnect();
                    setLiveState({ isConnected: false, isSpeaking: false });
                }}
                transcript=""
                role='model'
                lang={lang}
            />
        )}
        
        {/* Comparison Floating Bar */}
        <CompareBar 
            count={compareList.size} 
            onOpen={() => openModal('compare')} 
            onClear={() => setCompareList(new Set())}
            lang={lang}
        />

      </div>

      {/* Modals */}
      <Modal isOpen={activeModal === 'settings'} onClose={closeModal} title={t.titles.settings}>
        {isInventoryAdmin && <div className="flex gap-2 mb-4"><button onClick={()=>setAdminButtonVisible(!showAdminButton)}>{showAdminButton?'إخفاء زر الإدارة':'إظهار زر الإدارة'}</button><button onClick={()=>{window.location.hash='/admin'}}>فتح لوحة الإدارة</button></div>}
        <SettingsModal 
            lang={lang} 
            setLang={setLang} 
            theme={theme} 
            setTheme={setTheme} 
            onClearHistory={handleClearHistory}
            onOpenDataControl={() => openModal('data_control')}
        />
      </Modal>

      <Modal isOpen={activeModal === 'profile'} onClose={closeModal} title={t.titles.profile}>
        <ProfileModal user={user} onSave={handleSaveUser} lang={lang} />
      </Modal>

      <Modal isOpen={activeModal === 'properties'} onClose={closeModal} title={t.titles.properties}>
        <PropertiesModal 
            properties={displayedProperties} 
            savedIds={savedPropertyIds} 
            compareSet={compareList}
            lang={lang}
            onAction={handlePropertyAction}
        />
      </Modal>

      <Modal isOpen={activeModal === 'property_details'} onClose={closeModal} title={t.titles.property_details}>
         <PropertyDetailsModal 
            data={selectedProperty} 
            lang={lang} 
            isSaved={selectedProperty && savedPropertyIds.has(selectedProperty.id)}
            isCompared={selectedProperty && compareList.has(selectedProperty.id)}
            onAction={handlePropertyAction}
         />
      </Modal>
      
      <Modal isOpen={activeModal === 'compare'} onClose={closeModal} title={t.titles.compare}>
          <CompareModal 
              properties={getCompareProperties()} 
              onRemove={(id) => {
                  const newSet = new Set(compareList);
                  newSet.delete(id);
                  setCompareList(newSet);
              }}
              onClear={() => setCompareList(new Set())}
              lang={lang}
              onClose={closeModal}
          />
      </Modal>

      <Modal isOpen={activeModal === 'data_control'} onClose={closeModal} title={t.titles.data_control}>
          <DataControlModal onClose={closeModal} />
      </Modal>

      <Modal isOpen={activeModal === 'market_insights'} onClose={closeModal} title={t.titles.market_insights}>
          <MarketInsightsModal lang={lang} />
      </Modal>

      {/* Science & Geotechnics Modal */}
      <Modal isOpen={activeModal === 'science'} onClose={closeModal} title={t.titles.science}>
          <ScienceModal 
            lang={lang} 
            onClose={closeModal} 
            onAskScienceInChat={(query) => {
              setChatMode('science');
              setInput(query);
            }} 
          />
      </Modal>

    </div>
  );
}

export default App;
