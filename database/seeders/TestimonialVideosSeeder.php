<?php

namespace Database\Seeders;

use App\Models\TestimonialVideo;
use Illuminate\Database\Seeder;

class TestimonialVideosSeeder extends Seeder
{
    /**
     * Seeds the homepage Testimonials carousel with three real, embeddable
     * YouTube clips (architecture / apartments — placeholders until the client
     * supplies actual testimonial videos). Admin manages these via
     * Admin → Testimonial Videos (add/remove, reorder, active toggle); the
     * field accepts a YouTube URL (file upload is intentionally not supported).
     */
    public function run(): void
    {
        $videos = [
            ['Testimonial 1', 'https://www.youtube.com/watch?v=_Vp5qoe6BdE'],
            ['Testimonial 2', 'https://www.youtube.com/watch?v=xfXMoGmb74w'],
            ['Testimonial 3', 'https://www.youtube.com/watch?v=qtJtdyz3Kqc'],
        ];

        foreach ($videos as $i => [$title, $url]) {
            TestimonialVideo::updateOrCreate(
                ['title' => $title],
                ['url' => $url, 'sort_order' => $i + 1, 'is_active' => true],
            );
        }
    }
}
