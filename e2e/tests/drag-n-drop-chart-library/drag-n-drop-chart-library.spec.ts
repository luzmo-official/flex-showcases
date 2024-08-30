import { test, expect } from '@playwright/test';
import { DragNDropChartLibraryPage } from './drag-n-drop-chart-library.po';

test.describe('Drag and drop page', () => {
    test('should have working initial screen', async ({ page }) => {
      // given
      const dragNDropChartLibraryPage = new DragNDropChartLibraryPage(page);
  
      // when
      await dragNDropChartLibraryPage.gotoMainPage();
  
      // then
      await expect(page).toHaveScreenshot('init-page.png', { maxDiffPixelRatio: 0.05, fullPage: true});
    });
  });