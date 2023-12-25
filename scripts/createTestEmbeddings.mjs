import csv from 'csv-parser';
import fs from 'fs';
import axios from 'axios';

// set up .env
import dotenv from 'dotenv';
dotenv.config();

const EMBEDDING_COLUMN = 'title'; // replace with your column name
const inputFilePath = './assets/updated_youtube_videos.csv'; // replace with your CSV file path
const outputFilePath = './assets/openAI_embeddings.json';
const results = [];

async function getEmbedding(text) {
  console.log('Getting embedding for text:', text);
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

// Read and process the CSV file
fs.createReadStream(inputFilePath)
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', async () => {
    let embeddings = []; // Initialize the embeddings array as an empty array before the loop starts
    let iEntries = 0
    for (const [index, row] of results.entries()) {
      iEntries = iEntries + 1
      // if( iEntries >= 25 ) continue
      const csvRowText = row[EMBEDDING_COLUMN];
      console.log(`⭐️ Processing row ${index} with text:`, csvRowText);
      if (!csvRowText) {
        console.log(`No text found for row ${index}`);
        continue;
      }
      
      // Add a delay between API requests
      await new Promise(resolve => setTimeout(resolve, 120));
      
      const embedding = await getEmbedding(row[EMBEDDING_COLUMN]);
      console.log(`✅ Embedding for row ${index}:`, embedding);
      if (embedding) {
        embeddings.push({ id: index, group: 0, embedding,
        text: csvRowText
        });
      }
    }

    // Write to JSON file
    fs.writeFileSync(outputFilePath, JSON.stringify(embeddings, null, 2));
    console.log('Embeddings saved to', outputFilePath);
  });
