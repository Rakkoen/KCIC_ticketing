-- Knowledge Base Categories Table
CREATE TABLE IF NOT EXISTS public.kb_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT DEFAULT 'BookOpen',
    parent_id UUID REFERENCES public.kb_categories(id) ON DELETE SET NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Knowledge Base Articles Table
CREATE TABLE IF NOT EXISTS public.kb_articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    category_id UUID REFERENCES public.kb_categories(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    view_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX idx_kb_articles_category ON public.kb_articles(category_id);
CREATE INDEX idx_kb_articles_author ON public.kb_articles(author_id);
CREATE INDEX idx_kb_articles_status ON public.kb_articles(status);
CREATE INDEX idx_kb_articles_slug ON public.kb_articles(slug);
CREATE INDEX idx_kb_categories_slug ON public.kb_categories(slug);
CREATE INDEX idx_kb_categories_parent ON public.kb_categories(parent_id);

-- Full-text search
CREATE INDEX idx_kb_articles_search ON public.kb_articles USING GIN (to_tsvector('english', title || ' ' || content));

-- Updated_at trigger for categories
CREATE OR REPLACE FUNCTION update_kb_category_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_kb_categories_updated_at
    BEFORE UPDATE ON public.kb_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_kb_category_updated_at();

-- Updated_at trigger for articles
CREATE OR REPLACE FUNCTION update_kb_article_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_kb_articles_updated_at
    BEFORE UPDATE ON public.kb_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_kb_article_updated_at();

-- RLS Policies for kb_categories
ALTER TABLE public.kb_categories ENABLE ROW LEVEL SECURITY;

-- Everyone can view categories
CREATE POLICY "Categories are viewable by everyone" ON public.kb_categories
    FOR SELECT USING (true);

-- Only admins and managers can insert categories
CREATE POLICY "Admins and managers can insert categories" ON public.kb_categories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'manager')
        )
    );

-- Only admins and managers can update categories
CREATE POLICY "Admins and managers can update categories" ON public.kb_categories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'manager')
        )
    );

-- Only admins can delete categories
CREATE POLICY "Admins can delete categories" ON public.kb_categories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- RLS Policies for kb_articles
ALTER TABLE public.kb_articles ENABLE ROW LEVEL SECURITY;

-- Published articles are viewable by everyone
CREATE POLICY "Published articles are viewable by everyone" ON public.kb_articles
    FOR SELECT USING (status = 'published' OR author_id = auth.uid());

-- Authenticated users can create draft articles
CREATE POLICY "Authenticated users can insert articles" ON public.kb_articles
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Authors can update their own articles, admins/managers can update all
CREATE POLICY "Authors and admins can update articles" ON public.kb_articles
    FOR UPDATE USING (
        author_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'manager')
        )
    );

-- Authors can delete their own articles, admins can delete all
CREATE POLICY "Authors and admins can delete articles" ON public.kb_articles
    FOR DELETE USING (
        author_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Create a function to increment view count
CREATE OR REPLACE FUNCTION increment_article_views(article_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.kb_articles
    SET view_count = view_count + 1
    WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
