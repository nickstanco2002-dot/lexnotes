-- Migration: Create textbooks and textbook_embeddings tables
-- Run with psql: psql -d <DB_NAME> -f db/migrations/001_create_textbooks.sql

-- Textbooks
create table textbooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  file_url text,
  created_at timestamp default now()
);

-- Textbook embeddings
create table textbook_embeddings (
  id uuid primary key default gen_random_uuid(),
  textbook_id uuid references textbooks(id) on delete cascade,
  content_chunk text,
  embedding vector(1536)
);

create index on textbook_embeddings
using ivfflat (embedding vector_cosine_ops);
