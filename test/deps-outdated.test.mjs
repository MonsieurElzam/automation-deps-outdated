import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const sample = (n) => readFileSync(new URL(`../samples/${n}`, import.meta.url), 'utf8')
const mod = (n) => import(`../src/${n}.mjs`)
const run = (n, args = []) => spawnSync(process.execPath, [fileURLToPath(new URL(`../src/${n}.mjs`, import.meta.url)), ...args], { encoding: 'utf8' })
const samplePath = (n) => fileURLToPath(new URL(`../samples/${n}`, import.meta.url))

test('18 dépendances : écarts majeur/mineur/correctif, tri, format tableau npm', async () => {
  const { gap, analyse, toMarkdown } = await mod('deps-outdated')
  assert.equal(gap('14.2.3', '16.2.4'), 'major'); assert.equal(gap('3.22.0', '3.25.1'), 'minor'); assert.equal(gap('4.17.20', '4.17.21'), 'patch'); assert.equal(gap('2.0.0', '2.0.0'), 'none'); assert.equal(gap('^1.2.3', '1.2.3'), 'none')
  const a = analyse(JSON.parse(sample('outdated.json')))
  assert.deepEqual(a.counts, { major: 2, minor: 1, patch: 1 }); assert.deepEqual(a.rows.map((r) => r.name), ['next', 'react', 'zod', 'lodash'])
  assert.match(toMarkdown(a), /4 dépendance\(s\) en retard\*\* — 2 majeur/)
  assert.equal(analyse({ x: [{ current: '1.0.0', wanted: '1.0.0', latest: '2.0.0' }] }).rows[0].type, 'major')
  assert.match(toMarkdown(analyse({})), /à jour/)
  assert.equal(run('deps-outdated', [samplePath('outdated.json'), '--max-major', '1']).status, 2)
  assert.equal(run('deps-outdated', [samplePath('outdated.json'), '--max-major', '2']).status, 0)
})
