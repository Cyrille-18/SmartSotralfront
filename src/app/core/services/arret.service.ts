import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { Arret } from '../../shared/models/arret.model';

@Injectable({
  providedIn: 'root',
})
export class ArretService extends BaseService<Arret> {
  constructor(http: HttpClient) {
    super(http);
    this.setEndpoint('arrets');
  }
}
