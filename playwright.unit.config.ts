import { defineConfig } from '@playwright/test';
// Funções puras: sem login, navegador, servidor ou Supabase.
export default defineConfig({ testDir: './e2e', testMatch: /unit-(editor-snapshot|management|base-state|production-plan)\.spec\.ts/, workers: 1, retries: 0, reporter: 'list' });
