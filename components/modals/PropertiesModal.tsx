import React, { useState } from 'react';
import { Lang, Property } from '../../types';
import PropertyCard from '../PropertyCard';
import { Building2, Search, Heart } from 'lucide-react';

interface PropertiesModalProps {
  properties: Property[];
  savedIds: Set<string>;
  compareSet: Set<string>;
  lang: Lang;
  onAction: (action: 'view' | 'save' | 'chat' | 'compare', data: any) => void;
}

const PropertiesModal: React.FC<PropertiesModalProps> = ({ 
  properties, 
  savedIds, 
  compareSet, 
  lang, 
  onAction
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const isAr = lang === 'ar';

  const t = {
    title: isAr ? 'استكشف عقارات الرياض' : 'Explore Properties',
    subtitle: isAr ? 'تصفح الفلل الفاخرة والشقق الاستثمارية والأراضي في أحياء الرياض' : 'Browse luxury villas, investment apartments, and land across Riyadh',
    all: isAr ? 'جميع العقارات' : 'All Properties',
    saved: isAr ? 'المفضلة' : 'Saved',
    emptyAll: isAr ? 'لا توجد عقارات مطابقة حالياً.' : 'No properties match your search.',
    emptySaved: isAr ? 'لم تقم بحفظ أي عقارات في المفضلة بعد.' : 'You haven\'t saved any properties yet.',
    searchPlaceholder: isAr ? 'بحث عن عقار، حي (الملقا، النرجس...) أو نوع...' : 'Search properties, districts (Al Malqa, Al Narjis...) or type...',
  };

  const transformToCard = (p: Property) => ({
    id: p.id,
    title: p.title,
    titleAr: p.titleAr,
    price: `${p.price} SAR (${p.listingType})`,
    location: `${p.city} - ${p.district}`,
    cityAr: p.cityAr,
    districtAr: p.districtAr,
    type: p.type,
    specs: `${p.beds ? p.beds + ' bd | ' : ''}${p.baths ? p.baths + ' ba | ' : ''}${p.area} sqm`,
    highlights: p.highlights.join(', '),
    highlightsAr: p.highlightsAr ? p.highlightsAr.join(', ') : undefined,
    imageUrl: p.images?.[0]
  });

  const filteredProperties = properties.filter(p => {
    if (activeTab === 'saved' && !savedIds.has(p.id)) {
      return false;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const content = `${p.title} ${p.titleAr || ''} ${p.city} ${p.cityAr || ''} ${p.district} ${p.districtAr || ''} ${p.type}`.toLowerCase();
      return content.includes(query);
    }

    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#FBFBFD] dark:bg-[#000000] text-neutral-900 dark:text-neutral-100" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header Bar */}
      <div className="p-3.5 sm:p-5 sm:px-6 bg-white/80 dark:bg-[#161618]/80 backdrop-blur-2xl border-b border-black/[0.06] dark:border-white/[0.08] sticky top-0 z-20 space-y-3 sm:space-y-4">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
            {t.title}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t.subtitle}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-between items-stretch sm:items-center">
          {/* Search Box */}
          <div className="relative w-full flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 rtl:right-3.5 rtl:left-auto" />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2 rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.03] dark:bg-white/[0.04] text-xs text-neutral-900 dark:text-white w-full focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 transition-all" 
            />
          </div>

          {/* Tabs */}
          <div className="flex p-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-full shrink-0 w-full sm:w-auto justify-center">
            <button 
              onClick={() => setActiveTab('all')}
              className={`flex-1 sm:flex-none px-3.5 sm:px-4 py-1.5 sm:py-1 rounded-full text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'all' 
                  ? 'bg-white dark:bg-[#161618] text-neutral-950 dark:text-white shadow-sm' 
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 stroke-[1.8]" />
              <span>{t.all}</span>
            </button>
            <button 
              onClick={() => setActiveTab('saved')}
              className={`flex-1 sm:flex-none px-3.5 sm:px-4 py-1.5 sm:py-1 rounded-full text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'saved' 
                  ? 'bg-white dark:bg-[#161618] text-rose-600 dark:text-rose-400 shadow-sm' 
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 stroke-[1.8] ${activeTab === 'saved' ? 'fill-current' : ''}`} />
              <span>{t.saved}</span>
              <span className="text-[10px] bg-black/[0.04] dark:bg-white/[0.08] px-1.5 py-0.2 rounded-full text-neutral-500">
                {savedIds.size}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="p-3.5 sm:p-6 overflow-y-auto flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {filteredProperties.map(p => (
            <div key={p.id} className="w-full">
              <PropertyCard 
                data={transformToCard(p)} 
                lang={lang} 
                isSaved={savedIds.has(p.id)}
                isCompared={compareSet.has(p.id)}
                onAction={onAction}
              />
            </div>
          ))}

          {filteredProperties.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-neutral-400">
              <div className="w-14 h-14 bg-black/[0.03] dark:bg-white/[0.04] rounded-2xl flex items-center justify-center mb-3">
                {activeTab === 'saved' ? <Heart className="w-6 h-6 text-neutral-400" /> : <Building2 className="w-6 h-6 text-neutral-400" />}
              </div>
              <p className="text-sm font-medium">{activeTab === 'saved' ? t.emptySaved : t.emptyAll}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertiesModal;
