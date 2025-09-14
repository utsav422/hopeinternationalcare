'use client';

import {useMemo} from 'react';
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';
// import remarkBreaks from 'remark-breaks';
// import rehypeRaw from 'rehype-raw';
// import rehypeSanitize from 'rehype-sanitize';
// import { defaultSchema } from 'hast-util-sanitize';
import {cn} from '@/lib/utils';
import Image from "next/image";
import Link from 'next/link';
import {Card, CardContent} from '@/components/ui/card';

interface MDXRendererProps {
    content: string;
    className?: string;
    variant?: 'default' | 'compact' | 'article';
    showImageCaptions?: boolean;
    enableLinks?: boolean;
}

/**
 * MDX Renderer Component
 * Renders MDX/Markdown content in read-only mode with proper styling
 */
export function __mdxRenderer({
                                  content,
                                  className,
                                  variant = 'default',
                                  showImageCaptions = true,
                                  enableLinks = true,
                              }: MDXRendererProps) {
    const processedContent = useMemo(() => {
        if (!content) return '';

        // Clean up the content
        return content
            .trim()
            // Fix line breaks
            .replace(/\n\n+/g, '\n\n')
            // Ensure proper spacing around headings
            .replace(/^(#{1,6}\s)/gm, '\n$1')
            .trim();
    }, [content]);

    const baseClasses = cn(
        'prose prose-gray dark:prose-invert max-w-none',
        {
            'prose-sm': variant === 'compact',
            'prose-lg': variant === 'article',
        },
        className
    );

    // Custom sanitization schema that allows HTML img tags
    const sanitizeSchema = {
        ...defaultSchema,
        tagNames: [
            ...(defaultSchema.tagNames || []),
            'img'
        ],
        attributes: {
            ...defaultSchema.attributes,
            img: ['src', 'alt', 'title', 'width', 'height', 'className', 'class']
        }
    };

    if (!processedContent) {
        return (
            <div className={cn('text-muted-foreground italic', className)}>
                No content to display
            </div>
        );
    }

    return (
        <div className={baseClasses}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
                components={{
                    // Custom heading components
                    h1: ({children, ...props}) => (
                        <h1
                            className="text-3xl font-bold tracking-tight mb-6 mt-8 first:mt-0"
                            {...props}
                        >
                            {children}
                        </h1>
                    ),
                    h2: ({children, ...props}) => (
                        <h2
                            className="text-2xl font-semibold tracking-tight mb-4 mt-6 first:mt-0"
                            {...props}
                        >
                            {children}
                        </h2>
                    ),
                    h3: ({children, ...props}) => (
                        <h3
                            className="text-xl font-semibold tracking-tight mb-3 mt-5 first:mt-0"
                            {...props}
                        >
                            {children}
                        </h3>
                    ),
                    h4: ({children, ...props}) => (
                        <h4
                            className="text-lg font-semibold mb-2 mt-4 first:mt-0"
                            {...props}
                        >
                            {children}
                        </h4>
                    ),
                    h5: ({children, ...props}) => (
                        <h5
                            className="text-base font-semibold mb-2 mt-3 first:mt-0"
                            {...props}
                        >
                            {children}
                        </h5>
                    ),
                    h6: ({children, ...props}) => (
                        <h6
                            className="text-sm font-semibold mb-2 mt-3 first:mt-0"
                            {...props}
                        >
                            {children}
                        </h6>
                    ),

                    // Custom paragraph component
                    p: ({children, ...props}) => (
                        <p className="mb-4 leading-7 text-foreground" {...props}>
                            {children}
                        </p>
                    ),

                    // Custom image component
                    img: ({src, alt, title, width, height, className, ...props}) => {
                        if (!src) return null;

                        // Handle both markdown images and HTML img tags
                        const imageWidth = width ? parseInt(width as string) : 800;
                        const imageHeight = height ? parseInt(height as string) : 400;

                        // Convert src to string if it's a Blob
                        const srcString = typeof src === 'string' ? src : (src instanceof Blob ? URL.createObjectURL(src) : String(src));

                        return (
                            <span className="block my-6">
                                <>{srcString}</>
                                <Image
                                    src={srcString}
                                    alt={alt || 'Image'}
                                    width={imageWidth}
                                    height={imageHeight}
                                    className={cn('w-full h-auto object-cover rounded-lg border', className)}
                                    unoptimized={
                                        srcString.startsWith('data:') ||
                                        srcString.startsWith('blob:') ||
                                        srcString.includes('supabase.co')
                                    }
                                    {...props}
                                />
                                {showImageCaptions && (alt || title) && (
                                    <span className="block mt-2 text-sm text-muted-foreground text-center">
                                        {alt || title}
                                    </span>
                                )}
                            </span>
                        );
                    },

                    // Custom link component
                    a: ({href, children, ...props}) => {
                        if (!enableLinks || !href) {
                            return <span className="text-primary">{children}</span>;
                        }

                        const isExternal = href.startsWith('http') || href.startsWith('//');

                        if (isExternal) {
                            return (
                                <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:text-primary/80 underline underline-offset-4"
                                    {...props}
                                >
                                    {children}
                                </a>
                            );
                        }

                        return (
                            <Link
                                href={href}
                                className="text-primary hover:text-primary/80 underline underline-offset-4"
                                {...props}
                            >
                                {children}
                            </Link>
                        );
                    },

                    // Custom blockquote component
                    blockquote: ({children, ...props}) => (
                        <blockquote
                            className="border-l-4 border-primary/20 pl-4 py-2 my-4 italic text-muted-foreground bg-muted/30 rounded-r-md"
                            {...props}
                        >
                            {children}
                        </blockquote>
                    ),

                    // Custom list components
                    ul: ({children, ...props}) => (
                        <ul className="list-disc list-inside mb-4 space-y-1" {...props}>
                            {children}
                        </ul>
                    ),
                    ol: ({children, ...props}) => (
                        <ol className="list-decimal list-inside mb-4 space-y-1" {...props}>
                            {children}
                        </ol>
                    ),
                    li: ({children, ...props}) => (
                        <li className="text-foreground leading-7" {...props}>
                            {children}
                        </li>
                    ),

                    // Custom table components
                    table: ({children, ...props}) => (
                        <div className="my-6 overflow-x-auto">
                            <table
                                className="w-full border-collapse border border-border rounded-lg overflow-hidden"
                                {...props}
                            >
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({children, ...props}) => (
                        <thead className="bg-muted" {...props}>
                        {children}
                        </thead>
                    ),
                    tbody: ({children, ...props}) => (
                        <tbody {...props}>
                        {children}
                        </tbody>
                    ),
                    tr: ({children, ...props}) => (
                        <tr className="border-b border-border" {...props}>
                            {children}
                        </tr>
                    ),
                    th: ({children, ...props}) => (
                        <th
                            className="px-4 py-2 text-left font-semibold text-foreground border-r border-border last:border-r-0"
                            {...props}
                        >
                            {children}
                        </th>
                    ),
                    td: ({children, ...props}) => (
                        <td
                            className="px-4 py-2 text-foreground border-r border-border last:border-r-0"
                            {...props}
                        >
                            {children}
                        </td>
                    ),

                    // Custom horizontal rule
                    hr: ({...props}) => (
                        <hr className="my-8 border-border" {...props} />
                    ),

                    // Custom strong and emphasis
                    strong: ({children, ...props}) => (
                        <strong className="font-semibold text-foreground" {...props}>
                            {children}
                        </strong>
                    ),
                    em: ({children, ...props}) => (
                        <em className="italic text-foreground" {...props}>
                            {children}
                        </em>
                    ),
                }}
            >
                {processedContent}
            </ReactMarkdown>
        </div>
    );
}

/**
 * Compact MDX Renderer for previews and cards
 */
export function MDXRendererCompact({
                                       content,
                                       maxLines = 3,
                                       className,
                                       ...props
                                   }: MDXRendererProps & { maxLines?: number }) {
    const truncatedContent = useMemo(() => {
        if (!content) return '';

        const lines = content.split('\n').slice(0, maxLines);
        return lines.join('\n');
    }, [content, maxLines]);

    return (
        <__mdxRenderer
            content={truncatedContent}
            variant="compact"
            className={cn('line-clamp-3', className)}
            showImageCaptions={false}
            enableLinks={false}
            {...props}
        />
    );
}

/**
 * MDX Renderer with Card wrapper
 */
export function MDXRendererCard({
                                    content,
                                    title,
                                    className,
                                    ...props
                                }: MDXRendererProps & { title?: string }) {
    return (
        <Card className={className}>
            <CardContent className="p-6">
                {title && (
                    <h3 className="text-lg font-semibold mb-4">{title}</h3>
                )}
                <__mdxRenderer content={content} {...props} />
            </CardContent>
        </Card>
    );
}
