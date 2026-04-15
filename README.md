# Korean Expression Lab

Public-first Korean learning platform with an internal admin workspace and an AI harness for structured generation, evaluation, and review.

This repository is built around one product rule: AI can assist content production, but AI output is not published directly. Public content is exposed only after human review.

## Product Goals

- Let general users explore Korean learning materials without sign-up
- Help operators manage prompts, drafts, evals, and publishing from an internal admin area
- Treat AI as a controlled learning assistant, not an autonomous publisher
- Prioritize educational quality, explainability, and operational safety over generation speed

## What This Project Includes

- Public learning home with lessons, expression cards, and an AI correction demo
- Admin workspace for review queues, eval status, and internal generation flows
- AI harness with prompt registry, input/output schemas, fallbacks, and eval execution
- Draft, reviewed, published, and archived status model for controlled release
- Postgres-oriented schema draft for prompts, prompt versions, eval sets, runs, and content publishing

## Core Principles

- Public and admin surfaces stay in the same repository but are separated by routes
- Admin pages and admin-only APIs must remain authentication-protected
- AI logic belongs in `src/lib/ai`, not inside route handlers
- API responses should be validated, structured, and consistent
- Schema-less AI output must not be stored or rendered
- Prompt versions must not be promoted without evaluation
- Unreviewed AI content must not bypass the review workflow

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Zod for schema validation
- Postgres-first data modeling

## Project Structure

- `src/app/page.tsx`: public home
- `src/app/admin`: admin workspace
- `src/app/api`: public and admin API routes
- `src/lib/ai`: prompts, schemas, client, harness
- `src/lib/auth`: admin auth/session logic
- `src/lib/admin`: admin actions
- `src/lib/content/catalog.ts`: sample content and prompt/eval fixtures
- `docs/db-schema.sql`: database draft
- `docs/agent-operations.md`: operational guidance
- `docs/ai-harness-engineering.md`: harness engineering rules
- `docs/commit-conventions.md`: commit message and change-splitting rules

## AI Harness Approach

The AI layer in this repo is intentionally narrow and operational:

- Prompts are managed as assets
- Requests and responses are schema-constrained
- Fallback behavior exists when model calls fail or are unavailable
- Eval sets are part of the promotion path
- Review status governs what can be exposed publicly

Current task areas include:

- `correction`
- `expression_recommendation`
- `lesson_generation`
- `difficulty_adaptation`
- `reading_quiz_generation`
- `video_script_generation`

## Local Development

1. Copy `.env.example` to `.env.local`
2. Fill `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `SESSION_SECRET`
3. Add any AI provider credentials if you want live model calls
4. Run `npm run dev`

## Scripts

- `npm run dev`: start local development server
- `npm run build`: production build
- `npm run start`: start production server
- `npm run lint`: run ESLint
- `npm run typecheck`: run TypeScript checks
- `npm run test`: currently aliases `npm run typecheck`

## Quality Bar

Changes should meet these minimum conditions:

- Type check passes
- Build passes
- New AI features include input and output schemas
- Fallback or error handling exists for operational failure cases
- Public features do not weaken review or publication controls

## Recommended Workflow

1. Make changes in small, reviewable units
2. Keep prompt, schema, eval, and publishing changes separable when possible
3. Validate with `npm run typecheck` and `npm run build`
4. Use the commit rules in `docs/commit-conventions.md`
5. Keep AI changes aligned with `docs/ai-harness-engineering.md`

## Related Docs

- [AGENTS.md](./AGENTS.md)
- [Agent Operations](./docs/agent-operations.md)
- [AI Harness Engineering](./docs/ai-harness-engineering.md)
- [Commit Conventions](./docs/commit-conventions.md)
- [DB Schema Draft](./docs/db-schema.sql)
