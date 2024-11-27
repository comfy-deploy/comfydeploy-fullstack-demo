"use client";

import React from "react";

type GarmentSelectorProps = {
  garmentType: "remera_clasica" | "remera_oversize" | "buzo";
  setGarmentType: (type: "remera_clasica" | "remera_oversize" | "buzo") => void;
  garmentColor: string;
  setGarmentColor: (color: string) => void;
};

export function GarmentSelector({
  garmentType,
  setGarmentType,
  garmentColor,
  setGarmentColor,
}: GarmentSelectorProps) {
  return (
    <div className="garment-selector">
      <div>
        <label>Tipo de prenda:</label>
        <select
          value={garmentType}
          onChange={(e) => setGarmentType(e.target.value as "remera_clasica" | "remera_oversize" | "buzo")}
        >
          <option value="remera_clasica">Remera Clásica</option>
          <option value="remera_oversize">Remera Oversize</option>
          <option value="buzo">Buzo</option>
        </select>
      </div>
      <div>
        <label>Color:</label>
        <select
          value={garmentColor}
          onChange={(e) => setGarmentColor(e.target.value)}
        >
          {/* Agrega las opciones de color según el tipo de prenda */}
          <option value="blanco">Blanco</option>
          <option value="negro">Negro</option>
          <option value="marron">Marrón</option>
        </select>
      </div>
    </div>
  );
}
