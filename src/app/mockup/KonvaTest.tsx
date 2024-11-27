"use client";

import React from "react";
import { Stage, Layer, Rect } from "react-konva";

export default function KonvaTest() {
  return (
    <Stage width={500} height={500}>
      <Layer>
        <Rect x={50} y={50} width={100} height={100} fill="blue" />
      </Layer>
    </Stage>
  );
}
