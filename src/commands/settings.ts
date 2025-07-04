import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import inquirer from "inquirer";
import { event } from "../event";

const paths: {
  minecraft: () => Promise<void>;
  folderPath: () => Promise<void>;
  folderName: () => Promise<void>;
} = {
  minecraft: async () => {
    const { pathMine } = await inquirer.prompt([
      {
        type: "input",
        name: "pathMine",
        message: "Minecraft (com.mojang) Path:",
        default:
          "AppData/Local/Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang",
        required: true,
      },
    ]);
    if (pathMine.includes(os.homedir()))
      if (!fs.existsSync(pathMine)) {
        event("error", "Path not exist.");

        fs.writeFileSync(
          path.join(__dirname, "../../configs/path.config"),
          fs
            .readFileSync(
              path.join(__dirname, "../../configs/path.config"),
              "utf-8"
            )
            .replace(
              fs
                .readFileSync(
                  path.join(__dirname, "../../configs/path.config"),
                  "utf-8"
                )
                .match(/\$mojang:.*\$/)![0],
              `$mojang: ${pathMine
                .slice(os.homedir().length)
                .replace(/"/g, "")}$`
            )
        );
      } else {
        if (!fs.existsSync(path.join(os.homedir(), pathMine)))
          event("error", "Path not exist.");

        fs.writeFileSync(
          path.join(__dirname, "../../configs/path.config"),
          fs
            .readFileSync(
              path.join(__dirname, "../../configs/path.config"),
              "utf-8"
            )
            .replace(
              fs
                .readFileSync(
                  path.join(__dirname, "../../configs/path.config"),
                  "utf-8"
                )
                .match(/\$mojang:.*\$/)![0],
              `$mojang: ${pathMine.replace(/"/g, "")}$`
            )
        );
      }
  },
  folderPath: async () => {
    const { pathFolder } = await inquirer.prompt([
      {
        type: "input",
        name: "pathFolder",
        message: "Exports Folder Path:",
        default:
          "AppData/Local/Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang",
        required: true,
      },
    ]);
    if (pathFolder.includes(os.homedir())) {
      if (!fs.existsSync(pathFolder)) event("error", "Path not exist.");

      fs.writeFileSync(
        path.join(__dirname, "../../configs/path.config"),
        fs
          .readFileSync(
            path.join(__dirname, "../../configs/path.config"),
            "utf-8"
          )
          .replace(
            fs
              .readFileSync(
                path.join(__dirname, "../../configs/path.config"),
                "utf-8"
              )
              .match(/\$exportsPath:.*\$/)![0],
            `$exportsPath: ${pathFolder
              .slice(os.homedir().length)
              .replace(/"/g, "")}$`
          )
      );
    } else {
      if (!fs.existsSync(path.join(os.homedir(), pathFolder)))
        event("error", "Path not exist.");

      fs.writeFileSync(
        path.join(__dirname, "../../configs/path.config"),
        fs
          .readFileSync(
            path.join(__dirname, "../../configs/path.config"),
            "utf-8"
          )
          .replace(
            fs
              .readFileSync(
                path.join(__dirname, "../../configs/path.config"),
                "utf-8"
              )
              .match(/\$exportsPath:.*\$/)![0],
            `$exportsPath: ${pathFolder.replace(/"/g, "")}$`
          )
      );
    }
  },
  folderName: async () => {
    const { nameFolder } = await inquirer.prompt([
      {
        type: "input",
        name: "nameFolder",
        message: "Exports Folder Name:",
        default: "@ScriptMC-exports",
        required: true,
      },
    ]);
    fs.writeFileSync(
      path.join(__dirname, "../../configs/path.config"),
      fs
        .readFileSync(
          path.join(__dirname, "../../configs/path.config"),
          "utf-8"
        )
        .replace(
          fs
            .readFileSync(
              path.join(__dirname, "../../configs/path.config"),
              "utf-8"
            )
            .match(/\$exportsName:.*\$/)![0],
          `$exportsName: ${path.basename(nameFolder.replace(/"/g, ""))}$`
        )
    );
  },
};

