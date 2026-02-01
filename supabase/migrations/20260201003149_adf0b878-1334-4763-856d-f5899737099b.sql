-- Create sellers table
CREATE TABLE public.sellers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product categories
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create base products table (shared product info)
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  description TEXT,
  specs JSONB DEFAULT '{}',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product listings (seller-specific pricing/stock)
CREATE TABLE public.product_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  condition TEXT DEFAULT 'new' CHECK (condition IN ('new', 'refurbished', 'used')),
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, seller_id)
);

-- Enable Row Level Security
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_listings ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables (no auth required for browsing)
CREATE POLICY "Anyone can view sellers"
  ON public.sellers FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view product listings"
  ON public.product_listings FOR SELECT
  USING (true);

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_listings_updated_at
  BEFORE UPDATE ON public.product_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample categories
INSERT INTO public.categories (name, slug, icon) VALUES
  ('CPU', 'cpu', 'Cpu'),
  ('GPU', 'gpu', 'Monitor'),
  ('RAM', 'ram', 'MemoryStick'),
  ('Storage', 'storage', 'HardDrive'),
  ('Motherboard', 'motherboard', 'CircuitBoard'),
  ('PSU', 'psu', 'Zap'),
  ('Case', 'case', 'Box'),
  ('Cooling', 'cooling', 'Fan');

-- Insert sample sellers
INSERT INTO public.sellers (name, rating, verified) VALUES
  ('TechMart', 4.8, true),
  ('PC Universe', 4.5, true),
  ('Budget Builds', 4.2, false),
  ('Elite Components', 4.9, true);

-- Insert sample products
INSERT INTO public.products (name, brand, category_id, description, specs, image_url) VALUES
  ('RTX 4090 Graphics Card', 'NVIDIA', (SELECT id FROM categories WHERE slug = 'gpu'), 
   'The ultimate graphics card for gaming and content creation with 24GB GDDR6X memory',
   '{"memory": "24GB GDDR6X", "boost_clock": "2.52 GHz", "cuda_cores": "16384", "tdp": "450W"}',
   NULL),
  ('Core i9-14900K', 'Intel', (SELECT id FROM categories WHERE slug = 'cpu'),
   'Flagship desktop processor with 24 cores and 32 threads for extreme performance',
   '{"cores": "24 (8P+16E)", "threads": "32", "base_clock": "3.2 GHz", "boost_clock": "6.0 GHz"}',
   NULL),
  ('Ryzen 9 7950X', 'AMD', (SELECT id FROM categories WHERE slug = 'cpu'),
   '16-core processor for extreme multithreaded performance',
   '{"cores": "16", "threads": "32", "base_clock": "4.5 GHz", "boost_clock": "5.7 GHz"}',
   NULL),
  ('32GB DDR5 RAM Kit', 'Corsair', (SELECT id FROM categories WHERE slug = 'ram'),
   'High-speed DDR5 memory kit for enthusiast builds',
   '{"speed": "6000MHz", "latency": "CL36", "voltage": "1.35V", "modules": "2x16GB"}',
   NULL),
  ('2TB NVMe SSD 990 Pro', 'Samsung', (SELECT id FROM categories WHERE slug = 'storage'),
   'Ultra-fast PCIe 4.0 solid state drive with exceptional read/write speeds',
   '{"read_speed": "7450 MB/s", "write_speed": "6900 MB/s", "interface": "PCIe 4.0 x4", "form_factor": "M.2 2280"}',
   NULL),
  ('RTX 4080 Super', 'NVIDIA', (SELECT id FROM categories WHERE slug = 'gpu'),
   'High-performance graphics for 4K gaming with ray tracing',
   '{"memory": "16GB GDDR6X", "boost_clock": "2.55 GHz", "cuda_cores": "10240", "tdp": "320W"}',
   NULL);

-- Insert product listings (same products from different sellers with different prices)
INSERT INTO public.product_listings (product_id, seller_id, price, stock, condition, shipping_cost) VALUES
  -- RTX 4090 from multiple sellers
  ((SELECT id FROM products WHERE name = 'RTX 4090 Graphics Card'), 
   (SELECT id FROM sellers WHERE name = 'TechMart'), 1599.99, 15, 'new', 0),
  ((SELECT id FROM products WHERE name = 'RTX 4090 Graphics Card'), 
   (SELECT id FROM sellers WHERE name = 'PC Universe'), 1649.99, 8, 'new', 12.99),
  ((SELECT id FROM products WHERE name = 'RTX 4090 Graphics Card'), 
   (SELECT id FROM sellers WHERE name = 'Elite Components'), 1549.99, 3, 'new', 0),
  
  -- Core i9-14900K from multiple sellers
  ((SELECT id FROM products WHERE name = 'Core i9-14900K'), 
   (SELECT id FROM sellers WHERE name = 'TechMart'), 589.99, 28, 'new', 0),
  ((SELECT id FROM products WHERE name = 'Core i9-14900K'), 
   (SELECT id FROM sellers WHERE name = 'Budget Builds'), 549.99, 12, 'new', 8.99),
  ((SELECT id FROM products WHERE name = 'Core i9-14900K'), 
   (SELECT id FROM sellers WHERE name = 'PC Universe'), 599.99, 20, 'new', 0),
  
  -- Ryzen 9 7950X from multiple sellers
  ((SELECT id FROM products WHERE name = 'Ryzen 9 7950X'), 
   (SELECT id FROM sellers WHERE name = 'Elite Components'), 549.99, 10, 'new', 0),
  ((SELECT id FROM products WHERE name = 'Ryzen 9 7950X'), 
   (SELECT id FROM sellers WHERE name = 'Budget Builds'), 519.99, 5, 'new', 9.99),
  
  -- RAM from multiple sellers
  ((SELECT id FROM products WHERE name = '32GB DDR5 RAM Kit'), 
   (SELECT id FROM sellers WHERE name = 'TechMart'), 189.99, 45, 'new', 0),
  ((SELECT id FROM products WHERE name = '32GB DDR5 RAM Kit'), 
   (SELECT id FROM sellers WHERE name = 'PC Universe'), 194.99, 32, 'new', 0),
  ((SELECT id FROM products WHERE name = '32GB DDR5 RAM Kit'), 
   (SELECT id FROM sellers WHERE name = 'Budget Builds'), 179.99, 18, 'new', 5.99),
  
  -- SSD from multiple sellers
  ((SELECT id FROM products WHERE name = '2TB NVMe SSD 990 Pro'), 
   (SELECT id FROM sellers WHERE name = 'TechMart'), 179.99, 62, 'new', 0),
  ((SELECT id FROM products WHERE name = '2TB NVMe SSD 990 Pro'), 
   (SELECT id FROM sellers WHERE name = 'Elite Components'), 169.99, 25, 'new', 0),
  
  -- RTX 4080 Super from multiple sellers
  ((SELECT id FROM products WHERE name = 'RTX 4080 Super'), 
   (SELECT id FROM sellers WHERE name = 'TechMart'), 999.99, 8, 'new', 0),
  ((SELECT id FROM products WHERE name = 'RTX 4080 Super'), 
   (SELECT id FROM sellers WHERE name = 'PC Universe'), 1049.99, 12, 'new', 0),
  ((SELECT id FROM products WHERE name = 'RTX 4080 Super'), 
   (SELECT id FROM sellers WHERE name = 'Budget Builds'), 969.99, 4, 'refurbished', 0);