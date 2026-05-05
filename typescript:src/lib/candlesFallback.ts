import { getHeliusClient } from '@/lib/heliusClient';
import { getBirdeyeClient } from '@/lib/birdeyeClient';
import { resolveLlmApiUrl } from '@/lib/llmDevProxy';

export interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export async function fetchCandlesWithFallback(
  mint: string, 
  interval: string,
  heliusApiKey?: string,
  birdeyeApiKey?: string
): Promise<CandleData[]> {
  // Try Pump API first
  try {
    const pumpResponse = await fetch(`https://frontend-api.pump.fun/candlesticks/${mint}?offset=0&limit=1000&timeframe=${interval}`);
    if (pumpResponse.ok) {
      const pumpData = await pumpResponse.json();
      if (pumpData && Array.isArray(pumpData) && pumpData.length > 0) {
        console.log('Using Pump API data');
        return pumpData.map((item: any) => ({
          timestamp: item.timestamp * 1000,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume || 0
        }));
      }
    }
  } catch (error) {
    console.warn('Pump API failed, trying Birdeye fallback...', error);
  }

  // Fallback: Birdeye API for real OHLC data
  try {
    const birdeye = getBirdeyeClient(birdeyeApiKey);
    const birdeyeTimeframe = interval === '1m' ? '1m' : interval === '5m' ? '5m' : '15m';
    const candles = await birdeye.getOHLC(mint, birdeyeTimeframe);
    
    if (candles.length > 0) {
      console.log('Using Birdeye API data');
      return candles.map(candle => ({
        timestamp: candle.unixTime * 1000,
        open: candle.o,
        high: candle.h,
        low: candle.l,
        close: candle.c,
        volume: candle.v
      }));
    }
  } catch (error) {
    console.warn('Birdeye API failed:', error);
  }

  // Final verification: check if token exists via Helius
  if (heliusApiKey) {
    const helius = getHeliusClient(heliusApiKey);
    if (helius) {
      try {
        const tokenInfo = await helius.getTokenInfo(mint);
        if (!tokenInfo) {
          console.error('Token not found - invalid mint address');
          return [];
        }
      } catch (error) {
        console.error('Token verification failed:', error);
      }
    }
  }

  console.error('No price data available from any source');
  return [];
}
