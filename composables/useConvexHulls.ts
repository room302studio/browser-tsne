import { ref, watchEffect } from 'vue';
import * as turf from '@turf/turf';

export const useConvexHulls = (clusters) => {
  const convexHulls = ref([]);
  const clusterNumber = ref(5)

  watchEffect(() => {
    convexHulls.value = clusters.value.map(cluster => {
      // console.log('cluster:', cluster);
      const points = turf.featureCollection(cluster.map(pt => turf.point(pt)));
      const convexHull = turf.convex(points);
      return convexHull;      
    });
  });

  return { convexHulls };
};