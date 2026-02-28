-- Migration: Create match_textbook_chunks function
-- Run with psql: psql -d <DB_NAME> -f db/migrations/002_create_match_textbook_chunks.sql

create function match_textbook_chunks(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table(
  id uuid,
  content_chunk text,
  similarity float
)
language sql stable
as $$
  select
    id,
    content_chunk,
    1 - (embedding <=> query_embedding) as similarity
  from textbook_embeddings
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
