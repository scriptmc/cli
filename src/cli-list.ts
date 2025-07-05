import { message_help } from "./commands/help.js";
import { new_addon } from "./commands/new-addon.js";
import { delete_addon } from "./commands/delete-addon.js";
import { build_addon } from "./commands/build-addon.js";
import { template } from "./commands/template.js";
import inquirer from "inquirer";
import { start } from "./commands/start.js";
import colors from "yoctocolors-cjs";
import fs from "node:fs";
import path from "node:path";
import { build_world } from "./commands/build-world.js";
import { event } from "./event.js";
import { Settings } from "./commands/settings.js";
import { init } from "./commands/init.js";

interface List {
  name: string;
  flag?: string;
  exec: (pathMine: string[]) => void;
}

export const list: List[] = [
  {
    name: "--help",
    flag: "-h",
    exec: () => message_help(),
  },
  {
    name: "--version",
    flag: "-v",
    exec: () => console.log(colors.blue(`Version: ${colors.reset("1.0.1")}`)),
  },
  {
    name: "--new",
    flag: "-n",
    exec: async (pathMine) => {
      try {
        const { name, description } = await inquirer.prompt([
          {
            type: "search",
            name: "name",
            message: "Addon name:",
            source: (term) => {
              const addons: string[] = [];
              if (term) addons.push(term);
              if (pathMine[0]) {
                return addons
                  .filter(
                    (addon) => !fs.readdirSync(pathMine[0])?.includes(addon)
                  )
                  .sort((a: string, b: string) => {
                    if (a === term && b !== term) return -1;
                    if (a !== term && b === term) return 1;
                    return a.localeCompare(b);
                  });
              }
              return addons;
            },
          },
          {
            type: "input",
            name: "description",
            message: "Addon description:",
          },
        ]);
        const { script, language } = await inquirer.prompt([
          {
            type: "confirm",
            name: "script",
            message: "Script?",
          },
          {
            default: "Javascript",
            when: (data) => data.script === true,
            type: "list",
            name: "language",
            message: "Language:",
            choices: [
              colors.cyan(`Typescript ${colors.black("(recomended)")}`),
              colors.blueBright("Typescript empty"),
              colors.yellow("Javascript"),
              colors.redBright("Javascript empty"),
            ],
            theme: {
              icon: {
                cursor: "–→",
              },
              style: {
                highlight: (text: string) => colors.bold(` ${text}`),
              },
            },
          },
        ]);
        new_addon(name, description, script, language);
      } catch (err) {
        const error: { message: string } = err as { message: string };
        if (!error.message.includes("SIGINT")) return console.error(err);
        console.clear();
        event("sucess", "Leaving...");
      }
    },
  },
  {
    name: "--build",
    flag: "-b",
    exec: async (pathMine) => {
      try {
        if (pathMine.length <= 0) {
          event("error", "No addons found.");
          return;
        }
        const behaviors: string[] = fs
          .readdirSync(pathMine[0])
          .filter((behavior) =>
            fs.existsSync(path.join(pathMine[0], behavior, "manifest.json"))
          );
        const resources: string[] = fs
          .readdirSync(pathMine[1])
          .filter((resource) =>
            fs.existsSync(path.join(pathMine[1], resource, "manifest.json"))
          );
        if (behaviors.length <= 0 || resources.length <= 0) {
          event("error", "No addons found.");
          return;
        }
        const { compile } = await inquirer.prompt([
          {
            type: "list",
            name: "compile",
            message: "Compile addon or world:",
            choices: [colors.yellow("Addon"), colors.red("World")],
            theme: {
              icon: {
                cursor: "–→",
              },
              style: {
                highlight: (text: string) => colors.bold(` ${text}`),
              },
            },
          },
        ]);
        if (compile.includes("Addon")) {
          const { nameB, nameR, namePack } = await inquirer.prompt([
            {
              type: "search",
              name: "nameB",
              message: "Behavior name:",
              source: (term) => {
                return behaviors
                  .filter((behavior) =>
                    behavior.toLowerCase().includes(term?.toLowerCase() || "")
                  )
                  .sort((a: string, b: string) => {
                    if (a === term && b !== term) return -1;
                    if (a !== term && b === term) return 1;
                    return a.localeCompare(b);
                  });
              },
            },
            {
              type: "search",
              name: "nameR",
              message: "Resource name:",
              source: (term) => {
                return resources
                  .filter((resource) =>
                    resource.toLowerCase().includes(term?.toLowerCase() || "")
                  )
                  .sort((a: string, b: string) => {
                    if (a === term && b !== term) return -1;
                    if (a !== term && b === term) return 1;
                    return a.localeCompare(b);
                  });
              },
            },
            {
              type: "input",
              name: "namePack",
              message: "Addon compilated name:",
              required: true,
            },
          ]);
          build_addon(nameB, nameR, namePack);
        } else {
          if (!pathMine[2]) {
            event("error", "No addons/worlds found.");
            return;
          }
          const worlds: string[] = fs.readdirSync(pathMine[2]);
          if (worlds.length <= 0) {
            event("error", "No worlds found.");
            return;
          }
          const { nameW, nameB, nameR, namePack } = await inquirer.prompt([
            {
              type: "confirm",
              name: "addon",
              message: "Would you want to import the world with the addons?",
            },
            {
              type: "search",
              name: "nameW",
              message: "World name:",
              source: (term) => {
                return worlds
                  .filter((world) =>
                    world.toLowerCase().includes(term?.toLowerCase() || "")
                  )
                  .sort((a: string, b: string) => {
                    if (a === term && b !== term) return -1;
                    if (a !== term && b === term) return 1;
                    return a.localeCompare(b);
                  });
              },
            },
            {
              when: (data) => {
                const behaviors: string[] = fs
                  .readdirSync(pathMine[0])
                  .filter((behavior) =>
                    fs.existsSync(
                      path.join(pathMine[0], behavior, "manifest.json")
                    )
                  );
                const resources: string[] = fs
                  .readdirSync(pathMine[1])
                  .filter((resource) =>
                    fs.existsSync(
                      path.join(pathMine[1], resource, "manifest.json")
                    )
                  );
                if (behaviors.length <= 0 || resources.length <= 0) {
                  event("error", "No addons found.");
                  return false;
                }
                return data.addon;
              },
              type: "search",
              name: "nameB",
              message: "Behavior name:",
              source: (term) => {
                return behaviors
                  .filter((behavior) =>
                    behavior.toLowerCase().includes(term?.toLowerCase() || "")
                  )
                  .sort((a: string, b: string) => {
                    if (a === term && b !== term) return -1;
                    if (a !== term && b === term) return 1;
                    return a.localeCompare(b);
                  });
              },
            },
            {
              when: (data) => {
                const behaviors: string[] = fs
                  .readdirSync(pathMine[0])
                  .filter((behavior) =>
                    fs.existsSync(
                      path.join(pathMine[0], behavior, "manifest.json")
                    )
                  );
                const resources: string[] = fs
                  .readdirSync(pathMine[1])
                  .filter((resource) =>
                    fs.existsSync(
                      path.join(pathMine[1], resource, "manifest.json")
                    )
                  );
                if (behaviors.length <= 0 || resources.length <= 0) {
                  event("error", "No addons found.");
                  return false;
                }
                return data.addon;
              },
              type: "search",
              name: "nameR",
              message: "Resource name:",
              source: (term) => {
                return resources
                  .filter((resource) =>
                    resource.toLowerCase().includes(term?.toLowerCase() || "")
                  )
                  .sort((a: string, b: string) => {
                    if (a === term && b !== term) return -1;
                    if (a !== term && b === term) return 1;
                    return a.localeCompare(b);
                  });
              },
            },
            {
              type: "input",
              name: "namePack",
              message: "World compilated name:",
            },
          ]);
          build_world(nameW, nameB, nameR, namePack);
        }
      } catch (err) {
        const error: { message: string } = err as { message: string };
        if (!error.message.includes("SIGINT")) return console.error(err);
        console.clear();
        event("sucess", "Leaving...");
      }
    },
  },
  {
    name: "--delete",
    flag: "-d",
    exec: async (pathMine) => {
      try {
        if (pathMine.length <= 0) {
          event("error", "No addons found.");
          return;
        }
        const behaviors: string[] = fs
          .readdirSync(pathMine[0])
          .filter((behavior) =>
            fs.existsSync(path.join(pathMine[0], behavior, "manifest.json"))
          );
        const resources: string[] = fs
          .readdirSync(pathMine[1])
          .filter((resource) =>
            fs.existsSync(path.join(pathMine[1], resource, "manifest.json"))
          );
        if (behaviors.length <= 0 || resources.length <= 0) {
          event("error", "No addons found.");
          return;
        }
        const { nameB, nameR } = await inquirer.prompt([
          {
            type: "search",
            name: "nameB",
            message: "Behavior name:",
            source: (term) => {
              return behaviors
                .filter((behavior) =>
                  behavior.toLowerCase().includes(term?.toLowerCase() || "")
                )
                .sort((a: string, b: string) => {
                  if (a === term && b !== term) return -1;
                  if (a !== term && b === term) return 1;
                  return a.localeCompare(b);
                });
            },
          },
          {
            type: "search",
            name: "nameR",
            message: "Resource name:",
            source: (term) => {
              return resources
                .filter((resource) =>
                  resource.toLowerCase().includes(term?.toLowerCase() || "")
                )
                .sort((a: string, b: string) => {
                  if (a === term && b !== term) return -1;
                  if (a !== term && b === term) return 1;
                  return a.localeCompare(b);
                });
            },
          },
        ]);
        delete_addon(nameB, nameR);
      } catch (err) {
        const error: { message: string } = err as { message: string };
        if (!error.message.includes("SIGINT")) return console.error(err);
        console.clear();
        event("sucess", "Leaving...");
      }
    },
  },
  {
    name: "--settings",
    flag: "-s",
    exec: async () => {
      try {
        const { setting } = await inquirer.prompt([
          {
            type: "list",
            name: "setting",
            message: "Settings:",
            choices: [
              colors.green("Paths"),
              colors.red("Manifest Json"),
              colors.cyan("Build"),
            ],
            theme: {
              icon: {
                cursor: "–→",
              },
              style: {
                highlight: (text: string) => colors.bold(` ${text}`),
              },
            },
          },
        ]);
        if (setting.includes("Paths")) {
          const { pathName } = await inquirer.prompt([
            {
              type: "list",
              name: "pathName",
              message: "Change Path:",
              choices: [
                colors.green(`Minecraft ${colors.gray("(com.mojang)")}`),
                colors.red("Exports Folder Path"),
                colors.cyan("Exports Folder Name"),
              ],
              theme: {
                icon: {
                  cursor: "–→",
                },
                style: {
                  highlight: (text: string) => colors.bold(` ${text}`),
                },
              },
            },
          ]);
          new Settings().Paths(pathName);
        } else if (setting.includes("Manifest")) {
          const { manifestOption } = await inquirer.prompt([
            {
              type: "list",
              name: "manifestOption",
              message: "Change Manifest Option:",
              choices: [
                colors.green("min_engine_version"),
                colors.red("@minecraft/server version"),
                colors.cyan("@minecraft/server-ui version"),
              ],
              theme: {
                icon: {
                  cursor: "–→",
                },
                style: {
                  highlight: (text: string) => colors.bold(` ${text}`),
                },
              },
            },
          ]);
          new Settings().Manifest(manifestOption);
        } else {
          const { buildType, buildNameB, buildNameR, tsFolder } =
            await inquirer.prompt([
              {
                type: "list",
                name: "build",
                message: "Build configuration:",
                choices: [
                  colors.green("BuildType"),
                  colors.red("BuildName"),
                  colors.magenta("tsFolder"),
                ],
                theme: {
                  icon: {
                    cursor: "–→",
                  },
                  style: {
                    highlight: (text: string) => colors.bold(` ${text}`),
                  },
                },
              },
              {
                when: (data) => data.build.includes("BuildType"),
                type: "list",
                name: "buildType",
                message:
                  "Would you like to export the essential addon folders (like blocks, items and scripts)?",
                choices: [
                  colors.green(
                    `Only essential ${colors.gray("(recommended)")}`
                  ),
                  colors.red("Specify folder"),
                  colors.cyan("All folders"),
                ],
                theme: {
                  icon: {
                    cursor: "–→",
                  },
                  style: {
                    highlight: (text: string) => colors.bold(` ${text}`),
                  },
                },
              },
              {
                when: (data) => data.build.includes("BuildName"),
                type: "input",
                name: "buildNameB",
                message:
                  "Behavior keyword if behavior and resource are the same:",
                required: true,
              },
              {
                when: (data) => data.build.includes("BuildName"),
                type: "input",
                name: "buildNameR",
                message:
                  "Resource keyword if behavior and resource are the same:",
                required: true,
              },
              {
                when: (data) => data.build.includes("tsFolder"),
                type: "input",
                name: "tsFolder",
                message: "tsFolder name:",
                required: true,
              },
            ]);
          new Settings().Build(buildType || [buildNameB, buildNameR], tsFolder);
        }
      } catch (err) {
        const error: { message: string } = err as { message: string };
        if (!error.message.includes("SIGINT")) return console.error(err);
        console.clear();
        event("sucess", "Leaving...");
      }
    },
  },
  {
    name: "--template",
    flag: "-t",
    exec: async (pathMine) => {
      try {
        if (pathMine.length <= 0) {
          event("error", "No addons found.");
          return;
        }
        const behaviors: string[] = fs
          .readdirSync(pathMine[0])
          .filter((behavior) =>
            fs.existsSync(path.join(pathMine[0], behavior, "manifest.json"))
          );
        if (behaviors.length <= 0) {
          event("error", "No behaviors found.");
          return;
        }
        const { templat, name } = await inquirer.prompt([
          {
            type: "list",
            name: "templat",
            message: "Select a template:",
            choices: [
              colors.green("item"),
              colors.red("block"),
              colors.magenta("entity"),
            ],
            theme: {
              icon: {
                cursor: "–→",
              },
              style: {
                highlight: (text: string) => colors.bold(` ${text}`),
              },
            },
          },
          {
            type: "search",
            name: "name",
            message: "Behavior name:",
            source: (term) => {
              return behaviors
                .filter((behavior) =>
                  behavior.toLowerCase().includes(term?.toLowerCase() || "")
                )
                .sort((a: string, b: string) => {
                  if (a === term && b !== term) return -1;
                  if (a !== term && b === term) return 1;
                  return a.localeCompare(b);
                });
            },
          },
        ]);
        template(templat, name);
      } catch (err) {
        const error: { message: string } = err as { message: string };
        if (!error.message.includes("SIGINT")) return console.error(err);
        console.clear();
        event("sucess", "Leaving...");
      }
    },
  },
  {
    name: "start",
    exec: async (pathMine) => {
      try {
        if (pathMine.length <= 0) {
          event("error", "No addons found.");
          return;
        }
        const behaviors: string[] = fs
          .readdirSync(pathMine[0])
          .filter((behavior) =>
            fs.existsSync(path.join(pathMine[0], behavior, "manifest.json"))
          );
        if (behaviors.length <= 0) {
          event("error", "No behaviors found.");
          return;
        }
        const { type, name } = await inquirer.prompt([
          {
            type: "list",
            name: "type",
            message: "Compiler:",
            choices: [colors.yellow("JsonTS"), colors.blue("Ts")],
            theme: {
              icon: {
                cursor: "–→",
              },
              style: {
                highlight: (text: string) => colors.bold(` ${text}`),
              },
            },
          },
          {
            type: "search",
            name: "name",
            message: "Behavior name:",
            source: (term) => {
              return behaviors
                .filter((behavior) =>
                  behavior.toLowerCase().includes(term?.toLowerCase() || "")
                )
                .sort((a: string, b: string) => {
                  if (a === term && b !== term) return -1;
                  if (a !== term && b === term) return 1;
                  return a.localeCompare(b);
                });
            },
          },
        ]);
        start(type, name);
      } catch (err) {
        const error: { message: string } = err as { message: string };
        if (!error.message.includes("SIGINT")) return console.error(err);
        console.clear();
        event("sucess", "Leaving...");
      }
    },
  },
  {
    name: "init",
    exec: async (pathMine) => {
      try {
        if (pathMine.length <= 0) {
          event("error", "No addons found.");
          return;
        }
        const behaviors: string[] = fs
          .readdirSync(pathMine[0])
          .filter((behavior) =>
            fs.existsSync(path.join(pathMine[0], behavior, "manifest.json"))
          );
        if (behaviors.length <= 0) {
          event("error", "No behaviors found.");
          return;
        }
        const { name } = await inquirer.prompt([
          {
            type: "search",
            name: "name",
            message: "Behavior name:",
            source: (term) => {
              return behaviors
                .filter((behavior) =>
                  behavior.toLowerCase().includes(term?.toLowerCase() || "")
                )
                .sort((a: string, b: string) => {
                  if (a === term && b !== term) return -1;
                  if (a !== term && b === term) return 1;
                  return a.localeCompare(b);
                });
            },
          },
        ]);
        init(name);
      } catch (err) {
        const error: { message: string } = err as { message: string };
        if (!error.message.includes("SIGINT")) return console.error(err);
        console.clear();
        event("sucess", "Leaving...");
      }
    },
  },
];
