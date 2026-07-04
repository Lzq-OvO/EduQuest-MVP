-- ==========================================
-- EduQuest MVP - Supabase Schema (V2 - with RLS & indexes)
-- 请在 Supabase 控制台的 SQL Editor 中执行此文件
-- ==========================================

-- 1. 用户表 (Profiles / User Stats)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT '思想家',
    avatar_char VARCHAR(1) NOT NULL DEFAULT 'A',
    avatar_bg TEXT NOT NULL DEFAULT 'bg-[#c8e6ff]',
    avatar_color TEXT NOT NULL DEFAULT 'text-[#004666]',
    academic_title TEXT NOT NULL DEFAULT '见习探索者',
    level INT NOT NULL DEFAULT 1,
    xp INT NOT NULL DEFAULT 0,
    max_xp INT NOT NULL DEFAULT 100,
    learning_time_minutes INT NOT NULL DEFAULT 0,
    deep_thinking_minutes INT NOT NULL DEFAULT 0,
    streak_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 为了方便 MVP 调试，插入一个测试账号
INSERT INTO public.profiles (id, name, academic_title)
VALUES ('00000000-0000-0000-0000-000000000000', '思想家 Alex', '量子探索者')
ON CONFLICT (id) DO NOTHING;


-- 2. 学习会话表 (Sessions)
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    error_count INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'mastered', 'profound_error')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 3. 对话记录表 (Messages)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 4. 深刻错题本 (Profound Errors)
CREATE TABLE IF NOT EXISTS public.profound_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.sessions(id),
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    ai_tip TEXT NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'hard',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'mastered')),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ==========================================
-- 索引 (P1 #10 预置)
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_session ON public.messages(session_id);
CREATE INDEX IF NOT EXISTS idx_errors_user ON public.profound_errors(user_id);
CREATE INDEX IF NOT EXISTS idx_errors_session ON public.profound_errors(session_id);


-- ==========================================
-- RPC: 原子递增 error_count (P0 #4 竞态条件修复)
-- ==========================================
CREATE OR REPLACE FUNCTION public.increment_error_count(sid UUID)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  new_count INT;
BEGIN
  UPDATE public.sessions
  SET error_count = error_count + 1,
      updated_at = NOW()
  WHERE id = sid
  RETURNING error_count INTO new_count;
  RETURN new_count;
END;
$$;


-- ==========================================
-- RLS 安全策略 (P0 #1)
-- ==========================================

-- 启用 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profound_errors ENABLE ROW LEVEL SECURITY;

-- MVP 阶段：允许 anon 角色全量读写（正式上线前替换为 auth.uid() 策略）
-- 这比完全关闭 RLS 更安全，因为至少 RLS 框架已启用，后续只需修改 Policy 即可

CREATE POLICY "MVP: Allow anon full access to profiles"
  ON public.profiles FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "MVP: Allow anon full access to sessions"
  ON public.sessions FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "MVP: Allow anon full access to messages"
  ON public.messages FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "MVP: Allow anon full access to profound_errors"
  ON public.profound_errors FOR ALL
  USING (true) WITH CHECK (true);

-- ⚠️ 正式上线时，请删除上面的 MVP Policy，替换为：
-- CREATE POLICY "Users can only access their own data"
--   ON public.profiles FOR ALL
--   USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
-- (其他表类似，通过 user_id = auth.uid() 约束)
