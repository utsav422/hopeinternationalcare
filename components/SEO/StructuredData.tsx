import {
    generateOrganizationSchema,
    generateEducationalOrganizationSchema,
    generateCourseSchema,
    generateBreadcrumbSchema,
    generateWebsiteSchema,
    generateArticleSchema,
    generateFAQSchema,
    generateReviewSchema,
    generateLocalBusinessSchema,
    generateServiceSchema,
    generatePersonSchema,
    generateContactPageSchema,
    generateAboutPageSchema,
    hopeInternationalOrg,
    generateStructuredDataJSON,
    type Course,
    type BreadcrumbItem,
} from '@/lib/seo/structured-data';

interface StructuredDataProps {
    type: 'organization' | 'educational-organization' | 'course' | 'breadcrumb' | 'website' | 'article' | 'faq' | 'review' | 'local-business' | 'service' | 'person' | 'contact-page' | 'about-page';
    data?: any;
}

export function StructuredData({ type, data }: StructuredDataProps) {
    let schema;

    switch (type) {
        case 'organization':
            schema = generateOrganizationSchema(hopeInternationalOrg);
            break;

        case 'educational-organization':
            schema = generateEducationalOrganizationSchema(hopeInternationalOrg);
            break;

        case 'course':
            if (!data) return null;
            schema = generateCourseSchema(data as Course, hopeInternationalOrg.name);
            break;

        case 'breadcrumb':
            if (!data) return null;
            schema = generateBreadcrumbSchema(data as BreadcrumbItem[]);
            break;

        case 'website':
            schema = generateWebsiteSchema(hopeInternationalOrg.name, hopeInternationalOrg.url);
            break;

        case 'article':
            if (!data) return null;
            schema = generateArticleSchema({
                ...data,
                organizationName: hopeInternationalOrg.name,
            });
            break;

        case 'faq':
            if (!data) return null;
            schema = generateFAQSchema(data);
            break;

        case 'review':
            if (!data) return null;
            schema = generateReviewSchema(data);
            break;

        case 'local-business':
            schema = generateLocalBusinessSchema(hopeInternationalOrg);
            break;

        case 'service':
            if (!data) return null;
            schema = generateServiceSchema(data);
            break;

        case 'person':
            if (!data) return null;
            schema = generatePersonSchema(data);
            break;

        case 'contact-page':
            schema = generateContactPageSchema(hopeInternationalOrg);
            break;

        case 'about-page':
            schema = generateAboutPageSchema(hopeInternationalOrg);
            break;

        default:
            return null;
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: generateStructuredDataJSON(schema),
            }}
        />
    );
}

// Convenience components for common use cases
export function OrganizationStructuredData() {
    return <StructuredData type="organization" />;
}

export function EducationalOrganizationStructuredData() {
    return <StructuredData type="educational-organization" />;
}

export function WebsiteStructuredData() {
    return <StructuredData type="website" />;
}

export function CourseStructuredData({ course }: { course: Course }) {
    return <StructuredData type="course" data={course} />;
}

export function BreadcrumbStructuredData({ items }: { items: BreadcrumbItem[] }) {
    return <StructuredData type="breadcrumb" data={items} />;
}

export function ArticleStructuredData({
    title,
    description,
    url,
    image,
    datePublished,
    dateModified,
    author
}: {
    title: string;
    description: string;
    url: string;
    image?: string;
    datePublished: string;
    dateModified?: string;
    author: string;
}) {
    return (
        <StructuredData
            type="article"
            data={{
                title,
                description,
                url,
                image,
                datePublished,
                dateModified,
                author,
            }}
        />
    );
}

export function FAQStructuredData({ faqs }: { faqs: { question: string; answer: string }[] }) {
    return <StructuredData type="faq" data={faqs} />;
}

export function ReviewStructuredData({
    reviews
}: {
    reviews: {
        author: string;
        reviewBody: string;
        ratingValue: number;
        datePublished: string;
        image?: string;
        title?: string;
    }[]
}) {
    return <StructuredData type="review" data={reviews} />;
}

export function LocalBusinessStructuredData() {
    return <StructuredData type="local-business" />;
}

export function ServiceStructuredData({
    services
}: {
    services: {
        name: string;
        description: string;
        provider: string;
        serviceType: string;
        areaServed?: string;
    }[]
}) {
    return <StructuredData type="service" data={services} />;
}

export function PersonStructuredData({
    person
}: {
    person: {
        name: string;
        jobTitle: string;
        description?: string;
        image?: string;
        email?: string;
        worksFor: string;
    }
}) {
    return <StructuredData type="person" data={person} />;
}

export function ContactPageStructuredData() {
    return <StructuredData type="contact-page" />;
}

export function AboutPageStructuredData() {
    return <StructuredData type="about-page" />;
}
