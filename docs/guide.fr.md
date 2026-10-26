## À quoi ça sert

`npm outdated` liste les dépendances en retard, mais sans hiérarchie : un correctif et un saut de version majeure se ressemblent. Ce script trie par gravité (majeurs d'abord) et produit un tableau lisible, utile pour décider quoi mettre à jour cette semaine.

## Avant de commencer

- Node.js et npm, et un projet avec un `package.json` (dépendances installées).

## Pas à pas

1. Lancez directement l'analyse dans le dossier du projet :
   ```bash
   node src/deps-outdated.mjs --run
   ```
   ou travaillez sur une sortie enregistrée : `npm outdated --json > outdated.json`, puis `node src/deps-outdated.mjs outdated.json`.
2. Commencez par les retards **majeurs** : ils peuvent casser votre code, lisez les notes de version.
3. Traitez ensuite les mineurs et correctifs, souvent sans risque, par lots.

## Lire le résultat

Chaque ligne donne la version installée, la version « souhaitée » (permise par votre `package.json`) et la dernière publiée. Le retard est classé `major`, `minor` ou `patch`.

## L'automatiser

Avec `--max-major 0`, le code de sortie vaut 2 dès qu'un retard majeur existe : une CI hebdomadaire peut alerter l'équipe.

```yaml
- run: node src/deps-outdated.mjs --run --max-major 3
```

## Pièges à éviter

- Un retard majeur n'est pas forcément urgent ; une faille de sécurité, si : utilisez aussi `npm audit`.
- Le script ne modifie rien dans votre projet.
