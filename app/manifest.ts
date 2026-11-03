import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lending Ezy",
    short_name: "Lending Ezy",
    description: "Clear borrowing information and repayment planning.",
    start_url: "/",
    display: "browser",
    background_color: "#f7f6f1",
    theme_color: "#244e40",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }]
  };
}
