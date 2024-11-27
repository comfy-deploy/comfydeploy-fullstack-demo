"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";
import { GarmentSelector } from "@/components/ui/GarmentSelector";
import { useSearchParams } from "next/navigation";

// Importación dinámica de MockupEditor
const MockupEditor = dynamic(() => import("@/components/ui/MockupEditor"), {
  ssr: false,
});

export default function MockupPage() {
  const searchParams = useSearchParams();
  const imagesParam = searchParams.get("images");

  // Decodificar la URL para evitar problemas de caracteres codificados
  const images = imagesParam
    ? imagesParam.split(",").map((url) => decodeURIComponent(url))
    : [];

  const [garmentType, setGarmentType] = useState<
    "remera_clasica" | "remera_oversize" | "buzo"
  >("remera_clasica");
  const [garmentColor, setGarmentColor] = useState("blanco");
  const [view, setView] = useState<"frente" | "dorso">("frente");

  // Agregamos mensajes de consola para depuración
  useEffect(() => {
    console.log("Mockup Page Loaded");
    console.log("Images:", images);
    console.log("Garment Type:", garmentType);
    console.log("Garment Color:", garmentColor);
    console.log("View:", view);
  }, [garmentType, garmentColor, view, images]);

  // Mostrar un mensaje si no hay imágenes
  if (!images || images.length === 0) {
    return (
      <div className="mockup-page">
        <p>No se encontraron imágenes para cargar. Por favor, inténtalo de nuevo.</p>
      </div>
    );
  }

  return (
    <div className="mockup-page">
      <GarmentSelector
        garmentType={garmentType}
        setGarmentType={setGarmentType}
        garmentColor={garmentColor}
        setGarmentColor={setGarmentColor}
      />
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
      <MockupEditor
        garmentType={garmentType}
        garmentColor={garmentColor}
        images={images}
        view={view}
      />
    </div>
  );
}
