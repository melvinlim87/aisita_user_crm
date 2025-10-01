// =====================================================
// FILE: src/components/ScheduleAnalysis.tsx  
// Schedule Analysis Component
// =====================================================

import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  chartStyles, 
  chartIntervals, 
  getExchangeList,
  getExchangeSymbols,
  popularExchanges,
  popularSymbolsByExchange,
  studyPresets,
  drawingPresets,
  technicalIndicators,
  smoothingLengthOptions,
  inputOptions
 } from '@/lib/chartImgApi';
import { CandlestickChart, Image as ImageIcon, Plus, X, TrendingUp, RefreshCw } from 'lucide-react';
import './style.css';
import { getRequest, postRequest, putRequest, deleteRequest } from '@/services/apiRequest';
import { useTranslation } from 'react-i18next';

// Local defaults
export const chartV2ParametersLocal = {
  symbol: 'BINANCE:BTCUSDT',
  interval: '1D',
  width: 800,
  height: 600,
  style: 'candle',
  theme: 'light',
  range: '1M',
  format: 'png',
};

interface ChartParameters {
  symbol: string;
  interval: string;
  range: string;
  style: string;
  width: number;
  height: number;
  theme: string;
}

interface SymbolData {
  symbol: string;
  description?: string;
  type?: string;
  exchange: string;
}

interface Schedule {
  id: number;
  user_id: number;
  command: string;
  cron_expression: string;
  execute_at: string;
  is_recurring: boolean;
  executed: boolean;
  created_at: string;
  updated_at: string;
}

