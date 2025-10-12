"use client";

import React, { useState } from "react";
import { CRMProvider, CRMConfiguration, TestConnectionResponse } from "@/lib/integrations/types";
import { getCRMProvider, getCRMFormFields, getAllCRMProviders } from "@/lib/integrations/crm-providers";
import { ChatwootConfigForm } from "./ChatwootConfigForm";
import { CustomCRMConfigForm } from "./CustomCRMConfigForm";

interface CRMConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, configuration: CRMConfiguration) => Promise<void>;
  existingIntegration?: {
    id: string;
    name: string;
    configuration: CRMConfiguration;
  };
}

export function CRMConfigModal({ isOpen, onClose, onSave, existingIntegration }: CRMConfigModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<CRMProvider>(
    existingIntegration?.configuration.provider || 'CHATWOOT'
  );
  const [integrationName, setIntegrationName] = useState(existingIntegration?.name || '');
  const [configuration, setConfiguration] = useState<Partial<CRMConfiguration>>(
    existingIntegration?.configuration || {}
  );
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<TestConnectionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const providerInfo = getCRMProvider(selectedProvider);
  const allProviders = getAllCRMProviders();

  const handleProviderChange = (provider: CRMProvider) => {
    setSelectedProvider(provider);
    setConfiguration({});
    setTestResult(null);
    setError(null);
  };

  const handleConfigurationChange = (config: Partial<CRMConfiguration>) => {
    setConfiguration(config);
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    setError(null);

    try {
      const response = await fetch('/api/dashboard/integrations/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'CRM',
          configuration: {
            ...configuration,
            provider: selectedProvider,
          },
        }),
      });

      const result = await response.json();
      setTestResult(result);

      if (!result.success) {
        setError(result.error || result.message);
      }
    } catch (err) {
      setError('Failed to test connection');
      setTestResult({
        success: false,
        message: 'Failed to test connection',
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    if (!integrationName.trim()) {
      setError('Integration name is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(integrationName, {
        ...configuration,
        provider: selectedProvider,
      } as CRMConfiguration);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save integration');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50 overflow-y-auto">
      <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {existingIntegration ? 'Edit' : 'Add'} CRM Integration
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-300 text-2xl"
            disabled={isSaving}
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Integration Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-200 mb-2">
              Integration Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={integrationName}
              onChange={(e) => setIntegrationName(e.target.value)}
              className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 focus:border-zinc-500 outline-none px-4 py-3 text-zinc-100"
              placeholder="My Chatwoot Integration"
              disabled={isSaving}
            />
            <p className="text-xs text-zinc-500 mt-1">
              A friendly name to identify this integration
            </p>
          </div>

          {/* CRM Provider Selection */}
          {!existingIntegration && (
            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-2">
                CRM Provider <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {allProviders.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => handleProviderChange(provider.id)}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      selectedProvider === provider.id
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                    }`}
                    disabled={isSaving}
                  >
                    <div className="text-2xl mb-2">{provider.icon}</div>
                    <div className="text-sm font-medium">{provider.name}</div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                {providerInfo.description}
              </p>
            </div>
          )}

          {/* Provider-Specific Configuration Form */}
          <div className="border-t border-zinc-800 pt-6">
            <h3 className="text-lg font-semibold mb-4">
              {providerInfo.name} Configuration
            </h3>
            
            {selectedProvider === 'CHATWOOT' && (
              <ChatwootConfigForm
                configuration={configuration}
                onChange={handleConfigurationChange}
                disabled={isSaving}
              />
            )}
            
            {selectedProvider === 'CUSTOM' && (
              <CustomCRMConfigForm
                configuration={configuration}
                onChange={handleConfigurationChange}
                disabled={isSaving}
              />
            )}
            
            {!['CHATWOOT', 'CUSTOM'].includes(selectedProvider) && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
                <p className="text-yellow-400 text-sm">
                  🚧 {providerInfo.name} integration is coming soon!
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Test Result */}
          {testResult && (
            <div className={`border rounded-2xl p-4 ${
              testResult.success
                ? 'bg-green-500/10 border-green-500/20'
                : 'bg-red-500/10 border-red-500/20'
            }`}>
              <p className={`text-sm font-medium mb-2 ${
                testResult.success ? 'text-green-400' : 'text-red-400'
              }`}>
                {testResult.success ? '✓ ' : '✗ '}{testResult.message}
              </p>
              {testResult.details && testResult.success && (
                <div className="text-xs text-zinc-400 space-y-1">
                  {testResult.details.accountInfo && (
                    <p>Account: {testResult.details.accountInfo.name || testResult.details.accountInfo.id}</p>
                  )}
                  {testResult.details.features && (
                    <p>Features: {testResult.details.features.join(', ')}</p>
                  )}
                </div>
              )}
              {testResult.error && (
                <p className="text-xs text-red-400 mt-2">{testResult.error}</p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-between gap-3">
          <button
            onClick={handleTestConnection}
            disabled={isTesting || isSaving || !['CHATWOOT', 'CUSTOM'].includes(selectedProvider)}
            className="px-6 py-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTesting ? 'Testing...' : 'Test Connection'}
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-3 bg-zinc-700 text-zinc-300 rounded-2xl hover:bg-zinc-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !integrationName.trim() || !['CHATWOOT', 'CUSTOM'].includes(selectedProvider)}
              className="px-6 py-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : (existingIntegration ? 'Update' : 'Save') + ' Integration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

