<template>
  <section>
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
import * as tsnejs from 'tsne'
import { UMAP } from 'umap-js';
import * as d3 from 'd3'

const { width, height } = useWindowSize()

function embeddingIndexToData(index) {
  return inputData[index]
}

import inputData from '~/assets/openAI_embeddings.json'

/*
inputData is an array filled with objects that look like this:

  "id": 0,
  "group": 0,
  "text": "How to Paint Water in Watercolor - A Step-by-Step Tutorial",
  "embedding": []
*/

// we need to convert it to an array of arrays and keep track of the index
const inputDataAsArray = inputData.map((item) => {
  return item.embedding
})

// find the extent of the data
// const xExtent = d3.extent(embeddingsMappedTo2D.value, (d) => d[0])
// const yExtent = d3.extent(embeddingsMappedTo2D.value, (d) => d[1])

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

function textToLines(text) {
  const maxLineWords = 5
  const words = text.split(' ')
  const lines = []
  let currentLine = []
  words.forEach((word) => {
    if (currentLine.length < maxLineWords) {
      currentLine.push(word)
    } else {
      lines.push(currentLine.join(' '))
      currentLine = [word]
    }
  })
  lines.push(currentLine.join(' '))
  return lines
}


const embeddingsMappedTo2D = ref([])

// make a computed that turns the embeddings into a GeoJSON FeatureCollection of points using turf
const embeddingsAsFeatureCollection = ref(null)

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

onMounted(() => {


  var opt = {}
  opt.epsilon = 10; // epsilon is learning rate (10 = default)
  opt.perplexity = 10; // roughly how many neighbors each point influences (30 = default)
  opt.dim = 2; // dimensionality of the embedding (2 = default)

  var tsne = new tsnejs.tSNE(opt); // create a tSNE instance

  // initialize data using inputData embeddings
  tsne.initDataRaw(inputDataAsArray);

  // for (var k = 0; k < 3000; k++) {
  //   tsne.step(); // every time you call this, solution gets better
  //   embeddingsMappedTo2D.value = tsne.getSolution(); // Y is an array of 2-D points that you can plot
  // }

  let tick = 0

  // const { pause, resume } = useRafFn(() => {
  //   console.log('tick')
  //   tick++
  //   tsne.step(); // every time you call this, solution gets better
  //   // add some random noise to the solution
  //   embeddingsMappedTo2D.value = tsne.getSolution().map((embedding) => {
  //     if (tick < 500) {
  //       return embedding.map((value) => {
  //         return value + (Math.random() * 0.33)
  //       })
  //     } else {
  //       return embedding
  //     }
  //   });
  // })
  const umap = new UMAP({
    nComponents: 2,
    nEpochs: 400,
    nNeighbors: 15,
  });

  const nEpochs = umap.initializeFit(inputDataAsArray);

  for (let i = 0; i < nEpochs * 0.5; i++) {
    umap.step();
  }

  const { pause, resume } = useRafFn(() => {
    umap.step();
    const embedding = umap.getEmbedding();
    embeddingsMappedTo2D.value = embedding
  })


})

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
