-- Create fasting entries table
CREATE TABLE IF NOT EXISTS fasting_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  target_duration INTEGER NOT NULL, -- in hours
  actual_duration DECIMAL(5,2), -- in hours
  fasting_type TEXT NOT NULL DEFAULT '16:8',
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_fasting_entries_user_id ON fasting_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_fasting_entries_start_time ON fasting_entries(user_id, start_time);

-- Enable RLS
ALTER TABLE fasting_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own fasting entries" ON fasting_entries 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own fasting entries" ON fasting_entries 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fasting entries" ON fasting_entries 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fasting entries" ON fasting_entries 
  FOR DELETE USING (auth.uid() = user_id);
