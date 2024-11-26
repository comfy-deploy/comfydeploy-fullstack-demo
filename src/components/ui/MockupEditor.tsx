// src/components/ui/MockupEditor.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage, Group } from "react-konva";
import useImage from "use-image";

type GarmentType = "remera_clasica" | "remera_oversize" | "buzo";
type ViewType = "frente" | "dorso";

type MockupEditorProps = {
  garmentType: GarmentType;
  garmentColor: string;
  images: string[]; // URLs de las imágenes seleccionadas
  view: ViewType;
};

const MockupEditor: React.FC<MockupEditorProps> = ({
  garmentType,
  garmentColor,
  images,
  view,
}) => {
  const baseImagePath = `/images/garments/${garmentType}/${garmentColor}/${view}/base.png`;
  const shadowsImagePath = `/images/garments/${garmentType}/${garmentColor}/${view}/sombras.png`;

  const [garmentImage] = useImage(baseImagePath);
  const [shadowImage] = useImage(shadowsImagePath);

  const [draggableImages, setDraggableImages] = useState(
    images.map((url) => ({
      url,
      x: 100,
      y: 100,
      width: 200,
      height: 200,
    }))
  );

  // Crear un array de imágenes cargadas utilizando useImage
  const imagesLoaded = images.map((url) => useImage(url));

  const handleDragEnd = (index: number, e: any) => {
    const newImages = [...draggableImages];
    newImages[index] = {
      ...newImages[index],
      x: e.target.x(),
      y: e.target.y(),
    };
    setDraggableImages(newImages);
  };

  const handleTransformEnd = (index: number, e: any) => {
    const node = e.target;
    const newImages = [...draggableImages];
    newImages[index] = {
      ...newImages[index],
      x: node.x(),
      y: node.y(),
      width: node.width() * node.scaleX(),
      height: node.height() * node.scaleY(),
    };
    node.scaleX(1);
    node.scaleY(1);
    setDraggableImages(newImages);
  };

  // Definir las áreas de impresión
  const printAreas: {
    [key in GarmentType]: {
      [key in ViewType]: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    };
  } = {
    remera_clasica: {
      frente: {
        x: 50,
        y: 100,
        width: 400,
        height: 400,
      },
      dorso: {
        x: 50,
        y: 120,
        width: 400,
        height: 380,
      },
    },
    remera_oversize: {
      frente: {
        x: 60,
        y: 110,
        width: 380,
        height: 390,
      },
      dorso: {
        x: 60,
        y: 130,
        width: 380,
        height: 370,
      },
    },
    buzo: {
      frente: {
        x: 70,
        y: 120,
        width: 360,
        height: 380,
      },
      dorso: {
        x: 70,
        y: 140,
        width: 360,
        height: 360,
      },
    },
  };

  const printArea = printAreas[garmentType][view];

  return (
    <div className="mockup-editor">
      <Stage width={500} height={600}>
        <Layer>
          {/* Imagen base de la prenda */}
          {garmentImage && (
            <KonvaImage
              image={garmentImage}
              x={0}
              y={0}
              width={500}
              height={600}
            />
          )}

          {/* Área de impresión */}
          <Group
            clipX={printArea.x}
            clipY={printArea.y}
            clipWidth={printArea.width}
            clipHeight={printArea.height}
          >
            {draggableImages.map((img, index) => {
              const [image] = imagesLoaded[index];

              return (
                <KonvaImage
                  key={index}
                  image={image}
                  x={img.x}
                  y={img.y}
                  width={img.width}
                  height={img.height}
                  draggable
                  onDragEnd={(e) => handleDragEnd(index, e)}
                  onTransformEnd={(e) => handleTransformEnd(index, e)}
                />
              );
            })}
          </Group>

          {/* Capa de sombras */}
          {shadowImage && (
            <KonvaImage
              image={shadowImage}
              x={0}
              y={0}
              width={500}
              height={600}
              opacity={0.7} // Ajusta la opacidad según sea necesario
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default MockupEditor;
