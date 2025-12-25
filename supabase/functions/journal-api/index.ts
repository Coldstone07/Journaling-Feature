// Supabase Edge Function for Journal API
// This replaces your Firebase Netlify function with native Supabase functionality

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface JournalEntryData {
  id?: string;
  title?: string;
  content: string;
  voice_transcription?: string;
  emotional_analysis?: any;
  ai_insights?: any;
  synchronicity_tags?: string[];
  shadow_work_prompts?: string[];
  mood?: string;
  themes?: string[];
  triggers?: string[];
}

interface RequestBody {
  action: string;
  data?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for server-side operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the JWT token and get user
    const token = authorization.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: RequestBody = await req.json();
    
    if (!body.action) {
      return new Response(
        JSON.stringify({ error: 'Missing action in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with the user's token for RLS
    const userSupabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: {
        headers: {
          Authorization: authorization,
        },
      },
    });

    // Handle different actions
    switch (body.action) {
      case 'createEntry': {
        const entryData: JournalEntryData = {
          ...body.data,
          user_id: user.id, // Ensure user_id is set correctly
        };

        const { data, error } = await userSupabase
          .from('journal_entries')
          .insert([entryData])
          .select()
          .single();

        if (error) {
          console.error('Create entry error:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify(data),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'updateEntry': {
        const { entryId, updateData } = body.data;
        
        const { data, error } = await userSupabase
          .from('journal_entries')
          .update(updateData)
          .eq('id', entryId)
          .select()
          .single();

        if (error) {
          console.error('Update entry error:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify(data),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'getEntry': {
        const { entryId } = body.data;
        
        const { data, error } = await userSupabase
          .from('journal_entries')
          .select('*')
          .eq('id', entryId)
          .single();

        if (error) {
          console.error('Get entry error:', error);
          if (error.code === 'PGRST116') {
            return new Response(
              JSON.stringify({ error: 'Entry not found' }),
              { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify(data),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'getUserEntries': {
        const limitCount = body.data?.limit || 50;
        
        const { data, error } = await userSupabase
          .from('journal_entries')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limitCount);

        if (error) {
          console.error('Get user entries error:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify(data),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'deleteEntry': {
        const { entryId } = body.data;
        
        const { error } = await userSupabase
          .from('journal_entries')
          .delete()
          .eq('id', entryId);

        if (error) {
          console.error('Delete entry error:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'searchEntries': {
        const { query, limit = 20 } = body.data;
        
        const { data, error } = await userSupabase
          .from('journal_entries')
          .select('*')
          .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('Search entries error:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify(data),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});