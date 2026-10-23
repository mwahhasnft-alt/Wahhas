import React, { useState, useEffect } from 'react';
import { 
  Atom, 
  BookOpen, 
  ExternalLink, 
  Search, 
  Sun, 
  Thermometer, 
  Layers, 
  Award, 
  Sparkles, 
  FileText, 
  MapPin, 
  Loader2,
  CheckCircle2,
  Leaf
} from 'lucide-react';
import { ScienceService, ScientificArticle, DistrictScienceProfile } from '../../services/scienceService';
import { Lang } from '../../types';

interface ScienceModalProps {
  lang: Lang;
  onClose: () => void;
  onAskScienceInChat: (query: string) => void;
}

export default function ScienceModal({ lang, onClose, onAskScienceInChat }: ScienceModalProps) {
  const isAr = lang === 'ar';

  const [activeTab, setActiveTab] = useState<'literature' | 'geotech' | 'mostadam'>('literature');
  const [searchQuery, setSearchQuery] = useState('Riyadh urban heat island');
  const [articles, setArticles] = useState<ScientificArticle[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  
  const [selectedDistrict, setSelectedDistrict] = useState('Al Malqa');
  const [districtProfile, setDistrictProfile] = useState<DistrictScienceProfile>(
    ScienceService.getDistrictScienceProfile('Al Malqa')
  );

  const quickQueries = [
    { label: isAr ? 'ظاهرة الجزيرة الحرارية بالرياض' : 'Riyadh Urban Heat Island', q: 'Riyadh urban heat island' },
    { label: isAr ? 'جيوتقنية تربة نجد والأساسات' : 'Najd Limestone Foundation', q: 'Najd limestone geotechnical soil' },
    { label: isAr ? 'معايير مباني مستدام الخضراء' : 'Mostadam Green Building', q: 'Mostadam green building Saudi' },
    { label: isAr ? 'الإشعاع الشمسي والأسطح الكهروضوئية' : 'Solar Rooftop Riyadh', q: 'Riyadh solar radiation photovoltaic' }
  ];

  const handleSearch = async (queryText: string) => {
    setLoadingArticles(true);
    try {
      const results = await ScienceService.searchScientificLiterature(queryText, 6);
      setArticles(results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingArticles(false);
    }
  };

  useEffect(() => {
    handleSearch(searchQuery);
  }, []);

  useEffect(() => {
    setDistrictProfile(ScienceService.getDistrictScienceProfile(selectedDistrict));
  }, [selectedDistrict]);

  return (
    <div className="flex flex-col h-full max-h-[85vh] text-slate-800 dark:text-slate-100">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <Atom className="w-5 h-5 sm:w-6 sm:h-6 animate-spin-slow" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span>{isAr ? 'العلوم البيئية والجيوتقنية' : 'Science & Environmental'}</span>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 font-mono">
                Europe PMC & SBC
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
              {isAr 
                ? 'أبحاث علمية محكّمة، تحليلات التربة، ومؤشرات الاستدامة البيئية' 
                : 'Peer-reviewed research and geotechnical analysis for KSA real estate'}
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-medium overflow-x-auto no-scrollbar w-full sm:w-auto shrink-0 gap-0.5">
          <button
            onClick={() => setActiveTab('literature')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all whitespace-nowrap text-[11px] sm:text-xs shrink-0 ${
              activeTab === 'literature'
                ? 'bg-white dark:bg-slate-700 shadow-sm text-teal-600 dark:text-teal-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {isAr ? 'الأبحاث (Europe PMC)' : 'Papers (Europe PMC)'}
          </button>
          <button
            onClick={() => setActiveTab('geotech')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all whitespace-nowrap text-[11px] sm:text-xs shrink-0 ${
              activeTab === 'geotech'
                ? 'bg-white dark:bg-slate-700 shadow-sm text-teal-600 dark:text-teal-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {isAr ? 'جيولوجيا التربة' : 'Geotechnics & Soil'}
          </button>
          <button
            onClick={() => setActiveTab('mostadam')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all whitespace-nowrap text-[11px] sm:text-xs shrink-0 ${
              activeTab === 'mostadam'
                ? 'bg-white dark:bg-slate-700 shadow-sm text-teal-600 dark:text-teal-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {isAr ? 'الاستدامة ومستدام' : 'Mostadam & Solar'}
          </button>
        </div>
      </div>

      {/* Tab 1: Scientific Literature Search */}
      {activeTab === 'literature' && (
        <div className="flex-1 overflow-y-auto pt-4 space-y-4 pr-1">
          {/* Search Box */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                placeholder={isAr ? 'ابحث في ملايين الأوراق العلمية (مثل: Riyadh microclimate, Mostadam)...' : 'Search millions of scientific papers (e.g. Riyadh microclimate, Mostadam)...'}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              />
            </div>
            <button
              onClick={() => handleSearch(searchQuery)}
              disabled={loadingArticles}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-xl transition flex items-center gap-2"
            >
              {loadingArticles ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {isAr ? 'بحث علمي' : 'Search'}
            </button>
          </div>

          {/* Quick-try chips */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-400">{isAr ? 'مقترحات:' : 'Topics:'}</span>
            {quickQueries.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchQuery(item.q);
                  handleSearch(item.q);
                }}
                className="text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition border border-transparent hover:border-teal-300"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Results List */}
          {loadingArticles ? (
            <div className="py-16 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-teal-600" />
              <p className="text-sm">{isAr ? 'جاري استرجاع الأوراق العلمية من Europe PMC...' : 'Querying Europe PMC peer-reviewed repository...'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {articles.map((art) => (
                <div
                  key={art.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 hover:border-teal-500/40 transition space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                      {art.title}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-mono whitespace-nowrap">
                      {art.provenance}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium">{art.authorString}</span> • <em>{art.journalTitle}</em> ({art.pubYear})
                    {art.citedByCount ? ` • ${art.citedByCount} Citations` : ''}
                  </p>

                  {art.abstractText && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      {art.abstractText}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                    <div className="flex gap-2.5 sm:gap-3 flex-wrap">
                      <a
                        href={art.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {isAr ? 'عرض المصدر' : 'Source / DOI'}
                      </a>
                      {art.fullTextUrl && (
                        <a
                          href={art.fullTextUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          PDF
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        onAskScienceInChat(`${isAr ? 'بناءً على البحث العلمي التالي:' : 'Based on this scientific paper:'} "${art.title}", ${isAr ? 'كيف ينعكس ذلك على الاستثمار العقاري وجودة البناء في الرياض؟' : 'how does this apply to real estate investment and building quality in Riyadh?'}`);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-teal-700 dark:text-teal-300 text-xs font-medium transition flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      {isAr ? 'استشر AI حول الورقة' : 'Analyze in Chat'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Geotechnical Soil Profiles */}
      {activeTab === 'geotech' && (
        <div className="flex-1 overflow-y-auto pt-4 space-y-4 pr-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">{isAr ? 'اختر الحي لتحليل التربة:' : 'Select District for Soil & Foundation Specs:'}</span>
            <div className="flex gap-2">
              {['Al Malqa', 'Al Narjis', 'Al Olaya'].map((district) => (
                <button
                  key={district}
                  onClick={() => setSelectedDistrict(district)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                    selectedDistrict === district
                      ? 'bg-teal-600 text-white border-teal-600 font-medium'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {district}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Soil Geology Card */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3">
              <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-semibold text-sm">
                <Layers className="w-4 h-4" />
                {isAr ? 'الطبقات الجيولوجية والتربة' : 'Geological Strata & Soil Type'}
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="text-slate-400">{isAr ? 'نوع التكوين الصخري:' : 'Formation Type:'}</div>
                  <div className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                    {isAr ? districtProfile.soilGeology.typeAr : districtProfile.soilGeology.type}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">{isAr ? 'قدرة التحمل المسموحة للتربة (Bearing Capacity):' : 'Allowable Bearing Capacity:'}</div>
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
                    {districtProfile.soilGeology.bearingCapacity}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">{isAr ? 'توصيات كود البناء السعودي (SBC 303) للأساسات:' : 'SBC 303 Foundation Recommendation:'}</div>
                  <div className="font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 mt-0.5">
                    {districtProfile.soilGeology.foundationRecommendation}
                  </div>
                </div>
              </div>
            </div>

            {/* Urban Heat Island Card */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-sm">
                <Thermometer className="w-4 h-4" />
                {isAr ? 'مؤشر الجزيرة الحرارية والتشجير' : 'Urban Heat Island & Microclimate'}
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">{isAr ? 'درجة الشدة الحرارية:' : 'Severity Index:'}</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                    {districtProfile.urbanHeatIslandIndex.score}/10 ({districtProfile.urbanHeatIslandIndex.severity})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">{isAr ? 'نسبة الغطاء النباتي الحالي:' : 'Vegetation Canopy Coverage:'}</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {districtProfile.urbanHeatIslandIndex.vegetationCoverage}
                  </span>
                </div>
                <div>
                  <div className="text-slate-400">{isAr ? 'استراتيجية التخفيف المعتمدة:' : 'Microclimate Mitigation:'}</div>
                  <div className="font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 mt-0.5">
                    {districtProfile.urbanHeatIslandIndex.mitigationStrategy}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Mostadam & Sustainability */}
      {activeTab === 'mostadam' && (
        <div className="flex-1 overflow-y-auto pt-4 space-y-4 pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mostadam Card */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                <Leaf className="w-4 h-4" />
                {isAr ? 'نظام تقييم الاستدامة السعودي (مستدام)' : 'Saudi Mostadam Sustainability System'}
              </div>
              <p className="text-xs text-slate-500">
                {isAr 
                  ? 'برنامج معتمد من وزارة الشؤون البلدية والقروية والإسكان لتقييم كفاءة استهلاك الطاقة والمياه في المباني السكنية والتجارية.'
                  : 'Official KSA rating standard assessing water recycling, thermal envelopes, and sustainable procurement.'}
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{isAr ? 'المستوى المحقق:' : 'Target Rating:'}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {districtProfile.sustainabilityRating.mostadamRatingPotential}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-300">{isAr ? 'كفاءة إدارة المياه:' : 'Water Efficiency:'}</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {districtProfile.sustainabilityRating.waterEfficiencyIndex}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-300">{isAr ? 'المكافئ لمعيار LEED:' : 'LEED Equivalence:'}</span>
                  <span className="font-medium text-teal-600 dark:text-teal-400">
                    {districtProfile.sustainabilityRating.leedEquivalence}
                  </span>
                </div>
              </div>
            </div>

            {/* Solar Irradiance Card */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-sm">
                <Sun className="w-4 h-4" />
                {isAr ? 'الإشعاع الشمسي والأسطح الكهروضوئية (Solar PV)' : 'Solar Irradiation & Clean Energy Feasibility'}
              </div>
              <p className="text-xs text-slate-500">
                {isAr 
                  ? 'مؤشرات الإشعاع الشمسي الأفقي العالمي (GHI) ووفورات فواتير الكهرباء لأسطح الفلل والعقارات بالرياض.'
                  : 'Global Horizontal Irradiance (GHI) measurements supporting rooftop photovoltaic investment.'}
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{isAr ? 'معدل الإشعاع السنوي (GHI):' : 'Annual Irradiance (GHI):'}</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                    {districtProfile.solarIrradiation.annualGHI}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-300">{isAr ? 'الجدوى الاقتصادية للطاقة الشمسية:' : 'PV Feasibility:'}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {districtProfile.solarIrradiation.pvFeasibility}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-300">{isAr ? 'الإنتاج السنوي المتوقع لكل كيلوواط:' : 'Estimated Annual Yield:'}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                    {districtProfile.solarIrradiation.estimatedAnnualYield}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
          <span>{isAr ? 'البيانات العلمية مستندة إلى أبحاث Europe PMC وأكواد SBC المعتمدة' : 'Grounded in Europe PMC research and Saudi Building Codes'}</span>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition"
        >
          {isAr ? 'إغلاق' : 'Close'}
        </button>
      </div>
    </div>
  );
}
