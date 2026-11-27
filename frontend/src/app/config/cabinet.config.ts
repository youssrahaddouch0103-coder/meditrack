export interface CabinetInfo {
  name: string;
  city: string;
  country: string;
  locationDisplay: string;
  phoneLandline: string;
  phoneLandlineRaw: string;
  phoneMobile: string;
  phoneMobileRaw: string;
  instagramUrl: string;
  instagramHandle: string;
  slogan: string;
  presentation: string;
  demoAddress: string;
  addressDisclaimer: string;
}

export interface ScheduleDay {
  day: string;
  hours: string;
  isClosed?: boolean;
}

export interface TimeSlotOption {
  label: string;
  value: string;
  period: 'morning' | 'afternoon';
}

export const CABINET_INFO: CabinetInfo = {
  name: 'YT Smile Center',
  city: 'Témara',
  country: 'Maroc',
  locationDisplay: 'Témara, Maroc',
  phoneLandline: '05 37 61 00 84',
  phoneLandlineRaw: '0537610084',
  phoneMobile: '06 71 35 95 70',
  phoneMobileRaw: '0671359570',
  instagramUrl: 'https://www.instagram.com/yt_smile_center/',
  instagramHandle: '@yt_smile_center',
  slogan: 'Votre sourire, notre priorité',
  presentation: 'YT Smile Center vous accueille à Témara et vous propose des soins dentaires modernes, personnalisés et réalisés dans un environnement chaleureux et rassurant.',
  demoAddress: 'Place El Hedim, Meknès, Maroc',
  addressDisclaimer: 'Adresse de démonstration — à remplacer'
};

export const CABINET_SCHEDULE: ScheduleDay[] = [
  { day: 'Lundi', hours: '09h30–13h00 | 15h30–19h00' },
  { day: 'Mardi', hours: '09h30–13h00 | 15h30–19h00' },
  { day: 'Mercredi', hours: '09h30–13h00 | 15h30–19h00' },
  { day: 'Jeudi', hours: '09h30–13h00 | 15h30–19h00' },
  { day: 'Vendredi', hours: '09h30–13h00 | 15h30–19h00' },
  { day: 'Samedi', hours: '09h30–13h00' },
  { day: 'Dimanche', hours: 'Fermé', isClosed: true }
];

export const SCHEDULE_SUMMARY = {
  weekday: '09h30–13h00 | 15h30–19h00',
  saturday: '09h30–13h00',
  sunday: 'Fermé'
};

export const TIME_SLOT_OPTIONS: TimeSlotOption[] = [
  // Créneaux du Matin (09h30 - 13h00)
  { label: '09h30 (Matin)', value: '09:30', period: 'morning' },
  { label: '10h00 (Matin)', value: '10:00', period: 'morning' },
  { label: '10h30 (Matin)', value: '10:30', period: 'morning' },
  { label: '11h00 (Matin)', value: '11:00', period: 'morning' },
  { label: '11h30 (Matin)', value: '11:30', period: 'morning' },
  { label: '12h00 (Matin)', value: '12:00', period: 'morning' },
  { label: '12h30 (Matin)', value: '12:30', period: 'morning' },
  // Créneaux de l'Après-midi (15h30 - 19h00)
  { label: '15h30 (Après-midi)', value: '15:30', period: 'afternoon' },
  { label: '16h00 (Après-midi)', value: '16:00', period: 'afternoon' },
  { label: '16h30 (Après-midi)', value: '16:30', period: 'afternoon' },
  { label: '17h00 (Après-midi)', value: '17:00', period: 'afternoon' },
  { label: '17h30 (Après-midi)', value: '17:30', period: 'afternoon' },
  { label: '18h00 (Fin d’après-midi)', value: '18:00', period: 'afternoon' },
  { label: '18h30 (Fin d’après-midi)', value: '18:30', period: 'afternoon' }
];
