import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { v4 as uuidv4 } from "uuid";
import { event } from "../event";
import inquirer from "inquirer";
import { execSync } from "node:child_process";

export async function new_addon(
  name: string,
  description: string,
  script: string,
  language: string
): Promise<void> {
  const pathMine: string[] = getFolder(name);
  if (pathMine.length <= 0) return;
  const behavior_uuid: string = uuidv4();
  const resource_uuid: string = uuidv4();
  const pathMinefest: string[] = getManifestInfo();
  const behavior_manifest: string = `{
  "format_version": 2,
  "header": {
    "name": "${name}",
    "description": "${description}",
    "uuid": "${behavior_uuid}",
    "version": [1, 0, 0],
    "min_engine_version": ${pathMinefest[0]}
  },
  "modules": [
    {
      "type": "data",
      "uuid": "${uuidv4()}",
      "version": [1, 0, 0]
    }
    ${
      script
        ? `,{
      "type": "script",
      "language": "javascript",
      "entry": "scripts/main.js",
      "uuid": "${uuidv4()}",
      "version": [1, 0, 0]
    }`
        : ""
    }
  ],
  "dependencies": [
    {
      "uuid": "${resource_uuid}",
      "version": [1, 0, 0]
    },
    {
      "module_name": "@minecraft/server",
      "version": "${pathMinefest[1]}"
    },
    {
      "module_name": "@minecraft/server-ui",
      "version": "${pathMinefest[2]}"
    }
  ]
}
`;
  const resource_manifest: string = `{
  "format_version": 2,
  "header": {
    "name": "${name}",
    "description": "${description}",
    "uuid": "${resource_uuid}",
    "version": [1, 0, 0],
    "min_engine_version": ${pathMinefest[0]}
  },
  "modules": [
    {
      "type": "resources",
      "uuid": "${uuidv4()}",
      "version": [1, 0, 0]
    }
  ],
  "dependencies": [
    {
      "uuid": "${behavior_uuid}",
      "version": [1, 0, 0]
    }
  ]
}
`;
  fs.writeFileSync(`${pathMine[0]}/manifest.json`, behavior_manifest);
  fs.writeFileSync(`${pathMine[1]}/manifest.json`, resource_manifest);
  if (script) {
    fs.mkdirSync(
      `${pathMine[0]}/${
        language.includes("Typescript") ? "@ScriptMC" : "scripts"
      }`
    );
    fs.writeFileSync(
      `${pathMine[0]}/${
        language.includes("Typescript")
          ? "@ScriptMC/main.ts"
          : "scripts/main.js"
      }`,
      language.includes("empty")
        ? ""
        : `import { world } from "@minecraft/server"\n\nworld.afterEvents.itemUse.subscribe((data) => {
  const { source, itemStack } = data;
  world.sendMessage(\`\${source.name} used item \${itemStack?.typeId}\`);
})`
    );
  }
  event("sucess", `Addon created successfully: ${name}`);
  const { code } = await inquirer.prompt([
    {
      type: "confirm",
      name: "code",
      message: "Open with Visual studio code?",
    },
  ]);
  if (!code) return;
  execSync(`code ${pathMine[0]} ${pathMine[1]}`);
}

function getFolder(name: string): string[] {
  const pathMine: string = fs
    .readFileSync(path.join(__dirname, "../../configs/path.config"), "utf-8")
    .match(/\$mojang:.*\$/)![0]
    .replace(/\$mojang:\s(.*)\$/, "$1");
  if (
    !fs.existsSync(
      path.join(os.homedir(), pathMine, "development_behavior_packs")
    )
  )
    fs.mkdirSync(
      path.join(os.homedir(), pathMine, "development_behavior_packs")
    );
  if (
    !fs.existsSync(
      path.join(os.homedir(), pathMine, "development_resource_packs")
    )
  )
    fs.mkdirSync(
      path.join(os.homedir(), pathMine, "development_resource_packs")
    );
  fs.mkdirSync(
    path.join(os.homedir(), pathMine, "development_behavior_packs", name)
  );
  fs.mkdirSync(
    path.join(os.homedir(), pathMine, "development_resource_packs", name)
  );
  return [
    path.join(os.homedir(), pathMine, "development_behavior_packs", name),
    path.join(os.homedir(), pathMine, "development_resource_packs", name),
  ];
}

function getManifestInfo(): string[] {
  const min_version: string = fs
    .readFileSync(
      path.join(__dirname, "../../configs/manifest.config"),
      "utf-8"
    )
    .match(/\$min_engine_version:.*\$/)![0]
    .replace(/\$min_engine_version:\s(.*)\$/, "$1");
  const minecraft_server: string = fs
    .readFileSync(
      path.join(__dirname, "../../configs/manifest.config"),
      "utf-8"
    )
    .match(/\$@minecraft\/server:.*\$/)![0]
    .replace(/\$@minecraft\/server:\s(.*)\$/, "$1");
  const minecraft_server_ui: string = fs
    .readFileSync(
      path.join(__dirname, "../../configs/manifest.config"),
      "utf-8"
    )
    .match(/\$@minecraft\/server-ui:.*\$/)![0]
    .replace(/\$@minecraft\/server-ui:\s(.*)\$/, "$1");
  return [min_version, minecraft_server, minecraft_server_ui];
}
