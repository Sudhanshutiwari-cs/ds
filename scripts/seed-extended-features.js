const { Client } = require('pg');

const connectionString = 'postgresql://postgres:UCShl5WCZXEIau5J@db.uchjkqragyvtoriflmjp.supabase.co:5432/postgres';

async function seed() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log('Connected to PostgreSQL.');

  try {
    const { rows: interns } = await client.query('select user_id, full_name from public.interns limit 4;');
    console.log(`Found ${interns.length} interns.`);

    if (interns.length > 0) {
      const id1 = interns[0].user_id;
      const id2 = interns.length > 1 ? interns[1].user_id : id1;
      const id3 = interns.length > 2 ? interns[2].user_id : id1;

      // 1. Code Reviews
      await client.query('delete from public.code_reviews;');
      await client.query(`
        insert into public.code_reviews (intern_id, reviewer_name, pr_url, pr_title, status, architecture_score, clean_code_score, performance_score, tests_score, feedback)
        values
        ('${id1}', 'Deepak Sharma (Tech Lead)', 'https://github.com/dssoftwares/client-portal/pull/42', 'feat(auth): Add Supabase SSR authentication flow', 'merged', 5, 5, 5, 4, 'Exceptional component separation and token refresh handling! Clean middleware implementation.'),
        ('${id2}', 'Priya Patel (Peer)', 'https://github.com/dssoftwares/crm/pull/18', 'feat(tasks): Implement drag-and-drop kanban sprint cards', 'approved', 4, 5, 4, 4, 'Great state management using optimistic UI. Suggested minor styling tweak for mobile drag.'),
        ('${id3}', 'Deepak Sharma (Tech Lead)', 'https://github.com/dssoftwares/api/pull/7', 'fix(db): Add index on standups intern_id and date', 'changes_requested', 4, 3, 5, 3, 'Query plan is 10x faster, but please add an automated migration rollback test before merge.');
      `);
      console.log('Seeded code reviews.');

      // 2. Milestone Reviews (PPO)
      await client.query('delete from public.milestone_reviews;');
      await client.query(`
        insert into public.milestone_reviews (intern_id, reviewer_name, milestone_type, architecture, problem_solving, velocity, code_quality, ownership, communication, ppo_recommendation, notes)
        values
        ('${id1}', 'Deepak Sharma (Tech Lead)', '60_day', 9, 10, 9, 9, 10, 9, 'recommended', 'Aarav has consistently operated at mid-level engineer caliber. Excellent system design and proactive ownership of client delivery. Unanimously recommended for Full-Time Junior Software Engineer PPO.'),
        ('${id2}', 'Deepak Sharma (Tech Lead)', '30_day', 8, 8, 9, 8, 8, 9, 'eligible', 'Priya shows high velocity and very strong React skills. On track for high-tier PPO consideration at final review.');
      `);
      console.log('Seeded milestone reviews.');

      // 3. Mentorship & Retrospectives
      await client.query('delete from public.mentorship_sessions;');
      await client.query(`
        insert into public.mentorship_sessions (intern_id, mentor_name, scheduled_at, duration_minutes, topic, agenda, notes, action_items, status)
        values
        ('${id1}', 'Deepak Sharma (Managing Director)', now() + interval '1 day', 45, 'Career Growth & High-Scale Systems Architecture', '1. Discussing PPO transition\n2. Database sharding strategies\n3. Leadership in Squad Alpha', 'Intern is highly receptive to senior mentorship.', 'Prepare microservices architecture diagram for next sprint review.', 'scheduled'),
        ('${id2}', 'Vikram Mehta (Principal Architect)', now() + interval '3 days', 30, 'Optimizing Postgres Connection Pooling in Next.js', '1. Supabase pooler vs direct connection\n2. Prepared statements in server actions', null, null, 'scheduled');
      `);

      await client.query('delete from public.retrospectives;');
      await client.query(`
        insert into public.retrospectives (squad_name, sprint_name, category, content, author_name, votes)
        values
        ('Alpha Squad', 'Sprint 3', 'went_well', 'The automated payslip calculation saved huge manual work!', 'Aarav Sharma', 5),
        ('Alpha Squad', 'Sprint 3', 'went_well', 'Clear code review feedback from Deepak helped catch race conditions early.', 'Priya Patel', 4),
        ('Alpha Squad', 'Sprint 3', 'to_improve', 'Need more unit test fixtures for mock database environments.', 'Rohan Verma', 3),
        ('Alpha Squad', 'Sprint 3', 'action_item', 'Create a shared @/testing-fixtures utility module.', 'Deepak Sharma', 6),
        ('Alpha Squad', 'Sprint 3', 'kudos', 'Kudos to Priya for helping onboard the new interns this week!', 'Aarav Sharma', 8);
      `);
      console.log('Seeded mentorship & retrospectives.');

      // 4. LMS Modules
      await client.query('delete from public.learning_modules;');
      await client.query(`
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

      const { rows: mods } = await client.query('select id from public.learning_modules order by sort_order limit 2;');
      if (mods.length > 0) {
        await client.query('delete from public.intern_learning_progress;');
        await client.query(`
          insert into public.intern_learning_progress (intern_id, module_id, status, progress_percent)
          values
          ('${id1}', '${mods[0].id}', 'in_progress', 65),
          ('${id1}', '${mods[1].id}', 'in_progress', 35),
          ('${id2}', '${mods[0].id}', 'completed', 100);
        `);
      }
      console.log('Seeded learning academy modules & progress.');

      // 5. Webhooks
      await client.query('delete from public.webhook_integrations;');
      await client.query(`
        insert into public.webhook_integrations (platform, name, webhook_url, is_active, events)
        values
        ('slack', 'Slack #internship-announcements', 'https://api.dssoftwares.dev/mock-slack-webhook', true, array['standup_blocker', 'leave_request', 'offer_accepted']),
        ('discord', 'Discord #squad-alerts', 'https://discord.com/api/webhooks/1234567890/abcdefghijklmnopqrstuvwxyz', true, array['certificate_issued', 'standup_blocker']);
      `);

      await client.query('delete from public.notification_logs;');
      await client.query(`
        insert into public.notification_logs (platform, event_type, payload, status, response_status)
        values
        ('discord', 'certificate_issued', '{"recipient": "Aarav Sharma", "code": "VERIFY-DS-AARAV-842", "track": "Full-Stack Web Development"}'::jsonb, 'sent', 200),
        ('slack', 'standup_blocker', '{"intern": "Rohan Verma", "squad": "Alpha Squad", "blocker": "Waiting on AWS IAM credentials"}'::jsonb, 'sent', 200);
      `);
      console.log('Seeded webhooks and notification logs.');
    }
  } catch (e) {
    console.error('Seed error:', e);
  } finally {
    await client.end();
    console.log('Seeding finished.');
  }
}

seed();
