import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Dataset, DatasetResult } from '../models/dataset.model';

const API_HOST = environment.devConfig.apiHost;
const API_PORT = environment.devConfig.apiPort;

@Injectable({
  providedIn: 'root',
})
export class DatasetService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private httpClient: HttpClient) {}

  retrieveDatasetColumns(
    credentials: { baseApiUrl?: string; key?: string; token?: string },
    id: string
  ): Observable<any> {
    return this.httpClient
      .post<any>(
        credentials.baseApiUrl + '/0.1.0/securable',
        {
          key: credentials.key,
          token: credentials.token,
          action: 'get',
          version: '0.1.0',
          find: {
            where: {
              id,
              type: 'dataset',
            },
            attributes: ['id', 'name', 'description'],
            include: [
              {
                model: 'Column',
                attributes: [
                  'id',
                  'name',
                  'description',
                  'type',
                  'subtype',
                  'format',
                ],
                order: ['id', 'asc'],
              },
            ],
          },
        },
        this.httpOptions
      )
  }

  retrieveAllDatasets(credentials: {
    baseApiUrl?: string;
    key?: string;
    token?: string;
  }): Observable<any> {
    return this.httpClient.post<any>(
      credentials.baseApiUrl + '/0.1.0/securable',
      {
        key: credentials.key,
        token: credentials.token,
        action: 'get',
        version: '0.1.0',
        find: {
          where: { type: 'dataset' },
          attributes: ['id', 'name', 'description'],
          order: [['modified_at', 'desc']],
        },
      },
      this.httpOptions
    );
  }
}
