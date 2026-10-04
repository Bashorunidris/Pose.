import type { NextConfig } from "next";
import { dirname } from "path";
import { fileURLToPath } from "url";

const nextConfig: NextConfig = {
  // Without this, Turbopack walks above web/ and picks up a stray lockfile in
  // the home directory, warning that it is outside this git repository.
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
};

export default nextConfig;
