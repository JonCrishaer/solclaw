import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { ModelSettings } from '@/types';
import { llmBackends } from '@/lib/llmBackends';
import { githubUpstreamDefaults } from '@/lib/githubUpstreamDefaults';

export function SetupPanel() {
  const { state, dispatch } = useAppContext();
  const {
    pumpPortalApiKey,
    modelSettings,
    solanaWalletSecret,
    githubWorkspace,
    heliusApiKey,
    useHeliusForCandles
  } = state;

  const handlePumpPortalKeyChange = (key: string) => {
    dispatch({ type: 'SET_PUMP_PORTAL_API_KEY', payload: key });
  };

  const handleHeliusKeyChange = (key: string) => {
    dispatch({ type: 'SET_HELIUS_API_KEY', payload: key });
  };

  const handleHeliusToggle = (enabled: boolean) => {
    dispatch({ type: 'SET_USE_HELIUS_FOR_CANDLES', payload: enabled });
  };

  const handleModelSettingsChange = (settings: Partial<ModelSettings>) => {
    dispatch({ 
      type: 'SET_MODEL_SETTINGS', 
      payload: { ...modelSettings, ...settings } 
    });
  };

  const handleWalletSecretChange = (secret: string) => {
    dispatch({ type: 'SET_SOLANA_WALLET_SECRET', payload: secret });
  };

  const handleGithubChange = (field: keyof typeof githubWorkspace, value: string) => {
    dispatch({
      type: 'SET_GITHUB_WORKSPACE',
      payload: { ...githubWorkspace, [field]: value }
    });
  };

  const forkRepo = () => {
    window.open(
      `https://github.com/${githubUpstreamDefaults.owner}/${githubUpstreamDefaults.repo}/fork`,
      '_blank'
    );
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold mb-4">Setup</h2>
      
      {/* Chart Data Source */}
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-3">Chart Data Source</h3>
        
        {/* Helius Option */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <input
              type="checkbox"
              id="useHelius"
              checked={useHeliusForCandles}
              onChange={(e) => handleHeliusToggle(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="useHelius" className="font-medium">
              Use Helius RPC (Recommended)
            </label>
          </div>
          
          {useHeliusForCandles && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Helius API Key
              </label>
              <input
                type="password"
                value={heliusApiKey}
                onChange={(e) => handleHeliusKeyChange(e.target.value)}
                placeholder="Get free key from helius.dev"
                className="w-full px-3 py-2 border rounded-md"
              />
              <p className="text-xs text-gray-600 mt-1">
                Free tier: 100k requests/day. More reliable than Pump API.
              </p>
            </div>
          )}
        </div>

        {/* PumpPortal Fallback */}
        <div className={useHeliusForCandles ? 'opacity-50' : ''}>
          <label className="block text-sm font-medium mb-2">
            PumpPortal API Key {useHeliusForCandles ? '(Backup)' : ''}
          </label>
          <input
            type="password"
            value={pumpPortalApiKey}
            onChange={(e) => handlePumpPortalKeyChange(e.target.value)}
            placeholder="Get from PumpPortal.fun"
            className="w-full px-3 py-2 border rounded-md"
            disabled={useHeliusForCandles}
          />
          <p className="text-xs text-gray-600 mt-1">
            {useHeliusForCandles 
              ? 'Will be used if Helius fails' 
              : 'Required for live trade data and candles'
            }
          </p>
        </div>
      </div>

      {/* LLM Settings */}
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-3">Algo Assistant (LLM)</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2">Provider</label>
            <select
              value={modelSettings.provider}
              onChange={(e) => handleModelSettingsChange({ 
                provider: e.target.value as 'openai' | 'anthropic' | 'ollama' 
              })}
              className="w-full px-3 py-2 border rounded-md"
            >
              {llmBackends.map(backend => (
                <option key={backend.id} value={backend.id}>
                  {backend.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">API Key</label>
            <input
              type="password"
              value={modelSettings.apiKey}
              onChange={(e) => handleModelSettingsChange({ apiKey: e.target.value })}
              placeholder={`Enter ${modelSettings.provider} API key`}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Model</label>
            <input
              type="text"
              value={modelSettings.model}
              onChange={(e) => handleModelSettingsChange({ model: e.target.value })}
              placeholder="e.g., gpt-4o, claude-3-5-sonnet-20241022"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Solana Wallet */}
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-3">Solana Trading Wallet</h3>
        <label className="block text-sm font-medium mb-2">
          Private Key (Base58)
        </label>
        <input
          type="password"
          value={solanaWalletSecret}
          onChange={(e) => handleWalletSecretChange(e.target.value)}
          placeholder="Your Solana wallet private key"
          className="w-full px-3 py-2 border rounded-md"
        />
        <p className="text-xs text-gray-600 mt-1">
          Stored locally only. Used for paper trading simulation and live trades.
        </p>
      </div>

      {/* GitHub Workspace */}
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-3">GitHub Workspace (Optional)</h3>
        
        <button
          onClick={forkRepo}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Fork Repository
        </button>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2">
              Personal Access Token
            </label>
            <input
              type="password"
              value={githubWorkspace.pat}
              onChange={(e) => handleGithubChange('pat', e.target.value)}
              placeholder="ghp_..."
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">Owner</label>
              <input
                type="text"
                value={githubWorkspace.owner}
                onChange={(e) => handleGithubChange('owner', e.target.value)}
                placeholder="your-username"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Repository</label>
              <input
                type="text"
                value={githubWorkspace.repo}
                onChange={(e) => handleGithubChange('repo', e.target.value)}
                placeholder="solclaw"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Branch</label>
            <input
              type="text"
              value={githubWorkspace.branch}
              onChange={(e) => handleGithubChange('branch', e.target.value)}
              placeholder="main"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
