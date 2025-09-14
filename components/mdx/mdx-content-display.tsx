'use client';

import { MDXRenderer, MDXRendererCompact, MDXRendererCard } from './mdx-renderer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Eye, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentDisplayProps {
    content: string;
    title?: string;
    description?: string;
    author?: string;
    publishedAt?: Date;
    readingTime?: number;
    tags?: string[];
    variant?: 'full' | 'preview' | 'card';
    className?: string;
    showMeta?: boolean;
    enableSharing?: boolean;
}

/**
 * Content Display Component
 * A complete content display solution with metadata and actions
 */
export function MDXContentDisplay({
    content,
    title,
    description,
    author,
    publishedAt,
    readingTime,
    tags = [],
    variant = 'full',
    className,
    showMeta = true,
    enableSharing = false,
}: ContentDisplayProps) {
    const handleShare = async () => {
        if (navigator.share && title) {
            try {
                await navigator.share({
                    title,
                    text: description,
                    url: window.location.href,
                });
            } catch (error) {
                // Fallback to clipboard
                await navigator.clipboard.writeText(window.location.href);
            }
        }
    };

    if (variant === 'preview') {
        return (
            <div className={cn('space-y-2', className)}>
                {title && (
                    <h3 className="font-semibold text-lg line-clamp-2">{title}</h3>
                )}
                <MDXRendererCompact content={content} maxLines={3} />
                {showMeta && (author || publishedAt) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {author && <span>{author}</span>}
                        {author && publishedAt && <span>•</span>}
                        {publishedAt && (
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {publishedAt.toLocaleDateString()}
                            </span>
                        )}
                    </div>
                )}
            </div>
        );
    }

    if (variant === 'card') {
        return (
            <MDXRendererCard
                title={title}
                content={content}
                variant="compact"
                className={className}
            />
        );
    }

    // Full variant
    return (
        <article className={cn('max-w-4xl mx-auto', className)}>
            {/* Header */}
            {(title || description || showMeta) && (
                <header className="mb-8 space-y-4">
                    {title && (
                        <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
                    )}
                    
                    {description && (
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            {description}
                        </p>
                    )}

                    {showMeta && (author || publishedAt || readingTime || tags.length > 0) && (
                        <div className="flex flex-wrap items-center gap-4 py-4 border-b">
                            {/* Author and Date */}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                {author && (
                                    <span className="font-medium">{author}</span>
                                )}
                                {publishedAt && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {publishedAt.toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </span>
                                )}
                                {readingTime && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {readingTime} min read
                                    </span>
                                )}
                            </div>

                            {/* Tags */}
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag, index) => (
                                        <Badge key={index} variant="secondary">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {/* Actions */}
                            {enableSharing && (
                                <div className="ml-auto">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleShare}
                                    >
                                        <Share2 className="h-4 w-4 mr-2" />
                                        Share
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </header>
            )}

            {/* Content */}
            <div className="prose prose-gray dark:prose-invert max-w-none">
                <MDXRenderer
                    content={content}
                    variant="article"
                    showImageCaptions={true}
                    enableLinks={true}
                />
            </div>
        </article>
    );
}

/**
 * Content Grid Component
 * Display multiple content items in a grid layout
 */
interface ContentGridProps {
    items: Array<{
        id: string;
        title: string;
        content: string;
        description?: string;
        author?: string;
        publishedAt?: Date;
        tags?: string[];
    }>;
    columns?: 1 | 2 | 3 | 4;
    className?: string;
}

export function MDXContentGrid({ 
    items, 
    columns = 3, 
    className 
}: ContentGridProps) {
    const gridCols = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    };

    return (
        <div className={cn('grid gap-6', gridCols[columns], className)}>
            {items.map((item) => (
                <Card key={item.id} className="h-fit">
                    <CardContent className="p-6">
                        <MDXContentDisplay
                            content={item.content}
                            title={item.title}
                            description={item.description}
                            author={item.author}
                            publishedAt={item.publishedAt}
                            tags={item.tags}
                            variant="preview"
                            showMeta={true}
                        />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

/**
 * Content List Component
 * Display content items in a vertical list
 */
interface ContentListProps {
    items: Array<{
        id: string;
        title: string;
        content: string;
        description?: string;
        author?: string;
        publishedAt?: Date;
        readingTime?: number;
        tags?: string[];
    }>;
    className?: string;
}

export function MDXContentList({ items, className }: ContentListProps) {
    return (
        <div className={cn('space-y-6', className)}>
            {items.map((item) => (
                <Card key={item.id}>
                    <CardContent className="p-6">
                        <MDXContentDisplay
                            content={item.content}
                            title={item.title}
                            description={item.description}
                            author={item.author}
                            publishedAt={item.publishedAt}
                            readingTime={item.readingTime}
                            tags={item.tags}
                            variant="preview"
                            showMeta={true}
                        />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

/**
 * Featured Content Component
 * Highlight a single piece of content
 */
interface FeaturedContentProps {
    content: string;
    title: string;
    description?: string;
    author?: string;
    publishedAt?: Date;
    readingTime?: number;
    tags?: string[];
    imageUrl?: string;
    className?: string;
}

export function MDXFeaturedContent({
    content,
    title,
    description,
    author,
    publishedAt,
    readingTime,
    tags = [],
    imageUrl,
    className,
}: FeaturedContentProps) {
    return (
        <Card className={cn('overflow-hidden', className)}>
            {imageUrl && (
                <div className="aspect-video bg-muted">
                    <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}
            <CardContent className="p-8">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                        {description && (
                            <p className="text-lg text-muted-foreground">{description}</p>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {author && <span className="font-medium">{author}</span>}
                        {publishedAt && (
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {publishedAt.toLocaleDateString()}
                            </span>
                        )}
                        {readingTime && (
                            <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {readingTime} min read
                            </span>
                        )}
                    </div>

                    <MDXRendererCompact content={content} maxLines={4} />

                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                            {tags.map((tag, index) => (
                                <Badge key={index} variant="outline">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
