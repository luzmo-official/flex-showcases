import { test, expect } from '@playwright/test';
import { DashboartFilterpanelPage } from './dashboard-filter-panel.po';

test.describe('Dashboard filter panel page', () => {
  test('should have working initial screen', async ({ page }) => {
    // given
    const dashboartFilterpanelPage = new DashboartFilterpanelPage(page);
  
    // when
    await dashboartFilterpanelPage.gotoMainPage();
    await dashboartFilterpanelPage.weightedPipelineValue().waitFor({ state: 'visible' });
  
    // then
    await expect(page).toHaveScreenshot('init-page.png', { maxDiffPixelRatio: 0.1, fullPage: true});
  });
});
