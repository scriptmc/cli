#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { list } from "./cli-list.js";
import { event } from "./event.js";
import Fuse from "fuse.js";
import colors from "yoctocolors-cjs";
import { message_help } from "./commands/help.js";

async function main(): Promise<void> {
  const pathMine: string[] = await getFolder();
  const args: string[] = process.argv.slice(2);
  if (args.length <= 0) message_help();
  args.forEach((arg) => {
    const word: string = new Fuse(list, {
      keys: ["name"],
    }).search(arg)[0]?.item.name;
    if (
      list.filter((item) => item.name === arg || item.flag === arg).length <= 0
    )
      event(
        "error",
        word
          ? `Command Invalid: ${arg}\n\t${colors.green(
              'Did you mean: "'
            )}${colors.white(word)}${colors.green('"?')}`
          : `Command Invalid: ${arg}`
      );
  });
  list
    .filter((item) => item.name === args[0] || item.flag === args[0])[0]
    .exec(pathMine);
}

async function getFolder(): Promise<string[]> {
  const pathMine: string = fs
    .readFileSync(path.join(__dirname, "../configs/path.config"), "utf-8")
    .match(/\$mojang:.*\$/)![0]
    .replace(/\$mojang:\s(.*)\$/, "$1");
  let pathWorld: string = "";
  if (
    fs.readdirSync(
      path.join(os.homedir(), pathMine, "development_behavior_packs")
    ).length <= 0 ||
    fs.readdirSync(
      path.join(os.homedir(), pathMine, "development_resource_packs")
    ).length <= 0
  )
    return [];
  if (
    fs.readdirSync(path.join(os.homedir(), pathMine, "minecraftWorlds"))
      .length > 0
  ) {
    pathWorld = path.join(os.homedir(), pathMine, "minecraftWorlds");
  }
  return [
    path.join(os.homedir(), pathMine, "development_behavior_packs"),
    path.join(os.homedir(), pathMine, "development_resource_packs"),
    pathWorld,
  ];
}

main();
