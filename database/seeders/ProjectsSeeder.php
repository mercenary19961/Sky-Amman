<?php

namespace Database\Seeders;

use App\Models\Project;
use Illuminate\Database\Seeder;

/**
 * Real catalogue — the DABOUQ-7 and DABOUQ-8 luxury villa developments (from the
 * client brochures), both in Dabouq, Amman and sharing one map location.
 *
 *  • DABOUQ 7 — 8 villas. Ready / for-sale: 3,4,5,7,8 (with committed render
 *    galleries at /images/projects/dabouq-7-villa-{n}/); sold: 1,2,6.
 *  • DABOUQ 8 — premium 18-villa development (10 detailed, "construction nearing
 *    completion" → Under Development / for-sale). No render set yet → placeholder
 *    until a OneDrive photo set is wired in like Dabouq 7.
 *
 * Bedrooms (4) + bathrooms (3) are stored but HIDDEN via hidden_specs for the
 * admin to confirm later. `area_sqm` = built-up; `land_area_sqm` = land/plot.
 */
class ProjectsSeeder extends Seeder
{
    private const LOCATION_EN = 'Dabouq, Amman';
    private const LOCATION_AR = 'دابوق، عمّان';

    // Shared Google Maps embed for every Dabouq 7/8 villa (coords resolved from
    // the client's maps link). www.google.com host keeps it inside the CSP allowlist.
    private const MAP_EMBED = 'https://www.google.com/maps?q=31.981243,35.795491&z=16&output=embed';

    public function run(): void
    {
        $rows = array_merge($this->dabouq7Rows(), $this->dabouq8Rows());

        $slugs = [];
        foreach ($rows as $row) {
            $slugs[] = $row['slug'];
            Project::updateOrCreate(
                ['slug' => $row['slug']],
                $row + ['is_active' => true, 'map_embed_url' => self::MAP_EMBED],
            );
        }

        // Drop any previously-seeded/demo projects no longer in the catalogue
        // (FK-safe: detach their inquiries first, then permanently remove).
        $stale = Project::withTrashed()->whereNotIn('slug', $slugs)->pluck('id');
        if ($stale->isNotEmpty()) {
            \App\Models\ContactSubmission::withTrashed()->whereIn('project_id', $stale)->update(['project_id' => null]);
            foreach (Project::withTrashed()->whereIn('id', $stale)->get() as $old) {
                $old->images()->forceDelete();
                $old->forceDelete();
            }
        }
    }

    /** DABOUQ 7 — Ready villas (Ahl Al-Beit St.) + sold units. */
    private function dabouq7Rows(): array
    {
        $address = ['en' => 'Ahl Al-Beit St., Dabouq, Amman', 'ar' => 'شارع أهل البيت، دابوق، عمّان'];

        // [villa no., land m², built-up m², EN highlight, AR highlight]
        $available = [
            [3, 657, 460, 'a spacious guest hall, family living area and modern kitchen on the ground floor, with four bedrooms upstairs including a master suite with dressing room', 'صالة ضيوف واسعة ومنطقة معيشة عائلية ومطبخ عصري في الطابق الأرضي، وأربع غرف نوم في الطابق العلوي تشمل جناحاً رئيسياً بغرفة ملابس'],
            [4, 615, 460, 'open-plan living spaces, a modern kitchen and four bedrooms across two elegant floors', 'مساحات معيشة مفتوحة ومطبخ عصري وأربع غرف نوم موزّعة على طابقين أنيقين'],
            [5, 615, 460, 'a welcoming guest hall, family living and modern kitchen, with four bedrooms upstairs including a master suite', 'صالة ضيوف مرحّبة ومعيشة عائلية ومطبخ عصري، وأربع غرف نوم في الأعلى تشمل جناحاً رئيسياً'],
            [7, 627, 445, 'expansive living and guest halls on the ground floor, and a king master bedroom plus three further bedrooms with a sitting area upstairs', 'صالات معيشة وضيوف واسعة في الطابق الأرضي، وغرفة نوم رئيسية كبرى مع ثلاث غرف نوم إضافية ومنطقة جلوس في الأعلى'],
            [8, 626, 445, 'a large guest hall, separate dining and family living rooms, and four master bedrooms with a store upstairs', 'صالة ضيوف كبيرة وغرفة طعام ومعيشة عائلية منفصلتين، وأربع غرف نوم رئيسية مع غرفة تخزين في الأعلى'],
        ];

        $rows = [];
        $sort = 1;
        foreach ($available as [$n, $land, $built, $hlEn, $hlAr]) {
            $rows[] = [
                'slug' => "dabouq-7-villa-{$n}",
                'title_en' => "Dabouq 7 – Villa {$n}",
                'title_ar' => "دابوق 7 – فيلا {$n}",
                'category' => Project::CATEGORY_READY,
                'listing_status' => 'for_sale',
                'group' => 'Dabouq 7',
                'location_en' => self::LOCATION_EN,
                'location_ar' => self::LOCATION_AR,
                'address_en' => $address['en'],
                'address_ar' => $address['ar'],
                'short_description_en' => "{$land} m² land · {$built} m² built-up",
                'short_description_ar' => "{$land} م² أرض · {$built} م² بناء",
                'description_en' => "Part of the DABOUQ-7 luxury villa development in the heart of Dabouq, Amman. Villa {$n} offers {$land} m² of land and {$built} m² of built-up area across two floors, featuring {$hlEn}.",
                'description_ar' => "ضمن مجمّع فلل دابوق-7 الفاخر في قلب دابوق، عمّان. تقدّم فيلا {$n} مساحة أرض {$land} م² ومساحة بناء {$built} م² على طابقين، وتتميّز بـ{$hlAr}.",
                'area_sqm' => $built,
                'land_area_sqm' => $land,
                'floors' => 2,
                'bedrooms' => 4,
                'bathrooms' => 3,
                'hidden_specs' => ['bedrooms', 'bathrooms'],
                'completion_year' => null,
                'is_featured' => true,
                'sort_order' => $sort++,
            ];
        }

        foreach ([1, 2, 6] as $n) {
            $rows[] = [
                'slug' => "dabouq-7-villa-{$n}",
                'title_en' => "Dabouq 7 – Villa {$n}",
                'title_ar' => "دابوق 7 – فيلا {$n}",
                'category' => Project::CATEGORY_READY,
                'listing_status' => 'sold',
                'group' => 'Dabouq 7',
                'location_en' => self::LOCATION_EN,
                'location_ar' => self::LOCATION_AR,
                'address_en' => $address['en'],
                'address_ar' => $address['ar'],
                'short_description_en' => 'Sold — Dabouq 7',
                'short_description_ar' => 'تم البيع — دابوق 7',
                'description_en' => "Villa {$n} in the DABOUQ-7 luxury development in Dabouq, Amman — sold.",
                'description_ar' => "فيلا {$n} ضمن مجمّع دابوق-7 الفاخر في دابوق، عمّان — تم بيعها.",
                'area_sqm' => null,
                'land_area_sqm' => null,
                'floors' => null,
                'bedrooms' => null,
                'bathrooms' => null,
                'hidden_specs' => [],
                'completion_year' => null,
                'is_featured' => false,
                'sort_order' => 5 + $n,
            ];
        }

        return $rows;
    }

