import { useState } from 'react'
import { useAppContext } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, ExternalLink, GitFork, Check } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function SetupPanel() {
  const { 
    pumpPortalApiKey, 
    setPumpPortalApiKey,
    heliusApiKey,
    setHeliusApiKey,
    tradingWalletSecret,
    setTradingWalletSecret,
    modelSettings,
    setModelSettings,
    githubWorkspace,
    setGithubWorkspace
  } = useAppContext()
  
  const [showPumpPortalKey, setShowPumpPortalKey] = useState(false)
  const [showWalletSecret, setShowWalletSecret] = useState(false)
  const [showHeliusKey, setShowHeliusKey] = useState(false)
  const [showLlmKey, setShowLlmKey] = useState(false)
  const [showGithubToken, setShowGithubToken] = useState(false)

  const isSetupComplete = () => {
    return !!(
      pumpPortalApiKey &&
      tradingWalletSecret &&
      modelSettings.apiKey &&
      githubWorkspace.personalAccessToken &&
      githubWorkspace.owner &&
      githubWorkspace.repo
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Setup</h2>
        <p className="text-muted-foreground">
          Configure your trading workspace. All keys are stored locally in your browser.
        </p>
      </div>

      {!isSetupComplete() && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Complete all required sections below to unlock full trading features.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="trading" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="llm">AI Assistant</TabsTrigger>
          <TabsTrigger value="github">GitHub</TabsTrigger>
        </TabsList>

        <TabsContent value="trading">
          <Card>
            <CardHeader>
              <CardTitle>Trading Configuration</CardTitle>
              <CardDescription>
                Set up your PumpPortal API key and trading wallet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pumpportal-key">
                  PumpPortal API Key *
                  <a 
                    href="https://pumpportal.fun" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    <ExternalLink className="h-3 w-3 inline" />
                  </a>
                </Label>
                <div className="relative">
                  <Input
                    id="pumpportal-key"
                    type={showPumpPortalKey ? "text" : "password"}
                    value={pumpPortalApiKey}
                    onChange={(e) => setPumpPortalApiKey(e.target.value)}
                    placeholder="Your PumpPortal API key"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPumpPortalKey(!showPumpPortalKey)}
                  >
                    {showPumpPortalKey ? "Hide" : "Show"}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wallet-secret">
                  Trading Wallet Secret Key *
                  <span className="text-sm text-muted-foreground ml-2">
                    (Base58 format, for signing transactions)
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    id="wallet-secret"
                    type={showWalletSecret ? "text" : "password"}
                    value={tradingWalletSecret}
                    onChange={(e) => setTradingWalletSecret(e.target.value)}
                    placeholder="Your wallet's secret key (base58)"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowWalletSecret(!showWalletSecret)}
                  >
                    {showWalletSecret ? "Hide" : "Show"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Used for real trading mode. Keep this secure and never share it.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data Sources</CardTitle>
              <CardDescription>
                Configure external data providers for enhanced chart data and analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="helius-key">
                  Helius API Key (Optional)
                  <a 
                    href="https://helius.dev" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    <ExternalLink className="h-3 w-3 inline" />
                  </a>
                </Label>
                <div className="relative">
                  <Input
                    id="helius-key"
                    type={showHeliusKey ? "text" : "password"}
                    value={heliusApiKey}
                    onChange={(e) => setHeliusApiKey(e.target.value)}
                    placeholder="Your Helius API key"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowHeliusKey(!showHeliusKey)}
                  >
                    {showHeliusKey ? "Hide" : "Show"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enhanced RPC access for better chart data, transaction history, and token metadata.
                  Fallback to free RPC if not provided.
                </p>
              </div>

              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="text-sm space-y-1">
                  <div className="font-medium">Current Status:</div>
                  <div className="text-muted-foreground">
                    Helius API: {heliusApiKey ? '✅ Configured' : '❌ Not configured (using free RPC)'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="llm">
          <Card>
            <CardHeader>
              <CardTitle>AI Assistant</CardTitle>
              <CardDescription>
                Configure your preferred AI model for trading assistance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="llm-provider">Model Provider</Label>
                <select
                  id="llm-provider"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={modelSettings.provider}
                  onChange={(e) => setModelSettings({
                    ...modelSettings,
                    provider: e.target.value as 'openai' | 'anthropic'
                  })}
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="llm-model">Model</Label>
                <Input
                  id="llm-model"
                  value={modelSettings.model}
                  onChange={(e) => setModelSettings({
                    ...modelSettings,
                    model: e.target.value
                  })}
                  placeholder="e.g., gpt-4o, claude-3-5-sonnet-20241022"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="llm-api-key">
                  API Key *
                  <a 
                    href={modelSettings.provider === 'openai' ? 'https://platform.openai.com/api-keys' : 'https://console.anthropic.com/'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    <ExternalLink className="h-3 w-3 inline" />
                  </a>
                </Label>
                <div className="relative">
                  <Input
                    id="llm-api-key"
                    type={showLlmKey ? "text" : "password"}
                    value={modelSettings.apiKey}
                    onChange={(e) => setModelSettings({
                      ...modelSettings,
                      apiKey: e.target.value
                    })}
                    placeholder="Your API key"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowLlmKey(!showLlmKey)}
                  >
                    {showLlmKey ? "Hide" : "Show"}
                  </Button>
                </div>
              </div>

              {modelSettings.provider === 'openai' && (
                <div className="space-y-2">
                  <Label htmlFor="llm-base-url">Base URL (Optional)</Label>
                  <Input
                    id="llm-base-url"
                    value={modelSettings.baseUrl || ''}
                    onChange={(e) => setModelSettings({
                      ...modelSettings,
                      baseUrl: e.target.value || ''
                    })}
                    placeholder="https://api.openai.com/v1"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty for default OpenAI endpoint
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="github">
          <Card>
            <CardHeader>
              <CardTitle>GitHub Workspace</CardTitle>
              <CardDescription>
                Connect to your GitHub fork for live code editing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="github-pat">
                  Personal Access Token *
                  <a 
                    href="https://github.com/settings/tokens" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    <ExternalLink className="h-3 w-3 inline" />
                  </a>
                </Label>
                <div className="relative">
                  <Input
                    id="github-pat"
                    type={showGithubToken ? "text" : "password"}
                    value={githubWorkspace.personalAccessToken}
                    onChange={(e) => setGithubWorkspace({
                      ...githubWorkspace,
                      personalAccessToken: e.target.value
                    })}
                    placeholder="ghp_..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowGithubToken(!showGithubToken)}
                  >
                    {showGithubToken ? "Hide" : "Show"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Needs 'repo' scope for reading/writing files
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="github-owner">Owner</Label>
                  <Input
                    id="github-owner"
                    value={githubWorkspace.owner}
                    onChange={(e) => setGithubWorkspace({
                      ...githubWorkspace,
                      owner: e.target.value
                    })}
                    placeholder="your-username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="github-repo">Repository</Label>
                  <Input
                    id="github-repo"
                    value={githubWorkspace.repo}
                    onChange={(e) => setGithubWorkspace({
                      ...githubWorkspace,
                      repo: e.target.value
                    })}
                    placeholder="repo-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="github-branch">Branch</Label>
                  <Input
                    id="github-branch"
                    value={githubWorkspace.branch}
                    onChange={(e) => setGithubWorkspace({
                      ...githubWorkspace,
                      branch: e.target.value
                    })}
                    placeholder="main"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isSetupComplete() && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Setup complete! You can now access all trading features.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
