"use client";

import { useState, useRef } from "react";
import { Upload, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useSiteContent, type SiteImages } from "@/lib/site-content";

interface ImageSlotProps {
  label: string;
  currentSrc: string;
  onChange: (newSrc: string) => void;
}

function ImageSlot({ label, currentSrc, onChange }: ImageSlotProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentSrc);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData, credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        setPreview(data.path);
        onChange(data.path);
        toast.success("Image uploaded");
      } else {
        toast.error("Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="border border-border p-4">
      <p className="text-sm text-muted-foreground mb-3">{label}</p>
      <div className="aspect-[4/3] bg-muted rounded overflow-hidden mb-3">
        {preview ? (
          <img src={preview} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
        )}
      </div>
      <div className="flex gap-2">
        <label className="flex-1 flex items-center justify-center gap-2 border border-border px-3 py-2 text-sm cursor-pointer hover:bg-muted transition-colors">
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading..." : "Upload"}
          <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
        {preview && preview !== currentSrc && (
          <button onClick={() => { setPreview(currentSrc); }} className="px-3 py-2 text-sm border border-border hover:bg-muted">
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

interface GalleryImageSlotProps {
  label: string;
  index: number;
  currentSrc: string;
  onChange: (index: number, newSrc: string) => void;
  onRemove: () => void;
}

function GalleryImageSlot({ label, index, currentSrc, onChange, onRemove }: GalleryImageSlotProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentSrc);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData, credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        setPreview(data.path);
        onChange(index, data.path);
        toast.success("Image uploaded");
      } else {
        toast.error("Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="border border-border p-3 relative">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground">{label}</p>
        <button onClick={onRemove} className="text-destructive/60 hover:text-destructive">
          <X className="h-3 w-3" />
        </button>
      </div>
      <div className="aspect-square bg-muted rounded overflow-hidden mb-2">
        {preview ? (
          <img src={preview} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Empty</div>
        )}
      </div>
      <label className="flex items-center justify-center gap-1 border border-border px-2 py-1 text-xs cursor-pointer hover:bg-muted transition-colors">
        <Upload className="h-3 w-3" />
        {uploading ? "..." : "Upload"}
        <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
      </label>
    </div>
  );
}

export default function ImagesPage() {
  const { content, refresh } = useSiteContent();
  const [images, setImages] = useState<SiteImages>(content.images);
  const [saving, setSaving] = useState(false);

  function updateImage(key: keyof SiteImages, value: string) {
    setImages({ ...images, [key]: value });
  }

  function updateGalleryItem(index: number, value: string) {
    const updated = [...images.gallery];
    updated[index] = value;
    setImages({ ...images, gallery: updated });
  }

  function removeGalleryItem(index: number) {
    setImages({ ...images, gallery: images.gallery.filter((_, i) => i !== index) });
  }

  function addGalleryItem() {
    setImages({ ...images, gallery: [...images.gallery, ""] });
  }

  function updateVisitItem(index: number, value: string) {
    const updated = [...images.visit];
    updated[index] = value;
    setImages({ ...images, visit: updated });
  }

  function removeVisitItem(index: number) {
    setImages({ ...images, visit: images.visit.filter((_, i) => i !== index) });
  }

  function addVisitItem() {
    setImages({ ...images, visit: [...images.visit, ""] });
  }

  function updatePhilosophyItem(index: number, value: string) {
    const updated = [...images.philosophyValues];
    updated[index] = value;
    setImages({ ...images, philosophyValues: updated });
  }

  function removePhilosophyItem(index: number) {
    setImages({ ...images, philosophyValues: images.philosophyValues.filter((_, i) => i !== index) });
  }

  function addPhilosophyItem() {
    setImages({ ...images, philosophyValues: [...images.philosophyValues, ""] });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ ...content, images }),
      });
      if (res.ok) {
        toast.success("Images saved successfully");
        refresh();
      } else {
        toast.error("Failed to save");
      }
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl">Images</h1>
          <p className="text-sm text-muted-foreground mt-1">Upload and manage all website images</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Single Images */}
      <section className="mb-12">
        <h2 className="font-display text-xl mb-4">Section Images</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ImageSlot label="Hero" currentSrc={images.hero} onChange={(v) => updateImage("hero", v)} />
          <ImageSlot label="Coffee" currentSrc={images.coffee} onChange={(v) => updateImage("coffee", v)} />
          <ImageSlot label="Desserts" currentSrc={images.desserts} onChange={(v) => updateImage("desserts", v)} />
          <ImageSlot label="Signature Cup" currentSrc={images.signatureCup} onChange={(v) => updateImage("signatureCup", v)} />
          <ImageSlot label="Signature Cups" currentSrc={images.signatureCups} onChange={(v) => updateImage("signatureCups", v)} />
        </div>
      </section>

      {/* Philosophy Values */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">Philosophy Values</h2>
          <button onClick={addPhilosophyItem} className="text-sm text-muted-foreground hover:text-foreground">+ Add Image</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {images.philosophyValues.map((src, i) => (
            <GalleryImageSlot
              key={i}
              label={`Value ${i + 1}`}
              index={i}
              currentSrc={src}
              onChange={updatePhilosophyItem}
              onRemove={() => removePhilosophyItem(i)}
            />
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">Gallery</h2>
          <button onClick={addGalleryItem} className="text-sm text-muted-foreground hover:text-foreground">+ Add Image</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.gallery.map((src, i) => (
            <GalleryImageSlot
              key={i}
              label={`Gallery ${i + 1}`}
              index={i}
              currentSrc={src}
              onChange={updateGalleryItem}
              onRemove={() => removeGalleryItem(i)}
            />
          ))}
        </div>
      </section>

      {/* Visit */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">Visit Section</h2>
          <button onClick={addVisitItem} className="text-sm text-muted-foreground hover:text-foreground">+ Add Image</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {images.visit.map((src, i) => (
            <GalleryImageSlot
              key={i}
              label={`Visit ${i + 1}`}
              index={i}
              currentSrc={src}
              onChange={updateVisitItem}
              onRemove={() => removeVisitItem(i)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
