import React, { useState, useEffect } from 'react';
import { SremService } from '../../services/sremService';
import { MockMarketService } from '../../services/mockMarketService';
import { SremIndicator, MarketMockSeries, Lang } from '../../types';
import { BarChart3, TrendingUp, TrendingDown, MapPin, Calendar, Info, AlertTriangle } from 'lucide-react';

interface MarketInsightsModalProps {
  lang?: Lang;
}

const MarketInsightsModal: React.FC<MarketInsightsModalProps> = ({ 
  lang: propLang
}) => {
  const [indicators, setIndicators] = useState<SremIndicator[]>([]);
  const [historySeries, setHistorySeries] = useState<MarketMockSeries[]>([]);
  const [activeDistrict, setActiveDistrict] = useState<string | null>(null);

  const lang = (propLang || localStorage.getItem('aqar_ai_lang') || 'en') as 'en' | 'ar';
  const isAr = lang === 'ar';

  const t = {
    title: isAr ? 'رؤى السوق العقاري والبورصة' : 'Market Insights & Exchange',
    subtitle: isAr ? 'بيانات التداول ومؤشرات الأسعار لمدينة الرياض والمملكة' : 'Trading volume and price indices for Riyadh and KSA',
    mock: isAr ? 'بيانات محاكاة' : 'SIMULATED DATA',
    official: isAr ? 'البورصة العقارية' : 'OFFICIAL SREM',
    lastUpdated: isAr ? 'آخر تحديث' : 'Updated',
    totalVolume: isAr ? 'إجمالي التداول (30 يوم)' : 'Total Volume (30d)',
    sar: isAr ? 'ريال' : 'SAR',
    disclaimer: isAr ? 'البيانات محاكاة بناءً على مؤشرات عامة لغرض العرض التجريبي والتحليل.' : 'Data is simulated based on public anchor metrics for demonstration.',
    noData: isAr ? 'لا توجد بيانات متاحة حالياً.' : 'No market data available.',
    performance: isAr ? 'مؤشرات أحياء' : 'Market Performance in',
    days: isAr ? 'آخر 30 يوم' : 'Last 30 Days',
    avgPrice: isAr ? 'متوسط سعر المتر' : 'Avg Price / Sqm',
    deals: isAr ? 'الصفقات' : 'Deals',
    volume: isAr ? 'الحجم' : 'Volume',
  };

  useEffect(() => {
    setIndicators(SremService.getIndicators());
    setHistorySeries(MockMarketService.getSeries());
  }, []);

  const totalVolume = indicators.reduce((acc, curr) => acc + curr.transactionVolume, 0);
  const cities = Array.from(new Set(indicators.map(i => i.city)));
  const isMockData = indicators.length > 0 && indicators[0].isMock;

  const getDistrictHistory = (district: string) => {
    return historySeries.filter(s => s.district === district).sort((a,b) => a.period.localeCompare(b.period));
  };

  return (
    <div className="flex flex-col h-full bg-[#FBFBFD] dark:bg-[#000000] text-neutral-900 dark:text-neutral-100" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header Bar */}
      <div className="p-3.5 sm:p-5 sm:px-6 bg-white/80 dark:bg-[#161618]/80 backdrop-blur-2xl border-b border-black/[0.06] dark:border-white/[0.08] sticky top-0 z-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-[#0071E3] stroke-[2]" />
              <span>{t.title}</span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {isMockData ? (
                <span className="text-[10px] sm:text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {t.mock}
                </span>
              ) : (
                <span className="text-[10px] sm:text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {t.official}
                </span>
              )}
              <span className="text-[11px] sm:text-xs">· {t.lastUpdated}: {new Date().toLocaleDateString()}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right rtl:text-left bg-black/[0.03] dark:bg-white/[0.04] px-3 sm:px-3.5 py-1.5 rounded-xl border border-black/[0.04] dark:border-white/[0.06]">
              <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">{t.totalVolume}</p>
              <p className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-white tracking-tight">
                {(totalVolume / 1000000).toFixed(1)}M <span className="text-xs font-normal text-neutral-400">{t.sar}</span>
              </p>
            </div>
          </div>
        </div>

        {isMockData && (
          <div className="text-[10px] sm:text-[11px] text-neutral-500 bg-black/[0.02] dark:bg-white/[0.03] px-2.5 sm:px-3 py-1.5 rounded-xl border border-black/[0.03] dark:border-white/[0.04] flex items-center gap-2 mt-2">
            <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span>{t.disclaimer}</span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-3.5 sm:p-6 overflow-y-auto flex-1 space-y-6 sm:space-y-8">
        {indicators.length === 0 ? (
          <div className="text-center py-20 text-neutral-400">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">{t.noData}</p>
          </div>
        ) : (
          cities.map(city => {
            const cityIndicators = indicators.filter(i => i.city === city);
            return (
              <div key={city} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 tracking-tight">
                    <MapPin className="w-4 h-4 text-[#0071E3] stroke-[1.8]" /> 
                    <span>{t.performance} {city === 'Riyadh' && isAr ? 'الرياض' : city}</span>
                  </h4>
                  <span className="text-xs text-neutral-400">
                    {cityIndicators.length} {isAr ? 'أحياء مرصودة' : 'districts'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cityIndicators.map(ind => {
                    const history = getDistrictHistory(ind.district);
                    const sparkData = history.slice(-6).map(h => h.avgPriceSqm);
                    const min = Math.min(...sparkData);
                    const max = Math.max(...sparkData);
                    const isPositive = ind.avgPriceSqmChange >= 0;

                    return (
                      <div 
                        key={ind.id} 
                        className="bg-white dark:bg-[#161618] p-5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm hover:shadow-md transition-all space-y-4"
                      >
                        {/* District & Trend */}
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h5 className="font-semibold text-base text-neutral-900 dark:text-neutral-100 tracking-tight">
                              {ind.district}
                            </h5>
                            <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3 stroke-[1.6]" />
                              <span>{t.days}</span>
                            </p>
                          </div>
                          
                          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                            isPositive 
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' 
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                          }`}>
                            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            <span>{Math.abs(ind.avgPriceSqmChange)}%</span>
                          </div>
                        </div>

                        {/* Metric & Mini Sparkline */}
                        <div className="space-y-2">
                          <div>
                            <p className="text-[10px] text-neutral-400 uppercase font-semibold tracking-wider">{t.avgPrice}</p>
                            <p className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-white mt-0.5">
                              {Math.round(ind.avgPriceSqm).toLocaleString()} 
                              <span className="text-xs text-neutral-400 font-normal ml-1 rtl:mr-1 rtl:ml-0">{t.sar}</span>
                            </p>
                          </div>

                          {/* Minimalist Sparkline Bar visualization */}
                          <div className="h-10 flex items-end gap-1.5 pt-2">
                            {sparkData.map((val, idx) => {
                              const heightPercent = max === min ? 50 : ((val - min) / (max - min)) * 75 + 25;
                              return (
                                <div 
                                  key={idx} 
                                  title={`${val.toLocaleString()} SAR`}
                                  className="flex-1 bg-neutral-100 hover:bg-[#0071E3] dark:bg-neutral-800 dark:hover:bg-[#0071E3] transition-colors rounded-sm cursor-pointer"
                                  style={{ height: `${heightPercent}%` }}
                                />
                              );
                            })}
                          </div>

                          {/* Deals and Volume Stats */}
                          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-black/[0.04] dark:border-white/[0.06] text-xs">
                            <div>
                              <p className="text-[10px] text-neutral-400 uppercase font-medium">{t.deals}</p>
                              <p className="font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">{ind.transactionCount}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-neutral-400 uppercase font-medium">{t.volume}</p>
                              <p className="font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">{(ind.transactionVolume / 1000000).toFixed(1)}M</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MarketInsightsModal;
