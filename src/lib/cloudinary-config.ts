function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

export function getCloudinaryConfig() {
  const raw = requireEnv("CLOUDINARY_URL");
  const url = new URL(raw);
  const cloudName = url.hostname;
  const apiKey = decodeURIComponent(url.username);
  const apiSecret = decodeURIComponent(url.password);

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Invalid CLOUDINARY_URL");
  }

  return { cloudName, apiKey, apiSecret };
}

