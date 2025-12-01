-- Create qr_requests table
CREATE TABLE IF NOT EXISTS public.qr_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  woreda_id TEXT NOT NULL,
  code TEXT NOT NULL,
  ip_address TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  temporary_access_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure updated_at column exists (for existing tables)
ALTER TABLE public.qr_requests 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Create temporary_access table
CREATE TABLE IF NOT EXISTS public.temporary_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.qr_requests(id) ON DELETE CASCADE,
  woreda_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_qr_requests_woreda_id ON public.qr_requests(woreda_id);
CREATE INDEX IF NOT EXISTS idx_qr_requests_code ON public.qr_requests(code);
CREATE INDEX IF NOT EXISTS idx_qr_requests_status ON public.qr_requests(status);
CREATE INDEX IF NOT EXISTS idx_qr_requests_created_at ON public.qr_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_temporary_access_token ON public.temporary_access(token);
CREATE INDEX IF NOT EXISTS idx_temporary_access_woreda_id ON public.temporary_access(woreda_id);
CREATE INDEX IF NOT EXISTS idx_temporary_access_expires_at ON public.temporary_access(expires_at);

-- Enable Row Level Security
ALTER TABLE public.qr_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temporary_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies for qr_requests
-- Allow service role to do everything (for admin operations)
DROP POLICY IF EXISTS "Service role can manage qr_requests" ON public.qr_requests;
CREATE POLICY "Service role can manage qr_requests"
  ON public.qr_requests
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for temporary_access
-- Allow service role to do everything (for admin operations)
DROP POLICY IF EXISTS "Service role can manage temporary_access" ON public.temporary_access;
CREATE POLICY "Service role can manage temporary_access"
  ON public.temporary_access
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add updated_at trigger for qr_requests
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_qr_requests_updated_at ON public.qr_requests;
CREATE TRIGGER update_qr_requests_updated_at
  BEFORE UPDATE ON public.qr_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

