import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export function open(nameB: string, nameR: string): void {
  const pathMine: string[] = getFolder(nameB, nameR);
  execSync(`code "${pathMine[0]}" "${pathMine[1]}"`);
}

function getFolder(nameB: string, nameR: string): string[] {
  const pathMine: string = fs
    .readFileSync(path.join(__dirname, "../../configs/path.config"), "utf-8")
    .match(/\$mojang:.*\$/)![0]
    .replace(/\$mojang:\s(.*)\$/, "$1");
  return [
    path.join(os.homedir(), pathMine, "development_behavior_packs", nameB),
    path.join(os.homedir(), pathMine, "development_resource_packs", nameR),
  ];
}
