import { createFileRoute } from "@tanstack/react-router";
import FarmaTodoApp from "@/features/App";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Promotion Intelligence Studio | FarmaTodo" },
      { name: "description", content: "Executive campaign planning, causal measurement, and promotion governance for FarmaTodo." },
      { property: "og:title", content: "Promotion Intelligence Studio | FarmaTodo" },
      { property: "og:description", content: "Executive campaign planning, causal measurement, and promotion governance for FarmaTodo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FarmaTodoApp,
});