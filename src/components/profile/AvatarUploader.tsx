// src/components/profile/AvatarUploader.tsx
"use client";
import React, { useRef, useState } from "react";
import { Camera } from "lucide-react";

type Props = { currentAvatar?: string; onUploaded?: (url: string) => void };

export default function AvatarUploader({ currentAvatar, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [uploading, setUploading] = useState(false);

  const trigger = () => inputRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // preview
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = String(reader.result);
      setPreview(base64);
      setUploading(true);
      try {
        // send base64 to API
        const res = await fetch("/api/user/profile", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ avatarBase64: base64 }),
        });
        const data = await res.json();
        if (res.ok && data.ok && data.avatarUrl) {
          setPreview(data.avatarUrl);
          onUploaded?.(data.avatarUrl);
        } else {
          console.error("upload error", data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative">
      <div className="w-36 h-36 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-700 overflow-hidden border border-zinc-700 shadow-xl">
        {preview ? (
          <img src={preview} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-400">
            <span className="text-sm">بدون صورة</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        <button onClick={trigger} className="px-3 py-1 bg-white/6 hover:bg-white/8 rounded-md flex items-center gap-2">
          <Camera size={14} />
          {uploading ? "جارٍ الرفع..." : "تغيير الصورة"}
        </button>
      </div>

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}
