// src/components/UserRuns.tsx
"use client";

import useSWR from "swr";
import { getUserRuns } from "@/server/getUserRuns";
import React from "react";
import { ImageGenerationResult } from "./ImageGenerationResult";
import { Sparkle } from "lucide-react";
import { useRouter } from "next/navigation"; // Importamos useRouter
import Image from "next/image"; // Importamos Image (opcional)

export function UserRuns() {
  const { data: userRuns, isValidating } = useSWR("userRuns", getUserRuns, {
    refreshInterval: 5000,
  });

  const router = useRouter(); // Inicializamos useRouter

  if (userRuns && userRuns.length > 0) {
    return (
      <div className="max-w-[800px] w-full grid grid-cols-2 md:gap-4 pb-32">
        {userRuns.map((run) => (
          <div
            className="md:rounded-sm overflow-hidden relative group"
            key={run.run_id}
          >
            {!run.image_url && <ImageGenerationResult runId={run.run_id} />}
            {run.image_url && (
              <img
                src={run.image_url}
                alt="Run"
                className="cursor-pointer"
                onClick={() => {
                  router.push(
                    `/mockup?images=${encodeURIComponent(run.image_url!)}`
                  );
                }}
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="text-sm flex w-full h-[calc(100vh-45px-50px)] justify-center items-center text-gray-400 gap-2">
      Start generating some images! <Sparkle size={16} />
    </div>
  );
}
