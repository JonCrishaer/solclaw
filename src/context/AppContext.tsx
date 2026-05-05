import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { type ChatMessage, type ModelSettings, type GitHubWorkspaceSettings } from '@/types'

interface AppContextType {
  // PumpPortal & Trading
  pumpPortalApiKey: string
  setPumpPortalApiKey: (key: string) => void
  solanaWalletSecret: string
  setSolanaWalletSecret: (secret: string) => void
  heliusApiKey: string
  setHeliusApiKey: (key: string) => void
  
  // Chart & Analytics
  activeMint: string
  setActiveMint: (mint: string) => void
  bounceLines: Record<string, number[]>
  setBounceLines: (mint: string, lines: number[]) => void
  
  // AI Chat
  messages: ChatMessage[]
  setMessages: (messages: ChatMessage[]) => void
  modelSettings: ModelSettings
  setModelSettings: (settings: ModelSettings) => void
  
  // GitHub Workspace
  githubWorkspace: GitHubWorkspaceSettings
  setGithubWorkspace: (settings: GitHubWorkspaceSettings) => void
  
  // UI State
  sidebarMode: 'dashboard' | 'setup' | 'code' | 'nursery'
  setSidebarMode: (mode: 'dashboard' | 'setup' | 'code' | 'nursery') => void
  selectedAlgo: string
  setSelectedAlgo: (algo: string) => void
  tradingMode: 'paper' | 'live'
  setTradingMode: (mode: 'paper' | 'live') => void
  
  // Workspace
  openFilePath: string | null
  setOpenFilePath: (path: string | null) => void
  fileTree: string[]
  setFileTree: (files: string[]) => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  // PumpPortal & Trading
  const [pumpPortalApiKey, setPumpPortalApiKeyState] = useState('')
  const [solanaWalletSecret, setSolanaWalletSecretState] = useState('')
  const [heliusApiKey, setHeliusApiKeyState] = useState('')
  
  // Chart & Analytics
  const [activeMint, setActiveMint] = useState('')
  const [bounceLines, setBounceLinesTotalState] = useState<Record<string, number[]>>({})
  
  // AI Chat
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [modelSettings, setModelSettingsState] = useState<ModelSettings>({
    backend: 'openai',
    apiKey: '',
    baseUrl: '',
    model: 'gpt-4'
  })
  
  // GitHub Workspace
  const [githubWorkspace, setGithubWorkspaceState] = useState<GitHubWorkspaceSettings>({
    personalAccessToken: '',
    owner: '',
    repo: '',
    branch: 'main'
  })
  
  // UI State
  const [sidebarMode, setSidebarMode] = useState<'dashboard' | 'setup' | 'code' | 'nursery'>('dashboard')
  const [selectedAlgo, setSelectedAlgo] = useState('unt-builtin-scalper')
  const [tradingMode, setTradingMode] = useState<'paper' | 'live'>('paper')
  
  // Workspace
  const [openFilePath, setOpenFilePath] = useState<string | null>(null)
  const [fileTree, setFileTree] = useState<string[]>([])

  // LocalStorage persistence
  useEffect(() => {
    const saved = localStorage.getItem('pumpPortalApiKey')
    if (saved) setPumpPortalApiKeyState(saved)
  }, [])
  
  useEffect(() => {
    const saved = localStorage.getItem('solanaWalletSecret')
    if (saved) setSolanaWalletSecretState(saved)
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('heliusApiKey')
    if (saved) setHeliusApiKeyState(saved)
  }, [])
  
  useEffect(() => {
    const saved = localStorage.getItem('modelSettings')
    if (saved) {
      try {
        setModelSettingsState(JSON.parse(saved))
      } catch (e) {
        console.warn('Failed to parse saved model settings:', e)
      }
    }
  }, [])
  
  useEffect(() => {
    const saved = localStorage.getItem('githubWorkspace')
    if (saved) {
      try {
        setGithubWorkspaceState(JSON.parse(saved))
      } catch (e) {
        console.warn('Failed to parse saved GitHub workspace:', e)
      }
    }
  }, [])
  
  useEffect(() => {
    const saved = localStorage.getItem('bounceLines')
    if (saved) {
      try {
        setBounceLinesTotalState(JSON.parse(saved))
      } catch (e) {
        console.warn('Failed to parse saved bounce lines:', e)
      }
    }
  }, [])

  const setPumpPortalApiKey = (key: string) => {
    setPumpPortalApiKeyState(key)
    localStorage.setItem('pumpPortalApiKey', key)
  }
  
  const setSolanaWalletSecret = (secret: string) => {
    setSolanaWalletSecretState(secret)
    localStorage.setItem('solanaWalletSecret', secret)
  }

  const setHeliusApiKey = (key: string) => {
    setHeliusApiKeyState(key)
    localStorage.setItem('heliusApiKey', key)
  }
  
  const setModelSettings = (settings: ModelSettings) => {
    setModelSettingsState(settings)
    localStorage.setItem('modelSettings', JSON.stringify(settings))
  }
  
  const setGithubWorkspace = (settings: GitHubWorkspaceSettings) => {
    setGithubWorkspaceState(settings)
    localStorage.setItem('githubWorkspace', JSON.stringify(settings))
  }
  
  const setBounceLines = (mint: string, lines: number[]) => {
    const updated = { ...bounceLines, [mint]: lines }
    setBounceLinesTotalState(updated)
    localStorage.setItem('bounceLines', JSON.stringify(updated))
  }

  return (
    <AppContext.Provider value={{
      pumpPortalApiKey, setPumpPortalApiKey,
      solanaWalletSecret, setSolanaWalletSecret,
      heliusApiKey, setHeliusApiKey,
      activeMint, setActiveMint,
      bounceLines, setBounceLines,
      messages, setMessages,
      modelSettings, setModelSettings,
      githubWorkspace, setGithubWorkspace,
      sidebarMode, setSidebarMode,
      selectedAlgo, setSelectedAlgo,
      tradingMode, setTradingMode,
      openFilePath, setOpenFilePath,
      fileTree, setFileTree
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}
