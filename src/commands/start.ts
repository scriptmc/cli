import { build } from "esbuild";
import chokidar from "chokidar";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import inquirer from "inquirer";
import colors from "yoctocolors-cjs";
import { event } from "../event";
import { jsonTS } from "./jsonts";

export async function start(nameB: string, nameR: string): Promise<void> {
  const pathMine: string[] = await getFolder(nameB, nameR);
  if (pathMine.length <= 0) return;
  const tsFolder: string = fs
    .readFileSync(path.join(__dirname, "../../configs/build.config"), "utf-8")
    .match(/\$tsFolder:.*\$/)![0]
    .replace(/\$tsFolder:\s(.*)\$/, "$1");
  const watcher = chokidar.watch(path.join(pathMine[0]), {
    ignoreInitial: true,
  });

  watcher.on("change", (pathFile) => {
    if (pathFile.endsWith(`jsonTS\\${path.basename(pathFile)}`)) {
      jsonTS(pathMine, nameB, pathFile);
    } else if (pathFile.endsWith(`${tsFolder}\\${path.basename(pathFile)}`)) {
      build({
        entryPoints: [path.join(pathMine[0], `${tsFolder}/**/*.ts`)],
        outdir: path.join(pathMine[0], "scripts"),
        platform: "node",
        target: "esnext",
        format: "esm",
      }).catch(() => {
        return;
      });
      console.clear();
      event(
        "sucess",
        `change ${colors.blue(colors.italic(path.basename(pathFile)))} file`
      );
    } else return;
  });

  event("sucess", "Edit file...");
}

async function getFolder(nameB: string, nameR: string): Promise<string[]> {
  const pathMine: string = fs
    .readFileSync(path.join(__dirname, "../../configs/path.config"), "utf-8")
    .match(/\$mojang:.*\$/)![0]
    .replace(/\$mojang:\s(.*)\$/, "$1");
  return [
    path.join(os.homedir(), pathMine, "development_behavior_packs", nameB),
    path.join(
      os.homedir(),
      pathMine,
      "development_resource_packs",
      nameR || ""
    ),
  ];
}
