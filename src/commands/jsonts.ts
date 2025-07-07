import { event } from "../event";
import fs from "node:fs";
import path from "node:path";
import { build } from "esbuild";
import chokidar from "chokidar";
import { execFileSync } from "node:child_process";
import colors from "yoctocolors-cjs";

export function jsonTS(pathMine: string[], nameB: string) {
  if (
    !fs.existsSync(path.join(pathMine[0], "jsonTS")) ||
    !fs.existsSync(path.join(pathMine[0], "node_modules", "@scriptmc/jsonts"))
  )
    event("error", `JsonTS not found: ${nameB}`);
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
        fs.rmSync(
          path.join(pathDir, path.basename(pathFile).replace(".ts", ".js")),
          {
            force: true,
            recursive: true,
          }
        );
        return;
      }
      fs.readdirSync(
        path.join(
          pathMine[0],
          "node_modules",
          "@scriptmc/jsonts",
          "executes",
          "beh"
        )
      ).forEach((dir) => {
        fs.cpSync(
          path.join(
            pathMine[0],
            "node_modules",
            "@scriptmc/jsonts",
            "executes",
            "beh",
            dir
          ),
          path.join(pathMine[0], dir),
          {
            force: true,
            recursive: true,
          }
        );
        fs.rmSync(
          path.join(
            pathMine[0],
            "node_modules",
            "@scriptmc/jsonts",
            "executes",
            "beh",
            dir
          ),
          {
            force: true,
            recursive: true,
          }
        );
      });
      fs.readdirSync(
        path.join(
          pathMine[0],
          "node_modules",
          "@scriptmc/jsonts",
          "executes",
          "reh"
        )
      ).forEach((dir) => {
        fs.cpSync(
          path.join(
            pathMine[0],
            "node_modules",
            "@scriptmc/jsonts",
            "executes",
            "reh",
            dir
          ),
          path.join(pathMine[1], dir),
          {
            force: true,
            recursive: true,
          }
        );
        fs.rmSync(
          path.join(
            pathMine[0],
            "node_modules",
            "@scriptmc/jsonts",
            "executes",
            "reh",
            dir
          ),
          {
            force: true,
            recursive: true,
          }
        );
      });
      const texture_data: {
        [key: string]: string[];
      } = {};
      fs.readdirSync(
        path.join(pathMine[0], "node_modules", "@scriptmc/jsonts", "executes")
      ).forEach((file) => {
        if (!path.extname(file)) return;
        const code = JSON.parse(
          fs.readFileSync(
            path.join(
              pathMine[0],
              "node_modules",
              "@scriptmc/jsonts",
              "executes",
              file
            ),
            "utf-8"
          )
        );
        if (file.endsWith(".item_texture.json")) {
          if (!Object.keys(texture_data).includes("textures/item_texture"))
            texture_data["textures/item_texture"] = [];
          texture_data["textures/item_texture"].push(code.texture_data);
          if (!fs.existsSync(path.join(pathMine[1], "textures")))
            fs.mkdirSync(path.join(pathMine[1], "textures"));
        } else if (file.endsWith(".terrain_texture.json")) {
          if (!Object.keys(texture_data).includes("textures/terrain_texture"))
            texture_data["textures/terrain_texture"] = [];
          texture_data["textures/terrain_texture"].push(code.texture_data);
          if (!fs.existsSync(path.join(pathMine[1], "textures")))
            fs.mkdirSync(path.join(pathMine[1], "textures"));
        } else {
          if (!Object.keys(texture_data).includes("blocks"))
            texture_data["blocks"] = [];
          texture_data.blocks.push(code.texture_data);
        }
        fs.rmSync(
          path.join(
            pathMine[0],
            "node_modules",
            "@scriptmc/jsonts",
            "executes",
            file
          ),
          {
            force: true,
            recursive: true,
          }
        );
      });
      Object.keys(texture_data).forEach((value) => {
        if (fs.existsSync(path.join(pathMine[1], value))) {
          let code = JSON.parse(
            fs.readFileSync(path.join(pathMine[1], value), "utf-8")
          );
          if (value === "blocks") {
            code = {
              ...code,
              ...texture_data[value],
            };
          } else {
            code.texture_data = {
              ...code.texture_data,
              ...texture_data[value],
            };
          }
          fs.writeFileSync(
            path.join(pathMine[1], `${value}.json`),
            JSON.stringify(code)
          );
        } else {
          let code: object = {};
          if (value === "textures/item_texture") {
            code = {
              resource_pack_name: "@scriptmc",
              texture_name: "atlas.items",
              texture_data: {},
            };
            texture_data[value].forEach((texture) => {
              // @ts-expect-error
              code.texture_data = {
                // @ts-expect-error
                ...code.texture_data,
                // @ts-expect-error
                ...texture,
              };
            });
          } else if (value === "textures/terrain_texture") {
            code = {
              resource_pack_name: "@scriptmc",
              texture_name: "atlas.terrain",
              texture_data: {},
            };
            texture_data[value].forEach((texture) => {
              // @ts-expect-error
              code.texture_data = {
                // @ts-expect-error
                ...code.texture_data,
                // @ts-expect-error
                ...texture,
              };
            });
          } else {
            texture_data[value].forEach((texture) => {
              code = {
                ...code,
                // @ts-expect-error
                ...texture,
              };
            });
          }
          fs.writeFileSync(
            path.join(pathMine[1], `${value}.json`),
            JSON.stringify(code)
          );
        }
      });
      if (js)
        fs.rmSync(
          path.join(pathDir, path.basename(pathFile).replace(".ts", ".js")),
          {
            force: true,
            recursive: true,
          }
        );
      console.clear();
      event(
        "sucess",
        `change ${colors.blue(colors.italic(path.basename(pathFile)))} file`
      );
    });
    event("sucess", "Transpilation enabled");
  }
  readDir(path.join(pathMine[0], "jsonTS"));
}
