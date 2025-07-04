import fs from "node:fs";
import archiver from "archiver";
import path from "node:path";
import os from "node:os";
import { event } from "../event";
import colors from "yoctocolors-cjs";
import { Beh } from "./b-a/beh";
import { Reh } from "./b-a/reh";

export function build_world(
  nameW: string,
  nameB: string,
  nameR: string,
  namePack: string
): void {
  const pathMine: string[] = getFolder(nameW, nameB, nameR);
  const output = fs.createWriteStream(
    path.join(pathMine[3], `${namePack}.mcworld`)
  );
  const archive = archiver("zip", {
    zlib: { level: 9 },
  });
  output.on("close", () => {
    if (nameB && nameR) {
      fs.rmSync(path.join(pathMine[0], `../smc-backup-${nameB}`), {
        recursive: true,
        force: true,
      });
      fs.rmSync(path.join(pathMine[1], `../smc-backup-${nameR}`), {
        recursive: true,
        force: true,
      });
      fs.rmSync(path.join(pathMine[2], "behavior_packs", nameB), {
        recursive: true,
        force: true,
      });
      fs.rmSync(path.join(pathMine[2], "resource_packs", nameR), {
        recursive: true,
        force: true,
      });
    }
    event(
      "sucess",
      `World construction completed. ${colors.blue(
        colors.italic(path.join(pathMine[3], `${namePack}.mcworld`))
      )}`
    );
  });

  archive.pipe(output);
  if (nameB && nameR) {
    Beh(pathMine[0], nameB);
    Reh(pathMine[1], nameR);
    fs.cpSync(
      path.join(pathMine[0], `../smc-backup-${nameB}`),
      path.join(pathMine[2], "behavior_packs", nameB),
      {
        recursive: true,
      }
    );
    fs.cpSync(
      path.join(pathMine[1], `../smc-backup-${nameR}`),
      path.join(pathMine[2], "resource_packs", nameR),
      {
        recursive: true,
      }
    );
  }
  archive.directory(`${pathMine[2]}/`, false);
  archive.finalize();
}

function getFolder(nameW: string, nameB: string, nameR: string): string[] {
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
  if (!fs.existsSync(path.join(os.homedir(), folderPath, folderName, "worlds")))
    fs.mkdirSync(path.join(os.homedir(), folderPath, folderName, "worlds"));
  return [
    path.join(
      os.homedir(),
      pathMine,
      "development_behavior_packs",
      nameB || ""
    ),
    path.join(
      os.homedir(),
      pathMine,
      "development_resource_packs",
      nameR || ""
    ),
    path.join(os.homedir(), pathMine, "minecraftWorlds", nameW),
    path.join(os.homedir(), folderPath, folderName, "worlds"),
  ];
}
