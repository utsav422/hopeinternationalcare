// Structured Data (JSON-LD) utilities for SEO

export interface Organization {
    name: string;
    url: string;
    logo: string;
    description: string;
    address: {
        streetAddress: string;
        addressLocality: string;
        addressRegion: string;
        postalCode: string;
        addressCountry: string;
    };
    contactPoint: {
        telephone: string;
        email: string;
        contactType: string;
    };
    sameAs: string[];
}

export interface Course {
    id: string;
    title: string;
    course_highlights: string | null;
    course_overview: string | null;
    slug: string;
    image_url?: string | null;
    price?: number;
    duration_type?: string;
    duration_value?: number;
    level?: number;
    created_at: string;
    updated_at?: string | null;
}

export interface BreadcrumbItem {
    name: string;
    url: string;
}

// Organization structured data
export function generateOrganizationSchema(org: Organization) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: org.name,
        url: org.url,
        logo: org.logo,
        description: org.description,
        address: {
            '@type': 'PostalAddress',
            streetAddress: org.address.streetAddress,
            addressLocality: org.address.addressLocality,
            addressRegion: org.address.addressRegion,
            postalCode: org.address.postalCode,
            addressCountry: org.address.addressCountry,
        },
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: org.contactPoint.telephone,
            email: org.contactPoint.email,
            contactType: org.contactPoint.contactType,
        },
        sameAs: org.sameAs,
    };
}

// Educational Organization schema
export function generateEducationalOrganizationSchema(org: Organization) {
    return {
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        name: org.name,
        url: org.url,
        logo: org.logo,
        description: org.description,
        address: {
            '@type': 'PostalAddress',
            streetAddress: org.address.streetAddress,
            addressLocality: org.address.addressLocality,
            addressRegion: org.address.addressRegion,
            postalCode: org.address.postalCode,
            addressCountry: org.address.addressCountry,
        },
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: org.contactPoint.telephone,
            email: org.contactPoint.email,
            contactType: org.contactPoint.contactType,
        },
        sameAs: org.sameAs,
        hasCredential: {
            '@type': 'EducationalOccupationalCredential',
            name: 'Caregiver Training Certificate',
            description:
                'Professional certification for aged care and elderly care services',
        },
    };
}

// Course structured data
export function generateCourseSchema(course: Course, organizationName: string) {
    const baseUrl = 'https://hopeinternational.com.np';

    return {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: course.title,
        highlights: course.course_highlights,
        overview: course.course_overview,
        url: `${baseUrl}/courses/${course.slug}`,
        image: course.image_url
            ? `${baseUrl}${course.image_url}`
            : `${baseUrl}/opengraph-image.png`,
        provider: {
            '@type': 'EducationalOrganization',
            name: organizationName,
            url: baseUrl,
        },
        courseCode: course.id,
        educationalLevel: course.level ? `Level ${course.level}` : 'Beginner',
        timeRequired:
            course.duration_value && course.duration_type
                ? `P${course.duration_value}${course.duration_type.charAt(0).toUpperCase()}`
                : undefined,
        dateCreated: course.created_at,
        dateModified: course.updated_at || course.created_at,
        ...(course.price && {
            offers: {
                '@type': 'Offer',
                price: course.price,
                priceCurrency: 'NPR',
                availability: 'https://schema.org/InStock',
            },
        }),
    };
}

// Breadcrumb structured data
export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

// Website structured data
export function generateWebsiteSchema(name: string, url: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name,
        url,
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${url}/courses?search={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };
}

// Article structured data (for blog posts or detailed pages)
export function generateArticleSchema(article: {
    title: string;
    description: string;
    url: string;
    image?: string;
    datePublished: string;
    dateModified?: string;
    author: string;
    organizationName: string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.description,
        url: article.url,
        image:
            article.image ||
            'https://hopeinternational.com.np/opengraph-image.png',
        datePublished: article.datePublished,
        dateModified: article.dateModified || article.datePublished,
        author: {
            '@type': 'Organization',
            name: article.author,
        },
        publisher: {
            '@type': 'Organization',
            name: article.organizationName,
            logo: {
                '@type': 'ImageObject',
                url: 'https://hopeinternational.com.np/opengraph-image.png',
            },
        },
    };
}

// FAQ structured data
export function generateFAQSchema(
    faqs: { question: string; answer: string }[]
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };
}

// Default organization data for Hope International
export const hopeInternationalOrg: Organization = {
    name: 'Hope International',
    url: 'https://hopeinternational.com.np',
    logo: 'https://hopeinternational.com.np/opengraph-image.png',
    description:
        'Hope International is a leading training center in Kathmandu, Nepal, providing comprehensive caregiver training and elderly care services.',
    address: {
        streetAddress: 'Durga Bhawan, Rudramati Marga, Anamnagar',
        addressLocality: 'Kathmandu',
        addressRegion: 'Bagmati Province',
        postalCode: '44600',
        addressCountry: 'NP',
    },
    contactPoint: {
        telephone: '+977-980-10813999',
        email: 'info@hopeinternationalcare.org',
        contactType: 'Customer Service',
    },
    sameAs: [
        'https://www.facebook.com/p/Hope-International-100063736525249/',
        'https://www.linkedin.com/company/hopeinternational',
    ],
};

// Review/Testimonial structured data
export function generateReviewSchema(
    reviews: {
        author: string;
        reviewBody: string;
        ratingValue: number;
        datePublished: string;
        image?: string;
        title?: string;
    }[]
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: hopeInternationalOrg.name,
        url: hopeInternationalOrg.url,
        review: reviews.map(review => ({
            '@type': 'Review',
            author: {
                '@type': 'Person',
                name: review.author,
                ...(review.image && { image: review.image }),
            },
            reviewBody: review.reviewBody,
            reviewRating: {
                '@type': 'Rating',
                ratingValue: review.ratingValue,
                bestRating: 5,
                worstRating: 1,
            },
            datePublished: review.datePublished,
            ...(review.title && { name: review.title }),
        })),
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue:
                reviews.reduce((sum, review) => sum + review.ratingValue, 0) /
                reviews.length,
            reviewCount: reviews.length,
            bestRating: 5,
            worstRating: 1,
        },
    };
}

