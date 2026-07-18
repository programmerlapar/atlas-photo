import type { Photo } from '../../shared/types/photo';

export interface Cluster {
  center: { latitude: number; longitude: number };
  photos: Photo[];
  count: number;
}

/**
 * Simple location clustering algorithm
 * Groups photos that are within a specified distance of each other
 */
export const clusterPhotos = (
  photos: Photo[],
  maxDistance: number = 0.01
): Cluster[] => {
  const photosWithLocation = photos.filter(
    (photo) => photo.metadata?.location !== undefined
  );

  if (photosWithLocation.length === 0) return [];

  const clusters: Cluster[] = [];
  const processed = new Set<string>();

  photosWithLocation.forEach((photo) => {
    if (processed.has(photo.id)) return;

    const location = photo.metadata!.location!;
    const cluster: Cluster = {
      center: { latitude: location.latitude, longitude: location.longitude },
      photos: [photo],
      count: 1,
    };

    processed.add(photo.id);

    // Find nearby photos
    photosWithLocation.forEach((otherPhoto) => {
      if (processed.has(otherPhoto.id)) return;

      const otherLocation = otherPhoto.metadata!.location!;
      const distance = Math.sqrt(
        Math.pow(location.latitude - otherLocation.latitude, 2) +
          Math.pow(location.longitude - otherLocation.longitude, 2)
      );

      if (distance <= maxDistance) {
        cluster.photos.push(otherPhoto);
        cluster.count++;
        processed.add(otherPhoto.id);
      }
    });

    // Calculate cluster center
    if (cluster.photos.length > 1) {
      cluster.center = {
        latitude:
          cluster.photos.reduce(
            (sum, p) => sum + p.metadata!.location!.latitude,
            0
          ) / cluster.photos.length,
        longitude:
          cluster.photos.reduce(
            (sum, p) => sum + p.metadata!.location!.longitude,
            0
          ) / cluster.photos.length,
      };
    }

    clusters.push(cluster);
  });

  return clusters;
};
