// useClustering.js
import { ref } from 'vue';
import { point, featureCollection, clustersKmeans } from '@turf/turf';

export function useClustering() {
  const clusterMap = ref(new Map());

  function performClustering(data, numberOfClusters = 5) {
    if (!data || !data.length) return;

    const points = data.map((embedding, index) => point(embedding, { id: index }));
    const featureCol = featureCollection(points);
    const kmeanClusters = clustersKmeans(featureCol, { numberOfClusters });

    kmeanClusters.features.forEach(feature => {
      clusterMap.value.set(feature.properties.id, feature.properties.cluster);
    });
  }

  return { clusterMap, performClustering };
}
