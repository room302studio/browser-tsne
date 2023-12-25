import { ref, watchEffect } from 'vue';
import * as turf from '@turf/turf';

export const useConvexHulls = (clusters) => {
  const convexHulls = ref([]);

  watchEffect(() => {
    convexHulls.value = clusters.value.map(cluster => {
      const points = turf.featureCollection(cluster.map(pt => turf.point(pt)));
      return turf.convex(points);
    });
  });

  return { convexHulls };
};