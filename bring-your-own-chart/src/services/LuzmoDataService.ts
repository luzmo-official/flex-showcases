import Luzmo, { Options } from '@luzmo/nodejs-sdk';

export class LuzmoDataService {
  luzmoClient: Luzmo;

  constructor(authKey?: string, authToken?: string) {
    const luzmoSDKOptions: Options = {
      api_key: authKey ?? '',
      api_token: authToken ?? '',
    };

    this.luzmoClient = new Luzmo(luzmoSDKOptions);
  }

  async getCases(casesTypeColumn, casesStatusColumn) {
    const { data, performance } = await this.luzmoClient.query({
      queries: [
        {
          dimensions: [
            {
              column_id: casesTypeColumn.columnId,
              dataset_id: casesTypeColumn.datasetId,
            },
            {
              column_id: casesStatusColumn.columnId,
              dataset_id: casesStatusColumn.datasetId,
            },
          ],
          measures: [
            {
              column_id: '*',
              dataset_id: casesTypeColumn.datasetId,
            },
          ],
          where: [],
        },
      ],
    });

    return data;
  }
}
