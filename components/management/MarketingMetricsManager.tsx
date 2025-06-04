import React, { useState, useEffect } from "react";
import { MarketingMetrics } from "@/types";

interface MarketingMetricsManagerProps {
  marketingMetrics: MarketingMetrics;
  onMetricsChange: (metrics: MarketingMetrics) => void;
  className?: string;
}

const DEFAULT_MARKETING_METRICS: MarketingMetrics = {
  monthlyMarketingSpend: 5000,
  cac: 250,
  ltv: 1200,
  ltvCacRatio: 4.8,
  paybackPeriodMonths: 8,
  organicGrowthRate: 0.15,
  paidGrowthRate: 0.35,
  brandAwarenessSpend: 1500,
  performanceMarketingSpend: 2500,
  contentMarketingSpend: 800,
  affiliateMarketingSpend: 200,
  conversionRate: 0.08,
  leadQualityScore: 75,
  marketingROI: 3.2,
};

export default function MarketingMetricsManager({
  marketingMetrics,
  onMetricsChange,
  className = "",
}: MarketingMetricsManagerProps) {
  const [metrics, setMetrics] = useState<MarketingMetrics>(
    marketingMetrics || DEFAULT_MARKETING_METRICS
  );
  const [activeTab, setActiveTab] = useState<'overview' | 'spending' | 'performance' | 'channels'>('overview');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (marketingMetrics) {
      setMetrics(marketingMetrics);
    }
  }, [marketingMetrics]);

  const handleMetricChange = (field: keyof MarketingMetrics, value: number) => {
    const updatedMetrics = { ...metrics, [field]: value };
    
    // Auto-calculate dependent metrics
    if (field === 'cac' || field === 'ltv') {
      updatedMetrics.ltvCacRatio = updatedMetrics.ltv / updatedMetrics.cac;
    }
    
    if (field === 'cac' || field === 'monthlyMarketingSpend') {
      // Estimate payback period based on ARPU (assumed $200/month)
      const estimatedARPU = 200;
      updatedMetrics.paybackPeriodMonths = updatedMetrics.cac / estimatedARPU;
    }
    
    // Validate spending allocation
    const totalChannelSpend = 
      updatedMetrics.brandAwarenessSpend +
      updatedMetrics.performanceMarketingSpend +
      updatedMetrics.contentMarketingSpend +
      updatedMetrics.affiliateMarketingSpend;
    
    if (Math.abs(totalChannelSpend - updatedMetrics.monthlyMarketingSpend) > 100) {
      setErrors(prev => ({
        ...prev,
        spending: `Channel spending (${totalChannelSpend}) doesn't match total budget (${updatedMetrics.monthlyMarketingSpend})`
      }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.spending;
        return newErrors;
      });
    }
    
    setMetrics(updatedMetrics);
    onMetricsChange(updatedMetrics);
  };

  const validateMetric = (field: keyof MarketingMetrics, value: number): string | null => {
    switch (field) {
      case 'cac':
        if (value <= 0) return 'CAC must be positive';
        if (value > 2000) return 'CAC seems unrealistically high';
        break;
      case 'ltv':
        if (value <= 0) return 'LTV must be positive';
        if (value < metrics.cac) return 'LTV should be higher than CAC';
        break;
      case 'conversionRate':
        if (value < 0 || value > 1) return 'Conversion rate must be between 0 and 1';
        break;
      case 'leadQualityScore':
        if (value < 0 || value > 100) return 'Lead quality score must be between 0 and 100';
        break;
      case 'marketingROI':
        if (value < 0) return 'Marketing ROI cannot be negative';
        break;
    }
    return null;
  };

  const applyPreset = (preset: 'startup' | 'growth' | 'enterprise') => {
    let presetMetrics: Partial<MarketingMetrics> = {};
    
    switch (preset) {
      case 'startup':
        presetMetrics = {
          monthlyMarketingSpend: 2000,
          cac: 150,
          ltv: 800,
          ltvCacRatio: 5.3,
          paybackPeriodMonths: 6,
          organicGrowthRate: 0.25,
          paidGrowthRate: 0.75,
          brandAwarenessSpend: 400,
          performanceMarketingSpend: 1200,
          contentMarketingSpend: 300,
          affiliateMarketingSpend: 100,
          conversionRate: 0.12,
          leadQualityScore: 70,
          marketingROI: 4.0,
        };
        break;
      case 'growth':
        presetMetrics = {
          monthlyMarketingSpend: 8000,
          cac: 300,
          ltv: 1800,
          ltvCacRatio: 6.0,
          paybackPeriodMonths: 8,
          organicGrowthRate: 0.15,
          paidGrowthRate: 0.85,
          brandAwarenessSpend: 2400,
          performanceMarketingSpend: 4000,
          contentMarketingSpend: 1200,
          affiliateMarketingSpend: 400,
          conversionRate: 0.08,
          leadQualityScore: 80,
          marketingROI: 3.5,
        };
        break;
      case 'enterprise':
        presetMetrics = {
          monthlyMarketingSpend: 20000,
          cac: 800,
          ltv: 5000,
          ltvCacRatio: 6.25,
          paybackPeriodMonths: 12,
          organicGrowthRate: 0.10,
          paidGrowthRate: 0.90,
          brandAwarenessSpend: 8000,
          performanceMarketingSpend: 8000,
          contentMarketingSpend: 3000,
          affiliateMarketingSpend: 1000,
          conversionRate: 0.05,
          leadQualityScore: 85,
          marketingROI: 3.0,
        };
        break;
    }
    
    const updatedMetrics = { ...metrics, ...presetMetrics };
    setMetrics(updatedMetrics);
    onMetricsChange(updatedMetrics);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'spending', label: 'Spending', icon: '💰' },
    { id: 'performance', label: 'Performance', icon: '📈' },
    { id: 'channels', label: 'Channels', icon: '🎯' },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with presets */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Marketing Metrics
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => applyPreset('startup')}
            className="px-3 py-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40"
          >
            Startup
          </button>
          <button
            onClick={() => applyPreset('growth')}
            className="px-3 py-1 text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded hover:bg-green-100 dark:hover:bg-green-900/40"
          >
            Growth
          </button>
          <button
            onClick={() => applyPreset('enterprise')}
            className="px-3 py-1 text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-100 dark:hover:bg-purple-900/40"
          >
            Enterprise
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Key Metrics</h4>
            
            <div>
              <label className="form-label">Monthly Marketing Spend ($)</label>
              <input
                type="number"
                value={metrics.monthlyMarketingSpend}
                onChange={(e) => handleMetricChange('monthlyMarketingSpend', Number(e.target.value))}
                className="form-input"
                min="0"
                step="100"
              />
            </div>

            <div>
              <label className="form-label">Customer Acquisition Cost (CAC) ($)</label>
              <input
                type="number"
                value={metrics.cac}
                onChange={(e) => handleMetricChange('cac', Number(e.target.value))}
                className="form-input"
                min="0"
                step="10"
              />
              {validateMetric('cac', metrics.cac) && (
                <p className="text-xs text-red-600 mt-1">{validateMetric('cac', metrics.cac)}</p>
              )}
            </div>

            <div>
              <label className="form-label">Lifetime Value (LTV) ($)</label>
              <input
                type="number"
                value={metrics.ltv}
                onChange={(e) => handleMetricChange('ltv', Number(e.target.value))}
                className="form-input"
                min="0"
                step="50"
              />
              {validateMetric('ltv', metrics.ltv) && (
                <p className="text-xs text-red-600 mt-1">{validateMetric('ltv', metrics.ltv)}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Calculated Ratios</h4>
            
            <div>
              <label className="form-label">LTV:CAC Ratio</label>
              <input
                type="number"
                value={metrics.ltvCacRatio.toFixed(2)}
                className="form-input bg-gray-50 dark:bg-gray-700"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">
                {metrics.ltvCacRatio < 3 ? '⚠️ Below recommended 3:1' : 
                 metrics.ltvCacRatio > 5 ? '✅ Healthy ratio' : 
                 '⚡ Acceptable ratio'}
              </p>
            </div>

            <div>
              <label className="form-label">Payback Period (months)</label>
              <input
                type="number"
                value={metrics.paybackPeriodMonths.toFixed(1)}
                onChange={(e) => handleMetricChange('paybackPeriodMonths', Number(e.target.value))}
                className="form-input"
                min="0"
                step="0.5"
              />
            </div>

            <div>
              <label className="form-label">Marketing ROI</label>
              <input
                type="number"
                value={metrics.marketingROI}
                onChange={(e) => handleMetricChange('marketingROI', Number(e.target.value))}
                className="form-input"
                min="0"
                step="0.1"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Growth Metrics</h4>
            
            <div>
              <label className="form-label">Organic Growth Rate (%)</label>
              <input
                type="number"
                value={(metrics.organicGrowthRate * 100).toFixed(1)}
                onChange={(e) => handleMetricChange('organicGrowthRate', Number(e.target.value) / 100)}
                className="form-input"
                min="0"
                max="100"
                step="1"
              />
            </div>

            <div>
              <label className="form-label">Paid Growth Rate (%)</label>
              <input
                type="number"
                value={(metrics.paidGrowthRate * 100).toFixed(1)}
                onChange={(e) => handleMetricChange('paidGrowthRate', Number(e.target.value) / 100)}
                className="form-input"
                min="0"
                max="100"
                step="1"
              />
            </div>

            <div>
              <label className="form-label">Conversion Rate (%)</label>
              <input
                type="number"
                value={(metrics.conversionRate * 100).toFixed(1)}
                onChange={(e) => handleMetricChange('conversionRate', Number(e.target.value) / 100)}
                className="form-input"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'spending' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Channel Spending</h4>
              
              <div>
                <label className="form-label">Brand Awareness ($)</label>
                <input
                  type="number"
                  value={metrics.brandAwarenessSpend}
                  onChange={(e) => handleMetricChange('brandAwarenessSpend', Number(e.target.value))}
                  className="form-input"
                  min="0"
                  step="50"
                />
              </div>

              <div>
                <label className="form-label">Performance Marketing ($)</label>
                <input
                  type="number"
                  value={metrics.performanceMarketingSpend}
                  onChange={(e) => handleMetricChange('performanceMarketingSpend', Number(e.target.value))}
                  className="form-input"
                  min="0"
                  step="50"
                />
              </div>

              <div>
                <label className="form-label">Content Marketing ($)</label>
                <input
                  type="number"
                  value={metrics.contentMarketingSpend}
                  onChange={(e) => handleMetricChange('contentMarketingSpend', Number(e.target.value))}
                  className="form-input"
                  min="0"
                  step="25"
                />
              </div>

              <div>
                <label className="form-label">Affiliate Marketing ($)</label>
                <input
                  type="number"
                  value={metrics.affiliateMarketingSpend}
                  onChange={(e) => handleMetricChange('affiliateMarketingSpend', Number(e.target.value))}
                  className="form-input"
                  min="0"
                  step="25"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Spending Breakdown</h4>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="space-y-3">
                  {[
                    { label: 'Brand Awareness', value: metrics.brandAwarenessSpend, color: '#3b82f6' },
                    { label: 'Performance Marketing', value: metrics.performanceMarketingSpend, color: '#22c55e' },
                    { label: 'Content Marketing', value: metrics.contentMarketingSpend, color: '#f59e0b' },
                    { label: 'Affiliate Marketing', value: metrics.affiliateMarketingSpend, color: '#8b5cf6' },
                  ].map((item) => {
                    const percentage = (item.value / metrics.monthlyMarketingSpend) * 100;
                    return (
                      <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded" 
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          ${item.value.toLocaleString()} ({percentage.toFixed(1)}%)
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Total:</span>
                    <span>${(metrics.brandAwarenessSpend + metrics.performanceMarketingSpend + 
                             metrics.contentMarketingSpend + metrics.affiliateMarketingSpend).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {errors.spending && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
                  <p className="text-sm text-red-700 dark:text-red-400">{errors.spending}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Lead Quality</h4>
            
            <div>
              <label className="form-label">Lead Quality Score (0-100)</label>
              <input
                type="number"
                value={metrics.leadQualityScore}
                onChange={(e) => handleMetricChange('leadQualityScore', Number(e.target.value))}
                className="form-input"
                min="0"
                max="100"
                step="1"
              />
              <div className="mt-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${metrics.leadQualityScore}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {metrics.leadQualityScore >= 80 ? 'Excellent quality' :
                   metrics.leadQualityScore >= 60 ? 'Good quality' :
                   metrics.leadQualityScore >= 40 ? 'Average quality' :
                   'Needs improvement'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Performance Indicators</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">CAC Payback</div>
                <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                  {metrics.paybackPeriodMonths.toFixed(1)}m
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <div className="text-xs text-green-600 dark:text-green-400 font-medium">LTV:CAC</div>
                <div className="text-lg font-bold text-green-900 dark:text-green-100">
                  {metrics.ltvCacRatio.toFixed(1)}:1
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">Marketing ROI</div>
                <div className="text-lg font-bold text-purple-900 dark:text-purple-100">
                  {metrics.marketingROI.toFixed(1)}x
                </div>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">Conversion</div>
                <div className="text-lg font-bold text-orange-900 dark:text-orange-100">
                  {(metrics.conversionRate * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'channels' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">Channel Efficiency</h4>
              <div className="space-y-3">
                {[
                  { 
                    name: 'Performance Marketing', 
                    spend: metrics.performanceMarketingSpend,
                    efficiency: 0.9,
                    description: 'Google Ads, Facebook Ads, etc.'
                  },
                  { 
                    name: 'Content Marketing', 
                    spend: metrics.contentMarketingSpend,
                    efficiency: 1.8,
                    description: 'SEO, Blog, Webinars'
                  },
                  { 
                    name: 'Brand Awareness', 
                    spend: metrics.brandAwarenessSpend,
                    efficiency: 0.6,
                    description: 'PR, Events, Sponsorships'
                  },
                  { 
                    name: 'Affiliate Marketing', 
                    spend: metrics.affiliateMarketingSpend,
                    efficiency: 2.2,
                    description: 'Partner referrals'
                  },
                ].map((channel) => (
                  <div key={channel.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white">{channel.name}</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{channel.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          ${channel.spend.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {((channel.spend / metrics.monthlyMarketingSpend) * 100).toFixed(1)}% of budget
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Efficiency:</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            channel.efficiency > 1.5 ? 'bg-green-500' : 
                            channel.efficiency > 1.0 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(channel.efficiency * 50, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">{channel.efficiency.toFixed(1)}x</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">Channel Recommendations</h4>
              <div className="space-y-3">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                  <h5 className="font-medium text-green-800 dark:text-green-200 mb-2">💡 Optimize Content Marketing</h5>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    High efficiency but low spend. Consider increasing budget for better ROI.
                  </p>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">📊 Monitor Performance Marketing</h5>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Largest spend allocation. Track conversion rates closely for optimization.
                  </p>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                  <h5 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Review Brand Awareness</h5>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Lower efficiency channel. Consider shifting budget or improving targeting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}