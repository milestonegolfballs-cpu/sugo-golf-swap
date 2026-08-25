import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function PhotoUploader({
  userId,
  value,
  onChange,
  max = 8,
}: {
  userId: string;
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const remaining = max - value.length;
    const list = Array.from(files).slice(0, remaining);
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of list) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${userId}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from("listing-photos")
          .upload(path, file, { upsert: false });
        if (error) throw error;
        const { data } = supabase.storage.from("listing-photos").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      onChange([...value, ...uploaded]);
    } catch (e) {
      console.error(e);
      toast.error("사진 업로드에 실패했어요");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {value.map((url, i) => (
        <div
          key={url}
          className="relative aspect-square overflow-hidden rounded-lg bg-surface"
        >
          <img src={url} alt={`사진 ${i + 1}`} className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(value.filter((u) => u !== url))}
            className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white"
            aria-label="사진 삭제"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      {value.length < max && (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-muted-foreground disabled:opacity-60"
        >
          <ImagePlus className="h-5 w-5" />
          <span className="text-[11px]">
            {uploading ? "업로드중" : `${value.length}/${max}`}
          </span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
