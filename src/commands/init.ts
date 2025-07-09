import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { event } from "../event";
import { execSync } from "node:child_process";
import colors from "yoctocolors-cjs";

export async function init(name: string): Promise<void> {
  const pathMine: string = getFolder(name);
  if (!pathMine) return;
  if (!fs.existsSync(path.join(pathMine, "package.json")))
    fs.writeFileSync(
      path.join(pathMine, "package.json"),
      `{ "type": "module" }`
    );
  event("sucess", "wait...");
  try {
    execSync("npm i @scriptmc/jsonts@latest", { cwd: pathMine });
  } catch (err) {
    const error: { message: string } = err as { message: string };
    console.clear();
    event("error", error.message);
  }
  if (!fs.existsSync(path.join(pathMine, "jsonTS")))
    fs.mkdirSync(path.join(pathMine, "jsonTS"));
  console.clear();
  event("sucess", "jsonTS initialized successfully. (to create the jsons:)");
  console.log(colors.bold(colors.blue("jsonTS/<filename>.jt.<ts/js>")));
  console.log(
    colors.bold(
      `${colors.blue("\n- Example:")} ${colors.magenta("jsonTS/clock.jt.ts")}\n`
    )
  );
  if (
    !fs.existsSync(
      path.join(pathMine, "node_modules", "@scriptmc/jsonts", "executes")
    )
  )
    fs.mkdirSync(
      path.join(pathMine, "node_modules", "@scriptmc/jsonts", "executes")
    );
  if (
    !fs.existsSync(
      path.join(pathMine, "node_modules", "@scriptmc/jsonts", "executes", "beh")
    )
  )
    fs.mkdirSync(
      path.join(pathMine, "node_modules", "@scriptmc/jsonts", "executes", "beh")
    );
  if (
    !fs.existsSync(
      path.join(pathMine, "node_modules", "@scriptmc/jsonts", "executes", "reh")
    )
  )
    fs.mkdirSync(
      path.join(pathMine, "node_modules", "@scriptmc/jsonts", "executes", "reh")
    );
}

function getFolder(name: string): string {
  const pathMine: string = fs
    .readFileSync(path.join(__dirname, "../../configs/path.config"), "utf-8")
    .match(/\$mojang:.*\$/)![0]
    .replace(/\$mojang:\s(.*)\$/, "$1");
  return path.join(os.homedir(), pathMine, "development_behavior_packs", name);
}
