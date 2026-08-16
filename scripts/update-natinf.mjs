// Télécharge la dernière liste NATINF officielle (Ministère de la Justice, data.gouv.fr)
// et la convertit en JSON compact embarqué dans l'app pour la recherche offline.
//
// Source : https://www.data.gouv.fr/datasets/liste-des-infractions-en-vigueur-de-la-nomenclature-natinf
// Mise à jour trimestrielle par la Direction des affaires criminelles et des grâces.
//
// Usage : node scripts/update-natinf.mjs

import { writeFileSync } from "node:fs";
import { parse } from "csv-parse/sync";

const DATASET_API =
  "https://www.data.gouv.fr/api/1/datasets/liste-des-infractions-en-vigueur-de-la-nomenclature-natinf/";

async function main() {
  console.log("Recherche de la dernière ressource NATINF sur data.gouv.fr...");
  const datasetRes = await fetch(DATASET_API);
  if (!datasetRes.ok) {
    throw new Error(`Impossible de joindre data.gouv.fr (${datasetRes.status})`);
  }
  const dataset = await datasetRes.json();

  // La liste des infractions (pas le glossaire) est la ressource CSV la plus volumineuse,
  // toujours en tête de liste = la plus récente.
  const resource = dataset.resources.find(
    (r) => r.format === "csv" && !r.title.toLowerCase().includes("glossaire")
  );
  if (!resource) throw new Error("Aucune ressource CSV de liste NATINF trouvée");

  console.log(`Téléchargement de "${resource.title}" (${resource.url})...`);
  const csvRes = await fetch(resource.url);
  if (!csvRes.ok) throw new Error(`Échec du téléchargement (${csvRes.status})`);
  const buffer = await csvRes.arrayBuffer();

  // Le fichier officiel est encodé en ISO-8859-1 (Latin-1).
  const text = new TextDecoder("iso-8859-1").decode(buffer);

  const rows = parse(text, {
    delimiter: ";",
    columns: ["numero", "nature", "qualification", "definiePar", "reprimeePar"],
    from_line: 2,
    relax_quotes: true,
    skip_empty_lines: true,
  });

  const infractions = rows
    .filter((r) => r.numero && r.numero.trim())
    .map((r) => ({
      numero: r.numero.trim(),
      nature: r.nature.trim(),
      qualification: r.qualification.trim(),
      definiePar: r.definiePar.trim(),
      reprimeePar: r.reprimeePar.trim(),
    }));

  const payload = {
    source: resource.url,
    sourceTitle: resource.title,
    generatedAt: new Date().toISOString(),
    count: infractions.length,
    infractions,
  };

  writeFileSync(
    new URL("../public/data/natinf.json", import.meta.url),
    JSON.stringify(payload)
  );

  console.log(`OK — ${infractions.length} infractions écrites dans public/data/natinf.json`);
  console.log(`Source : ${resource.title}`);
}

main().catch((err) => {
  console.error("Échec de la mise à jour NATINF :", err.message);
  process.exit(1);
});
