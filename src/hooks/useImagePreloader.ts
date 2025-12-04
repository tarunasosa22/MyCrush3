import { useState, useEffect } from 'react';
import { Image } from 'react-native';

export const useImagePreloader = (imageUrls: string[]) => {
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!imageUrls || imageUrls.length === 0) {
      setIsLoading(false);
      return;
    }

    const preloadPromises = imageUrls.map(url => {
      return new Promise(resolve => {
        if (!url) {
          resolve(url);
          return;
        }

        Image.prefetch(url)
          .then(() => {
            setLoadedImages(prev => new Set([...prev, url]));
            resolve(url);
          })
          .catch(() => {
            // Even if image fails, resolve to continue
            resolve(url);
          });
      });
    });

    Promise.all(preloadPromises).then(() => {
      setIsLoading(false);
    });
  }, [imageUrls]);

  return {
    loadedImages,
    isLoading,
    isImageLoaded: (url: string) => loadedImages.has(url),
  };
};
