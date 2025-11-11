'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
    quality?: number;
    sizes?: string;
    fill?: boolean;
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    loading?: 'lazy' | 'eager';
    unoptimized?: boolean;
    onLoad?: () => void;
    onError?: () => void;
}

export function OptimizedImage({
    src,
    alt,
    width,
    height,
    className,
    priority = false,
    quality = 85,
    sizes,
    fill = false,
    placeholder = 'empty',
    blurDataURL,
    loading = 'lazy',
    unoptimized = false,
    onLoad,
    onError,
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = () => {
        setIsLoading(false);
        onLoad?.();
    };

    const handleError = () => {
        setIsLoading(false);
        setHasError(true);
        onError?.();
    };

    // Generate responsive sizes if not provided
    const responsiveSizes =
        sizes ||
        (fill
            ? '100vw'
            : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw');

    // Determine if image should be unoptimized
    const shouldBeUnoptimized =
        unoptimized ||
        src.startsWith('data:') ||
        src.startsWith('blob:') ||
        src.includes('supabase.co') ||
        src.includes('amazonaws.com');

    if (hasError) {
        return (
            <div
                className={cn(
                    'flex items-center justify-center bg-muted text-muted-foreground',
                    fill ? 'absolute inset-0' : 'w-full h-48',
                    className
                )}
                style={!fill ? { width, height } : undefined}
            >
                <span className="text-sm">Failed to load image</span>
            </div>
        );
    }

    return (
        <div className={cn('relative', !fill && 'inline-block')}>
            {/* Loading placeholder */}
            {isLoading && (
                <div
                    className={cn(
                        'absolute inset-0 bg-muted animate-pulse',
                        fill ? 'w-full h-full' : '',
                        className
                    )}
                    style={!fill ? { width, height } : undefined}
                />
            )}

            <Image
                src={src}
                alt={alt}
                width={fill ? undefined : width}
                height={fill ? undefined : height}
                fill={fill}
                className={cn(
                    'transition-opacity duration-300',
                    isLoading ? 'opacity-0' : 'opacity-100',
                    className
                )}
                priority={priority}
                quality={quality}
                sizes={responsiveSizes}
                placeholder={placeholder}
                blurDataURL={blurDataURL}
                loading={priority ? 'eager' : loading}
                unoptimized={shouldBeUnoptimized}
                onLoad={handleLoad}
                onError={handleError}
                // SEO attributes
                decoding="async"
                fetchPriority={priority ? 'high' : 'auto'}
            />
        </div>
    );
}

// Specialized components for common use cases
export function HeroImage(
    props: Omit<OptimizedImageProps, 'priority' | 'loading'>
) {
    return (
        <OptimizedImage
            {...props}
            priority={true}
            loading="eager"
            quality={90}
            sizes="100vw"
        />
    );
}

export function CourseCardImage(
    props: Omit<OptimizedImageProps, 'sizes' | 'quality'>
) {
    return (
        <OptimizedImage
            {...props}
            quality={80}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
    );
}

export function ThumbnailImage(
    props: Omit<OptimizedImageProps, 'sizes' | 'quality'>
) {
    return (
        <OptimizedImage
            {...props}
            quality={75}
            sizes="(max-width: 768px) 50vw, 25vw"
        />
    );
}

export function FullWidthImage(props: Omit<OptimizedImageProps, 'sizes'>) {
    return <OptimizedImage {...props} sizes="100vw" />;
}

// Utility function to generate blur data URL
export function generateBlurDataURL(
    width: number = 10,
    height: number = 10
): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
        // Create a simple gradient blur effect
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#f3f4f6');
        gradient.addColorStop(1, '#e5e7eb');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    return canvas.toDataURL();
}
