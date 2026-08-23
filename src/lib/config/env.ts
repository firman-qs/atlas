const apiUrl = process.env.ATLAS_API_URL;

if (!apiUrl) {
  throw new Error("ATLAS_API_URL environment variable is not configured.");
}

export const env = {
  apiUrl,
} as const;
