export function message_help(): void {
  console.clear();
  console.log("\x1b[1;33m");
  console.log(" " + " ".repeat(10) + "┌ Commands list ┐");
  console.log("\x1b[1;34m");
  console.log(" →" + " --help (-h) - show commands list.");
  console.log(" →" + " --version (-v) - show version.");
  console.log(" →" + " --new (-n) - create new addon.");
  console.log(" →" + " --build (-b) - build addon.");
  console.log(" →" + " --delete (-d) - delete a addon.");
  console.log(" →" + " --settings (-s) - smc settings.");
  console.log(
    " →" + " --template (-t) - create a template for items, blocks or entities."
  );
  console.log(" →" + " start - start transpiler ts to js.");
  console.log(" →" + " init - init jsonTS.");
  console.log(" →" + " open - open addon in vscode.");
  console.log("\x1b[0m");
}
