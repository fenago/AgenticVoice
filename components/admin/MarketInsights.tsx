'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Badge, LoadingSpinner } from '@/components/ui';
import { 
  TrendingUp, 
  Globe, 
  ExternalLink, 
  RefreshCw,
  Search,
  Calendar,
  Users,
  BarChart3,
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';

interface MarketTrend {
  id: string;
  title: string;
  description: string;
  source: string;
  link: string;
  publishedAt: string;
  category: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

interface CompetitorData {
  name: string;
  marketShare: number;
  trend: 'up' | 'down' | 'stable';
  recentNews: (string | { title: string; link: string })[];
}

interface MarketInsightsData {
  trends: MarketTrend[];
  competitors: CompetitorData[];
  marketSize: {
    current: string;
    projected: string;
    growthRate: string;
  };
  keyInsights: string[];
  lastUpdated: string;
}

export default function MarketInsights() {
  const [data, setData] = useState<MarketInsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'trends' | 'competitors' | 'analysis'>('trends');

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/search/trends');
      if (!response.ok) {
        throw new Error('Failed to fetch market insights');
      }
      
      const marketData = await response.json();
      setData(marketData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load market insights');
    } finally {
      setIsLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="w-4 h-4 text-green-600" />;
      case 'down': return <ArrowUpRight className="w-4 h-4 text-red-600 rotate-180" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const renderTrends = () => (
    <div className="space-y-4">
      {data?.trends.map((trend) => (
        <Card key={trend.id} className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="secondary" className="text-xs">
                  {trend.category}
                </Badge>
                <Badge className={getSentimentColor(trend.sentiment)}>
                  {trend.sentiment}
                </Badge>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {trend.title}
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                {trend.description}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Globe className="w-4 h-4 mr-1" />
                  {trend.source}
                </span>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(trend.publishedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => window.open(trend.link, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderCompetitors = () => (
    <div className="space-y-4">
      {data?.competitors.map((competitor) => (
        <Card key={competitor.name} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {competitor.name}
              </h3>
              {getTrendIcon(competitor.trend)}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {competitor.marketShare}%
              </div>
              <div className="text-sm text-gray-500">Market Share</div>
            </div>
          </div>
          
          {competitor.recentNews.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Recent News</h4>
              <ul className="space-y-2">
                {competitor.recentNews.slice(0, 3).map((news, index) => (
                  <li key={index} className="text-sm">
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                      {typeof news === 'string' ? (
                        <span className="text-gray-600">{news}</span>
                      ) : (
                        <a 
                          href={news.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {news.title}
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      ))}
    </div>
  );

  const renderAnalysis = () => (
    <div className="space-y-6">
      {/* Market Size */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-900">
              {data?.marketSize.current}
            </div>
            <div className="text-sm text-blue-700">Current Market Size</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-900">
              {data?.marketSize.projected}
            </div>
            <div className="text-sm text-green-700">Projected 2025</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-900">
              {data?.marketSize.growthRate}
            </div>
            <div className="text-sm text-purple-700">Annual Growth Rate</div>
          </div>
        </div>
      </Card>

      {/* Key Insights */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Market Insights</h3>
        <div className="space-y-3">
          {data?.keyInsights.map((insight, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700">{insight}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Market Insights</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchMarketData} variant="secondary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Market Insights</h2>
          <p className="text-gray-600">AI Voice Assistant Market Intelligence</p>
          {data?.lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {new Date(data.lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
        <Button onClick={fetchMarketData} variant="secondary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'trends', label: 'Market Trends', icon: TrendingUp },
            { id: 'competitors', label: 'Competitive Analysis', icon: Users },
            { id: 'analysis', label: 'Market Analysis', icon: BarChart3 }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'trends' && renderTrends()}
      {activeTab === 'competitors' && renderCompetitors()}
      {activeTab === 'analysis' && renderAnalysis()}
    </div>
  );
}
