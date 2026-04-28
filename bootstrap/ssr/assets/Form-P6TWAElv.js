import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, Head, Link, router } from "@inertiajs/react";
import { useState, useCallback } from "react";
import { Upload, GripVertical, Star, ImageIcon, Trash2, ArrowLeft, Save } from "lucide-react";
import { A as AdminLayout } from "./AdminLayout-DnPfbuel.js";
import { useDropzone } from "react-dropzone";
import { useSensors, useSensor, PointerSensor, DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { c as cn } from "./cn-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
function SortableImage({
  image,
  isFeatured,
  isOg,
  onSetFeatured,
  onSetOg,
  onDelete
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };
  const [confirmDelete, setConfirmDelete] = useState(false);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: setNodeRef,
      style,
      className: cn(
        "group relative bg-surface-muted rounded-lg overflow-hidden border-2 transition-all",
        isDragging ? "opacity-50 scale-95 border-primary" : "border-transparent",
        isFeatured && "ring-2 ring-primary"
      ),
      children: [
        /* @__PURE__ */ jsx("div", { className: "aspect-4/3", children: /* @__PURE__ */ jsx(
          "img",
          {
            src: image.media.url,
            alt: image.media.alt_text_en ?? image.media.original_filename,
            className: "w-full h-full object-cover",
            draggable: false
          }
        ) }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            ...attributes,
            ...listeners,
            className: "absolute top-1.5 left-1.5 p-1 rounded bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing",
            title: "Drag to reorder",
            children: /* @__PURE__ */ jsx(GripVertical, { size: 14 })
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "absolute top-1.5 right-1.5 flex flex-col gap-1", children: [
          isFeatured && /* @__PURE__ */ jsx("span", { className: "px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary text-white", children: "Featured" }),
          isOg && /* @__PURE__ */ jsx("span", { className: "px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500 text-white", children: "OG" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "absolute inset-x-0 bottom-0 bg-black/60 flex items-center justify-around py-1 opacity-0 group-hover:opacity-100 transition-opacity", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: onSetFeatured,
              title: isFeatured ? "Featured image" : "Set as featured",
              className: cn(
                "p-1.5 rounded transition-colors",
                isFeatured ? "text-primary" : "text-white hover:text-primary"
              ),
              children: /* @__PURE__ */ jsx(Star, { size: 13, fill: isFeatured ? "currentColor" : "none" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: onSetOg,
              title: isOg ? "OG image" : "Set as OG image",
              className: cn(
                "p-1.5 rounded transition-colors",
                isOg ? "text-amber-400" : "text-white hover:text-amber-400"
              ),
              children: /* @__PURE__ */ jsx(ImageIcon, { size: 13 })
            }
          ),
          confirmDelete ? /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-[10px]", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: onDelete,
                className: "text-red-400 font-medium hover:text-red-300",
                children: "Delete"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-white/50", children: "/" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setConfirmDelete(false),
                className: "text-white/70 hover:text-white",
                children: "Keep"
              }
            )
          ] }) : /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setConfirmDelete(true),
              className: "p-1.5 rounded text-white hover:text-red-400 transition-colors",
              title: "Delete image",
              children: /* @__PURE__ */ jsx(Trash2, { size: 13 })
            }
          )
        ] })
      ]
    }
  );
}
function ProjectGallery({
  projectId,
  images,
  featuredImageId,
  ogImageId,
  onImagesChange,
  onFeaturedChange,
  onOgChange
}) {
  const [uploading, setUploading] = useState([]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const uploadFile = useCallback(async (file) => {
    const key = `${Date.now()}-${file.name}`;
    setUploading((prev) => [...prev, { key, filename: file.name, progress: 0, error: null }]);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await window.axios.post(
        `/admin/projects/${projectId}/images`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            const pct = Math.round(e.loaded * 100 / (e.total ?? 1));
            setUploading(
              (prev) => prev.map((u) => u.key === key ? { ...u, progress: pct } : u)
            );
          }
        }
      );
      onImagesChange([...images, response.data]);
      setUploading((prev) => prev.filter((u) => u.key !== key));
    } catch {
      setUploading(
        (prev) => prev.map((u) => u.key === key ? { ...u, error: "Upload failed. Try again." } : u)
      );
    }
  }, [projectId, onImagesChange]);
  const onDrop = useCallback((accepted) => {
    accepted.forEach(uploadFile);
  }, [uploadFile]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxSize: 10 * 1024 * 1024,
    multiple: true
  });
  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = images.findIndex((img) => img.id === active.id);
    const newIndex = images.findIndex((img) => img.id === over.id);
    const reordered = arrayMove(images, oldIndex, newIndex).map((img, i) => ({
      ...img,
      sort_order: i
    }));
    onImagesChange(reordered);
    window.axios.post(`/admin/projects/${projectId}/images/reorder`, {
      ids: reordered.map((img) => img.id)
    }).catch(() => {
      console.error("Reorder failed");
    });
  }
  function deleteImage(imageId) {
    window.axios.delete(`/admin/projects/${projectId}/images/${imageId}`).then(() => {
      const updated = images.filter((img) => img.id !== imageId);
      onImagesChange(updated);
      if (featuredImageId === images.find((img) => img.id === imageId)?.media.id) {
        onFeaturedChange(updated[0]?.media.id ?? null);
      }
      if (ogImageId === images.find((img) => img.id === imageId)?.media.id) {
        onOgChange(null);
      }
    }).catch(() => console.error("Delete failed"));
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        ...getRootProps(),
        className: cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-ink/15 hover:border-primary/40 hover:bg-surface-muted"
        ),
        children: [
          /* @__PURE__ */ jsx("input", { ...getInputProps() }),
          /* @__PURE__ */ jsx(Upload, { size: 20, className: "mx-auto mb-2 text-ink-muted" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-muted", children: isDragActive ? "Drop images here…" : "Drag & drop images, or click to browse" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-ink/40 mt-1", children: "JPEG, PNG, WebP — max 10 MB each" })
        ]
      }
    ),
    uploading.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-3 space-y-2", children: uploading.map((u) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-sm", children: [
      /* @__PURE__ */ jsx("span", { className: "truncate text-ink-muted flex-1", children: u.filename }),
      u.error ? /* @__PURE__ */ jsx("span", { className: "text-red-500 text-xs", children: u.error }) : /* @__PURE__ */ jsx("div", { className: "w-32 h-1.5 bg-ink/10 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
        "div",
        {
          className: "h-full bg-primary transition-all duration-150",
          style: { width: `${u.progress}%` }
        }
      ) })
    ] }, u.key)) }),
    images.length > 0 && /* @__PURE__ */ jsx(
      DndContext,
      {
        sensors,
        collisionDetection: closestCenter,
        onDragEnd: handleDragEnd,
        children: /* @__PURE__ */ jsx(SortableContext, { items: images.map((img) => img.id), strategy: rectSortingStrategy, children: /* @__PURE__ */ jsx("div", { className: "mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3", children: images.map((image) => /* @__PURE__ */ jsx(
          SortableImage,
          {
            image,
            isFeatured: featuredImageId === image.media.id,
            isOg: ogImageId === image.media.id,
            onSetFeatured: () => onFeaturedChange(
              featuredImageId === image.media.id ? null : image.media.id
            ),
            onSetOg: () => onOgChange(
              ogImageId === image.media.id ? null : image.media.id
            ),
            onDelete: () => deleteImage(image.id)
          },
          image.id
        )) }) })
      }
    )
  ] });
}
function Field({ label, error, children }) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-ink-muted mb-1", children: label }),
    children,
    error && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-500", children: error })
  ] });
}
function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  className
}) {
  return /* @__PURE__ */ jsx(
    "input",
    {
      type,
      value: value ?? "",
      onChange: (e) => onChange(e.target.value),
      placeholder,
      className: cn(
        "w-full px-3 py-2 text-sm border border-ink/10 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:bg-zinc-700 dark:text-zinc-100",
        className
      )
    }
  );
}
function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3
}) {
  return /* @__PURE__ */ jsx(
    "textarea",
    {
      value: value ?? "",
      onChange: (e) => onChange(e.target.value),
      placeholder,
      rows,
      className: "w-full px-3 py-2 text-sm border border-ink/10 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:bg-zinc-700 dark:text-zinc-100 resize-y"
    }
  );
}
function SectionHeader({ title, description }) {
  return /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-ink", children: title }),
    description && /* @__PURE__ */ jsx("p", { className: "text-xs text-ink-muted mt-0.5", children: description })
  ] });
}
function Section({ children }) {
  return /* @__PURE__ */ jsx("div", { className: "bg-white dark:bg-zinc-800 border border-ink/5 dark:border-white/10 rounded-lg p-5 mb-4", children });
}
function BilingualRow({ children }) {
  return /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children });
}
function initialData(item) {
  return {
    title_en: item?.title_en ?? "",
    title_ar: item?.title_ar ?? "",
    category: item?.category ?? "under_development",
    listing_status: item?.listing_status ?? null,
    short_description_en: item?.short_description_en ?? "",
    short_description_ar: item?.short_description_ar ?? "",
    description_en: item?.description_en ?? "",
    description_ar: item?.description_ar ?? "",
    location_en: item?.location_en ?? "",
    location_ar: item?.location_ar ?? "",
    address_en: item?.address_en ?? "",
    address_ar: item?.address_ar ?? "",
    area_sqm: item?.area_sqm ?? null,
    completion_year: item?.completion_year ?? null,
    floors: item?.floors ?? null,
    bedrooms: item?.bedrooms ?? null,
    bathrooms: item?.bathrooms ?? null,
    featured_image_id: item?.featured_image_id ?? null,
    seo_title_en: item?.seo_title_en ?? "",
    seo_title_ar: item?.seo_title_ar ?? "",
    seo_description_en: item?.seo_description_en ?? "",
    seo_description_ar: item?.seo_description_ar ?? "",
    og_image_id: item?.og_image_id ?? null,
    is_active: item?.is_active ?? true,
    is_featured: item?.is_featured ?? false,
    sort_order: item?.sort_order ?? 0
  };
}
function ProjectForm() {
  const { item } = usePage().props;
  const isEdit = item !== null;
  const [data, setData] = useState(() => initialData(item));
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [images, setImages] = useState(item?.images ?? []);
  function set(key, value) {
    setData((prev) => ({ ...prev, [key]: value }));
  }
  function submit(e) {
    e.preventDefault();
    setProcessing(true);
    const payload = {
      ...data,
      // Send nulls for empty numeric fields so Laravel casts correctly.
      area_sqm: data.area_sqm || null,
      completion_year: data.completion_year || null,
      floors: data.floors || null,
      bedrooms: data.bedrooms || null,
      bathrooms: data.bathrooms || null,
      listing_status: data.listing_status || null
    };
    if (isEdit) {
      router.put(`/admin/projects/${item.id}`, payload, {
        preserveScroll: true,
        onError: (errs) => {
          setErrors(errs);
          setProcessing(false);
        },
        onSuccess: () => setProcessing(false)
      });
    } else {
      router.post("/admin/projects", payload, {
        onError: (errs) => {
          setErrors(errs);
          setProcessing(false);
        },
        onSuccess: () => setProcessing(false)
      });
    }
  }
  return /* @__PURE__ */ jsxs(AdminLayout, { title: isEdit ? `Edit: ${item.title_en}` : "New Project", children: [
    /* @__PURE__ */ jsx(Head, { title: isEdit ? `Edit: ${item.title_en}` : "New Project" }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: "/admin/projects",
          className: "inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { size: 15 }),
            "Projects"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          form: "project-form",
          onClick: submit,
          disabled: processing,
          className: "inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary-dark disabled:opacity-60 transition-colors",
          children: [
            /* @__PURE__ */ jsx(Save, { size: 15 }),
            processing ? "Saving…" : "Save Changes"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("form", { id: "project-form", onSubmit: submit, children: [
      /* @__PURE__ */ jsxs(Section, { children: [
        /* @__PURE__ */ jsx(SectionHeader, { title: "Basic Info" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs(BilingualRow, { children: [
            /* @__PURE__ */ jsx(Field, { label: "Title (EN)", error: errors.title_en, children: /* @__PURE__ */ jsx(Input, { value: data.title_en, onChange: (v) => set("title_en", v), placeholder: "Project title in English" }) }),
            /* @__PURE__ */ jsx(Field, { label: "Title (AR)", error: errors.title_ar, children: /* @__PURE__ */ jsx(Input, { value: data.title_ar, onChange: (v) => set("title_ar", v), placeholder: "عنوان المشروع بالعربية" }) })
          ] }),
          /* @__PURE__ */ jsxs(BilingualRow, { children: [
            /* @__PURE__ */ jsx(Field, { label: "Short Description (EN)", error: errors.short_description_en, children: /* @__PURE__ */ jsx(Textarea, { value: data.short_description_en, onChange: (v) => set("short_description_en", v), placeholder: "Brief summary…", rows: 2 }) }),
            /* @__PURE__ */ jsx(Field, { label: "Short Description (AR)", error: errors.short_description_ar, children: /* @__PURE__ */ jsx(Textarea, { value: data.short_description_ar, onChange: (v) => set("short_description_ar", v), placeholder: "ملخص قصير…", rows: 2 }) })
          ] }),
          /* @__PURE__ */ jsxs(BilingualRow, { children: [
            /* @__PURE__ */ jsx(Field, { label: "Description (EN)", error: errors.description_en, children: /* @__PURE__ */ jsx(Textarea, { value: data.description_en, onChange: (v) => set("description_en", v), placeholder: "Full description…", rows: 5 }) }),
            /* @__PURE__ */ jsx(Field, { label: "Description (AR)", error: errors.description_ar, children: /* @__PURE__ */ jsx(Textarea, { value: data.description_ar, onChange: (v) => set("description_ar", v), placeholder: "الوصف الكامل…", rows: 5 }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Section, { children: [
        /* @__PURE__ */ jsx(SectionHeader, { title: "Listing Details" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsx(Field, { label: "Category", error: errors.category, children: /* @__PURE__ */ jsxs(
              "select",
              {
                value: data.category,
                onChange: (e) => set("category", e.target.value),
                className: "w-full px-3 py-2 text-sm border border-ink/10 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:bg-zinc-700 dark:text-zinc-100",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "under_development", children: "Under Development" }),
                  /* @__PURE__ */ jsx("option", { value: "ready", children: "Ready" }),
                  /* @__PURE__ */ jsx("option", { value: "investment_opportunity", children: "Investment Opportunity" })
                ]
              }
            ) }),
            /* @__PURE__ */ jsx(Field, { label: "Listing Status", error: errors.listing_status, children: /* @__PURE__ */ jsxs(
              "select",
              {
                value: data.listing_status ?? "",
                onChange: (e) => set("listing_status", e.target.value || null),
                className: "w-full px-3 py-2 text-sm border border-ink/10 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:bg-zinc-700 dark:text-zinc-100",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "— None —" }),
                  /* @__PURE__ */ jsx("option", { value: "for_sale", children: "For Sale" }),
                  /* @__PURE__ */ jsx("option", { value: "for_rent", children: "For Rent" }),
                  /* @__PURE__ */ jsx("option", { value: "sold", children: "Sold" }),
                  /* @__PURE__ */ jsx("option", { value: "reserved", children: "Reserved" })
                ]
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-5", children: [
            /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  checked: data.is_active,
                  onChange: (e) => set("is_active", e.target.checked),
                  className: "w-4 h-4 accent-primary"
                }
              ),
              "Active (visible on site)"
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  checked: data.is_featured,
                  onChange: (e) => set("is_featured", e.target.checked),
                  className: "w-4 h-4 accent-primary"
                }
              ),
              "Featured (shown in homepage carousel)"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-ink-muted", children: "Sort Order" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  value: data.sort_order,
                  onChange: (e) => set("sort_order", parseInt(e.target.value, 10) || 0),
                  min: 0,
                  className: "w-20 px-2 py-1.5 text-sm border border-ink/10 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:bg-zinc-700 dark:text-zinc-100"
                }
              )
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Section, { children: [
        /* @__PURE__ */ jsx(SectionHeader, { title: "Location", description: "Location shows on the project card. Address shows on the detail page." }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs(BilingualRow, { children: [
            /* @__PURE__ */ jsx(Field, { label: "Location (EN)", error: errors.location_en, children: /* @__PURE__ */ jsx(Input, { value: data.location_en, onChange: (v) => set("location_en", v), placeholder: "Jordan - Amman" }) }),
            /* @__PURE__ */ jsx(Field, { label: "Location (AR)", error: errors.location_ar, children: /* @__PURE__ */ jsx(Input, { value: data.location_ar, onChange: (v) => set("location_ar", v), placeholder: "الأردن - عمّان" }) })
          ] }),
          /* @__PURE__ */ jsxs(BilingualRow, { children: [
            /* @__PURE__ */ jsx(Field, { label: "Address (EN)", error: errors.address_en, children: /* @__PURE__ */ jsx(Input, { value: data.address_en, onChange: (v) => set("address_en", v), placeholder: "Amman - Dabouq" }) }),
            /* @__PURE__ */ jsx(Field, { label: "Address (AR)", error: errors.address_ar, children: /* @__PURE__ */ jsx(Input, { value: data.address_ar, onChange: (v) => set("address_ar", v), placeholder: "عمّان - دابوق" }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Section, { children: [
        /* @__PURE__ */ jsx(SectionHeader, { title: "Property Specs", description: "Leave blank for investment opportunities or land plots." }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-5 gap-3", children: [
          /* @__PURE__ */ jsx(Field, { label: "Area (m²)", error: errors.area_sqm, children: /* @__PURE__ */ jsx(Input, { type: "number", value: data.area_sqm, onChange: (v) => set("area_sqm", v ? parseInt(v, 10) : null), placeholder: "850" }) }),
          /* @__PURE__ */ jsx(Field, { label: "Floors", error: errors.floors, children: /* @__PURE__ */ jsx(Input, { type: "number", value: data.floors, onChange: (v) => set("floors", v ? parseInt(v, 10) : null), placeholder: "3" }) }),
          /* @__PURE__ */ jsx(Field, { label: "Bedrooms", error: errors.bedrooms, children: /* @__PURE__ */ jsx(Input, { type: "number", value: data.bedrooms, onChange: (v) => set("bedrooms", v ? parseInt(v, 10) : null), placeholder: "4" }) }),
          /* @__PURE__ */ jsx(Field, { label: "Bathrooms", error: errors.bathrooms, children: /* @__PURE__ */ jsx(Input, { type: "number", value: data.bathrooms, onChange: (v) => set("bathrooms", v ? parseInt(v, 10) : null), placeholder: "5" }) }),
          /* @__PURE__ */ jsx(Field, { label: "Completion Year", error: errors.completion_year, children: /* @__PURE__ */ jsx(Input, { type: "number", value: data.completion_year, onChange: (v) => set("completion_year", v ? parseInt(v, 10) : null), placeholder: "2026" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Section, { children: [
        /* @__PURE__ */ jsx(
          SectionHeader,
          {
            title: "SEO",
            description: isEdit ? "OG image is picked from the gallery below." : "Save the project first, then upload images and set the OG image from the gallery."
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs(BilingualRow, { children: [
            /* @__PURE__ */ jsx(Field, { label: "SEO Title (EN)", error: errors.seo_title_en, children: /* @__PURE__ */ jsx(Input, { value: data.seo_title_en, onChange: (v) => set("seo_title_en", v), placeholder: "Defaults to project title if empty" }) }),
            /* @__PURE__ */ jsx(Field, { label: "SEO Title (AR)", error: errors.seo_title_ar, children: /* @__PURE__ */ jsx(Input, { value: data.seo_title_ar, onChange: (v) => set("seo_title_ar", v), placeholder: "يرجع إلى عنوان المشروع إذا تُرك فارغاً" }) })
          ] }),
          /* @__PURE__ */ jsxs(BilingualRow, { children: [
            /* @__PURE__ */ jsx(Field, { label: "SEO Description (EN)", error: errors.seo_description_en, children: /* @__PURE__ */ jsx(Textarea, { value: data.seo_description_en, onChange: (v) => set("seo_description_en", v), placeholder: "Max 500 characters", rows: 2 }) }),
            /* @__PURE__ */ jsx(Field, { label: "SEO Description (AR)", error: errors.seo_description_ar, children: /* @__PURE__ */ jsx(Textarea, { value: data.seo_description_ar, onChange: (v) => set("seo_description_ar", v), placeholder: "حد أقصى 500 حرف", rows: 2 }) })
          ] }),
          isEdit && data.og_image_id && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 pt-1", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs text-ink-muted", children: "OG Image:" }),
            /* @__PURE__ */ jsx(
              "img",
              {
                src: images.find((img) => img.media.id === data.og_image_id)?.media.url ?? "",
                alt: "OG",
                className: "w-16 h-10 object-cover rounded border border-ink/10"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => set("og_image_id", null),
                className: "text-xs text-red-500 hover:underline",
                children: "Remove"
              }
            )
          ] })
        ] })
      ] })
    ] }),
    isEdit && /* @__PURE__ */ jsxs(Section, { children: [
      /* @__PURE__ */ jsx(
        SectionHeader,
        {
          title: "Gallery",
          description: "Drag to reorder. First image is the card thumbnail. Set one as OG to use it for social sharing previews."
        }
      ),
      /* @__PURE__ */ jsx(
        ProjectGallery,
        {
          projectId: item.id,
          images,
          featuredImageId: data.featured_image_id,
          ogImageId: data.og_image_id,
          onImagesChange: setImages,
          onFeaturedChange: (id) => set("featured_image_id", id),
          onOgChange: (id) => set("og_image_id", id)
        }
      ),
      images.length > 0 && /* @__PURE__ */ jsxs("p", { className: "mt-3 text-xs text-ink-muted", children: [
        "Changes to featured image and OG image are saved with the",
        " ",
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: submit,
            className: "text-primary hover:underline",
            children: "Save Changes"
          }
        ),
        " ",
        "button above."
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-end mt-2 mb-8", children: /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: submit,
        disabled: processing,
        className: "inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary-dark disabled:opacity-60 transition-colors",
        children: [
          /* @__PURE__ */ jsx(Save, { size: 15 }),
          processing ? "Saving…" : "Save Changes"
        ]
      }
    ) })
  ] });
}
export {
  ProjectForm as default
};
