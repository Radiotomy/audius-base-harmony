-- Create contract_deployments table for tracking smart contract deployments
CREATE TABLE public.contract_deployments (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    contract_name text NOT NULL,
    contract_address text NOT NULL,
    transaction_hash text NOT NULL,
    block_number bigint NOT NULL,
    gas_used bigint NOT NULL,
    deployer_address text NOT NULL,
    network text NOT NULL DEFAULT 'base',
    deployed_at timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contract_deployments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view contract deployments" 
ON public.contract_deployments 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create deployments" 
ON public.contract_deployments 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create index for faster lookups
CREATE INDEX idx_contract_deployments_network ON public.contract_deployments(network);
CREATE INDEX idx_contract_deployments_contract_name ON public.contract_deployments(contract_name);
CREATE INDEX idx_contract_deployments_deployer ON public.contract_deployments(deployer_address);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_contract_deployments_updated_at
BEFORE UPDATE ON public.contract_deployments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();