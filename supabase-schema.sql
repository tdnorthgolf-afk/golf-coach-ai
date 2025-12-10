-- Golf Coach AI Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (synced with Clerk)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  notes TEXT, -- AI-generated lesson notes in markdown
  audio_url TEXT,
  lesson_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media table (photos, videos, PDFs)
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'image', 'video', 'document'
  file_name TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_students_coach_id ON students(coach_id);
CREATE INDEX IF NOT EXISTS idx_lessons_student_id ON lessons(student_id);
CREATE INDEX IF NOT EXISTS idx_lessons_coach_id ON lessons(coach_id);
CREATE INDEX IF NOT EXISTS idx_media_lesson_id ON media(lesson_id);
CREATE INDEX IF NOT EXISTS idx_media_student_id ON media(student_id);
CREATE INDEX IF NOT EXISTS idx_media_coach_id ON media(coach_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (clerk_id = current_setting('app.clerk_id', true));

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (clerk_id = current_setting('app.clerk_id', true));

-- RLS Policies for students
CREATE POLICY "Coaches can view their students" ON students
  FOR SELECT USING (coach_id IN (
    SELECT id FROM users WHERE clerk_id = current_setting('app.clerk_id', true)
  ));

CREATE POLICY "Coaches can insert students" ON students
  FOR INSERT WITH CHECK (coach_id IN (
    SELECT id FROM users WHERE clerk_id = current_setting('app.clerk_id', true)
  ));

CREATE POLICY "Coaches can update their students" ON students
  FOR UPDATE USING (coach_id IN (
    SELECT id FROM users WHERE clerk_id = current_setting('app.clerk_id', true)
  ));

CREATE POLICY "Coaches can delete their students" ON students
  FOR DELETE USING (coach_id IN (
    SELECT id FROM users WHERE clerk_id = current_setting('app.clerk_id', true)
  ));

-- RLS Policies for lessons
CREATE POLICY "Coaches can view their lessons" ON lessons
  FOR SELECT USING (coach_id IN (
    SELECT id FROM users WHERE clerk_id = current_setting('app.clerk_id', true)
  ));

CREATE POLICY "Coaches can insert lessons" ON lessons
  FOR INSERT WITH CHECK (coach_id IN (
    SELECT id FROM users WHERE clerk_id = current_setting('app.clerk_id', true)
  ));

CREATE POLICY "Coaches can update their lessons" ON lessons
  FOR UPDATE USING (coach_id IN (
    SELECT id FROM users WHERE clerk_id = current_setting('app.clerk_id', true)
  ));

CREATE POLICY "Coaches can delete their lessons" ON lessons
  FOR DELETE USING (coach_id IN (
    SELECT id FROM users WHERE clerk_id = current_setting('app.clerk_id', true)
  ));

-- RLS Policies for media
CREATE POLICY "Coaches can view their media" ON media
  FOR SELECT USING (coach_id IN (
    SELECT id FROM users WHERE clerk_id = current_setting('app.clerk_id', true)
  ));

CREATE POLICY "Coaches can insert media" ON media
  FOR INSERT WITH CHECK (coach_id IN (
    SELECT id FROM users WHERE clerk_id = current_setting('app.clerk_id', true)
  ));

CREATE POLICY "Coaches can delete their media" ON media
  FOR DELETE USING (coach_id IN (
    SELECT id FROM users WHERE clerk_id = current_setting('app.clerk_id', true)
  ));

-- Create storage bucket for media files
-- Run this in Supabase Dashboard > Storage or via SQL:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('golf-coach-media', 'golf-coach-media', true);

-- Storage policies (if using Supabase Storage UI, these are set up automatically)
-- Otherwise, you can create policies in the Supabase Dashboard > Storage > Policies
