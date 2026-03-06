"use client";

import { useMemo, useRef, useState } from "react";

type CloudinaryUploadFieldProps = {
  name: string;
  label: string;
  defaultValue?: string;
  resourceType: "image" | "video";
  folder: string;
  helpText?: string;
};

export function CloudinaryUploadField({
  name,
  label,
  defaultValue = "",
  resourceType,
  folder,
  helpText
}: CloudinaryUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const accept = useMemo(() => {
    return resourceType === "video" ? "video/*" : "image/*";
  }, [resourceType]);

  async function upload(file: File) {
    setBusy(true);
    setErr(null);
    try {
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ folder, resourceType })
      });
      if (!signRes.ok) throw new Error("Not allowed to upload (admin only)");
      const sign = (await signRes.json()) as {
        cloudName: string;
        apiKey: string;
        timestamp: number;
        signature: string;
        folder: string;
        resourceType: "image" | "video";
      };

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", sign.apiKey);
      form.append("timestamp", String(sign.timestamp));
      form.append("signature", sign.signature);
      form.append("folder", sign.folder);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${sign.cloudName}/${sign.resourceType}/upload`;
      const upRes = await fetch(uploadUrl, { method: "POST", body: form });
      const upJson = (await upRes.json()) as { secure_url?: string; error?: { message?: string } };
      if (!upRes.ok) throw new Error(upJson.error?.message ?? "Upload failed");
      if (!upJson.secure_url) throw new Error("No URL returned from Cloudinary");

      if (inputRef.current) inputRef.current.value = upJson.secure_url;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <label className="block text-sm font-medium" htmlFor={name}>
            {label}
          </label>
          {helpText ? <p className="mt-1 text-xs text-neutral-500">{helpText}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
            }}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="inline-flex h-11 items-center rounded-md border border-neutral-200 px-3 py-2 text-sm font-medium disabled:opacity-50"
          >
            {busy ? "Uploading…" : `Upload ${resourceType}`}
          </button>
        </div>
      </div>

      <input
        ref={inputRef}
        id={name}
        name={name}
        defaultValue={defaultValue}
        placeholder="https://..."
        className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
      />

      {err ? (
        <p className="text-sm text-orange-700">
          {err}
        </p>
      ) : null}
    </div>
  );
}

