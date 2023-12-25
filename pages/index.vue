<template>
  <section>

    <USelect v-model="mappingMethod" :options="['tsne', 'umap']" />
    <svg :width="width" :height="height">
      <!-- <circle v-for="embedding in embeddingsMappedTo2D" :cx="embedding[0]" :cy="embedding[1]" r="1" fill="red" /> -->

      <g v-for="(embedding, index) in embeddingsMappedTo2D" :transform="embeddingToScreenTransform(embedding)"
        class="embedding">
        <circle r="2.5" fill="red" />
        <text class="embedding-text" v-for="(line, lineIndex) in textToLines(embeddingIndexToData(index).text)"
          :y="lineIndex * 13.2" fill="white" font-size="13px">{{ line }}</text>
      </g>

    </svg>
  </section>
</template>

<script setup>
import { clustersKmeans, point, featureCollection } from '@turf/turf'
import { textToLines } from '~/helpers'
// import * as tsnejs from 'tsne'
// import { UMAP } from 'umap-js';
import * as d3 from 'd3'

import { useTsne } from '~/composables/useTsne';
import { useUmap } from '~/composables/useUmap';

const mappingMethod = ref('umap'); // Default to 'umap', can be switched to 'tsne'





const { width, height } = useWindowSize()



function embeddingIndexToData(index) {
  return inputData[index]
}

import inputData from '~/assets/openAI_embeddings.json'

const inputDataRef = shallowRef(inputData)

const { embeddingPositions: tsnePositions } = useTsne(inputDataRef);

const { embeddingPositions: umapPositions } = useUmap(inputDataRef);

/*
inputData is an array filled with objects that look like this:

  "id": 0,
  "group": 0,
  "text": "How to Paint Water in Watercolor - A Step-by-Step Tutorial",
  "embedding": []
*/

// we need to convert it to an array of arrays and keep track of the index
// const inputDataAsArray = inputData.value.map((item) => {
//   return item.embedding
// })

const inputDataAsArray = ref([])
watchEffect(() => {
  if (!inputDataRef.value) return
  inputDataAsArray.value = inputDataRef.value.map((item) => {
    return item.embedding
  })
})


// we need a d3 linear scale to map the data to the screen
const xScale = d3.scaleLinear()
  .range([0, width.value])

const yScale = d3.scaleLinear()
  .range([0, height.value])

function embeddingToScreenTransform(embedding) {
  const x = xScale(embedding[0])
  const y = yScale(embedding[1])

  return `translate(${x}, ${y})`
}

const embeddingsMappedTo2D = shallowRef([])

// make a computed that turns the embeddings into a GeoJSON FeatureCollection of points using turf
const embeddingsAsFeatureCollection = ref(null)

watchEffect(() => {
  if (tsnePositions && mappingMethod.value === 'tsne') {
    // Update scales based on new t-SNE data
    const xExtent = d3.extent(tsnePositions?.value, d => d[0]);
    const yExtent = d3.extent(tsnePositions?.value, d => d[1]);
    xScale.domain(xExtent);
    yScale.domain(yExtent);
  }

  if (umapPositions && mappingMethod.value === 'umap') {
    // Update scales based on new UMAP data
    const xExtent = d3.extent(umapPositions?.value, d => d[0]);
    const yExtent = d3.extent(umapPositions?.value, d => d[1]);
    xScale.domain(xExtent);
    yScale.domain(yExtent);
  }
});

watchEffect(() => {
  if (mappingMethod.value === 'tsne') {
    embeddingsMappedTo2D.value = tsnePositions?.value
  }

  if (mappingMethod.value === 'umap') {
    embeddingsMappedTo2D.value = umapPositions?.value
  }
})


watchEffect(() => {
  if (!embeddingsMappedTo2D.value) return
  if (!embeddingsMappedTo2D.value.length) return
  console.log('calculating feature collection', embeddingsMappedTo2D.value)
  const points = embeddingsMappedTo2D.value.map((embedding, index) => {
    return point(embedding, { id: index })
  })
  embeddingsAsFeatureCollection.value = featureCollection(points)
})

const clusters = ref([])

watchEffect(() => {
  if (!embeddingsAsFeatureCollection.value) return
  console.log('calculating clusters', embeddingsAsFeatureCollection.value)
  const kmeanClusters = clustersKmeans(embeddingsAsFeatureCollection.value, { numberOfClusters: 5 })
  clusters.value = kmeanClusters
})

// TODO: Render the cluster data instead of the raw data so we can color by cluster

watch(
  () => embeddingsMappedTo2D.value,
  (newValue) => {
    const xExtent = d3.extent(newValue, (d) => d[0])
    const yExtent = d3.extent(newValue, (d) => d[1])

    xScale.domain(xExtent)
    yScale.domain(yExtent)
  },
  { deep: true }
)

</script>

<style>
/* hide .embedding-text unless .embedding parent is hovered */
.embedding-text {
  opacity: 0;
  transition: all 0.2s ease-in-out;
}

.embedding:hover .embedding-text {
  opacity: 1;
}
</style>
