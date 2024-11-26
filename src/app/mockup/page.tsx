"use client";

import React, { useState } from "react";
import { MockupEditor } from "@/components/ui/MockupEditor";
import { GarmentSelector } from "@/components/ui/GarmentSelector";
import { useSearchParams } from "next/navigation";

export default function MockupPage() {
  const searchParams = useSearchParams();
  const imagesParam = searchParams.get("images");
  const images = imagesParam ? imagesParam.split(",") : [];

  const [garmentType, setGarmentType] = useState<"remera_clasica" | "remera_oversize" | "buzo">("remera_clasica");
  const [garmentColor, setGarmentColor] = useState("blanco");

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
      />
    </div>
  );
}
