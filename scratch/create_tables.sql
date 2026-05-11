-- UGC Applications Table
CREATE TABLE IF NOT EXISTS ugc_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    instagram_url TEXT,
    portfolio_url TEXT,
    city TEXT,
    about TEXT,
    status TEXT DEFAULT 'Beklemede'
);

-- Job Applications Table
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    position TEXT NOT NULL,
    portfolio_url TEXT,
    about TEXT,
    status TEXT DEFAULT 'Beklemede'
);

-- Enable RLS
ALTER TABLE ugc_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts
DROP POLICY IF EXISTS "Allow public insert for ugc" ON ugc_applications;
CREATE POLICY "Allow public insert for ugc" ON ugc_applications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert for job" ON job_applications;
CREATE POLICY "Allow public insert for job" ON job_applications FOR INSERT WITH CHECK (true);
