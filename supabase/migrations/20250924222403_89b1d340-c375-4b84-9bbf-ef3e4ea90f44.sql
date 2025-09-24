-- Create some default venues for testing
INSERT INTO public.venues (name, address, city, country, description, capacity, is_active) VALUES
('The Electric Ballroom', '184 Camden High St', 'London', 'UK', 'Historic music venue in Camden', 1500, true),
('Madison Square Garden', '4 Pennsylvania Plaza', 'New York', 'USA', 'The worlds most famous arena', 20000, true),
('Red Rocks Amphitheatre', '18300 W Alameda Pkwy', 'Morrison', 'USA', 'Natural amphitheatre with stunning views', 9500, true),
('The Fillmore', '1805 Geary Blvd', 'San Francisco', 'USA', 'Legendary rock venue', 1315, true),
('Berghain', 'Am Wriezener Bahnhof', 'Berlin', 'Germany', 'World-renowned techno club', 1500, true);