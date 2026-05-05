import { useState, useEffect } from 'react'
import { useAppContext } from '@/context/AppContext'
import { LLM_BACKENDS, type LlmBackend } from '@/lib/llmBackends'
import { GITHUB_UPSTREAM_DEFAULTS } from '@/lib/githubUpstreamDefaults'

export function SetupPanel() {
  const {
    pumpPortalApiKey, setPumpPortalApiKey,
    solanaWalletSecret, setSolanaWalletSecret,
    heliusApiKey, setHeliusApiKey,
    modelSettings, setModelSettings,
    githubWorkspace, setGithubWorkspace
  } = useAppContext()

  const [showWalletSecret, setShowWalletSecret] = useState(false)
  const [showHeliusKey, setShowHeliusKey] = useState(false)
  const [githubRepoUrl, setGithubRepoUrl] = useState('')
  const [isForking, setIsForking] = useState(false)

  // Load GitHub repo URL from workspace settings
  useEffect(() => {
    if (githubWorkspace.owner && githubWorkspace.repo) {
      setGithubRepoUrl(`https://github.com/${githubWorkspace.owner}/${githubWorkspace.repo}`)
    }
  }, [githubWorkspace.owner, githubWorkspace.repo])

  const handleForkRepo = async () => {
    if (!githubWorkspace.personalAccessToken) {
      alert('Please set your GitHub Personal Access Token first')
      return
    }

    setIsForking(true)
    try {
      const response = await fetch(`https://api.github.com/repos/${GITHUB_UPSTREAM_DEFAULTS.owner}/${GITHUB_UPSTREAM_DEFAULTS.repo}/forks`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${githubWorkspace.personalAccessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (!response.ok) {
        throw new Error(`Fork failed: ${response.statusText}`)
      }

      const fork = await response.json()
      
      setGithubWorkspace(prev => ({
        ...prev,
        owner: fork.owner.login,
        repo: fork.name
      }))

      setGithubRepoUrl(fork.html_url)
      alert(`Successfully forked to ${fork.full_name}`)
    } catch (error) {
      console.error('Fork error:', error)
      alert(`Failed to fork: ${error.message}`)
    } finally {
      setIsForking(false)
    }
  }

  const selectedBackend = LLM_BACKENDS.find(b => b.id === modelSettings.backend) || LLM_BACKENDS[0]

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Setup</h2>
        <p className="text-gray-600 mb-6">
          Configure your API keys and preferences. All keys are stored locally in your browser.
        </p>
      </div>

      {/* Trading APIs */}
      <section>
        <h3 className="text-lg font-medium mb-4">Trading APIs</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              PumpPortal API Key
              <a 
                href="https://pumpportal.fun/trading-api" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                (Get key)
              </a>
            </label>
            <input
              type="password"
              value={pumpPortalApiKey}
              onChange={(e) => setPumpPortalApiKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter PumpPortal API key..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Solana Wallet Secret (Private Key)
            </label>
            <div className="relative">
              <input
                type={showWalletSecret ? "text" : "password"}
                value={solanaWalletSecret}
                onChange={(e) => setSolanaWalletSecret(e.target.value)}
                className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter private key as base58 string..."
              />
              <button
                type="button"
                onClick={() => setShowWalletSecret(!showWalletSecret)}
                className="absolute right-3 top-2 text-sm text-gray-600 hover:text-gray-800"
              >
                {showWalletSecret ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              For live trading only. Never share this key.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Helius API Key
              <a 
                href="https://www.helius.dev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                (Get key)
              </a>
            </label>
            <div className="relative">
              <input
                type={showHeliusKey ? "text" : "password"}
                value={heliusApiKey}
                onChange={(e) => setHeliusApiKey(e.target.value)}
                className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Helius API key..."
              />
              <button
                type="button"
                onClick={() => setShowHeliusKey(!showHeliusKey)}
                className="absolute right-3 top-2 text-sm text-gray-600 hover:text-gray-800"
              >
                {showHeliusKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              For enhanced transaction data and RPC endpoints.
            </p>
          </div>
        </div>
      </section>

      {/* LLM Settings */}
      <section>
        <h3 className="text-lg font-medium mb-4">AI Assistant</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Backend</label>
            <select
              value={modelSettings.backend}
              onChange={(e) => setModelSettings(prev => ({ ...prev, backend: e.target.value as LlmBackend['id'] }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {LLM_BACKENDS.map(backend => (
                <option key={backend.id} value={backend.id}>{backend.name}</option>
              ))}
            </select>
          </div>

          {selectedBackend.requiresApiKey && (
            <div>
              <label className="block text-sm font-medium mb-2">
                {selectedBackend.name} API Key
                {selectedBackend.apiKeyUrl && (
                  <a 
                    href={selectedBackend.apiKeyUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    (Get key)
                  </a>
                )}
              </label>
              <input
                type="password"
                value={modelSettings.apiKey}
                onChange={(e) => setModelSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Enter ${selectedBackend.name} API key...`}
              />
            </div>
          )}

          {selectedBackend.id === 'ollama' && (
            <div>
              <label className="block text-sm font-medium mb-2">Ollama Base URL</label>
              <input
                type="text"
                value={modelSettings.baseUrl}
                onChange={(e) => setModelSettings(prev => ({ ...prev, baseUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="http://localhost:11434"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Model</label>
            <input
              type="text"
              value={modelSettings.model}
              onChange={(e) => setModelSettings(prev => ({ ...prev, model: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={selectedBackend.defaultModel}
            />
          </div>
        </div>
      </section>

      {/* GitHub Workspace */}
      <section>
        <h3 className="text-lg font-medium mb-4">GitHub Workspace</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Personal Access Token
              <a 
                href="https://github.com/settings/tokens" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                (Create token)
              </a>
            </label>
            <input
              type="password"
              value={githubWorkspace.personalAccessToken}
              onChange={(e) => setGithubWorkspace(prev => ({ ...prev, personalAccessToken: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            />
            <p className="text-xs text-gray-500 mt-1">
              Needs 'repo' scope for reading/writing files.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleForkRepo}
              disabled={!githubWorkspace.personalAccessToken || isForking}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isForking ? 'Forking...' : `Fork ${GITHUB_UPSTREAM_DEFAULTS.owner}/${GITHUB_UPSTREAM_DEFAULTS.repo}`}
            </button>
            <span className="px-4 py-2 text-gray-600">or</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Owner</label>
              <input
                type="text"
                value={githubWorkspace.owner}
                onChange={(e) => setGithubWorkspace(prev => ({ ...prev, owner: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your-username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Repository</label>
              <input
                type="text"
                value={githubWorkspace.repo}
                onChange={(e) => setGithubWorkspace(prev => ({ ...prev, repo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="solclaw"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Branch</label>
            <input
              type="text"
              value={githubWorkspace.branch}
              onChange={(e) => setGithubWorkspace(prev => ({ ...prev, branch: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="main"
            />
          </div>

          {githubRepoUrl && (
            <div className="p-3 bg-green-50 rounded-md">
              <p className="text-sm text-green-800">
                Connected to: <a href={githubRepoUrl} target="_blank" rel="noopener noreferrer" className="font-mono underline">{githubRepoUrl}</a>
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
