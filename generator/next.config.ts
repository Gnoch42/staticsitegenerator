import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sortie autonome : le Dockerfile ne copie que .next/standalone,
  // démarrage rapide (aligné sur le cycle Start/Stop de Coolify).
  output: "standalone",

  // better-sqlite3 et playwright sont des modules natifs / lourds :
  // on les garde externes au bundle serveur.
  serverExternalPackages: ["better-sqlite3", "playwright"],
};

export default nextConfig;
