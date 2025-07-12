# create-rwapp

An interactive CLI tool for scaffolding new web projects. create-rwapp lets you quickly start a new project with your choice of framework and optional tools like Tailwind CSS, ESLint, Prettier, and more, all pre-configured and ready to go.

Inspired by create-vite, this tool is designed to get you from zero to a running development server in seconds.

## Features

* **Interactive Interface**: A user-friendly interactive mode guides you through the setup process.
* **Framework Support**: Out-of-the-box support for React, Vue, Lit, and vanilla JS/TS.
* **TypeScript Ready**: First-class support for TypeScript across all relevant templates.
* **Optional Tooling**: Easily add and configure popular tools:
  * **Tailwind CSS**: With the official typography plugin.
  * **ESLint**: With optional support for Google's shareable config.
  * **Prettier**: For consistent code formatting.
  * **Vitest**: For fast unit testing.
  * **Playwright**: For robust end-to-end testing.
* **Git Integration**: Automatically initialize a Git repository and create a .gitignore file.
* **Verbose Output**: See exactly what the CLI is doing every step of the way.

## Getting Started

### Prerequisites

* Current Node.js LTS releases

## Installation

The recommended way to use create-rwapp is with npx, which ensures you are always using the latest version.

```bash
npx create-rwapp
```

## Usage

create-rwapp can be used in two ways: interactively or with command-line flags for full automation.

### Interactive Mode

For a guided experience, simply run the command without any arguments:

```bash
npx create-rwapp
```

The CLI will ask you for the project name, your desired framework, and which optional tools you'd like to include.

### Command-Line Flags

For faster setup or for use in automated scripts, you can provide all options as command-line flags.

```bash
npx create-rwapp <project-name> [options]
```

| Options Flag | Description |
| --- | --- |
| [project-name] |The name of the new project directory. |
| -f,<br>--framework &lt;type> | Specify the framework. Valid types: react-ts, react-js, vue-ts, vue-js, lit-ts, lit-js, vanilla-ts, vanilla-js. |
| --tailwind | Add and configure Tailwind CSS. |
| --eslint | Add and configure ESLint. |
| --google | Use Google's ESLint config (requires --eslint). |
| --vitest | Add and configure Vitest for unit testing. |
| --playwright | Add and configure Playwright for E2E testing. |
| --prettier | Add and configure Prettier. |
| --git | Initialize a new Git repository. |

## Examples

Create a new React + TypeScript project interactively:

```bash
npx create-rwapp
```

(...then follow the prompts)

Create a new Vue + JavaScript project named my-vue-app with Tailwind CSS and Prettier:

```bash
npx create-rwapp my-vue-app --framework vue-js --tailwind --prettier
```

Create a Lit + TypeScript project in the current directory with all tools and Git integration:

```bash
npx create-rwapp . --framework lit-ts --tailwind --eslint --vitest --playwright --prettier --git
```

## Contributing

Contributions are welcome! If you have suggestions for new features, templates, or improvements, please feel free to open an issue or submit a pull request.

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License.
