import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ChatMessage, ModelSettings, GitHubWorkspaceSettings } from '@/types';

interface HeliusSettings {
  apiKey: string;
}

interface AppState {
  // Data & Trading
  pumpPortalApiKey: string;
  heliusSettings: HeliusSettings;
  tradingWalletSecret: string;
  
  // Chart
  chartMint: string;
  
  // Scalper
  selectedAlgo: string;
  tradingMode: 'paper' | 'live';
  
  // Chat
  chatMessages: ChatMessage[];
  
  // LLM
  modelSettings: ModelSettings;
  
  // GitHub
  githubWorkspace: GitHubWorkspaceSettings;
  
  // UI
  sidebarMode: 'dashboard' | 'setup' | 'code' | 'nursery';
}

type AppAction =
  | { type: 'SET_PUMPPORTAL_API_KEY'; payload: string }
  | { type: 'SET_HELIUS_API_KEY'; payload: string }
  | { type: 'SET_TRADING_WALLET_SECRET'; payload: string }
  | { type: 'SET_CHART_MINT'; payload: string }
  | { type: 'SET_SELECTED_ALGO'; payload: string }
  | { type: 'SET_TRADING_MODE'; payload: 'paper' | 'live' }
  | { type: 'SET_CHAT_MESSAGES'; payload: ChatMessage[] }
  | { type: 'SET_MODEL_SETTINGS'; payload: ModelSettings }
  | { type: 'SET_GITHUB_WORKSPACE'; payload: GitHubWorkspaceSettings }
  | { type: 'SET_SIDEBAR_MODE'; payload: 'dashboard' | 'setup' | 'code' | 'nursery' };

