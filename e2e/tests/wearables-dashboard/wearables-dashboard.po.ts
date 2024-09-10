import { BasePage } from '../base/base.po';

export class WearablesDashboardPage extends BasePage {
  public readonly pageAdress = '/wearables-dashboard';

  public gotoMainPage = async () => await this.goto(this.pageAdress);
  public cell = () => this.page.locator('g > .heattable-rect').first();
}
