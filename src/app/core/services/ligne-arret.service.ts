import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';

export interface LigneArretDto {
  id?: number;
  trackingId?: string;
  ligneTrackingId: string;
  arretTrackingId: string;
  ordre?: number;
}

@Injectable({ providedIn: 'root' })
export class LigneArretService extends BaseService<LigneArretDto> {
  constructor(http: HttpClient) {
    super(http);
    this.setEndpoint('ligne-arrets');
  }
}
