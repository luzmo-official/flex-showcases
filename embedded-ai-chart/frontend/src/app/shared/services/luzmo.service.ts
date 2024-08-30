import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AIChart } from '../models/aichart.model';
import { AuthorizationResult } from '../models/authorization.model';
import { ConfigService } from './config.service';

@Injectable()
export class LuzmoService {
  constructor(
    private httpClient: HttpClient,
    private configService: ConfigService
  ) {}

  retrieveAuthorization(dashboard_ids: string[], dataset_ids: string[]): Observable<AuthorizationResult> {
    return this.httpClient.post(`${this.configService.apiUrl}/retrieve-embed-token`, { dashboard_ids, dataset_ids }) as Observable<AuthorizationResult>;
  }

  retrieveAIChart(dataset_id: string, question: string, message_history?: any[]): Observable<AIChart> {
    return this.httpClient.post(`${this.configService.apiUrl}/retrieve-ai-chart`, { dataset_id, question, message_history }) as Observable<AIChart>;
  }
}
