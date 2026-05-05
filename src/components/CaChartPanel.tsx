import { useAppContext } from '@/context/AppContext';
import { fetchCandles } from '@/lib/pumpCandles';

export function CaChartPanel() {
  const { chartMint, setChartMint, heliusApiKey } = useAppContext();
  
  // Update your candle fetching logic to pass heliusApiKey
  const loadCandles = async (mint: string) => {
    try {
      const candles = await fetchCandles(mint, '5m', heliusApiKey);
      // ... rest of your chart update logic
    } catch (error) {
      console.error('Chart data failed:', error);
    }
  };

  // ... rest of component
}
