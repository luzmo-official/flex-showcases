import { BasePage } from '../base/base.po';

export class DragNDropChartLibraryPage extends BasePage {
  public readonly pageAdress = '/drag-n-drop-chart-library';
    
  public gotoMainPage = async () => await this.goto(this.pageAdress);
}
