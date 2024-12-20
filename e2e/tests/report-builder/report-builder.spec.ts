import { test, expect } from '@playwright/test';
import { ReportBuilderPage } from './report-builder.po.ts';

test.describe('Report builder', () => {
  test('should have working initial screen', async ({ page }) => {
    // given
    const reportBuilderPage = new ReportBuilderPage(page);

    // when
    await reportBuilderPage.gotoMainPage();
    await reportBuilderPage.tableContainer().waitFor({ state: 'visible' });
    await reportBuilderPage.chartOneBar().waitFor({ state: 'visible' });

    // then
    await expect(page).toHaveScreenshot('init-page.png', { maxDiffPixelRatio: 0.1, fullPage: true});
  });
});
