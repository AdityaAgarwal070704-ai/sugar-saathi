import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sugar Saathi",
    short_name: "Sugar Saathi",
    description: "Your daily companion for Indian food and glucose.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    background_color: "#fbf6ee",
    theme_color: "#1b4d3e",
    icons: [
      { src: "/pwa-icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
