import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { CabinetSettings, FormattedScheduleDay } from '../models/cabinet-settings.model';

@Injectable({
  providedIn: 'root'
})
export class CabinetSettingsService {

  private publicApiUrl = `${environment.apiUrl}/public/cabinet-settings`;
  private adminApiUrl = `${environment.apiUrl}/admin/cabinet-settings`;

  private defaultSettings: CabinetSettings = {
    heroImageUrl: 'assets/hero-dentist.png',
    heroImageAlt: 'Cabinet dentaire YT Smile Center à Témara',
    whyChooseUsImageUrl: 'assets/why-us-clinic.png',
    whyChooseUsImageAlt: 'Intérieur moderne du cabinet dentaire avec équipements de pointe',
    aboutImageUrl: 'assets/about-cabinet.png',
    aboutImageAlt: 'Accueil et espace de soin lumineux du cabinet dentaire YT Smile Center',

    landlinePhone: '05 37 61 00 84',
    mobilePhone: '06 71 35 95 70',
    email: 'contact@meditrack.local',
    instagramUrl: 'https://www.instagram.com/yt_smile_center/',

    addressLine: 'Place El Hedim',
    city: 'Témara',
    postalCode: '12000',
    country: 'Maroc',

    googleMapsUrl: 'https://maps.google.com/?q=Temara+Maroc',
    latitude: 33.926,
    longitude: -6.912,

    mondayMorning: '09:30 - 13:00',
    mondayAfternoon: '15:30 - 19:00',
    tuesdayMorning: '09:30 - 13:00',
    tuesdayAfternoon: '15:30 - 19:00',
    wednesdayMorning: '09:30 - 13:00',
    wednesdayAfternoon: '15:30 - 19:00',
    thursdayMorning: '09:30 - 13:00',
    thursdayAfternoon: '15:30 - 19:00',
    fridayMorning: '09:30 - 13:00',
    fridayAfternoon: '15:30 - 19:00',
    saturdayMorning: '09:30 - 13:00',
    saturdayAfternoon: 'Fermé',
    sundayMorning: 'Fermé',
    sundayAfternoon: 'Fermé'
  };

