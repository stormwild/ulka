#!/usr/bin/env node

import "colors"
import { program } from "commander"

import build from "./build"
import serve from "./serve"
import { rmdir } from "../fs"
import { globalInfo } from ".."
import { plugins } from "../utils/data-utils"
import { createProject } from "../utils/cli-utils"

program.version(require("../../package.json").version)

const { beforeBuild, afterBuild } = plugins

program
  .command("build")
  .description("Build static files")
  .action(async () => {
    globalInfo.status = "building"
    console.log("\n>> Building static files".yellow)

    for (let i = 0; i < beforeBuild.length; i++) {
      const plugin = beforeBuild[i]
      await plugin(globalInfo)
    }

    const startBuild = new Date().getTime()
    await build()
    const finishBuild = new Date().getTime()

    for (let i = 0; i < afterBuild.length; i++) {
      const plugin = afterBuild[i]
      await plugin(globalInfo)
    }

    console.log(
      `>> Build finished in`.yellow,
      `${finishBuild - startBuild} ms`.yellow.bold
    )
  })

program
  .command("serve [port]")
  .description("Creates live server and serve static sites")
  .action(async port => {
    globalInfo.status = "serving"
    await build()
    await serve(port)
  })

program
  .command("create <projectName> [template]")
  .description("Generates ulka project")
  .action(createProject)

program.parse(process.argv)

const exit = () => {
  if (globalInfo.status === "serving") rmdir(globalInfo.configs.buildPath)
  process.exit()
}

process.on("exit", () => {
  if (globalInfo.status === "serving") rmdir(globalInfo.configs.buildPath)
})
process.on("SIGINT", exit)
process.on("SIGUSR1", exit)
process.on("SIGUSR2", exit)
process.on("uncaughtException", exit)
