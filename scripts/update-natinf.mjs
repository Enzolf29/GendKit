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

// L'encodage du fichier officiel change selon les éditions : Latin-1 (avril 2026),
// CP850 (juillet 2026), peut-être UTF-8 un jour. On le détecte plutôt que de le
// supposer : un mauvais choix transforme « Délit » en « D‚lit » et casse les filtres.
const CP850_HIGH =
  "ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜø£Ø×ƒáíóúñÑªº¿®¬½¼¡«»░▒▓│┤ÁÂÀ©╣║╗╝¢¥┐└┴┬├─┼ãÃ╚╔╩╦╠═╬¤" +
  "ðÐÊËÈıÍÎÏ┘┌█▄¦Ì▀ÓßÔÒõÕµþÞÚÛÙýÝ¯´­±‗¾¶§÷¸°¨·¹³²■ ";

function decodeCp850(bytes) {
  let out = "";
  for (const b of bytes) {
    if (b < 0x80) out += String.fromCharCode(b);
    // Le ministère exporte « Œ » en 0xA8 (« ¿ » en CP850) ; les éditions précédentes
    // l'écrivaient « OE » (« OEUVRE »), on garde cette convention pour la recherche.
    else if (b === 0xa8) out += "OE";
    else out += CP850_HIGH[b - 0x80];
  }
  return out;
}

function decodeCsv(bytes) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    // pas de l'UTF-8 valide : on départage Latin-1 / CP850
  }
  // Dans « Délit », « é » vaut 0x82 en CP850 mais 0xE9 en Latin-1.
  const count = (v) => bytes.reduce((n, b) => n + (b === v ? 1 : 0), 0);
  const latin1Score = count(0xe9);
  const cp850Score = count(0x82);
  if (cp850Score > latin1Score) {
    console.log("Encodage détecté : CP850");
    return decodeCp850(bytes);
  }
  console.log("Encodage détecté : ISO-8859-1");
  return new TextDecoder("iso-8859-1").decode(bytes);
}

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

  const text = decodeCsv(new Uint8Array(buffer));

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
