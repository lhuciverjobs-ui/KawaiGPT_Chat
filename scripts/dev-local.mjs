import { spawn } from "node:child_process";

function run(name, args) {
  const child = spawn("corepack", ["pnpm", ...args], {
    stdio: "inherit",
    shell: true,
  });

  child.on("exit", (code) => {
    if (code !== 0) {
      console.error(`[${name}] exited with code ${code}`);
      process.exit(code ?? 1);
    }
  });

  return child;
}

const children = [
  run("api", ["--filter", "@workspace/api-server", "run", "dev"]),
  run("web", ["--filter", "@workspace/kawaiigpt", "run", "dev"]),
];

const shutdown = () => {
  for (const child of children) {
    child.kill("SIGTERM");
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
