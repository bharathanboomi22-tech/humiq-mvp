-- Create work_sessions table for Tech Work Session feature
CREATE TABLE public.work_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  github_url TEXT NOT NULL,
  role_track TEXT NOT NULL CHECK (role_track IN ('backend', 'frontend')),
  level TEXT NOT NULL CHECK (level IN ('junior', 'mid', 'senior')),
  duration INTEGER NOT NULL CHECK (duration IN (15, 30, 45)),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  raw_work_evidence TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create work_session_stages table
CREATE TABLE public.work_session_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.work_sessions(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL CHECK (stage_name IN ('framing', 'approach', 'build', 'review')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create work_session_events table
CREATE TABLE public.work_session_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.work_sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('PROMPT', 'RESPONSE', 'CODE_SNAPSHOT', 'SYSTEM')),
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create evidence_packs table
CREATE TABLE public.evidence_packs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL UNIQUE REFERENCES public.work_sessions(id) ON DELETE CASCADE,
  public_share_id TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  summary_json JSONB NOT NULL DEFAULT '{}',
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_session_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_session_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_packs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for work_sessions (public access for MVP - no auth)
CREATE POLICY "Work sessions are publicly readable" 
ON public.work_sessions FOR SELECT USING (true);

CREATE POLICY "Anyone can create work sessions" 
ON public.work_sessions FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update work sessions" 
ON public.work_sessions FOR UPDATE USING (true);

-- RLS Policies for work_session_stages
CREATE POLICY "Work session stages are publicly readable" 
ON public.work_session_stages FOR SELECT USING (true);

CREATE POLICY "Anyone can create work session stages" 
ON public.work_session_stages FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update work session stages" 
ON public.work_session_stages FOR UPDATE USING (true);

-- RLS Policies for work_session_events
CREATE POLICY "Work session events are publicly readable" 
ON public.work_session_events FOR SELECT USING (true);

CREATE POLICY "Anyone can create work session events" 
ON public.work_session_events FOR INSERT WITH CHECK (true);

-- RLS Policies for evidence_packs
CREATE POLICY "Evidence packs are publicly readable" 
ON public.evidence_packs FOR SELECT USING (true);

CREATE POLICY "Anyone can create evidence packs" 
ON public.evidence_packs FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_work_sessions_github_url ON public.work_sessions(github_url);
CREATE INDEX idx_work_sessions_status ON public.work_sessions(status);
CREATE INDEX idx_work_session_stages_session_id ON public.work_session_stages(session_id);
CREATE INDEX idx_work_session_events_session_id_created ON public.work_session_events(session_id, created_at);
CREATE INDEX idx_evidence_packs_share_id ON public.evidence_packs(public_share_id);
