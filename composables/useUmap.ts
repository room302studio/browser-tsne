// composables/useUmap.js

import { UMAP } from 'umap-js';
import { ref, onMounted, watch } from 'vue';
import { useRafFn } from '@vueuse/core';

export const useUmap = (inputData, options = {}) => {
  const embeddingPositions = ref([]);
  const defaultOptions = {
    nComponents: 2,
    nEpochs: 400,
    minDist: 0.1,
    nNeighbors: 15,
    ...options
  };

  const umap = new UMAP(defaultOptions);

  const updateEmbeddingPositions = () => {
    const inputDataAsArray = inputData.value.map(item => item.embedding);
    const nEpochs = umap.initializeFit(inputDataAsArray);

    const stepFunction = () => {
      umap.step();
      const embedding = umap.getEmbedding();
      embeddingPositions.value = embedding;
    };

    for (let i = 0; i < nEpochs * 0.5; i++) {
      stepFunction();
    }

    const { pause, resume } = useRafFn(stepFunction);

    // Optionally return pause and resume functions to control the UMAP process
    return { pause, resume };
  };

  onMounted(() => {
    updateEmbeddingPositions();
  });

  watch(inputData, () => {
    updateEmbeddingPositions();
  });

  watch(options, () => {
    updateEmbeddingPositions();
  }, { deep: true });

  return { embeddingPositions };
};