  private settingsSubject = new BehaviorSubject<CabinetSettings>(this.defaultSettings);
  public settings$ = this.settingsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadPublicSettings().subscribe();
  }

  loadPublicSettings(): Observable<CabinetSettings> {
    return this.http.get<CabinetSettings>(this.publicApiUrl).pipe(
      tap(settings => {
        const merged = { ...this.defaultSettings, ...settings };
        this.settingsSubject.next(merged);
      }),
      catchError(err => {
        console.error('Erreur lors du chargement des paramètres du cabinet, utilisation des données locales :', err);
        this.settingsSubject.next(this.defaultSettings);
        return of(this.defaultSettings);
      })
    );
  }

  getAdminSettings(): Observable<CabinetSettings> {
    return this.http.get<CabinetSettings>(this.adminApiUrl).pipe(
      tap(settings => {
        const merged = { ...this.defaultSettings, ...settings };
        this.settingsSubject.next(merged);
      }),
      catchError(err => {
        console.error('Erreur lors du chargement admin des paramètres du cabinet :', err);
        return of(this.getCurrentSettings());
      })
    );
  }

  updateAdminSettings(formData: FormData): Observable<CabinetSettings> {
    return this.http.post<CabinetSettings>(this.adminApiUrl, formData).pipe(
      tap(updated => {
        const merged = { ...this.defaultSettings, ...updated };
        this.settingsSubject.next(merged);
      })
    );
  }

  getCurrentSettings(): CabinetSettings {
    return this.settingsSubject.value || this.defaultSettings;
  }

  // --- Helpers for Public Components ---

  getImageUrl(url?: string, defaultAsset: string = 'assets/hero-dentist.png'): string {
    if (!url) {
      return defaultAsset;
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (url.startsWith('assets/') || url.startsWith('/assets/')) {
      return url.startsWith('/') ? url.slice(1) : url;
    }
    const backendBase = environment.apiUrl.replace(/\/api\/?$/, '');
    if (url.startsWith('/uploads/')) {
      return `${backendBase}${url}`;
    }
    if (url.startsWith('uploads/')) {
      return `${backendBase}/${url}`;
    }
    return `${backendBase}/${url.startsWith('/') ? url.slice(1) : url}`;
  }

  formatPhoneRaw(phone?: string): string {
    if (!phone) return '';
    return phone.replace(/[^0-9+]/g, '');
  }

  formatWhatsAppLink(mobilePhone?: string): string {
    const raw = this.formatPhoneRaw(mobilePhone);
    if (!raw) return 'https://wa.me/212671359570';
    if (raw.startsWith('0')) {
      return `https://wa.me/212${raw.substring(1)}`;
    }
    return `https://wa.me/${raw}`;
  }

  formatInstagramHandle(url?: string): string {
    if (!url) return '@yt_smile_center';
    let clean = url.trim().replace(/\?.*$/, '').replace(/\/+$/, '');
    if (clean.includes('/')) {
      const parts = clean.split('/');
      const lastPart = parts[parts.length - 1];
      if (lastPart && lastPart.toLowerCase() !== 'instagram.com' && lastPart.toLowerCase() !== 'www.instagram.com') {
        return lastPart.startsWith('@') ? lastPart : `@${lastPart}`;
      }
    }
    if (clean.startsWith('@')) return clean;
    if (clean) return `@${clean}`;
    return '@yt_smile_center';
  }

  formatLocationDisplay(settings: CabinetSettings): string {
    const parts = [settings.addressLine, settings.city, settings.country].filter(Boolean);
    return parts.join(', ') || 'Témara, Maroc';
  }

  getGoogleMapsEmbedUrl(settings: CabinetSettings): string {
    let rawUrl = (settings.googleMapsUrl || '').trim();

    // 1. If user pasted iframe HTML tag e.g. <iframe src="..."></iframe>
    if (rawUrl.includes('<iframe')) {
      const match = rawUrl.match(/src=["']([^"']+)["']/);
      if (match && match[1]) {
        return match[1];
      }
    }

    // 2. Official Google Maps Embed URL (contains /embed or pb=)
    if (rawUrl.includes('/embed') || rawUrl.includes('pb=')) {
      return rawUrl;
    }

    // 3. Extract place name from /maps/place/LOCATION_NAME
    const placeMatch = rawUrl.match(/\/maps\/place\/([^\/@?]+)/);
    if (placeMatch && placeMatch[1]) {
      const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      return `https://www.google.com/maps?q=${encodeURIComponent(placeName)}&z=17&output=embed`;
    }

    // 4. Extract coordinates from Google Maps URL if present: @33.9046873,-6.9519202
    const coordMatch = rawUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
      return `https://www.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&z=17&output=embed`;
    }

    // 5. If latitude and longitude exist in settings (auto-resolved from share link)
    if (settings.latitude && settings.longitude) {
      return `https://www.google.com/maps?q=${settings.latitude},${settings.longitude}&z=17&output=embed`;
    }

    // 6. Query using exact full address (e.g. "Ain Atig, 448 Ibn Khaldoun, Av. Hassan II, Témara, Maroc")
    const addressQuery = [settings.addressLine, settings.city, settings.country].filter(Boolean).join(', ');
    if (addressQuery) {
      return `https://www.google.com/maps?q=${encodeURIComponent(addressQuery)}&z=17&output=embed`;
    }

    // 7. Default fallback
    return `https://www.google.com/maps?q=Temara,+Maroc&z=17&output=embed`;
  }

  getScheduleList(settings: CabinetSettings): FormattedScheduleDay[] {
    return [
      { day: 'Lundi', hours: this.formatDayHours(settings.mondayMorning, settings.mondayAfternoon), isClosed: this.isClosed(settings.mondayMorning, settings.mondayAfternoon) },
      { day: 'Mardi', hours: this.formatDayHours(settings.tuesdayMorning, settings.tuesdayAfternoon), isClosed: this.isClosed(settings.tuesdayMorning, settings.tuesdayAfternoon) },
      { day: 'Mercredi', hours: this.formatDayHours(settings.wednesdayMorning, settings.wednesdayAfternoon), isClosed: this.isClosed(settings.wednesdayMorning, settings.wednesdayAfternoon) },
      { day: 'Jeudi', hours: this.formatDayHours(settings.thursdayMorning, settings.thursdayAfternoon), isClosed: this.isClosed(settings.thursdayMorning, settings.thursdayAfternoon) },
      { day: 'Vendredi', hours: this.formatDayHours(settings.fridayMorning, settings.fridayAfternoon), isClosed: this.isClosed(settings.fridayMorning, settings.fridayAfternoon) },
      { day: 'Samedi', hours: this.formatDayHours(settings.saturdayMorning, settings.saturdayAfternoon), isClosed: this.isClosed(settings.saturdayMorning, settings.saturdayAfternoon) },
      { day: 'Dimanche', hours: this.formatDayHours(settings.sundayMorning, settings.sundayAfternoon), isClosed: this.isClosed(settings.sundayMorning, settings.sundayAfternoon) }
    ];
  }

  private isClosed(morning?: string, afternoon?: string): boolean {
    const m = (morning || '').trim().toLowerCase();
    const a = (afternoon || '').trim().toLowerCase();
    return (!m || m === 'fermé' || m === 'ferme') && (!a || a === 'fermé' || a === 'ferme');
  }

  private formatDayHours(morning?: string, afternoon?: string): string {
    const m = (morning || '').trim();
    const a = (afternoon || '').trim();

    if (this.isClosed(m, a)) {
      return 'Fermé';
    }

    if (m && (!a || a.toLowerCase() === 'fermé')) {
      return m;
    }

    if ((!m || m.toLowerCase() === 'fermé') && a) {
      return a;
    }

    return `${m} | ${a}`;
  }
}
