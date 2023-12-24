import { defineEventHandler } from 'h3'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
)

// GET: Retrieve all projects for the logged-in user
export default defineEventHandler(async (event) => {
  const user = event.context.auth.user  // assuming user authentication context is available

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)

  if (error) {
    return createError({ statusCode: 500, statusMessage: 'Internal Server Error', error: error.message })
  }

  return { data }
})
