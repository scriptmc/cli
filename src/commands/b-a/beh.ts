import fs from "node:fs";
import path from "node:path";

export function Beh(pathMine: string, name: string) {
  const beh: string[] = [
    "animation_controllers",
    "animations",
    "blocks",
    "cameras",
    "entities",
    "features",
    "feature_rules",
    "dialogue",
    "functions",
    "item_catalog",
    "items",
    "loot_table",
    "recipes",
    "spawn_rules",
    "structures",
    "texts",
    "trading",
    "scripts",
    "subpacks",
    "manifest.json",
    "pack_icon.png",
  ];
  const buildOption: string = fs
    .readFileSync(
      path.join(__dirname, "../../../configs/build.config"),
      "utf-8"
    )
    .match(/\$buildType:.*\$/)![0]
    .replace(/\$buildType:\s(.*)\$/, "$1");
  if (buildOption === "only essential") {
    beh.forEach((item) => {
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
    JSON.parse(buildOption).beh.forEach((folder: string) => {
      if (!folder) return;
      beh.push(folder);
    });
    beh.forEach((item) => {
      if (!fs.existsSync(path.join(pathMine, item))) return;
      fs.cpSync(
        path.join(pathMine, item),
        path.join(pathMine, `../smc-backup-${name}`, item),
        { recursive: true }
      );
    });
  }
}
