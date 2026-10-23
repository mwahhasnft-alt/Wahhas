
import React from 'react';
import { MapPin, Bed, Bath, Maximize2, CheckCircle2, MessageCircle, Share2, Heart, Scale } from 'lucide-react';
import { Lang } from '../../types';

interface PropertyDetailsModalProps {
  data: any;
  lang: Lang;
  isSaved?: boolean;
  isCompared?: boolean;
  onAction: (action: 'chat' | 'save' | 'compare', data: any) => void;
}

const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({ data, lang, isSaved, isCompared, onAction }) => {
  if (!data) return null;
  
  const isArabic = lang === 'ar';

  const t = {
    chat: isArabic ? 'اسأل المساعد الذكي' : 'Chat with AI',
    whatsapp: isArabic ? 'تواصل واتساب' : 'WhatsApp',
    features: isArabic ? 'المميزات' : 'Features',
    desc: isArabic ? 'الوصف' : 'Description',
    sar: isArabic ? 'ريال' : 'SAR',
    specs: isArabic ? 'المواصفات' : 'Specs',
    ref: isArabic ? 'رقم المرجع' : 'Ref',
    save: isArabic ? 'حفظ' : 'Save',
    saved: isArabic ? 'مفضل' : 'Saved',
    compare: isArabic ? 'مقارنة' : 'Compare',
    addedCompare: isArabic ? 'مضاف للمقارنة' : 'In Compare'
  };

  // Helper to remove markdown bolding
  const clean = (text: string | undefined) => text ? text.replace(/\*\*/g, '') : '';

  // Determine Display Values
  const displayTitle = clean((isArabic && data.titleAr) ? data.titleAr : data.title);
  let displayLocation = clean(data.location);
  
  // Try to reconstruct location if we have cityAr/districtAr in the data object, 
  // otherwise fallback to string replacement if it was passed as string
  if (isArabic && data.cityAr && data.districtAr) {
      displayLocation = `${clean(data.cityAr)} - ${clean(data.districtAr)}`;
  } else if (isArabic) {
      displayLocation = displayLocation.replace('Riyadh', 'الرياض')
                                       .replace('Jeddah', 'جدة')
                                       .replace('Khobar', 'الخبر');
  }

  const specs = clean(data.specs).split('|').map((s: string) => s.trim());
  
  let highlightsStr = data.highlights;
  if (isArabic && data.highlightsAr) {
     // If passed as string
     highlightsStr = data.highlightsAr;
  }
  const highlights = clean(highlightsStr).split(',').map((s: string) => s.trim());

  const cleanPrice = clean(data.price);
  const price = cleanPrice.replace(/\(.*?\)/g, '').trim();
  
  let typeLabel = cleanPrice.match(/\((.*?)\)/)?.[1] || '';
  if (isArabic) {
      if (typeLabel.includes('Buy')) typeLabel = 'للبيع';
      else if (typeLabel.includes('Rent')) typeLabel = 'للإيجار';
      else typeLabel = 'عرض';
  }
  
  const displayImage = data.imageUrl || `https://picsum.photos/seed/${data.id}/800/400`;

  const handleWhatsApp = () => {
    const text = `Hi, I am interested in your listing: ${displayTitle} (${data.id})`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="pb-20 sm:pb-24 relative min-h-[450px]">
      {/* Image Header */}
      <div className="h-44 sm:h-64 w-full relative group">
        <img 
            src={displayImage} 
            alt={displayTitle} 
            className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 px-2.5 py-0.5 sm:px-3 sm:py-1 bg-blue-600 text-white text-[11px] sm:text-xs font-bold rounded-md shadow-sm">
            {typeLabel}
        </div>
        
        {/* Save Overlay */}
        <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 flex items-center gap-2">
          <button 
            onClick={() => onAction('save', data)}
            className={`p-1.5 sm:p-2 rounded-full backdrop-blur-md shadow-sm transition-colors ${isSaved ? 'bg-white/90 text-red-500' : 'bg-black/40 text-white hover:bg-black/60'}`}
          >
            <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6">
        {/* Title & Price */}
        <div className="flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2">
                <h2 className="text-base sm:text-xl font-bold text-slate-800 dark:text-slate-100 leading-snug flex-1">{displayTitle}</h2>
                <div className="text-base sm:text-xl font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                    {price} <span className="text-xs sm:text-sm font-medium">{t.sar}</span>
                </div>
            </div>
            <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs sm:text-sm flex-wrap gap-y-1">
                <MapPin className="w-3.5 h-3.5 mr-1 rtl:ml-1 rtl:mr-0 shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-none">{displayLocation}</span>
                <span className="mx-2 text-slate-300">|</span>
                <span className="text-[11px] sm:text-xs">{t.ref}: {data.id}</span>
            </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {specs.map((spec: string, i: number) => {
                const isBed = spec.includes('bd') || spec.includes('غرف');
                const isBath = spec.includes('ba') || spec.includes('حمام') || spec.includes('مياه');
                
                let displaySpec = spec;
                if (isArabic) {
                    displaySpec = displaySpec.replace('bd', 'غرف').replace('ba', 'دورات مياه').replace('sqm', 'م²');
                }

                return (
                    <div key={i} className="flex flex-col items-center justify-center p-2 sm:p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        {isBed ? <Bed className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 mb-1" /> :
                         isBath ? <Bath className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 mb-1" /> :
                         <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 mb-1" />
                        }
                        <span className="font-semibold text-slate-700 dark:text-slate-200 text-xs sm:text-sm text-center truncate w-full">{displaySpec}</span>
                    </div>
                );
            })}
        </div>

        {/* Highlights */}
        <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 mb-2 uppercase tracking-wider">{t.features}</h3>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {highlights.map((h: string, i: number) => (
                    <div key={i} className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-[11px] sm:text-xs font-medium">
                        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                        <span>{h}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Description Mock */}
        <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5 uppercase tracking-wider">{t.desc}</h3>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                {isArabic 
                    ? `استمتع بالعيش في هذا العقار المميز في ${displayLocation}. يتميز بتصميم عصري وتشطيبات فاخرة، ويوفر مساحات واسعة ومريحة لجميع أفراد العائلة. قريب من جميع الخدمات الأساسية.`
                    : `Enjoy living in this distinct property in ${data.location}. Featuring modern design and luxury finishes, offering spacious and comfortable living areas for the whole family. Close to all essential amenities.`
                }
            </p>
        </div>

        {/* Science & Geotechnical Insights Panel */}
        <div className="p-3 sm:p-4 rounded-xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/40 dark:bg-teal-950/20 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-1">
                <span className="text-xs font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                    🔬 {isArabic ? 'التقييم العلمي والجيوتقني للموقع (كود SBC ومستدام)' : 'Scientific & Geotechnical Site Assessment'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 font-medium">
                    {isArabic ? 'معتمد' : 'Verified Profile'}
                </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                <div className="bg-white/80 dark:bg-slate-900/80 p-2 sm:p-2.5 rounded-lg border border-teal-100 dark:border-teal-900/40">
                    <span className="text-slate-400 block text-[11px]">{isArabic ? 'قدرة تحمل التربة:' : 'Soil Bearing Capacity:'}</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">350 - 450 kPa (High)</span>
                </div>
                <div className="bg-white/80 dark:bg-slate-900/80 p-2 sm:p-2.5 rounded-lg border border-teal-100 dark:border-teal-900/40">
                    <span className="text-slate-400 block text-[11px]">{isArabic ? 'إمكانية شهادة مستدام:' : 'Mostadam Potential:'}</span>
                    <span className="font-semibold text-teal-600 dark:text-teal-400">Diamond / Platinum</span>
                </div>
            </div>
        </div>
      </div>

      {/* Fixed Actions Footer inside Modal */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-4 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 flex gap-1.5 sm:gap-3 z-10 rounded-b-2xl">
        <button 
            onClick={() => onAction('chat', data)}
            className="flex-1 bg-slate-900 dark:bg-slate-800 text-white py-2 sm:py-3 px-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-slate-800 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-sm"
        >
            <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">{t.chat}</span>
        </button>
        <button 
            onClick={() => onAction('compare', data)}
            className={`flex-1 py-2 sm:py-3 px-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all active:scale-95 shadow-sm ${isCompared ? 'bg-blue-100 text-blue-600 shadow-none' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100 dark:shadow-none'}`}
        >
            <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">{isCompared ? t.addedCompare : t.compare}</span>
        </button>
        <button 
            onClick={handleWhatsApp}
            className="flex-1 bg-green-500 text-white py-2 sm:py-3 px-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-green-600 transition-all active:scale-95 shadow-sm"
        >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">{t.whatsapp}</span>
        </button>
      </div>
    </div>
  );
};

export default PropertyDetailsModal;
