-- Temporary policies to allow Python scripts (using anon key) to insert data
-- NOTE: In a production app, you would use a Service Role Key and keep RLS strict.
-- Since this is local dev and we don't have a Service Role Key, we will temporarily allow inserts.

-- Enable ALL operations on topics
CREATE POLICY "Allow public all on topics" 
ON public.topics FOR ALL USING (true) WITH CHECK (true);

-- Enable ALL operations on exams
CREATE POLICY "Allow public all on exams" 
ON public.exams FOR ALL USING (true) WITH CHECK (true);

-- Enable ALL operations on papers
CREATE POLICY "Allow public all on papers" 
ON public.papers FOR ALL USING (true) WITH CHECK (true);

-- Enable ALL operations on questions
CREATE POLICY "Allow public all on questions" 
ON public.questions FOR ALL USING (true) WITH CHECK (true);

-- Enable ALL operations on trend_analytics
CREATE POLICY "Allow public all on trends" 
ON public.trend_analytics FOR ALL USING (true) WITH CHECK (true);
