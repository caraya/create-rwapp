# The original prompt

create a create-rwapp tyepscript node packagee similar in functionality to create-vite (hosted in this github repo: <https://github.com/vitejs/vite/tree/main/packages/create-vite>) that allows users to create a new project with a specific framework and language.

Include a web server configured for hot module replacement and a build system that bundles the application for production.

The types of packages you can create are:

* Lit (javascript)
* Lit (Typescript)
* Vue (Javascript)
* Vue (Typescript)
* React (Typescript) Default
* React (javascript)
* Plain Javascript
* Plain React (with all the necessary transpilation tools)

Provide a basic hello world template for each package type and copy the necessary files to the new project directory

Additional options

* Whether to install Tailwind from 4play and the typography module and configure them
* Whether to install ESLint and the corresponding configuration files
  * If Eslint is installed ask if the user wants to instll the corresponding google shareable config based on the language selected
* Whether the user wants to install vitest for testing. If they do provide the necessary configuration files excluding the test files playwright uses
* ask the user if they want to install @playwright/test for end-to-end testing. If they do provide the necessary configuration files excluding the test files vitest uses
* ask if the user wants to install prettier and the corresponding configuration files
* ask if the user wants to initialize a git repository. If they do, initialize it and create a .gitignore file for the appropriate package type
