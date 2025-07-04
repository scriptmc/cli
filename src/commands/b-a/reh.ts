import fs from "node:fs";
import path from "node:path";

export function Reh(pathMine: string, name: string) {
  const reh: string[] = [
    "manifest.json",
    "animation_controllers",
    "animations",
    "attachables",
    "block_culling",
    "entity",
    "fogs",
    "items",
    "materials",
    "models",
    "particles",
    "render_controllers",
    "sounds",
    "texts",
    "textures",
    "ui",
    "blocks.json",
    "manifest.json",
    "pack_icon.png",
    "sounds.json",
  ];
  const buildOption: string = fs
    .readFileSync(
      path.join(__dirname, "../../../configs/build.config"),
      "utf-8"
    )
    .match(/\$buildType:.*\$/)![0]
    .replace(/\$buildType:\s(.*)\$/, "$1");
  if (buildOption === "only essential") {
    reh.forEach((item) => {
      if (!fs.existsSync(path.join(pathMine, item))) return;
      fs.cpSync(
        path.join(pathMine, item),
        path.join(pathMine, `../smc-backup-${name}`, item),
        { recursive: true }
      );
    });
  } else if (buildOption === "all folders") {
    fs.cpSync(pathMine, path.join(pathMine, `../smc-backup-${name}`), {
      recursive: true,
    });
  } else {
    JSON.parse(buildOption).reh.forEach((folder: string) => {
      if (!folder) return;
      reh.push(folder);
    });
    reh.forEach((item) => {
      if (!fs.existsSync(path.join(pathMine, item))) return;
      fs.cpSync(
        path.join(pathMine, item),
        path.join(pathMine, `../smc-backup-${name}`, item),
        { recursive: true }
      );
    });
  }
}
