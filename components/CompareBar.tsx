import React from 'react';
import { Lang } from '../types';
import { Scale, X, ArrowRight } from 'lucide-react';

interface CompareBarProps {
  count: number;
  onOpen: () => void;
  onClear: () => void;
  lang: Lang;
}

const CompareBar: React.FC<CompareBarProps> = ({ count, onOpen, onClear, lang }) => {
  if (count === 0) return null;

  const isAr = lang === 'ar';
  const t = {
    selected: isAr ? 'عقارات للمقارنة' : 'selected',
    compare: isAr ? 'مقارنة' : 'Compare',
    clear: isAr ? 'إلغاء' : 'Clear',
  };

  return (
    <div className="fixed bottom-20 sm:bottom-24 left-1/2 transform -translate-x-1/2 z-30 max-w-[calc(100vw-24px)] animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div 
        className="bg-neutral-950/90 dark:bg-white/90 text-white dark:text-neutral-950 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full shadow-2xl backdrop-blur-2xl flex items-center gap-2 sm:gap-3.5 border border-white/10 dark:border-black/10 transition-all select-none"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <div className="bg-[#0071E3] text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center font-semibold text-[11px] sm:text-xs shrink-0 shadow-sm">
            {count}
          </div>
          <span className="text-[11px] sm:text-xs font-medium tracking-tight whitespace-nowrap truncate">
            {count} {t.selected}
          </span>
        </div>

        <div className="h-3.5 sm:h-4 w-px bg-white/20 dark:bg-black/20 shrink-0" />

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button 
            onClick={onOpen}
            className="bg-[#0071E3] hover:bg-[#0077ED] text-white px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium flex items-center gap-1 sm:gap-1.5 transition-all active:scale-95 shadow-sm"
          >
            <span>{t.compare}</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 rtl:rotate-180 stroke-[2]" />
          </button>
          
          <button 
            onClick={onClear}
            className="text-neutral-400 hover:text-white dark:text-neutral-600 dark:hover:text-neutral-950 p-1 sm:p-1.5 rounded-full transition-colors"
            title={t.clear}
            aria-label={t.clear}
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompareBar;