    /** DABOUQ 8 — premium 18-villa development, 10 detailed (Under Development). */
    private function dabouq8Rows(): array
    {
        // [villa no., built-up m², land m², EN tagline, AR tagline]
        $villas = [
            [1, 447, 559, 'Beyond living, the future of refined residences', 'ما بعد العيش، مستقبل المساكن الراقية'],
            [2, 515, 598, 'Where prestige finds its home', 'حيث تجد الفخامة موطنها'],
            [3, 515, 601, 'Own a future classic — design and smart investment', 'امتلك كلاسيكية المستقبل — التصميم والاستثمار الذكي'],
            [4, 515, 609, 'Your private horizon in the heart of Amman', 'أفقك الخاص في قلب عمّان'],
            [5, 499, 600, 'Own the skyline, live the legacy', 'امتلك الأفق، عِش الإرث'],
            [6, 507, 656, 'Discover a new altitude of living', 'اكتشف ارتفاعاً جديداً للعيش'],
            [7, 507, 649, 'Create, invest, thrive', 'ابتكر، استثمر، ازدهر'],
            [8, 502, 660, 'Luxury that adapts to you', 'فخامة تتكيّف معك'],
            [9, 473, 611, 'Discover a new altitude of living', 'اكتشف ارتفاعاً جديداً للعيش'],
            [10, 415, 615, 'Discover a new altitude of living', 'اكتشف ارتفاعاً جديداً للعيش'],
        ];

        $rows = [];
        foreach ($villas as [$n, $built, $land, $tagEn, $tagAr]) {
            $rows[] = [
                'slug' => "dabouq-8-villa-{$n}",
                'title_en' => "Dabouq 8 – Villa {$n}",
                'title_ar' => "دابوق 8 – فيلا {$n}",
                'category' => Project::CATEGORY_UNDER_DEVELOPMENT,
                'listing_status' => 'for_sale',
                'group' => 'Dabouq 8',
                'location_en' => self::LOCATION_EN,
                'location_ar' => self::LOCATION_AR,
                'address_en' => self::LOCATION_EN,
                'address_ar' => self::LOCATION_AR,
                'short_description_en' => "{$land} m² land · {$built} m² built-up",
                'short_description_ar' => "{$land} م² أرض · {$built} م² بناء",
                'description_en' => "Part of DABOUQ 8 — a premium 18-villa development in the prestigious Dabouq district of Amman, with construction nearing completion. Villa {$n} spans {$land} m² of land with {$built} m² built-up across two floors: four master bedrooms with walk-in closets, a family living area, maid's room, swimming pool, three garages, under-floor heating and HVAC. {$tagEn}.",
                'description_ar' => "ضمن دابوق 8 — مجمّع فلل فاخر مكوّن من 18 فيلا في منطقة دابوق الراقية بعمّان، والبناء يقارب الاكتمال. تمتدّ فيلا {$n} على {$land} م² من الأرض بمساحة بناء {$built} م² على طابقين: أربع غرف نوم رئيسية مع غرف ملابس، ومنطقة معيشة عائلية، وغرفة خادمة، ومسبح، وثلاثة مرائب، وتدفئة أرضية وتكييف مركزي. {$tagAr}.",
                'area_sqm' => $built,
                'land_area_sqm' => $land,
                'floors' => 2,
                'bedrooms' => 4,
                'bathrooms' => 3,
                'hidden_specs' => ['bedrooms', 'bathrooms'],
                'completion_year' => null,
                'is_featured' => true,
                'sort_order' => 10 + $n,
            ];
        }

        return $rows;
    }
}
