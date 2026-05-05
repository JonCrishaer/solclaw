import { getHeliusClient } from '@/lib/heliusClient';
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
  heliusApiKey?: string
): Promise<CandleData[]> {
  // Try Pump API first
  try {
    const pumpResponse = await fetch(`https://frontend-api.pump.fun/candlesticks/${mint}?offset=0&limit=1000&timeframe=${interval}`);
    if (pumpResponse.ok) {
      const pumpData = await pumpResponse.json();
      if (pumpData && Array.isArray(pumpData) && pumpData.length > 0) {
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
    console.warn('Pump API failed, trying fallback...', error);
  }

  // Fallback 1: DexScreener API (free, no key needed)
  try {
    const dexResponse = await fetch(resolveLlmApiUrl(`https://api.dexscreener.com/latest/dex/tokens/${mint}`));
    if (dexResponse.ok) {
      const dexData = await dexResponse.json();
      if (dexData.pairs && dexData.pairs.length > 0) {
        // Find Raydium or Pump.fun pair
        const pair = dexData.pairs.find((p: any) => 
          p.dexId === 'raydium' || p.dexId === 'pump'
        ) || dexData.pairs[0];
        
        if (pair.priceUsd) {
          // Get current price point, but we can't get historical candles from DexScreener basic API
          console.warn('DexScreener only provides current price, not historical candles');
          return [];
        }
      }
    }
  } catch (error) {
    console.warn('DexScreener API failed:', error);
  }

  // Fallback 2: Jupiter API for current price
  try {
    const jupiterResponse = await fetch(resolveLlmApiUrl(`https://price.jup.ag/v4/price?ids=${mint}`));
    if (jupiterResponse.ok) {
      const jupiterData = await jupiterResponse.json();
      if (jupiterData.data && jupiterData.data[mint]) {
        console.warn('Jupiter only provides current price, not historical candles');
        return [];
      }
    }
  } catch (error) {
    console.warn('Jupiter API failed:', error);
  }

  // If Helius is available, at least verify the token exists
  if (heliusApiKey) {
    const helius = getHeliusClient(heliusApiKey);
    if (helius) {
      try {
        const tokenInfo = await helius.getTokenInfo(mint);
        if (!tokenInfo) {
          console.error('Token not found via Helius - may be invalid mint');
          return [];
        }
      } catch (error) {
        console.error('Helius token verification failed:', error);
      }
    }
  }

  console.error('No reliable candle data source available');
  return []; // Return empty instead of mock data
}
