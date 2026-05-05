import { useState } from 'react'
import { useAppContext } from '@/context/AppContext'
import { LLM_BACKENDS, type LlmBackend } from '@/lib/llmBackends'
import { GITHUB_UPSTREAM_DEFAULTS } from '@/lib/githubUpstreamDefaults'
import { resolveLlmApiUrl } from '@/lib/llmDevProxy'

type SetupTab = 'data' | 'llm' | 'github'

export function SetupPanel() {
  const { state, dispatch } = useAppContext()
  const [activeTab, setActiveTab] = useState<SetupTab>('data')
  const [showApiKey, setShowApiKey] = useState(false)
  const [showWalletSecret, setShowWalletSecret] = useState(false)

  const tabs = [
    { id: 'data' as const, label: 'Data', icon: '📊' },
    { id: 'llm' as const, label: 'LLM', icon: '🤖' },
    { id: 'github' as const, label: 'GitHub', icon: '📁' }
  ]

  const handlePumpPortalKeyChange = (value: string) => {
    dispatch({
      type: 'UPDATE_PUMP_PORTAL_SETTINGS',
      payload: { ...state.pumpPortalSettings, apiKey: value }
    })
  }

  const handleWalletSecretChange = (value: string) => {
    dispatch({
      type: 'UPDATE_WALLET_SETTINGS',
      payload: { ...state.walletSettings, secretKey: value }
    })
  }

  const handleModelChange = (backend: LlmBackend, field: string, value: string) => {
    dispatch({
      type: 'UPDATE_MODEL_SETTINGS',
      payload: {
        ...state.modelSettings,
        [backend]: {
          ...state.modelSettings[backend],
          [field]: value
        }
      }
    })
  }

  const handleGitHubChange = (field: keyof typeof state.githubWorkspace, value: string) => {
    dispatch({
      type: 'UPDATE_GITHUB_WORKSPACE',
      payload: {
        ...state.githubWorkspace,
        [field]: value
      }
    })
  }

  const forkUpstream = async () => {
    if (!state.githubWorkspace.personalAccessToken) {
      alert('Please set your GitHub Personal Access Token first')
      return
    }

    try {
      const response = await fetch(resolveLlmApiUrl('/api/github/repos/JonCrishaer/solclaw/forks'), {
        method: 'POST',
        headers: {
          'Authorization': `token ${state.githubWorkspace.personalAccessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const fork = await response.json()
        handleGitHubChange('owner', fork.owner.login)
        handleGitHubChange('repo', fork.name)
        alert('Fork created successfully!')
      } else {
        const error = await response.text()
        alert(`Failed to fork: ${error}`)
      }
    } catch (err) {
      alert(`Error forking repo: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Setup</h2>
        <p className="text-gray-600">Configure your trading data sources, AI assistant, and code workspace</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Data Tab */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Trading Data & Execution</h3>
            
            {/* PumpPortal API Key */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PumpPortal API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={state.pumpPortalSettings.apiKey}
                  onChange={(e) => handlePumpPortalKeyChange(e.target.value)}
                  placeholder="Enter your PumpPortal API key"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Required for live order book data and trade execution. Get yours at{' '}
                <a href="https://pumpportal.fun" target="_blank" rel="noopener noreferrer" 
                   className="text-blue-600 hover:underline">
                  pumpportal.fun
                </a>
              </p>
            </div>

            {/* Wallet Secret */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trading Wallet Secret
              </label>
              <div className="relative">
                <input
                  type={showWalletSecret ? 'text' : 'password'}
                  value={state.walletSettings.secretKey}
                  onChange={(e) => handleWalletSecretChange(e.target.value)}
                  placeholder="Enter your Solana wallet private key (base58)"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowWalletSecret(!showWalletSecret)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showWalletSecret ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <div className="mt-2 space-y-1 text-sm text-gray-500">
                <p>⚠️ Required for live trading. Use a dedicated trading wallet with limited funds.</p>
                <p>📱 Stored locally in your browser only - never sent to servers.</p>
                <p>🔧 Paper mode works without this for backtesting strategies.</p>
              </div>
            </div>

            {/* Trading Mode Status */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Current Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>PumpPortal Connection:</span>
                  <span className={state.pumpPortalSettings.apiKey ? 'text-green-600' : 'text-yellow-600'}>
                    {state.pumpPortalSettings.apiKey ? '✅ Ready' : '⏳ API key needed'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Trading Wallet:</span>
                  <span className={state.walletSettings.secretKey ? 'text-green-600' : 'text-gray-500'}>
                    {state.walletSettings.secretKey ? '✅ Configured' : '➖ Paper mode only'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Current Mode:</span>
                  <span className="font-medium">
                    📊 Paper Trading
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LLM Tab */}
      {activeTab === 'llm' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">AI Assistant Configuration</h3>
            
            {Object.entries(LLM_BACKENDS).map(([backendKey, backend]) => {
              const settings = state.modelSettings[backendKey as keyof typeof state.modelSettings]
              return (
                <div key={backendKey} className="mb-6 p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">{backend.name}</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* API Key */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Key
                      </label>
                      <input
                        type="password"
                        value={settings?.apiKey || ''}
                        onChange={(e) => handleModelChange(backendKey as LlmBackend, 'apiKey', e.target.value)}
                        placeholder={`Enter your ${backend.name} API key`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Base URL */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Base URL
                      </label>
                      <input
                        type="url"
                        value={settings?.baseUrl || ''}
                        onChange={(e) => handleModelChange(backendKey as LlmBackend, 'baseUrl', e.target.value)}
                        placeholder={backend.defaultBaseUrl}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Model */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Model
                      </label>
                      <input
                        type="text"
                        value={settings?.model || ''}
                        onChange={(e) => handleModelChange(backendKey as LlmBackend, 'model', e.target.value)}
                        placeholder={backend.defaultModel}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <p className="mt-2 text-sm text-gray-500">{backend.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* GitHub Tab */}
      {activeTab === 'github' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Code Workspace</h3>
            
            {/* Personal Access Token */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personal Access Token
              </label>
              <input
                type="password"
                value={state.githubWorkspace.personalAccessToken}
                onChange={(e) => handleGitHubChange('personalAccessToken', e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-2 text-sm text-gray-500">
                Required for reading/writing code files. Create one at{' '}
                <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer"
                   className="text-blue-600 hover:underline">
                  GitHub Settings → Personal Access Tokens
                </a>
                {' '}with "repo" scope.
              </p>
            </div>

            {/* Fork Helper */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Quick Fork Setup</h4>
              <p className="text-sm text-gray-600 mb-3">
                Fork the upstream repo to your GitHub account for easy customization:
              </p>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                  {GITHUB_UPSTREAM_DEFAULTS.owner}/{GITHUB_UPSTREAM_DEFAULTS.repo}
                </span>
                <button
                  onClick={forkUpstream}
                  disabled={!state.githubWorkspace.personalAccessToken}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                >
                  Fork to My Account
                </button>
              </div>
            </div>

            {/* Manual Repository Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner
                </label>
                <input
                  type="text"
                  value={state.githubWorkspace.owner}
                  onChange={(e) => handleGitHubChange('owner', e.target.value)}
                  placeholder="your-username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Repository
                </label>
                <input
                  type="text"
                  value={state.githubWorkspace.repo}
                  onChange={(e) => handleGitHubChange('repo', e.target.value)}
                  placeholder="solclaw"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch
                </label>
                <input
                  type="text"
                  value={state.githubWorkspace.branch}
                  onChange={(e) => handleGitHubChange('branch', e.target.value)}
                  placeholder="main"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Status */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Workspace Status</h4>
              <div className="text-sm text-gray-600">
                {state.githubWorkspace.personalAccessToken && state.githubWorkspace.owner && state.githubWorkspace.repo ? (
                  <span className="text-green-600">✅ Ready to edit code files</span>
                ) : (
                  <span className="text-yellow-600">⏳ Complete setup to enable code editing</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