// Local Business structured data
export function generateLocalBusinessSchema(org: Organization) {
    return {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': org.url,
        name: org.name,
        url: org.url,
        logo: org.logo,
        description: org.description,
        image: org.logo,
        address: {
            '@type': 'PostalAddress',
            streetAddress: org.address.streetAddress,
            addressLocality: org.address.addressLocality,
            addressRegion: org.address.addressRegion,
            postalCode: org.address.postalCode,
            addressCountry: org.address.addressCountry,
        },
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: org.contactPoint.telephone,
            email: org.contactPoint.email,
            contactType: org.contactPoint.contactType,
            availableLanguage: ['English', 'Nepali'],
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: 27.7172,
            longitude: 85.324,
        },
        openingHours: ['Mo-Fr 09:00-17:00', 'Sa 09:00-15:00'],
        priceRange: '$$',
        currenciesAccepted: 'NPR',
        paymentAccepted: 'Cash, Bank Transfer',
        sameAs: org.sameAs,
        hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Caregiver Training Courses',
            itemListElement: [
                {
                    '@type': 'Offer',
                    itemOffered: {
                        '@type': 'Course',
                        name: 'Basic Caregiver Training',
                        description: 'Comprehensive training for elderly care',
                    },
                },
                {
                    '@type': 'Offer',
                    itemOffered: {
                        '@type': 'Course',
                        name: 'Advanced Caregiver Training',
                        description:
                            'Specialized training for complex care needs',
                    },
                },
            ],
        },
    };
}

// Service structured data
export function generateServiceSchema(
    services: {
        name: string;
        description: string;
        provider: string;
        serviceType: string;
        areaServed?: string;
    }[]
) {
    return services.map(service => ({
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: service.name,
        description: service.description,
        provider: {
            '@type': 'Organization',
            name: service.provider,
            url: hopeInternationalOrg.url,
        },
        serviceType: service.serviceType,
        areaServed: service.areaServed || 'Kathmandu, Nepal',
        hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: service.name,
            itemListElement: [
                {
                    '@type': 'Offer',
                    itemOffered: {
                        '@type': 'Service',
                        name: service.name,
                        description: service.description,
                    },
                },
            ],
        },
    }));
}

// Person structured data (for team members)
export function generatePersonSchema(person: {
    name: string;
    jobTitle: string;
    description?: string;
    image?: string;
    email?: string;
    worksFor: string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: person.name,
        jobTitle: person.jobTitle,
        ...(person.description && { description: person.description }),
        ...(person.image && { image: person.image }),
        ...(person.email && { email: person.email }),
        worksFor: {
            '@type': 'Organization',
            name: person.worksFor,
            url: hopeInternationalOrg.url,
        },
    };
}

// ContactPage structured data
export function generateContactPageSchema(org: Organization) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Contact Hope International',
        description:
            'Get in touch with Hope International for caregiver training and elderly care services',
        url: `${org.url}/contactus`,
        mainEntity: {
            '@type': 'Organization',
            name: org.name,
            url: org.url,
            contactPoint: [
                {
                    '@type': 'ContactPoint',
                    telephone: org.contactPoint.telephone,
                    contactType: 'Customer Service',
                    availableLanguage: ['English', 'Nepali'],
                    hoursAvailable: {
                        '@type': 'OpeningHoursSpecification',
                        dayOfWeek: [
                            'Monday',
                            'Tuesday',
                            'Wednesday',
                            'Thursday',
                            'Friday',
                        ],
                        opens: '09:00',
                        closes: '17:00',
                    },
                },
                {
                    '@type': 'ContactPoint',
                    email: org.contactPoint.email,
                    contactType: 'Customer Service',
                },
            ],
            address: {
                '@type': 'PostalAddress',
                streetAddress: org.address.streetAddress,
                addressLocality: org.address.addressLocality,
                addressRegion: org.address.addressRegion,
                postalCode: org.address.postalCode,
                addressCountry: org.address.addressCountry,
            },
        },
    };
}

// AboutPage structured data
export function generateAboutPageSchema(org: Organization) {
    return {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'About Hope International',
        description:
            "Learn about Hope International's mission, vision, and commitment to elderly care training",
        url: `${org.url}/aboutus`,
        mainEntity: {
            '@type': 'Organization',
            name: org.name,
            url: org.url,
            description: org.description,
            foundingDate: '2020',
            mission:
                'To empower caregivers with comprehensive training and support, and to provide compassionate and specialized care to elderly individuals, enhancing their quality of life and promoting their well-being.',
            vision: 'We aim to establish a one-of-a-kind care home dedicated to providing exceptional care for seniors with various age-related challenges, setting the standard for eldercare in Nepal.',
            values: [
                'Compassion',
                'Excellence',
                'Integrity',
                'Innovation',
                'Respect',
            ],
            address: {
                '@type': 'PostalAddress',
                streetAddress: org.address.streetAddress,
                addressLocality: org.address.addressLocality,
                addressRegion: org.address.addressRegion,
                postalCode: org.address.postalCode,
                addressCountry: org.address.addressCountry,
            },
        },
    };
}

// Utility function to generate structured data JSON string
export function generateStructuredDataJSON(data: object | object[]): string {
    const schemas = Array.isArray(data) ? data : [data];
    return JSON.stringify(schemas.length === 1 ? schemas[0] : schemas);
}
