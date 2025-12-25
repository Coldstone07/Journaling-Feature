-- Migration: Create database functions for optimized journal operations
-- Run this AFTER creating the journal_entries table and RLS policies

-- Function to get journal entries with full-text search
CREATE OR REPLACE FUNCTION search_journal_entries(
  user_id_param UUID,
  search_query TEXT,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  mood TEXT,
  themes TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    je.id,
    je.title,
    je.content,
    je.mood,
    je.themes,
    je.created_at,
    je.updated_at,
    ts_rank(
      to_tsvector('english', COALESCE(je.title, '') || ' ' || je.content),
      plainto_tsquery('english', search_query)
    ) AS rank
  FROM journal_entries je
  WHERE 
    je.user_id = user_id_param
    AND (
      to_tsvector('english', COALESCE(je.title, '') || ' ' || je.content) 
      @@ plainto_tsquery('english', search_query)
    )
  ORDER BY rank DESC, je.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get journal statistics for a user
CREATE OR REPLACE FUNCTION get_journal_statistics(user_id_param UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  WITH stats AS (
    SELECT 
      COUNT(*) as total_entries,
      COUNT(DISTINCT mood) as unique_moods,
      ARRAY_AGG(DISTINCT unnest(themes)) as all_themes,
      COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as entries_this_week,
      COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as entries_this_month,
      AVG(LENGTH(content)) as avg_content_length,
      MIN(created_at) as first_entry_date,
      MAX(created_at) as last_entry_date
    FROM journal_entries 
    WHERE user_id = user_id_param
  ),
  mood_stats AS (
    SELECT 
      mood,
      COUNT(*) as count
    FROM journal_entries 
    WHERE user_id = user_id_param AND mood IS NOT NULL
    GROUP BY mood
    ORDER BY count DESC
  ),
  theme_stats AS (
    SELECT 
      theme,
      COUNT(*) as count
    FROM journal_entries je, UNNEST(je.themes) as theme
    WHERE je.user_id = user_id_param
    GROUP BY theme
    ORDER BY count DESC
    LIMIT 10
  )
  SELECT json_build_object(
    'total_entries', s.total_entries,
    'unique_moods', s.unique_moods,
    'entries_this_week', s.entries_this_week,
    'entries_this_month', s.entries_this_month,
    'avg_content_length', ROUND(s.avg_content_length::numeric, 2),
    'first_entry_date', s.first_entry_date,
    'last_entry_date', s.last_entry_date,
    'mood_distribution', (
      SELECT json_agg(json_build_object('mood', mood, 'count', count))
      FROM mood_stats
    ),
    'top_themes', (
      SELECT json_agg(json_build_object('theme', theme, 'count', count))
      FROM theme_stats
    )
  ) INTO result
  FROM stats s;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get mood trends over time
CREATE OR REPLACE FUNCTION get_mood_trends(
  user_id_param UUID,
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  date DATE,
  mood TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(je.created_at) as date,
    je.mood,
    COUNT(*) as count
  FROM journal_entries je
  WHERE 
    je.user_id = user_id_param 
    AND je.mood IS NOT NULL
    AND je.created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
  GROUP BY DATE(je.created_at), je.mood
  ORDER BY date DESC, count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get similar entries based on themes and content
CREATE OR REPLACE FUNCTION get_similar_entries(
  entry_id_param UUID,
  user_id_param UUID,
  limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  themes TEXT[],
  created_at TIMESTAMPTZ,
  similarity_score REAL
) AS $$
DECLARE
  target_themes TEXT[];
  target_content TEXT;
BEGIN
  -- Get the themes and content of the target entry
  SELECT themes, content INTO target_themes, target_content
  FROM journal_entries 
  WHERE id = entry_id_param AND user_id = user_id_param;
  
  IF target_themes IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    je.id,
    je.title,
    je.content,
    je.themes,
    je.created_at,
    (
      -- Theme similarity (Jaccard index approximation)
      COALESCE(
        ARRAY_LENGTH(je.themes & target_themes, 1)::REAL / 
        NULLIF(ARRAY_LENGTH(je.themes | target_themes, 1)::REAL, 0),
        0
      ) * 0.7 +
      -- Content similarity using cosine similarity approximation
      COALESCE(
        ts_rank(
          to_tsvector('english', je.content),
          plainto_tsquery('english', target_content)
        ),
        0
      ) * 0.3
    ) as similarity_score
  FROM journal_entries je
  WHERE 
    je.user_id = user_id_param 
    AND je.id != entry_id_param
    AND (
      je.themes && target_themes OR  -- Has overlapping themes
      to_tsvector('english', je.content) @@ plainto_tsquery('english', target_content)
    )
  ORDER BY similarity_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get entries by date range with aggregations
CREATE OR REPLACE FUNCTION get_entries_by_date_range(
  user_id_param UUID,
  start_date DATE,
  end_date DATE
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  WITH date_entries AS (
    SELECT 
      DATE(created_at) as entry_date,
      COUNT(*) as entries_count,
      ARRAY_AGG(DISTINCT mood) FILTER (WHERE mood IS NOT NULL) as moods,
      ARRAY_AGG(DISTINCT unnest(themes)) as themes_mentioned,
      AVG(LENGTH(content)) as avg_length
    FROM journal_entries
    WHERE 
      user_id = user_id_param
      AND DATE(created_at) BETWEEN start_date AND end_date
    GROUP BY DATE(created_at)
    ORDER BY entry_date DESC
  )
  SELECT json_build_object(
    'date_range', json_build_object('start', start_date, 'end', end_date),
    'total_entries', (SELECT COUNT(*) FROM journal_entries WHERE user_id = user_id_param AND DATE(created_at) BETWEEN start_date AND end_date),
    'daily_breakdown', (
      SELECT json_agg(
        json_build_object(
          'date', entry_date,
          'entries_count', entries_count,
          'moods', moods,
          'avg_length', ROUND(avg_length::numeric, 2)
        )
      )
      FROM date_entries
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for the search function
CREATE INDEX IF NOT EXISTS idx_journal_entries_fts ON journal_entries 
USING gin(to_tsvector('english', COALESCE(title, '') || ' ' || content));

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION search_journal_entries(UUID, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_journal_statistics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_mood_trends(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_similar_entries(UUID, UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_entries_by_date_range(UUID, DATE, DATE) TO authenticated;