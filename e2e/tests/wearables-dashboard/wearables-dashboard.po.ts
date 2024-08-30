import { BasePage } from '../base/base.po';

export class WearablesDashboardPage extends BasePage {
    public readonly pageAdress = '/wearables-dashboard';

    
    public gotoMainPage = async () => await this.goto(this.pageAdress);
    public NumberOfStepsChart = () => this.page.getByText('Number of steps by minute', {exact: true});
}