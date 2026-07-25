<?php

namespace Database\Seeders;

use App\Models\SiteContent;
use Illuminate\Database\Seeder;

/**
 * Seeds the editable copy for every public page section based on the Figma frames.
 * Admin overrides these via the Site Content tab; the i18n bundles in
 * resources/js/i18n/{en,ar}.ts hold the same strings as code-side fallbacks.
 */
class SiteContentSeeder extends Seeder
{
    /**
     * The canonical default copy for every public section: [page, section, key,
     * en, ar]. Single source of truth shared by initial seeding AND the admin
     * "Reset to Default" safeguard (SiteContentController::reset), so a reset
     * always restores exactly what we ship.
     *
     * NOTE: page-level SEO (the seo_title / seo_description columns on the
     * `pages` table) has NO defaults here yet — when real SEO copy is decided,
     * seed it on PagesSeeder and extend the reset to cover it (see CLAUDE.md).
     */
    public static function rows(): array
    {
        return [
            // ---------------- HOME ----------------
            ['home', 'hero', 'title', 'Real Estate Development', 'التطوير العقاري'],
            ['home', 'hero', 'location', 'In Amman', 'في عمّان'],
            ['home', 'hero', 'subtitle', 'With Security, Credibility and Transparency', 'بأمان ومصداقية وشفافية'],
            ['home', 'hero', 'cta', 'Explore Projects', 'استكشف المشاريع'],

            ['home', 'investment_banner', 'tagline', 'Buy Early, Save More, Gain More', 'اشترِ مبكراً، وفّر أكثر، اربح أكثر'],
            ['home', 'investment_banner', 'cta', 'Investment Opportunities', 'فرص الاستثمار'],

            ['home', 'managing_partner', 'label', 'Managing Partner', 'الشريك الإداري'],
            ['home', 'managing_partner', 'name', 'MR. Jameel Abu Hajlih', 'السيد جميل أبو حجلة'],
            ['home', 'managing_partner', 'body_1', 'At SkyAmman, we believe that successful real estate investment begins with stability, vision, and trust. Jordan today stands as a strong example of security, urban growth, and promising investment opportunities, making it an ideal environment for modern real estate development.', 'في سكاي عمّان، نؤمن بأن الاستثمار العقاري الناجح يبدأ بالاستقرار والرؤية والثقة. الأردن اليوم نموذج للأمان والنمو الحضري وفرص الاستثمار الواعدة، مما يجعله بيئة مثالية للتطوير العقاري الحديث.'],
            ['home', 'managing_partner', 'body_2', 'From the beginning, our focus has been on delivering projects that combine quality, contemporary design, and long-term value while ensuring that every development reflects the needs and expectations of our clients.', 'منذ البداية، تمحور تركيزنا على تقديم مشاريع تجمع بين الجودة والتصميم العصري والقيمة بعيدة المدى، مع ضمان أن يعكس كل تطوير احتياجات عملائنا وتطلعاتهم.'],
            ['home', 'managing_partner', 'body_3', 'Our mission at SkyAmman goes beyond developing properties, we aim to contribute to a modern urban future that reflects the true potential of Jordan and creates lasting value for generations to come.', 'تتجاوز مهمتنا في سكاي عمّان مجرد تطوير العقارات، إذ نسعى للمساهمة في مستقبل حضري عصري يعكس الإمكانات الحقيقية للأردن ويخلق قيمة دائمة للأجيال القادمة.'],

            // Only the section title is site_content; the members (with photos)
            // live in the department_members table — Admin → Head of Departments
            // (DepartmentMemberSeeder).
            ['home', 'departments', 'title', 'Head of Departments', 'رؤساء الأقسام'],

            ['home', 'about', 'title', 'Who We Are?', 'من نحن؟'],
            ['home', 'about', 'body', 'SkyAmman is a real estate development company based in Amman, specializing in residential, commercial, office, and medical projects. We deliver quality driven developments and integrated real estate solutions, while offering flexible property ownership options built on trust, value, and long term vision.', 'سكاي عمّان شركة تطوير عقاري مقرّها عمّان، متخصصة في المشاريع السكنية والتجارية والمكتبية والطبية. نُقدّم تطويرات عالية الجودة وحلولاً عقارية متكاملة، مع خيارات تملّك مرنة قائمة على الثقة والقيمة والرؤية بعيدة المدى.'],

            ['home', 'assurance_financial', 'number', '001', '001'],
            ['home', 'assurance_financial', 'title', 'Financial Assurance', 'الأمان المالي'],
            ['home', 'assurance_financial', 'bullet_1', 'Client payments are protected until ownership registration', 'ضمان حقوق العميل في جميع الدفعات حتى موعد التسجيل'],
            ['home', 'assurance_financial', 'bullet_2', 'Flexible financing solutions through banking partners', 'حلول تمويل مرنة بالتعاون مع شركاء مصرفيين'],
            ['home', 'assurance_financial', 'bullet_3', 'Full transparency in pricing and payment schedules', 'وضوح كامل في التكاليف وجدول الدفعات'],
            ['home', 'assurance_financial', 'bullet_4', 'No hidden costs or unexpected obligations', 'عدم وجود رسوم أو التزامات غير معلنة'],

            ['home', 'assurance_legal', 'number', '002', '002'],
            ['home', 'assurance_legal', 'title', 'Legal Assurance', 'الأمان القانوني'],
            ['home', 'assurance_legal', 'bullet_1', 'Contracts are drafted and verified by a dedicated legal department', 'صياغة وتوثيق العقود من خلال الدائرة القانونية المختصة'],
            ['home', 'assurance_legal', 'bullet_2', 'All payments are officially documented', 'توثيق جميع الدفعات بشكل رسمي'],
            ['home', 'assurance_legal', 'bullet_3', 'Full support through property registration until ownership transfer', 'متابعة إجراءات تسجيل العقار حتى نقل الملكية بالكامل'],
            ['home', 'assurance_legal', 'bullet_4', 'Legal verification of land ownership before project initiation', 'التحقق من سلامة الأرض قانونياً قبل بدء أي مشروع'],

            ['home', 'assurance_safety', 'number', '003', '003'],
            ['home', 'assurance_safety', 'title', 'Construction Safety & Quality', 'الأمان الإنشائي'],
            ['home', 'assurance_safety', 'bullet_1', 'Projects executed under certified engineering supervision', 'تنفيذ المشاريع بإشراف مكاتب هندسية معتمدة'],
            ['home', 'assurance_safety', 'bullet_2', 'Approved execution partners certified by official authorities (Ministry of Public Works, Engineers Syndicate, Contractors Syndicate)', 'درع تنفيذي مصنف من الجهات الرسمية (وزارة الأشغال، نقابة المهندسين، نقابة المقاولين)'],
            ['home', 'assurance_safety', 'bullet_3', 'Strict adherence to approved technical specifications', 'الالتزام بالمواصفات الفنية المعتمدة'],
            ['home', 'assurance_safety', 'bullet_4', 'Materials sourced from trusted and verified suppliers', 'استخدام مواد من موردين موثوقين ومعتمدين'],

            ['home', 'showcase', 'title', 'Properties for Sale', 'العقارات للبيع'],
            ['home', 'showcase', 'filter_under_development', 'Projects Under Development', 'مشاريع قيد التطوير'],
            ['home', 'showcase', 'filter_ready', 'Ready Projects', 'مشاريع جاهزة'],
            ['home', 'showcase', 'filter_investment', 'Investment Opportunities', 'فرص استثمارية'],
            ['home', 'showcase', 'card_cta', 'Explore More', 'استكشف المزيد'],

            ['home', 'rentals', 'title', 'Properties for Rent', 'العقارات للإيجار'],
            ['home', 'rentals', 'card_cta', 'Explore More', 'استكشف المزيد'],

            ['home', 'testimonials', 'title', 'Testimonials', 'آراء العملاء'],
            // Carousel videos live in their own table (TestimonialVideosSeeder,
            // Admin → Testimonial Videos) and the client cards in the testimonials
            // table (Admin → Testimonials) — only the section title is site_content.

            ['home', 'value_prop', 'title', 'Value Proposition', 'القيمة المضافة'],
            ['home', 'value_prop', 'item_1', 'Over 30 Years Of Experience In Real Estate', 'أكثر من 30 عاماً من الخبرة في العقارات'],
            ['home', 'value_prop', 'item_2', 'Legally, Financially, And Structurally Secured Projects', 'مشاريع آمنة قانونياً ومالياً وإنشائياً'],
            ['home', 'value_prop', 'item_3', 'Lower Prices With Early Purchase', 'أسعار أقل عند الشراء المبكر'],
            ['home', 'value_prop', 'item_4', 'Flexible Payment Plans', 'خطط دفع مرنة'],

            ['home', 'media_room', 'title', 'Media Room', 'الغرفة الإعلامية'],
            ['home', 'location', 'title', 'Our Location', 'موقعنا'],

            // ---------------- PROPERTIES ----------------
            ['properties', 'hero', 'label', 'PROPERTIES', 'العقارات'],
            ['properties', 'hero', 'title', 'Spaces that work for you', 'مساحات تناسبك'],
            ['properties', 'hero', 'subtitle', 'Browse residential and commercial properties with clarity and ease', 'تصفّح عقارات سكنية وتجارية بوضوح وسهولة'],
            ['properties', 'bottom_cta', 'title', 'Find The Right Space, Made Simple', 'ابحث عن المساحة المثالية بسهولة'],
            ['properties', 'bottom_cta', 'subtitle', 'Explore residential and commercial properties with clear details and guided support.', 'استكشف العقارات السكنية والتجارية بتفاصيل واضحة ودعم متكامل.'],

            // ---------------- INVESTMENT ----------------
            ['investment', 'hero', 'title', "WHY TO INVEST IN AMMAN\nTHROUGH PROPERTIES\n(BUY/ RENT OR BUILD)?", "لماذا يُعدّ الاستثمار\nالعقاري في عمّان\nخيارًا مثاليًا؟"],
            ['investment', 'hero', 'cta', 'Contact Us', 'تواصل معنا'],
            ['investment', 'editorial', 'heading', 'Amman Continues To Position Itself As One', 'تُعد عمّان واحدة من أكثر'],
            ['investment', 'editorial', 'heading_accent', 'Of The Most Stable And Promising Real Estate Markets In The Region', 'الأسواق العقارية استقراراً في المنطقة'],
            ['investment', 'editorial', 'body', 'Its strategic location, political stability, and growing infrastructure make it an attractive destination for both local and international investors.', 'حيث تجمع بين الموقع الاستراتيجي والاستقرار السياسي والنمو العمراني المستمر، مما يجعلها وجهة جاذبة للمستثمرين المحليين والدوليين.'],
            ['investment', 'cta', 'heading', 'For Investors Seeking A Balanced Market With Steady Appreciation And Controlled Risk, SkyAmman Provides A Reliable Investment Environment.', 'للمستثمرين الباحثين عن سوق متوازن يجمع بين الاستقرار والعائد، توفر سكاي عمّان بيئة استثمارية.'],
            ['investment', 'cta', 'button', 'Self Build Service', 'البناء الذاتي'],

            // ---------------- SELF BUILD ----------------
            ['self_build', 'hero', 'title', 'BUILD YOUR PROPERTY, YOUR VISION', 'ابنِ عقارك، حقّق رؤيتك'],
            ['self_build', 'hero', 'subtitle', 'UNDER SKYAMMAN SUPERVISION', 'تحت إشراف سكاي عمّان'],
            ['self_build', 'process', 'title', 'Process Flow', 'مراحل العمل'],
            ['self_build', 'process', 'step_1', 'Land Selection', 'اختيار الأرض'],
            ['self_build', 'process', 'step_2', 'Legal Verification', 'التحقق القانوني'],
            ['self_build', 'process', 'step_3', 'Engineering Design', 'التصميم الهندسي'],
            ['self_build', 'process', 'step_4', 'Specifications', 'المواصفات'],
            ['self_build', 'process', 'step_5', 'Execution', 'التنفيذ'],
            ['self_build', 'process', 'step_6', 'Documentation', 'التوثيق'],
            ['self_build', 'process', 'step_7', 'Handover', 'التسليم'],
            ['self_build', 'process', 'step_8', 'After-Sales Service', 'خدمة ما بعد البيع'],

            // ---------------- SECURITY ----------------
            ['security', 'hero', 'title', 'Secure Ownership With SkyAmman', 'تملّك آمن مع سكاي عمان'],
            ['security', 'hero', 'subtitle', 'With Security, Credibility and Transparency', 'بالأمان والمصداقية والشفافية'],

            // Three pillars — each is a hover-expanding panel (title + 4 points).
            ['security', 'legal', 'title', 'Legal Security', 'الأمان القانوني'],
            ['security', 'legal', 'item_1', 'Contracts are drafted and verified by a dedicated legal department', 'صياغة وتوثيق العقود من خلال الدائرة القانونية المختصة'],
            ['security', 'legal', 'item_2', 'All payments are officially documented', 'توثيق جميع الدفعات بشكل رسمي'],
            ['security', 'legal', 'item_3', 'Full support through the property registration process', 'متابعة إجراءات تسجيل العقار حتى نقل الملكية بالكامل'],
            ['security', 'legal', 'item_4', 'Legal verification of land ownership before project initiation', 'التحقق من سلامة الأرض قانونياً قبل بدء أي مشروع'],

            ['security', 'financial', 'title', 'Financial Security', 'الأمان المالي'],
            ['security', 'financial', 'item_1', 'Client payments are protected until ownership registration', 'ضمان حقوق العميل في جميع الدفعات حتى موعد التسجيل'],
            ['security', 'financial', 'item_2', 'Flexible financing solutions through banking partners', 'حلول تمويل مرنة بالتعاون مع شركاء مصرفيين'],
            ['security', 'financial', 'item_3', 'Full transparency in pricing and payment schedules', 'وضوح كامل في التكاليف و جدول الدفعات'],
            ['security', 'financial', 'item_4', 'No hidden costs or unexpected obligations', 'عدم وجود رسوم أو التزامات غير معلنة'],

            ['security', 'construction', 'title', 'Construction Security', 'الأمان الإنشائي'],
            ['security', 'construction', 'item_1', 'Projects executed under certified engineering supervision', 'تنفيذ المشاريع بإشراف مكاتب هندسية معتمدة'],
            ['security', 'construction', 'item_2', 'Approved execution partners recognized by official authorities', 'درع تنفيذي مصنف من الجهات الرسمية (وزارة الأشغال، نقابة المهندسين، نقابة المقاولين)'],
            ['security', 'construction', 'item_3', 'Strict adherence to technical specifications', 'الالتزام بالمواصفات الفنية المعتمدة'],
            ['security', 'construction', 'item_4', 'Use of trusted and verified suppliers', 'استخدام مواد من موردين موثوقين ومعتمدين'],

            // ---------------- ABOUT ----------------
            ['about', 'hero', 'title', 'ABOUT SKY AMMAN', 'عن سكاي عمّان'],
            ['about', 'intro', 'body', 'SkyAmman is a real estate development company based in Amman, specializing in the design and development of high quality residential, commercial, office, and medical spaces.', 'سكاي عمّان شركة تطوير عقاري مقرّها عمّان، متخصصة في تصميم وتطوير مساحات سكنية وتجارية ومكتبية وطبية عالية الجودة.'],
            ['about', 'crafted', 'title', 'Crafted Developments for Elevated Living', 'تطويرات مصمّمة لحياة راقية'],
            ['about', 'crafted', 'body', 'We deliver integrated real estate solutions tailored to meet diverse client needs, while maintaining high standards in quality and execution. In addition, we support property ownership through flexible financing solutions in collaboration with leading financial institutions in Jordan.', 'نقدّم حلولاً عقارية متكاملة مصمّمة لتلبية احتياجات العملاء المتنوعة، مع الحفاظ على معايير عالية في الجودة والتنفيذ. كما ندعم تملّك العقار من خلال حلول تمويل مرنة بالتعاون مع مؤسسات مالية رائدة في الأردن.'],
            ['about', 'mission', 'title', 'Mission', 'رسالتنا'],
            ['about', 'mission', 'body', 'To empower clients, both locally and internationally, to own or lease or build property in Amman with confidence and ease, by adhering to legal standards, collaborating with trusted partners, and ensuring financial, legal, and construction security throughout the entire process.', 'تمكين العملاء، محلياً ودولياً، من تملّك أو استئجار أو بناء عقار في عمّان بثقة ويسر، عبر الالتزام بالمعايير القانونية والتعاون مع شركاء موثوقين وضمان الأمان المالي والقانوني والإنشائي طوال العملية بأكملها.'],
            ['about', 'vision', 'title', 'Vision', 'رؤيتنا'],
            ['about', 'vision', 'body', 'To lead the real estate development sector in Amman by expanding our services to include property management and leveraging data driven insights and business intelligence tools to support informed real estate decisions in buying, selling, leasing, and investment.', 'الريادة في قطاع التطوير العقاري في عمّان من خلال توسيع خدماتنا لتشمل إدارة الممتلكات والاستفادة من رؤى البيانات وأدوات ذكاء الأعمال لدعم القرارات العقارية المدروسة في الشراء والبيع والإيجار والاستثمار.'],
            ['about', 'leadership', 'title', 'Leadership Rooted in Trust and Market Experience', 'قيادة راسخة في الثقة وخبرة السوق'],
            ['about', 'leadership', 'body', 'Founded on a clear vision of trust and security in property ownership, SkyAmman operates under the leadership of its founder, who brings over 30 years of experience in real estate development and investment portfolio management in the Jordanian market.', 'تأسست سكاي عمّان على رؤية واضحة قوامها الثقة والأمان في تملّك العقار، وتعمل بقيادة مؤسّسها الذي يمتلك أكثر من 30 عاماً من الخبرة في التطوير العقاري وإدارة المحافظ الاستثمارية في السوق الأردني.'],

            // ---------------- CONTACT ----------------
            ['contact', 'hero', 'title', 'Get in Touch', 'تواصل معنا'],
            ['contact', 'hero', 'subtitle', 'Tell us what you are looking for and we will reach out shortly.', 'أخبرنا بما تبحث عنه وسنتواصل معك قريباً.'],

            // ---------------- FOOTER (shared layout) ----------------
            // Editorial strings only. Nav-link labels (Home/Listings/Blog/...),
            // social platform names (Linkedin/Youtube/X/Meta/Tiktok), and the
            // placeholder "Other pages" list stay in i18n — they're structural,
            // not copy admins are expected to tune.
            ['footer', 'subscribe', 'label', 'Subscribe To Our Newsletter', 'اشترك في نشرتنا الإخبارية'],
            ['footer', 'subscribe', 'cta',   'Contact Us',                  'تواصل معنا'],
            ['footer', 'sections',  'main_pages',  'Main pages',  'الصفحات الرئيسية'],
            ['footer', 'sections',  'follow_us',   'Follow us',   'تابعنا'],
            ['footer', 'copyright', 'text',           'All rights reserved', 'جميع الحقوق محفوظة'],
            ['footer', 'copyright', 'privacy_policy', 'Privacy policy',      'سياسة الخصوصية'],

            // ── Privacy Policy ────────────────────────────────────────────────
            // Client-provided official policy (docx, 2026-07-25) replacing the
            // earlier AI-drafted placeholder. English is the client's copy; the
            // Arabic is a matching translation (register-consistent with the rest
            // of the site) — have counsel confirm the AR before relying on it.
            // Rendered by Privacy.tsx, which reads these keys as headings +
            // paragraphs + bullet lists (`lead`/`item_n`/`outro` conventions).
            ['privacy', 'hero', 'title', 'Privacy Policy', 'سياسة الخصوصية'],
            ['privacy', 'hero', 'updated', 'Last updated: July 2026', 'آخر تحديث: تموز ٢٠٢٦'],

            ['privacy', 'intro', 'body', 'SkyAmman ("we", "our", or "us") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and protect your information when you visit our website or interact with our services.', 'تحترم سكاي عمّان ("نحن" أو "لدينا") خصوصيتك وتلتزم بحماية معلوماتك الشخصية. توضّح سياسة الخصوصية هذه كيف نجمع معلوماتك ونستخدمها ونخزّنها ونحميها عند زيارتك لموقعنا الإلكتروني أو تفاعلك مع خدماتنا.'],
            ['privacy', 'intro', 'agree', 'By using our website, you agree to the practices described in this Privacy Policy.', 'باستخدامك لموقعنا الإلكتروني، فإنك توافق على الممارسات الموضّحة في سياسة الخصوصية هذه.'],

            // 1. Information We Collect
            ['privacy', 'collect', 'title', 'Information We Collect', 'المعلومات التي نجمعها'],
            ['privacy', 'collect', 'lead', 'We may collect personal information that you voluntarily provide, including:', 'قد نجمع معلومات شخصية تقدّمها طوعاً، وتشمل:'],
            ['privacy', 'collect', 'provided_1', 'Full Name', 'الاسم الكامل'],
            ['privacy', 'collect', 'provided_2', 'Email Address', 'البريد الإلكتروني'],
            ['privacy', 'collect', 'provided_3', 'Phone Number', 'رقم الهاتف'],
            ['privacy', 'collect', 'provided_4', 'WhatsApp Number', 'رقم واتساب'],
            ['privacy', 'collect', 'provided_5', 'Property preferences', 'تفضيلات العقار'],
            ['privacy', 'collect', 'provided_6', 'Budget range', 'النطاق السعري'],
            ['privacy', 'collect', 'provided_7', 'Preferred location', 'الموقع المفضّل'],
            ['privacy', 'collect', 'provided_8', 'Messages submitted through contact forms', 'الرسائل المُرسَلة عبر نماذج التواصل'],
            ['privacy', 'collect', 'provided_9', 'Any information you choose to provide when contacting us', 'أي معلومات تختار تقديمها عند التواصل معنا'],
            ['privacy', 'collect', 'auto_lead', 'We may also automatically collect:', 'كما قد نجمع تلقائياً:'],
            ['privacy', 'collect', 'auto_1', 'IP Address', 'عنوان الـ IP'],
            ['privacy', 'collect', 'auto_2', 'Browser type', 'نوع المتصفح'],
            ['privacy', 'collect', 'auto_3', 'Device information', 'معلومات الجهاز'],
            ['privacy', 'collect', 'auto_4', 'Operating system', 'نظام التشغيل'],
            ['privacy', 'collect', 'auto_5', 'Pages visited', 'الصفحات التي تمت زيارتها'],
            ['privacy', 'collect', 'auto_6', 'Time spent on the website', 'الوقت المُستغرَق على الموقع'],
            ['privacy', 'collect', 'auto_7', 'Referral source', 'مصدر الإحالة'],
            ['privacy', 'collect', 'auto_8', 'Cookie information', 'معلومات ملفات تعريف الارتباط'],

            // 2. How We Use Your Information
            ['privacy', 'use', 'title', 'How We Use Your Information', 'كيف نستخدم معلوماتك'],
            ['privacy', 'use', 'lead', 'We use your information to:', 'نستخدم معلوماتك من أجل:'],
            ['privacy', 'use', 'item_1', 'Respond to property inquiries', 'الرد على استفسارات العقارات'],
            ['privacy', 'use', 'item_2', 'Schedule property viewings', 'تحديد مواعيد معاينة العقارات'],
            ['privacy', 'use', 'item_3', 'Contact you regarding available units', 'التواصل معك بشأن الوحدات المتاحة'],
            ['privacy', 'use', 'item_4', 'Provide requested quotations', 'تقديم عروض الأسعار المطلوبة'],
            ['privacy', 'use', 'item_5', 'Assist with financing inquiries through approved banking partners', 'المساعدة في استفسارات التمويل عبر شركاء مصرفيين معتمدين'],
            ['privacy', 'use', 'item_6', 'Improve our website and services', 'تحسين موقعنا وخدماتنا'],
            ['privacy', 'use', 'item_7', 'Send updates about new projects, offers, or promotions (only where permitted)', 'إرسال تحديثات حول المشاريع الجديدة أو العروض أو الترويجات (حيثما يُسمح بذلك فقط)'],
            ['privacy', 'use', 'item_8', 'Comply with legal obligations', 'الامتثال للالتزامات القانونية'],

            // 3. Property Inquiries
            ['privacy', 'inquiries', 'title', 'Property Inquiries', 'استفسارات العقارات'],
            ['privacy', 'inquiries', 'lead', 'When you submit an inquiry regarding one of our properties, your information is used solely to:', 'عند إرسالك استفساراً بخصوص أحد عقاراتنا، تُستخدم معلوماتك حصراً من أجل:'],
            ['privacy', 'inquiries', 'item_1', 'Contact you regarding your request', 'التواصل معك بشأن طلبك'],
            ['privacy', 'inquiries', 'item_2', 'Recommend suitable properties', 'اقتراح عقارات مناسبة'],
            ['privacy', 'inquiries', 'item_3', 'Arrange meetings or property visits', 'ترتيب الاجتماعات أو زيارات العقار'],
            ['privacy', 'inquiries', 'item_4', 'Provide payment plans and project information', 'تقديم خطط الدفع ومعلومات المشروع'],

            // 4. Marketing Communications
            ['privacy', 'marketing', 'title', 'Marketing Communications', 'الرسائل التسويقية'],
            ['privacy', 'marketing', 'lead', 'With your consent, SkyAmman may send you:', 'بموافقتك، قد ترسل لك سكاي عمّان:'],
            ['privacy', 'marketing', 'item_1', 'New project announcements', 'إعلانات المشاريع الجديدة'],
            ['privacy', 'marketing', 'item_2', 'Investment opportunities', 'فرص الاستثمار'],
            ['privacy', 'marketing', 'item_3', 'Promotional offers', 'العروض الترويجية'],
            ['privacy', 'marketing', 'item_4', 'Newsletters', 'النشرات الإخبارية'],
            ['privacy', 'marketing', 'outro', 'You may unsubscribe from marketing communications at any time by following the unsubscribe instructions or contacting us directly.', 'يمكنك إلغاء الاشتراك في الرسائل التسويقية في أي وقت باتباع تعليمات إلغاء الاشتراك أو بالتواصل معنا مباشرةً.'],

            // 5. Sharing Your Information
            ['privacy', 'sharing', 'title', 'Sharing Your Information', 'مشاركة معلوماتك'],
            ['privacy', 'sharing', 'lead', 'We do not sell your personal information.', 'نحن لا نبيع معلوماتك الشخصية.'],
            ['privacy', 'sharing', 'lead_2', 'Your information may be shared only when necessary with:', 'قد تتم مشاركة معلوماتك عند الضرورة فقط مع:'],
            ['privacy', 'sharing', 'item_1', 'Authorized SkyAmman employees', 'موظفي سكاي عمّان المخوّلين'],
            ['privacy', 'sharing', 'item_2', 'Banking or financing partners (only when financing assistance is requested)', 'شركاء الخدمات المصرفية أو التمويل (فقط عند طلب المساعدة في التمويل)'],
            ['privacy', 'sharing', 'item_3', 'Professional advisors', 'المستشارين المهنيين'],
            ['privacy', 'sharing', 'item_4', 'Government authorities where required by law', 'الجهات الحكومية عندما يقتضي القانون ذلك'],
            ['privacy', 'sharing', 'item_5', 'Website hosting, analytics, and technology providers that assist us in operating our website', 'مزوّدي استضافة الموقع والتحليلات والتقنية الذين يساعدوننا في تشغيل موقعنا'],
            ['privacy', 'sharing', 'outro', 'All third parties are expected to protect your information appropriately.', 'يُتوقّع من جميع الأطراف الخارجية حماية معلوماتك على النحو الملائم.'],

            // 6. Cookies and Analytics
            ['privacy', 'cookies', 'title', 'Cookies and Analytics', 'ملفات تعريف الارتباط والتحليلات'],
            ['privacy', 'cookies', 'lead', 'Our website may use cookies and similar technologies to:', 'قد يستخدم موقعنا ملفات تعريف الارتباط والتقنيات المشابهة من أجل:'],
            ['privacy', 'cookies', 'item_1', 'Improve website performance', 'تحسين أداء الموقع'],
            ['privacy', 'cookies', 'item_2', 'Remember your preferences', 'تذكّر تفضيلاتك'],
            ['privacy', 'cookies', 'item_3', 'Measure website traffic', 'قياس حركة زيارات الموقع'],
            ['privacy', 'cookies', 'item_4', 'Analyze visitor behavior', 'تحليل سلوك الزوّار'],
            ['privacy', 'cookies', 'item_5', 'Improve marketing campaigns', 'تحسين الحملات التسويقية'],
            ['privacy', 'cookies', 'outro', 'These technologies may include services such as Google Analytics or similar website analytics platforms.', 'قد تشمل هذه التقنيات خدمات مثل Google Analytics أو منصّات تحليل مواقع مشابهة.'],
            ['privacy', 'cookies', 'outro_2', 'You can control cookies through your browser settings; however, disabling cookies may affect certain website features.', 'يمكنك التحكّم في ملفات تعريف الارتباط من خلال إعدادات متصفحك؛ إلا أنّ تعطيلها قد يؤثّر على بعض ميزات الموقع.'],

            // 7. Data Security
            ['privacy', 'security', 'title', 'Data Security', 'أمن البيانات'],
            ['privacy', 'security', 'body', 'We implement reasonable technical and organizational safeguards to protect your information from unauthorized access, disclosure, alteration, or destruction.', 'نطبّق تدابير تقنية وتنظيمية معقولة لحماية معلوماتك من الوصول غير المصرّح به أو الإفصاح أو التعديل أو الإتلاف.'],
            ['privacy', 'security', 'body_2', 'While we strive to protect your personal information, no internet transmission or electronic storage method can be guaranteed to be 100% secure.', 'ومع سعينا لحماية معلوماتك الشخصية، لا يمكن ضمان أمان أي وسيلة نقل عبر الإنترنت أو تخزين إلكتروني بنسبة 100%.'],

            // 8. Data Retention
            ['privacy', 'retention', 'title', 'Data Retention', 'الاحتفاظ بالبيانات'],
            ['privacy', 'retention', 'lead', 'We retain personal information only for as long as necessary to:', 'نحتفظ بالمعلومات الشخصية فقط للمدة اللازمة من أجل:'],
            ['privacy', 'retention', 'item_1', 'Respond to inquiries', 'الرد على الاستفسارات'],
            ['privacy', 'retention', 'item_2', 'Maintain customer relationships', 'الحفاظ على علاقات العملاء'],
            ['privacy', 'retention', 'item_3', 'Fulfill contractual obligations', 'الوفاء بالالتزامات التعاقدية'],
            ['privacy', 'retention', 'item_4', 'Meet legal and regulatory requirements', 'تلبية المتطلبات القانونية والتنظيمية'],
            ['privacy', 'retention', 'outro', 'When information is no longer required, it is securely deleted or anonymized.', 'وعندما تنتفي الحاجة إلى المعلومات، يتم حذفها بشكل آمن أو جعلها مجهولة الهوية.'],

            // 9. Your Rights
            ['privacy', 'rights', 'title', 'Your Rights', 'حقوقك'],
            ['privacy', 'rights', 'lead', 'Subject to applicable law, you may request to:', 'مع مراعاة القانون المعمول به، يمكنك أن تطلب:'],
            ['privacy', 'rights', 'item_1', 'Access your personal information', 'الاطلاع على معلوماتك الشخصية'],
            ['privacy', 'rights', 'item_2', 'Correct inaccurate information', 'تصحيح المعلومات غير الدقيقة'],
            ['privacy', 'rights', 'item_3', 'Update your information', 'تحديث معلوماتك'],
            ['privacy', 'rights', 'item_4', 'Request deletion of your personal information', 'طلب حذف معلوماتك الشخصية'],
            ['privacy', 'rights', 'item_5', 'Withdraw consent for marketing communications', 'سحب الموافقة على الرسائل التسويقية'],
            ['privacy', 'rights', 'outro', 'To exercise these rights, please contact us using the details below.', 'لممارسة هذه الحقوق، يُرجى التواصل معنا عبر البيانات الواردة أدناه.'],

            // 10. Third-Party Websites
            ['privacy', 'third_party', 'title', 'Third-Party Websites', 'المواقع الخارجية'],
            ['privacy', 'third_party', 'body', 'Our website may contain links to third-party websites.', 'قد يحتوي موقعنا على روابط لمواقع خارجية.'],
            ['privacy', 'third_party', 'body_2', 'SkyAmman is not responsible for the privacy practices or content of external websites. We encourage you to review their privacy policies before providing personal information.', 'لا تتحمّل سكاي عمّان المسؤولية عن ممارسات الخصوصية أو محتوى المواقع الخارجية. وننصحك بمراجعة سياسات الخصوصية الخاصة بها قبل تقديم أي معلومات شخصية.'],

            // 11. Children's Privacy
            ['privacy', 'children', 'title', 'Children\'s Privacy', 'خصوصية الأطفال'],
            ['privacy', 'children', 'body', 'Our website and services are intended for individuals aged 18 years or older. We do not knowingly collect personal information from children.', 'موقعنا وخدماتنا مخصّصة للأفراد الذين تبلغ أعمارهم 18 عاماً فأكثر. ولا نجمع عن قصد أي معلومات شخصية من الأطفال.'],

            // 12. International Visitors
            ['privacy', 'international', 'title', 'International Visitors', 'الزوّار الدوليون'],
            ['privacy', 'international', 'body', 'If you access our website from outside Jordan, your information may be processed and stored in Jordan or in other countries where our service providers operate, subject to appropriate safeguards.', 'إذا دخلت إلى موقعنا من خارج الأردن، فقد تتم معالجة معلوماتك وتخزينها في الأردن أو في دول أخرى يعمل فيها مزوّدو خدماتنا، مع مراعاة الضمانات الملائمة.'],

            // 13. Changes to this Privacy Policy
            ['privacy', 'changes', 'title', 'Changes to this Privacy Policy', 'التعديلات على سياسة الخصوصية'],
            ['privacy', 'changes', 'body', 'We may update this Privacy Policy periodically to reflect changes in our services, technology, or legal requirements.', 'قد نحدّث سياسة الخصوصية هذه من حين لآخر لتعكس التغييرات في خدماتنا أو تقنياتنا أو المتطلبات القانونية.'],
            ['privacy', 'changes', 'body_2', 'The updated version will be posted on this page with the revised "Last Updated" date.', 'وسيُنشَر الإصدار المُحدَّث على هذه الصفحة مع تعديل تاريخ "آخر تحديث".'],

            // 14. Contact Us — routed to the Contact page (no dedicated inbox yet).
            ['privacy', 'contact', 'title', 'Contact Us', 'تواصل معنا'],
            ['privacy', 'contact', 'body', 'If you have questions regarding this Privacy Policy or wish to exercise your privacy rights, please contact us using the details on our Contact page.', 'إذا كانت لديك أي أسئلة بخصوص سياسة الخصوصية هذه أو رغبت في ممارسة حقوقك في الخصوصية، يُرجى التواصل معنا عبر البيانات الموجودة في صفحة اتصل بنا.'],
            ['privacy', 'contact', 'phone', 'Phone: +962 77 077 0123', 'الهاتف: +962 77 077 0123'],
        ];
    }

    public function run(): void
    {
        foreach (self::rows() as [$page, $section, $key, $en, $ar]) {
            SiteContent::updateOrCreate(
                ['page' => $page, 'section' => $section, 'key' => $key],
                [
                    'content_en' => $en,
                    'content_ar' => $ar,
                    'type' => strlen($en) > 120 ? 'textarea' : 'text',
                    'is_visible' => true,
                ],
            );
        }
    }
}
