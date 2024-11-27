"use client";

import dynamic from "next/dynamic";

const KonvaTest = dynamic(() => import("./KonvaTest"));

export default function MockupPage() {
  return (
    <div>
      <h1>Mockup Page</h1>
      <KonvaTest />
    </div>
  );
}
