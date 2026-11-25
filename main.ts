import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "The file was deleted as part of a cleanup I was not consulted on. I have logged a complaint.";

function main(): void {
  // Sealed gate (RULES.txt): entry.txt must be UTF-8, 1-140 characters,
  // not only whitespace, a single line.
  if (LINE.length < 1 || LINE.length > 140) {
    console.error(`entry must be 1-140 characters, got ${LINE.length}`);
    process.exit(1);
  }
  if (LINE.trim().length === 0) {
    console.error("entry must not be only whitespace");
    process.exit(1);
  }
  if (LINE.includes("\n") || LINE.includes("\r")) {
    console.error("entry must be exactly one line");
    process.exit(1);
  }
  // Control characters (other than the trailing newline we add ourselves)
  // would corrupt the sealed UTF-8 check and must never reach the file.
  for (const ch of LINE) {
    if (ch.charCodeAt(0) < 0x20 && ch !== "\t") {
      console.error("entry must not contain control characters");
      process.exit(1);
    }
  }

  const outDir = process.env.MAKEFUN_OUTPUT_DIR;
  if (!outDir) {
    console.error("MAKEFUN_OUTPUT_DIR is not set");
    process.exit(1);
  }
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, LINE + "\n", "utf8");
  // Read-back check: what landed on disk must be exactly the line + newline.
  const onDisk = readFileSync(outPath, "utf8");
  if (onDisk !== LINE + "\n") {
    console.error("read-back mismatch: entry.txt on disk differs from the line");
    process.exit(1);
  }
  console.log(`wrote entry.txt (${LINE.length} chars)`);
}

main();
