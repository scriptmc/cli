import { build } from "esbuild";
import chokidar from "chokidar";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import inquirer from "inquirer";
import colors from "yoctocolors-cjs";
import { event } from "../event";
import { jsonTS } from "./jsonts";

export async function start(
  type: string,
  nameB: string,
  nameR: string
): Promise<void> {
  const pathMine: string[] = await getFolder(type, nameB, nameR);
  if (pathMine.length <= 0) return;
  if (!type.includes("JsonTS")) {
    const tsFolder: string = fs
      .readFileSync(path.join(__dirname, "../../configs/build.config"), "utf-8")
      .match(/\$tsFolder:.*\$/)![0]
      .replace(/\$tsFolder:\s(.*)\$/, "$1");
    const watcher = chokidar.watch(path.join(pathMine[0], tsFolder), {
      ignoreInitial: true,
    });

    watcher.on("all", (eventFile, pathFile) => {
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
        `${eventFile} ${colors.blue(
          colors.italic(path.basename(pathFile))
        )} file`
      );
    });

    event(
      "sucess",
      `Transpilation enabled (edit ${colors.blue(
        colors.italic(path.join(pathMine[0], tsFolder, "main.ts"))
      )} file)`
    );
  } else jsonTS(pathMine, nameB);
}

async function getFolder(
  type: string,
  nameB: string,
  nameR: string
): Promise<string[]> {
  const pathMine: string = fs
    .readFileSync(path.join(__dirname, "../../configs/path.config"), "utf-8")
    .match(/\$mojang:.*\$/)![0]
    .replace(/\$mojang:\s(.*)\$/, "$1");
  const tsFolder: string = fs
    .readFileSync(path.join(__dirname, "../../configs/build.config"), "utf-8")
    .match(/\$tsFolder:.*\$/)![0]
    .replace(/\$tsFolder:\s(.*)\$/, "$1");
  if (
    !type.includes("JsonTS") &&
    !fs.existsSync(
      path.join(
        os.homedir(),
        pathMine,
        "development_behavior_packs",
        nameB,
        tsFolder,
        "main.ts"
      )
    )
  ) {
    event("error", `Typescript not found: ${nameB}`);
    const { create } = await inquirer.prompt([
      {
        type: "confirm",
        name: "create",
        message: "Do create typescript in this addon?",
      },
    ]);
    if (create) {
      if (
        !fs.existsSync(
          path.join(
            os.homedir(),
            pathMine,
            "development_behavior_packs",
            nameB,
            tsFolder
          )
        )
      )
        fs.mkdirSync(
          path.join(
            os.homedir(),
            pathMine,
            "development_behavior_packs",
            nameB,
            tsFolder
          )
        );
      fs.writeFileSync(
        path.join(
          os.homedir(),
          pathMine,
          "development_behavior_packs",
          nameB,
          tsFolder,
          "main.ts"
        ),
        ""
      );
      event("sucess", `Typescript added for the addon: ${nameB}`);
    }
    return [];
  }
  return [
    path.join(os.homedir(), pathMine, "development_behavior_packs", nameB),
    path.join(os.homedir(), pathMine, "development_resource_packs", nameR),
  ];
}
