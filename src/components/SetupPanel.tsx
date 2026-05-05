import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { resolveLlmApiUrl } from '@/lib/llmDevProxy';
import { LLM_BACKENDS } from '@/lib/llmBackends';
import { GITHUB_UPSTREAM_DEFAULTS } from '@/lib/githubUpstreamDefaults';

export function SetupPanel() {
  const { 
    pumpPortalApiKey, setPumpPortalApiKey,
    tradingWalletSecret, setTradingWalletSecret,
    heliusApiKey, setHeliusApiKey,
    modelSettings, setModelSettings,
    githubWorkspace, setGithubWorkspace 
  } = useAppContext();

  const handleForkRepo = async () => {
    if (!githubWorkspace.personalAccessToken) {
      alert('Please set your GitHub Personal Access Token first');
      return;
    }

    try {
      const response = await fetch(resolveLlmApiUrl(`https://api.github.com/repos/${GITHUB_UPSTREAM_DEFAULTS.owner}/${GITHUB_UPSTREAM_DEFAULTS.repo}/forks`), {
        method: 'POST',
        headers: {
          'Authorization': `token ${githubWorkspace.personalAccessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error(`Fork failed: ${response.status}`);
      }

      const fork = await response.json();
      setGithubWorkspace(prev => ({
        ...prev,
        owner: fork.owner.login,
        repo: fork.name,
      }));

      alert(`Successfully forked to ${fork.owner.login}/${fork.name}`);
    } catch (error) {
      alert(`Fork failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Data & Trading</h3>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            PumpPortal API Key
          </label>
          <input
            type="password"
            value={pumpPortalApiKey}
            onChange={(e) => setPumpPortalApiKey(e.target.value)}
            placeholder="Your PumpPortal API key"
            className="w-full px-3 py-2 border rounded-md"
          />
          <p className="text-xs text-gray-600 mt-1">
            For live order book WebSocket stream
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Helius API Key
          </label>
          <input
            type="password"
            value={heliusApiKey}
            onChange={(e) => setHeliusApiKey(e.target.value)}
            placeholder="Your Helius API key"
            className="w-full px-3 py-2 border rounded-md"
          />
          <p className="text-xs text-gray-600 mt-1">
            For reliable Solana RPC and token data (recommended)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Trading Wallet Secret (Base58)
          </label>
          <input
            type="password"
            value={tradingWalletSecret}
            onChange={(e) => setTradingWalletSecret(e.target.value)}
            placeholder="Your Solana wallet private key"
            className="w-full px-3 py-2 border rounded-md"
          />
          <p className="text-xs text-gray-600 mt-1">
            Stored locally. Used for paper simulation and live trading.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">LLM Backend</h3>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Provider
          </label>
          <select
            value={modelSettings.provider}
            onChange={(e) => setModelSettings(prev => ({ 
              ...prev, 
              provider: e.target.value as any 
            }))}
            className="w-full px-3 py-2 border rounded-md"
          >
            {LLM_BACKENDS.map(backend => (
              <option key={backend.provider} value={backend.provider}>
                {backend.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            API Key
          </label>
          <input
            type="password"
            value={modelSettings.apiKey}
            onChange={(e) => setModelSettings(prev => ({ 
              ...prev, 
              apiKey: e.target.value 
            }))}
            placeholder="Your LLM API key"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Model
          </label>
          <input
            value={modelSettings.model}
            onChange={(e) => setModelSettings(prev => ({ 
              ...prev, 
              model: e.target.value 
            }))}
            placeholder="e.g. gpt-4o, claude-3-5-sonnet-20241022"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Base URL
          </label>
          <input
            value={modelSettings.baseUrl}
            onChange={(e) => setModelSettings(prev => ({ 
              ...prev, 
              baseUrl: e.target.value 
            }))}
            placeholder="Custom API endpoint (optional)"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">GitHub Workspace</h3>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Personal Access Token
          </label>
          <input
            type="password"
            value={githubWorkspace.personalAccessToken}
            onChange={(e) => setGithubWorkspace(prev => ({ 
              ...prev, 
              personalAccessToken: e.target.value 
            }))}
            placeholder="ghp_..."
            className="w-full px-3 py-2 border rounded-md"
          />
          <p className="text-xs text-gray-600 mt-1">
            Needs 'repo' scope for private repos, 'public_repo' for public
          </p>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              Owner
            </label>
            <input
              value={githubWorkspace.owner}
              onChange={(e) => setGithubWorkspace(prev => ({ 
                ...prev, 
                owner: e.target.value 
              }))}
              placeholder="your-username"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              Repo
            </label>
            <input
              value={githubWorkspace.repo}
              onChange={(e) => setGithubWorkspace(prev => ({ 
                ...prev, 
                repo: e.target.value 
              }))}
              placeholder="solclaw"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Branch
          </label>
          <input
            value={githubWorkspace.branch}
            onChange={(e) => setGithubWorkspace(prev => ({ 
              ...prev, 
              branch: e.target.value 
            }))}
            placeholder="main"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <button
          onClick={handleForkRepo}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Fork upstream repo
        </button>
        <p className="text-xs text-gray-600">
          Creates a fork of {GITHUB_UPSTREAM_DEFAULTS.owner}/{GITHUB_UPSTREAM_DEFAULTS.repo} 
          and auto-fills owner/repo fields above
        </p>
      </div>
    </div>
  );
}
