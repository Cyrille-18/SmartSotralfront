import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../shared/components/toast/toast.service';
import { PositionGPSService } from '../../core/services/position-gps.service';
import { Subscription, interval, switchMap, catchError, of } from 'rxjs';

@Component({
  selector: 'app-suivi-carte',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="map-page">
      <div id="map" class="map-container">
        <p class="map-placeholder-text">Chargement de la carte…</p>
      </div>
      <div class="panel">
        <div class="panel-header">
          <h3>Bus actifs</h3>
          <button class="btn-secondary" (click)="refreshOnce()">Rafraîchir</button>
        </div>
        <ul class="bus-list">
          <li *ngFor="let bus of busActifs">
            <strong>{{ bus.code }}</strong> — {{ bus.vitesse ?? '?' }} km/h — Ligne {{ bus.ligne }}
          </li>
          <li *ngIf="busActifs.length === 0" class="empty">Aucun bus actif.</li>
        </ul>
        <label class="toggle">
          <input type="checkbox" [(ngModel)]="afficherArrets" (change)="toggleArrets()" />
          Afficher les arrêts
        </label>
      </div>
    </div>
  `,
  styles: [`
    .map-page {
      height: 100%;
      display: flex;
      gap: 16px;
    }

    .map-container {
      flex: 1;
      background-color: #e0e0e0;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
      font-size: 18px;
      position: relative;
    }

    .map-placeholder-text {
      position: absolute;
      top: 16px;
      left: 16px;
      margin: 0;
      background: rgba(255,255,255,0.9);
      padding: 6px 10px;
      border-radius: 4px;
      color: #555;
      font-size: 13px;
    }

    .panel {
      width: 280px;
      background-color: var(--sotral-blanc);
      border-radius: 4px;
      padding: 16px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow-y: auto;
    }

    .panel-header { display: flex; justify-content: space-between; align-items: center; }
    .panel h3 { margin-top: 0; color: var(--sotral-vert); }

    .bus-list {
      list-style: none;
      padding: 0;

      li {
        padding: 8px 12px;
        border-bottom: 1px solid var(--sotral-gris-b);
        cursor: pointer;
        transition: background-color 0.2s ease;

        &:hover {
          background-color: var(--sotral-gris-l);
        }
      }
    }

    .toggle { display: flex; align-items: center; gap: 8px; font-weight: 600; color: var(--sotral-noir); margin-top: 12px; }
    .empty { color: #999; }
  `],
})
export class SuiviCarteComponent implements AfterViewInit, OnDestroy {
  private map: any;
  private markers: any[] = [];
  private arretLayer?: any;
  private pollingSub?: Subscription;

  busActifs: Array<{ code: string; vitesse?: number; ligne?: string; lat?: number; lng?: number }> = [];
  afficherArrets = false;

  constructor(
    private toast: ToastService,
    private positionService: PositionGPSService
  ) {}

  async ngAfterViewInit(): Promise<void> {
    await this.initMap();
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.pollingSub?.unsubscribe();
  }

  private async initMap(): Promise<void> {
    try {
      const L: any = (await import('leaflet')).default || (await import('leaflet'));
      this.map = L.map('map').setView([6.1375, 1.2123], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(this.map);
    } catch (e) {
      this.toast.error('Leaflet non installé. Ajoutez leaflet et @types/leaflet.');
    }
  }

  private startPolling(): void {
    this.pollingSub = interval(5000)
      .pipe(
        switchMap(() => this.positionService.getDernierePositions().pipe(catchError(() => of([]))))
      )
      .subscribe(data => {
        this.busActifs = data.map((p: any) => ({
          code: p.busCode || p.busId || 'BUS',
          vitesse: p.vitesse,
          ligne: p.ligne || p.ligneId,
          lat: p.latitude,
          lng: p.longitude,
        }));
        this.refreshMarkers();
      });
  }

  refreshOnce(): void {
    this.positionService.getDernierePositions().subscribe({
      next: data => {
        this.busActifs = data as any;
        this.refreshMarkers();
      },
      error: () => this.toast.warning('Positions indisponibles'),
    });
  }

  private async refreshMarkers(): Promise<void> {
    if (!this.map) return;
    const L: any = (await import('leaflet')).default || (await import('leaflet'));
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];
    this.busActifs.forEach(b => {
      if (b.lat && b.lng) {
        const m = L.marker([b.lat, b.lng], { title: b.code }).addTo(this.map);
        m.bindPopup(`${b.code} — ${b.ligne ?? 'Ligne ?'}`);
        this.markers.push(m);
      }
    });
  }

  async toggleArrets(): Promise<void> {
    if (!this.map) return;
    const L: any = (await import('leaflet')).default || (await import('leaflet'));
    if (this.afficherArrets) {
      const arrets = await this.fetchArrets();
      this.arretLayer = L.layerGroup(
        arrets.map(a => L.circleMarker([a.latitude, a.longitude], { color: '#c0392b' }).bindPopup(a.nom))
      ).addTo(this.map);
    } else if (this.arretLayer) {
      this.map.removeLayer(this.arretLayer);
      this.arretLayer = undefined;
    }
  }

  private fetchArrets(): Promise<any[]> {
    // Could be replaced with ArretService; keeping simple to avoid extra dependency here.
    return Promise.resolve([]);
  }
}
