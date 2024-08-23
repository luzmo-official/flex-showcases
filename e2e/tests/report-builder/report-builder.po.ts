import { Page } from '@playwright/test';

export class ReportBuilderPage {
  /**
   * @todo: Extract to config file
   */
  public readonly URL = 'https://d2ojv9ksm0gp58.cloudfront.net/report-builder/';

  constructor(
    private page: Page,
  ) {}

  public gotoMainPage = () => this.page.goto(this.URL);
  public tableContainer = () => this.page.locator('.regular-table-container');
  public chartOneBar = () => this.page.locator('.bars-container .bar').first();
}
