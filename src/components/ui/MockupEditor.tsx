// src/components/ui/MockupEditor.tsx
"use client";

import React, { useState } from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import useImage from "use-image";

type MockupEditorProps = {
  garmentType: "remera_clasica" | "remera_oversize" | "buzo";
  garmentColor: string;
  images: string[]; // URLs de las imágenes seleccionadas
};

export function MockupEditor({ garmentType, garmentColor, images }: MockupEditorProps) {
  const [garmentImage] = useImage(`/images/garments/${garmentType}_${garmentColor}.png`);
  const [draggableImages, setDraggableImages] = useState(
    images.map((url) => ({
      url,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
    }))
  );

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

  return (
    <div className="mockup-editor">
      <Stage width={500} height={600}>
        <Layer>
          <KonvaImage image={garmentImage} x={0} y={0} width={500} height={600} />
          {draggableImages.map((img, index) => {
            const [image] = useImage(img.url);
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
        </Layer>
      </Stage>
    </div>
  );
}
