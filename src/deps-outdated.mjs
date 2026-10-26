#!/usr/bin/env node
/* Rapport lisible des dépendances en retard, à partir de `npm outdated --json` : les retards majeurs d'abord. */
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { isMain, parseArgs, usage, fail } from '../lib/cli.mjs'

const parts = (v) => String(v ?? '').replace(/^[^\d]*/, '').split(/[.+-]/).slice(0, 3).map((n) => Number.parseInt(n, 10) || 0)

/** Écart entre deux versions : 'major' | 'minor' | 'patch' | 'none'. */
export function gap(current, latest) {
  const [a, b] = [parts(current), parts(latest)]
  if (b[0] > a[0]) return 'major'
  if (b[0] === a[0] && b[1] > a[1]) return 'minor'
  if (b[0] === a[0] && b[1] === a[1] && b[2] > a[2]) return 'patch'
  return 'none'
}

const ORDER = { major: 0, minor: 1, patch: 2 }

export function analyse(outdatedJson) {
  const rows = Object.entries(outdatedJson ?? {}).map(([name, v]) => {
    const info = Array.isArray(v) ? v[v.length - 1] : v
    return { name, current: info.current ?? '(non installé)', wanted: info.wanted ?? '', latest: info.latest ?? '', type: info.current ? gap(info.current, info.latest) : 'major' }
  }).filter((r) => r.type !== 'none')
  rows.sort((a, b) => ORDER[a.type] - ORDER[b.type] || a.name.localeCompare(b.name))
  return { rows, counts: { major: rows.filter((r) => r.type === 'major').length, minor: rows.filter((r) => r.type === 'minor').length, patch: rows.filter((r) => r.type === 'patch').length } }
}

export function toMarkdown({ rows, counts }) {
  if (!rows.length) return '✓ Toutes les dépendances sont à jour.\n'
  return [`**${rows.length} dépendance(s) en retard** — ${counts.major} majeur(s), ${counts.minor} mineur(s), ${counts.patch} correctif(s)`, '',
    '| Paquet | Installée | Souhaitée | Dernière | Retard |', '|---|---|---|---|---|',
    ...rows.map((r) => `| ${r.name} | ${r.current} | ${r.wanted} | ${r.latest} | ${r.type} |`), ''].join('\n')
}

if (isMain(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2), ['help', 'run', 'json'])
  usage(`
Usage : node src/deps-outdated.mjs --run [--max-major 0]          (lance « npm outdated --json » dans le dossier courant)
        node src/deps-outdated.mjs sortie.json [--max-major 0]    (lit une sortie déjà enregistrée)
Code de sortie 2 si le nombre de retards majeurs dépasse --max-major (défaut : pas de limite).`, { ...args, _: args.run ? ['x'] : args._ }, 1)
  let data
  try {
    if (args.run) {
      try { data = JSON.parse(execFileSync('npm', ['outdated', '--json'], { encoding: 'utf8' }) || '{}') }
      catch (e) { data = JSON.parse(e.stdout?.toString() || '{}') } // npm outdated sort en code 1 quand il y a des retards
    } else data = JSON.parse(readFileSync(args._[0], 'utf8'))
  } catch (e) { fail(`lecture impossible : ${e.message}`) }
  const result = analyse(data)
  process.stdout.write(args.json ? JSON.stringify(result, null, 2) + '\n' : toMarkdown(result))
  process.exit(args['max-major'] !== undefined && result.counts.major > Number(args['max-major']) ? 2 : 0)
}
