// src/hooks/useImages.ts
import { useEffect, useState } from 'react';
import useImage from 'use-image';

export function useImages(urls: string[]) {
  const [images, setImages] = useState<(HTMLImageElement | undefined)[]>([]);

  useEffect(() => {
    let isMounted = true;

    Promise.all(urls.map((url) => {
      const [image] = useImage(url);
      return image;
    })).then((loadedImages) => {
      if (isMounted) {
        setImages(loadedImages);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [urls]);

  return images;
}
