# Skill Registry — La Vin Nails (web-la-vin-nails-react)

Source of truth: each skill's `SKILL.md` frontmatter. Index maintained by `skill-registry` skill.

## Registry Contract

- Registry is an index, not a compiler. `SKILL.md` files are the source of truth.
- Always pass exact skill paths to sub-agents when delegating.
- Skip `sdd-*`, `_shared` (these are loaded by the orchestrator).
- Deduplicate by skill name, preferring project-level skills over global skills.

## Skills Index

### Project-Level Skills

| name | trigger | description | path |
|------|---------|-------------|------|
| deploy | `/deploy`, "desplegar", "deploy to production" | Ejecuta workflow completo: tests → push → Fly.io | `.agents/skills/deploy/SKILL.md` |
| feature | `/feature`, "nueva feature", "crear feature" | Inicia nueva funcionalidad en rama aislada con SDD | `.agents/skills/feature/SKILL.md` |
| tarea | `/tarea`, "planificar", "nueva tarea" | Workflow de planificación con ahorro de tokens | `.agents/skills/tarea/SKILL.md` |
| spec-first | N/A (internal) | Convención de spec-driven development para SDD | `.agents/skills/spec-first/SKILL.md` |
| accessibility | "improve accessibility", "a11y", "WCAG" | Auditoría y mejora de accesibilidad web | `.agents/skills/accessibility/SKILL.md` |
| backend_expert | N/A (context) | Conocimiento experto Node.js/Express/MongoDB | `.agents/skills/backend_expert/SKILL.md` |
| frontend_expert | N/A (context) | Arquitectura Frontend y patrones React JS puro | `.agents/skills/frontend_expert/SKILL.md` |
| frontend-design | "build web", "crear UI", "styling" | Diseño de interfaces frontend premium | `.agents/skills/frontend-design/SKILL.md` |
| mobile_ux_expert | N/A (context) | Optimización Safari iOS y mobile UX | `.agents/skills/mobile_ux_expert/SKILL.md` |
| nodejs-backend-patterns | N/A (context) | Patrones Node.js backend con Express/Fastify | `.agents/skills/nodejs-backend-patterns/SKILL.md` |
| nodejs-best-practices | N/A (context) | Principios y decisiones Node.js | `.agents/skills/nodejs-best-practices/SKILL.md` |
| pwa_expert | N/A (context) | Progressive Web Apps y service workers | `.agents/skills/pwa_expert/SKILL.md` |
| seo | "improve SEO", "optimize for search" | Optimización para motores de búsqueda | `.agents/skills/seo/SKILL.md` |
| tailwind-css-patterns | N/A (context) | Patrones Tailwind CSS utility-first | `.agents/skills/tailwind-css-patterns/SKILL.md` |
| testing_expert | N/A (context) | Estrategias testing JavaScript MERN | `.agents/skills/testing_expert/SKILL.md` |
| ux-ui-design | N/A (context) | Guía experiencia premium, elegante, minimalista | `.agents/skills/ux-ui-design/SKILL.md` |
| vercel-composition-patterns | N/A (context) | Patrones de composición React que escalan | `.agents/skills/vercel-composition-patterns/SKILL.md` |
| vercel-react-best-practices | N/A (context) | Guías de performance React de Vercel Engineering | `.agents/skills/vercel-react-best-practices/SKILL.md` |

### Global Skills (OpenCode)

| name | trigger | description | path |
|------|---------|-------------|------|
| sdd-apply | (orchestrator) | Implement SDD tasks from specs | `C:/Users/Asus/.config/opencode/skills/sdd-apply/SKILL.md` |
| sdd-archive | (orchestrator) | Archive completed SDD change | `C:/Users/Asus/.config/opencode/skills/sdd-archive/SKILL.md` |
| sdd-design | (orchestrator) | Create SDD technical design | `C:/Users/Asus/.config/opencode/skills/sdd-design/SKILL.md` |
| sdd-explore | (orchestrator) | Investigate codebase and think through ideas | `C:/Users/Asus/.config/opencode/skills/sdd-explore/SKILL.md` |
| sdd-init | (orchestrator) | Bootstrap SDD context | `C:/Users/Asus/.config/opencode/skills/sdd-init/SKILL.md` |
| sdd-onboard | (orchestrator) | Guide through SDD cycle | `C:/Users/Asus/.config/opencode/skills/sdd-onboard/SKILL.md` |
| sdd-propose | (orchestrator) | Create SDD change proposals | `C:/Users/Asus/.config/opencode/skills/sdd-propose/SKILL.md` |
| sdd-spec | (orchestrator) | Write SDD delta specs | `C:/Users/Asus/.config/opencode/skills/sdd-spec/SKILL.md` |
| sdd-tasks | (orchestrator) | Break SDD change into tasks | `C:/Users/Asus/.config/opencode/skills/sdd-tasks/SKILL.md` |
| sdd-verify | (orchestrator) | Validate implementation against specs | `C:/Users/Asus/.config/opencode/skills/sdd-verify/SKILL.md` |
| skill-registry | (system) | Index and maintain skill registry | `C:/Users/Asus/.config/opencode/skills/skill-registry/SKILL.md` |
| branch-pr | "create PR", "open PR" | Create Gentle AI pull requests | `C:/Users/Asus/.config/opencode/skills/branch-pr/SKILL.md` |
| chained-pr | "split PR", "stacked PRs" | Split oversized PRs into chained PRs | `C:/Users/Asus/.config/opencode/skills/chained-pr/SKILL.md` |
| comment-writer | "write comment", "feedback" | Warm collaboration comments | `C:/Users/Asus/.config/opencode/skills/comment-writer/SKILL.md` |
| judgment-day | "dual review", "adversarial review" | Blind dual review process | `C:/Users/Asus/.config/opencode/skills/judgment-day/SKILL.md` |
| work-unit-commits | "plan commits", "commit splitting" | Plan commits as reviewable units | `C:/Users/Asus/.config/opencode/skills/work-unit-commits/SKILL.md` |
| issue-creation | "create issue", "bug report" | Create Gentle AI issues | `C:/Users/Asus/.config/opencode/skills/issue-creation/SKILL.md` |
| skill-creator | "new skill", "create skill" | Create LLM-first skills | `C:/Users/Asus/.config/opencode/skills/skill-creator/SKILL.md` |
| skill-improver | "improve skill", "audit skill" | Audit and upgrade skills | `C:/Users/Asus/.config/opencode/skills/skill-improver/SKILL.md` |

## Workflows

Workflows live in `.agents/workflows/` and are invoked by name. They are NOT skills (no SKILL.md), just markdown files.

| name | file | description |
|------|------|-------------|
| deploy | `.agents/workflows/deploy.md` | Test → push → Fly.io |
| feature | `.agents/workflows/feature.md` | Feature development in isolated branch |
| tarea | `.agents/workflows/tarea.md` | Planning with model switching |
| documentar | `.agents/workflows/documentar.md` | Document project from codebase |
| no-deploy | `.agents/workflows/no-deploy.md` | Safety gates before production deploy |

## Statistics

- Project skills: 19
- Global skills: 20
- Workflows: 5
- Last updated: 2026-05-30 (verified by sdd-init)