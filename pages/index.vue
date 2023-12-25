<template>
  <section>
    <USelect v-model="mappingMethod" :options="['tsne', 'umap']" />
    <svg :width="width" :height="height">
      <g v-for="(embedding, index) in embeddingsMappedTo2D" :transform="embeddingToScreenTransform(embedding)"
        class="embedding">
        <circle r="2.5" :fill="colorScale(clusterId(index))" />
        <text class="embedding-text" v-for="(line, lineIndex) in textToLines(embeddingIndexToData(index).text)"
          :y="lineIndex * 13.2" fill="white" font-size="13px">{{ line }}</text>
      </g>
    </svg>
  </section>
</template>

<script setup>
import { ref, shallowRef, watchEffect } from 'vue';
import { useWindowSize } from '@vueuse/core';
import * as d3 from 'd3';
import { textToLines } from '~/helpers';
import { useClustering } from '~/composables/useClustering';
import inputData from '~/assets/openAI_embeddings.json';

const mappingMethod = ref('umap');
const { width, height } = useWindowSize();
const inputDataRef = shallowRef(inputData);
const { embeddingPositions: tsnePositions } = useTsne(inputDataRef);
const { embeddingPositions: umapPositions } = useUmap(inputDataRef);
const { clusterMap, performClustering } = useClustering();

const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
const xScale = d3.scaleLinear().range([0, width.value]);
const yScale = d3.scaleLinear().range([0, height.value]);

const embeddingsMappedTo2D = shallowRef([]);

function embeddingIndexToData(index) {
  return inputData[index];
}

function embeddingToScreenTransform(embedding) {
  return `translate(${xScale(embedding[0])}, ${yScale(embedding[1])})`;
}

function updateScales(positions) {
  const xExtent = d3.extent(positions, d => d[0]);
  const yExtent = d3.extent(positions, d => d[1]);
  xScale.domain(xExtent);
  yScale.domain(yExtent);
}

function clusterId(index) {
  return clusterMap.value.get(index) || 0;
}

watchEffect(() => {
  embeddingsMappedTo2D.value = mappingMethod.value === 'tsne' ? tsnePositions.value : umapPositions.value;
  if (embeddingsMappedTo2D.value) {
    updateScales(embeddingsMappedTo2D.value);
    performClustering(embeddingsMappedTo2D.value);
  }
});
</script>

<style>
.embedding-text {
  opacity: 0;
  transition: all 0.2s ease-in-out;
}

.embedding:hover .embedding-text {
  opacity: 1;
}
</style>
