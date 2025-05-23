"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PerformanceMetrics {
  resourceCount: number;
  totalSize: number;
  imageSize: number;
  jsSize: number;
  cssSize: number;
  optimizedImages: number;
  unoptimizedImages: number;
  totalImages: number;
  loadTime: number;
  domSize: number;
  recommendations: string[];
}

export default function PerformancePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  
  useEffect(() => {
    const runPerformanceTest = () => {
      const startTime = performance.now();
      
      // Initialize metrics object
      const metrics: PerformanceMetrics = {
        resourceCount: 0,
        totalSize: 0,
        imageSize: 0,
        jsSize: 0,
        cssSize: 0,
        optimizedImages: 0,
        unoptimizedImages: 0,
        totalImages: 0,
        loadTime: 0,
        domSize: 0,
        recommendations: []
      };
      
      // Get resources
      const resources = performance.getEntriesByType('resource');
      metrics.resourceCount = resources.length;
      
      // Analyze resources
      resources.forEach(resource => {
        const resourceTiming = resource as PerformanceResourceTiming;
        const size = resourceTiming.transferSize || 0;
        metrics.totalSize += size;
        
        if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
          metrics.imageSize += size;
        } else if (resource.name.match(/\.js(\?.*)?$/i)) {
          metrics.jsSize += size;
        } else if (resource.name.match(/\.css(\?.*)?$/i)) {
          metrics.cssSize += size;
        }
      });
      
      // Check images
      const images = document.querySelectorAll('img');
      metrics.totalImages = images.length;
      
      images.forEach(img => {
        if (img.hasAttribute('data-nimg')) {
          metrics.optimizedImages++;
        } else {
          metrics.unoptimizedImages++;
        }
      });
      
      // Measure DOM size
      metrics.domSize = document.querySelectorAll('*').length;
      
      // Generate recommendations
      if (metrics.jsSize > 250 * 1024) {
        metrics.recommendations.push('Reduce JavaScript bundle size through code splitting and lazy loading');
      }
      
      if (metrics.imageSize > 500 * 1024) {
        metrics.recommendations.push('Optimize images to reduce overall payload');
      }
      
      if (metrics.unoptimizedImages > 0) {
        metrics.recommendations.push(`Use Next.js Image component for the ${metrics.unoptimizedImages} unoptimized images`);
      }
      
      if (metrics.domSize > 1000) {
        metrics.recommendations.push('Consider reducing DOM size for better performance');
      }
      
      // Calculate load time
      metrics.loadTime = performance.now() - startTime;
      
      setMetrics(metrics);
      setIsLoading(false);
    };
    
    // Run the test
    runPerformanceTest();
    
    // Clean up
    return () => {
      // Any cleanup if needed
    };
  }, []);
  
  const formatSize = (bytes: number) => {
    const kb = bytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
  };
  
  const getStatusClass = (value: number, thresholds: [number, number]) => {
    const [warning, danger] = thresholds;
    if (value > danger) return 'text-red-500';
    if (value > warning) return 'text-yellow-500';
    return 'text-green-500';
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Performance Metrics
          </h1>
          <p className="mt-3 text-xl text-gray-500 dark:text-gray-300">
            Detailed analysis of the AgenticVoice.net website performance
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : metrics ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Load Time</h3>
                    <p className={`text-2xl font-bold ${getStatusClass(metrics.loadTime, [1000, 3000])}`}>
                      {metrics.loadTime.toFixed(2)} ms
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Resources</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metrics.resourceCount}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatSize(metrics.totalSize)} total
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">DOM Elements</h3>
                    <p className={`text-2xl font-bold ${getStatusClass(metrics.domSize, [1000, 1500])}`}>
                      {metrics.domSize}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Resource Breakdown</h3>
                  <div className="overflow-hidden bg-gray-50 dark:bg-gray-700 shadow sm:rounded-lg">
                    <div className="border-b border-gray-200 dark:border-gray-600">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Resource Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Size
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              JavaScript
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {formatSize(metrics.jsSize)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              <span className={getStatusClass(metrics.jsSize, [250 * 1024, 500 * 1024])}>
                                {metrics.jsSize > 500 * 1024 ? 'Heavy' : metrics.jsSize > 250 * 1024 ? 'Moderate' : 'Good'}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              CSS
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {formatSize(metrics.cssSize)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              <span className={getStatusClass(metrics.cssSize, [100 * 1024, 250 * 1024])}>
                                {metrics.cssSize > 250 * 1024 ? 'Heavy' : metrics.cssSize > 100 * 1024 ? 'Moderate' : 'Good'}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              Images
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {formatSize(metrics.imageSize)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              <span className={getStatusClass(metrics.imageSize, [500 * 1024, 1000 * 1024])}>
                                {metrics.imageSize > 1000 * 1024 ? 'Heavy' : metrics.imageSize > 500 * 1024 ? 'Moderate' : 'Good'}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Image Optimization</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-300">Optimized with Next.js Image</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.optimizedImages}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-300">Unoptimized images</p>
                        <p className={`text-2xl font-bold ${metrics.unoptimizedImages > 0 ? 'text-yellow-500' : 'text-green-500'}`}>
                          {metrics.unoptimizedImages}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-300">Total images</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.totalImages}</p>
                      </div>
                    </div>
                    
                    {metrics.unoptimizedImages > 0 && (
                      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 text-yellow-700 dark:text-yellow-200">
                        <p className="text-sm">
                          <span className="font-bold">Warning:</span> {metrics.unoptimizedImages} images are not using Next.js Image optimization.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {metrics.recommendations.length > 0 && (
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Recommendations</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                      <ul className="space-y-3">
                        {metrics.recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start">
                            <span className="flex-shrink-0 h-5 w-5 text-yellow-500">
                              ⚠️
                            </span>
                            <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Failed to load performance metrics</p>
              </div>
            )}
          </div>
          
          <div className="px-4 py-4 sm:px-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center">
              <button 
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => {
                    window.location.reload();
                  }, 100);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Run Test Again
              </button>
              
              <Link href="/" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
