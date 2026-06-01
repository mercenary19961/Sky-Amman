<?php

namespace Database\Seeders;

use App\Models\TestimonialVideo;
use Illuminate\Database\Seeder;

class TestimonialVideosSeeder extends Seeder
{
    /**
     * Seeds the homepage Testimonials carousel with three placeholder entries
     * pointing at the committed sample clip. Admin manages these via
     * Admin → Testimonial Videos (add/remove, reorder, active toggle).
     */
    public function run(): void
    {
        $videos = [
            ['Testimonial 1', '/video/testimonials.mp4'],
            ['Testimonial 2', '/video/testimonials.mp4'],
            ['Testimonial 3', '/video/testimonials.mp4'],
        ];

        foreach ($videos as $i => [$title, $url]) {
            TestimonialVideo::updateOrCreate(
                ['title' => $title],
                ['url' => $url, 'sort_order' => $i + 1, 'is_active' => true],
            );
        }
    }
}
