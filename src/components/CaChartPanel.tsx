import React, { useState, useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';
import { useAppContext } from '@/context/AppContext';
import { fetchCandlesWithFallback } from '@/lib/candlesFallback';

export function CaChartPanel() {
  const { chartMint, setChartMint, heliusApiKey } = useAppContext();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interval, setInterval] = useState('5m');

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: '#1a1a1a' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#374151' },
        horzLines: { color: '#374151' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Load candle data
  const loadCandleData = async (mint: string) => {
    if (!mint || !candlestickSeriesRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log(`Fetching candles for ${mint} with interval ${interval}`);
      
      // Use the new fallback system with Helius
      const candles = await fetchCandlesWithFallback(mint, interval, heliusApiKey);
      
      if (candles.length === 0) {
        setError('No price data available from any source');
        return;
      }

      // Convert to lightweight-charts format
      const chartData: CandlestickData[] = candles.map(candle => ({
        time: Math.floor(candle.timestamp / 1000) as any,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }));

      // Sort by time
      chartData.sort((a, b) => (a.time as number) - (b.time as number));

      candlestickSeriesRef.current.setData(chartData);
      
      // Fit content to visible range
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }

      console.log(`Loaded ${chartData.length} candles for ${mint}`);
      
    } catch (error) {
      console.error('Failed to load candle data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load chart data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when mint or interval changes
  useEffect(() => {
    if (chartMint) {
      loadCandleData(chartMint);
    }
  }, [chartMint, interval, heliusApiKey]);

  return (
    <div className="flex flex-col h-full">
      {/* Header with mint input and controls */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={chartMint}
            onChange={(e) => setChartMint(e.target.value)}
            placeholder="Enter token mint address..."
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => loadCandleData(chartMint)}
            disabled={!chartMint || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : 'Load'}
          </button>
        </div>
        
        <div className="flex gap-2">
          <select
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
          >
            <option value="1m">1m</option>
            <option value="5m">5m</option>
            <option value="15m">15m</option>
            <option value="1h">1h</option>
          </select>
          
          {error && (
            <div className="text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Chart container */}
      <div className="flex-1 relative">
        <div ref={chartContainerRef} className="w-full h-full" />
        
        {isLoading && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
            <div className="text-white">Loading chart data...</div>
          </div>
        )}
        
        {error && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-red-400 mb-2">Chart Error</div>
              <div className="text-sm">{error}</div>
              <button
                onClick={() => loadCandleData(chartMint)}
                className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
