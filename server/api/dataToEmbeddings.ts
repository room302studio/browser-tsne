import { defineEventHandler } from 'h3'
import axios from 'axios';

// set up .env
import dotenv from 'dotenv';
dotenv.config();

async function getEmbedding(text) {
  try {
    const response = await axios.post('https://api.openai.com/v1/embeddings', {
      input: text,
      model: 'text-embedding-ada-002'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });
    const embedding = response.data.data[0].embedding;
    return embedding;
  } catch (error) {
    console.error('Error getting embedding:', error);
    return null;
  }
}


export default defineEventHandler(async (event) => {
  try {
    const requestBody = await useBody(event)
    if (!requestBody.data || !Array.isArray(requestBody.data) || requestBody.data.length > 50) {
      return createError({ statusCode: 400, statusMessage: 'Invalid input data. Ensure it is an array and does not exceed 50 points.' })
    }

    const embeddings = await Promise.all(
      requestBody.data.map(async (text) => {
        const embedding = await getEmbedding(text);
        // return embedding;
        return {
          text,
          embedding
        }
      })
    )

    return { embeddings }
  } catch (error) {
    return createError({ statusCode: 500, statusMessage: 'Internal Server Error', error: error.message })
  }
})
