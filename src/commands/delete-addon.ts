import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { event } from "../event";

export function delete_addon(nameB: string, nameR: string): void {
  const pathMine: string[] = getFolder(nameB, nameR);
  if (pathMine.length <= 0) return;
  fs.rmSync(pathMine[0], {
    recursive: true,
    force: true,
  });
  fs.rmSync(pathMine[1], {
    recursive: true,
    force: true,
  });
  event("sucess", "Addon deleted sucessfully.");
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
