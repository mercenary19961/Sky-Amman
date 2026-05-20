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
    public function run(): void
    {
        $rows = [
            // ---------------- HOME ----------------
            ['home', 'hero', 'title', 'Real Estate Development', 'التطوير العقاري'],
            ['home', 'hero', 'location', 'In Amman', 'في عمّان'],
            ['home', 'hero', 'subtitle', 'With Security, Credibility and Transparency', 'بأمان ومصداقية وشفافية'],
            ['home', 'hero', 'cta', 'Explore Projects', 'استكشف المشاريع'],

            ['home', 'investment_banner', 'tagline', 'Buy Early, Save More, Gain More', 'اشترِ مبكراً، وفّر أكثر، اربح أكثر'],
            ['home', 'investment_banner', 'cta', 'Investment Opportunities', 'فرص الاستثمار'],

            ['home', 'managing_partner', 'label', 'Managing Partner', 'الشريك الإداري'],
            ['home', 'managing_partner', 'name', 'MR. Jameel Abu Hajleh', 'السيد جميل أبو هجلة'],
            ['home', 'managing_partner', 'body_1', 'At SkyAmman, we believe that successful real estate investment begins with stability, vision, and trust. Jordan today stands as a strong example of security, urban growth, and promising investment opportunities, making it an ideal environment for modern real estate development.', 'في سكاي عمّان، نؤمن بأن الاستثمار العقاري الناجح يبدأ بالاستقرار والرؤية والثقة. الأردن اليوم نموذج للأمان والنمو الحضري وفرص الاستثمار الواعدة، مما يجعله بيئة مثالية للتطوير العقاري الحديث.'],
            ['home', 'managing_partner', 'body_2', 'From the beginning, our focus has been on delivering projects that combine quality, contemporary design, and long-term value while ensuring that every development reflects the needs and expectations of our clients.', 'منذ البداية، تمحور تركيزنا على تقديم مشاريع تجمع بين الجودة والتصميم العصري والقيمة بعيدة المدى، مع ضمان أن يعكس كل تطوير احتياجات عملائنا وتطلعاتهم.'],
            ['home', 'managing_partner', 'body_3', 'Our mission at SkyAmman goes beyond developing properties, we aim to contribute to a modern urban future that reflects the true potential of Jordan and creates lasting value for generations to come.', 'تتجاوز مهمتنا في سكاي عمّان مجرد تطوير العقارات، إذ نسعى للمساهمة في مستقبل حضري عصري يعكس الإمكانات الحقيقية للأردن ويخلق قيمة دائمة للأجيال القادمة.'],

            ['home', 'departments', 'title', 'Head of Departments', 'رؤساء الأقسام'],
            ['home', 'departments', 'member_1_name', 'Eng. Mahmoud Abu Sarhan', 'م. محمود أبو سرحان'],
            ['home', 'departments', 'member_1_role', 'Chief Executive Officer', 'الرئيس التنفيذي'],
            ['home', 'departments', 'member_2_name', 'Eng. Hossam Salameh', 'م. حسام سلامة'],
            ['home', 'departments', 'member_2_role', 'Projects Director', 'مدير المشاريع'],
            ['home', 'departments', 'member_3_name', 'Mr. Mohammad Makhl', 'السيد محمد مخل'],
            ['home', 'departments', 'member_3_role', 'Chief Financial Officer', 'المدير المالي'],
            ['home', 'departments', 'member_4_name', 'Mr. Sadad Al Rawashdeh', 'السيد سداد الرواشدة'],
            ['home', 'departments', 'member_4_role', 'Legal Director', 'المدير القانوني'],

            ['home', 'about', 'title', 'Who We Are?', 'من نحن؟'],
            ['home', 'about', 'body', 'SkyAmman is a real estate development company based in Amman, specializing in residential, commercial, office, and medical projects. We deliver quality driven developments and integrated real estate solutions, while offering flexible property ownership options built on trust, value, and long term vision.', 'سكاي عمّان شركة تطوير عقاري مقرّها عمّان، متخصصة في المشاريع السكنية والتجارية والمكتبية والطبية. نُقدّم تطويرات عالية الجودة وحلولاً عقارية متكاملة، مع خيارات تملّك مرنة قائمة على الثقة والقيمة والرؤية بعيدة المدى.'],

            ['home', 'stats', 'clients_value', '+1500', '+1500'],
            ['home', 'stats', 'clients_label', 'Clients', 'عميل'],
            ['home', 'stats', 'projects_value', '180', '180'],
            ['home', 'stats', 'projects_label', 'Projects Delivered', 'مشروع منجز'],
            ['home', 'stats', 'years_value', '+30', '+30'],
            ['home', 'stats', 'years_label', 'Years Experience', 'عام من الخبرة'],
            ['home', 'stats', 'sqm_value', '+500K', '+500 ألف'],
            ['home', 'stats', 'sqm_label', 'm² Developed', 'م² تم تطويرها'],

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
            ['home', 'testimonials', 'video_url', '', ''],
            ['home', 'testimonials', 'client_1_name', 'Client Name', 'اسم العميل'],
            ['home', 'testimonials', 'client_1_quote', 'Our approach is centered around redefining the property ownership experience through three core pillars: legal security, financial security, and structural integrity.', 'نهجنا يتمحور حول إعادة تعريف تجربة تملك العقار من خلال ثلاث ركائز أساسية: الأمان القانوني، والأمان المالي، والسلامة الإنشائية.'],
            ['home', 'testimonials', 'client_2_name', 'Client Name', 'اسم العميل'],
            ['home', 'testimonials', 'client_2_quote', 'Our approach is centered around redefining the property ownership experience through three core pillars: legal security, financial security, and structural integrity.', 'نهجنا يتمحور حول إعادة تعريف تجربة تملك العقار من خلال ثلاث ركائز أساسية: الأمان القانوني، والأمان المالي، والسلامة الإنشائية.'],
            ['home', 'testimonials', 'client_3_name', 'Client Name', 'اسم العميل'],
            ['home', 'testimonials', 'client_3_quote', 'Our approach is centered around redefining the property ownership experience through three core pillars: legal security, financial security, and structural integrity.', 'نهجنا يتمحور حول إعادة تعريف تجربة تملك العقار من خلال ثلاث ركائز أساسية: الأمان القانوني، والأمان المالي، والسلامة الإنشائية.'],
            ['home', 'testimonials', 'client_4_name', 'Client Name', 'اسم العميل'],
            ['home', 'testimonials', 'client_4_quote', 'Our approach is centered around redefining the property ownership experience through three core pillars: legal security, financial security, and structural integrity.', 'نهجنا يتمحور حول إعادة تعريف تجربة تملك العقار من خلال ثلاث ركائز أساسية: الأمان القانوني، والأمان المالي، والسلامة الإنشائية.'],

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
            ['investment', 'hero', 'title', 'WHY TO INVEST IN AMMAN THROUGH PROPERTIES (BUY/ RENT OR BUILD)?', 'لماذا الاستثمار في عمّان عبر العقارات (شراء / إيجار / بناء)؟'],
            ['investment', 'editorial', 'heading', 'Amman Continues To Position Itself As One Of The Most Stable And Promising Real Estate Markets In The Region', 'تواصل عمّان ترسيخ موقعها كواحدة من أكثر أسواق العقارات استقراراً وواعدية في المنطقة'],
            ['investment', 'editorial', 'body', 'Its strategic location, political stability, and growing infrastructure make it an attractive destination for both local and international investors.', 'موقعها الاستراتيجي واستقرارها السياسي وبنيتها التحتية المتنامية تجعلها وجهة جاذبة للمستثمرين المحليين والدوليين على حدٍّ سواء.'],
            ['investment', 'cta', 'heading', 'For Investors Seeking A Balanced Market With Steady Appreciation And Controlled Risk, SkyAmman Provides A Reliable Investment Environment.', 'للمستثمرين الباحثين عن سوق متوازن مع نمو مستقر ومخاطر متحكَّم بها، توفر سكاي عمان بيئة استثمارية موثوقة.'],
            ['investment', 'cta', 'button', 'Self Build Service', 'خدمة البناء الذاتي'],

            // ---------------- SELF BUILD ----------------
            ['self_build', 'hero', 'title', 'BUILD YOUR PROPERTY, YOUR VISION', 'ابنِ عقارك، حقّق رؤيتك'],
            ['self_build', 'process', 'title', 'Process Flow', 'مراحل العمل'],
            ['self_build', 'process', 'step_1', 'Land Selection', 'اختيار الأرض'],
            ['self_build', 'process', 'step_2', 'Legal Verification', 'التحقق القانوني'],
            ['self_build', 'process', 'step_3', 'Engineering Design', 'التصميم الهندسي'],
            ['self_build', 'process', 'step_4', 'Specifications', 'المواصفات'],
            ['self_build', 'process', 'step_5', 'Execution', 'التنفيذ'],
            ['self_build', 'process', 'step_6', 'Documentation', 'التوثيق'],
            ['self_build', 'process', 'step_7', 'Handover', 'التسليم'],

            // ---------------- SECURITY ----------------
            ['security', 'hero', 'title', 'Security With SkyAmman', 'الأمان مع سكاي عمان'],

            // ---------------- ABOUT ----------------
            ['about', 'hero', 'title', 'About Us', 'من نحن'],

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
            ['footer', 'sections',  'other_pages', 'Other pages', 'صفحات أخرى'],
            ['footer', 'sections',  'follow_us',   'Follow us',   'تابعنا'],
            ['footer', 'copyright', 'text',           'All rights reserved', 'جميع الحقوق محفوظة'],
            ['footer', 'copyright', 'privacy_policy', 'Privacy policy',      'سياسة الخصوصية'],
        ];

        foreach ($rows as [$page, $section, $key, $en, $ar]) {
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
