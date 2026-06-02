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
        departments: {
            title: 'Head of Departments',
            member1Name: 'Eng. Mahmoud Abu Sarhan',
            member1Role: 'Chief Executive Officer',
            member2Name: 'Eng. Hossam Salameh',
            member2Role: 'Projects Director',
            member3Name: 'Mr. Mohammad Makhl',
            member3Role: 'Chief Financial Officer',
            member4Name: 'Mr. Sadad Al Rawashdeh',
            member4Role: 'Legal Director',
        },
        managingPartner: {
            label: 'Managing Partner',
            name: 'MR. Jameel Abu Hajleh',
            body1: 'At SkyAmman, we believe that successful real estate investment begins with stability, vision, and trust. Jordan today stands as a strong example of security, urban growth, and promising investment opportunities, making it an ideal environment for modern real estate development.',
            body2: 'From the beginning, our focus has been on delivering projects that combine quality, contemporary design, and long-term value while ensuring that every development reflects the needs and expectations of our clients.',
            body3: 'Our mission at SkyAmman goes beyond developing properties, we aim to contribute to a modern urban future that reflects the true potential of Jordan and creates lasting value for generations to come.',
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
            title: 'Properties for Sale',
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
        filters: {
            all: 'All Properties',
            forSale: 'For Sale',
            forRent: 'For Rent',
            availableForSale: 'Available only',
            development: 'Development',
            allGroups: 'All',
        },
        resultCount: '{{count}} properties',
        empty: 'No properties match this filter yet.',
        gallery: {
            title: 'Projects Gallery',
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
        label: 'Contact',
        hero: {
            title: 'Get in Touch',
            subtitle: 'Tell us what you are looking for and we will reach out shortly.',
        },
        aboutProject: 'Inquiry about {{name}}',
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
            sending: 'Sending…',
            success: 'Thank you — we received your message and will get back to you soon.',
            verifyFailed: 'Verification failed. Please try again.',
            error: 'Something went wrong. Please try again.',
        },
    },
    footer: {
        tagline: 'Real Estate Consultancy',
        subscribe: {
            label: 'Subscribe To Our Newsletter',
            cta: 'Contact Us',
            placeholder: 'Enter your email',
            submit: 'Subscribe',
            submitting: 'Subscribing…',
        },
        sections: {
            mainPages: 'Main pages',
            otherPages: 'Other pages',
            followUs: 'Follow us',
            contact: 'Contact',
        },
        mainPages: {
            home: 'Home',
            listings: 'Listings',
            blog: 'Blog',
            about: 'About',
            contact: 'Contact',
        },
        otherPages: {
            listing: 'Listing',
            blog: 'Blog',
            agent: 'Agent',
            privacy: 'Privacy policy',
            notFound: '404',
        },
        socials: {
            linkedin: 'Linkedin',
            youtube: 'Youtube',
            x: 'X',
            meta: 'Meta',
            tiktok: 'Tiktok',
        },
        copyright: 'All rights reserved',
        privacyPolicy: 'Privacy policy',
    },
} as const;

export default en;
