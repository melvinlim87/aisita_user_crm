// =====================================================
// FILE: src/components/ChartOnDemand.tsx  
// Enhanced Chart Generator Component
// =====================================================

import React, { useEffect, useMemo, useState } from 'react';
import { 
  chartStyles, 
  chartIntervals, 
  chartRanges, 
  generateChartV2,
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
import { CandlestickChart, Image as ImageIcon, Send, Search, Plus, X, TrendingUp, Settings } from 'lucide-react';
import './style.css';
import { postRequest } from '@/services/apiRequest';
import { useNavigate } from 'react-router-dom';
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

const ChartOnDemand: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[] | null>([]);
  const [error, setError] = useState<string | null>(null);
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
  const [isIntervalOpen, setIsIntervalOpen] = useState(false);

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

  // Initialize multi-select with the default single interval
  useEffect(() => {
    if (formData.interval && selectedIntervals.length === 0) {
      setSelectedIntervals([String(formData.interval)]);
    }
    // We intentionally run this once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter available options to exclude those already selected
  const availableStudyKeys = useMemo(() => {
    const chosen = new Set(
      selectedStudies
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
      // await loadExchanges();
      // await loadSymbolsMultiExchange();
      // Get chart on demand images from localStorage
      const images = localStorage.getItem('chartOnDemandImages');
      if (images) {
        const parsedImages = JSON.parse(images);
        const urls = await Promise.all(parsedImages.map(async (i: any) => await imageToUrl(i.data)));
        setImageUrls(urls);
        setIsLoading(false)
      }
    })();
  }, []);

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
      setError(t('Validation_MaxStudies'));
      return;
    }
    const already = selectedStudies.some(
      (s: any) => (s?.name ?? s?.studyName ?? s?.key) === studyName
    );
    if (already) return;
    const preset = studyPresets[studyName as keyof typeof studyPresets];
    if (preset) {
      // Ensure each study has an id and input defaults
      const inputDefaults = (preset as any).input || (technicalIndicators as any)[studyName]?.input || {};
      const withDefaults = {
        ...preset,
        id: (preset as any).id ?? Date.now(),
        input: JSON.parse(JSON.stringify(inputDefaults)),
      };
      setSelectedStudies(prev => ([...prev, withDefaults]));
    } else {
      const indicator = technicalIndicators[studyName as keyof typeof technicalIndicators];
      if (indicator) {
        setSelectedStudies(prev => ([...prev, {
          id: Date.now(),
          name: studyName,
          input: JSON.parse(JSON.stringify((indicator as any).input || {})),
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
      const nextInput = { ...(s.input || {}) };
      nextInput[key] = value;
      return { ...s, input: nextInput };
    }));
  };

  const addDrawing = (drawingName: string) => {
    // Enforce max 3 drawings and prevent duplicates
    if (selectedDrawings.length >= 3) {
      setError(t('Validation_MaxDrawings'));
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
    setIsLoading(true);
    setError(null);
    setImageUrls(null);
    
    try {
      if (!formData.symbol) {
        throw new Error(t('Validation_PleaseSelectSymbol'));
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

      const response = await postRequest<{ success: boolean; data: any; message: string }>(
        '/generate-chart', chartParams,
      );
      let images: any[] = []
      if (response?.success && response?.data) {
        const chartData = response.data;
        localStorage.setItem('chartOnDemandImages', JSON.stringify(chartData));
        chartData.map(async (c: any) => {
          // Check if we have base64 image data
          if (c.type === 'image' && c.data) {
            try {
              const base64Data = c.data;
              const contentType = c.content_type || 'image/png';
              const imageUrl = await imageToUrl(base64Data);
              
              images.push(imageUrl)
              setImageUrls(images);
            } catch (error) {
              console.error('Error converting base64 to blob:', error);
              setError(t('ChartOnDemand_Error_ProcessImage'));
            }
          } else {
            setError(t('ChartOnDemand_Error_NoImageInResponse'));
          }

        })

      } else {
        setError(response?.message || t('ChartOnDemand_Error_GenerationFailed'));
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

  // const imageToUrl = async (base64: string) => {
  //   const byteCharacters = atob(base64);
  //   const byteNumbers = new Array(byteCharacters.length);
    
  //   for (let i = 0; i < byteCharacters.length; i++) {
  //     byteNumbers[i] = byteCharacters.charCodeAt(i);
  //   }
    
  //   const byteArray = new Uint8Array(byteNumbers);
  //   const blob = new Blob([byteArray], { type: 'image/png' });
  //   const imageUrl = URL.createObjectURL(blob);
  //   return imageUrl;
  // }

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

  // Router navigate
  const navigate = useNavigate();

  const handleUseInChartAnalysis = () => {
    if (!imageUrls || imageUrls.length === 0) return;
    try {
      // set boolean to true to notify ChartAnalysis page that data is from chart on demand
      localStorage.setItem('previewFromChartOnDemand', 'true');
      localStorage.setItem('chartAnalysisPreview', JSON.stringify(imageUrls));
      // Notify listeners (ChartAnalysis page listens for this)
      window.dispatchEvent(new Event('chartPreviewUpdate'));
      navigate('/chart-analysis');
    } catch (e) {
      setError(t('ChartOnDemand_Error_CopyToAnalysis'));
    }
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
        setError(t('Validation_MaxIntervals'));
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
      <div className="bg-[#1a1a20] rounded-lg border border-[#3a3a45] p-6 mb-6">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
          {t('ChartOnDemand_Title')}
        </h1>
        {/* <p className="text-gray-400">Generate beautiful TradingView charts via Chart-IMG API with advanced symbol selection</p> */}
      </div>

      {/* Main Content - 60/40 Split */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Section - 60% */}
        <div className="w-full md:w-3/5 bg-[#1a1a20] p-6 rounded-lg border border-[#3a3a45]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CandlestickChart className="w-5 h-5 text-blue-400 mr-2" />
              <h2 className="text-xl font-semibold text-white">{t('ChartOnDemand_ChartGenerator')}</h2>
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
                    className="w-full bg-[#25252d] text-white text-sm rounded px-3 py-2 border border-[#3a3a45] focus:border-blue-400 outline-none text-left flex items-center justify-between"
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
                    <div className="absolute z-20 mt-1 w-full bg-[#1f1f27] border border-[#3a3a45] rounded shadow-lg">
                      <div className="p-2 border-b border-[#3a3a45]">
                        <input
                          autoFocus
                          type="text"
                          placeholder={t('SearchExchangesPlaceholder')}
                          value={exchangeSearch}
                          onChange={(e) => setExchangeSearch(e.target.value)}
                          className="w-full bg-[#25252d] text-white text-sm rounded px-3 py-2 border border-[#3a3a45] focus:border-blue-400 outline-none"
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
                    className={`w-full bg-[#25252d] text-white text-sm rounded px-3 py-2 border border-[#3a3a45] focus:border-blue-400 outline-none text-left flex items-center justify-between ${!popularExchange ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                    <div className="absolute z-20 mt-1 w-full bg-[#1f1f27] border border-[#3a3a45] rounded shadow-lg">
                      <div className="p-2 border-b border-[#3a3a45]">
                        <input
                          autoFocus
                          type="text"
                          placeholder={t('SearchSymbolsPlaceholder')}
                          value={symbolSearchLocal}
                          onChange={(e) => setSymbolSearchLocal(e.target.value)}
                          className="w-full bg-[#25252d] text-white text-sm rounded px-3 py-2 border border-[#3a3a45] focus:border-blue-400 outline-none"
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
                    className="w-full bg-[#25252d] text-white text-sm rounded px-3 py-2 border border-[#3a3a45] focus:border-blue-400 outline-none text-left flex items-center justify-between"
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
                    <div className="absolute z-20 mt-1 w-full bg-[#1f1f27] border border-[#3a3a45] rounded shadow-lg" onBlur={() => setTimeout(() => setIsIntervalOpen(false), 100)}>
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
                <label className="text-xs text-gray-300 mb-1" htmlFor="style">{t('Style')}</label>
                <select 
                  id="style" 
                  name="style" 
                  className="bg-[#25252d] text-white text-sm rounded px-3 py-2 border border-[#3a3a45] focus:border-blue-400 outline-none" 
                  value={formData.style} 
                  onChange={handleInputChange}
                >
                  {chartStyles.map((s) => (
                    <option key={s.value} value={s.value}>{s.text}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-gray-300 mb-1" htmlFor="theme">{t('Theme')}</label>
                <select 
                  id="theme" 
                  name="theme" 
                  className="bg-[#25252d] text-white text-sm rounded px-3 py-2 border border-[#3a3a45] focus:border-blue-400 outline-none" 
                  value={formData.theme} 
                  onChange={handleInputChange}
                >
                  <option value="light">{t('Theme_Light')}</option>
                  <option value="dark">{t('Theme_Dark')}</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-gray-300 mb-1" htmlFor="width">{t('Width')}</label>
                <input 
                  id="width" 
                  name="width" 
                  type="number" 
                  min={100} 
                  className="bg-[#25252d] text-white text-sm rounded px-3 py-2 border border-[#3a3a45] focus:border-blue-400 outline-none" 
                  value={formData.width} 
                  onChange={handleInputChange} 
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-gray-300 mb-1" htmlFor="height">{t('Height')}</label>
                <input 
                  id="height" 
                  name="height" 
                  type="number" 
                  min={100} 
                  className="bg-[#25252d] text-white text-sm rounded px-3 py-2 border border-[#3a3a45] focus:border-blue-400 outline-none" 
                  value={formData.height} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>

            {/* Multi-interval selection helper */}
            {/* <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-300">Intervals selected (max 3):</span>
                <button
                  type="button"
                  onClick={addCurrentInterval}
                  disabled={!canAddMoreIntervals}
                  className="bg-[#1a1a20] hover:bg-blue-600 disabled:opacity-50 text-white text-xs py-1 px-2 rounded border border-[#3a3a45]"
                >
                  Add current interval
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedIntervals.map(iv => (
                  <span
                    key={iv}
                    className="inline-flex items-center gap-1 bg-[#25252d] text-white text-xs px-2 py-1 rounded border border-[#3a3a45]"
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
            </div> */}

            {/* Technical Indicators Section */}
            <div className="border-t border-[#3a3a45] pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-emerald-400"/>
                  {t('ChartOnDemand_TechnicalIndicators')} ({selectedStudies.length})
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
                      <div key={study.id} className="bg-[#25252d] border border-[#3a3a45] rounded p-3">
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
                                    className="w-full border border-[#3a3a45] rounded px-3 py-2 bg-[#25252d] text-white"
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
                                  className="bg-[#25252d] text-white text-sm rounded px-3 py-2 border border-[#3a3a45] focus:border-blue-400 outline-none"
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
                                  className="bg-[#25252d] text-white text-sm rounded px-3 py-2 border border-[#3a3a45] focus:border-blue-400 outline-none"
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
                <div className="bg-[#25252d] border border-[#3a3a45] rounded p-3 mb-3">
                  {/* Indicator search */}
                  <div className="mb-3">
                    <input
                      type="text"
                      placeholder={t('FilterIndicatorsPlaceholder')}
                      value={studySearch}
                      onChange={(e) => setStudySearch(e.target.value)}
                      className="w-full bg-[#1f1f27] text-white text-sm rounded px-3 py-2 border border-[#3a3a45] focus:border-blue-400 outline-none"
                    />
                  </div>
                  <h4 className="text-white text-sm font-medium mb-2">{t('PopularIndicators')}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                    {filteredStudyKeys.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => addStudy(preset)}
                        className="bg-[#1a1a20] hover:bg-blue-600 text-white text-xs py-1 px-2 rounded border border-[#3a3a45]"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                  
                  <h4 className="text-white text-sm font-medium mb-2">{t('AllIndicators')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                    {filteredIndicatorKeys.map((indicator) => (
                      <button
                        key={indicator}
                        type="button"
                        onClick={() => addStudy(indicator)}
                        className="bg-[#1a1a20] hover:bg-blue-600 text-white text-xs py-1 px-2 rounded border border-[#3a3a45] text-left"
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

            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={isLoading || selectedIntervals.length === 0} 
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? t('Generating') : t('GenerateChart')}
              </button>
            </div>
          </form>

          {/* Chart Preview */}
          <div className="mt-6">
            <h3 className="text-white font-medium mb-2 flex items-center">
              <ImageIcon className="w-4 h-4 mr-2 text-emerald-400"/>
              {t('Preview')}
            </h3>
            <div className="flex flex-col bg-[#25252d] border border-[#3a3a45] rounded-lg flex items-center justify-center overflow-hidden">
              {isLoading ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                  <span className="text-gray-400 text-sm">{t('GeneratingChart')}</span>
                </div>
              ) : imageUrls && imageUrls.length > 0 ? imageUrls?.map((i, index) => (
                <div key={index}>
                  <img src={i} alt={"Generated chart " + index} className="max-w-full max-h-full object-contain" />
                  <br />
                </div>
              )) : (
                <span className="text-gray-400 text-sm">{t('ChartOnDemand_EmptyPreview')}</span>
              )}
            </div>
            {imageUrls && imageUrls.length > 0 && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleUseInChartAnalysis}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                >
                  {t('UseInChartAnalysis')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Section - 40% */}
        <div className="w-full md:w-2/5 space-y-6">
          {/* Guide Panel */}
          <div className="bg-[#1a1a20] rounded-lg border border-[#3a3a45] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">{t('Guide')}</h2>
            </div>
            <div className="h-[600px] bg-[#25252d] rounded-lg p-4 overflow-auto">
              <div className="text-white space-y-4">
                <div>
                  <h3 className="text-base font-medium mb-2 text-blue-400">{t('ChartOnDemand_SymbolSelection')}</h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-300 text-sm">
                    <li>{t('ChartOnDemand_SymbolSelection_Item1')}</li>
                    <li>{t('ChartOnDemand_SymbolSelection_Item2')}</li>
                    <li>{t('ChartOnDemand_SymbolSelection_Item3')}</li>
                    <li>{t('ChartOnDemand_SymbolSelection_Item4')}</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base font-medium mb-2 text-emerald-400">{t('ChartOnDemand_TechnicalAnalysis')}</h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-300 text-sm">
                    <li>{t('ChartOnDemand_TechnicalAnalysis_Item1')}</li>
                    <li>{t('ChartOnDemand_TechnicalAnalysis_Item2')}</li>
                    <li>{t('ChartOnDemand_TechnicalAnalysis_Item3')}</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base font-medium mb-2 text-orange-400">{t('ChartOnDemand_ChartSettings')}</h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-300 text-sm">
                    <li>{t('ChartOnDemand_ChartSettings_Item1')}</li>
                    <li>{t('ChartOnDemand_ChartSettings_Item2')}</li>
                    <li>{t('ChartOnDemand_ChartSettings_Item3')}</li>
                    <li>{t('ChartOnDemand_ChartSettings_Item4')}</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-blue-400 font-medium mb-2 text-base">{t('ChartOnDemand_PopularExamples')}</h4>
                  <div className="space-y-3">
                    <div className="bg-[#1a1a20] p-3 rounded border border-[#3a3a45]">
                      <div className="text-yellow-400 text-sm font-medium mb-1">{t('ChartOnDemand_Example_Bitcoin')}</div>
                      <pre className="text-xs text-gray-300">{`Symbol: BINANCE:BTCUSDT
                        Interval: 4h
                        Range: 1M
                        Indicators: Volume, MACD, RSI`}</pre>
                    </div>

                    <div className="bg-[#1a1a20] p-3 rounded border border-[#3a3a45]">
                      <div className="text-yellow-400 text-sm font-medium mb-1">{t('ChartOnDemand_Example_Stock')}</div>
                      <pre className="text-xs text-gray-300">{`Symbol: NASDAQ:AAPL
                        Interval: 1D
                        Range: 6M
                        Indicators: Bollinger Bands, MA 50`}</pre>
                    </div>

                    <div className="bg-[#1a1a20] p-3 rounded border border-[#3a3a45]">
                      <div className="text-yellow-400 text-sm font-medium mb-1">{t('ChartOnDemand_Example_Forex')}</div>
                      <pre className="text-xs text-gray-300">{`Symbol: FX:EURUSD
                        Interval: 1h
                        Range: 1W
                        Indicators: MACD, Support Lines`}</pre>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-red-400 font-medium mb-2 text-base">{t('ChartOnDemand_Tips')}</h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-300 text-sm">
                    <li>{t('ChartOnDemand_Tips_Item1')}</li>
                    <li>{t('ChartOnDemand_Tips_Item2')}</li>
                    <li>{t('ChartOnDemand_Tips_Item3')}</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-purple-400 font-medium mb-2 text-base">{t('ChartOnDemand_SupportedMarkets')}</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-blue-400 font-medium">{t('ChartOnDemand_Market_Crypto')}</div>
                      <div className="text-gray-400">Binance, Coinbase, Kraken, Bybit</div>
                    </div>
                    <div>
                      <div className="text-green-400 font-medium">{t('ChartOnDemand_Market_Stocks')}</div>
                      <div className="text-gray-400">NASDAQ, NYSE, LSE, TSX</div>
                    </div>
                    <div>
                      <div className="text-yellow-400 font-medium">{t('ChartOnDemand_Market_Forex')}</div>
                      <div className="text-gray-400">FX, OANDA, FXCM</div>
                    </div>
                    <div>
                      <div className="text-orange-400 font-medium">{t('ChartOnDemand_Market_Futures')}</div>
                      <div className="text-gray-400">CME, CBOT, COMEX</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Helper function to get popular symbols for each exchange
const getPopularSymbolsForExchange = (exchange: string): string[] => {
  const popularSymbols: Record<string, string[]> = {
    'BINANCE': ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT', 'XRPUSDT'],
    'NASDAQ': ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA'],
    'NYSE': ['BABA', 'JNJ', 'V', 'WMT', 'PG', 'DIS'],
    'COINBASE': ['BTCUSD', 'ETHUSD', 'LTCUSD', 'BCHUSD', 'ADAUSD', 'SOLUSD'],
    'KRAKEN': ['XXBTZUSD', 'XETHZUSD', 'XLTCZUSD', 'XXRPZUSD', 'ADAUSD', 'LINKUSD'],
    'FX': ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD'],
    'CME': ['ES1!', 'NQ1!', 'YM1!', 'RTY1!', 'CL1!', 'GC1!'],
  };
  
  return popularSymbols[exchange] || [];
};

export default ChartOnDemand;