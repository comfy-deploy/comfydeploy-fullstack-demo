// src/app/mockup/page.tsx
"use client";

import dynamic from "next/dynamic";
import React, { useState } from "react";
import { GarmentSelector } from "@/components/ui/GarmentSelector";
import { useSearchParams } from "next/navigation";

const MockupEditor = dynamic(
  () => import("@/components/ui/MockupEditor"),
  { ssr: false }
) as React.ComponentType<{
  garmentType: "remera_clasica" | "remera_oversize" | "buzo";
  garmentColor: string;
  images: string[];
  view: "frente" | "dorso";
}>;

export default function MockupPage() {
  const searchParams = useSearchParams();
  const imagesParam = searchParams.get("images");
  const images = imagesParam ? imagesParam.split(",") : [];

  const [garmentType, setGarmentType] = useState<
    "remera_clasica" | "remera_oversize" | "buzo"
  >("remera_clasica");
  const [garmentColor, setGarmentColor] = useState("blanco");
  const [view, setView] = useState<"frente" | "dorso">("frente");

  return (
    <div className="mockup-page">
      <GarmentSelector
        garmentType={garmentType}
        setGarmentType={setGarmentType}
        garmentColor={garmentColor}
        setGarmentColor={setGarmentColor}
      />
      <MockupEditor
        garmentType={garmentType}
        garmentColor={garmentColor}
        images={images}
        view={view}
      />
    </div>
  );
}
