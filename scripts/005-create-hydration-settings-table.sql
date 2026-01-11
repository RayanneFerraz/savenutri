-- Create hydration settings table
CREATE TABLE IF NOT EXISTS hydration_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  custom_goal INTEGER, -- in ml, null means use calculated
  use_weight_based BOOLEAN DEFAULT true,
  activity_level TEXT DEFAULT 'moderate' CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  climate TEXT DEFAULT 'normal' CHECK (climate IN ('cold', 'normal', 'hot')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE hydration_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own hydration settings" ON hydration_settings 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hydration settings" ON hydration_settings 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hydration settings" ON hydration_settings 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hydration settings" ON hydration_settings 
  FOR DELETE USING (auth.uid() = user_id);
