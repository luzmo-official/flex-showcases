import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})


export class AuthService {
  /*
    TODO Improve! Public datasets should be accessible without authentication.
    OR use env variables in order not to store the auth key and token in the code.
    OR use a backend service to retrieve the auth key and token.

    [
      {"id":"bc794688-f5b1-4dcb-953a-8a378f925968", "rights":"use"},
      {"id":"3c4062f0-25d1-4ebf-87f3-ce26364415f1", "rights":"use"},
      {"id":"512d9488-ddd9-48a0-887c-d56ec3960d57", "rights":"use"},
      {"id":"363589ee-2f40-4a28-a5ad-61bb0b5a0b14", "rights":"use"},
      {"id":"44d89eec-7c00-42f6-a353-ea5b76a63837", "rights":"use"}
    ]

    [
      {"id":"3c4062f0-25d1-4ebf-87f3-ce26364415f1", "rights":"use"},
      {"id":"363589ee-2f40-4a28-a5ad-61bb0b5a0b14", "rights":"use"},
      {"id":"031eca54-80f6-4cf0-8c72-66e6699d55c4", "rights":"use"},
      {"id":"97fb82d0-e7aa-4221-8f6e-a410014291b7", "rights":"use"},
      {"id":"30ee4df6-b311-4774-bbbd-3bdc52753f4a", "rights":"use"},
      {"id":"7f5e53e9-0a88-434d-92b3-030211bf6486", "rights":"use"},
      {"id":"82175f34-63c7-429e-9d12-d9cd8345f8cc", "rights":"use"},
      {"id":"efc00754-1825-41a7-8514-3702c722d142", "rights":"use"},
      {"id":"d37627f5-ba09-4cb1-8394-f6d649f89c05", "rights":"use"},
      {"id":"b473cd18-a525-40be-b3cc-05e1b57970a1", "rights":"use"}
]
  */;

  authKey = '75c54a8e-0155-4552-ad55-a51d6b209377';
  authToken = 'tiXbL4KjXPJLRP6O56naLhLHyUrK0XmDDDiO5k04vFT0N6kJxRuAdNFHeg2xa28bhjq2tExR5HzzAh1W3QxEcqhcr9tTlBCLUEq4gqWphv3IpBt1n66QCA50KcFb7hJ2tsNm6pnIA98dFCyzS22uvo';


  getAuth() {
    return { authKey: this.authKey, authToken: this.authToken };
  }
}