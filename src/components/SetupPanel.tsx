import { useState } from 'react'
import { useAppContext } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, ExternalLink, GitFork, Check } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LLM_BACKENDS } from '@/lib/llmBackends'
import { GITHUB_UPSTREAM_DEFAULTS } from '@/lib/githubUpstreamDefaults'

export function SetupPanel() {
  const { state, dispatch } = useAppContext()
  const [showPumpPortalKey, setShowPumpPortalKey] = useState(false)
  const [showWalletSecret, setShowWalletSecret] = useState(false)
  const [showHeliusKey, setShowHeliusKey] = useState(false)
  const [forkStatus, setForkStatus] = useState<'idle' | 'forking' | 'success' | 'error'>('idle')

  const handleForkRepo = async () => {
    setForkStatus('forking')
    try {
      if (!state.github.personalAccessToken) {
        throw new Error('GitHub Personal Access Token is required')
      }

      const response = await fetch(`https://api.github.com/repos/${GITHUB_UPSTREAM_DEFAULTS.owner}/${GITHUB_UPSTREAM_DEFAULTS.repo}/forks`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${state.github.personalAccessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const forkData = await response.json()
      
      // Auto-populate the GitHub settings with the new fork
      dispatch({
        type: 'UPDATE_GITHUB',
        payload: {
          owner: forkData.owner.login,
          repo: forkData.name,
          branch: 'main'
        }
      })
      
      setForkStatus('success')
    } catch (error) {
      console.error('Fork failed:', error)
      setForkStatus('error')
    }
  }

  const isSetupComplete = () => {
    return !!(
      state.pumpPortal.apiKey &&
      state.wallet.secretKey &&
      state.llm.apiKey &&
      state.github.personalAccessToken &&
      state.github.owner &&
      state.github.repo
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
            Complete all sections below to unlock full trading features.
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
                  PumpPortal API Key
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
                    value={state.pumpPortal.apiKey}
                    onChange={(e) => dispatch({
                      type: 'UPDATE_PUMPPORTAL',
                      payload: { apiKey: e.target.value }
                    })}
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
                  Trading Wallet Secret Key
                  <span className="text-sm text-muted-foreground ml-2">
                    (Base58 format, for signing transactions)
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    id="wallet-secret"
                    type={showWalletSecret ? "text" : "password"}
                    value={state.wallet.secretKey}
                    onChange={(e) => dispatch({
                      type: 'UPDATE_WALLET',
                      payload: { secretKey: e.target.value }
                    })}
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
                Configure external data providers for enhanced chart data
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
                    value={state.helius?.apiKey || ''}
                    onChange={(e) => dispatch({
                      type: 'UPDATE_HELIUS',
                      payload: { apiKey: e.target.value }
                    })}
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
                  Enhanced RPC access for better chart data and transaction history.
                </p>
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
                <Label htmlFor="llm-backend">Model Provider</Label>
                <select
                  id="llm-backend"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={state.llm.backend}
                  onChange={(e) => dispatch({
                    type: 'UPDATE_LLM',
                    payload: { backend: e.target.value as any }
                  })}
                >
                  {Object.entries(LLM_BACKENDS).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="llm-model">Model</Label>
                <Input
                  id="llm-model"
                  value={state.llm.model}
                  onChange={(e) => dispatch({
                    type: 'UPDATE_LLM',
                    payload: { model: e.target.value }
                  })}
                  placeholder="e.g., gpt-4, claude-3-sonnet"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="llm-api-key">
                  API Key
                  <a 
                    href={LLM_BACKENDS[state.llm.backend]?.signupUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    <ExternalLink className="h-3 w-3 inline" />
                  </a>
                </Label>
                <Input
                  id="llm-api-key"
                  type="password"
                  value={state.llm.apiKey}
                  onChange={(e) => dispatch({
                    type: 'UPDATE_LLM',
                    payload: { apiKey: e.target.value }
                  })}
                  placeholder="Your API key"
                />
              </div>

              {state.llm.backend === 'openai' && (
                <div className="space-y-2">
                  <Label htmlFor="llm-base-url">Base URL (Optional)</Label>
                  <Input
                    id="llm-base-url"
                    value={state.llm.baseUrl || ''}
                    onChange={(e) => dispatch({
                      type: 'UPDATE_LLM',
                      payload: { baseUrl: e.target.value || undefined }
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
                  Personal Access Token
                  <a 
                    href="https://github.com/settings/tokens" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    <ExternalLink className="h-3 w-3 inline" />
                  </a>
                </Label>
                <Input
                  id="github-pat"
                  type="password"
                  value={state.github.personalAccessToken}
                  onChange={(e) => dispatch({
                    type: 'UPDATE_GITHUB',
                    payload: { personalAccessToken: e.target.value }
                  })}
                  placeholder="ghp_..."
                />
                <p className="text-xs text-muted-foreground">
                  Needs 'repo' scope for reading/writing files
                </p>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-4 mb-4">
                  <h4 className="font-semibold">Repository</h4>
                  <Button
                    onClick={handleForkRepo}
                    disabled={!state.github.personalAccessToken || forkStatus === 'forking'}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {forkStatus === 'forking' ? (
                      "Forking..."
                    ) : forkStatus === 'success' ? (
                      <>
                        <Check className="h-4 w-4" />
                        Forked!
                      </>
                    ) : (
                      <>
                        <GitFork className="h-4 w-4" />
                        Quick Fork
                      </>
                    )}
                  </Button>
                </div>

                {forkStatus === 'error' && (
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Failed to create fork. Check your token permissions and try again.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="github-owner">Owner</Label>
                    <Input
                      id="github-owner"
                      value={state.github.owner}
                      onChange={(e) => dispatch({
                        type: 'UPDATE_GITHUB',
                        payload: { owner: e.target.value }
                      })}
                      placeholder="your-username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="github-repo">Repository</Label>
                    <Input
                      id="github-repo"
                      value={state.github.repo}
                      onChange={(e) => dispatch({
                        type: 'UPDATE_GITHUB',
                        payload: { repo: e.target.value }
                      })}
                      placeholder="repo-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="github-branch">Branch</Label>
                    <Input
                      id="github-branch"
                      value={state.github.branch}
                      onChange={(e) => dispatch({
                        type: 'UPDATE_GITHUB',
                        payload: { branch: e.target.value }
                      })}
                      placeholder="main"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isSetupComplete() && (
        <Alert>
          <Check className="h-4 w-4" />
          <AlertDescription>
            Setup complete! You can now access all trading features.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
