import { resolveLlmApiUrl } from '@/lib/llmDevProxy';

interface BirdeyeCandle {
  unixTime: number;
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  v: number; // volume
}

export class BirdeyeClient {
  private apiKey?: string;
  private baseUrl = 'https://public-api.birdeye.so';

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  async getOHLC(mint: string, timeframe = '5m', limit = 1000): Promise<BirdeyeCandle[]> {
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      };

      if (this.apiKey) {
        headers['X-API-KEY'] = this.apiKey;
      }

      const response = await fetch(
        resolveLlmApiUrl(`${this.baseUrl}/defi/ohlcv/base?address=${mint}&type=${timeframe}&time_from=${Math.floor(Date.now() / 1000) - 86400}&time_to=${Math.floor(Date.now() / 1000)}`),
        { headers }
      );

      if (!response.ok) {
        throw new Error(`Birdeye API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data?.items || [];
    } catch (error) {
      console.error('Birdeye OHLC failed:', error);
      return [];
    }
  }

  async getTokenPrice(mint: string): Promise<number | null> {
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      };

      if (this.apiKey) {
        headers['X-API-KEY'] = this.apiKey;
      }

      const response = await fetch(
        resolveLlmApiUrl(`${this.baseUrl}/defi/price?address=${mint}`),
        { headers }
      );

      if (!response.ok) {
        throw new Error(`Birdeye price API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data?.value || null;
    } catch (error) {
      console.error('Birdeye price failed:', error);
      return null;
    }
  }
}

// Create singleton instance
let birdeyeClient: BirdeyeClient | null = null;

export function getBirdeyeClient(apiKey?: string): BirdeyeClient {
  if (!birdeyeClient) {
    birdeyeClient = new BirdeyeClient(apiKey);
  }
  return birdeyeClient;
}
