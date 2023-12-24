import { defineEventHandler, useBody, getQuery } from 'h3'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
)

// POST: Save a new project
export const post = defineEventHandler(async (event) => {
  const body = await useBody(event)
  const { name } = body
  const user = event.context.auth.user  // assuming user authentication context is available

  const { data, error } = await supabase
    .from('projects')
    .insert([{ name, user_id: user.id }])

  if (error) {
    return createError({ statusCode: 500, statusMessage: 'Internal Server Error', error: error.message })
  }

  return { data }
})

// GET: Retrieve project information
export const get = defineEventHandler(async (event) => {
  const { name } = getQuery(event)

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('name', name)
    .single() // Assuming project names are unique

  if (error) {
    return createError({ statusCode: 500, statusMessage: 'Internal Server Error', error: error.message })
  }

  return { data }
})
