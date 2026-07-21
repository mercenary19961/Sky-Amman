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
            // The DATA-FLOW sections below are factual: they describe what this
            // codebase actually collects (contact form, newsletter, consent log,
            // server logs) and which third parties actually receive it. Keep them
            // in sync if those flows change.
            // ⚠️ The 'retention', 'rights' and 'contact' sections state legal
            // positions and are deliberately non-specific — they need Jordanian
            // counsel to confirm before launch. See CLAUDE.md → Remaining.
            ['privacy', 'hero', 'title', 'Privacy Policy', 'سياسة الخصوصية'],
            ['privacy', 'hero', 'updated', 'Last updated: July 2026', 'آخر تحديث: تموز ٢٠٢٦'],

            ['privacy', 'intro', 'body', 'This policy explains what personal information Sky Amman collects through this website, why we collect it, and the choices you have. We collect only what we need to respond to you and to run the site.', 'توضّح هذه السياسة ما تجمعه سكاي عمان من معلومات شخصية عبر هذا الموقع، ولماذا نجمعها، وما هي الخيارات المتاحة لك. نحن نجمع فقط ما نحتاجه للرد عليك ولتشغيل الموقع.'],

            ['privacy', 'collect', 'title', 'What we collect', 'ما الذي نجمعه'],
            ['privacy', 'collect', 'form', 'When you submit an enquiry, we collect your name, email address, phone number, your message, the type of request, and the property you asked about if you started from a listing page.', 'عند إرسال استفسار، نجمع اسمك وبريدك الإلكتروني ورقم هاتفك ونص رسالتك ونوع الطلب، والعقار الذي سألت عنه إن كنت قد بدأت من صفحة عقار.'],
            ['privacy', 'collect', 'newsletter', 'If you subscribe to our newsletter, we store your email address.', 'إذا اشتركت في نشرتنا الإخبارية، فإننا نحتفظ ببريدك الإلكتروني.'],
            ['privacy', 'collect', 'technical', 'For security and to prevent abuse, we record the IP address used to submit a form. Our servers also keep standard access logs.', 'لأغراض الأمان ومنع إساءة الاستخدام، نسجّل عنوان الـ IP المستخدم عند إرسال أي نموذج. كما تحتفظ خوادمنا بسجلات وصول اعتيادية.'],
            ['privacy', 'collect', 'consent', 'When you make a choice on the cookie banner, we record that choice together with the date, your IP address and your browser type, as proof of the preference you set.', 'عند اتخاذ قرارك في شريط ملفات تعريف الارتباط، نسجّل هذا القرار مع التاريخ وعنوان الـ IP ونوع المتصفح، كإثبات للتفضيل الذي اخترته.'],

            ['privacy', 'use', 'title', 'How we use it', 'كيف نستخدمها'],
            ['privacy', 'use', 'body', 'We use your details to reply to your enquiry, to route it to the right member of our team, and to send you the newsletter if you asked for it. We do not sell your personal information.', 'نستخدم بياناتك للرد على استفسارك، ولتحويله إلى الشخص المختص في فريقنا، ولإرسال النشرة الإخبارية إن طلبتها. نحن لا نبيع معلوماتك الشخصية.'],

            ['privacy', 'cookies', 'title', 'Cookies and your choices', 'ملفات تعريف الارتباط وخياراتك'],
            ['privacy', 'cookies', 'necessary', 'Strictly necessary cookies keep the site working: they remember your language, secure the forms against misuse, and maintain your session. These cannot be switched off and are not used to track you.', 'الملفات الضرورية تُبقي الموقع يعمل: تتذكر لغتك، وتحمي النماذج من إساءة الاستخدام، وتحافظ على جلستك. لا يمكن إيقافها ولا تُستخدم لتتبعك.'],
            ['privacy', 'cookies', 'analytics', 'Analytics cookies help us understand which pages and properties get attention, so we can improve them. These are only set if you allow them.', 'ملفات التحليلات تساعدنا على معرفة الصفحات والعقارات التي تحظى بالاهتمام لتطويرها. لا تُفعّل إلا إذا سمحت بها.'],
            ['privacy', 'cookies', 'marketing', 'Marketing cookies let us measure our advertising and show you relevant properties on other websites. These are only set if you allow them.', 'ملفات التسويق تتيح لنا قياس نتائج إعلاناتنا وعرض عقارات مناسبة لك على مواقع أخرى. لا تُفعّل إلا إذا سمحت بها.'],
            ['privacy', 'cookies', 'manage', 'You choose when you first visit, and your choice is remembered for one year. Analytics and marketing cookies stay switched off unless you turn them on. You can also clear this site\'s cookies in your browser at any time to be asked again.', 'تختار عند زيارتك الأولى، ويُحفظ اختيارك لمدة عام. تبقى ملفات التحليلات والتسويق معطّلة ما لم تُفعّلها بنفسك. ويمكنك أيضاً حذف ملفات هذا الموقع من متصفحك في أي وقت ليُطرح عليك السؤال من جديد.'],

            ['privacy', 'sharing', 'title', 'Who else receives data', 'من يتلقى البيانات أيضاً'],
            ['privacy', 'sharing', 'body', 'We use a small number of service providers to run the site. Where a provider is listed below as depending on your consent, it receives nothing at all unless you allowed that cookie category.', 'نستعين بعدد محدود من مزوّدي الخدمات لتشغيل الموقع. وحين يُذكر أدناه أن مزوّداً يعتمد على موافقتك، فإنه لا يتلقى أي شيء إطلاقاً ما لم تسمح بتلك الفئة.'],
            ['privacy', 'sharing', 'hosting', 'Hosting and email delivery providers process the site and any messages you send us. These are necessary for the site to function.', 'يقوم مزوّدو الاستضافة وإرسال البريد بمعالجة الموقع وأي رسائل ترسلها إلينا. وهذه ضرورية لعمل الموقع.'],
            ['privacy', 'sharing', 'analytics', 'Google Analytics receives usage data only if you allow analytics cookies.', 'تتلقى خدمة Google Analytics بيانات الاستخدام فقط إذا سمحت بملفات التحليلات.'],
            ['privacy', 'sharing', 'marketing', 'Google, Meta and LinkedIn receive advertising data only if you allow marketing cookies.', 'تتلقى Google وMeta وLinkedIn بيانات إعلانية فقط إذا سمحت بملفات التسويق.'],

            ['privacy', 'retention', 'title', 'How long we keep it', 'مدة الاحتفاظ بالبيانات'],
            ['privacy', 'retention', 'body', 'We keep enquiries for as long as we need them to respond to you and to maintain our business records. Newsletter subscriptions are kept until you ask to be removed. Cookie consent records are kept as evidence of the choice you made.', 'نحتفظ بالاستفسارات طالما احتجناها للرد عليك ولحفظ سجلاتنا التجارية. وتبقى اشتراكات النشرة الإخبارية حتى تطلب إزالتها. أما سجلات الموافقة على ملفات تعريف الارتباط فنحتفظ بها كإثبات للاختيار الذي اتخذته.'],

            ['privacy', 'rights', 'title', 'Your rights', 'حقوقك'],
            ['privacy', 'rights', 'body', 'You can ask us what personal information we hold about you, ask us to correct it if it is wrong, or ask us to delete it. You can also withdraw your cookie consent at any time. Contact us using the details below and we will respond.', 'يمكنك أن تطلب معرفة المعلومات الشخصية التي نحتفظ بها عنك، أو تصحيحها إن كانت خاطئة، أو حذفها. كما يمكنك سحب موافقتك على ملفات تعريف الارتباط في أي وقت. تواصل معنا عبر البيانات أدناه وسنقوم بالرد.'],

            ['privacy', 'contact', 'title', 'Contact us', 'تواصل معنا'],
            ['privacy', 'contact', 'body', 'For any question about this policy or about your personal information, please contact us using the details on our Contact page.', 'لأي استفسار حول هذه السياسة أو حول معلوماتك الشخصية، يُرجى التواصل معنا عبر البيانات الموجودة في صفحة اتصل بنا.'],
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
