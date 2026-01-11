-- Create daily data table for water, mood, sleep tracking
CREATE TABLE IF NOT EXISTS daily_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  water_intake INTEGER DEFAULT 0, -- in ml
  mood TEXT,
  sleep_quality TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_daily_data_user_id ON daily_data(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_data_date ON daily_data(user_id, date);

-- Enable RLS
ALTER TABLE daily_data ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own daily data" ON daily_data 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily data" ON daily_data 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily data" ON daily_data 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily data" ON daily_data 
  FOR DELETE USING (auth.uid() = user_id);
