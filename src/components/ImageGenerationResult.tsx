// src/components/ui/ImageGenerationResult.tsx
"use client";

import { useRouter } from "next/navigation";
import { LoadingIcon } from "@/components/LoadingIcon";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useComfyQuery } from "@/hooks/hooks";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import Image from "next/image"; // Importamos Image

export function ImageGenerationResult({
  runId,
  className,
}: { runId: string } & React.ComponentProps<"div">) {
  const [image, setImage] = useState("");
  const [status, setStatus] = useState<string>("preparing");
  const [progress, setProgress] = useState<number | undefined>();
  const [liveStatus, setLiveStatus] = useState<string | null>();
  const [loading, setLoading] = useState(true);

  const { data, isLoading } = useComfyQuery(
    "run",
    "get",
    [
      {
        runId: runId,
      },
    ],
    {
      refetchInterval: 2000,
    }
  );

  const router = useRouter();

  useEffect(() => {
    const res = data;
    if (res) {
      setStatus(res.status);
      setProgress(res.progress);
      setLiveStatus(res.liveStatus ?? null);
    }
    if (res && res.status === "success") {
      setImage(
        typeof res.outputs?.[0]?.data?.images?.[0] === "object" &&
          "url" in res.outputs?.[0]?.data?.images?.[0]
          ? res.outputs[0].data.images[0].url
          : ""
      );
      setLoading(false);
    }
  }, [data]);

  const handleImageClick = () => {
    if (image) {
      router.push(`/mockup?images=${encodeURIComponent(image)}`);
    }
  };

  return (
    <div
      className={cn(
        "border border-gray-200 w-full aspect-[512/512] relative",
        className
      )}
    >
      {!loading && image && (
        <div className="w-full h-full relative cursor-pointer" onClick={handleImageClick}>
          <Image
            src={image}
            alt="Generated image"
            layout="responsive"
            width={512} // Ajusta el ancho según tus necesidades
            height={512} // Ajusta la altura según tus necesidades
            className="w-full h-full object-cover"
          />
        </div>
      )}
      {!image && status && (
        <div className="absolute z-10 top-0 left-0 w-full h-full flex flex-col items-center justify-center gap-2 px-4">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            {status} <LoadingIcon />
          </div>
          {progress !== undefined && (
            <Progress value={progress * 100} className="h-[2px] w-full" />
          )}
          <span className="text-sm text-center text-gray-400">
            {liveStatus !== undefined && liveStatus}
          </span>
        </div>
      )}
      {loading && <Skeleton className="w-full h-full" />}
    </div>
  );
}
