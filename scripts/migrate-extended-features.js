const { Client } = require('pg');

const connectionString = 'postgresql://postgres:UCShl5WCZXEIau5J@db.uchjkqragyvtoriflmjp.supabase.co:5432/postgres';

async function migrate() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log('Connected to PostgreSQL successfully.');

  try {
    // 1. Gamification & Leaderboard
    await client.query(`
      create table if not exists public.intern_gamification (
        id uuid primary key default gen_random_uuid(),
        intern_id uuid not null references public.interns(user_id) on delete cascade unique,
        xp integer not null default 150,
        level integer not null default 1,
        streak_days integer not null default 3,
        badges text[] default array['First Commit', 'On-Time Standup']::text[],
        tier text not null default 'Apprentice',
        updated_at timestamptz not null default now()
      );
    `);
    console.log('Created intern_gamification table');

    // 2. Code Reviews & GitHub PRs
    await client.query(`
      create table if not exists public.code_reviews (
        id uuid primary key default gen_random_uuid(),
        task_id uuid references public.tasks(id) on delete set null,
        intern_id uuid not null references public.interns(user_id) on delete cascade,
        reviewer_name text not null default 'Deepak Sharma (Tech Lead)',
        pr_url text not null,
        pr_title text not null,
        status text not null default 'approved' check (status in ('pending', 'approved', 'changes_requested', 'merged')),
        architecture_score integer not null default 5,
        clean_code_score integer not null default 5,
        performance_score integer not null default 4,
        tests_score integer not null default 4,
        feedback text not null,
        created_at timestamptz not null default now()
      );
    `);
    console.log('Created code_reviews table');

    // 3. Milestone Reviews & PPO Pipeline
    await client.query(`
      create table if not exists public.milestone_reviews (
        id uuid primary key default gen_random_uuid(),
        intern_id uuid not null references public.interns(user_id) on delete cascade,
        reviewer_name text not null default 'Deepak Sharma (Tech Lead)',
        milestone_type text not null default '30_day' check (milestone_type in ('30_day', '60_day', 'final')),
        architecture integer not null default 8,
        problem_solving integer not null default 9,
        velocity integer not null default 8,
        code_quality integer not null default 9,
        ownership integer not null default 8,
        communication integer not null default 9,
        ppo_recommendation text not null default 'recommended' check (ppo_recommendation in ('recommended', 'eligible', 'in_review', 'not_eligible')),
        notes text not null,
        created_at timestamptz not null default now()
      );
    `);
    console.log('Created milestone_reviews table');

    // 4. Mentorship & Retrospectives
    await client.query(`
      create table if not exists public.mentorship_sessions (
        id uuid primary key default gen_random_uuid(),
        intern_id uuid not null references public.interns(user_id) on delete cascade,
        mentor_name text not null default 'Deepak Sharma (Managing Director)',
        scheduled_at timestamptz not null default now() + interval '2 days',
        duration_minutes integer not null default 30,
        topic text not null default 'Sprint 3 Architecture & Microservices',
        agenda text,
        notes text,
        action_items text,
        status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
        meeting_url text default 'https://meet.google.com/dss-ment-101',
        created_at timestamptz not null default now()
      );

      create table if not exists public.retrospectives (
        id uuid primary key default gen_random_uuid(),
        squad_name text not null default 'Alpha Squad',
        sprint_name text not null default 'Sprint 3 - Core APIs',
        category text not null check (category in ('went_well', 'to_improve', 'action_item', 'kudos')),
        content text not null,
        author_name text not null default 'Anonymous Intern',
        votes integer not null default 1,
        created_at timestamptz not null default now()
      );
    `);
    console.log('Created mentorship_sessions & retrospectives tables');

    // 5. LMS / Academy
    await client.query(`
      create table if not exists public.learning_modules (
        id uuid primary key default gen_random_uuid(),
        track text not null default 'Full-Stack Next.js',
        title text not null,
        description text not null,
        duration_hours numeric(4,1) not null default 4.0,
        sort_order integer not null default 1,
        lessons jsonb not null default '[]'::jsonb,
        created_at timestamptz not null default now()
      );

      create table if not exists public.intern_learning_progress (
        id uuid primary key default gen_random_uuid(),
        intern_id uuid not null references public.interns(user_id) on delete cascade,
        module_id uuid not null references public.learning_modules(id) on delete cascade,
        status text not null default 'in_progress' check (status in ('not_started', 'in_progress', 'completed')),
        progress_percent integer not null default 0,
        completed_at timestamptz,
        created_at timestamptz not null default now(),
        constraint uq_intern_module unique (intern_id, module_id)
      );
    `);
    console.log('Created learning_modules & progress tables');

    // 6. Webhooks & Notifications
    await client.query(`
      create table if not exists public.webhook_integrations (
        id uuid primary key default gen_random_uuid(),
        platform text not null default 'slack' check (platform in ('slack', 'discord', 'webhook')),
        name text not null default 'Engineering Alerts Channel',
        webhook_url text not null,
        is_active boolean not null default true,
        events text[] not null default array['standup_blocker', 'leave_request', 'offer_accepted', 'certificate_issued']::text[],
        last_triggered_at timestamptz,
        created_at timestamptz not null default now()
      );

      create table if not exists public.notification_logs (
        id uuid primary key default gen_random_uuid(),
        platform text not null default 'discord',
        event_type text not null,
        payload jsonb not null default '{}'::jsonb,
        status text not null default 'sent',
        response_status integer default 200,
        created_at timestamptz not null default now()
      );
    `);
    console.log('Created webhook_integrations & notification_logs tables');

    // RLS
    const tables = [
      'intern_gamification',
      'code_reviews',
      'milestone_reviews',
      'mentorship_sessions',
      'retrospectives',
      'learning_modules',
      'intern_learning_progress',
      'webhook_integrations',
      'notification_logs'
    ];

    for (const t of tables) {
      await client.query(`alter table public.${t} enable row level security;`);
      await client.query(`drop policy if exists "allow_all_${t}" on public.${t};`);
      await client.query(`create policy "allow_all_${t}" on public.${t} for all using (true) with check (true);`);
    }
    console.log('Configured RLS policies for all 9 new tables.');

    // Seed Initial Data
    const { rows: interns } = await client.query('select user_id, full_name from public.interns limit 4;');
    console.log(`Found ${interns.length} interns for seeding.`);

    if (interns.length > 0) {
      // 1. Gamification
      for (let i = 0; i < interns.length; i++) {
        const intern = interns[i];
        const xp = 850 - (i * 180);
        const level = Math.floor(xp / 250) + 1;
        const tier = level >= 4 ? 'Architect Fellow' : level >= 3 ? 'Full-Stack Vanguard' : level >= 2 ? 'Craftsman' : 'Apprentice';
        const badges = i === 0 
          ? ['Sprint Champion', 'Clean Code Ninja', 'Bug Hunter', 'Full-Stack Vanguard']
          : i === 1
          ? ['Clean Code Ninja', 'Night Owl Committer', 'On-Time Standup']
          : ['First Commit', 'On-Time Standup'];

        await client.query(`
          insert into public.intern_gamification (intern_id, xp, level, streak_days, badges, tier)
          values ($1, $2, $3, $4, $5, $6)
          on conflict (intern_id) do update set xp = $2, level = $3, streak_days = $4, badges = $5, tier = $6;
        `, [intern.user_id, xp, level, 5 - i, badges, tier]);
      }
      console.log('Seeded intern gamification records.');

      // 2. Code Reviews
      await client.query(`
        delete from public.code_reviews;
        insert into public.code_reviews (intern_id, reviewer_name, pr_url, pr_title, status, architecture_score, clean_code_score, performance_score, tests_score, feedback)
        values
        ($1, 'Deepak Sharma (Lead)', 'https://github.com/dssoftwares/client-portal/pull/42', 'feat(auth): Add Supabase SSR authentication flow', 'merged', 5, 5, 5, 4, 'Exceptional component separation and token refresh handling! Clean middleware implementation.'),
        ($2, 'Priya Patel (Peer)', 'https://github.com/dssoftwares/crm/pull/18', 'feat(tasks): Implement drag-and-drop kanban sprint cards', 'approved', 4, 5, 4, 4, 'Great state management using optimistic UI. Suggested minor styling tweak for mobile drag.'),
        ($3, 'Deepak Sharma (Lead)', 'https://github.com/dssoftwares/api/pull/7', 'fix(db): Add index on standups intern_id and date', 'changes_requested', 4, 3, 5, 3, 'Query plan is 10x faster, but please add an automated migration rollback test before merge.');
      `, [interns[0].user_id, interns[1] ? interns[1].user_id : interns[0].user_id, interns[2] ? interns[2].user_id : interns[0].user_id]);
      console.log('Seeded code reviews.');

      // 3. Milestone Reviews (PPO)
      await client.query(`
        delete from public.milestone_reviews;
        insert into public.milestone_reviews (intern_id, reviewer_name, milestone_type, architecture, problem_solving, velocity, code_quality, ownership, communication, ppo_recommendation, notes)
        values
        ($1, 'Deepak Sharma (Tech Lead)', '60_day', 9, 10, 9, 9, 10, 9, 'recommended', 'Aarav has consistently operated at mid-level engineer caliber. Excellent system design and proactive ownership of client delivery. Unanimously recommended for Full-Time Junior Software Engineer PPO.'),
        ($2, 'Deepak Sharma (Tech Lead)', '30_day', 8, 8, 9, 8, 8, 9, 'eligible', 'Priya shows high velocity and very strong React skills. On track for high-tier PPO consideration at final review.');
      `, [interns[0].user_id, interns[1] ? interns[1].user_id : interns[0].user_id]);
      console.log('Seeded milestone reviews.');

      // 4. Mentorship & Retrospectives
      await client.query(`
        delete from public.mentorship_sessions;
        insert into public.mentorship_sessions (intern_id, mentor_name, scheduled_at, duration_minutes, topic, agenda, notes, action_items, status)
        values
        ($1, 'Deepak Sharma (Managing Director)', now() + interval '1 day', 45, 'Career Growth & High-Scale Systems Architecture', '1. Discussing PPO transition\n2. Database sharding strategies\n3. Leadership in Squad Alpha', 'Intern is highly receptive to senior mentorship.', 'Prepare microservices architecture diagram for next sprint review.', 'scheduled'),
        ($2, 'Vikram Mehta (Principal Architect)', now() + interval '3 days', 30, 'Optimizing Postgres Connection Pooling in Next.js', '1. Supabase pooler vs direct connection\n2. Prepared statements in server actions', null, null, 'scheduled');
      `, [interns[0].user_id, interns[1] ? interns[1].user_id : interns[0].user_id]);

      await client.query(`
        delete from public.retrospectives;
        insert into public.retrospectives (squad_name, sprint_name, category, content, author_name, votes)
        values
        ('Alpha Squad', 'Sprint 3', 'went_well', 'The automated payslip calculation saved huge manual work!', 'Aarav Sharma', 5),
        ('Alpha Squad', 'Sprint 3', 'went_well', 'Clear code review feedback from Deepak helped catch race conditions early.', 'Priya Patel', 4),
        ('Alpha Squad', 'Sprint 3', 'to_improve', 'Need more unit test fixtures for mock database environments.', 'Rohan Verma', 3),
        ('Alpha Squad', 'Sprint 3', 'action_item', 'Create a shared @/testing-fixtures utility module.', 'Deepak Sharma', 6),
        ('Alpha Squad', 'Sprint 3', 'kudos', 'Kudos to Priya for helping onboard the new interns this week!', 'Aarav Sharma', 8);
      `);
      console.log('Seeded mentorship & retrospectives.');

      // 5. LMS Modules
      await client.query(`
        delete from public.learning_modules;
        insert into public.learning_modules (track, title, description, duration_hours, sort_order, lessons)
        values
        ('Full-Stack Next.js 15', 'Production Next.js 15 & React 19 Architecture', 'Master Server Components, Server Actions, Caching strategies, and Turbopack internals.', 6.5, 1, '[
          {"id": "l1", "title": "Server Actions vs Route Handlers", "duration": "35 min", "completed": true},
          {"id": "l2", "title": "Optimistic UI Updates with useActionState", "duration": "45 min", "completed": true},
          {"id": "l3", "title": "Streaming SSR & Suspense Boundaries", "duration": "50 min", "completed": false},
          {"id": "l4", "title": "Secure Auth with Supabase SSR Cookies", "duration": "60 min", "completed": false}
        ]'::jsonb),
        ('PostgreSQL & Database Systems', 'Advanced PostgreSQL Query Tuning & RLS Security', 'Learn indexing strategies, query execution plans, JSONB query optimization, and rock-solid Row Level Security.', 5.0, 2, '[
          {"id": "l5", "title": "Understanding EXPLAIN ANALYZE & Buffer Hits", "duration": "40 min", "completed": true},
          {"id": "l6", "title": "B-Tree vs GIN Indexes on JSONB", "duration": "45 min", "completed": false},
          {"id": "l7", "title": "Zero-Downtime Schema Migrations", "duration": "30 min", "completed": false}
        ]'::jsonb),
        ('AI & Agentic Systems', 'Building Production Gemini API & Autonomous Multi-Agent Tools', 'Integrate Gemini 2.5 Flash, structured JSON output, tool calling, and MCP server protocols.', 8.0, 3, '[
          {"id": "l8", "title": "Gemini API Function Calling Deep Dive", "duration": "55 min", "completed": false},
          {"id": "l9", "title": "Vector Embeddings & Semantic Search in Postgres", "duration": "60 min", "completed": false},
          {"id": "l10", "title": "Building MCP Tool Agents", "duration": "75 min", "completed": false}
        ]'::jsonb);
      `);

      // Seed progress
      const { rows: mods } = await client.query('select id from public.learning_modules;');
      if (mods.length > 0) {
        await client.query(`
          delete from public.intern_learning_progress;
          insert into public.intern_learning_progress (intern_id, module_id, status, progress_percent)
          values
          ($1, $2, 'in_progress', 65),
          ($1, $3, 'in_progress', 35),
          ($4, $2, 'completed', 100);
        `, [interns[0].user_id, mods[0].id, mods[1].id, interns[1] ? interns[1].user_id : interns[0].user_id]);
      }
      console.log('Seeded learning academy modules & progress.');

      // 6. Webhooks
      await client.query(`
        delete from public.webhook_integrations;
        insert into public.webhook_integrations (platform, name, webhook_url, is_active, events)
        values
        ('slack', 'Slack #internship-announcements', 'https://api.dssoftwares.dev/mock-slack-webhook', true, array['standup_blocker', 'leave_request', 'offer_accepted']),
        ('discord', 'Discord #squad-alerts', 'https://discord.com/api/webhooks/1234567890/abcdefghijklmnopqrstuvwxyz', true, array['certificate_issued', 'standup_blocker']);

        delete from public.notification_logs;
        insert into public.notification_logs (platform, event_type, payload, status, response_status)
        values
        ('discord', 'certificate_issued', '{"recipient": "Aarav Sharma", "code": "VERIFY-DS-AARAV-842", "track": "Full-Stack Web Development"}'::jsonb, 'sent', 200),
        ('slack', 'standup_blocker', '{"intern": "Rohan Verma", "squad": "Alpha Squad", "blocker": "Waiting on AWS IAM credentials"}'::jsonb, 'sent', 200);
      `);
      console.log('Seeded webhooks and notification logs.');
    }

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
    console.log('PostgreSQL migration completed successfully.');
  }
}

migrate();
