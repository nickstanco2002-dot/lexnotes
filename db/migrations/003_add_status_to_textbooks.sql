-- Migration: Add status column to textbooks
-- Run with psql: psql -d <DB_NAME> -f db/migrations/003_add_status_to_textbooks.sql

alter table textbooks
add column status text default 'processing';
