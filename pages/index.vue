<template>
  <section>
    <h1>Hello world!</h1>
  </section>
</template>

<script setup>
import TSNE from 'tsne-js'

onMounted(() => {

  // Load the input data from a JSON of openAI embeddings
  let inputData = require('../assets/openAI_embeddings.json')

  let model = new TSNE({
    dim: 2,
    perplexity: 30.0,
    earlyExaggeration: 4.0,
    learningRate: 100.0,
    nIter: 1000,
    metric: 'euclidean'
  });

  // inputData is a nested array which can be converted into an ndarray
  // alternatively, it can be an array of coordinates (second argument should be specified as 'sparse')
  model.init({
    data: inputData,
    type: 'dense'
  });

  // `error`,  `iter`: final error and iteration number
  // note: computation-heavy action happens here
  let [error, iter] = model.run();

  // rerun without re-calculating pairwise distances, etc.
  let [error, iter] = model.rerun();

  // `output` is unpacked ndarray (regular nested javascript array)
  let output = model.getOutput();

  // `outputScaled` is `output` scaled to a range of [-1, 1]
  let outputScaled = model.getOutputScaled();

  console.log(outputScaled)
})
/*
// Use the global state in this component
const store = useAppStore()
// Access the state variables and functions
const { activeItem, itemList, setActiveItem, addItem, removeItem } = store
*/
</script>

<style></style>
