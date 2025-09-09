'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ExternalLink, FileText } from 'lucide-react';

interface OnboardResponse {
  slug: string;
  business: string;
  url: string;
  system_message_file: string;
  demo_url: string;
  chatwoot: {
    inbox_id: number;
    website_token: string;
  };
  workflow_id?: string;
  agent_bot?: {
    id: number | string;
    access_token: string;
  };
  bot_setup_skipped?: boolean;
  reason?: string;
  suggested_steps?: string[];
  notes?: {
    chatwoot_bot: string;
    n8n_webhook: string;
    http_nodes_auth: string;
  };
  created_at: string;
}

export default function OnboardPage() {
  const [formData, setFormData] = useState({
    business_url: '',
    business_name: '',
    primary_color: '#0ea5e9',
    secondary_color: '#38bdf8',
    logo_url: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OnboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        business_url: formData.business_url,
        ...(formData.business_name && { business_name: formData.business_name }),
        ...(formData.primary_color && { primary_color: formData.primary_color }),
        ...(formData.secondary_color && { secondary_color: formData.secondary_color }),
        ...(formData.logo_url && { logo_url: formData.logo_url })
      };

      const response = await fetch('/api/onboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Business Demo Onboarding</h1>
          <p className="text-muted-foreground text-lg">
            Create AI-powered demo sites with custom knowledge bases
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Onboard New Business</CardTitle>
            <CardDescription>
              Generate a knowledge base from a website and create a demo landing page with Chatwoot integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="business_url">Business URL *</Label>
                  <Input
                    id="business_url"
                    type="url"
                    placeholder="https://example.com"
                    value={formData.business_url}
                    onChange={(e) => handleInputChange('business_url', e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="business_name">Business Name (optional)</Label>
                  <Input
                    id="business_name"
                    placeholder="Auto-detected from URL"
                    value={formData.business_name}
                    onChange={(e) => handleInputChange('business_name', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="logo_url">Logo URL (optional)</Label>
                  <Input
                    id="logo_url"
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={formData.logo_url}
                    onChange={(e) => handleInputChange('logo_url', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="primary_color"
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={formData.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={formData.secondary_color}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={formData.secondary_color}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Demo...
                  </>
                ) : (
                  'Create Business Demo'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Demo Created Successfully!</CardTitle>
              <CardDescription>
                Your business demo has been generated and is ready for testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Business</Label>
                  <p className="font-mono">{result.business}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Slug</Label>
                  <p className="font-mono">{result.slug}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Chatwoot Inbox ID</Label>
                  <p className="font-mono">{result.chatwoot.inbox_id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Website Token</Label>
                  <p className="font-mono text-xs">{result.chatwoot.website_token}</p>
                </div>
                {result.workflow_id && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">n8n Workflow ID</Label>
                    <p className="font-mono">{result.workflow_id}</p>
                  </div>
                )}
                {result.agent_bot && (
                  <>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Agent Bot ID</Label>
                      <p className="font-mono">{result.agent_bot.id}</p>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium text-muted-foreground">Bot Access Token</Label>
                      <p className="font-mono text-xs break-all">{result.agent_bot.access_token}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Demo URL</Label>
                <div className="flex items-center gap-2">
                  <p className="font-mono flex-1">{result.demo_url}</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href={result.demo_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open Demo
                    </a>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">System Message File</Label>
                <div className="flex items-center gap-2">
                  <p className="font-mono flex-1">{result.system_message_file}</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href={result.system_message_file} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-4 w-4 mr-1" />
                      View File
                    </a>
                  </Button>
                </div>
              </div>

              {result.bot_setup_skipped && (
                <Alert>
                  <AlertDescription>
                    <strong>Bot Setup Skipped:</strong> {result.reason}
                    <br />
                    <strong>Manual Steps:</strong> {result.suggested_steps?.join(', ')}
                    {result.agent_bot && (
                      <div className="mt-2">
                        <strong>Note:</strong> Agent bot was created (ID: {result.agent_bot.id}) but assignment to inbox failed. 
                        You can manually assign it in the Chatwoot admin interface.
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {result.notes && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium mb-2 text-green-800">Automation Success:</h4>
                  <div className="space-y-2 text-sm text-green-700">
                    <p><strong>Chatwoot Bot:</strong> {result.notes.chatwoot_bot}</p>
                    <p><strong>n8n Webhook:</strong> {result.notes.n8n_webhook}</p>
                    <p><strong>HTTP Authentication:</strong> {result.notes.http_nodes_auth}</p>
                  </div>
                </div>
              )}

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Next Steps:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  {result.workflow_id ? (
                    <>
                      <li>✅ n8n workflow "{result.business}" has been automatically created</li>
                      <li>✅ System message has been injected into the Main AI node</li>
                      <li>✅ Webhook path set to "{result.slug}"</li>
                      <li>✅ Chatwoot bot created and assigned to inbox</li>
                      <li>Test the demo URL to ensure the chat widget works end-to-end</li>
                    </>
                  ) : (
                    <>
                      <li>Duplicate the Main n8n workflow in the n8n UI</li>
                      <li>Name the new workflow "{result.business}"</li>
                      <li>Open the "Main AI" node and paste the system message content</li>
                      <li>Test the demo URL to ensure the chat widget works end-to-end</li>
                    </>
                  )}
                </ol>
              </div>

              <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
                <strong>Raw JSON Response:</strong>
                <pre className="mt-2 whitespace-pre-wrap font-mono">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
