"use client";

import { useState } from 'react';

interface PerformanceMetrics {
  resourceCount: number;
  totalSize: number;
  imageSize: number;
  jsSize: number;
  cssSize: number;
  optimizedImages: number;
  unoptimizedImages: number;
  loadTime: number;
}

const PerformanceDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  
  const runTest = () => {
    setIsLoading(true);
    setIsOpen(true);
    
    // Small delay to allow state update
    setTimeout(() => {
      // Initialize metrics
      const startTime = performance.now();
      const metrics: PerformanceMetrics = {
        resourceCount: 0,
        totalSize: 0,
        imageSize: 0,
        jsSize: 0,
        cssSize: 0,
        optimizedImages: 0,
        unoptimizedImages: 0,
        loadTime: 0
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
      images.forEach(img => {
        if (img.hasAttribute('data-nimg')) {
          metrics.optimizedImages++;
        } else {
          metrics.unoptimizedImages++;
        }
      });
      
      // Calculate load time
      metrics.loadTime = performance.now() - startTime;
      
      // Update state
      setMetrics(metrics);
      setIsLoading(false);
    }, 100);
  };
  
  const getStatusColor = (value: number, thresholds: [number, number]) => {
    const [warning, danger] = thresholds;
    if (value > danger) return 'text-red-500';
    if (value > warning) return 'text-yellow-500';
    return 'text-green-500';
  };
  
  const formatSize = (bytes: number) => {
    const kb = bytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {isOpen && metrics && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 mb-4 w-80 max-h-[80vh] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Performance Metrics</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Load Time</h4>
              <p className={getStatusColor(metrics.loadTime, [1000, 3000])}>
                {metrics.loadTime.toFixed(2)} ms
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Resources</h4>
              <p>Total: {metrics.resourceCount} resources</p>
              <p>Size: {formatSize(metrics.totalSize)}</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Asset Breakdown</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm">JavaScript</p>
                  <p className={getStatusColor(metrics.jsSize, [250 * 1024, 500 * 1024])}>
                    {formatSize(metrics.jsSize)}
                  </p>
                </div>
                <div>
                  <p className="text-sm">CSS</p>
                  <p className={getStatusColor(metrics.cssSize, [100 * 1024, 250 * 1024])}>
                    {formatSize(metrics.cssSize)}
                  </p>
                </div>
                <div>
                  <p className="text-sm">Images</p>
                  <p className={getStatusColor(metrics.imageSize, [500 * 1024, 1000 * 1024])}>
                    {formatSize(metrics.imageSize)}
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Image Optimization</h4>
              <p>
                {metrics.optimizedImages} optimized, {metrics.unoptimizedImages} unoptimized
              </p>
              {metrics.unoptimizedImages > 0 && (
                <p className="text-yellow-500 text-sm mt-1">
                  ⚠️ {metrics.unoptimizedImages} images could be optimized with Next.js Image
                </p>
              )}
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Recommendations</h4>
              <ul className="text-sm space-y-1">
                {metrics.loadTime > 3000 && (
                  <li className="text-yellow-500">⚠️ Reduce page load time with code splitting</li>
                )}
                {metrics.jsSize > 500 * 1024 && (
                  <li className="text-yellow-500">⚠️ Reduce JavaScript bundle size</li>
                )}
                {metrics.imageSize > 1000 * 1024 && (
                  <li className="text-yellow-500">⚠️ Optimize large image payload</li>
                )}
                {metrics.unoptimizedImages > 0 && (
                  <li className="text-yellow-500">⚠️ Use Next.js Image for all images</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      <button
        onClick={runTest}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-lg transition-all"
      >
        {isLoading ? 'Running Test...' : 'Run Performance Test'}
      </button>
    </div>
  );
};

export default PerformanceDashboard;
