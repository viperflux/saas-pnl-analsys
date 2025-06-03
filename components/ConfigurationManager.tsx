import React, { useState, useEffect } from 'react';
import { FinancialData } from '@/types';
import { apiClient, ConfigurationData, getSessionId } from '@/lib/apiClient';

interface ConfigurationManagerProps {
  currentConfig: FinancialData;
  currentConfigId?: string;
  onConfigChange: (config: FinancialData, configId?: string) => void;
  onSave: () => void;
}

export default function ConfigurationManager({ 
  currentConfig, 
  currentConfigId, 
  onConfigChange, 
  onSave 
}: ConfigurationManagerProps) {
  const [configurations, setConfigurations] = useState<ConfigurationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [saveAsNew, setSaveAsNew] = useState(false);

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      setIsLoading(true);
      const sessionId = getSessionId();
      const response = await apiClient.fetchConfigurations(sessionId);
      setConfigurations(response.configurations);
      setSessionId(response.sessionId);
      
      // If no current config is selected, use the default/current from server
      if (!currentConfigId && response.currentConfig) {
        onConfigChange(response.currentConfig.config, response.currentConfig.id);
      }
    } catch (error) {
      console.error('Error loading configurations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!saveName.trim()) return;
    
    try {
      setIsSaving(true);
      
      const savedConfig = await apiClient.saveConfiguration(
        currentConfig,
        saveName,
        saveAsNew ? undefined : currentConfigId // Pass undefined to create new config when saving as new
      );
      
      await loadConfigurations();
      onConfigChange(currentConfig, savedConfig.id);
      onSave();
      
      setShowSaveDialog(false);
      setSaveName('');
      setSaveDescription('');
      setSaveAsNew(false);
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Failed to save configuration. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoad = async (configId: string) => {
    try {
      const config = await apiClient.getConfiguration(configId);
      onConfigChange(config.config, config.id);
      setShowLoadDialog(false);
    } catch (error) {
      console.error('Error loading configuration:', error);
      alert('Failed to load configuration. Please try again.');
    }
  };

  const handleDelete = async (configId: string) => {
    if (!confirm('Are you sure you want to delete this configuration?')) return;
    
    try {
      await apiClient.deleteConfiguration(configId);
      await loadConfigurations();
      
      // If deleted config was current, switch to default
      if (configId === currentConfigId) {
        const defaultConfig = configurations.find(c => c.isDefault) || configurations[0];
        if (defaultConfig) {
          onConfigChange(defaultConfig.config, defaultConfig.id);
        }
      }
    } catch (error) {
      console.error('Error deleting configuration:', error);
      alert('Failed to delete configuration. Please try again.');
    }
  };

  const handleQuickSave = async () => {
    if (!currentConfigId) {
      setShowSaveDialog(true);
      setSaveAsNew(false);
      return;
    }
    
    try {
      setIsSaving(true);
      await apiClient.updateConfiguration(currentConfigId, { config: currentConfig });
      onSave();
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Failed to save configuration. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAs = () => {
    setSaveAsNew(true);
    setShowSaveDialog(true);
    setSaveName(currentConfigId ? `${configurations.find(c => c.id === currentConfigId)?.name || 'Configuration'} Copy` : '');
  };

  const currentConfigName = configurations.find(c => c.id === currentConfigId)?.name || 'Unsaved Configuration';

  return (
    <div className="flex items-center space-x-3">
      {/* Current Configuration Display */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">Current:</span>
        <span className="font-medium text-gray-900 dark:text-gray-100">{currentConfigName}</span>
        {!currentConfigId && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
            Unsaved
          </span>
        )}
      </div>

      {/* Quick Save Button */}
      <button
        onClick={handleQuickSave}
        disabled={isSaving}
        className="btn-secondary"
        title={currentConfigId ? "Save changes" : "Save as new configuration"}
      >
        {isSaving ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
            Saving...
          </div>
        ) : (
          '💾 Save'
        )}
      </button>

      {/* Save As Button */}
      <button
        onClick={handleSaveAs}
        className="btn-secondary"
        title="Save as new configuration"
      >
        📝 Save As
      </button>

      {/* Load Button */}
      <button
        onClick={() => setShowLoadDialog(true)}
        className="btn-secondary"
        title="Load saved configuration"
      >
        📂 Load
      </button>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {saveAsNew ? 'Save As New Configuration' : 'Save Configuration'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">Configuration Name</label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={saveAsNew ? "Enter new configuration name" : "Enter configuration name"}
                  autoFocus
                />
              </div>
              <div>
                <label className="form-label">Description (Optional)</label>
                <textarea
                  value={saveDescription}
                  onChange={(e) => setSaveDescription(e.target.value)}
                  className="form-input"
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setSaveName('');
                  setSaveDescription('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!saveName.trim() || isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : (saveAsNew ? 'Save As New' : 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Load Configuration
            </h3>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading configurations...</p>
              </div>
            ) : configurations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No saved configurations found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {configurations.map((config) => (
                  <div
                    key={config.id}
                    className={`p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      config.id === currentConfigId
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {config.name}
                          </h4>
                          {config.isDefault && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                              Default
                            </span>
                          )}
                          {config.id === currentConfigId && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                              Current
                            </span>
                          )}
                        </div>
                        {config.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {config.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          Updated: {new Date(config.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleLoad(config.id)}
                          disabled={config.id === currentConfigId}
                          className="text-sm px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Load
                        </button>
                        {!config.isDefault && (
                          <button
                            onClick={() => handleDelete(config.id)}
                            className="text-sm px-3 py-1 bg-danger-600 text-white rounded hover:bg-danger-700"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowLoadDialog(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}