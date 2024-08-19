import { inject, Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import Luzmo from "@luzmo/nodejs-sdk";
import { from, Observable } from "rxjs";
import { map, tap } from "rxjs/operators";

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private readonly authService = inject(AuthService);
  authKey: string;
  authToken?: string;
  // cache: Record<string, any> = {};

  client: Luzmo;

  constructor() {
    const auth = this.authService.getAuth();
    this.authKey = auth.authKey;
    this.authToken = auth.authToken;

    this.client = new Luzmo({
      api_key: this.authKey,
      api_token: this.authToken,
      host: 'https://api.luzmo.com',
    });
  }

  generateChart(question: string, datasetId: string): Observable<any> {
    return from(this.client.create(('aichart' as any), {
      type: 'generate-chart',
      dataset_id: datasetId,
      question: question,
      model_preference: 'performance'
    }));
  }

  getDatasetColumns(datasetIds: string[]): Observable<any> {
    //return observable from cache if available and less than 5 minutes old
    /*if (this.cache[datasetId]?.fetchedAt && (new Date().getTime() - this.cache[datasetId].fetchedAt.getTime()) < 300000 && this.cache[datasetId].value) {
      return from([this.cache[datasetId].value]);
    }*/
    return from(this.client.get('securable', {
      where: {
        // id: datasetId,
        id: {
          in: datasetIds,
        },
        // type: 'dataset'
      },
      attributes: ['id', 'name', 'description'],
      include: [
        {
          model: 'Column',
        },
        {
          model: 'Formula'
        }
      ],
    }))
      .pipe(
        map((result) => result.rows.flatMap((dataset) => dataset.columns)),
        tap((result) => {
          // this.cache[datasetId] = { value: result, fetchedAt: new Date() };
      }));
  }
}