import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CashNeko - Expense Tracker",
    short_name: "CashNeko",
    description: "A simple and intuitive expense tracking app",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/PWA/PWAlogo192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/PWA/PWAlogo512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
