import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { Ligne } from '../../shared/models/ligne.model';

@Injectable({
  providedIn: 'root',
})
export class LigneService extends BaseService<Ligne> {
  constructor(http: HttpClient) {
    super(http);
    this.setEndpoint('lignes');
  }
}
