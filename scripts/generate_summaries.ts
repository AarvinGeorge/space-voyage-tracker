/**
 * generate_summaries.ts — build-time LLM mission summaries (Anthropic Claude SDK).
 *
 * Generates a ~250-word, three-paragraph summary per mission and writes
 * src/data/missions/summaries/<slug>.md (with frontmatter). BUILD TIME ONLY —
 * reads ANTHROPIC_API_KEY from code/.env (never committed, never on Vercel).
 * The committed .md files are what the app ships; zero runtime LLM calls.
 *
 * Run: npm run generate:summaries
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import 'dotenv/config'
import Anthropic from '@anthropic-ai/sdk'
import { MISSIONS } from '../src/data/missions'
import type { Mission } from '../src/data/types'
import { resolveStatus } from '../src/lib/resolveStatus'

const MODEL = 'claude-sonnet-4-6'
const PROMPT_VERSION = 1
const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = resolve(__dirname, '../src/data/missions/summaries')

function buildPrompt(m: Mission): string {
  const notable = m.keyFacts.find((f) => f.label === 'NOTABLE')?.value ?? m.keyFacts.map((f) => f.value).join('; ')
  return `You are writing a 250-word summary of a space mission for a premium technical
showcase application. The summary will appear in a floating card overlay next
to a 3D rendering of the mission's trajectory.

Requirements:
- Exactly three paragraphs.
- Approximately 250 words total (240-270 acceptable).
- Plain prose. No markdown, no bullet points, no headings.
- Do not use em-dashes (—). Use commas, periods, or "and"/"but" instead.
- Open with what makes the mission significant.
- Tell what happened: launch, key events, outcome.
- Name the people, hardware, and the historical context that gave the mission character.
- End with the legacy or what the mission unlocked for what came after.
- Tone: confident, factual, lightly literary. Match the voice of a great science museum exhibit, not Wikipedia.

Mission: ${m.name}
Agency: ${m.agency}
Country: ${m.country}
Launch date: ${m.launchDate}
Destination: ${m.destination}
Crewed: ${m.crewed ? 'yes' : 'no'}
Outcome: ${resolveStatus(m)}
Notable: ${notable}

Write the 250-word summary now.`
}

function qualityIssues(text: string): string | null {
  const words = text.trim().split(/\s+/).length
  if (words < 220 || words > 280) return `word count ${words}`
  if (/[#*]|^\s*[-•]/m.test(text)) return 'contains markdown'
  if (/wikipedia/i.test(text)) return 'mentions a source'
  if (/—/.test(text)) return 'contains em-dash'
  return null
}

async function generate(client: Anthropic, m: Mission): Promise<string> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 700,
      messages: [{ role: 'user', content: buildPrompt(m) }],
    })
    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim()
    const issue = qualityIssues(text)
    if (!issue) {
      if (attempt > 1) console.log(`    (accepted on attempt ${attempt})`)
      return text
    }
    console.log(`    retry ${attempt}: ${issue}`)
  }
  throw new Error(`could not produce a clean summary for ${m.id} after 3 attempts`)
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'PASTE_YOUR_KEY_HERE') {
    console.error('✗ ANTHROPIC_API_KEY not set in code/.env')
    process.exit(1)
  }
  mkdirSync(OUT_DIR, { recursive: true })
  const client = new Anthropic({ apiKey })
  const force = process.env.FORCE === '1'
  const generatedAt = new Date().toISOString()

  console.log(`Generating ${MISSIONS.length} summaries (${MODEL})…`)
  for (const m of MISSIONS) {
    const outPath = resolve(OUT_DIR, `${m.id}.md`)
    if (existsSync(outPath) && !force) {
      console.log(`  ${m.id.padEnd(22)} skip (exists)`)
      continue
    }
    process.stdout.write(`  ${m.id.padEnd(22)} …`)
    const body = await generate(client, m)
    const frontmatter = `---\ngenerated_at: ${generatedAt}\nmodel: ${MODEL}\nprompt_version: ${PROMPT_VERSION}\n---\n\n`
    writeFileSync(outPath, frontmatter + body + '\n')
    console.log(` ${body.split(/\s+/).length} words`)
  }
  console.log('✓ summaries written. Commit src/data/missions/summaries/.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
