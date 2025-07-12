import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as child_process from 'child_process';
import prompts from 'prompts';

// --- Module Mocks ---
// We still need to mock modules that have external side effects or require user input.
vi.mock('child_process');
vi.mock('prompts');

// Mock the commander module to capture the action handler without running the whole program.
const actionSpy = vi.fn().mockReturnThis();
vi.mock('commander', () => ({
  Command: vi.fn().mockImplementation(() => ({
    name: vi.fn().mockReturnThis(),
    description: vi.fn().mockReturnThis(),
    argument: vi.fn().mockReturnThis(),
    option: vi.fn().mockReturnThis(),
    action: actionSpy,
    parseAsync: vi.fn().mockResolvedValue(undefined),
  })),
}));


// --- Test Suite ---
describe('create-rwapp CLI (File System Tests)', () => {
  let testDir: string;
  let actionCallback: (...args: any[]) => void | Promise<void>;
  let execSyncSpy: any;

  // Set up a temporary directory for file system operations before each test
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    actionSpy.mockClear();

    // Create a unique temporary directory for each test
    testDir = path.join(os.tmpdir(), `rwapp-test-${Math.random().toString(36).substring(2)}`);
    fs.mkdirSync(testDir, { recursive: true });
    
    // Mock execSync before we import the CLI
    execSyncSpy = vi.spyOn(child_process, 'execSync').mockReturnValue(Buffer.from(''));

    // We need to change the process's current directory so the CLI creates files in our temp dir
    process.chdir(testDir);

    // Dynamically import the CLI script to register the commander action
    await import('./index.js');
    if (actionSpy.mock.calls.length === 0) {
      throw new Error('program.action() was not called by the CLI script.');
    }
    actionCallback = actionSpy.mock.calls[0][0];
  });

  // Clean up the temporary directory after each test
  afterEach(() => {
    process.chdir(__dirname); // Change back to the original directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should create a React TS project with Tailwind and Git', async () => {
    const projectName = 'test-project-react';
    const projectPath = path.join(testDir, projectName);

    // Mock prompts to be non-interactive
    (prompts as any).mockResolvedValue({});
    
    // Run the captured action handler
    await actionCallback(projectName, {
      framework: 'react-ts',
      tailwind: true,
      git: true,
    });

    // Assertions using the actual file system
    expect(fs.existsSync(projectPath)).toBe(true);
    expect(fs.existsSync(path.join(projectPath, 'package.json'))).toBe(true);
    expect(fs.existsSync(path.join(projectPath, 'tailwind.config.js'))).toBe(true);
    expect(fs.existsSync(path.join(projectPath, '.gitignore'))).toBe(true);
    
    const pkgJson = JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json'), 'utf-8'));
    expect(pkgJson.name).toBe(projectName);
    expect(pkgJson.devDependencies).toHaveProperty('tailwindcss');

    expect(execSyncSpy).toHaveBeenCalledWith('git init', expect.any(Object));
  });

  it('should create a Vue project with ESLint and Prettier', async () => {
    const projectName = 'test-project-vue';
    const projectPath = path.join(testDir, projectName);

    // Mock prompts
    (prompts as any).mockResolvedValue({});
    
    // Run the action handler
    await actionCallback(projectName, {
      framework: 'vue-js',
      eslint: true,
      prettier: true,
    });
    
    // Assertions using the actual file system
    expect(fs.existsSync(projectPath)).toBe(true);
    expect(fs.existsSync(path.join(projectPath, '.eslintrc.json'))).toBe(true);
    expect(fs.existsSync(path.join(projectPath, '.prettierrc.json'))).toBe(true);

    const eslintConfig = JSON.parse(fs.readFileSync(path.join(projectPath, '.eslintrc.json'), 'utf-8'));
    expect(eslintConfig.extends).toContain('plugin:vue/vue3-essential');

    expect(execSyncSpy).not.toHaveBeenCalled();
  });
});
