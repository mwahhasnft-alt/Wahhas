
import React from 'react';
import { Mic, X, PhoneOff, Activity, User, Bot } from 'lucide-react';
import { Lang } from '../types';

interface LiveSessionOverlayProps {
  isSpeaking: boolean;
  onClose: () => void;
  transcript: string;
  role: 'user' | 'model';
  lang: Lang;
}

const LiveSessionOverlay: React.FC<LiveSessionOverlayProps> = ({ isSpeaking, onClose, transcript, role, lang }) => {
  const t = {
    speaking: lang === 'ar' ? 'أتحدث الآن...' : 'Aqar AI Speaking...',
    listening: lang === 'ar' ? 'أستمع إليك...' : 'Listening...',
    live: lang === 'ar' ? 'محادثة صوتية مباشرة' : 'Live Conversation',
    you: lang === 'ar' ? 'أنت' : 'You',
    ai: 'Aqar AI',
    waiting: lang === 'ar' ? 'تفضل، أنا أستمع إليك.' : "Go ahead, I'm listening.",
    end: lang === 'ar' ? 'إنهاء المحادثة' : 'End Call'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 animate-in fade-in" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col items-center relative animate-in zoom-in-95 duration-200 p-8 border border-slate-100 dark:border-slate-800">
        
        {/* Header Actions */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Visualizer Status */}
        <div className="mt-6 mb-8 relative">
           {/* Ring Animations */}
           <div className={`absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-full scale-150 ${isSpeaking ? 'animate-ping opacity-20' : 'opacity-0'}`}></div>
           <div className={`absolute inset-0 bg-blue-200 dark:bg-blue-800/40 rounded-full scale-125 ${isSpeaking ? 'animate-pulse opacity-30' : 'opacity-0'}`}></div>
           
           <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 z-10 relative ${isSpeaking ? 'bg-blue-500 shadow-blue-200 dark:shadow-none shadow-xl' : 'bg-slate-100 dark:bg-slate-800'}`}>
              {isSpeaking ? (
                <Activity className="w-10 h-10 text-white animate-bounce" />
              ) : (
                <div className="relative">
                    <Mic className="w-10 h-10 text-slate-400" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                </div>
              )}
           </div>
        </div>

        {/* Status Text */}
        <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
            {isSpeaking ? t.speaking : t.listening}
            </h3>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{t.live}</p>
        </div>
        
        {/* Transcript / Subtitles */}
        <div className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 min-h-[100px] flex flex-col items-center justify-center mb-6 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2 text-xs font-medium text-slate-400">
                {role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                <span>{role === 'user' ? t.you : t.ai}</span>
            </div>
            <p className="text-center text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium">
              {transcript || (isSpeaking ? "..." : t.waiting)}
            </p>
        </div>

        {/* Footer Actions */}
        <div className="w-full flex justify-center">
           <button 
             onClick={onClose}
             className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-8 py-3 rounded-full font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shadow-sm hover:shadow active:scale-95 duration-200"
           >
             <PhoneOff className="w-5 h-5" />
             <span>{t.end}</span>
           </button>
        </div>
      </div>
    </div>
  );
};

export default LiveSessionOverlay;