const manifestOptions: {
  min_engine_version: () => Promise<void>;
  minecraft_server: () => Promise<void>;
  minecraft_server_ui: () => Promise<void>;
} = {
  min_engine_version: async () => {
    const { version } = await inquirer.prompt([
      {
        type: "input",
        name: "version",
        message: "min_engine_version:",
        default: "1.21.90",
        required: true,
      },
    ]);
    if (!version.match(/\d{1}\.\d{1,2}\.\d{1,2}/))
      event("error", "Value invalid.");

    fs.writeFileSync(
      path.join(__dirname, "../../configs/manifest.config"),
      fs
        .readFileSync(
          path.join(__dirname, "../../configs/manifest.config"),
          "utf-8"
        )
        .replace(
          fs
            .readFileSync(
              path.join(__dirname, "../../configs/manifest.config"),
              "utf-8"
            )
            .match(/\$min_engine_version:.*\$/)![0],
          `$min_engine_version: [${version.split(".")[0]}, ${
            version.split(".")[1]
          }, ${version.split(".")[2]}]$`
        )
    );
  },
  minecraft_server: async () => {
    const { version } = await inquirer.prompt([
      {
        type: "input",
        name: "version",
        message: "@minecraft/server version:",
        default: "2.0.0",
        required: true,
      },
    ]);
    if (!version.match(/\d{1}\.\d{1,2}\.\d{1}/))
      event("error", "Value invalid.");

    fs.writeFileSync(
      path.join(__dirname, "../../configs/manifest.config"),
      fs
        .readFileSync(
          path.join(__dirname, "../../configs/manifest.config"),
          "utf-8"
        )
        .replace(
          fs
            .readFileSync(
              path.join(__dirname, "../../configs/manifest.config"),
              "utf-8"
            )
            .match(/\$@minecraft\/server:.*\$/)![0],
          `$@minecraft/server: ${version}$`
        )
    );
  },
  minecraft_server_ui: async () => {
    const { version } = await inquirer.prompt([
      {
        type: "input",
        name: "version",
        message: "@minecraft/server-ui version:",
        default: "2.0.0",
        required: true,
      },
    ]);
    if (!version.match(/\d{1}\.\d{1,2}\.\d{1}/))
      event("error", "Value invalid.");

    fs.writeFileSync(
      path.join(__dirname, "../../configs/manifest.config"),
      fs
        .readFileSync(
          path.join(__dirname, "../../configs/manifest.config"),
          "utf-8"
        )
        .replace(
          fs
            .readFileSync(
              path.join(__dirname, "../../configs/manifest.config"),
              "utf-8"
            )
            .match(/\$@minecraft\/server-ui:.*\$/)![0],
          `$@minecraft/server-ui: ${version}$`
        )
    );
  },
};

