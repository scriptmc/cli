import fs from "node:fs";
import archiver from "archiver";
import path from "node:path";
import os from "node:os";
import { event } from "../event";
import colors from "yoctocolors-cjs";
import { Beh } from "./b-a/beh";
import { Reh } from "./b-a/reh";

export function build_addon(
  nameB: string,
  nameR: string,
  namePack: string
): void {
  const pathMine: string[] = getFolder(nameB, nameR);
  const output = fs.createWriteStream(
    path.join(pathMine[2], `${namePack}.mcaddon`)
  );
  const buildName: string[] = JSON.parse(
    fs
      .readFileSync(path.join(__dirname, "../../configs/build.config"), "utf-8")
      .match(/\$buildName:.*\$/)![0]
      .replace(/\$buildName:\s(.*)\$/, "$1")
  );
  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  output.on("close", () => {
    fs.rmSync(path.join(pathMine[0], `../smc-backup-${nameB}`), {
      force: true,
      recursive: true,
    });
    fs.rmSync(path.join(pathMine[1], `../smc-backup-${nameR}`), {
      force: true,
      recursive: true,
    });
    event(
      "sucess",
      `Addon construction completed. ${colors.blue(
        colors.italic(path.join(pathMine[2], `${namePack}.mcaddon`))
      )}`
    );
  });

  archive.pipe(output);

  Beh(pathMine[0], nameB);
  Reh(pathMine[1], nameR);

  if (nameB === nameR) {
    archive.directory(
      path.join(pathMine[0], `../smc-backup-${nameB}`),
      `${nameB} ${buildName[0]}`
    );
    archive.directory(
      path.join(pathMine[1], `../smc-backup-${nameR}`),
      `${nameR} ${buildName[1]}`
    );
  } else {
    archive.directory(path.join(pathMine[0], `../smc-backup-${nameB}`), nameB);
    archive.directory(path.join(pathMine[1], `../smc-backup-${nameR}`), nameR);
  }

  archive.finalize();
}

function getFolder(nameB: string, nameR: string): string[] {
  const pathMine: string = fs
    .readFileSync(path.join(__dirname, "../../configs/path.config"), "utf-8")
    .match(/\$mojang:.*\$/)![0]
    .replace(/\$mojang:\s(.*)\$/, "$1");
  const folderPath: string = fs
    .readFileSync(path.join(__dirname, "../../configs/path.config"), "utf-8")
    .match(/\$exportsPath:.*\$/)![0]
    .replace(/\$exportsPath:\s(.*)\$/, "$1");
  const folderName: string = fs
    .readFileSync(path.join(__dirname, "../../configs/path.config"), "utf-8")
    .match(/\$exportsName:.*\$/)![0]
    .replace(/\$exportsName:\s(.*)\$/, "$1");
  if (!fs.existsSync(path.join(os.homedir(), folderPath, folderName)))
    fs.mkdirSync(path.join(os.homedir(), folderPath, folderName));
  if (!fs.existsSync(path.join(os.homedir(), folderPath, folderName, "addons")))
    fs.mkdirSync(path.join(os.homedir(), folderPath, folderName, "addons"));
  return [
    path.join(os.homedir(), pathMine, "development_behavior_packs", nameB),
    path.join(os.homedir(), pathMine, "development_resource_packs", nameR),
    path.join(os.homedir(), folderPath, folderName, "addons"),
  ];
}
