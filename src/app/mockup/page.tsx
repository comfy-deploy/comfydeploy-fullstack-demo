"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";
import { GarmentSelector } from "@/components/ui/GarmentSelector";
import { useSearchParams } from "next/navigation";

// Importación dinámica de MockupEditor, deshabilitando SSR
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

  const [garmentType, setGarmentType] = useState<"remera_clasica" | "remera_oversize" | "buzo">("remera_clasica");
  const [garmentColor, setGarmentColor] = useState("blanco");
  const [view, setView] = useState<"frente" | "dorso">("frente");

  // Debugging: Logs para verificar los valores de las props
  useEffect(() => {
    console.log("Garment Type:", garmentType);
    console.log("Garment Color:", garmentColor);
    console.log("View:", view);
    console.log("Images:", images);
  }, [garmentType, garmentColor, view, images]);

  return (
    <div className="mockup-page">
      {/* Selector para cambiar el tipo y color de prenda */}
      <GarmentSelector
        garmentType={garmentType}
        setGarmentType={setGarmentType}
        garmentColor={garmentColor}
        setGarmentColor={setGarmentColor}
      />

      {/* Botones para cambiar la vista (frente/dorso) */}
      <div className="view-selector">
        <button
          onClick={() => setView("frente")}
          className={view === "frente" ? "active" : ""}
        >
          Frente
        </button>
        <button
          onClick={() => setView("dorso")}
          className={view === "dorso" ? "active" : ""}
        >
          Dorso
        </button>
      </div>

      {/* Editor de mockups */}
      {images.length > 0 ? (
        <MockupEditor
          garmentType={garmentType}
          garmentColor={garmentColor}
          images={images}
          view={view}
        />
      ) : (
        <p>No hay imágenes disponibles para mostrar.</p>
      )}
    </div>
  );
}
