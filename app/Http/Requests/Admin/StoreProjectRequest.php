<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title_en'              => 'required|string|max:255',
            'title_ar'              => 'required|string|max:255',
            'category'              => 'required|in:under_development,ready,investment_opportunity',
            'listing_status'        => 'nullable|in:for_sale,for_rent,sold,reserved',
            'short_description_en'  => 'nullable|string|max:1000',
            'short_description_ar'  => 'nullable|string|max:1000',
            'description_en'        => 'nullable|string',
            'description_ar'        => 'nullable|string',
            'location_en'           => 'nullable|string|max:255',
            'location_ar'           => 'nullable|string|max:255',
            'address_en'            => 'nullable|string|max:255',
            'address_ar'            => 'nullable|string|max:255',
            'area_sqm'              => 'nullable|integer|min:1',
            'land_area_sqm'         => 'nullable|integer|min:1',
            'completion_year'       => 'nullable|integer|min:1900|max:2100',
            'floors'                => 'nullable|integer|min:1|max:200',
            'bedrooms'              => 'nullable|integer|min:0|max:50',
            'bathrooms'             => 'nullable|integer|min:0|max:50',
            'hidden_specs'          => 'nullable|array',
            'hidden_specs.*'        => 'in:area_sqm,land_area_sqm,completion_year,floors,bedrooms,bathrooms',
            'featured_image_id'     => 'nullable|exists:media,id',
            'seo_title_en'          => 'nullable|string|max:255',
            'seo_title_ar'          => 'nullable|string|max:255',
            'seo_description_en'    => 'nullable|string|max:500',
            'seo_description_ar'    => 'nullable|string|max:500',
            'og_image_id'           => 'nullable|exists:media,id',
            'is_active'             => 'boolean',
            'is_featured'           => 'boolean',
            'sort_order'            => 'integer|min:0',
        ];
    }
}
