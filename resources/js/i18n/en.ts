/**
 * English translation bundle. Bundled at build time (not loaded over HTTP).
 * Keep keys flat-ish and grouped by page/feature for findability.
 *
 * CMS content from SiteContent ALWAYS overrides these — these are the fallbacks
 * the public site falls back to when admin hasn't seeded a value.
 */
const en = {
    common: {
        contactUs: 'Contact Us',
        learnMore: 'Learn More',
        exploreMore: 'Explore More',
        viewAll: 'View All',
        readMore: 'Read More',
        send: 'Send',
        submit: 'Submit',
        cancel: 'Cancel',
        save: 'Save',
        loading: 'Loading…',
        required: 'Required',
        optional: 'Optional',
    },
    nav: {
        home: 'Home',
        properties: 'Properties',
        investment: 'Investment',
        selfBuild: 'Self Build',
        security: 'Security With SkyAmman',
        about: 'About Us',
        contact: 'Contact Us',
        login: 'Admin Login',
    },
    language: {
        toggle: 'العربية',
    },
    home: {
        hero: {
            title: 'Real Estate Development',
            location: 'In Amman',
            subtitle: 'With Security, Credibility and Transparency',
            cta: 'Explore Projects',
        },
        investmentBanner: {
            tagline: 'Buy Early, Save More, Gain More',
            cta: 'Investment Opportunities',
        },
        about: {
            title: 'Who We Are?',
            body: 'SkyAmman is a real estate development company based in Amman, specializing in residential, commercial, office, and medical projects. We deliver quality driven developments and integrated real estate solutions, while offering flexible property ownership options built on trust, value, and long term vision.',
        },
        stats: {
            clients: 'Clients',
            projects: 'Projects Delivered',
            years: 'Years Experience',
            sqm: 'm² Developed',
        },
        assurance: {
            financial: {
                title: 'Financial Assurance',
                bullets: [
                    'Contracts are drafted and verified by a dedicated legal department',
                    'All payments are officially documented',
                    'Full support through the property registration process',
                    'Legal verification of land ownership before project initiation',
                ],
            },
            legal: {
                title: 'Legal Assurance',
                bullets: [
                    'Client payments are protected until ownership registration',
                    'Flexible financing solutions through banking partners',
                    'Full transparency in pricing and payment schedules',
                    'No hidden costs or unexpected obligations',
                ],
            },
            safety: {
                title: 'Construction Safety & Quality',
                bullets: [
                    'Projects executed under certified engineering supervision',
                    'Approved execution partners recognized by official authorities',
                    'Strict adherence to technical specifications',
                    'Use of trusted and verified suppliers',
                ],
            },
        },
        secureCta: {
            title: 'Secure Investment',
        },
        showcase: {
            title: 'Project Showcase',
            tabs: {
                underDevelopment: 'Projects Under Development',
                ready: 'Ready Projects',
                investmentOpportunity: 'Investment Opportunities',
            },
        },
        valueProposition: {
            title: 'Value Proposition',
            items: [
                { title: 'Over 30 Years Of Experience In Real Estate' },
                { title: 'Legally, Financially, And Structurally Secured Projects' },
                { title: 'Lower Prices With Early Purchase' },
                { title: 'Flexible Payment Plans' },
            ],
        },
        mediaRoom: {
            title: 'Media Room',
            linkedinHeading: 'LinkedIn',
            instagramHeading: 'Instagram',
        },
        location: {
            title: 'Our Location',
        },
    },
    properties: {
        hero: {
            label: 'PROPERTIES',
            title: 'Spaces that work for you',
            subtitle: 'Browse residential and commercial properties with clarity and ease',
        },
        bottomCta: {
            title: 'Find The Right Space, Made Simple',
            subtitle: 'Explore residential and commercial properties with clear details and guided support.',
        },
        card: {
            forSale: 'FOR SALE',
            forRent: 'FOR RENT',
            sold: 'SOLD',
            reserved: 'RESERVED',
        },
        detail: {
            details: 'Details',
            livingSpace: 'Living Space',
            completionYear: 'Completion Year',
            floors: 'Floors',
            bedrooms: 'Bedrooms',
            bathrooms: 'Bathrooms',
            related: {
                title: 'FIND HOMES THAT PERFECTLY MATCH YOUR LIFESTYLE',
            },
        },
    },
    investment: {
        hero: {
            title: 'WHY TO INVEST IN AMMAN THROUGH PROPERTIES (BUY/ RENT OR BUILD)?',
        },
        editorial: {
            heading: 'Amman Continues To Position Itself As One Of The Most Stable And Promising Real Estate Markets In The Region',
            body: 'Its strategic location, political stability, and growing infrastructure make it an attractive destination for both local and international investors.',
        },
        cta: {
            heading: 'For Investors Seeking A Balanced Market With Steady Appreciation And Controlled Risk, SkyAmman Provides A Reliable Investment Environment.',
            button: 'Self Build Service',
        },
    },
    selfBuild: {
        hero: {
            title: 'BUILD YOUR PROPERTY, YOUR VISION',
        },
        process: {
            title: 'Process Flow',
            steps: [
                'Land Selection',
                'Legal Verification',
                'Engineering Design',
                'Specifications',
                'Execution',
                'Documentation',
                'Handover',
            ],
        },
    },
    security: {
        hero: {
            title: 'Security With SkyAmman',
        },
    },
    about: {
        hero: {
            title: 'About Us',
        },
    },
    contact: {
        hero: {
            title: 'Get in Touch',
            subtitle: 'Tell us what you are looking for and we will reach out shortly.',
        },
        form: {
            name: 'Name',
            email: 'Email',
            phone: 'Phone',
            requestType: 'Request Type',
            subject: 'Subject',
            message: 'Message',
            requestTypes: {
                buy: 'Buy',
                rent: 'Rent',
                build: 'Build',
                investment: 'Investment',
                general: 'General Inquiry',
            },
            submit: 'Send Message',
            success: 'Thank you — we received your message and will get back to you soon.',
        },
    },
    footer: {
        tagline: 'Real Estate Consultancy',
        sections: {
            mainPages: 'Main Pages',
            followUs: 'Follow Us',
            contact: 'Contact',
        },
        copyright: 'All rights reserved.',
    },
} as const;

export default en;
