import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { validateLlmSettings } from '@/lib/llmBackends';
import { getGitHubUpstreamDefaults } from '@/lib/githubUpstreamDefaults';

export function SetupPanel() {
  const { state, dispatch } = useAppContext();
  
  // Local state for form inputs
  const [pumpPortalApiKey, setPumpPortalApiKey] = useState('');
  const [walletSecret, setWalletSecret] = useState('');
  const [heliusApiKey, setHeliusApiKey] = useState('');
  const [llmApiKey, setLlmApiKey] = useState('');
  const [llmProvider, setLlmProvider] = useState('anthropic');
  const [llmModel, setLlmModel] = useState('claude-3-5-sonnet-20241022');
  const [githubPat, setGithubPat] = useState('');
  const [githubOwner, setGithubOwner] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [githubBranch, setGithubBranch] = useState('main');
  
  const [showWalletSecret, setShowWalletSecret] = useState(false);
  const [showPumpPortalKey, setShowPumpPortalKey] = useState(false);
  const [showHeliusKey, setShowHeliusKey] = useState(false);
  const [showLlmKey, setShowLlmKey] = useState(false);
  const [showGithubPat, setShowGithubPat] = useState(false);

  // Load saved values on component mount
  useEffect(() => {
    try {
      const savedPumpPortalKey = localStorage.getItem('pumpPortalApiKey') || '';
      const savedWalletSecret = localStorage.getItem('walletSecret') || '';
      const savedHeliusKey = localStorage.getItem('heliusApiKey') || '';
      const savedLlmKey = localStorage.getItem('llmApiKey') || '';
      const savedLlmProvider = localStorage.getItem('llmProvider') || 'anthropic';
      const savedLlmModel = localStorage.getItem('llmModel') || 'claude-3-5-sonnet-20241022';
      const savedGithubPat = localStorage.getItem('githubPat') || '';
      const savedGithubOwner = localStorage.getItem('githubOwner') || '';
      const savedGithubRepo = localStorage.getItem('githubRepo') || '';
      const savedGithubBranch = localStorage.getItem('githubBranch') || 'main';
      
      setPumpPortalApiKey(savedPumpPortalKey);
      setWalletSecret(savedWalletSecret);
      setHeliusApiKey(savedHeliusKey);
      setLlmApiKey(savedLlmKey);
      setLlmProvider(savedLlmProvider);
      setLlmModel(savedLlmModel);
      setGithubPat(savedGithubPat);
      setGithubOwner(savedGithubOwner);
      setGithubRepo(savedGithubRepo);
      setGithubBranch(savedGithubBranch);

      // Update app context with saved values
      dispatch({
        type: 'SET_GITHUB_WORKSPACE',
        payload: {
          pat: savedGithubPat,
          owner: savedGithubOwner,
          repo: savedGithubRepo,
          branch: savedGithubBranch,
        },
      });

      dispatch({
        type: 'SET_MODEL_SETTINGS',
        payload: {
          provider: savedLlmProvider as any,
          model: savedLlmModel,
          apiKey: savedLlmKey,
        },
      });
    } catch (error) {
      console.error('Error loading saved settings:', error);
    }
  }, [dispatch]);

  const handlePumpPortalKeySave = () => {
    try {
      localStorage.setItem('pumpPortalApiKey', pumpPortalApiKey);
      console.log('PumpPortal API key saved');
    } catch (error) {
      console.error('Error saving PumpPortal API key:', error);
    }
  };

  const handleWalletSecretSave = () => {
    try {
      localStorage.setItem('walletSecret', walletSecret);
      console.log('Wallet secret saved');
    } catch (error) {
      console.error('Error saving wallet secret:', error);
    }
  };

  const handleHeliusKeySave = () => {
    try {
      localStorage.setItem('heliusApiKey', heliusApiKey);
      console.log('Helius API key saved');
    } catch (error) {
      console.error('Error saving Helius API key:', error);
    }
  };

  const handleLlmSettingsSave = () => {
    try {
      localStorage.setItem('llmApiKey', llmApiKey);
      localStorage.setItem('llmProvider', llmProvider);
      localStorage.setItem('llmModel', llmModel);
      
      dispatch({
        type: 'SET_MODEL_SETTINGS',
        payload: {
          provider: llmProvider as any,
          model: llmModel,
          apiKey: llmApiKey,
        },
      });
      
      console.log('LLM settings saved');
    } catch (error) {
      console.error('Error saving LLM settings:', error);
    }
  };

  const handleGithubSettingsSave = () => {
    try {
      localStorage.setItem('githubPat', githubPat);
      localStorage.setItem('githubOwner', githubOwner);
      localStorage.setItem('githubRepo', githubRepo);
      localStorage.setItem('githubBranch', githubBranch);
      
      dispatch({
        type: 'SET_GITHUB_WORKSPACE',
        payload: {
          pat: githubPat,
          owner: githubOwner,
          repo: githubRepo,
          branch: githubBranch,
        },
      });
      
      console.log('GitHub settings saved');
    } catch (error) {
      console.error('Error saving GitHub settings:', error);
    }
  };

  const handleForkRepo = () => {
    const upstreamDefaults = getGitHubUpstreamDefaults();
    window.open(`https://github.com/${upstreamDefaults.owner}/${upstreamDefaults.repo}/fork`, '_blank');
  };

  const isLlmValid = validateLlmSettings({
    provider: llmProvider as any,
    model: llmModel,
    apiKey: llmApiKey,
  });

  const isPumpPortalConfigured = pumpPortalApiKey.length > 0;
  const isWalletConfigured = walletSecret.length > 0;
  const isHeliusConfigured = heliusApiKey.length > 0;
  const isGithubConfigured = githubPat.length > 0 && githubOwner.length > 0 && githubRepo.length > 0;

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Setup</h2>
        <p className="text-sm text-muted-foreground">
          Configure API keys and workspace settings
        </p>
      </div>

      {/* PumpPortal Setup */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isPumpPortalConfigured ? 'bg-green-500' : 'bg-red-500'}`} />
          <h3 className="font-medium">PumpPortal Trading</h3>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">API Key</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showPumpPortalKey ? 'text' : 'password'}
                value={pumpPortalApiKey}
                onChange={(e) => setPumpPortalApiKey(e.target.value)}
                placeholder="Paste key…"
                className="unt-input w-full font-mono text-[13px]"
                aria-label="PumpPortal API key"
              />
              <button
                type="button"
                onClick={() => setShowPumpPortalKey(!showPumpPortalKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                {showPumpPortalKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <button
              onClick={handlePumpPortalKeySave}
              className="unt-button-secondary px-3 text-xs"
            >
              Save
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Get your API key at{' '}
            <a href="https://pumpportal.fun" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              pumpportal.fun
            </a>
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Trading Wallet Private Key</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showWalletSecret ? 'text' : 'password'}
                value={walletSecret}
                onChange={(e) => setWalletSecret(e.target.value)}
                placeholder="Paste your PumpPortal trading wallet secret (base58 or JSON byte array)"
                className="unt-input w-full font-mono text-[13px]"
                aria-label="PumpPortal wallet private key"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowWalletSecret(!showWalletSecret)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                {showWalletSecret ? 'Hide' : 'Show'}
              </button>
            </div>
            <button
              onClick={handleWalletSecretSave}
              className="unt-button-secondary px-3 text-xs"
            >
              Save
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Your wallet secret stays in browser localStorage only. Create a dedicated trading wallet.
          </p>
        </div>
      </div>

      {/* Helius Setup */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isHeliusConfigured ? 'bg-green-500' : 'bg-orange-500'}`} />
          <h3 className="font-medium">Helius (Chart Data)</h3>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">API Key</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showHeliusKey ? 'text' : 'password'}
                value={heliusApiKey}
                onChange={(e) => setHeliusApiKey(e.target.value)}
                placeholder="Paste Helius API key…"
                className="unt-input w-full font-mono text-[13px]"
                aria-label="Helius API key"
              />
              <button
                type="button"
                onClick={() => setShowHeliusKey(!showHeliusKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                {showHeliusKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <button
              onClick={handleHeliusKeySave}
              className="unt-button-secondary px-3 text-xs"
            >
              Save
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Get free API key at{' '}
            <a href="https://helius.xyz" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              helius.xyz
            </a>
            {' '}• Enables historical chart data and transaction parsing
          </p>
        </div>
      </div>

      {/* LLM Setup */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isLlmValid ? 'bg-green-500' : 'bg-red-500'}`} />
          <h3 className="font-medium">LLM Assistant</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">Provider</label>
            <select
              value={llmProvider}
              onChange={(e) => setLlmProvider(e.target.value)}
              className="unt-input w-full text-[13px]"
            >
              <option value="anthropic">Anthropic</option>
              <option value="openai">OpenAI</option>
              <option value="openrouter">OpenRouter</option>
              <option value="groq">Groq</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Model</label>
            <input
              type="text"
              value={llmModel}
              onChange={(e) => setLlmModel(e.target.value)}
              placeholder="Model name"
              className="unt-input w-full text-[13px]"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">API Key</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showLlmKey ? 'text' : 'password'}
                value={llmApiKey}
                onChange={(e) => setLlmApiKey(e.target.value)}
                placeholder="API key (Anthropic, OpenAI, OpenRouter, Groq, …)"
                className="unt-input w-full font-mono text-[13px]"
                aria-label="LLM API key"
              />
              <button
                type="button"
                onClick={() => setShowLlmKey(!showLlmKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                {showLlmKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <button
              onClick={handleLlmSettingsSave}
              className="unt-button-secondary px-3 text-xs"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* GitHub Setup */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isGithubConfigured ? 'bg-green-500' : 'bg-red-500'}`} />
          <h3 className="font-medium">GitHub Workspace</h3>
        </div>
        
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={handleForkRepo}
              className="unt-button-primary text-xs px-3 py-1"
            >
              Fork Repository
            </button>
            <span className="text-xs text-muted-foreground flex items-center">
              Create your own copy to edit code
            </span>
          </div>
          
          <label className="block text-sm font-medium">Personal Access Token</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showGithubPat ? 'text' : 'password'}
                value={githubPat}
                onChange={(e) => setGithubPat(e.target.value)}
                placeholder="ghp_… or fine-grained token"
                className="unt-input w-full font-mono text-[13px]"
                aria-label="GitHub personal access token"
              />
              <button
                type="button"
                onClick={() => setShowGithubPat(!showGithubPat)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                {showGithubPat ? 'Hide' : 'Show'}
              </button>
            </div>
            <button
              onClick={handleGithubSettingsSave}
              className="unt-button-secondary px-3 text-xs"
            >
              Save
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">Owner</label>
              <input
                type="text"
                value={githubOwner}
                onChange={(e) => setGithubOwner(e.target.value)}
                placeholder="username"
                className="unt-input w-full text-[13px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Repository</label>
              <input
                type="text"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                placeholder="solclaw"
                className="unt-input w-full text-[13px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Branch</label>
              <input
                type="text"
                value={githubBranch}
                onChange={(e) => setGithubBranch(e.target.value)}
                placeholder="main"
                className="unt-input w-full text-[13px]"
              />
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Create a PAT at{' '}
            <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              github.com/settings/tokens
            </a>
            {' '}with repo permissions
          </p>
        </div>
      </div>
    </div>
  );
}
