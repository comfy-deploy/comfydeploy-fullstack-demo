// src/hooks/useImages.ts
import { useMemo } from 'react';
import useImage from 'use-image';

export function useImages(urls: string[]) {
  // Utilizamos useMemo para memorizar el resultado y evitar llamadas innecesarias
  const images = useMemo(() => {
    // Creamos un array donde cada posición es el resultado de useImage
    return urls.map((url) => useImage(url));
  }, [urls]);

  return images; // Retornamos el array de [image, status] por cada URL
}
