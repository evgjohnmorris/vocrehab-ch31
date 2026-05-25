import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Veteran Resource Guide Accessibility Audits', () => {
  test('should have no automatically detectable WCAG 2.2 AA violations on the main app view', async ({ page, baseURL }) => {
    // Navigate to the app (using the base url from config or local fallback)
    const baseUrl = baseURL || process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5188/vocrehab-ch31/';
    await page.goto(baseUrl);
    await page.waitForSelector('.app-container', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Inject and run Axe scan
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'])
      .analyze();

    // Log violations nicely if there are any
    if (results.violations.length > 0) {
      console.error('\n[ACCESSIBILITY VIOLATIONS DETECTED]:');
      results.violations.forEach((violation, i) => {
        console.error(`\n${i + 1}. Violation: ${violation.id} (${violation.help})`);
        console.error(`   Severity: ${violation.impact}`);
        console.error(`   URL: ${violation.helpUrl}`);
        violation.nodes.forEach(node => {
          console.error(`   Selector: ${node.target.join(', ')}`);
          console.error(`   HTML Element: ${node.html}`);
        });
      });
    }

    expect(results.violations).toEqual([]);
  });
});
