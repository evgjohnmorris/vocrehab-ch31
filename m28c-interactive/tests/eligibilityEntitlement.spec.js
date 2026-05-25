import { test, expect } from '@playwright/test';

test.describe('VR&E Eligibility & Entitlement Adjudication E2E Tests', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    const baseUrl = baseURL || process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5188/vocrehab-ch31/';
    await page.goto(baseUrl);
    await page.waitForSelector('.app-container', { timeout: 10000 });
    
    // Navigate to Eligibility & Entitlement view
    await page.getByRole('button', { name: 'Eligibility & Entitlement' }).click();
    await page.waitForSelector('h1:has-text("Eligibility & Entitlement Adjudication System")');
  });

  test('should load and analyze "20% Rating with Active EH" scenario correctly', async ({ page }) => {
    // Click scenario preset
    await page.getByRole('button', { name: '20% Rating with Active EH' }).click();
    
    // Check results dashboard on the right
    const dashboard = page.locator('h3:has-text("Statutory Entitlement Assessment")').locator('xpath=../..');
    
    // Verify path title
    await expect(dashboard).toContainText('Likely Entitled (20%+ Rating & Active Employment Handicap)');
    
    // Verify controlling law
    await expect(dashboard).toContainText('38 C.F.R. § 21.51');
    
    // Verify supporting facts
    await expect(dashboard).toContainText('Disability rating of 20% satisfies baseline');
    
    // Assert no forbidden terms in dashboard
    const content = await dashboard.textContent();
    expect(content).not.toContain('Approved');
    expect(content).not.toContain('Denied');
    expect(content).not.toContain('Guaranteed');
    expect(content).not.toContain('Automatically entitled');
  });

  test('should load and analyze "10% Rating (Expired 12-Year Window & SEH)" scenario correctly', async ({ page }) => {
    // Click scenario preset
    await page.getByRole('button', { name: '10% Rating (Expired 12-Year Window & SEH)' }).click();
    
    // Check results dashboard
    const dashboard = page.locator('h3:has-text("Statutory Entitlement Assessment")').locator('xpath=../..');
    
    // Verify path title
    await expect(dashboard).toContainText('Likely Entitled (10% Rating & Serious Employment Handicap)');
    
    // Verify controlling law
    await expect(dashboard).toContainText('38 C.F.R. § 21.52');
    
    // Verify expired delimiting window warning/adverse facts
    await expect(dashboard).toContainText('eligibility period has expired');
    
    // Assert no forbidden terms in dashboard
    const content = await dashboard.textContent();
    expect(content).not.toContain('Approved');
    expect(content).not.toContain('Denied');
    expect(content).not.toContain('Guaranteed');
    expect(content).not.toContain('Automatically entitled');
  });

  test('should load and analyze "Employed, but Unsuitable Job (Proposed Denial)" scenario correctly', async ({ page }) => {
    // Click scenario preset
    await page.getByRole('button', { name: 'Employed, but Unsuitable Job (Proposed Denial)' }).click();
    
    // Check results dashboard
    const dashboard = page.locator('h3:has-text("Statutory Entitlement Assessment")').locator('xpath=../..');
    
    // Verify path title (since there is a proposed denial but no written decision notice)
    await expect(dashboard).toContainText('Denial Posture (Formal Written Rationale Requested)');
    
    // Verify controlling law
    await expect(dashboard).toContainText('38 C.F.R. § 21.50');
    
    // Verify next steps tells them to request written decision
    await expect(dashboard).toContainText('Request a formal written Decision Notice');
    
    // Assert no forbidden terms in dashboard
    const content = await dashboard.textContent();
    expect(content).not.toContain('Approved');
    expect(content).not.toContain('Denied');
    expect(content).not.toContain('Guaranteed');
    expect(content).not.toContain('Automatically entitled');
  });

  test('should load and analyze "Severe Conditions (Feasibility Uncertainty)" scenario correctly', async ({ page }) => {
    // Click scenario preset
    await page.getByRole('button', { name: 'Severe Conditions (Feasibility Uncertainty)' }).click();
    
    // Check results dashboard
    const dashboard = page.locator('h3:has-text("Statutory Entitlement Assessment")').locator('xpath=../..');
    
    // Verify path title
    await expect(dashboard).toContainText('Entitled, but Vocational Feasibility Disputed');
    
    // Verify controlling law mentions 21.74 (Extended Evaluation)
    await expect(dashboard).toContainText('38 C.F.R. § 21.74');
    
    // Verify next steps mentions Extended Evaluation
    await expect(dashboard).toContainText('Extended Evaluation plan');
    
    // Assert no forbidden terms in dashboard
    const content = await dashboard.textContent();
    expect(content).not.toContain('Approved');
    expect(content).not.toContain('Denied');
    expect(content).not.toContain('Guaranteed');
    expect(content).not.toContain('Automatically entitled');
  });

  test('should load and analyze "Dishonorable Discharge statutory bar" scenario correctly', async ({ page }) => {
    // Click scenario preset
    await page.getByRole('button', { name: 'Dishonorable Discharge statutory bar' }).click();
    
    // Check results dashboard
    const dashboard = page.locator('h3:has-text("Statutory Entitlement Assessment")').locator('xpath=../..');
    
    // Verify path title
    await expect(dashboard).toContainText('Statutory Criteria Not Satisfied');
    
    // Verify adverse facts
    await expect(dashboard).toContainText('Dishonorable discharge status acts as a statutory bar');
    
    // Verify next steps mentions character upgrade
    await expect(dashboard).toContainText('Discharge Review Board');
    
    // Assert no forbidden terms in dashboard
    const content = await dashboard.textContent();
    expect(content).not.toContain('Approved');
    expect(content).not.toContain('Denied');
    expect(content).not.toContain('Guaranteed');
    expect(content).not.toContain('Automatically entitled');
  });
});