const ScheduleAnalysis: React.FC = () => {
  const { t } = useTranslation();
  const userData = localStorage.getItem('user');
  const user = JSON.parse(userData || '{}');  
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<ChartParameters>({
    symbol: chartV2ParametersLocal.symbol,
    interval: chartV2ParametersLocal.interval,
    range: chartV2ParametersLocal.range,
    style: chartV2ParametersLocal.style,
    width: chartV2ParametersLocal.width,
    height: chartV2ParametersLocal.height,
    theme: chartV2ParametersLocal.theme,
  });

  // Symbol selector state
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [exchanges, setExchanges] = useState<string[]>([]);
  const [symbols, setSymbols] = useState<SymbolData[]>([]);
  const [symbolSearch, setSymbolSearch] = useState('');
  const [loadingSymbols, setLoadingSymbols] = useState(false);
  const [symbolTypes, setSymbolTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState('');
  // Searchable Exchange select state
  const [exchangeSearch, setExchangeSearch] = useState('');
  const [isExchangeOpen, setIsExchangeOpen] = useState(false);
  // Searchable Symbol select state
  const [symbolSearchLocal, setSymbolSearchLocal] = useState('');
  const [isSymbolOpen, setIsSymbolOpen] = useState(false);

  // Popular symbol selection state (two selects)
  const [popularExchange, setPopularExchange] = useState<string>('');
  const [popularSymbol, setPopularSymbol] = useState<string>('');

  // Technical indicators state
  const [selectedStudies, setSelectedStudies] = useState<any[]>([]);
  const [selectedDrawings, setSelectedDrawings] = useState<any[]>([]);
  const [showStudiesPanel, setShowStudiesPanel] = useState(false);
  // Filter text for indicators
  const [studySearch, setStudySearch] = useState('');

  // Multi-interval selection (up to 3)
  const [selectedIntervals, setSelectedIntervals] = useState<string[]>([]);

  // Scheduling controls
  const [scheduleHour, setScheduleHour] = useState<string>('09');
  const [scheduleMinute, setScheduleMinute] = useState<string>('00');
  const [scheduleFrequency, setScheduleFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [weeklyDayOfWeek, setWeeklyDayOfWeek] = useState<string>('1'); // 0=Sun..6=Sat; default Mon=1
  const [monthlyDayOfMonth, setMonthlyDayOfMonth] = useState<string>('1'); // 1..31

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isIntervalOpen, setIsIntervalOpen] = useState(false);
  const [shouldUpdate, setShouldUpdate] = useState(false);
  const [scheduleId, setScheduleId] = useState<string | null>(null);

  const canAddMoreIntervals = selectedIntervals.length < 3;

  const addCurrentInterval = () => {
    const cur = String(formData.interval || '').trim();
    if (!cur) return;
    if (selectedIntervals.includes(cur)) return;
    if (!canAddMoreIntervals) return;
    setSelectedIntervals(prev => [...prev, cur]);
  };

  const removeInterval = (iv: string) => {
    setSelectedIntervals(prev => prev.filter(x => x !== iv));
  };

  // Filter available options to exclude those already selected
  const availableStudyKeys = useMemo(() => {
    const chosen = new Set(
      selectedStudies || []
        .map((s: any) => (s?.name ?? s?.studyName ?? s?.key ?? s?.id))
        .filter(Boolean)
    );
    return Object.keys(studyPresets).filter((k) => !chosen.has(k));
  }, [selectedStudies]);

  const availableDrawingKeys = useMemo(() => {
    const chosen = new Set(
      selectedDrawings
        .map((d: any) => (d?.name ?? d?.drawingName ?? d?.key ?? d?.id))
        .filter(Boolean)
    );
    return Object.keys(drawingPresets).filter((k) => !chosen.has(k));
  }, [selectedDrawings]);

  // Filter full indicator catalog to exclude already-selected studies
  const availableIndicatorKeys = useMemo(() => {
    const chosen = new Set(
      selectedStudies
        .map((s: any) => (s?.name ?? s?.studyName ?? s?.key ?? s?.id))
        .filter(Boolean)
    );
    return Object.keys(technicalIndicators).filter((k) => !chosen.has(k));
  }, [selectedStudies]);

  // Filtered lists based on studySearch
  const filteredStudyKeys = useMemo(() => {
    const q = studySearch.toLowerCase();
    return availableStudyKeys.filter((k) => k.toLowerCase().includes(q));
  }, [availableStudyKeys, studySearch]);

  const filteredIndicatorKeys = useMemo(() => {
    const q = studySearch.toLowerCase();
    return availableIndicatorKeys.filter((k) => k.toLowerCase().includes(q));
  }, [availableIndicatorKeys, studySearch]);

  // Load exchanges and an initial symbol list (from popular exchanges) on mount
  useEffect(() => {
    (async () => {
      const response = await getRequest<{ success: boolean; message: string, data: any }>(
        '/schedule-task?user_id='+user.id,
      );

      if (response.success) {
        setSchedules(response.data);
      }
    })();
  }, []);

  useEffect(() => {
    // Respond to path changes (e.g., /schedule-analysis or /schedule-analysis/:id)
    (async () => {
      const url = location.pathname;
      const id = url.split('/').pop();
      const isNumericId = !!id && !isNaN(parseInt(id));
      if (isNumericId) {
        try {
          const response = await getRequest<{ success: boolean; message: string, data: any }>(
            '/schedule-task/' + id + '?user_id=' + user.id,
          );
          if (response.success) {
            const params = response.data.parameter;
            const originalSymbol = params.symbol;
            const exchange = originalSymbol.split(':')[0];
            setPopularExchange(exchange);
            setPopularSymbol(originalSymbol);
            const originalStudy = params.studies;
            setSelectedStudies(originalStudy ? originalStudy : []);
            setSelectedIntervals(params.intervals);
            const originalExecutedAt = response.data.execute_at;

            // format originalExecutedAt to hour and minute then apply to formData
            const date = new Date(originalExecutedAt);
            const hour = date.getHours();
            const minute = date.getMinutes();
            setScheduleHour(String(hour.toString()).padStart(2, '0'));
            setScheduleMinute(minute.toString().padStart(2, '0'));
            setFormData(params);
          }
          setScheduleId(id || null);
          setShouldUpdate(true);
        } catch (e) {
          // Silent fail, keep current state
        }
      } else {
        // No id on path: ensure we are in create mode
        setScheduleId(null);
        setShouldUpdate(false);
      }
    })();
  }, [location.pathname, user.id]);

  const loadExchanges = async () => {
    try {
      const result = await getExchangeList();
      if (result.payload) {
        setExchanges(result.payload.sort());
      }
    } catch (err) {
      console.error('Failed to load exchanges:', err);
    }
  };

  const loadSymbolsMultiExchange = async () => {
    setLoadingSymbols(true);
    try {
      // choose a small subset of popular exchanges to keep UI responsive
      const available = exchanges.length ? exchanges : (await getExchangeList()).payload || [];
      const topEx = popularExchanges.filter((ex: string) => available.includes(ex)).slice(0, 5);
      const results = await Promise.all(
        topEx.map(async (ex) => {
          try {
            const res = await getExchangeSymbols({ exchangeId: ex, type: selectedType || undefined });
            const payload = res.payload || [];
            return payload.map((s: any) => ({
              symbol: s.symbol,
              description: s.description,
              type: s.type,
              exchange: ex,
            })) as SymbolData[];
          } catch {
            return [] as SymbolData[];
          }
        })
      );
      const merged = results.flat();
      setSymbols(merged);
      const types = [...new Set(merged.map((s: any) => s.type).filter(Boolean))];
      setSymbolTypes(types.sort() as string[]);
    } catch (err) {
      console.error('Failed to load symbols:', err);
    } finally {
      setLoadingSymbols(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'width' || name === 'height' ? Number(value) : value
    }));
  };

  const handlePopularExchangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ex = e.target.value;
    setPopularExchange(ex);
    setPopularSymbol('');
    // Reset composed symbol until symbol is chosen
    setFormData(prev => ({ ...prev, symbol: '' }));
  };

  const handlePopularSymbolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sym = e.target.value;
    setPopularSymbol(sym);
    if (popularExchange && sym) {
      setFormData(prev => ({ ...prev, symbol: `${popularExchange}:${sym}` }));
    }
  };

  const handleSymbolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const full = e.target.value; // EXCHANGE:SYMBOL
    setFormData(prev => ({ ...prev, symbol: full }));
  };

  const addStudy = (studyName: string) => {
    // Enforce max 3 studies and prevent duplicates
    if (selectedStudies.length >= 3) {
      setError(t('Validation_MaxThreeStudies'));
      return;
    }
    const already = selectedStudies.some(
      (s: any) => (s?.name ?? s?.studyName ?? s?.key) === studyName
    );
    if (already) return;
    const preset = studyPresets[studyName as keyof typeof studyPresets];
    if (preset) {
      setSelectedStudies(prev => ([...prev, preset]));
    } else {
      const indicator = technicalIndicators[studyName as keyof typeof technicalIndicators];
      if (indicator) {
        setSelectedStudies(prev => ([...prev, {
          id: Date.now(),
          name: studyName,
          // input: indicator.input || {},
          override: {}
        }]));
      }
    }
  };

  const removeStudy = (id: number) => {
    setSelectedStudies(prev => prev.filter(study => study.id !== id));
  };

  // Update input (number or string) for a specific technical indicator
  const updateStudyInput = (
    id: number,
    key: string,
    value: number | string
  ) => {
    setSelectedStudies(prev => prev.map(s => {
      if (s.id !== id) return s;
      const nextInput = { ...(s.input || {}) } as any;
      (nextInput as any)[key] = value;
      return { ...s, input: nextInput };
    }));
  };

  // Drawing controls (restored)
  const addDrawing = (drawingName: string) => {
    // Enforce max 3 drawings and prevent duplicates
    if (selectedDrawings.length >= 3) {
      setError(t('Validation_MaxThreeDrawings'));
      return;
    }
    const already = selectedDrawings.some(
      (d: any) => (d?.name ?? d?.drawingName ?? d?.key) === drawingName
    );
    if (already) return;
    const preset = drawingPresets[drawingName as keyof typeof drawingPresets];
    if (preset) {
      const drawingWithDefaults = {
        ...preset,
        id: Date.now(),
        input: {
          ...preset.input,
          // Add current date for time-based drawings
          ...(preset.input.startDatetime ? {
            startDatetime: new Date().toISOString(),
            endDatetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          } : {}),
          ...(preset.input.datetime ? {
            datetime: new Date().toISOString()
          } : {})
        }
      };
      setSelectedDrawings(prev => ([...prev, drawingWithDefaults]));
    }
  };

  const removeDrawing = (id: number) => {
    setSelectedDrawings(prev => prev.filter(drawing => drawing.id !== id));
  };

  // Update inputs for a specific drawing (start/end price & datetime)
  const updateDrawingInput = (
    id: number,
    field: 'startPrice' | 'endPrice' | 'startDatetime' | 'endDatetime',
    value: string | number
  ) => {
    setSelectedDrawings(prev => prev.map(d => {
      if (d.id !== id) return d;
      return {
        ...d,
        input: {
          ...d.input,
          [field]: value,
        },
      };
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!formData.symbol) {
        throw new Error(t('Validation_PleaseSelectSymbol'));
      }
      if (!scheduleHour || !scheduleMinute) {
        throw new Error(t('Schedule_PleaseSelectTime'));
      }
      if (scheduleFrequency === 'weekly' && (weeklyDayOfWeek === '' || weeklyDayOfWeek == null)) {
        throw new Error(t('Schedule_PleaseSelectDayOfWeek'));
      }
      if (scheduleFrequency === 'monthly' && (monthlyDayOfMonth === '' || monthlyDayOfMonth == null)) {
        throw new Error(t('Schedule_PleaseSelectDayOfMonth'));
      }
      const intervalsToUse = selectedIntervals.length
        ? selectedIntervals
        : (formData.interval ? [String(formData.interval)] : []);
      if (!intervalsToUse.length) {
        throw new Error(t('Validation_PleaseSelectAtLeastOneInterval'));
      }
      const chartParams: any = {
        symbol: formData.symbol,
        // Keep single interval for compatibility; also pass full list
        interval: intervalsToUse[0],
        intervals: intervalsToUse,
        range: formData.range,
        style: formData.style,
        width: formData.width,
        height: formData.height,
        theme: formData.theme,
        format: 'png',
      };

      // Add studies if any
      if (selectedStudies.length > 0) {
        chartParams.studies = selectedStudies.map(study => ({
          name: study.name,
          input: study.input,
          override: study.override,
          forceOverlay: study.forceOverlay
        }));
      }

      // Add drawings if any
      if (selectedDrawings.length > 0) {
        chartParams.drawings = selectedDrawings.map(drawing => ({
          name: drawing.name,
          input: drawing.input,
          override: drawing.override,
          zOrder: drawing.zOrder
        }));
      }

      const payload = { 
        ...chartParams, 
        schedule: cronExpression,
        user_id: user.id,
        preview_from_chart_on_demand: 'true',
        asArray: true,
      };

      // update schedule
      let response
      if (scheduleId) {
        response = await putRequest<{ success: boolean; message: string }>(
          '/schedule-task/' + scheduleId, payload,
        );
      } else {
        response = await postRequest<{ success: boolean; message: string }>(
          '/schedule-task', payload,
        );
      }
      if (response?.success) {
        setSuccess(response.message);
        // clear data
        setSelectedStudies([])
        setTimeout(() => {
          // refresh page
          window.location.reload();
        }, 1000);
      } else {
        setError(response?.message || t('Schedule_CreateFailed'));
      }
    } catch (error: any) {
      setError(error.message || t('ChartOnDemand_Error_GenerateGeneric'));
    } finally {
      setIsLoading(false);
    }
  };

  const imageToUrl = async (base64: string, contentType: string = 'image/png') => {
    // Simply return as Data URI
    return `data:${contentType};base64,${base64}`;
  };

  // Cron expression computed from selected schedule params (m h dom mon dow)
  const cronExpression = useMemo(() => {
    const m = Number(scheduleMinute);
    const h = Number(scheduleHour);
    if (scheduleFrequency === 'weekly') {
      const dow = Number(weeklyDayOfWeek); // 0=Sun ... 6=Sat
      return `${m} ${h} * * ${dow}`;
    }
    if (scheduleFrequency === 'monthly') {
      const dom = Number(monthlyDayOfMonth);
      return `${m} ${h} ${dom} * *`;
    }
    // daily
    return `${m} ${h} * * *`;
  }, [scheduleMinute, scheduleHour, scheduleFrequency, weeklyDayOfWeek, monthlyDayOfMonth]);

  // Derived: filtered exchanges based on search text
  const filteredExchanges = React.useMemo(() => {
    const keys = Object.keys(popularSymbolsByExchange || {});
    if (!exchangeSearch) return keys;
    const q = exchangeSearch.toLowerCase();
    return keys.filter((ex) => ex.toLowerCase().includes(q));
  }, [exchangeSearch]);

  // Derived: filtered symbols for currently selected exchange
  const filteredPopularSymbols = React.useMemo(() => {
    const list: string[] = popularExchange
      ? (popularSymbolsByExchange[popularExchange as keyof typeof popularSymbolsByExchange] || [])
      : [];
    if (!symbolSearchLocal) return list;
    const q = symbolSearchLocal.toLowerCase();
    return list.filter((sym) => sym.toLowerCase().includes(q));
  }, [popularExchange, symbolSearchLocal]);

  const filteredSymbols = symbols.filter(symbol =>
    symbol.symbol.toLowerCase().includes(symbolSearch.toLowerCase()) ||
    (symbol.description && symbol.description.toLowerCase().includes(symbolSearch.toLowerCase()))
  );

  // Human-readable cron formatting (basic m h dom mon dow)
  const cronToHuman = (expr?: string, fallback?: string) => {
    if (!expr) return fallback || '';
    const parts = expr.trim().split(/\s+/);
    if (parts.length < 5) return expr;
    const [m, h, dom, mon, dow] = parts;
    const pad = (n: number) => String(n).padStart(2, '0');
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const time = (h !== '*' && m !== '*') ? `${pad(Number(h))}:${pad(Number(m))}`
                : (h !== '*' && m === '*') ? `${pad(Number(h))}:00` : '';
    
    const partsDesc: string[] = [];
    if (time) partsDesc.push(`At ${time}`);
    if (dom !== '*' && mon === '*' && dow === '*') partsDesc.push(`on day ${dom} of every month`);
    if (mon !== '*') {
      const monNum = Number(mon);
      if (!Number.isNaN(monNum) && monNum >= 1 && monNum <= 12) partsDesc.push(`in ${monthNames[monNum-1]}`);
      else partsDesc.push(`month ${mon}`);
    }
    if (dow !== '*') {
      const dn = Number(dow);
      if (!Number.isNaN(dn) && dn >= 0 && dn <= 6) partsDesc.push(`on ${dayNames[dn]}`);
      else partsDesc.push(`on DOW ${dow}`);
    }
    if (partsDesc.length === 0) return time ? `${time} every day` : expr;
    return partsDesc.join(', ');
  };

  // Toggle a single interval in the multi-select dropdown
  const toggleInterval = (iv: string) => {
    setSelectedIntervals(prev => {
      const exists = prev.includes(iv);
      if (exists) {
        const updated = prev.filter(x => x !== iv);
        // Keep primary interval in sync
        return updated.length ? (setFormData(p => ({ ...p, interval: updated[0] })), updated) : (setFormData(p => ({ ...p, interval: '' })), updated);
      }
      if (prev.length >= 3) {
        setError(t('Validation_MaxThreeIntervals'));
        return prev;
      }
      const updated = [...prev, iv];
      setFormData(p => ({ ...p, interval: updated[0] }));
      return updated;
    });
  };


  return (
    <div className="container mx-auto p-6">
      {/* Header Section */}
      <div className="bg-[#0b0b0e] rounded-lg border border-[#3a2a15] p-6 mb-6">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
          {t('ScheduleAnalysis_Title')}
        </h1>
      </div>

      {/* Main Content - 60/40 Split */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Section - 60% */}
        <div className="w-full md:w-3/5 bg-[#0b0b0e] p-6 rounded-lg border border-[#3a2a15]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CandlestickChart className="w-5 h-5 text-blue-400 mr-2" />
              <h2 className="text-xl font-semibold text-white">{t('ScheduleAnalysis_Title')}</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs text-gray-300 mb-1" htmlFor="popularExchange">{t('Exchange')}</label>
                {/* Searchable Select (Combobox-like) */}
                <div
                  className="relative"
                  tabIndex={0}
                  // onBlur={() => setTimeout(() => setIsExchangeOpen(false), 100)}
                >
                  <button
                    type="button"
                    className="w-full bg-[#15120c] text-white text-sm rounded px-3 py-2 border border-[#3a2a15] focus:border-blue-400 outline-none text-left flex items-center justify-between"
                    onClick={() => setIsExchangeOpen(!isExchangeOpen)}
                    aria-haspopup="listbox"
                    aria-expanded={isExchangeOpen}
                  >
                    <span>{popularExchange || t('SelectExchange')}</span>
                    <svg className={`w-4 h-4 transition-transform ${isExchangeOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {isExchangeOpen && (
                    <div className="absolute z-20 mt-1 w-full bg-[#1f1f27] border border-[#3a2a15] rounded shadow-lg">
                      <div className="p-2 border-b border-[#3a2a15]">
                        <input
                          autoFocus
                          type="text"
                          placeholder={t('SearchExchangesPlaceholder')}
                          value={exchangeSearch}
                          onChange={(e) => setExchangeSearch(e.target.value)}
                          className="w-full bg-[#15120c] text-white text-sm rounded px-3 py-2 border border-[#3a2a15] focus:border-blue-400 outline-none"
                        />
                      </div>
                      <ul role="listbox" className="max-h-48 overflow-auto py-1">
                        {filteredExchanges.length === 0 && (
                          <li className="px-3 py-2 text-gray-400 text-sm">{t('NoMatches')}</li>
                        )}
                        {filteredExchanges.map((ex) => (
                          <li key={ex}>
                            <button
                              type="button"
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-[#2d2d39] ${popularExchange === ex ? 'text-blue-400' : 'text-white'}`}
                              onClick={() => {
                                setPopularExchange(ex);
                                setPopularSymbol('');
                                setFormData(prev => ({ ...prev, symbol: '' }));
                                setIsExchangeOpen(false);
                              }}
                              role="option"
                              aria-selected={popularExchange === ex}
                            >
                              {ex}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-gray-300 mb-1" htmlFor="popularSymbol">{t('Symbol')}</label>
                {/* Searchable Select (Combobox-like) for Symbol */}
                <div
                  className="relative"
                  tabIndex={0}
                  // onBlur={() => setTimeout(() => setIsSymbolOpen(false), 100)}
                >
                  <button
                    type="button"
                    className={`w-full bg-[#15120c] text-white text-sm rounded px-3 py-2 border border-[#3a2a15] focus:border-blue-400 outline-none text-left flex items-center justify-between ${!popularExchange ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => {
                      if (!popularExchange) return;
                      setIsSymbolOpen(!isSymbolOpen)
                    }}
                    aria-haspopup="listbox"
                    aria-expanded={isSymbolOpen}
                    disabled={!popularExchange}
                  >
                    <span>
                      {popularExchange
                        ? (popularSymbol ? `${popularExchange}:${popularSymbol}` : t('SelectSymbol'))
                        : t('SelectExchangeFirst')}
                    </span>
                    <svg className={`w-4 h-4 transition-transform ${isSymbolOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {isSymbolOpen && popularExchange && (
                    <div className="absolute z-20 mt-1 w-full bg-[#1f1f27] border border-[#3a2a15] rounded shadow-lg">
                      <div className="p-2 border-b border-[#3a2a15]">
                        <input
                          autoFocus
                          type="text"
                          placeholder={t('SearchSymbolsPlaceholder')}
                          value={symbolSearchLocal}
                          onChange={(e) => setSymbolSearchLocal(e.target.value)}
                          className="w-full bg-[#15120c] text-white text-sm rounded px-3 py-2 border border-[#3a2a15] focus:border-blue-400 outline-none"
                        />
                      </div>
                      <ul role="listbox" className="max-h-48 overflow-auto py-1">
                        {filteredPopularSymbols.length === 0 && (
                          <li className="px-3 py-2 text-gray-400 text-sm">{t('NoMatches')}</li>
                        )}
                        {filteredPopularSymbols.map((sym) => (
                          <li key={`${popularExchange}:${sym}`}>
                            <button
                              type="button"
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-[#2d2d39] ${popularSymbol === sym ? 'text-blue-400' : 'text-white'}`}
                              onClick={() => {
                                setPopularSymbol(sym);
                                setFormData(prev => ({ ...prev, symbol: `${popularExchange}:${sym}` }));
                                setIsSymbolOpen(false);
                              }}
                              role="option"
                              aria-selected={popularSymbol === sym}
                            >
                              {`${popularExchange}:${sym}`}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-gray-300 mb-1" htmlFor="interval">{t('Interval')}</label>
                {/* Multi-select dropdown for intervals */}
                <div
                  className="relative"
                  tabIndex={0}
                  // onBlur={() => setTimeout(() => setIsIntervalOpen(false), 100)}
                >
                  <button
                    type="button"
                    id="interval"
                    name="interval"
                    className="w-full bg-[#15120c] text-white text-sm rounded px-3 py-2 border border-[#3a2a15] focus:border-blue-400 outline-none text-left flex items-center justify-between"
                    onClick={() => setIsIntervalOpen(!isIntervalOpen)}
                    aria-haspopup="listbox"
                    aria-expanded={isIntervalOpen}
                  >
                    <span>
                      {selectedIntervals.length > 0 ? selectedIntervals.join(', ') : t('SelectIntervalsMax3')}
                    </span>
                    <svg className={`w-4 h-4 transition-transform ${isIntervalOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {isIntervalOpen && (
                    <div className="absolute z-20 mt-1 w-full bg-[#1f1f27] border border-[#3a2a15] rounded shadow-lg" onBlur={() => setTimeout(() => setIsIntervalOpen(false), 100)}>
                      <ul role="listbox" aria-multiselectable className="max-h-48 overflow-auto py-1">
                        {chartIntervals.map((i) => {
                          const active = selectedIntervals.includes(i);
                          return (
                            <li key={i}>
                              <button
                                type="button"
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-[#2d2d39] flex items-center justify-between ${active ? 'text-blue-400' : 'text-white'}`}
                                onClick={() => toggleInterval(i)}
                                role="option"
                                aria-selected={active}
                              >
                                <span>{i}</span>
                                {active && (
                                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.414l-7.07 7.071a1 1 0 01-1.415 0L3.296 9.85a1 1 0 111.415-1.414l3.094 3.093 6.363-6.363a1 1 0 011.536.124z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-gray-300 mb-1" htmlFor="style">{t("Style")}</label>
                <select 
                  id="style" 
                  name="style" 
                  className="bg-[#15120c] text-white text-sm rounded px-3 py-2 border border-[#3a2a15] focus:border-blue-400 outline-none" 
                  value={formData.style} 
                  onChange={handleInputChange}
                >
                  {chartStyles.map((s) => (
                    <option key={s.value} value={s.value}>{s.text}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-gray-300 mb-1" htmlFor="theme">{t("Theme")}</label>
                <select 
                  id="theme" 
                  name="theme" 
                  className="bg-[#15120c] text-white text-sm rounded px-3 py-2 border border-[#3a2a15] focus:border-blue-400 outline-none" 
                  value={formData.theme} 
                  onChange={handleInputChange}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-gray-300 mb-1" htmlFor="width">{t("Width")}</label>
                <input 
                  id="width" 
                  name="width" 
                  type="number" 
                  min={100} 
                  className="bg-[#15120c] text-white text-sm rounded px-3 py-2 border border-[#3a2a15] focus:border-blue-400 outline-none" 
                  value={formData.width} 
                  onChange={handleInputChange} 
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-gray-300 mb-1" htmlFor="height">{t("Height")}</label>
                <input 
                  id="height" 
                  name="height" 
                  type="number" 
                  min={100} 
                  className="bg-[#15120c] text-white text-sm rounded px-3 py-2 border border-[#3a2a15] focus:border-blue-400 outline-none" 
                  value={formData.height} 
                  onChange={handleInputChange} 
                />
              </div>

              {/* Schedule time */}
              <div className="flex flex-col md:col-span-2">
                <hr className="border-[#3a2a15] my-4"/>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label htmlFor="scheduleMinute" className="text-xs text-gray-300 mb-1">{t('Minute')}</label>
                    <select
                      id="scheduleMinute"
                      aria-label="Minute"
                      className="bg-[#15120c] text-white text-sm rounded px-3 py-2 border border-[#3a2a15] focus:border-blue-400 outline-none"
                      value={scheduleMinute}
                      onChange={(e) => setScheduleMinute(e.target.value)}
                    >
                      {Array.from({ length: 60 }, (_, m) => m).map(m => (
                        <option key={m} value={String(m).padStart(2, '0')}>
                          {String(m).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="scheduleHour" className="text-xs text-gray-300 mb-1">{t('Hour')}</label>
                    <select
                      id="scheduleHour"
                      aria-label="Hour"
                      className="bg-[#15120c] text-white text-sm rounded px-3 py-2 border border-[#3a2a15] focus:border-blue-400 outline-none"
                      value={scheduleHour}
                      onChange={(e) => setScheduleHour(e.target.value)}
                    >
                      {Array.from({ length: 24 }, (_, h) => h).map(h => (
                        <option key={h} value={String(h).padStart(2, '0')}>
                          {String(h).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="scheduleFrequency" className="text-xs text-gray-300 mb-1">{t('Frequency')}</label>
                    <select
                      id="scheduleFrequency"
                      aria-label="Frequency"
                      className="bg-[#15120c] text-white text-sm rounded px-3 py-2 border border-[#3a2a15] focus:border-blue-400 outline-none"
                      value={scheduleFrequency}
                      onChange={(e) => setScheduleFrequency(e.target.value as any)}
                    >
                      <option value="daily">{t('Daily')}</option>
                      <option value="weekly">{t('Weekly')}</option>
                      <option value="monthly">{t('Monthly')}</option>
                    </select>
                  </div>
                  {scheduleFrequency === 'weekly' && (
                    <div className="flex flex-col">
                      <label htmlFor="scheduleWeeklyDOW" className="text-xs text-gray-300 mb-1">{t('DayOfWeek')}</label>
                      <select
                        id="scheduleWeeklyDOW"
                        aria-label="Day of week"
                        className="bg-[#15120c] text-white text-sm rounded px-3 py-2 border border-[#3a2a15] focus:border-blue-400 outline-none"
                        value={weeklyDayOfWeek}
                        onChange={(e) => setWeeklyDayOfWeek(e.target.value)}
                      >
                        <option value="1">{t('Monday')}</option>
                        <option value="2">{t('Tuesday')}</option>
                        <option value="3">{t('Wednesday')}</option>
                        <option value="4">{t('Thursday')}</option>
                        <option value="5">{t('Friday')}</option>
                        <option value="6">{t('Saturday')}</option>
                        <option value="0">{t('Sunday')}</option>
                      </select>
                    </div>
                  )}
                  {scheduleFrequency === 'monthly' && (
                    <div className="flex flex-col">
                      <label htmlFor="scheduleMonthlyDOM" className="text-xs text-gray-300 mb-1">{t('DayOfMonth')}</label>
                      <select
                        id="scheduleMonthlyDOM"
                        aria-label="Day of month"
                        className="bg-[#15120c] text-white text-sm rounded px-3 py-2 border border-[#3a2a15] focus:border-blue-400 outline-none"
                        value={monthlyDayOfMonth}
                        onChange={(e) => setMonthlyDayOfMonth(e.target.value)}
                      >
                        {Array.from({ length: 31 }, (_, d) => d + 1).map(d => (
                          <option key={d} value={String(d)}>{d}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <span className="text-[11px] text-gray-400 mt-1">{t('Schedule_TimeHint')}</span>
              </div>

              {/* Multi-interval selection helper */}
              <div className="md:col-span-2">
                {/* <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-300">{t('IntervalsSelected')}:</span>
                  <button
                    type="button"
                    onClick={addCurrentInterval}
                    disabled={!canAddMoreIntervals}
                    className="bg-[#0b0b0e] hover:bg-blue-600 disabled:opacity-50 text-white text-xs py-1 px-2 rounded border border-[#3a2a15]"
                  >
                    {t('AddCurrentInterval')}
                  </button>
                </div> */}
                <div className="flex flex-wrap gap-2">
                  {selectedIntervals.map(iv => (
                    <span
                      key={iv}
                      className="inline-flex items-center gap-1 bg-[#15120c] text-white text-xs px-2 py-1 rounded border border-[#3a2a15]"
                    >
                      {iv}
                      <button
                        type="button"
                        className="text-gray-400 hover:text-white"
                        onClick={() => removeInterval(iv)}
                        aria-label={`Remove ${iv}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Technical Indicators Section */}
              <div className="col-span-2 border-t border-[#3a2a15] pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-emerald-400"/>
                    {t('TechnicalIndicators')} ({selectedStudies.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowStudiesPanel(!showStudiesPanel)}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    {showStudiesPanel ? t('Hide') : t('AddIndicators')}
                  </button>
                </div>

                {/* Selected Studies with numeric input controls */}
                {selectedStudies.length > 0 && (
                  <div className="mb-3 space-y-3">
                    {selectedStudies.map((study: any) => {
                      const inputObj: Record<string, any> = study?.input || (technicalIndicators as any)[study?.name]?.input || {};
                      const inputNameMap: Record<string, string> = ((technicalIndicators as any)[study?.name]?.inputName) || {};
                      const rangesMap: Record<string, { min?: number; max?: number; step?: number }> = ((technicalIndicators as any)[study?.name]?.ranges) || {};
                      const entries = Object.entries(inputObj);
                      const numericEntries = entries.filter(([, v]) => typeof v === 'number');
                      const inTextEntries = entries.filter(([k, v]) => /^in_\d+$/.test(k) && typeof v === 'string');
                      const smoothingEntries = entries.filter(([k, v]) => k.toLowerCase().includes('smoothingline'));
                      return (
                        <div key={study.id} className="bg-[#15120c] border border-[#3a2a15] rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white text-sm font-medium">{study.name}</span>
                            <button
                              type="button"
                              onClick={() => removeStudy(study.id)}
                              className="ml-2 text-red-400 hover:text-red-300"
                              aria-label={`Remove ${study.name}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          {(numericEntries.length > 0 || inTextEntries.length > 0 || smoothingEntries.length > 0) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {/* Numeric sliders */}
                              {numericEntries.map(([k, v]) => {
                                const r = rangesMap[k] || {};
                                const min = typeof r.min === 'number' ? r.min : 0;
                                const max = typeof r.max === 'number' ? r.max : 100;
                                const step = typeof r.step === 'number' ? r.step : 0.05;
                                return (
                                  <div key={k} className="flex flex-col">
                                    <label className="text-xs text-gray-300 mb-1" htmlFor={`study-${study.id}-${k}`}>
                                      {(inputNameMap[k] || k)}: <span className="text-white">{study.input?.[k] ?? v}</span>
                                    </label>
                                    <input
                                      id={`study-${study.id}-${k}`}
                                      type="number"
                                      min={min}
                                      max={max}
                                      step={step}
                                      value={Number(study.input?.[k] ?? v)}
                                      onChange={(e) => updateStudyInput(study.id, k, Number(e.target.value))}
                                      className="w-full border border-[#3a2a15] rounded px-3 py-2 bg-[#15120c] text-white"
                                    />
                                  </div>
                                );
                              })}
  
                              {/* in_X string options (e.g., source) */}
                              {inTextEntries.map(([k, v]) => (
                                <div key={k} className="flex flex-col">
                                  <label className="text-xs text-gray-300 mb-1" htmlFor={`study-${study.id}-${k}`}>
                                    {inputNameMap[k] || k}
                                  </label>
                                  <select
                                    id={`study-${study.id}-${k}`}
                                    className="bg-[#15120c] text-white text-sm rounded px-3 py-2 border border-[#3a2a15] focus:border-blue-400 outline-none"
                                    value={String(study.input?.[k] ?? v)}
                                    onChange={(e) => updateStudyInput(study.id, k, e.target.value)}
                                  >
                                    {inputOptions.map((opt: any) => (
                                      <option key={opt.value} value={opt.value}>{opt.name}</option>
                                    ))}
                                  </select>
                                </div>
                              ))}
  
                              {/* smoothingLine options */}
                              {smoothingEntries.map(([k, v]) => (
                                <div key={k} className="flex flex-col">
                                  <label className="text-xs text-gray-300 mb-1" htmlFor={`study-${study.id}-${k}`}>
                                    {inputNameMap[k] || k}
                                  </label>
                                  <select
                                    id={`study-${study.id}-${k}`}
                                    className="bg-[#15120c] text-white text-sm rounded px-3 py-2 border border-[#3a2a15] focus:border-blue-400 outline-none"
                                    value={String(study.input?.[k] ?? v)}
                                    onChange={(e) => updateStudyInput(study.id, k, e.target.value)}
                                  >
                                    {smoothingLengthOptions.map((opt) => (
                                      <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                  </select>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Studies Panel */}
                {showStudiesPanel && (
                  <div className="bg-[#15120c] border border-[#3a2a15] rounded-lg p-3 mb-3">
                    {/* Indicator search */}
                    <div className="mb-3">
                      <input
                        type="text"
                        placeholder={t('FilterIndicatorsPlaceholder')}
                        value={studySearch}
                        onChange={(e) => setStudySearch(e.target.value)}
                        className="w-full bg-[#1f1f27] text-white text-sm rounded px-3 py-2 border border-[#3a2a15] focus:border-blue-400 outline-none"
                      />
                    </div>
                    <h4 className="text-white text-sm font-medium mb-2">{t('PopularIndicators')}:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                      {filteredStudyKeys.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => addStudy(preset)}
                          className="bg-[#0b0b0e] hover:bg-blue-600 text-white text-xs py-1 px-2 rounded border border-[#3a2a15]"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                    
                    <h4 className="text-white text-sm font-medium mb-2">{t('AllIndicators')}:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                      {filteredIndicatorKeys.map((indicator) => (
                        <button
                          key={indicator}
                          type="button"
                          onClick={() => addStudy(indicator)}
                          className="bg-[#0b0b0e] hover:bg-blue-600 text-white text-xs py-1 px-2 rounded border border-[#3a2a15] text-left"
                        >
                          {indicator}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-900/20 border border-red-900/50 rounded p-3">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-emerald-400 text-sm bg-emerald-900/20 border border-emerald-900/50 rounded p-3">
                  {success}
                </div>
              )}

            </div>
            <div className="flex justify-end">
              {shouldUpdate ? (
                <button 
                  type="submit" 
                  // onClick={() => setShouldUpdate(false)}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('Update')}
                </button>
              ) : (
              <button 
                type="submit" 
                disabled={
                  isLoading ||
                  selectedIntervals.length === 0 ||
                  !scheduleHour ||
                  !scheduleMinute ||
                  (scheduleFrequency === 'weekly' && !weeklyDayOfWeek) ||
                  (scheduleFrequency === 'monthly' && !monthlyDayOfMonth)
                } 
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isLoading ? t('Scheduling') : t('ScheduleChart')}
              </button>
              )}
            </div>
          </form>

            {/* Scheduling Note */}
            <div className="mt-6">
              <h3 className="text-white font-medium mb-2 flex items-center">
                <ImageIcon className="w-4 h-4 mr-2 text-emerald-400"/>
                {t('Scheduling')}
              </h3>
              <div className="flex flex-col bg-[#15120c] border border-[#3a2a15] rounded-lg p-4">
                <span className="text-gray-400 text-sm">{t('Schedule_Note')}</span>
              </div>
            </div>
          
          </div>
          {/* Right Section - 40% */}
          <div className="w-full md:w-2/5 space-y-6">
            {/* History Panel (same width as guide) */}
            {schedules && schedules.length > 0 && (
              <div className="bg-[#0b0b0e] rounded-lg border border-[#3a2a15] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">{t('History')}</h2>
                  <span className="text-xs text-gray-400">{schedules.length} {t('Total')}</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {([...schedules]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
                    .slice(0, 10)
                    .map((s) => (
                    <div
                      key={s.id}
                      className="text-left bg-[#15120c] border border-[#3a2a15] rounded p-3 transition-colors hover:bg-[#2d2d39]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 cursor-pointer" onClick={() => navigate(`/schedule-analysis/${s.id}`)}>
                          <div className="text-white text-sm font-medium truncate">{s.command || `Task #${s.id}`}</div>
                          <div className="text-xs text-gray-300 mt-0.5">
                            {s.cron_expression
                              ? cronToHuman(s.cron_expression, s.cron_expression)
                              : (s.execute_at ? `Exec at: ${new Date(s.execute_at).toLocaleString()}` : '')}
                          </div>
                          <div className="text-[11px] text-gray-500 mt-0.5">{t('Created')}: {new Date(s.created_at).toLocaleString()}</div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`text-[11px] px-2 py-0.5 rounded-full border ${s.executed ? 'text-emerald-300 border-emerald-700/60' : (s.is_recurring ? 'text-blue-300 border-blue-700/60' : 'text-yellow-300 border-yellow-700/60')}`}>
                            {s.executed ? t('Executed') : (s.is_recurring ? t('Recurring') : t('Scheduled'))}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="text-xs px-2 py-1 rounded border border-[#3a2a15] text-blue-300 hover:bg-[#1f273a]"
                              onClick={() => navigate(`/schedule-analysis/${s.id}`)}
                            >
                              {t('Edit')}
                            </button>
                            <button
                              type="button"
                              className="text-xs px-2 py-1 rounded border border-[#3a2a15] text-red-300 hover:bg-[#3a1f1f]"
                              onClick={() => { setScheduleToDelete(s); setShowDeleteModal(true); }}
                            >
                              {t('Delete')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Guide Panel */}
            <div className="bg-[#0b0b0e] rounded-lg border border-[#3a2a15] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">{t('Guide')}</h2>
              </div>
              <div className="h-[600px] bg-[#15120c] rounded-lg p-4 overflow-auto">
                <div className="text-white space-y-4">
                  <div>
                    <h3 className="text-base font-medium mb-2 text-blue-400">{t('SymbolSelection')}:</h3>
                    <ul className="list-disc pl-5 space-y-1 text-gray-300 text-sm">
                      <li>{t('SymbolSelection_ChooseFromList')}</li>
                      <li>{t('SymbolSelection_FilterByType')}</li>
                      <li>{t('SymbolSelection_SearchThroughSymbols')}</li>
                      <li>{t('SymbolSelection_SelectSymbol')}</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-base font-medium mb-2 text-emerald-400">{t('TechnicalAnalysis')}:</h3>
                    <ul className="list-disc pl-5 space-y-1 text-gray-300 text-sm">
                      <li>{t('TechnicalAnalysis_AddPopularIndicators')}</li>
                      <li>{t('TechnicalAnalysis_ChooseFromIndicators')}</li>
                      <li>{t('TechnicalAnalysis_AddChartDrawings')}</li>
                      <li>{t('TechnicalAnalysis_CombineIndicators')}</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-base font-medium mb-2 text-orange-400">{t('ChartSettings')}:</h3>
                    <ul className="list-disc pl-5 space-y-1 text-gray-300 text-sm">
                      <li>{t('ChartSettings_TryDifferentRanges')}</li>
                      <li>{t('ChartSettings_Styles')}</li>
                      <li>{t('ChartSettings_IncreaseWidthHeight')}</li>
                      <li>{t('ChartSettings_SwitchBetweenThemes')}</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-blue-400 font-medium mb-2 text-base">{t('PopularExamples')}:</h4>
                    <div className="space-y-3">
                      <div className="bg-[#0b0b0e] p-3 rounded border border-[#3a2a15]">
                        <div className="text-yellow-400 text-sm font-medium mb-1">{t('BitcoinAnalysis')}:</div>
                        <pre className="text-xs text-gray-300">{`Symbol: BINANCE:BTCUSDT
                          Interval: 4h
                          Range: 1M
                          Indicators: Volume, MACD, RSI`}</pre>
                      </div>

                      <div className="bg-[#0b0b0e] p-3 rounded border border-[#3a2a15]">
                        <div className="text-yellow-400 text-sm font-medium mb-1">{t('StockTrading')}:</div>
                        <pre className="text-xs text-gray-300">{`Symbol: NASDAQ:AAPL
                          Interval: 1D
                          Range: 6M
                          Indicators: Bollinger Bands, MA 50`}</pre>
                      </div>

                      <div className="bg-[#0b0b0e] p-3 rounded border border-[#3a2a15]">
                        <div className="text-yellow-400 text-sm font-medium mb-1">{t('ForexAnalysis')}:</div>
                        <pre className="text-xs text-gray-300">{`Symbol: FX:EURUSD
                          Interval: 1h
                          Range: 1W
                          Indicators: MACD, Support Lines`}</pre>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-red-400 font-medium mb-2 text-base">{t('Tips')}:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-gray-300 text-sm">
                      <li>{t('Tips_CorrectSymbolFormat')}</li>
                      <li>{t('Tips_HigherResolutionImages')}</li>
                      <li>{t('Tips_DataAvailability')}</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-purple-400 font-medium mb-2 text-base">{t('SupportedMarkets')}:</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-blue-400 font-medium">{t('Crypto')}:</div>
                        <div className="text-gray-400">{t('Crypto_SupportedExchanges')}</div>
                      </div>
                      <div>
                        <div className="text-green-400 font-medium">{t('Stocks')}:</div>
                        <div className="text-gray-400">{t('Stocks_SupportedExchanges')}</div>
                      </div>
                      <div>
                        <div className="text-yellow-400 font-medium">{t('Forex')}:</div>
                        <div className="text-gray-400">{t('Forex_SupportedExchanges')}</div>
                      </div>
                      <div>
                        <div className="text-orange-400 font-medium">{t('Futures')}:</div>
                        <div className="text-gray-400">{t('Futures_SupportedExchanges')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/* Delete Confirm Modal */}
      {showDeleteModal && scheduleToDelete && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="bg-[#0b0b0e] border border-[#3a2a15] rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-white text-lg font-semibold mb-2">{t('DeleteSchedule')}</h3>
            <p className="text-gray-300 text-sm">{t('DeleteSchedule_Confirm')}</p>
            <p className="text-gray-400 text-xs mt-1 break-all">{scheduleToDelete.command || `Task #${scheduleToDelete.id}`}</p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="px-3 py-1.5 text-sm rounded border border-[#3a2a15] text-gray-300 hover:bg-[#2a2a34]"
                onClick={() => { if (!deleting) { setShowDeleteModal(false); setScheduleToDelete(null); } }}
                disabled={deleting}
              >
                {t('Cancel')}
              </button>
              <button
                type="button"
                className="px-3 py-1.5 text-sm rounded bg-red-600 hover:bg-red-700 text-white disabled:opacity-60"
                onClick={async () => {
                  if (!scheduleToDelete) return;
                  try {
                    setDeleting(true);
                    const resp = await deleteRequest<{ success: boolean; message: string }>(`/schedule-task/${scheduleToDelete.id}?user_id=`+user.id);
                    setSuccess(resp?.message || t('Deleted'));
                    // Remove from local list on success
                    if (resp?.success) {
                      setSchedules(prev => prev.filter((x) => x.id !== scheduleToDelete.id));
                    }
                  } catch (err: any) {
                    setError(err?.message || t('FailedToDeleteSchedule'));
                  } finally {
                    setDeleting(false);
                    setShowDeleteModal(false);
                    setScheduleToDelete(null);
                    setTimeout(() => {
                      // redirect to schedule analysis
                      navigate('/schedule-analysis');
                    }, 3000);
                  }
                }}
                disabled={deleting}
              >
                {deleting ? t('Deleting') : t('Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleAnalysis;