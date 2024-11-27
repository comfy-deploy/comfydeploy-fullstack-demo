// src/components/ui/MockupEditor.tsx
"use client";

import React, { useState } from "react";
import { Stage, Layer, Image as KonvaImage, Group, Text } from "react-konva";
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
  console.log("MockupEditor Props:", {
    garmentType,
    garmentColor,
    images,
    view,
  });

  const baseImagePath = `/images/garments/${garmentType}/${garmentColor}/${view}/base.png`;
  const shadowsImagePath = `/images/garments/${garmentType}/${garmentColor}/${view}/sombras.png`;

  console.log("Base Image Path:", baseImagePath);
  console.log("Shadows Image Path:", shadowsImagePath);

  const [garmentImage] = useImage(baseImagePath, "anonymous");
  const [shadowImage] = useImage(shadowsImagePath, "anonymous");

  console.log("Garment Image Loaded:", garmentImage);
  console.log("Shadow Image Loaded:", shadowImage);

  const [draggableImages, setDraggableImages] = useState(
    images.map((url) => ({
      url,
      x: 100,
      y: 100,
      width: 200,
      height: 200,
    }))
  );

  console.log("Initial Draggable Images State:", draggableImages);

  const handleDragEnd = (index: number, e: any) => {
    console.log(`handleDragEnd called for index: ${index}`, e);
    const newImages = [...draggableImages];
    newImages[index] = {
      ...newImages[index],
      x: e.target.x(),
      y: e.target.y(),
    };
    console.log("Updated Image Position:", newImages[index]);
    setDraggableImages(newImages);
  };

  const handleTransformEnd = (index: number, e: any) => {
    console.log(`handleTransformEnd called for index: ${index}`, e);
    const node = e.target;
    const newImages = [...draggableImages];
    newImages[index] = {
      ...newImages[index],
      x: node.x(),
      y: node.y(),
      width: node.width() * node.scaleX(),
      height: node.height() * node.scaleY(),
    };
    console.log("Updated Image Transform:", newImages[index]);
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

  console.log("Print Areas:", printAreas);

  const printArea = printAreas[garmentType][view];

  console.log("Selected Print Area:", printArea);

  return (
    <div className="mockup-editor">
      <Stage width={500} height={600}>
        <Layer>
          {/* Imagen base de la prenda */}
          {garmentImage ? (
            <KonvaImage
              image={garmentImage}
              x={0}
              y={0}
              width={500}
              height={600}
            />
          ) : (
            <Text text="Loading garment image..." />
          )}

          {/* Área de impresión */}
          <Group
            clipX={printArea.x}
            clipY={printArea.y}
            clipWidth={printArea.width}
            clipHeight={printArea.height}
          >
            {draggableImages.map((img, index) => {
              console.log(`Rendering draggable image at index ${index}:`, img);
              const [image] = useImage(img.url, "anonymous");
              console.log(`Image loaded for index ${index}:`, image);

              if (!image) {
                console.log(`Image not loaded yet for index ${index}`);
                return null;
              }

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
          {shadowImage ? (
            <KonvaImage
              image={shadowImage}
              x={0}
              y={0}
              width={500}
              height={600}
              opacity={0.7} // Ajusta la opacidad según sea necesario
            />
          ) : (
            <Text text="Loading shadow image..." />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default MockupEditor;
