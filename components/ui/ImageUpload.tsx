"use client";

import { useRef, useState } from "react";
import { Label } from "./Label";

interface ImageUploadProps {
  label: string;
  hint?: string;
  folder: string;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
  error?: string;
  aspectRatio?: "square" | "wide" | "tall";
}

const aspectClasses = {
  square: "h-40",
  wide:   "h-32",
  tall:   "h-48",
};

export function ImageUpload({
  label,
  hint,
  folder,
  value,
  onChange,
  required,
  error,
  aspectRatio = "wide",
}: ImageUploadProps) {
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("الصورة أكبر من 5 ميغابايت");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setUploadError("يُرجى اختيار صورة فقط");
      return;
    }
    setUploadError("");
    setUploading(true);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: base64, folder }),
        });
        const data = await res.json();
        if (!res.ok) {
          setUploadError(data.error ?? "فشل رفع الصورة");
          return;
        }
        onChange(data.url);
        setPreview(base64);
      } catch {
        setUploadError("حدث خطأ أثناء الرفع، حاول مرة أخرى");
      } finally {
        setUploading(false);
      }
    };
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  function clear() {
    onChange("");
    setPreview("");
    setUploadError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  const displaySrc = preview || value;
  const hasError = error || uploadError;
  const h = aspectClasses[aspectRatio];

  return (
    <div className="flex flex-col gap-1.5">
      <Label required={required}>{label}</Label>
      {hint && <p className="text-xs text-muted-fg -mt-0.5">{hint}</p>}

      {displaySrc ? (
        /* معاينة الصورة */
        <div className={`relative ${h} w-full rounded-2xl overflow-hidden border border-border`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displaySrc}
            alt={label}
            className="w-full h-full object-cover"
          />
          {/* overlay فاتح عند hover */}
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="bg-white/90 text-foreground text-xs font-medium rounded-xl px-3 py-1.5 shadow"
            >
              تغيير الصورة
            </button>
          </div>
          {/* زر الحذف */}
          <button
            type="button"
            onClick={clear}
            className="absolute top-2 inset-e-2 h-7 w-7 rounded-full bg-urgent text-white flex items-center justify-center text-sm shadow-md hover:bg-red-700 transition-colors"
            aria-label="حذف الصورة"
          >
            ×
          </button>
        </div>
      ) : (
        /* منطقة الرفع */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          disabled={uploading}
          className={[
            `${h} w-full rounded-2xl border-2 border-dashed transition-all duration-150`,
            "flex flex-col items-center justify-center gap-2 text-sm",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            dragging
              ? "border-primary bg-primary-soft text-primary"
              : hasError
              ? "border-urgent bg-urgent-soft text-urgent"
              : "border-border text-muted-fg hover:border-primary hover:bg-primary-soft hover:text-primary",
          ].join(" ")}
        >
          {uploading ? (
            <>
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span className="text-xs">جاري الرفع...</span>
            </>
          ) : (
            <>
              <span className="text-3xl">{dragging ? "⬇️" : "📷"}</span>
              <span className="font-medium">
                {dragging ? "أفلت الصورة هنا" : "اضغط لاختيار صورة"}
              </span>
              <span className="text-xs opacity-70">
                أو اسحب وأفلت · JPG, PNG, WEBP · حد أقصى 5 ميغابايت
              </span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileInput}
      />

      {(uploadError || error) && (
        <p className="text-xs text-urgent mt-0.5">{uploadError || error}</p>
      )}
    </div>
  );
}
