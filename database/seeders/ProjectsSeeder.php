<?php

namespace Database\Seeders;

use App\Models\Project;
use Illuminate\Database\Seeder;

/**
 * Seeds the four DABOUQ villa projects shown on the Figma homepage Project
 * Showcase carousel. Featured images are placeholders served from
 * /images/projects/dabouq-N.webp until the designer delivers final renders.
 */
class ProjectsSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            [
                'slug' => 'dabouq-3',
                'title_en' => 'DABOUQ 3 PROJECT',
                'title_ar' => 'مشروع دابوق 3',
                'category' => Project::CATEGORY_UNDER_DEVELOPMENT,
                'listing_status' => 'for_sale',
                'location_en' => 'Jordan - Amman',
                'location_ar' => 'الأردن - عمّان',
                'address_en' => 'Amman - Dabouq',
                'address_ar' => 'عمّان - دابوق',
                'area_sqm' => 2500,
                'floors' => 3,
                'bedrooms' => 5,
                'bathrooms' => 6,
                'completion_year' => 2026,
                'placeholder' => '/images/projects/dabouq-3.webp',
                'sort_order' => 1,
                'is_featured' => true,
            ],
            [
                'slug' => 'dabouq-4',
                'title_en' => 'DABOUQ 4 PROJECT',
                'title_ar' => 'مشروع دابوق 4',
                'category' => Project::CATEGORY_UNDER_DEVELOPMENT,
                'listing_status' => 'for_sale',
                'location_en' => 'Jordan - Amman',
                'location_ar' => 'الأردن - عمّان',
                'address_en' => 'Amman - Dabouq',
                'address_ar' => 'عمّان - دابوق',
                'area_sqm' => 1954,
                'floors' => 3,
                'bedrooms' => 4,
                'bathrooms' => 5,
                'completion_year' => 2026,
                'placeholder' => '/images/projects/dabouq-4.webp',
                'sort_order' => 2,
                'is_featured' => true,
            ],
            [
                'slug' => 'dabouq-5',
                'title_en' => 'DABOUQ 5 PROJECT',
                'title_ar' => 'مشروع دابوق 5',
                'category' => Project::CATEGORY_READY,
                'listing_status' => 'for_sale',
                'location_en' => 'Jordan - Amman',
                'location_ar' => 'الأردن - عمّان',
                'address_en' => 'Amman - Dabouq',
                'address_ar' => 'عمّان - دابوق',
                'area_sqm' => 850,
                'floors' => 2,
                'bedrooms' => 3,
                'bathrooms' => 4,
                'completion_year' => 2025,
                'placeholder' => '/images/projects/dabouq-5.webp',
                'sort_order' => 3,
                'is_featured' => true,
            ],
            [
                'slug' => 'dabouq-6',
                'title_en' => 'DABOUQ 6 PROJECT',
                'title_ar' => 'مشروع دابوق 6',
                'category' => Project::CATEGORY_INVESTMENT,
                'listing_status' => 'for_sale',
                'location_en' => 'Jordan - Amman',
                'location_ar' => 'الأردن - عمّان',
                'address_en' => 'Amman - Dabouq',
                'address_ar' => 'عمّان - دابوق',
                'area_sqm' => 2900,
                'floors' => null,
                'bedrooms' => null,
                'bathrooms' => null,
                'completion_year' => null,
                'placeholder' => '/images/projects/dabouq-6.webp',
                'sort_order' => 4,
                'is_featured' => true,
            ],
        ];

        foreach ($rows as $row) {
            unset($row['placeholder']);

            Project::updateOrCreate(
                ['slug' => $row['slug']],
                array_merge($row, [
                    'is_active' => true,
                    'short_description_en' => $row['area_sqm'].' M²',
                    'short_description_ar' => $row['area_sqm'].' م²',
                ]),
            );
        }
    }
}
