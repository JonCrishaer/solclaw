import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ChatMessage, ModelSettings, GitHubWorkspaceSettings } from '@/types';

interface AppContextType {
  // Data & Trading
  pumpPortalApiKey: string;
  setPumpPortalApiKey: (key: string) => void;
  heliusApiKey: string;
  setHeliusApiKey: (key: string) => void;
  tradingWalletSecret: string;
  setTradingWalletSecret: (secret: string) => void;
  
  // Chart
  chartMint: string;
  setChartMint: (mint: string) => void;
  
  // Scalper
  selectedAlgo: string;
  setSelectedAlgo: (algo: string) => void;
  tradingMode: 'paper' | 'live';
  setTradingMode: (mode: 'paper' | 'live') => void;
  
  // Chat
  chatMessages: ChatMessage[];
  setChatMessages: (messages: ChatMessage[]) => void;
  
  // LLM
  modelSettings: ModelSettings;
  setModelSettings: (settings: ModelSettings | ((prev: ModelSettings) => ModelSettings)) => void;
  
  // GitHub
  githubWorkspace: GitHubWorkspaceSettings;
  setGithubWorkspace: (workspace: GitHubWorkspaceSettings | ((prev: GitHubWorkspaceSettings) => GitHubWorkspaceSettings)) => void;
  
  // UI
  sidebarMode: 'dashboard' | 'setup' | 'code' | 'nursery';
  setSidebarMode: (mode: 'dashboard' | 'setup' | 'code' | 'nursery') => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  // Data & Trading
  const [pumpPortalApiKey, setPumpPortalApiKeyState] = useState('');
  const [heliusApiKey, setHeliusApiKeyState] = useState('');
  const [tradingWalletSecret, setTradingWalletSecretState] = useState('');
  
  // Chart
  const [chartMint, setChartMint] = useState('');
  
  // Scalper
  const [selectedAlgo, setSelectedAlgo] = useState('unt-builtin-scalper');
  const [tradingMode, setTradingMode] = useState<'paper' | 'live'>('paper');
  
  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  // LLM
  const [modelSettings, setModelSettings] = useState<ModelSettings>({
    provider: 'openai',
    model: 'gpt-4o',
    apiKey: '',
    baseUrl: '',
  });
  
  // GitHub
  const [githubWorkspace, setGithubWorkspace] = useState<GitHubWorkspaceSettings>({
    personalAccessToken: '',
    owner: 'JonCrishaer',
    repo: 'solclaw',
    branch: 'main',
  });
  
  // UI
  const [sidebarMode, setSidebarMode] = useState<'dashboard' | 'setup' | 'code' | 'nursery'>('dashboard');

  // Persistence
  useEffect(() => {
    const stored = localStorage.getItem('unt-pump-portal-api-key');
    if (stored) setPumpPortalApiKeyState(stored);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('unt-helius-api-key');
    if (stored) setHeliusApiKeyState(stored);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('unt-trading-wallet-secret');
    if (stored) setTradingWalletSecretState(stored);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('unt-model-settings');
    if (stored) {
      try {
        setModelSettings(JSON.parse(stored));
      } catch (e) {
        console.warn('Failed to parse stored model settings');
      }
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('unt-github-workspace');
    if (stored) {
      try {
        setGithubWorkspace(JSON.parse(stored));
      } catch (e) {
        console.warn('Failed to parse stored GitHub workspace');
      }
    }
  }, []);

  const setPumpPortalApiKey = (key: string) => {
    setPumpPortalApiKeyState(key);
    localStorage.setItem('unt-pump-portal-api-key', key);
  };

  const setHeliusApiKey = (key: string) => {
    setHeliusApiKeyState(key);
    localStorage.setItem('unt-helius-api-key', key);
  };

  const setTradingWalletSecret = (secret: string) => {
    setTradingWalletSecretState(secret);
    localStorage.setItem('unt-trading-wallet-secret', secret);
  };

  const setModelSettingsWithStorage = (settings: ModelSettings | ((prev: ModelSettings) => ModelSettings)) => {
    setModelSettings(prev => {
      const newSettings = typeof settings === 'function' ? settings(prev) : settings;
      localStorage.setItem('unt-model-settings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  const setGithubWorkspaceWithStorage = (workspace: GitHubWorkspaceSettings | ((prev: GitHubWorkspaceSettings) => GitHubWorkspaceSettings)) => {
    setGithubWorkspace(prev => {
      const newWorkspace = typeof workspace === 'function' ? workspace(prev) : workspace;
      localStorage.setItem('unt-github-workspace', JSON.stringify(newWorkspace));
      return newWorkspace;
    });
  };

  return (
    <AppContext.Provider value={{
      pumpPortalApiKey,
      setPumpPortalApiKey,
      heliusApiKey,
      setHeliusApiKey,
      tradingWalletSecret,
      setTradingWalletSecret,
      chartMint,
      setChartMint,
      selectedAlgo,
      setSelectedAlgo,
      tradingMode,
      setTradingMode,
      chatMessages,
      setChatMessages,
      modelSettings,
      setModelSettings: setModelSettingsWithStorage,
      githubWorkspace,
      setGithubWorkspace: setGithubWorkspaceWithStorage,
      sidebarMode,
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
