import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { LLM_BACKENDS } from '@/lib/llmBackends';
import { GITHUB_UPSTREAM_DEFAULTS } from '@/lib/githubUpstreamDefaults';
import { createGitHubFork } from '@/lib/githubApi';

export function SetupPanel() {
  const {
    pumpPortalApiKey, setPumpPortalApiKey,
    tradingWalletSecret, setTradingWalletSecret,
    modelSettings, setModelSettings,
    githubSettings, setGitHubSettings,
  } = useAppContext();

  // Helius settings with localStorage persistence
  const [heliusApiKey, setHeliusApiKey] = useState(() => {
    return localStorage.getItem('heliusApiKey') || '';
  });

  const [heliusRpcUrl, setHeliusRpcUrl] = useState(() => {
    return localStorage.getItem('heliusRpcUrl') || 'https://mainnet.helius-rpc.com/';
  });

  // Persist Helius settings to localStorage
  useEffect(() => {
    localStorage.setItem('heliusApiKey', heliusApiKey);
  }, [heliusApiKey]);

  useEffect(() => {
    localStorage.setItem('heliusRpcUrl', heliusRpcUrl);
  }, [heliusRpcUrl]);

  const [isCreatingFork, setIsCreatingFork] = useState(false);
  const [forkResult, setForkResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleCreateFork = async () => {
    if (!githubSettings.personalAccessToken) {
      setForkResult({ success: false, message: 'GitHub PAT required to create fork' });
      return;
    }

    setIsCreatingFork(true);
    setForkResult(null);

    try {
      const result = await createGitHubFork(githubSettings.personalAccessToken);
      if (result.success) {
        // Auto-fill the workspace settings with the new fork
        setGitHubSettings(prev => ({
          ...prev,
          owner: result.owner!,
          repo: result.repo!,
        }));
        setForkResult({ success: true, message: `Fork created: ${result.owner}/${result.repo}` });
      } else {
        setForkResult({ success: false, message: result.error || 'Failed to create fork' });
      }
    } catch (error) {
      console.error('Fork creation error:', error);
      setForkResult({ success: false, message: 'Unexpected error creating fork' });
    } finally {
      setIsCreatingFork(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* PumpPortal API */}
      <section>
        <h3 className="text-lg font-semibold mb-2">PumpPortal API</h3>
        <div className="space-y-2">
          <label className="block text-sm font-medium">API Key</label>
          <input
            type="password"
            value={pumpPortalApiKey}
            onChange={(e) => setPumpPortalApiKey(e.target.value)}
            placeholder="Enter PumpPortal API key"
            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
          />
          <p className="text-xs text-gray-600 dark:text-gray-400">
            For WebSocket order book + Lightning transactions. Get from{' '}
            <a href="https://pumpportal.fun" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              pumpportal.fun
            </a>
          </p>
        </div>
      </section>

      {/* Trading Wallet */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Trading Wallet</h3>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Private Key (Base58)</label>
          <input
            type="password"
            value={tradingWalletSecret}
            onChange={(e) => setTradingWalletSecret(e.target.value)}
            placeholder="Enter wallet private key"
            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
          />
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Used for real trading via PumpPortal Lightning. Stored locally in browser only.
          </p>
        </div>
      </section>

      {/* Helius API */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Helius API</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">API Key</label>
            <input
              type="password"
              value={heliusApiKey}
              onChange={(e) => setHeliusApiKey(e.target.value)}
              placeholder="Enter Helius API key"
              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">RPC URL</label>
            <input
              type="text"
              value={heliusRpcUrl}
              onChange={(e) => setHeliusRpcUrl(e.target.value)}
              placeholder="https://mainnet.helius-rpc.com/"
              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            For enhanced token metadata, transaction parsing, and RPC reliability. Get from{' '}
            <a href="https://helius.xyz" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              helius.xyz
            </a>
          </p>
        </div>
      </section>

      {/* LLM Settings */}
      <section>
        <h3 className="text-lg font-semibold mb-2">AI Assistant</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Provider</label>
            <select
              value={modelSettings.provider}
              onChange={(e) => setModelSettings(prev => ({ ...prev, provider: e.target.value as any }))}
              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            >
              {LLM_BACKENDS.map(backend => (
                <option key={backend.id} value={backend.id}>{backend.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Model</label>
            <input
              type="text"
              value={modelSettings.model}
              onChange={(e) => setModelSettings(prev => ({ ...prev, model: e.target.value }))}
              placeholder="e.g. gpt-4, claude-3-sonnet-20240229"
              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">API Key</label>
            <input
              type="password"
              value={modelSettings.apiKey}
              onChange={(e) => setModelSettings(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="Enter API key"
              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Base URL (optional)</label>
            <input
              type="text"
              value={modelSettings.baseUrl}
              onChange={(e) => setModelSettings(prev => ({ ...prev, baseUrl: e.target.value }))}
              placeholder="Custom API endpoint (leave empty for default)"
              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            />
          </div>
        </div>
      </section>

      {/* GitHub Workspace */}
      <section>
        <h3 className="text-lg font-semibold mb-2">GitHub Workspace</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Personal Access Token</label>
            <input
              type="password"
              value={githubSettings.personalAccessToken}
              onChange={(e) => setGitHubSettings(prev => ({ ...prev, personalAccessToken: e.target.value }))}
              placeholder="ghp_..."
              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Needs repo access. Generate at{' '}
              <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                github.com/settings/tokens
              </a>
            </p>
          </div>

          <div className="border rounded-md p-3 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">Quick Setup</span>
              <button
                onClick={handleCreateFork}
                disabled={isCreatingFork || !githubSettings.personalAccessToken}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingFork ? 'Creating...' : 'Fork Default Repo'}
              </button>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Creates a fork of {GITHUB_UPSTREAM_DEFAULTS.owner}/{GITHUB_UPSTREAM_DEFAULTS.repo} in your account
            </p>
            {forkResult && (
              <p className={`text-xs mt-2 ${forkResult.success ? 'text-green-600' : 'text-red-600'}`}>
                {forkResult.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Owner</label>
              <input
                type="text"
                value={githubSettings.owner}
                onChange={(e) => setGitHubSettings(prev => ({ ...prev, owner: e.target.value }))}
                placeholder="username"
                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Repo</label>
              <input
                type="text"
                value={githubSettings.repo}
                onChange={(e) => setGitHubSettings(prev => ({ ...prev, repo: e.target.value }))}
                placeholder="repository"
                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Branch</label>
            <input
              type="text"
              value={githubSettings.branch}
              onChange={(e) => setGitHubSettings(prev => ({ ...prev, branch: e.target.value }))}
              placeholder="main"
              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
