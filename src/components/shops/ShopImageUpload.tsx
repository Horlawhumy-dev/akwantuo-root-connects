import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ShopImageUploadProps {
  /** Array of image URLs */
  images: string[];
  /** Called with updated array */
  onChange: (urls: string[]) => void;
  /** Storage folder prefix (e.g. user id) */
  folder: string;
  /** Max images allowed */
  max?: number;
  className?: string;
}

export function ShopImageUpload({ images, onChange, folder, max = 5, className }: ShopImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB per image.", variant: "destructive" });
      return;
    }
    if (images.length >= max) {
      toast({ title: "Limit reached", description: `Max ${max} images.`, variant: "destructive" });
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage.from("shop-images").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("shop-images").getPublicUrl(path);
    onChange([...images, urlData.publicUrl]);
    setUploading(false);
  };

  const handleFiles = async (files: FileList) => {
    for (let i = 0; i < files.length && images.length + i < max; i++) {
      await upload(files[i]);
    }
  };

  const removeImage = async (index: number) => {
    const url = images[index];
    if (url.includes("shop-images/")) {
      const path = url.split("shop-images/")[1];
      await supabase.storage.from("shop-images").remove([path]);
    }
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Thumbnails */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((url, i) => (
            <div key={i} className="relative group rounded-lg overflow-hidden border border-border bg-muted aspect-square">
              <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 text-[9px] bg-background/80 text-foreground px-1.5 py-0.5 rounded">Cover</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {images.length < max && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => !uploading && inputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
            dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50",
            uploading && "pointer-events-none opacity-60"
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-1.5">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm font-medium">Click or drag to upload</p>
              <p className="text-xs text-muted-foreground">JPG, PNG, WebP · Max 5MB · {images.length}/{max}</p>
            </div>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
    </div>
  );
}

/** Single-image upload for products */
interface ProductImageUploadProps {
  image: string | null;
  onChange: (url: string | null) => void;
  folder: string;
}

export function ProductImageUpload({ image, onChange, folder }: ProductImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      toast({ title: "Invalid", description: "Image under 5MB required.", variant: "destructive" });
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${folder}/products/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("shop-images").upload(path, file);
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); setUploading(false); return; }
    const { data } = supabase.storage.from("shop-images").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  };

  const remove = async () => {
    if (image?.includes("shop-images/")) {
      const path = image.split("shop-images/")[1];
      await supabase.storage.from("shop-images").remove([path]);
    }
    onChange(null);
  };

  return (
    <div>
      {image ? (
        <div className="relative group rounded-lg overflow-hidden border border-border bg-muted h-20 w-20">
          <img src={image} alt="Product" className="w-full h-full object-cover" />
          <button type="button" onClick={remove} className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => !uploading && inputRef.current?.click()}
          className="h-20 w-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 transition-colors"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          <span className="text-[9px]">Photo</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
    </div>
  );
}
