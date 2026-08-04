-- Create client_payment_requests table for custom invoices/payments sent from admin to clients
CREATE TABLE IF NOT EXISTS public.client_payment_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_name TEXT NOT NULL,
    company_code TEXT,
    title TEXT NOT NULL,
    description TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'cancelled'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    iyzico_payment_id TEXT
);

-- Enable RLS
ALTER TABLE public.client_payment_requests ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anon / authenticated users (consistent with app policies)
CREATE POLICY "Allow public read client_payment_requests" ON public.client_payment_requests FOR SELECT USING (true);
CREATE POLICY "Allow public insert client_payment_requests" ON public.client_payment_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update client_payment_requests" ON public.client_payment_requests FOR UPDATE USING (true);
CREATE POLICY "Allow public delete client_payment_requests" ON public.client_payment_requests FOR DELETE USING (true);
