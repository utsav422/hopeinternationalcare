import type { Metadata } from 'next';

export interface SEOConfig {
    title: string;
    description: string;
    keywords?: string[];
    author?: string;
    canonical?: string;
    image?: string;
    imageAlt?: string;
    type?: 'website' | 'article' | 'course';
    publishedTime?: string;
    modifiedTime?: string;
    section?: string;
    tags?: string[];
    noIndex?: boolean;
    noFollow?: boolean;
    locale?: string;
    alternateLocales?: { locale: string; url: string }[];

}

const defaultConfig = {
    siteName: 'Hope International',
    siteUrl: 'https://hopeinternational.com.np',
    defaultImage: '/opengraph-image.png',
    defaultImageAlt: 'Hope International - Aged Care Training and Elderly Care Center',
    twitterHandle: '@hopeinternational',
    locale: 'en_US',
    author: 'Hope International',
};

export function generateMetadata(config: SEOConfig): Metadata {
    const {
        title,
        description,
        keywords = [],
        author = defaultConfig.author,
        canonical,
        image = defaultConfig.defaultImage,
        imageAlt = defaultConfig.defaultImageAlt,
        type = 'website',
        publishedTime,
        modifiedTime,
        section,
        tags = [],
        noIndex = false,
        noFollow = false,
        locale = defaultConfig.locale,
        alternateLocales = [],

    } = config;

    const fullTitle = title.includes(defaultConfig.siteName)
        ? title
        : `${title} | ${defaultConfig.siteName}`;

    const imageUrl = image.startsWith('http')
        ? image
        : `${defaultConfig.siteUrl}${image}`;

    const canonicalUrl = canonical || defaultConfig.siteUrl;

    // Build robots directive
    const robotsDirective = (() => {
        const robotsDirectives = [];
        if (noIndex) robotsDirectives.push('noindex');
        if (noFollow) robotsDirectives.push('nofollow');
        if (!noIndex && !noFollow) robotsDirectives.push('index', 'follow');
        return robotsDirectives.join(', ');
    })();

    const metadata: Metadata = {
        title: fullTitle,
        description,
        keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
        authors: [{ name: author }],
        creator: author,
        publisher: defaultConfig.siteName,
        robots: robotsDirective,

        // Canonical URL
        alternates: {
            canonical: canonicalUrl,
            languages: alternateLocales.reduce((acc, alt) => {
                acc[alt.locale] = alt.url;
                return acc;
            }, {} as Record<string, string>),
        },

        // Open Graph
        openGraph: {
            title: fullTitle,
            description,
            url: canonicalUrl,
            siteName: defaultConfig.siteName,
            locale,
            type: type === 'course' ? 'article' : type,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: imageAlt,
                },
            ],
            ...(publishedTime && { publishedTime }),
            ...(modifiedTime && { modifiedTime }),
            ...(section && { section }),
            ...(tags.length > 0 && { tags }),
        },

        // Twitter Cards
        twitter: {
            card: 'summary_large_image',
            site: defaultConfig.twitterHandle,
            creator: defaultConfig.twitterHandle,
            title: fullTitle,
            description,
            images: [
                {
                    url: imageUrl,
                    alt: imageAlt,
                },
            ],
        },

        // Additional meta tags
        other: {
            'theme-color': '#ffffff',
            'color-scheme': 'light dark',
            'format-detection': 'telephone=no',
            'mobile-web-app-capable': 'yes',
            'apple-mobile-web-app-status-bar-style': 'default',
            'apple-mobile-web-app-title': defaultConfig.siteName,
            'application-name': defaultConfig.siteName,
            'msapplication-TileColor': '#ffffff',
            'msapplication-config': '/browserconfig.xml',
        },
    };

    return metadata;
}

// Predefined SEO configs for common pages
export const seoConfigs = {
    home: {
        title: 'Hope International - Aged Care Training and Elderly Care Center',
        description: 'Hope International is a leading training center in Kathmandu, Nepal, providing comprehensive caregiver training and elderly care services. ',
        keywords: ['aged care training', 'elderly care', 'caregiver training', 'Nepal', 'Kathmandu', 'healthcare training'] as string[],
        type: 'website' as const,
    },

    courses: {
        title: 'Our Courses',
        description: 'Explore the wide range of courses we offer at Hope International. We provide comprehensive training for caregivers, including specialized courses for various levels of care.',
        keywords: ['caregiver courses', 'aged care training', 'healthcare courses', 'certification programs'] as string[],
        canonical: '/courses',
        type: 'website' as const,
    },

    about: {
        title: 'About Us',
        description: 'Learn more about Hope International, our mission, vision, and our dedicated team. We are committed to providing the best caregiver training and elderly care services in Nepal.',
        keywords: ['about hope international', 'mission', 'vision', 'team', 'aged care training'] as string[],
        canonical: '/aboutus',
        type: 'website' as const,
        robotsConfig: 'public' as const,
    },

    contact: {
        title: 'Contact Us',
        description: 'Get in touch with Hope International. We are always available for your queries and feedbacks. Find our contact details and location here.',
        keywords: ['contact', 'location', 'phone', 'email', 'address', 'Kathmandu'] as string[],
        canonical: '/contactus',
        type: 'website' as const,
    },
} as const;

// Helper function for course pages
export function generateCourseMetadata(course: {
    title: string;
    description?: string | null;
    slug: string;
    image_url?: string | null;
    created_at: string;
    updated_at?: string | null;
    level?: number | null;
    duration_type?: string | null;
    duration_value?: number | null;
}): Metadata {
    const keywords = [
        course.title.toLowerCase(),
        'caregiver training',
        'aged care course',
        'healthcare training',
        course.level && `Level ${course.level}`,
        course.duration_type && `${course.duration_value} ${course.duration_type} course`,
    ].filter(Boolean) as string[];

    return generateMetadata({
        title: course.title,
        description: course.description || `Learn ${course.title} at Hope International. Professional caregiver training course designed to provide comprehensive skills for elderly care.`,
        keywords,
        canonical: `/courses/${course.slug}`,
        image: course.image_url || undefined,
        imageAlt: `${course.title} - Hope International Course`,
        type: 'course',
        publishedTime: course.created_at,
        modifiedTime: course.updated_at || course.created_at,
        section: 'Courses',
        tags: keywords,
    });
}
