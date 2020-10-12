#!/usr/bin/env node

const path = require("path")
const { program } = require("commander")
const build = require("../src/ulka-cli/build")
const serve = require("../src/ulka-cli/serve")
const { getConfigs } = require("../src/utils/helpers")
const create = require("../src/ulka-cli/create")

program.version(require("../package.json").version)

const cwd = process.cwd()

program
  .command("build")
  .description("Build html from .md and .ulka files")
  .action(() => {
    const configs = getConfigs(cwd)
    build(cwd, configs)
  })

program
  .command("develop")
  .option("-p --port [port]", "server port", 3000)
  .description("Start dev server")
  .action(({ port }) => {
    const configs = getConfigs(cwd)

    configs.buildPath = path.join(cwd, ".debug")

    build(cwd, configs)

    port = +port || 3000
    serve({ live: true, base: configs.buildPath, port: +port }, configs, cwd)
  })

program
  .command("serve")
  .option("-p --port [port]", "server port", 3000)
  .description("Serve built static files")
  .action(({ port }) => {
    const configs = getConfigs(cwd)

    port = +port || 3000
    serve({ live: false, base: configs.buildPath, port: +port }, configs, cwd)
  })

program
  .command("create")
  .option("-p --projectName [projectName]", "Name of project")
  .option("-t --template [template]", "Template url")
  .action(({ template, projectName }) => {
    if (template && !template.startsWith("https://")) {
      template = "https://github.com/" + template
    }

    create({ template: template, name: projectName })
  })

program.parse(process.argv)
