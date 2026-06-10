<?php

namespace Database\Seeders;

use App\Models\Project;
use Illuminate\Database\Seeder;

/**
 * Real catalogue — the DABOUQ-7 luxury villa development (from the DABOUQ-7
 * brochure). Eight villas on a 5,288 m² site in the heart of Dabouq, Amman:
 * villas 3,4,5,7,8 are available (Ready, for sale); villas 1,2,6 are sold.
 *
 * Each available villa ships with a committed render at
 * /images/projects/dabouq-7-villa-{n}.webp (extracted from the brochure); the
 * Project::displayImageUrls() fallback serves it until an admin uploads gallery
 * images. Bedrooms (4) + bathrooms (3) are stored but HIDDEN via hidden_specs
 * for the admin to confirm/adjust later. `area_sqm` = built-up area; the new
 * `land_area_sqm` = plot/land area.
 */
class ProjectsSeeder extends Seeder
{
    private const LOCATION_EN = 'Dabouq, Amman';
    private const LOCATION_AR = 'دابوق، عمّان';
    private const ADDRESS_EN = 'Ahl Al-Beit St., Dabouq, Amman';
    private const ADDRESS_AR = 'شارع أهل البيت، دابوق، عمّان';

    public function run(): void
    {
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
                'address_en' => self::ADDRESS_EN,
                'address_ar' => self::ADDRESS_AR,
                'short_description_en' => "{$land} m² land · {$built} m² built-up",
                'short_description_ar' => "{$land} م² أرض · {$built} م² بناء",
                'description_en' => "Part of the DABOUQ-7 luxury villa development in the heart of Dabouq, Amman. Villa {$n} offers {$land} m² of land and {$built} m² of built-up area across two floors, featuring {$hlEn}.",
                'description_ar' => "ضمن مجمّع فلل دابوق-7 الفاخر في قلب دابوق، عمّان. تقدّم فيلا {$n} مساحة أرض {$land} م² ومساحة بناء {$built} م² على طابقين، وتتميّز بـ{$hlAr}.",
                'area_sqm' => $built,
                'land_area_sqm' => $land,
                'floors' => 2,
                'bedrooms' => 4,
                'bathrooms' => 3,
                // Stored but hidden on the public detail page — admin reveals later.
                'hidden_specs' => ['bedrooms', 'bathrooms'],
                'completion_year' => null,
                'is_featured' => true,
                'sort_order' => $sort++,
            ];
        }

        // Sold villas — minimal records (areas not published in the brochure).
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
                'address_en' => self::ADDRESS_EN,
                'address_ar' => self::ADDRESS_AR,
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

        $slugs = [];
        foreach ($rows as $row) {
            $slugs[] = $row['slug'];
            Project::updateOrCreate(['slug' => $row['slug']], $row + ['is_active' => true]);
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
}
