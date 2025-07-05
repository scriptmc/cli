import { build } from "esbuild";
import chokidar from "chokidar";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import inquirer from "inquirer";
import colors from "yoctocolors-cjs";
import { event } from "../event";
import { execFileSync } from "node:child_process";

export async function start(type: string, name: string): Promise<void> {
  const pathMine: string = await getFolder(type, name);
  if (!pathMine) return;
  if (!type.includes("JsonTS")) {
    const tsFolder: string = fs
      .readFileSync(path.join(__dirname, "../../configs/build.config"), "utf-8")
      .match(/\$tsFolder:.*\$/)![0]
      .replace(/\$tsFolder:\s(.*)\$/, "$1");
    const watcher = chokidar.watch(path.join(pathMine, tsFolder), {
      ignoreInitial: true,
    });

    watcher.on("all", (eventFile, pathFile) => {
      build({
        entryPoints: [path.join(pathMine, `${tsFolder}/**/*.ts`)],
        outdir: path.join(pathMine, "scripts"),
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
        colors.italic(path.join(pathMine, tsFolder, "main.ts"))
      )} file)`
    );
  } else {
    if (
      !fs.existsSync(path.join(pathMine, "jsonTS")) ||
      !fs.existsSync(path.join(pathMine, "node_modules", "@scriptmc/jsonts"))
    )
      event("error", `JsonTS not found: ${name}`);
    function readDir(pathDir: string) {
      const watcher = chokidar.watch(pathDir, {
        ignoreInitial: true,
      });
      watcher.on("change", async (pathFile) => {
        let js: boolean = false;
        if (
          path.basename(pathFile).endsWith(".item.ts") ||
          path.basename(pathFile).endsWith(".block.ts") ||
          path.basename(pathFile).endsWith(".entity.ts")
        ) {
          await build({
            entryPoints: [pathFile],
            outfile: path.join(
              pathDir,
              path.basename(pathFile).replace(".ts", ".js")
            ),
            platform: "node",
            target: "esnext",
            format: "esm",
          }).catch(() => {
            return;
          });
          js = true;
        }
        try {
          execFileSync("node", [
            path.join(pathDir, path.basename(pathFile).replace(".ts", ".js")),
          ]);
        } catch (err) {
          if (js)
            fs.rmSync(
              path.join(pathDir, path.basename(pathFile).replace(".ts", ".js")),
              {
                force: true,
                recursive: true,
              }
            );
          return;
        }
        if (
          fs.existsSync(
            path.join(
              pathMine,
              "node_modules",
              "@scriptmc/jsonts",
              `${
                path
                  .basename(pathFile)
                  .match(/^.*\.(item|block|entity)\..*$/)![1]
              }.json`
            )
          )
        ) {
          const code: string = fs.readFileSync(
            path.join(
              pathMine,
              "node_modules",
              "@scriptmc/jsonts",
              `${
                path
                  .basename(pathFile)
                  .match(/^.*\.(item|block|entity)\..*$/)![1]
              }.json`
            ),
            "utf-8"
          );
          if (path.basename(pathFile).includes("item")) {
            if (!fs.existsSync(path.join(pathMine, "items")))
              fs.mkdirSync(path.join(pathMine, "items"));
            fs.writeFileSync(
              path.join(
                pathMine,
                "items",
                `${path.basename(pathFile).match(/^([^\.]+)\..*$/)![1]}.json`
              ),
              code
            );
          } else if (path.basename(pathFile).includes("block")) {
            if (!fs.existsSync(path.join(pathMine, "blocks")))
              fs.mkdirSync(path.join(pathMine, "blocks"));
            fs.writeFileSync(
              path.join(
                pathMine,
                "blocks",
                `${path.basename(pathFile).match(/^([^\.]+)\..*$/)![1]}.json`
              ),
              code
            );
          } else {
            if (!fs.existsSync(path.join(pathMine, "entities")))
              fs.mkdirSync(path.join(pathMine, "entities"));
            fs.writeFileSync(
              path.join(
                pathMine,
                "entities",
                `${path.basename(pathFile).match(/^([^\.]+)\..*$/)![1]}.json`
              ),
              code
            );
          }
          fs.rmSync(
            path.join(
              pathMine,
              "node_modules",
              "@scriptmc/jsonts",
              `${
                path
                  .basename(pathFile)
                  .match(/^.*\.(item|block|entity)\..*$/)![1]
              }.json`
            ),
            { force: true, recursive: true }
          );
          console.clear();
          event(
            "sucess",
            `change ${colors.blue(colors.italic(path.basename(pathFile)))} file`
          );
        }
        if (js)
          fs.rmSync(
            path.join(pathDir, path.basename(pathFile).replace(".ts", ".js")),
            {
              force: true,
              recursive: true,
            }
          );
      });
      event("sucess", "Transpilation enabled");
    }
    readDir(path.join(pathMine, "jsonTS"));
  }
}

async function getFolder(type: string, name: string): Promise<string> {
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
        name,
        tsFolder,
        "main.ts"
      )
    )
  ) {
    event("error", `Typescript not found: ${name}`);
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
            name,
            tsFolder
          )
        )
      )
        fs.mkdirSync(
          path.join(
            os.homedir(),
            pathMine,
            "development_behavior_packs",
            name,
            tsFolder
          )
        );
      fs.writeFileSync(
        path.join(
          os.homedir(),
          pathMine,
          "development_behavior_packs",
          name,
          tsFolder,
          "main.ts"
        ),
        ""
      );
      event("sucess", `Typescript added for the addon: ${name}`);
    }
    return "";
  }
  return path.join(os.homedir(), pathMine, "development_behavior_packs", name);
}
