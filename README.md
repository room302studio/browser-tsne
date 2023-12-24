# Browser Tsne + Nuxt Example

## Goal
As a user, I want to upload a .csv of any qualitative data, turn it into embeddings, and then visualize the embeddings in the browser. 

### Later...
I want to be able to label the clusters that I see in the visualization, and then save the labels to the database. I want to be able to see the labels and the visualization at the same time. I want to be able to save the data and the labels to the database so that I can come back to it later. I want to be able to see all of the projects that I have saved in the database. I want to be able to delete projects from the database. I want to be able to see the data and the labels for a given project at the same time. I want to be able to see the data and the labels for a given project at the same time. I want to be able to see the data and the labels for a given project at the same time. I want to be able to see the data and the labels for a given project at the same time. I want to be able to see the data and the labels for a given project at the same time. I want to be able to see the data and the labels for a given project at the same time. I want to be able to see the data and the labels for a given project at the same time. I want to be able to see the data and the labels for a given project at the same time. I want to be able to see the data and the labels for a given project at the same time.

## Usage
An experiment in using OpenAI, Nuxt, and Netlify + Supabase to generate a tsne visualization in the browser from embeddings, instead of doing it in the cloud.

1. Drop a csv file into the file upload box.
2. Pick a column to embed
3. Embed the data and save it to the DB
4. Project the data into 2d space in the browser using tsne
5. Save the projected data to the DB
6. Identify clusters in the data and generate a summary of each cluster
7. Save the cluster summaries to the DB
8. View the projected data and cluster summaries in the browser

## API

### /api/dataToEmbeddings

#### POST
Takes the given data, runs it through the OpenAI embeddings API, and returns the vectors. Can only embed 50 points at a time, for now. 

### /api/projectedEmbeddings

#### POST
Given a set of vectors which have been projected into 2d space, save them to supabase under a given project name for the logged in user. 

#### GET
Given a project name, return the projected embeddings for that project.

### /api/clusterSummary

#### POST
Given a set of points with their projected coordinates AND the content tht was embedded, generate a text summary of the cluster for labeling and analysis.

#### GET
Given a project name, return the cluster summaries for that project.

### /api/project

#### POST
Given a project name, save it to supabase under the logged in user.

#### GET
Given a project name, return the project info for that project.

### /api/userProjects

#### GET
Return all projects for the logged in user.



```markdown
## Database Setup for Vectors and Embeddings with pgvector
To effectively store and query vector embeddings in your database, a specific setup using the `pgvector` extension is required. This extension enables PostgreSQL to handle vector data efficiently.

## Database Schema
The database consists of two main tables: `projects` and `embeddings`, designed to manage project information and store embeddings respectively.

### `projects` table
This table stores information about various projects. Each project is uniquely identified by a UUID.

```sql
CREATE TABLE browser_tsne__projects (
  id uuid DEFAULT uuid_generate_v4()::uuid PRIMARY KEY,
  name text,
  user_id uuid REFERENCES auth.users (id) ON DELETE CASCADE
);
```

### `embeddings` table
The embeddings table is central to storing vector embeddings. Each embedding is linked to a project and stored as a vector using the pgvector extension, optimized for efficient similarity searches. The x and y fields represent coordinates used for visualization or other applications.

```sql
CREATE TABLE browser_tsne__embeddings (
  id uuid DEFAULT uuid_generate_v4()::uuid PRIMARY KEY,
  project_id uuid REFERENCES browser_tsne__projects (id) ON DELETE CASCADE,
  embedding vector(1536),
  x float,
  y float
);
```

Certainly! Here's an additional section for your README, explaining the setup process for the database to support vectors, embeddings, and the `pgvector` extension:



### Enabling pgvector
Before creating tables that store vector data, ensure the `pgvector` extension is enabled in your PostgreSQL database:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

This command activates the pgvector extension, allowing the use of the `vector` data type in your tables.

### Table Configuration for Embeddings
When setting up tables to store embeddings, use the `vector` data type for embedding columns. For instance, in the `browser_tsne__embeddings` table, the `embedding` column is defined as `vector(1536)`. This configuration is specifically tailored for storing embeddings from models like OpenAI's `text-embedding-ada-002`, which output 1536-dimensional vectors.

### Indexing for Efficient Queries
As your dataset grows, add an index to the embeddings column to enhance query performance. For cosine distance queries, use the `vector_cosine_ops` index:

```sql
CREATE INDEX ON browser_tsne__embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

Adjust the number of lists based on your dataset size to optimize the performance of similarity searches.

By following these steps, your database will be suitably configured to handle vector embeddings efficiently with `pgvector`.
```


## Setup

Make sure to install the dependencies:

```bash
# yarn install
yarn install

# run the dev server
yarn dev
```

## Deployment

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

# License
Copyright (c) 2023, Room 302 Studio
All rights reserved.

See `LICENSE` file for details.