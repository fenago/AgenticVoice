"use client";

import { useEffect } from 'react';
import Image from 'next/image';

// A component that implements performance best practices for images
interface ImageOptimizerProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}

const ImageOptimizer = ({
  src,
  alt,
  width,
  height,
  priority = false,
  className = ""
}: ImageOptimizerProps): JSX.Element => {
  // Preload high priority images
  useEffect(() => {
    if (priority && typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
      
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [src, priority]);
  
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
};

export default ImageOptimizer;
