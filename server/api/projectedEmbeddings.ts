import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
)

// POST: Save projected embeddings to Supabase
export const post = defineEventHandler(async (event) => {
  const body = await useBody(event)
  const { project_id, embeddings } = body

  const { data, error } = await supabase
    .from('browser_tsne__embeddings')
    .insert(embeddings.map(embedding => ({ project_id, ...embedding })))

  if (error) {
    return createError({ statusCode: 500, statusMessage: 'Internal Server Error', error: error.message })
  }

  return { data }
})

// GET: Retrieve projected embeddings from Supabase
export const get = defineEventHandler(async (event) => {
  const { project_id } = getQuery(event)

  const { data, error } = await supabase
    .from('browser_tsne__embeddings')
    .select('*')
    .eq('project_id', project_id)

  if (error) {
    return createError({ statusCode: 500, statusMessage: 'Internal Server Error', error: error.message })
  }

  return { data }
})
