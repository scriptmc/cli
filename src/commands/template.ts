import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { event } from "../event";

interface Templates {
  item: (pathMine: string) => void;
  block: (pathMine: string) => void;
  entity: (pathMine: string) => void;
}

const templates: Templates = {
  item: (pathMine: string) => {
    if (!fs.existsSync(path.join(pathMine, "items")))
      fs.mkdirSync(path.join(pathMine, "items"));
    fs.writeFileSync(
      path.join(pathMine, "items", "item-template.smc.json"),
      `{
    "format_version": "1.20.80",
    "minecraft:item": {
        "description": {
            "identifier": "smc:template",
            "menu_category": {
                "category": "items"
            }
        },
        "components": {
            "minecraft:icon": "template"
        }
    }
}`
    );
    event("sucess", "Template item created");
  },
  block: (pathMine: string) => {
    if (!fs.existsSync(path.join(pathMine, "blocks")))
      fs.mkdirSync(path.join(pathMine, "blocks"));
    fs.writeFileSync(
      path.join(pathMine, "items", "item-template.smc.json"),
      `{
    "format_version": "1.20.80",
    "minecraft:block": {
        "description": {
            "identifier": "smc:template"
        },
        "components": {}
    }
}`
    );
    event("sucess", "Template block created");
  },
  entity: (pathMine: string) => {
    if (!fs.existsSync(path.join(pathMine, "entities")))
      fs.mkdirSync(path.join(pathMine, "entities"));
    fs.writeFileSync(
      path.join(pathMine, "items", "item-template.smc.json"),
      `{
    "format_version": "1.10.0",
    "minecraft:entity": {
        "description": {
          "identifier": "smc:template"
        },
        "components": {}
    }
}`
    );
    event("sucess", "Template entity created");
  },
};

export function template(
  template: "item" | "block" | "entity",
  name: string
): void {
  const pathMine: string = getFolder(name);
  if (template.includes("item")) templates["item"](pathMine);
  else if (template.includes("block")) templates["block"](pathMine);
  else templates["entity"](pathMine);
}

function getFolder(name: string): string {
  const pathMine: string = fs
    .readFileSync(path.join(__dirname, "../../configs/path.config"), "utf-8")
    .match(/\$mojang:.*\$/)![0]
    .replace(/\$mojang:\s(.*)\$/, "$1");
  return path.join(os.homedir(), pathMine, "development_behavior_packs", name);
}
