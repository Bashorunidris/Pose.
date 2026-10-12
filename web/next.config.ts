import type { NextConfig } from "next";
import { dirname } from "path";
import { fileURLToPath } from "url";

const nextConfig: NextConfig = {
  // Without this, Turbopack walks above web/ and picks up a stray lockfile in
  // the home directory, warning that it is outside this git repository.
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
  // `next dev` otherwise rewrites AGENTS.md/CLAUDE.md on every run, which keeps
  // showing up as uncommitted noise.
  agentRules: false,
  // The dev-tools badge floats over the bottom-left nav button in development,
  // which reads as a UI bug in every screenshot of the ported shell.
  devIndicators: false,
};

export default nextConfig;
