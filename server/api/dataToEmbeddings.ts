import { defineEventHandler } from 'h3'
import { OpenAIApi, Configuration } from 'openai'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

export default defineEventHandler(async (event) => {
  try {
    const requestBody = await useBody(event)
    if (!requestBody.data || !Array.isArray(requestBody.data) || requestBody.data.length > 50) {
      return createError({ statusCode: 400, statusMessage: 'Invalid input data. Ensure it is an array and does not exceed 50 points.' })
    }

    const embeddings = await Promise.all(
      requestBody.data.map(async (text) => {
        const response = await openai.createEmbedding({
          model: "text-embedding-ada-002",
          input: text
        })
        return response.data.data[0].embedding
      })
    )

    return { embeddings }
  } catch (error) {
    return createError({ statusCode: 500, statusMessage: 'Internal Server Error', error: error.message })
  }
})
