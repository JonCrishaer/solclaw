import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { ChatMessage, ModelSettings, GitHubWorkspaceSettings } from '@/types';
import { scalperPaperConfig } from '@/lib/scalperPaperConfig';

interface AppState {
  // Existing state...
  pumpPortalApiKey: string;
  heliusApiKey: string;
  useHeliusForCandles: boolean;
  modelSettings: ModelSettings;
  solanaWalletSecret: string;
  githubWorkspace: GitHubWorkspaceSettings;
  sidebarMode: 'dashboard' | 'setup' | 'code' | 'nursery';
  chartMint: string;
  chartMintPending: string;
  selectedAlgo: string;
  tradingMode: 'paper' | 'real';
  paperScalperActive: boolean;
  scalperConfig: typeof scalperPaperConfig;
  messages: ChatMessage[];
  openFilePath: string | null;
  fileTree: any[];
}

type AppAction = 
  // Existing actions...
  | { type: 'SET_PUMP_PORTAL_API_KEY'; payload: string }
  | { type: 'SET_HELIUS_API_KEY'; payload: string }
  | { type: 'SET_USE_HELIUS_FOR_CANDLES'; payload: boolean }
  | { type: 'SET_MODEL_SETTINGS'; payload: ModelSettings }
  | { type: 'SET_SOLANA_WALLET_SECRET'; payload: string }
  | { type: 'SET_GITHUB_WORKSPACE'; payload: GitHubWorkspaceSettings }
  | { type: 'SET_SIDEBAR_MODE'; payload: AppState['sidebarMode'] }
  | { type: 'SET_CHART_MINT'; payload: string }
  | { type: 'SET_CHART_MINT_PENDING'; payload: string }
  | { type: 'SET_SELECTED_ALGO'; payload: string }
  | { type: 'SET_TRADING_MODE'; payload: AppState['tradingMode'] }
  | { type: 'SET_PAPER_SCALPER_ACTIVE'; payload: boolean }
  | { type: 'UPDATE_SCALPER_CONFIG'; payload: Partial<typeof scalperPaperConfig> }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<ChatMessage> } }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'SET_OPEN_FILE_PATH'; payload: string | null }
  | { type: 'SET_FILE_TREE'; payload: any[] };

const initialState: AppState = {
  pumpPortalApiKey: localStorage.getItem('pumpPortalApiKey') || '',
  heliusApiKey: localStorage.getItem('heliusApiKey') || '',
  useHeliusForCandles: localStorage.getItem('useHeliusForCandles') === 'true',
  modelSettings: {
    provider: (localStorage.getItem('llmProvider') as 'openai' | 'anthropic' | 'ollama') || 'openai',
    apiKey: localStorage.getItem('llmApiKey') || '',
    model: localStorage.getItem('llmModel') || 'gpt-4o',
    baseUrl: localStorage.getItem('llmBaseUrl') || '',
  },
  solanaWalletSecret: localStorage.getItem('solanaWalletSecret') || '',
  githubWorkspace: {
    pat: localStorage.getItem('githubPat') || '',
    owner: localStorage.getItem('githubOwner') || '',
    repo: localStorage.getItem('githubRepo') || 'solclaw',
    branch: localStorage.getItem('githubBranch') || 'main',
  },
  sidebarMode: 'dashboard',
  chartMint: '',
  chartMintPending: '',
  selectedAlgo: localStorage.getItem('selectedAlgo') || 'unt-builtin-scalper',
  tradingMode: (localStorage.getItem('tradingMode') as 'paper' | 'real') || 'paper',
  paperScalperActive: false,
  scalperConfig: { ...scalperPaperConfig },
  messages: [],
  openFilePath: null,
  fileTree: [],
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PUMP_PORTAL_API_KEY':
      localStorage.setItem('pumpPortalApiKey', action.payload);
      return { ...state, pumpPortalApiKey: action.payload };
    
    case 'SET_HELIUS_API_KEY':
      localStorage.setItem('heliusApiKey', action.payload);
      return { ...state, heliusApiKey: action.payload };
    
    case 'SET_USE_HELIUS_FOR_CANDLES':
      localStorage.setItem('useHeliusForCandles', action.payload.toString());
      return { ...state, useHeliusForCandles: action.payload };
    
    case 'SET_MODEL_SETTINGS':
      localStorage.setItem('llmProvider', action.payload.provider);
      localStorage.setItem('llmApiKey', action.payload.apiKey);
      localStorage.setItem('llmModel', action.payload.model);
      localStorage.setItem('llmBaseUrl', action.payload.baseUrl || '');
      return { ...state, modelSettings: action.payload };
    
    case 'SET_SOLANA_WALLET_SECRET':
      localStorage.setItem('solanaWalletSecret', action.payload);
      return { ...state, solanaWalletSecret: action.payload };
    
    case 'SET_GITHUB_WORKSPACE':
      localStorage.setItem('githubPat', action.payload.pat);
      localStorage.setItem('githubOwner', action.payload.owner);
      localStorage.setItem('githubRepo', action.payload.repo);
      localStorage.setItem('githubBranch', action.payload.branch);
      return { ...state, githubWorkspace: action.payload };
    
    case 'SET_SIDEBAR_MODE':
      return { ...state, sidebarMode: action.payload };
    
    case 'SET_CHART_MINT':
      return { ...state, chartMint: action.payload, chartMintPending: '' };
    
    case 'SET_CHART_MINT_PENDING':
      return { ...state, chartMintPending: action.payload };
    
    case 'SET_SELECTED_ALGO':
      localStorage.setItem('selectedAlgo', action.payload);
      return { ...state, selectedAlgo: action.payload };
    
    case 'SET_TRADING_MODE':
      localStorage.setItem('tradingMode', action.payload);
      return { ...state, tradingMode: action.payload };
    
    case 'SET_PAPER_SCALPER_ACTIVE':
      return { ...state, paperScalperActive: action.payload };
    
    case 'UPDATE_SCALPER_CONFIG':
      return { 
        ...state, 
        scalperConfig: { ...state.scalperConfig, ...action.payload }
      };
    
    case 'ADD_MESSAGE':
      return { 
        ...state, 
        messages: [...state.messages, action.payload]
      };
    
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg => 
          msg.id === action.payload.id 
            ? { ...msg, ...action.payload.updates }
            : msg
        )
      };
    
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] };
    
    case 'SET_OPEN_FILE_PATH':
      return { ...state, openFilePath: action.payload };
    
    case 'SET_FILE_TREE':
      return { ...state, fileTree: action.payload };
    
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
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
