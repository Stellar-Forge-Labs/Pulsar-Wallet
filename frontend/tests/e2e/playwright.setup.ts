import { afterAll, afterEach, beforeAll } from 'vitest';
import { chromium } from 'playwright';
import type { Browser, Page } from 'playwright';

declare module 'vitest' {
  export interface TestContext {
    page: Page;
    extensionOrigin: string;
  }
}

let browser: Browser;
let context: any;
let page: Page;

beforeAll(async () => {
  const extensionPath = new URL('../../dist', import.meta.url).pathname;
  browser = await chromium.launchPersistentContext(extensionPath, {
    headless: true,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
  });
  context = browser;
  page = await context.newPage();
});

afterEach(async () => {
  await page.goto('about:blank');
});

afterAll(async () => {
  await context.close();
  await browser.close();
});
