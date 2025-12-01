const ensureEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required but was not provided.`);
  }
  return value;
};

export const publicEnv = {
  NEXT_PUBLIC_WOREDA_ID: process.env.NEXT_PUBLIC_WOREDA_ID ?? "woreda-9",
  NEXT_PUBLIC_WOREDA_NAME: process.env.NEXT_PUBLIC_WOREDA_NAME ?? "Woreda 9 Administration",
  NEXT_PUBLIC_WOREDA_LOGO_PATH:
    process.env.NEXT_PUBLIC_WOREDA_LOGO_PATH ?? "/assets/branding/logo.svg",
  NEXT_PUBLIC_WOREDA_IMAGES_PREFIX:
    process.env.NEXT_PUBLIC_WOREDA_IMAGES_PREFIX ?? "/assets",
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

export const requiredEnv = {
  SUPABASE_URL: () => ensureEnv("SUPABASE_URL"),
  SUPABASE_SERVICE_ROLE_KEY: () => ensureEnv("SUPABASE_SERVICE_ROLE_KEY"),
  CLOUDFLARE_R2_UPLOAD_URL: () => ensureEnv("CLOUDFLARE_R2_UPLOAD_URL"),
  CLOUDFLARE_R2_PUBLIC_URL: () => ensureEnv("CLOUDFLARE_R2_PUBLIC_URL"),
};


