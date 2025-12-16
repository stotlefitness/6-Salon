You are an expert on this codebase and Cursor Rules.
Task:
Analyze this repository and create a single new Cursor Rules file that teaches future agents
how to work in THIS project without confusion.
Instructions:
- Look at the tech stack, file structure, and existing patterns in this repo.
- Infer the main technologies in use (e.g., Next.js, React, Tailwind, Convex/Supabase, testing,
etc.).
- Summarize conventions and decision rules, NOT generic documentation.
- Focus on:
 - How we structure files and folders
 - How we style UI (Tailwind or otherwise)
 - How we do data access (e.g., Convex, Supabase, API routes)
 - How we handle auth, errors, and side effects
 - Patterns to prefer, and patterns to avoid
Output format:
- Return ONLY a valid Cursor Rules file in markdown, suitable to save as
`.cursor/rules/<something>.mdc`.
- Include:
 - A clear title at the top (`# Project Rules`)
 - Short sections with bullet points
 - Concrete do this / don t do this guidance
 - No code fences, no extra commentary
Style:
- Be concise and opinionated.
- Assume this file will be attached to every future AI request in this repo.
- Do NOT paste large chunks of external docs. If a tool is in use (e.g., Tailwind v4.1),
briefly explain how it s used HERE and any important version gotchas.