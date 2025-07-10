'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Search, 
  User, 
  CreditCard, 
  Mic, 
  Activity,
  Filter,
  RefreshCw
} from 'lucide-react';

interface SearchResult {
  type: 'user' | 'transaction' | 'call' | 'activity';
  id: string;
  title: string;
  subtitle: string;
  metadata: Record<string, any>;
  relevanceScore: number;
}

export default function AdminSearchPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(query);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/search?q=${encodeURIComponent(searchTerm)}&filter=${selectedFilter}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      } else {
        console.error('Search failed:', response.status);
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
      performSearch(searchQuery);
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'user': return <User className="w-5 h-5 text-blue-500" />;
      case 'transaction': return <CreditCard className="w-5 h-5 text-green-500" />;
      case 'call': return <Mic className="w-5 h-5 text-purple-500" />;
      case 'activity': return <Activity className="w-5 h-5 text-orange-500" />;
      default: return <Search className="w-5 h-5 text-gray-500" />;
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN', 'GOD_MODE'].includes(session.user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Search</h1>
          <p className="text-gray-600">Search across users, transactions, calls, and activity logs</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for users, emails, transactions, call logs..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                Search
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
              <Filter className="w-4 h-4 text-gray-400" />
              <div className="flex gap-2">
                {['all', 'user', 'transaction', 'call', 'activity'].map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedFilter === filter
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Results */}
        {query && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Search Results for "{query}"
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {loading ? 'Searching...' : `${results.length} results found`}
              </p>
            </div>

            <div className="divide-y">
              {loading ? (
                <div className="p-12 text-center">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Searching...</p>
                </div>
              ) : results.length === 0 ? (
                <div className="p-12 text-center">
                  <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-500">
                    Try adjusting your search terms or filters
                  </p>
                </div>
              ) : (
                results.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    className="p-6 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      // Navigate to relevant page based on result type
                      switch (result.type) {
                        case 'user':
                          router.push(`/admin/users?highlight=${result.id}`);
                          break;
                        case 'transaction':
                          router.push(`/admin/billing?highlight=${result.id}`);
                          break;
                        case 'call':
                          router.push(`/admin/voice?highlight=${result.id}`);
                          break;
                        case 'activity':
                          router.push(`/admin/activity?highlight=${result.id}`);
                          break;
                      }
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getResultIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {result.title}
                          </h3>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {result.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{result.subtitle}</p>
                        {Object.keys(result.metadata).length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(result.metadata).slice(0, 3).map(([key, value]) => (
                              <span
                                key={key}
                                className="inline-flex items-center text-xs text-gray-500"
                              >
                                <span className="font-medium">{key}:</span>
                                <span className="ml-1">{String(value)}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-blue-500 rounded-full"
                            style={{ width: `${Math.min(result.relevanceScore * 100, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-center">
                          {Math.round(result.relevanceScore * 100)}% match
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {!query && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Search className="w-16 h-16 mx-auto text-gray-300 mb-6" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Admin Search</h3>
            <p className="text-gray-500 mb-6">
              Search across all admin data including users, transactions, voice calls, and system activity
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-md mx-auto">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <User className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                <p className="text-sm font-medium text-gray-700">Users</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <CreditCard className="w-6 h-6 mx-auto text-green-500 mb-2" />
                <p className="text-sm font-medium text-gray-700">Billing</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Mic className="w-6 h-6 mx-auto text-purple-500 mb-2" />
                <p className="text-sm font-medium text-gray-700">Voice Calls</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Activity className="w-6 h-6 mx-auto text-orange-500 mb-2" />
                <p className="text-sm font-medium text-gray-700">Activity</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
