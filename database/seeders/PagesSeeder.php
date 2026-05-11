<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

class PagesSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            ['slug' => 'home', 'title_en' => 'Home', 'title_ar' => 'الرئيسية', 'sort_order' => 1],
            ['slug' => 'properties', 'title_en' => 'Properties', 'title_ar' => 'العقارات', 'sort_order' => 2],
            ['slug' => 'investment', 'title_en' => 'Investment', 'title_ar' => 'الاستثمار', 'sort_order' => 3],
            ['slug' => 'self_build', 'title_en' => 'Self Build', 'title_ar' => 'البناء الذاتي', 'sort_order' => 4],
            ['slug' => 'security', 'title_en' => 'Security With SkyAmman', 'title_ar' => 'الأمان مع سكاي عمان', 'sort_order' => 5],
            ['slug' => 'about', 'title_en' => 'About Us', 'title_ar' => 'من نحن', 'sort_order' => 6],
            ['slug' => 'contact', 'title_en' => 'Contact Us', 'title_ar' => 'اتصل بنا', 'sort_order' => 7],
        ];

        foreach ($pages as $row) {
            Page::updateOrCreate(
                ['slug' => $row['slug']],
                [
                    ...$row,
                    'is_visible' => true,
                ],
            );
        }
    }
}
