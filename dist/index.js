#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import prompts from 'prompts';
import { Command } from 'commander';
import { fileURLToPath } from 'url';
// --- Helper Functions ---
const copyRecursiveSync = (src, dest) => {
    const exists = fs.existsSync(src);
    if (exists) {
        const stats = fs.statSync(src);
        const isDirectory = stats.isDirectory();
        if (isDirectory) {
            fs.mkdirSync(dest, { recursive: true });
            fs.readdirSync(src).forEach(childItemName => {
                copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
            });
        }
        else {
            fs.copyFileSync(src, dest);
        }
    }
};
const writeToFile = (filePath, content) => {
    fs.writeFileSync(filePath, content);
};
// --- Main CLI Logic ---
const main = async () => {
    const program = new Command();
    program
        .name('create-rwapp')
        .description('A CLI to create a new web project with a specified framework.')
        .argument('[project-name]', 'The name of the project')
        .option('-f, --framework <type>', 'Specify the framework: react-ts, react-js, vue-ts, vue-js, lit-ts, lit-js, vanilla-ts, vanilla-js')
        .option('--tailwind', 'Install Tailwind CSS')
        .option('--eslint', 'Install ESLint')
        .option('--google', "Use Google's ESLint config (requires --eslint)")
        .option('--vitest', 'Install Vitest for unit testing')
        .option('--playwright', 'Install Playwright for E2E testing')
        .option('--prettier', 'Install Prettier')
        .option('--git', 'Initialize a git repository')
        .action(async (projectName, options) => {
        let responses = { projectName, ...options };
        // --- Interactive prompts for missing options ---
        if (!projectName) {
            const { name } = await prompts({
                type: 'text',
                name: 'name',
                message: 'What is your project named?',
                initial: 'my-rwapp-project'
            });
            if (!name)
                process.exit(0);
            responses.projectName = name;
        }
        if (!options.framework) {
            const { framework } = await prompts({
                type: 'select',
                name: 'framework',
                message: 'Select a framework:',
                choices: [
                    { title: 'React (TypeScript)', value: 'react-ts' },
                    { title: 'React (JavaScript)', value: 'react-js' },
                    { title: 'Vue (TypeScript)', value: 'vue-ts' },
                    { title: 'Vue (JavaScript)', value: 'vue-js' },
                    { title: 'Lit (TypeScript)', value: 'lit-ts' },
                    { title: 'Lit (JavaScript)', value: 'lit-js' },
                    { title: 'Plain TypeScript', value: 'vanilla-ts' },
                    { title: 'Plain JavaScript', value: 'vanilla-js' },
                ],
                initial: 0
            });
            if (!framework)
                process.exit(0);
            responses.framework = framework;
        }
        const { projectName: finalProjectName, framework, tailwind, eslint, google: eslintGoogleConfig, vitest, playwright, prettier, git } = responses;
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const projectDir = path.resolve(process.cwd(), finalProjectName);
        const templateDir = path.resolve(__dirname, '..', 'templates', framework);
        if (fs.existsSync(projectDir)) {
            console.error(`Error: Directory '${finalProjectName}' already exists.`);
            process.exit(1);
        }
        console.log(`\nCreating a new project in ${projectDir}...`);
        // Copy base template from the external directory
        copyRecursiveSync(templateDir, projectDir);
        // --- package.json modifications ---
        const packageJsonPath = path.join(projectDir, 'package.json');
        let packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        packageJson.name = finalProjectName;
        const devDependencies = {};
        if (tailwind) {
            devDependencies['tailwindcss'] = '^3.4.1';
            devDependencies['postcss'] = '^8.4.33';
            devDependencies['autoprefixer'] = '^10.4.17';
            devDependencies['@tailwindcss/typography'] = '^0.5.10';
            const tailwindConfig = `/** @type {import('tailwindcss').Config} */\nexport default {\n  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,vue,lit}"],\n  theme: {\n    extend: {},\n  },\n  plugins: [require('@tailwindcss/typography')],\n}`;
            writeToFile(path.join(projectDir, 'tailwind.config.js'), tailwindConfig);
            const postcssConfig = `export default {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n}`;
            writeToFile(path.join(projectDir, 'postcss.config.js'), postcssConfig);
            const cssFileName = framework.startsWith('vue') || framework.startsWith('vanilla') ? 'style.css' : 'index.css';
            const cssPath = path.join(projectDir, 'src', cssFileName);
            if (fs.existsSync(cssPath)) {
                let cssContent = fs.readFileSync(cssPath, 'utf8');
                cssContent = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n${cssContent}`;
                writeToFile(cssPath, cssContent);
            }
        }
        if (eslint) {
            devDependencies['eslint'] = '^8.56.0';
            packageJson.scripts.lint = 'eslint . --ext .js,.jsx,.ts,.tsx,.vue';
            let eslintConfig = {
                "env": { "browser": true, "es2021": true, "node": true },
                "extends": ["eslint:recommended"],
                "parserOptions": { "ecmaVersion": "latest", "sourceType": "module" },
                "rules": {}
            };
            if (framework.includes('ts')) {
                devDependencies['@typescript-eslint/parser'] = '^6.19.0';
                devDependencies['@typescript-eslint/eslint-plugin'] = '^6.19.0';
                eslintConfig.parser = '@typescript-eslint/parser';
                eslintConfig.plugins = ['@typescript-eslint'];
                eslintConfig.extends.push('plugin:@typescript-eslint/recommended');
            }
            if (framework.startsWith('react')) {
                devDependencies['eslint-plugin-react'] = '^7.33.2';
                eslintConfig.extends.push('plugin:react/recommended', 'plugin:react/jsx-runtime');
            }
            if (framework.startsWith('vue')) {
                devDependencies['eslint-plugin-vue'] = '^9.20.1';
                eslintConfig.extends.push('plugin:vue/vue3-essential');
            }
            if (eslintGoogleConfig) {
                devDependencies['eslint-config-google'] = '^0.14.0';
                eslintConfig.extends.push('google');
            }
            writeToFile(path.join(projectDir, '.eslintrc.json'), JSON.stringify(eslintConfig, null, 2));
        }
        if (vitest) {
            devDependencies['vitest'] = '^1.2.1';
            devDependencies['jsdom'] = '^24.0.0';
            packageJson.scripts.test = 'vitest';
            const viteConfigPath = path.join(projectDir, 'vite.config.ts');
            if (fs.existsSync(viteConfigPath)) {
                let viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
                viteConfig = viteConfig.replace("import { defineConfig } from 'vite'", `/// <reference types="vitest" />\nimport { defineConfig } from 'vite'`);
                viteConfig = viteConfig.replace("plugins:", `  test: {\n    globals: true,\n    environment: 'jsdom',\n  },\n  plugins:`);
                writeToFile(viteConfigPath, viteConfig);
            }
        }
        if (playwright) {
            devDependencies['@playwright/test'] = '^1.41.1';
            packageJson.scripts['test:e2e'] = 'playwright test';
            const playwrightConfig = `import { defineConfig, devices } from '@playwright/test';\n\nexport default defineConfig({\n  testDir: './tests-e2e',\n  fullyParallel: true,\n  forbidOnly: !!process.env.CI,\n  retries: process.env.CI ? 2 : 0,\n  workers: process.env.CI ? 1 : undefined,\n  reporter: 'html',\n  use: {\n    baseURL: 'http://localhost:5173',\n    trace: 'on-first-retry',\n  },\n  projects: [\n    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },\n    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },\n    { name: 'webkit', use: { ...devices['Desktop WebKit'] } },\n  ],\n  webServer: {\n    command: 'npm run dev',\n    url: 'http://localhost:5173',\n    reuseExistingServer: !process.env.CI,\n  },\n});`;
            writeToFile(path.join(projectDir, 'playwright.config.ts'), playwrightConfig);
            fs.mkdirSync(path.join(projectDir, 'tests-e2e'));
            const exampleTest = `import { test, expect } from '@playwright/test';\n\ntest('has title', async ({ page }) => {\n  await page.goto('/');\n  await expect(page).toHaveTitle(/Vite/);\n});`;
            writeToFile(path.join(projectDir, 'tests-e2e', 'example.spec.ts'), exampleTest);
        }
        if (prettier) {
            devDependencies['prettier'] = '^3.2.4';
            packageJson.scripts.format = 'prettier --write .';
            const prettierConfig = { "semi": true, "tabWidth": 2, "printWidth": 100, "singleQuote": true, "trailingComma": "es5", "jsxSingleQuote": true };
            writeToFile(path.join(projectDir, '.prettierrc.json'), JSON.stringify(prettierConfig, null, 2));
            const prettierIgnore = `node_modules\ndist`;
            writeToFile(path.join(projectDir, '.prettierignore'), prettierIgnore);
        }
        packageJson.devDependencies = { ...packageJson.devDependencies, ...devDependencies };
        writeToFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
        if (git) {
            const gitignoreContent = `node_modules\ndist\n.env\n.env.*\n*.local\n\n# Editor directories and files\n.vscode\n.idea\n*.suo\n*.ntvs*\n*.njsproj\n*.sln\n*.sw?`;
            writeToFile(path.join(projectDir, '.gitignore'), gitignoreContent);
        }
        console.log('\nDone. Now run:\n');
        console.log(`  cd ${finalProjectName}`);
        console.log('  npm install');
        if (git) {
            try {
                execSync('git init', { cwd: projectDir, stdio: 'ignore' });
                console.log('  git init');
            }
            catch (e) {
                console.error('Could not initialize git repository.');
            }
        }
        console.log('  npm run dev\n');
    });
    await program.parseAsync(process.argv);
};
main().catch(e => {
    console.error(e);
});
