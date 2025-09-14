import type { MetadataRoute } from 'next';

// Next.js 15 Web App Manifest for PWA and SEO optimization
export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Hope International - Aged Care Training Center',
        short_name: 'Hope International',
        description: 'Leading caregiver training center in Kathmandu, Nepal. Professional elderly care training and certification programs.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2563eb',
        orientation: 'portrait-primary',
        scope: '/',
        lang: 'en',
        dir: 'ltr',

        // App categories for better discoverability
        categories: ['education', 'healthcare', 'training', 'professional'],

        // Icons for different platforms and sizes
        icons: [
            {
                src: '/favicon_io/android-chrome-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable'
            },
            {
                src: '/favicon_io/android-chrome-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable'
            },
            {
                src: '/favicon_io/android-chrome-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any'
            },
            {
                src: '/favicon_io/android-chrome-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any'
            },
            {
                src: '/favicon_io/apple-touch-icon.png',
                sizes: '180x180',
                type: 'image/png',
                purpose: 'any'
            },
            {
                src: '/favicon_io/favicon-32x32.png',
                sizes: '32x32',
                type: 'image/png',
                purpose: 'any'
            },
            {
                src: '/favicon_io/favicon-16x16.png',
                sizes: '16x16',
                type: 'image/png',
                purpose: 'any'
            }
        ],

        // Screenshots for app stores
        screenshots: [
            {
                src: '/screenshot-wide.png',
                sizes: '1280x720',
                type: 'image/png',
                form_factor: 'wide',
                label: 'Hope International Course Catalog'
            },
            {
                src: '/screenshot-narrow.png',
                sizes: '720x1280',
                type: 'image/png',
                form_factor: 'narrow',
                label: 'Hope International Mobile View'
            }
        ],

        // Shortcuts for quick access
        shortcuts: [
            {
                name: 'Browse Courses',
                short_name: 'Courses',
                description: 'View all available caregiver training courses',
                url: '/courses',
                icons: [
                    {
                        src: '/favicon_io/icon-courses.png',
                        sizes: '96x96',
                        type: 'image/png'
                    }
                ]
            },
            {
                name: 'Contact Us',
                short_name: 'Contact',
                description: 'Get in touch with Hope International',
                url: '/contactus',
                icons: [
                    {
                        src: '/favicon_io/icon-contact.png',
                        sizes: '96x96',
                        type: 'image/png'
                    }
                ]
            },
            {
                name: 'About Us',
                short_name: 'About',
                description: 'Learn about our mission and vision',
                url: '/aboutus',
                icons: [
                    {
                        src: '/favicon_io/icon-about.png',
                        sizes: '96x96',
                        type: 'image/png'
                    }
                ]
            }
        ],

        // Related applications
        related_applications: [
            {
                platform: 'web',
                url: 'https://hopeinternational.com.np'
            }
        ],

        // Prefer related applications
        prefer_related_applications: false,

        // Protocol handlers
        protocol_handlers: [
            {
                protocol: 'mailto',
                url: '/contactus?email=%s'
            }
        ],

        // File handlers for educational content
        file_handlers: [
            {
                action: '/courses',
                accept: {
                    'application/pdf': ['.pdf'],
                    'text/plain': ['.txt']
                }
            }
        ],

        // Share target for social sharing
        share_target: {
            action: '/share',
            method: 'POST',
            enctype: 'multipart/form-data',
            params: {
                title: 'title',
                text: 'text',
                url: 'url'
            }
        },

        // Launch handler
        launch_handler: {
            client_mode: 'navigate-existing'
        }
    };
}
