-- ==============================================================================
-- MealVoice Food Delivery Platform - Supabase PostgreSQL Database Schema
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES / USERS TABLE ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  role TEXT DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'CALL_AGENT', 'RESTAURANT_ADMIN', 'RIDER', 'OPERATIONS_ADMIN', 'SUPER_ADMIN')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── RESTAURANTS TABLE ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  cuisine TEXT NOT NULL,
  rating NUMERIC(2, 1) DEFAULT 4.5,
  review_count INT DEFAULT 120,
  delivery_time TEXT DEFAULT '30-40 mins',
  delivery_fee NUMERIC(6, 2) DEFAULT 30.00,
  min_order NUMERIC(6, 2) DEFAULT 100.00,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  is_veg_only BOOLEAN DEFAULT FALSE,
  is_open BOOLEAN DEFAULT TRUE,
  image_url TEXT,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── MENU CATEGORIES ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.menu_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

-- ─── MENU ITEMS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.menu_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(8, 2) NOT NULL,
  is_veg BOOLEAN DEFAULT TRUE,
  is_available BOOLEAN DEFAULT TRUE,
  image_url TEXT DEFAULT ''
);

-- ─── ORDERS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE SET NULL,
  order_source TEXT DEFAULT 'ONLINE',
  status TEXT DEFAULT 'PENDING' CHECK (status IN (
    'PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP',
    'ASSIGNED', 'RIDER_ACCEPTED', 'AT_RESTAURANT', 'PICKED_UP',
    'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'
  )),
  total_amount NUMERIC(8, 2) NOT NULL,
  delivery_address TEXT NOT NULL,
  payment_method TEXT DEFAULT 'COD',
  payment_status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ORDER ITEMS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price NUMERIC(8, 2) NOT NULL
);

-- ─── ROW LEVEL SECURITY (RLS) POLICIES ───────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- 2. Restaurant & Menu Policies (Public read)
CREATE POLICY "Restaurants are viewable by everyone"
  ON public.restaurants FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Categories are viewable by everyone"
  ON public.menu_categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Menu items are viewable by everyone"
  ON public.menu_items FOR SELECT
  TO anon, authenticated
  USING (true);

-- 3. Orders Policies (Users can view & create their own orders)
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can view their own order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE public.orders.id = order_items.order_id
      AND public.orders.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert items for their own orders"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE public.orders.id = order_items.order_id
      AND public.orders.user_id = (select auth.uid())
    )
  );

-- ─── GRANTS ──────────────────────────────────────────────────────────────────
GRANT SELECT ON public.restaurants TO anon, authenticated;
GRANT SELECT ON public.menu_categories TO anon, authenticated;
GRANT SELECT ON public.menu_items TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT SELECT, INSERT ON public.order_items TO authenticated;

-- ─── AUTOMATIC USER PROFILE TRIGGER ──────────────────────────────────────────
-- Automatically create a profile when a new user signs up via Supabase Auth (OAuth or Email)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'CUSTOMER')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── SEED SAMPLE RESTAURANTS AND MENUS ─────────────────────────────────────────
DO $$
DECLARE
  rest_id1 UUID;
  rest_id2 UUID;
  cat_id1 UUID;
  cat_id2 UUID;
BEGIN
  -- Insert Restaurant 1
  INSERT INTO public.restaurants (name, cuisine, rating, delivery_time, address, phone, is_veg_only, image_url)
  VALUES ('Udupi Grand Delights', 'South Indian, Vegetarian', 4.8, '20-30 mins', 'Indiranagar, Bengaluru', '+91 80 2525 1111', TRUE, 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600')
  RETURNING id INTO rest_id1;

  -- Category 1
  INSERT INTO public.menu_categories (restaurant_id, name, sort_order)
  VALUES (rest_id1, 'Breakfast Specialties', 1)
  RETURNING id INTO cat_id1;

  -- Menu Items 1
  INSERT INTO public.menu_items (restaurant_id, category_id, name, description, price, is_veg, image_url)
  VALUES
    (rest_id1, cat_id1, 'Masala Dosa (Ghee Roast)', 'Crisp golden crepe folded with spiced potato masala and fresh coconut chutney', 95.00, TRUE, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400'),
    (rest_id1, cat_id1, 'Steamed Idli Vada Combo', '2 soft button idlis and 1 medu vada served with piping hot sambar', 80.00, TRUE, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400');

  -- Insert Restaurant 2
  INSERT INTO public.restaurants (name, cuisine, rating, delivery_time, address, phone, is_veg_only, image_url)
  VALUES ('Spice Garden Bistro', 'North Indian, Mughlai, Biryani', 4.6, '30-40 mins', 'Koramangala, Bengaluru', '+91 80 4141 2222', FALSE, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600')
  RETURNING id INTO rest_id2;

  -- Category 2
  INSERT INTO public.menu_categories (restaurant_id, name, sort_order)
  VALUES (rest_id2, 'Chef Biryani Bowls', 1)
  RETURNING id INTO cat_id2;

  -- Menu Items 2
  INSERT INTO public.menu_items (restaurant_id, category_id, name, description, price, is_veg, image_url)
  VALUES
    (rest_id2, cat_id2, 'Dum Hyderabadi Biryani', 'Slow-cooked aromatic basmati rice layered with marinated spices and tender cuts', 280.00, FALSE, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400'),
    (rest_id2, cat_id2, 'Paneer Tikka Butter Masala', 'Charcoal grilled cottage cheese simmered in rich cashew tomato gravy', 240.00, TRUE, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400');
END $$;
