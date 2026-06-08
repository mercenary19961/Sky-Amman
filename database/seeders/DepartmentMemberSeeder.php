<?php

namespace Database\Seeders;

use App\Models\DepartmentMember;
use Illuminate\Database\Seeder;

class DepartmentMemberSeeder extends Seeder
{
    /**
     * Seeds the homepage "Head of Departments" team (moved out of site_content).
     * Photos are added later via Admin → Head of Departments. Keyed on the EN
     * name so re-running won't duplicate.
     */
    public function run(): void
    {
        $members = [
            ['name_en' => 'Eng. Mahmoud Abu Sarhan', 'name_ar' => 'م. محمود أبو سرحان', 'role_en' => 'Chief Executive Officer', 'role_ar' => 'الرئيس التنفيذي'],
            ['name_en' => 'Eng. Hossam Salameh',     'name_ar' => 'م. حسام سلامة',       'role_en' => 'Projects Director',      'role_ar' => 'مدير المشاريع'],
            ['name_en' => 'Mr. Mohammad Makhl',      'name_ar' => 'السيد محمد مكحل',      'role_en' => 'Chief Financial Officer', 'role_ar' => 'المدير المالي'],
            ['name_en' => 'Mr. Sadad Al Rawashdeh',  'name_ar' => 'السيد سداد الرواشدة',  'role_en' => 'Legal Director',         'role_ar' => 'المدير القانوني'],
        ];

        foreach ($members as $i => $member) {
            DepartmentMember::updateOrCreate(
                ['name_en' => $member['name_en']],
                [...$member, 'sort_order' => $i + 1, 'is_active' => true],
            );
        }
    }
}
