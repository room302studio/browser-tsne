// composables/useTsne.js

import * as tsnejs from 'tsne';
import { ref, onMounted, onUnmounted, watch, reactive } from 'vue';
import { useRafFn } from '@vueuse/core';

export const useTsne = (inputData) => {
  const embeddingPositions = ref([]);
  const steps = ref(0); // Ref to count the number of t-SNE steps

  // Define `options` as a reactive object where each property is reactive
  const options = reactive({
    epsilon: 10, // learning rate
    perplexity: 10, // number of neighbors
    dim: 2, // dimensionality of the embedding
  });

  // Create the t-SNE instance (can be reactive if needed)
  let tsne;

  const initTsne = () => {
    // Initialize t-SNE with the reactive `options`
    tsne = new tsnejs.tSNE(options);

    // Setup initial data for t-SNE computation
    const inputDataAsArray = inputData.value.map(item => item.embedding);
    tsne.initDataRaw(inputDataAsArray);
  };

  const updateTsne = () => {
    // Run a step of t-SNE
    tsne.step();
    // Update the positions after the step
    embeddingPositions.value = tsne.getSolution();
    steps.value++; // Increment the steps count
  };

  const { pause, resume } = useRafFn(updateTsne, { immediate: false });

  onMounted(initTsne);
  onMounted(resume);
  onUnmounted(pause);

  // Reactively apply new options when they change
  watch(options, () => {
    pause();      // Pause the computation while initializing
    initTsne();   // Reinitialize t-SNE with new options
    steps.value = 0; // Reset the steps count to 0
    resume();     // Resume computation with new settings
  }, { deep: true });

  // Function to restart from the beginning
  const restart = () => {
    pause();      // Pause the computation
    initTsne();   // Reinitialize t-SNE with current options
    steps.value = 0; // Reset the steps count to 0
    resume();     // Resume computation
  };

  // Returns the reactive states and functions to control the t-SNE computation
  return {
    embeddingPositions,
    options, // Expose `options` so they can be used to make sliders
    steps, // Expose `steps` ref
    pause,
    resume,
    restart // Expose `restart` function
  };
};