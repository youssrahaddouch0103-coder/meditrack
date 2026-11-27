export interface CabinetSettings {
  id?: number;

  // Photos du site
  heroImageUrl?: string;
  heroImageAlt?: string;
  whyChooseUsImageUrl?: string;
  whyChooseUsImageAlt?: string;
  aboutImageUrl?: string;
  aboutImageAlt?: string;

  // Coordonnées et réseaux sociaux
  landlinePhone?: string;
  mobilePhone?: string;
  email?: string;
  instagramUrl?: string;
  addressLine?: string;
  city?: string;
  postalCode?: string;
  country?: string;

  // Google Maps
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;

  // Horaires d'ouverture
  mondayMorning?: string;
  mondayAfternoon?: string;
  tuesdayMorning?: string;
  tuesdayAfternoon?: string;
  wednesdayMorning?: string;
  wednesdayAfternoon?: string;
  thursdayMorning?: string;
  thursdayAfternoon?: string;
  fridayMorning?: string;
  fridayAfternoon?: string;
  saturdayMorning?: string;
  saturdayAfternoon?: string;
  sundayMorning?: string;
  sundayAfternoon?: string;

  updatedAt?: string;
}

export interface FormattedScheduleDay {
  day: string;
  hours: string;
  isClosed?: boolean;
}