const initialState: AppState = {
  pumpPortalApiKey: '',
  heliusSettings: { apiKey: '' },
  tradingWalletSecret: '',
  chartMint: '',
  selectedAlgo: 'unt-builtin-scalper',
  tradingMode: 'paper',
  chatMessages: [],
  modelSettings: {
    provider: 'openai',
    model: 'gpt-4o',
    apiKey: '',
    baseUrl: '',
  },
  githubWorkspace: {
    personalAccessToken: '',
    owner: 'JonCrishaer',
    repo: 'solclaw',
    branch: 'main',
  },
  sidebarMode: 'dashboard',
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PUMPPORTAL_API_KEY':
      localStorage.setItem('unt-pump-portal-api-key', action.payload);
      return { ...state, pumpPortalApiKey: action.payload };
    
    case 'SET_HELIUS_API_KEY':
      const newHeliusSettings = { ...state.heliusSettings, apiKey: action.payload };
      localStorage.setItem('unt-helius-settings', JSON.stringify(newHeliusSettings));
      return { ...state, heliusSettings: newHeliusSettings };
    
    case 'SET_TRADING_WALLET_SECRET':
      localStorage.setItem('unt-trading-wallet-secret', action.payload);
      return { ...state, tradingWalletSecret: action.payload };
    
    case 'SET_CHART_MINT':
      return { ...state, chartMint: action.payload };
    
    case 'SET_SELECTED_ALGO':
      return { ...state, selectedAlgo: action.payload };
    
    case 'SET_TRADING_MODE':
      return { ...state, tradingMode: action.payload };
    
    case 'SET_CHAT_MESSAGES':
      return { ...state, chatMessages: action.payload };
    
    case 'SET_MODEL_SETTINGS':
      localStorage.setItem('unt-model-settings', JSON.stringify(action.payload));
      return { ...state, modelSettings: action.payload };
    
    case 'SET_GITHUB_WORKSPACE':
      localStorage.setItem('unt-github-workspace', JSON.stringify(action.payload));
      return { ...state, githubWorkspace: action.payload };
    
    case 'SET_SIDEBAR_MODE':
      return { ...state, sidebarMode: action.payload };
    
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  // Convenience getters/setters for backward compatibility
  pumpPortalApiKey: string;
  setPumpPortalApiKey: (key: string) => void;
  heliusApiKey: string;
  setHeliusApiKey: (key: string) => void;
  tradingWalletSecret: string;
  setTradingWalletSecret: (secret: string) => void;
  chartMint: string;
  setChartMint: (mint: string) => void;
  selectedAlgo: string;
  setSelectedAlgo: (algo: string) => void;
  tradingMode: 'paper' | 'live';
  setTradingMode: (mode: 'paper' | 'live') => void;
  chatMessages: ChatMessage[];
  setChatMessages: (messages: ChatMessage[]) => void;
  modelSettings: ModelSettings;
  setModelSettings: (settings: ModelSettings | ((prev: ModelSettings) => ModelSettings)) => void;
  githubWorkspace: GitHubWorkspaceSettings;
  setGithubWorkspace: (workspace: GitHubWorkspaceSettings | ((prev: GitHubWorkspaceSettings) => GitHubWorkspaceSettings)) => void;
  sidebarMode: 'dashboard' | 'setup' | 'code' | 'nursery';
  setSidebarMode: (mode: 'dashboard' | 'setup' | 'code' | 'nursery') => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const loadFromStorage = () => {
      // PumpPortal API Key
      const pumpPortalKey = localStorage.getItem('unt-pump-portal-api-key');
      if (pumpPortalKey) {
        dispatch({ type: 'SET_PUMPPORTAL_API_KEY', payload: pumpPortalKey });
      }

      // Helius Settings
      const heliusSettings = localStorage.getItem('unt-helius-settings');
      if (heliusSettings) {
        try {
          const parsed = JSON.parse(heliusSettings);
          dispatch({ type: 'SET_HELIUS_API_KEY', payload: parsed.apiKey || '' });
        } catch (e) {
          console.warn('Failed to parse stored Helius settings');
        }
      }

      // Trading Wallet Secret
      const walletSecret = localStorage.getItem('unt-trading-wallet-secret');
      if (walletSecret) {
        dispatch({ type: 'SET_TRADING_WALLET_SECRET', payload: walletSecret });
      }

      // Model Settings
      const modelSettings = localStorage.getItem('unt-model-settings');
      if (modelSettings) {
        try {
          const parsed = JSON.parse(modelSettings);
          dispatch({ type: 'SET_MODEL_SETTINGS', payload: parsed });
        } catch (e) {
          console.warn('Failed to parse stored model settings');
        }
      }

      // GitHub Workspace
      const githubWorkspace = localStorage.getItem('unt-github-workspace');
      if (githubWorkspace) {
        try {
          const parsed = JSON.parse(githubWorkspace);
          dispatch({ type: 'SET_GITHUB_WORKSPACE', payload: parsed });
        } catch (e) {
          console.warn('Failed to parse stored GitHub workspace');
        }
      }
    };

    loadFromStorage();
  }, []);

  // Convenience functions for backward compatibility
  const setPumpPortalApiKey = (key: string) => {
    dispatch({ type: 'SET_PUMPPORTAL_API_KEY', payload: key });
  };

  const setHeliusApiKey = (key: string) => {
    dispatch({ type: 'SET_HELIUS_API_KEY', payload: key });
  };

  const setTradingWalletSecret = (secret: string) => {
    dispatch({ type: 'SET_TRADING_WALLET_SECRET', payload: secret });
  };

  const setChartMint = (mint: string) => {
    dispatch({ type: 'SET_CHART_MINT', payload: mint });
  };

  const setSelectedAlgo = (algo: string) => {
    dispatch({ type: 'SET_SELECTED_ALGO', payload: algo });
  };

  const setTradingMode = (mode: 'paper' | 'live') => {
    dispatch({ type: 'SET_TRADING_MODE', payload: mode });
  };

  const setChatMessages = (messages: ChatMessage[]) => {
    dispatch({ type: 'SET_CHAT_MESSAGES', payload: messages });
  };

  const setModelSettings = (settings: ModelSettings | ((prev: ModelSettings) => ModelSettings)) => {
    const newSettings = typeof settings === 'function' ? settings(state.modelSettings) : settings;
    dispatch({ type: 'SET_MODEL_SETTINGS', payload: newSettings });
  };

  const setGithubWorkspace = (workspace: GitHubWorkspaceSettings | ((prev: GitHubWorkspaceSettings) => GitHubWorkspaceSettings)) => {
    const newWorkspace = typeof workspace === 'function' ? workspace(state.githubWorkspace) : workspace;
    dispatch({ type: 'SET_GITHUB_WORKSPACE', payload: newWorkspace });
  };

  const setSidebarMode = (mode: 'dashboard' | 'setup' | 'code' | 'nursery') => {
    dispatch({ type: 'SET_SIDEBAR_MODE', payload: mode });
  };

  return (
    <AppContext.Provider value={{
      state,
      dispatch,
      pumpPortalApiKey: state.pumpPortalApiKey,
      setPumpPortalApiKey,
      heliusApiKey: state.heliusSettings.apiKey,
      setHeliusApiKey,
      tradingWalletSecret: state.tradingWalletSecret,
      setTradingWalletSecret,
      chartMint: state.chartMint,
      setChartMint,
      selectedAlgo: state.selectedAlgo,
      setSelectedAlgo,
      tradingMode: state.tradingMode,
      setTradingMode,
      chatMessages: state.chatMessages,
      setChatMessages,
      modelSettings: state.modelSettings,
      setModelSettings,
      githubWorkspace: state.githubWorkspace,
      setGithubWorkspace,
      sidebarMode: state.sidebarMode,
      setSidebarMode,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppContextProvider');
  }
  return context;
}
