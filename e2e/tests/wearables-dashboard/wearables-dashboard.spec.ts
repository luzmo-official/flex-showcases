import { test, expect } from '@playwright/test';
import { WearablesDashboardPage } from '../wearables-dashboard/wearables-dashboard.po';

test.describe('Wearables dashboard', () => {
    test('should have working initial screen', async ({ page }) => {
      // given
      const wearablesDashboardPage = new WearablesDashboardPage(page);
  
      // when
      await wearablesDashboardPage.gotoMainPage();
      await wearablesDashboardPage.NumberOfStepsChart().waitFor({ state: 'visible' });
  
      // then
      await expect(page).toHaveScreenshot('init-page.png', { maxDiffPixelRatio: 0.05, fullPage: true});
    });
  });