const buildOptions: {
  essential: () => void;
  specify: () => Promise<void>;
  all: () => void;
  name: (nameB: string, nameR: string) => void;
  ts: (folder: string) => void;
} = {
  essential: () => {
    fs.writeFileSync(
      path.join(__dirname, "../../configs/build.config"),
      fs
        .readFileSync(
          path.join(__dirname, "../../configs/build.config"),
          "utf-8"
        )
        .replace(
          fs
            .readFileSync(
              path.join(__dirname, "../../configs/build.config"),
              "utf-8"
            )
            .match(/\$buildType:.*\$/)![0],
          "$buildType: only essential$"
        )
    );
  },
  specify: async () => {
    const { foldersB, foldersR } = await inquirer.prompt([
      {
        type: "input",
        name: "foldersB",
        message: "Folders behavior:",
        default: "src, @ScriptMC or empty",
      },
      {
        type: "input",
        name: "foldersR",
        message: "Folders resouce:",
        default: "customui, customtester or empty",
      },
    ]);
    if (
      !foldersB.match(/^\w*(?:,\s*[\w]+)*$/u) ||
      !foldersR.match(/^\w*(?:,\s*[\w]+)*$/u)
    )
      event("error", "Value invalid.");

    const folders: { beh: string[]; reh: string[] } = {
      beh: [],
      reh: [],
    };
    if (!foldersB.includes(",")) {
      folders.beh.push(foldersB);
    } else {
      foldersB.split(",").forEach((folder: string) => {
        folders.beh.push(folder);
      });
    }
    if (!foldersR.includes(",")) {
      folders.reh.push(foldersR);
    } else {
      foldersR.split(",").forEach((folder: string) => {
        folders.reh.push(folder);
      });
    }
    fs.writeFileSync(
      path.join(__dirname, "../../configs/build.config"),
      fs
        .readFileSync(
          path.join(__dirname, "../../configs/build.config"),
          "utf-8"
        )
        .replace(
          fs
            .readFileSync(
              path.join(__dirname, "../../configs/build.config"),
              "utf-8"
            )
            .match(/\$buildType:.*\$/)![0],
          `$buildType: ${JSON.stringify(folders)}$`
        )
    );
  },
  all: () => {
    fs.writeFileSync(
      path.join(__dirname, "../../configs/build.config"),
      fs
        .readFileSync(
          path.join(__dirname, "../../configs/build.config"),
          "utf-8"
        )
        .replace(
          fs
            .readFileSync(
              path.join(__dirname, "../../configs/build.config"),
              "utf-8"
            )
            .match(/\$buildType:.*\$/)![0],
          "$buildType: all folders$"
        )
    );
  },
  name: (nameB, nameR) => {
    if (!nameB.match(/[a-zA-Z_]+/) || !nameR.match(/[a-zA-Z_]+/))
      event("error", "Value invalid.");

    fs.writeFileSync(
      path.join(__dirname, "../../configs/build.config"),
      fs
        .readFileSync(
          path.join(__dirname, "../../configs/build.config"),
          "utf-8"
        )
        .replace(
          fs
            .readFileSync(
              path.join(__dirname, "../../configs/build.config"),
              "utf-8"
            )
            .match(/\$buildName:.*\$/)![0],
          `$buildName: ["${nameB}", "${nameR}"]$`
        )
    );
  },
  ts: (folder) => {
    if (!folder.match(/[a-zA-Z_]+/)) event("error", "Value invalid.");
    fs.writeFileSync(
      path.join(__dirname, "../../configs/build.config"),
      fs
        .readFileSync(
          path.join(__dirname, "../../configs/build.config"),
          "utf-8"
        )
        .replace(
          fs
            .readFileSync(
              path.join(__dirname, "../../configs/build.config"),
              "utf-8"
            )
            .match(/\$tsFolder:.*\$/)![0],
          `$tsFolder: ${folder}$`
        )
    );
  },
};

export class Settings {
  Paths(pathName: string) {
    if (pathName.includes("Minecraft")) paths.minecraft();
    else if (pathName.includes("Folder Path")) paths.folderPath();
    else paths.folderName();
  }
  Manifest(manifestOption: string) {
    if (manifestOption.includes("min_engine_version"))
      manifestOptions.min_engine_version();
    else if (manifestOption.includes("@minecraft/server version"))
      manifestOptions.minecraft_server();
    else manifestOptions.minecraft_server_ui();
  }
  Build(buildOption: string | string[], tsFolder: string) {
    if (tsFolder) return buildOptions.ts(tsFolder);
    if (buildOption.includes("Only essential")) buildOptions.essential();
    else if (buildOption.includes("Specify folder")) buildOptions.specify();
    else if (buildOption.includes("All folders")) buildOptions.all();
    else buildOptions.name(buildOption[0], buildOption[1]);
  }
}
