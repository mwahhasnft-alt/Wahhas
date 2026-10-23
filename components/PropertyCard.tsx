import React, { useState, useEffect } from 'react';
import { MapPin, Bed, Bath, Maximize2, Heart, MessageCircle, Eye, Scale } from 'lucide-react';
import { Lang } from '../types';

interface PropertyCardProps {
  data: {
    id: string;
    title: string;
    titleAr?: string;
    price: string;
    location: string;
    cityAr?: string;
    districtAr?: string;
    type: string;
    typeAr?: string;
    specs: string;
    highlights: string;
    highlightsAr?: string;
    imageUrl?: string;
  };
  lang: Lang;
  isSaved?: boolean;
  isCompared?: boolean;
  onAction?: (action: 'view' | 'save' | 'chat' | 'compare', data: any) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ 
  data, 
  lang, 
  isSaved: isSavedProp, 
  isCompared, 
  onAction 
}) => {
  const [localSaved, setLocalSaved] = useState(isSavedProp || false);
  
  useEffect(() => {
    if (isSavedProp !== undefined) {
      setLocalSaved(isSavedProp);
    }
  }, [isSavedProp]);

  const isArabic = lang === 'ar';
  
  const clean = (text: string | undefined) => text ? text.replace(/\*\*/g, '') : '';

  const displayTitle = clean((isArabic && data.titleAr) ? data.titleAr : data.title);
  
  let displayLocation = clean(data.location);
  if (isArabic && data.cityAr && data.districtAr) {
    displayLocation = `${clean(data.cityAr)} - ${clean(data.districtAr)}`;
  } else if (isArabic) {
    displayLocation = displayLocation.replace('Riyadh', 'الرياض')
                                     .replace('Jeddah', 'جدة')
                                     .replace('Khobar', 'الخبر');
  }

  let displayType = clean(data.type);
  if (isArabic) {
    if (data.typeAr) displayType = clean(data.typeAr);
    else {
      displayType = displayType.replace('Villa', 'فيلا')
                               .replace('Apartment', 'شقة')
                               .replace('Land', 'أرض')
                               .replace('Townhouse', 'تاون هاوس')
                               .replace('Office', 'مكتب');
    }
  }

  const cleanPrice = clean(data.price);
  const isRent = cleanPrice.toLowerCase().includes('rent') || cleanPrice.includes('إيجار');
  const priceAmount = cleanPrice
    .replace(/\(.*?\)/g, '')
    .replace('للإيجار', '')
    .replace('For Rent', '')
    .replace('للبيع', '')
    .replace('For Sale', '')
    .trim();

  const specsParts = clean(data.specs).split('|').map(s => s.trim());

  let highlightsRaw = data.highlights;
  if (isArabic && data.highlightsAr) {
    highlightsRaw = data.highlightsAr;
  }
  const highlightsList = clean(highlightsRaw).split(',').map(s => s.trim()).filter(Boolean);

  const t = {
    sar: isArabic ? 'ريال' : 'SAR',
    rent: isArabic ? 'للإيجار' : 'For Rent',
    sale: isArabic ? 'للبيع' : 'For Sale',
    view: isArabic ? 'عرض' : 'View',
    save: isArabic ? 'حفظ' : 'Save',
    saved: isArabic ? 'مفضل' : 'Saved',
    chat: isArabic ? 'استفسار' : 'Inquire',
    whatsapp: isArabic ? 'واتساب' : 'WhatsApp',
    compare: isArabic ? 'مقارنة' : 'Compare'
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `Hi, I am interested in your listing: ${displayTitle} (${data.id})`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSavedProp === undefined) {
      setLocalSaved(!localSaved);
    }
    if (onAction) onAction('save', data);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAction) onAction('compare', data);
  };
  
  const displayImage = data.imageUrl || `https://picsum.photos/seed/${data.id}/600/340`;

  return (
    <div 
      className={`group relative bg-white dark:bg-[#161618] rounded-2xl border transition-all duration-300 overflow-hidden my-2 sm:my-3 w-full max-w-sm text-left rtl:text-right ${
        isCompared 
          ? 'border-[#0071E3] ring-2 ring-[#0071E3]/20 shadow-md' 
          : 'border-black/[0.06] dark:border-white/[0.08] hover:border-black/20 dark:hover:border-white/20 shadow-sm hover:shadow-lg hover:shadow-black/[0.03]'
      }`}
    >
      {/* Property Imagery with Apple Frosted Overlays */}
      <div 
        className="h-32 sm:h-36 bg-neutral-100 dark:bg-neutral-800 relative overflow-hidden cursor-pointer" 
        onClick={() => onAction && onAction('view', data)}
      >
        <img 
          src={displayImage} 
          alt={displayTitle}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        
        {/* Subtle Frosted Type & Status Badges */}
        <div className="absolute top-2.5 left-2.5 rtl:left-auto rtl:right-2.5 flex items-center gap-1.5">
          <span className="text-[10px] sm:text-[11px] font-medium tracking-tight px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-black/60 backdrop-blur-md text-white shadow-sm">
            {isRent ? t.rent : t.sale}
          </span>
          <span className="text-[10px] sm:text-[11px] font-medium tracking-tight px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-white/80 dark:bg-black/70 backdrop-blur-md text-neutral-900 dark:text-neutral-100 shadow-sm">
            {displayType}
          </span>
        </div>

        {/* Quick Save Heart Icon on Top-Right */}
        <button 
          onClick={handleSave}
          className={`absolute top-2.5 right-2.5 rtl:right-auto rtl:left-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all backdrop-blur-md ${
            localSaved 
              ? 'bg-rose-500 text-white shadow-sm' 
              : 'bg-black/40 hover:bg-black/60 text-white'
          }`}
          title={localSaved ? t.saved : t.save}
          aria-label={t.save}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2] ${localSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Property Details */}
      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        {/* Title & Price */}
        <div className="flex justify-between items-start gap-1.5 sm:gap-2">
          <h3 
            onClick={() => onAction && onAction('view', data)}
            className="font-medium text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 leading-snug line-clamp-2 cursor-pointer hover:text-[#0071E3] transition-colors flex-1"
          >
            {displayTitle}
          </h3>
          <div className="text-right rtl:text-left shrink-0">
            <span className="font-semibold text-xs sm:text-sm text-neutral-950 dark:text-white tracking-tight">
              {priceAmount}
            </span>
            <span className="text-[10px] sm:text-[11px] text-neutral-400 font-normal ml-0.5 sm:ml-1 rtl:mr-0.5 rtl:sm:mr-1 rtl:ml-0">
              {t.sar}
            </span>
          </div>
        </div>

        {/* Location - Quiet inline typography */}
        <div className="flex items-center text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400">
          <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 rtl:ml-1 rtl:mr-0 text-neutral-400 shrink-0 stroke-[1.6]" />
          <span className="truncate">{displayLocation}</span>
        </div>

        {/* Specs - Unboxed typographic row with separators */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-[11px] sm:text-xs text-neutral-600 dark:text-neutral-300 py-1 border-y border-black/[0.04] dark:border-white/[0.06]">
          {specsParts.map((spec, idx) => (
            <div key={idx} className="flex items-center gap-1 font-medium">
              {spec.includes('bd') || spec.includes('غرف') ? <Bed className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-400 stroke-[1.6]" /> : null}
              {spec.includes('ba') || spec.includes('حمام') || spec.includes('مياه') ? <Bath className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-400 stroke-[1.6]" /> : null}
              {spec.includes('sqm') || spec.includes('م') ? <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-400 stroke-[1.6]" /> : null}
              <span>
                {spec.replace('bd', isArabic ? 'غرف' : 'bd')
                     .replace('ba', isArabic ? 'حمامات' : 'ba')
                     .replace('sqm', isArabic ? 'م²' : 'm²')}
              </span>
            </div>
          ))}
        </div>

        {/* Highlights - Zero-Pill discipline: unboxed text with subtle typographic separators */}
        {highlightsList.length > 0 && (
          <div className="text-[10px] sm:text-[11px] text-neutral-400 dark:text-neutral-500 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 leading-relaxed line-clamp-1">
            {highlightsList.slice(0, 3).map((tag, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span aria-hidden="true" className="opacity-40">·</span>}
                <span className="truncate">{tag}</span>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Apple Sleek Action Bar */}
        <div className="flex items-center justify-between pt-1 gap-1 sm:gap-2">
          <button 
            onClick={() => onAction && onAction('view', data)}
            className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-2 sm:px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-[11px] sm:text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 stroke-[1.6]" />
            <span>{t.view}</span>
          </button>

          <button 
            onClick={handleCompare}
            className={`p-1.5 sm:p-2 rounded-xl text-xs font-medium transition-colors shrink-0 ${
              isCompared 
                ? 'bg-[#0071E3] text-white shadow-sm' 
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            title={t.compare}
            aria-label={t.compare}
          >
            <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.6]" />
          </button>

          <button 
            onClick={() => onAction && onAction('chat', data)}
            className="p-1.5 sm:p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
            title={t.chat}
            aria-label={t.chat}
          >
            <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.6]" />
          </button>

          <button 
            onClick={handleWhatsApp}
            className="p-1.5 sm:p-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors text-[11px] sm:text-xs font-semibold shrink-0"
            title={t.whatsapp}
            aria-label={t.whatsapp}
          >
            {t.whatsapp}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
