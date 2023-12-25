// composables/useTsne.js

import * as tsnejs from 'tsne';
import { ref, onMounted, watch } from 'vue';
import { useRafFn } from '@vueuse/core';

export const useTsne = (inputData, options = {}) => {
  const embeddingPositions = ref([]);
  const defaultOptions = {
    epsilon: 10, // learning rate
    perplexity: 10, // number of neighbors
    dim: 2, // dimensionality of the embedding
    ...options
  };

  const tsne = new tsnejs.tSNE(defaultOptions);

  const updateTsne = () => {
    const inputDataAsArray = inputData.value.map(item => item.embedding);
    tsne.initDataRaw(inputDataAsArray);

    let tick = 0;
    const stepFunction = () => {
      tick++;
      tsne.step(); // Improve the solution with each step
      // Optionally add some random noise to the solution in the initial phase
      if (tick < 500) {
        embeddingPositions.value = tsne.getSolution().map(embedding => 
          embedding.map(value => value + (Math.random() * 0.33))
        );
      } else {
        embeddingPositions.value = tsne.getSolution();
      }
    };

    // Initialize with a few steps
    for (let i = 0; i < 300; i++) {
      stepFunction();
    }

    const { pause, resume } = useRafFn(stepFunction);

    // Optionally return pause and resume functions to control the t-SNE process
    return { embeddingPositions, pause, resume };
  };

  onMounted(() => {
    updateTsne();
  });

  watch(inputData, () => {
    updateTsne();
  });

  return { embeddingPositions };
};
