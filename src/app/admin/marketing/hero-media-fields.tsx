"use client";

import { useState } from "react";
import { CloudinaryUploadField } from "@/components/cloudinary-upload-field";

export function HeroMediaFields({
  defaultMediaType,
  defaultMediaUrl
}: {
  defaultMediaType: "VIDEO" | "IMAGE";
  defaultMediaUrl: string;
}) {
  const [mediaType, setMediaType] = useState<"VIDEO" | "IMAGE">(defaultMediaType);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <select
        name="heroMediaType"
        value={mediaType}
        onChange={(e) => setMediaType(e.target.value === "IMAGE" ? "IMAGE" : "VIDEO")}
        className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
      >
        <option value="VIDEO">VIDEO</option>
        <option value="IMAGE">IMAGE</option>
      </select>
      <CloudinaryUploadField
        name="heroMediaUrl"
        label="Hero media URL"
        defaultValue={defaultMediaUrl}
        resourceType={mediaType === "IMAGE" ? "image" : "video"}
        folder="jammuserve/hero"
        helpText="Upload a hero media file to Cloudinary, or paste a URL."
      />
    </div>
  );
}

