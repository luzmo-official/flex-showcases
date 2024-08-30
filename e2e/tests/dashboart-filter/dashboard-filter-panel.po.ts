import { BasePage } from '../base/base.po';

export class DashboartFilterpanelPage extends BasePage {
    public readonly pageAdress = '/dashboard-filter-panel';

    
    public gotoMainPage = async () => await this.goto(this.pageAdress);
    public weightedPipelineValue = () => this.page.getByText('Weighted pipeline value (€)', {exact: true}).first();
}