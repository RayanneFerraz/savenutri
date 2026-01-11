-- Create weight entries table
CREATE TABLE IF NOT EXISTS weight_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight DECIMAL(5,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_weight_entries_user_id ON weight_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_entries_date ON weight_entries(user_id, date);

-- Enable RLS
ALTER TABLE weight_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own weight entries" ON weight_entries 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weight entries" ON weight_entries 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weight entries" ON weight_entries 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weight entries" ON weight_entries 
  FOR DELETE USING (auth.uid() = user_id);
