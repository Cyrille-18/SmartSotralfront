import { Component, ChangeDetectionStrategy, signal, computed, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Arret } from '../../shared/models/arret.model';
import { Ligne } from '../../shared/models/ligne.model';
import { PositionBus } from '../../shared/models/position-bus.model';
import { Prediction } from '../../shared/models/prediction.model';
import { PositionGPSService } from '../../core/services/position-gps.service';
import { ArretService } from '../../core/services/arret.service';
import { LigneService } from '../../core/services/ligne.service';
import { PredictionService } from '../../core/services/prediction.service';
import { LigneArretService, LigneArretDto } from '../../core/services/ligne-arret.service';
import { Subscription, interval, switchMap, catchError, of } from 'rxjs';

type LatLng = [number, number];

@Component({
  selector: 'app-carte',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-carte">
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">Carte Réseau</h1>
          <p class="page-subtitle">Suivi en temps réel des bus et arrêts</p>
        </div>
      </div>

      <div class="carte-container">
        <!-- Sidebar Lignes -->
        <aside class="sidebar" [class.collapsed]="sidebarCollapsed()">
          <div class="sidebar-header">
            <h3>Lignes</h3>
            <button class="btn-toggle" (click)="sidebarCollapsed.set(!sidebarCollapsed())">
              {{ sidebarCollapsed() ? '→' : '←' }}
            </button>
          </div>

          @if (!sidebarCollapsed()) {
            <div class="lignes-list">
              @for (ligne of lignes(); track ligne.trackingId) {
                <div
                  [class.active]="ligne.trackingId ? activeLignes().includes(ligne.trackingId) : false"
                  class="ligne-item"
                  (click)="toggleLigne(ligne.trackingId)">
                  <input
                    type="checkbox"
                    [checked]="ligne.trackingId ? activeLignes().includes(ligne.trackingId) : false"
                    (click)="$event.stopPropagation()">
                  <span class="ligne-label">
                    {{ ligne.numero }}
                    <span class="ligne-count">{{ getArretsForLigne(ligne.trackingId) }}</span>
                  </span>
                </div>
              }
            </div>

            <div class="sidebar-section">
              <h4>Bus actifs</h4>
              <div class="bus-list">
                @for (bus of activeBuses(); track bus.busTrackingId) {
                  <div
                    class="bus-item"
                    [class.selected]="selectedBus()?.busTrackingId === bus.busTrackingId"
                    (click)="selectedBus.set(bus)">
                    <div class="bus-icon">
                      <span class="status-dot" [style.background]="bus.missionActive ? 'var(--sotral-vert)' : '#999'">●</span>
                    </div>
                    <div class="bus-info">
                      <div class="bus-immat">{{ bus.busCode }}</div>
                      <div class="bus-detail">{{ bus.vitesse }} km/h</div>
                    </div>
                  </div>
                } @empty {
                  <div class="empty-state">Aucun bus</div>
                }
              </div>
            </div>
          }
        </aside>

        <!-- Map Container -->
        <div class="map-wrapper">
          <div id="map" class="map"></div>

          <!-- Info Arrêt + ETA -->
          @if (selectedArret()) {
            <div class="info-popup left">
              <div class="popup-header">
                <h3>{{ selectedArret()!.nom }}</h3>
                <button class="btn-close" (click)="selectedArret.set(null)">✕</button>
              </div>
              <div class="popup-content">
                @if (loadingPredictions()) {
                  <div class="info-row"><span>Chargement des arrivées…</span></div>
                } @else if (predictions().length === 0) {
                  <div class="info-row"><span>Aucune ETA disponible</span></div>
                } @else {
                  @for (pred of predictions(); track pred.trackingId) {
                    <div class="info-row">
                      <label>{{ pred.busTrackingId }}</label>
                      <span>{{ pred.tempsRestantMinutes }} min • {{ pred.distanceRestanteKm | number:'1.1-1' }} km</span>
                    </div>
                  }
                }
              </div>
            </div>
          }

          <!-- Selected Bus Info Popup -->
          @if (selectedBus()) {
            <div class="info-popup">
              <div class="popup-header">
                <h3>{{ selectedBus()!.busCode }}</h3>
                <button class="btn-close" (click)="selectedBus.set(null)">✕</button>
              </div>
              <div class="popup-content">
                <div class="info-row">
                  <label>Tracking</label>
                  <span>{{ selectedBus()!.busTrackingId }}</span>
                </div>
                <div class="info-row">
                  <label>Vitesse</label>
                  <span>{{ selectedBus()!.vitesse }} km/h</span>
                </div>
                <div class="info-row">
                  <label>Mission</label>
                  <span class="badge" [ngClass]="selectedBus()!.missionActive ? 'badge-success' : 'badge-warning'">
                    {{ selectedBus()!.missionActive ? 'ACTIVE' : 'INACTIVE' }}
                  </span>
                </div>
              </div>
            </div>
          }

          <!-- Map Controls -->
          <div class="map-controls">
            <div class="control-group">
              <button class="control-btn" title="Zoom in" (click)="zoomIn()">+</button>
              <button class="control-btn" title="Zoom out" (click)="zoomOut()">−</button>
            </div>
            <div class="control-group">
              <button class="control-btn" title="Centrer" (click)="centerMap()">⊙</button>
            </div>
          </div>

          <!-- Stats Bar -->
          <div class="stats-bar">
            <div class="stat">
              <span class="stat-value">{{ activeBuses().length }}</span>
              <span class="stat-label">Bus actifs</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ lignes().length }}</span>
              <span class="stat-label">Lignes</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ arrets().length }}</span>
              <span class="stat-label">Arrêts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-carte {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
      height: 100%;
    }

    .page-header { margin-bottom: 0; }
    .page-header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: var(--sotral-vert);
      font-family: var(--font-primary);
    }
    .page-subtitle { margin: 4px 0 0 0; font-size: 14px; color: #999; }

    .carte-container {
      display: flex;
      gap: var(--spacing-lg);
      flex: 1;
      min-height: 0;
    }

    .sidebar {
      width: 280px;
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      padding: var(--spacing-lg);
      overflow-y: auto;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
    }
    .sidebar.collapsed { width: 60px; padding: var(--spacing-md); }
    @media (max-width: 768px) {
      .sidebar { position: absolute; left: 0; top: 0; height: 100%; z-index: 100; border-radius: 0; }
    }

    .sidebar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg); padding-bottom: var(--spacing-md); border-bottom: 1px solid #e0e0e0; }
    .sidebar-header h3 { margin: 0; font-size: 14px; font-weight: 700; color: var(--sotral-vert); }
    .btn-toggle { background: none; border: none; cursor: pointer; font-size: 16px; color: #999; padding: 0; }

    .lignes-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: var(--spacing-lg); padding-bottom: var(--spacing-lg); border-bottom: 1px solid #e0e0e0; }
    .ligne-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; cursor: pointer; border-radius: var(--radius-md); transition: all 0.2s ease; }
    .ligne-item:hover { background-color: #f0f0f0; }
    .ligne-item.active { background-color: #E8F5E9; }
    .ligne-label { flex: 1; display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 500; color: #333; }
    .ligne-count { font-size: 11px; background-color: var(--sotral-vert); color: white; padding: 2px 6px; border-radius: 12px; font-weight: 600; }

    .sidebar-section { display: flex; flex-direction: column; gap: var(--spacing-md); }
    .sidebar-section h4 { margin: 0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #999; letter-spacing: 0.05em; }

    .bus-list { display: flex; flex-direction: column; gap: 6px; }
    .bus-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; background-color: #f9f9f9; border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s ease; border: 2px solid transparent; }
    .bus-item:hover { background-color: #f0f0f0; }
    .bus-item.selected { border-color: var(--sotral-vert); background-color: #E8F5E9; }
    .bus-icon { font-size: 18px; min-width: 24px; text-align: center; }
    .status-dot { font-size: 14px; }
    .bus-info { flex: 1; min-width: 0; }
    .bus-immat { font-size: 12px; font-weight: 600; color: var(--sotral-vert); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .bus-detail { font-size: 11px; color: #999; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .empty-state { text-align: center; padding: var(--spacing-md); color: #999; font-size: 12px; }

    .map-wrapper { flex: 1; position: relative; background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden; }
    #map { width: 100%; height: 100%; }
    .bus-icon-marker .bus-marker {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255,255,255,0.92);
      border: 2px solid #1976d2; /* bleu lignes */
      padding: 2px 6px;
      border-radius: 14px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      font-family: var(--font-secondary);
    }
    .bus-icon-marker .line-badge {
      background: #1976d2; /* bleu lignes */
      color: white;
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 700;
      min-width: 28px;
      text-align: center;
    }
    .bus-icon-marker .bus-code {
      font-size: 12px;
      font-weight: 700;
      color: #ff9800; /* orange pour bus code */
    }

    .info-popup { position: absolute; bottom: 20px; right: 20px; background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); width: 280px; max-height: 300px; overflow-y: auto; z-index: 10; }
    .popup-header { display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md); border-bottom: 1px solid #e0e0e0; }
    .popup-header h3 { margin: 0; font-size: 14px; font-weight: 700; color: var(--sotral-vert); }
    .btn-close { background: none; border: none; cursor: pointer; font-size: 16px; color: #999; padding: 0; }
    .popup-content { padding: var(--spacing-md); display: flex; flex-direction: column; gap: 8px; }
    .info-row { display: flex; justify-content: space-between; align-items: center; font-size: 12px; }
    .info-row label { color: #999; font-weight: 500; }
    .info-row span { color: var(--sotral-vert); font-weight: 600; }
    .badge { padding: 2px 6px; border-radius: 4px; font-size: 11px; }
    .badge-success { background-color: #e8f5e9; color: var(--sotral-vert); }
    .badge-warning { background-color: #fff3e0; color: #ff9800; }

    .map-controls { position: absolute; bottom: 20px; left: 20px; display: flex; gap: 8px; z-index: 20; }
    .control-group { display: flex; flex-direction: column; gap: 4px; background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-md); overflow: hidden; }
    .control-btn { width: 40px; height: 40px; border: none; background: white; cursor: pointer; font-size: 18px; font-weight: bold; color: var(--sotral-vert); transition: all 0.2s ease; }
    .control-btn:hover { background-color: #f0f0f0; }
    .control-btn:active { background-color: #e0e0e0; }
    .control-btn:not(:last-child) { border-bottom: 1px solid #e0e0e0; }

    .stats-bar { position: absolute; top: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: var(--spacing-lg); background: white; padding: var(--spacing-md) var(--spacing-lg); border-radius: var(--radius-lg); box-shadow: var(--shadow-md); z-index: 15; }
    @media (max-width: 768px) { .stats-bar { gap: var(--spacing-md); padding: 8px var(--spacing-md); font-size: 12px; } }
    .stat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .stat-value { font-size: 18px; font-weight: 700; color: var(--sotral-vert); font-family: var(--font-primary); }
    .stat-label { font-size: 11px; color: #999; font-weight: 500; }
  `],
})
export class CarteComponent implements AfterViewInit, OnDestroy {
  private positionService = inject(PositionGPSService);
  private arretService = inject(ArretService);
  private ligneService = inject(LigneService);
  private predictionService = inject(PredictionService);
  private ligneArretService = inject(LigneArretService);

  lignes = signal<Ligne[]>([
    { id: 1, trackingId: 'mock-l1', numero: '1', depart: 'A', arrive: 'B' },
    { id: 2, trackingId: 'mock-l3', numero: '3', depart: 'C', arrive: 'D' },
    { id: 3, trackingId: 'mock-l8', numero: '8', depart: 'E', arrive: 'F' },
  ]);

  arrets = signal<Arret[]>([
    { id: 1, trackingId: 'mock-a1', nom: 'Gare routière', latitude: 6.1372, longitude: 1.2228 },
    { id: 2, trackingId: 'mock-a2', nom: 'Marché de Bè', latitude: 6.1375, longitude: 1.2123 },
    { id: 3, trackingId: 'mock-a3', nom: 'Grand Marché', latitude: 6.125, longitude: 1.2300 },
  ]);

  busPositions = signal<PositionBus[]>([
    { busTrackingId: 'b-1', vehiculeTrackingId: 'v-1', busCode: 'B-101', latitude: 6.135, longitude: 1.220, vitesse: 28, horodatage: new Date().toISOString(), missionActive: true },
    { busTrackingId: 'b-2', vehiculeTrackingId: 'v-2', busCode: 'B-204', latitude: 6.142, longitude: 1.210, vitesse: 32, horodatage: new Date().toISOString(), missionActive: true },
    { busTrackingId: 'b-3', vehiculeTrackingId: 'v-3', busCode: 'B-305', latitude: 6.120, longitude: 1.235, vitesse: 0, horodatage: new Date().toISOString(), missionActive: false },
  ]);

  activeLignes = signal<string[]>([]);
  selectedBus = signal<PositionBus | null>(null);
  selectedArret = signal<Arret | null>(null);
  predictions = signal<Prediction[]>([]);
  loadingPredictions = signal(false);
  sidebarCollapsed = signal(false);
  ligneArrets = signal<LigneArretDto[]>([]);

  activeBuses = computed(() => this.busPositions());

  private map: any;
  private busMarkers: any[] = [];
  private arretLayer: any;
  private hqMarker: any;
  private routesLayer: any;
  private pollingSub?: Subscription;
  private arretSub?: Subscription;
  private ligneArretSub?: Subscription;

  async ngAfterViewInit(): Promise<void> {
    await this.initMap();
    this.fetchArrets();
    this.fetchLignes();
    this.fetchLigneArrets();
    this.startPollingPositions();
  }

  ngOnDestroy(): void {
    this.pollingSub?.unsubscribe();
    this.arretSub?.unsubscribe();
    this.ligneArretSub?.unsubscribe();
    if (this.map) this.map.remove();
  }

  toggleLigne(ligneTrackingId?: string): void {
    if (!ligneTrackingId) return;
    const current = this.activeLignes();
    if (current.includes(ligneTrackingId)) {
      this.activeLignes.set(current.filter(id => id !== ligneTrackingId));
    } else {
      this.activeLignes.set([...current, ligneTrackingId]);
    }
  }

  getArretsForLigne(ligneTrackingId?: string): number {
    if (!ligneTrackingId) return 0;
    return this.ligneArrets().filter(la => la.ligneTrackingId === ligneTrackingId).length;
  }

  async zoomIn(): Promise<void> { if (this.map) this.map.zoomIn(); }
  async zoomOut(): Promise<void> { if (this.map) this.map.zoomOut(); }
  async centerMap(): Promise<void> { if (this.map) this.map.setView([6.1375, 1.2123], 12); }

  private async initMap(): Promise<void> {
    const L: any = (await import('leaflet')).default || (await import('leaflet'));
    const hq: [number, number] = [6.1375, 1.2123];
    this.map = L.map('map', { zoomControl: false }).setView(hq, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.map);

    // Marqueur SOTRAL (siège)
    this.hqMarker = L.circleMarker(hq, {
      radius: 10,
      color: '#C0392B',
      weight: 3,
      fillColor: '#E74C3C',
      fillOpacity: 0.9,
    }).bindPopup('<strong>SOTRAL (Siège)</strong>');
    this.hqMarker.addTo(this.map);
  }

  private async plotArrets(): Promise<void> {
    if (!this.map) return;
    const L: any = (await import('leaflet')).default || (await import('leaflet'));
    if (this.arretLayer) { this.map.removeLayer(this.arretLayer); }
    this.arretLayer = L.layerGroup(
      this.arrets().map(a => {
        const marker = L.circleMarker([a.latitude, a.longitude], {
          color: '#C0392B',
          radius: 6,
          weight: 2,
          fillColor: '#E74C3C',
          fillOpacity: 0.9,
        }).bindPopup(`<strong>${a.nom}</strong>`);
        marker.on('click', () => this.loadPredictions(a));
        return marker;
      })
    ).addTo(this.map);
  }

  private async plotBuses(): Promise<void> {
    if (!this.map) return;
    const L: any = (await import('leaflet')).default || (await import('leaflet'));
    this.busMarkers.forEach(m => this.map.removeLayer(m));
    this.busMarkers = this.busPositions().map(b => {
      const lineLabel = b.busCode || 'BUS';
      const marker = L.marker([b.latitude, b.longitude], {
        title: b.busCode,
        icon: L.divIcon({
          html: `<div class="bus-marker">
                   <span class="line-badge">${lineLabel}</span>
                   <span class="bus-code">${b.busCode}</span>
                 </div>`,
          className: 'bus-icon-marker',
          iconSize: [46, 28],
          iconAnchor: [23, 14],
        }),
      }).bindPopup(`<strong>${b.busCode}</strong><br/>Ligne ${lineLabel}<br/>${b.vitesse} km/h`);
      marker.addTo(this.map);
      return marker;
    });
  }

  private async plotRoutes(): Promise<void> {
    if (!this.map) return;
    const L: any = (await import('leaflet')).default || (await import('leaflet'));
    if (this.routesLayer) this.map.removeLayer(this.routesLayer);

    // Construire les polylignes à partir des arrêts ordonnés par ligne
    const arretMap = new Map<string, LatLng>();
    this.arrets().forEach(a => { if (a.trackingId) arretMap.set(a.trackingId, [a.latitude, a.longitude]); });

    const lignesByTracking = new Map<string, Ligne>();
    this.lignes().forEach(l => { if (l.trackingId) lignesByTracking.set(l.trackingId, l); });

    const grouped = new Map<string, LigneArretDto[]>();
    this.ligneArrets().forEach(la => {
      if (!grouped.has(la.ligneTrackingId)) grouped.set(la.ligneTrackingId, []);
      grouped.get(la.ligneTrackingId)!.push(la);
    });

    const polylines = Array.from(grouped.entries()).map(([ligneTrackingId, stops]) => {
      const sorted = stops.sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0));
      const coords: LatLng[] = [];
      sorted.forEach(s => {
        const c = arretMap.get(s.arretTrackingId);
        if (c) coords.push(c);
      });
      const ligne = lignesByTracking.get(ligneTrackingId);
      const label = ligne?.numero ? `L${ligne.numero}` : 'Ligne';
      return { label, coords };
    }).filter(p => p.coords.length >= 2);

    this.routesLayer = L.layerGroup(
      polylines.map(p =>
        L.polyline(p.coords, { color: '#1976d2', weight: 4, opacity: 0.7 })
          .bindPopup(p.label)
      )
    ).addTo(this.map);
  }

  private startPollingPositions(): void {
    this.pollingSub = interval(5000)
      .pipe(
        switchMap(() => this.positionService.getDernierePositions().pipe(catchError(() => of([]))))
      )
      .subscribe(data => {
        const positions = (data as PositionBus[])?.length ? (data as PositionBus[]) : this.busPositions();
        this.busPositions.set(positions);
        this.plotBuses();
      });
  }

  private fetchLignes(): void {
    this.ligneService.getAll()
      .pipe(catchError(() => of(this.lignes())))
      .subscribe(list => this.lignes.set(list));
  }

  private fetchArrets(): void {
    this.arretSub = this.arretService.getAll()
      .pipe(catchError(() => of(this.arrets())))
      .subscribe(list => {
        this.arrets.set(list);
        this.plotArrets();
      });
  }

  private fetchLigneArrets(): void {
    this.ligneArretSub = this.ligneArretService.getAll()
      .pipe(catchError(() => of([])))
      .subscribe(list => {
        this.ligneArrets.set(list);
        this.plotRoutes();
      });
  }

  private loadPredictions(arret: Arret): void {
    if (!arret.trackingId) { this.selectedArret.set(arret); this.predictions.set([]); return; }
    this.selectedArret.set(arret);
    this.loadingPredictions.set(true);
    this.predictionService.getPredictionParArret(arret.trackingId)
      .pipe(catchError(() => of([])))
      .subscribe(list => {
        this.predictions.set(list);
        this.loadingPredictions.set(false);
      });
  }
}
