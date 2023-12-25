// useClustering.js
import { ref } from 'vue';
import { point, featureCollection, clustersKmeans } from '@turf/turf';

export function useClustering() {
  const clusterMap = ref(new Map());
  const numberOfClusters = ref(5);

  function performClustering(data) {
    if (!data || !data.length) return;

    const points = data.map((embedding, index) => point(embedding, { id: index }));
    const featureCol = featureCollection(points);
    const kmeanClusters = clustersKmeans(featureCol, { numberOfClusters: numberOfClusters.value });

    kmeanClusters.features.forEach(feature => {
      clusterMap.value.set(feature.properties.id, feature.properties.cluster);
    });
  }

  function updateNumberOfClusters(value) {
    numberOfClusters.value = value;
    performClustering();
  }

  return { clusterMap, numberOfClusters, performClustering, updateNumberOfClusters };
}
