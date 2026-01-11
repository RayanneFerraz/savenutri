-- Create progress photos table
CREATE TABLE IF NOT EXISTS progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  weight DECIMAL(5,2),
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_progress_photos_user_id ON progress_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_photos_date ON progress_photos(user_id, date);

-- Enable RLS
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own progress photos" ON progress_photos 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress photos" ON progress_photos 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress photos" ON progress_photos 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress photos" ON progress_photos 
  FOR DELETE USING (auth.uid() = user_id);
