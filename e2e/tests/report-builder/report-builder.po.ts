import { BasePage } from '../base/base.po';

export class ReportBuilderPage extends BasePage {
  public readonly pageAdress = '/report-builder/';

  public gotoMainPage = async () => await this.goto(this.pageAdress);
  
  public tableContainer = () => this.page.locator('.regular-table-container');
  public chartOneBar = () => this.page.locator('.bars-container .bar').first();
}