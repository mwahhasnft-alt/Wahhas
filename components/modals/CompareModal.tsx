import React from 'react';
import { Property, Lang } from '../../types';
import { X, MapPin, Bed, Bath, Maximize2, Tag } from 'lucide-react';

interface CompareModalProps {
  properties: Property[];
  onRemove: (id: string) => void;
  onClear: () => void;
  lang: Lang;
  onClose: () => void;
}

const CompareModal: React.FC<CompareModalProps> = ({ 
  properties, 
  onRemove, 
  onClear, 
  lang, 
  onClose
}) => {
  const isAr = lang === 'ar';

  if (properties.length === 0) return null;

  const t = {
    title: isAr ? 'مقارنة العقارات الذكية' : 'Property Comparison',
    subtitle: isAr ? 'مقارنة تفصيلية للمواصفات والأسعار والمميزات جنباً إلى جنب' : 'Side-by-side comparison of specs, prices, and amenities',
    clear: isAr ? 'مسح المقارنة' : 'Clear All',
    price: isAr ? 'السعر' : 'Price',
    location: isAr ? 'الموقع' : 'Location',
    type: isAr ? 'النوع' : 'Type',
    area: isAr ? 'المساحة' : 'Area',
    beds: isAr ? 'غرف النوم' : 'Bedrooms',
    baths: isAr ? 'دورات المياه' : 'Bathrooms',
    features: isAr ? 'المميزات' : 'Features',
    sar: isAr ? 'ريال' : 'SAR',
    sqm: isAr ? 'م²' : 'm²',
  };

  const getLoc = (p: Property, field: 'title' | 'city' | 'district' | 'type') => {
    if (isAr) {
       if (field === 'title') return p.titleAr || p.title;
       if (field === 'city') return p.cityAr || p.city;
       if (field === 'district') return p.districtAr || p.district;
       if (field === 'type') {
           const type = p.type;
           if (type === 'Villa') return 'فيلا';
           if (type === 'Apartment') return 'شقة';
           if (type === 'Land') return 'أرض';
           if (type === 'Townhouse') return 'تاون هاوس';
           if (type === 'Office') return 'مكتب';
           return type;
       }
    }
    return p[field];
  };

  return (
    <div className="flex flex-col h-full bg-[#FBFBFD] dark:bg-[#000000] text-neutral-900 dark:text-neutral-100" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Apple Minimalist Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 p-3.5 sm:px-6 bg-white/80 dark:bg-[#161618]/80 backdrop-blur-2xl border-b border-black/[0.06] dark:border-white/[0.08] sticky top-0 z-20 shrink-0">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white flex items-center gap-2">
            <span>{t.title}</span>
            <span className="text-xs font-normal text-neutral-400 dark:text-neutral-500 bg-black/[0.04] dark:bg-white/[0.06] px-2 py-0.5 rounded-full">
              {properties.length}
            </span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={onClear}
            className="text-xs text-neutral-500 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400 font-medium px-3 py-1.5 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            {t.clear}
          </button>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="flex-1 overflow-x-auto p-3 sm:p-6 scrollbar-thin">
        <div className="min-w-max">
          <div className="grid gap-3 sm:gap-4" style={{ gridTemplateColumns: `100px repeat(${properties.length}, minmax(220px, 1fr))` }}>
            
            {/* Corner header cell */}
            <div className="flex flex-col justify-end pb-2 sm:pb-3 text-[11px] sm:text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              {isAr ? 'العقارات المختارة' : 'Selected Units'}
            </div>

            {/* Property Cards Header */}
            {properties.map(p => (
              <div 
                key={p.id} 
                className="relative bg-white dark:bg-[#161618] rounded-xl sm:rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group"
              >
                {/* Remove from compare button */}
                <button 
                  onClick={() => onRemove(p.id)}
                  className="absolute top-2 right-2 rtl:right-auto rtl:left-2 bg-black/50 hover:bg-rose-600 text-white rounded-full p-1 sm:p-1.5 transition-colors z-10 backdrop-blur-md"
                  title={isAr ? 'إزالة من المقارنة' : 'Remove'}
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className="h-28 sm:h-40 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  <img 
                    src={p.images?.[0] || `https://picsum.photos/seed/${p.id}/600/340`} 
                    alt={p.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
                <div className="p-2.5 sm:p-3.5 space-y-1">
                  <h3 className="font-semibold text-xs sm:text-sm line-clamp-2 h-8 sm:h-10 text-neutral-900 dark:text-neutral-100 leading-snug">
                    {getLoc(p, 'title')}
                  </h3>
                  <div className="text-[#0071E3] font-semibold text-sm sm:text-base tracking-tight">
                    {p.price.toLocaleString()} <span className="text-[11px] sm:text-xs text-neutral-400 font-normal">{t.sar}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Type Row */}
            <div className="flex items-center text-[11px] sm:text-xs font-semibold text-neutral-400 uppercase tracking-wider py-2.5 sm:py-3 border-b border-black/[0.04] dark:border-white/[0.06]">
              <Tag className="w-3.5 h-3.5 mr-1.5 rtl:ml-1.5 rtl:mr-0 stroke-[1.8]" /> {t.type}
            </div>
            {properties.map(p => (
              <div key={`type-${p.id}`} className="py-2.5 sm:py-3 px-3 sm:px-4 border-b border-black/[0.04] dark:border-white/[0.06] text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
                {getLoc(p, 'type')}
              </div>
            ))}

            {/* Location Row */}
            <div className="flex items-center text-xs font-semibold text-neutral-400 uppercase tracking-wider py-3 border-b border-black/[0.04] dark:border-white/[0.06]">
              <MapPin className="w-3.5 h-3.5 mr-2 rtl:ml-2 rtl:mr-0 stroke-[1.8]" /> {t.location}
            </div>
            {properties.map(p => (
              <div key={`loc-${p.id}`} className="py-3 px-4 border-b border-black/[0.04] dark:border-white/[0.06] text-xs text-neutral-700 dark:text-neutral-300">
                {getLoc(p, 'city')} - {getLoc(p, 'district')}
              </div>
            ))}

            {/* Area Row */}
            <div className="flex items-center text-xs font-semibold text-neutral-400 uppercase tracking-wider py-3 border-b border-black/[0.04] dark:border-white/[0.06]">
              <Maximize2 className="w-3.5 h-3.5 mr-2 rtl:ml-2 rtl:mr-0 stroke-[1.8]" /> {t.area}
            </div>
            {properties.map(p => (
              <div key={`area-${p.id}`} className="py-3 px-4 border-b border-black/[0.04] dark:border-white/[0.06] text-xs font-medium text-neutral-800 dark:text-neutral-200">
                {p.area} {t.sqm}
              </div>
            ))}

            {/* Bedrooms Row */}
            <div className="flex items-center text-xs font-semibold text-neutral-400 uppercase tracking-wider py-3 border-b border-black/[0.04] dark:border-white/[0.06]">
              <Bed className="w-3.5 h-3.5 mr-2 rtl:ml-2 rtl:mr-0 stroke-[1.8]" /> {t.beds}
            </div>
            {properties.map(p => (
              <div key={`bed-${p.id}`} className="py-3 px-4 border-b border-black/[0.04] dark:border-white/[0.06] text-xs font-medium text-neutral-800 dark:text-neutral-200">
                {p.beds || '-'}
              </div>
            ))}

            {/* Bathrooms Row */}
            <div className="flex items-center text-xs font-semibold text-neutral-400 uppercase tracking-wider py-3 border-b border-black/[0.04] dark:border-white/[0.06]">
              <Bath className="w-3.5 h-3.5 mr-2 rtl:ml-2 rtl:mr-0 stroke-[1.8]" /> {t.baths}
            </div>
            {properties.map(p => (
              <div key={`bath-${p.id}`} className="py-3 px-4 border-b border-black/[0.04] dark:border-white/[0.06] text-xs font-medium text-neutral-800 dark:text-neutral-200">
                {p.baths || '-'}
              </div>
            ))}

            {/* Features Highlights Row - Zero-Pill Typography */}
            <div className="flex items-start pt-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              {t.features}
            </div>
            {properties.map(p => {
              const feats = (isAr && p.highlightsAr) ? p.highlightsAr : p.highlights;
              return (
                <div key={`feat-${p.id}`} className="pt-3 px-4">
                  <div className="text-xs text-neutral-600 dark:text-neutral-300 flex flex-wrap items-center gap-x-2 gap-y-1">
                    {feats.map((f, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <span aria-hidden="true" className="opacity-40">·</span>}
                        <span>{f}</span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareModal;
