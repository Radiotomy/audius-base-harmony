-- Create paymaster logs table for tracking gas sponsorship
CREATE TABLE IF NOT EXISTS public.paymaster_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_address TEXT NOT NULL,
    contract_address TEXT NOT NULL,
    function_name TEXT NOT NULL,
    gas_estimate NUMERIC NOT NULL,
    sponsored BOOLEAN NOT NULL DEFAULT false,
    transaction_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.paymaster_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for system to insert logs
CREATE POLICY "System can manage paymaster logs" 
ON public.paymaster_logs 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_paymaster_logs_user_address 
ON public.paymaster_logs (user_address);

CREATE INDEX IF NOT EXISTS idx_paymaster_logs_created_at 
ON public.paymaster_logs (created_at);