import type { GeoCoordinates } from "@/types"

export interface BloodBankFacility {
  id: string
  name: string
  city: string
  area: string
  province: string
  phone: string
  hours: string
  coordinates: GeoCoordinates
  services: string[]
  distanceKm?: number
}

export const PAKISTAN_BLOOD_BANKS: BloodBankFacility[] = [
  // Karachi
  {
    id: "bb-khi-1",
    name: "JPMC Blood Bank & Transfusion Center",
    city: "Karachi",
    area: "Rafiqui Shaheed Road, Karachi Cantt",
    province: "Sindh",
    phone: "021-99201300",
    hours: "24/7 Emergency Transfusion Desk",
    coordinates: { lat: 24.8532, lng: 67.0457 },
    services: ["Emergency Trauma OT", "Platelets", "Component Separation", "Direct Replacement"],
  },
  {
    id: "bb-khi-2",
    name: "The Indus Hospital Blood Center",
    city: "Karachi",
    area: "Korangi Crossing, Korangi",
    province: "Sindh",
    phone: "021-111111880",
    hours: "24/7 Central Blood Screening",
    coordinates: { lat: 24.8239, lng: 67.1264 },
    services: ["100% Voluntarily Screened", "NAT Testing", "Platelet Apheresis"],
  },
  {
    id: "bb-khi-3",
    name: "Civil Hospital Karachi (CHK) Blood Transfusion",
    city: "Karachi",
    area: "Baba-e-Urdu Road, Saddar",
    province: "Sindh",
    phone: "021-99215740",
    hours: "24/7 Government Trauma Care",
    coordinates: { lat: 24.8575, lng: 67.0094 },
    services: ["Whole Blood", "Plasma Clotting", "Emergency Ward Support"],
  },
  {
    id: "bb-khi-4",
    name: "Fatimid Foundation Karachi",
    city: "Karachi",
    area: "393 Britto Road, Garden East",
    province: "Sindh",
    phone: "021-32225284",
    hours: "8:00 AM - 10:00 PM Daily",
    coordinates: { lat: 24.8785, lng: 67.0289 },
    services: ["Thalassemia & Hemophilia Specialized Support", "Free Pediatric Units"],
  },

  // Lahore
  {
    id: "bb-lhr-1",
    name: "Mayo Hospital Blood Transfusion Center",
    city: "Lahore",
    area: "Anarkali, Nila Gumbad",
    province: "Punjab",
    phone: "042-99211100",
    hours: "24/7 Emergency Transfusion",
    coordinates: { lat: 31.5746, lng: 74.3134 },
    services: ["Trauma Resuscitation", "Surgical Cross-Matching", "Whole Blood"],
  },
  {
    id: "bb-lhr-2",
    name: "Sundas Foundation Blood Transfusion Center",
    city: "Lahore",
    area: "88 Shadman / Ferozepur Road",
    province: "Punjab",
    phone: "042-111786327",
    hours: "24/7 Dedicated Transfusion Center",
    coordinates: { lat: 31.5385, lng: 74.3298 },
    services: ["Thalassemia Exchange", "NAT Tested Units", "Platelet Apheresis"],
  },
  {
    id: "bb-lhr-3",
    name: "Jinnah Hospital Blood Bank",
    city: "Lahore",
    area: "Usmani Road, Faisal Town",
    province: "Punjab",
    phone: "042-99231400",
    hours: "24/7 Government Emergency Desk",
    coordinates: { lat: 31.4842, lng: 74.2985 },
    services: ["Emergency OT Standby", "Fresh Frozen Plasma", "Pediatric Support"],
  },

  // Islamabad & Rawalpindi
  {
    id: "bb-isb-1",
    name: "Pakistan Red Crescent National Blood Center",
    city: "Islamabad",
    area: "Sector H-8, Islamabad",
    province: "Islamabad Capital Territory",
    phone: "051-9250404",
    hours: "24/7 National Center",
    coordinates: { lat: 33.6825, lng: 73.0645 },
    services: ["Component Separation", "NAT Screening", "Platelet Apheresis"],
  },
  {
    id: "bb-isb-2",
    name: "PIMS Blood Transfusion Center",
    city: "Islamabad",
    area: "Sector G-8/3, Islamabad",
    province: "Islamabad Capital Territory",
    phone: "051-9261170",
    hours: "24/7 Federal Emergency Desk",
    coordinates: { lat: 33.7058, lng: 73.0568 },
    services: ["Trauma ICU Support", "Surgical Cross-Matching", "Whole Blood"],
  },
  {
    id: "bb-rwp-1",
    name: "Holy Family Hospital Blood Bank",
    city: "Rawalpindi",
    area: "Satellite Town, Rawalpindi",
    province: "Punjab",
    phone: "051-9290321",
    hours: "24/7 Emergency Ward Desk",
    coordinates: { lat: 33.6339, lng: 73.0645 },
    services: ["Maternal Health Support", "Surgical OT Standby"],
  },

  // Peshawar
  {
    id: "bb-pes-1",
    name: "Lady Reading Hospital (LRH) Blood Bank",
    city: "Peshawar",
    area: "GT Road, Soekarno Square",
    province: "Khyber Pakhtunkhwa",
    phone: "091-9211430",
    hours: "24/7 Regional Emergency Transfusion",
    coordinates: { lat: 34.0094, lng: 71.5732 },
    services: ["Emergency Trauma", "Plasma Fractionation", "Whole Blood"],
  },

  // Quetta
  {
    id: "bb-qta-1",
    name: "Bolan Medical Complex Hospital Blood Center",
    city: "Quetta",
    area: "Brewery Road, Quetta",
    province: "Balochistan",
    phone: "081-9213070",
    hours: "24/7 Emergency Transfusion Desk",
    coordinates: { lat: 30.1983, lng: 66.9744 },
    services: ["Emergency Cross-Matching", "Whole Blood", "Highway Trauma"],
  },

  // Multan
  {
    id: "bb-mul-1",
    name: "Nishtar Hospital Blood Transfusion Center",
    city: "Multan",
    area: "Nishtar Road, Cantt",
    province: "Punjab",
    phone: "061-9200231",
    hours: "24/7 Emergency Trauma Desk",
    coordinates: { lat: 30.2014, lng: 71.4552 },
    services: ["Whole Blood", "Oncology Platelet Support", "Surgical Matching"],
  },

  // Hyderabad
  {
    id: "bb-hyd-1",
    name: "Red Crescent Regional Blood Center",
    city: "Hyderabad",
    area: "Latifabad Unit 6, Hyderabad",
    province: "Sindh",
    phone: "022-9260100",
    hours: "24/7 Screening & Emergency Transfusion",
    coordinates: { lat: 25.3678, lng: 68.3645 },
    services: ["Platelet Apheresis", "Thalassemia Support", "Free Screening"],
  },
  {
    id: "bb-hyd-2",
    name: "Liaquat University Hospital Blood Bank",
    city: "Hyderabad",
    area: "Civil Hospital Road, Hyderabad",
    province: "Sindh",
    phone: "022-9210206",
    hours: "24/7 Government Trauma Emergency",
    coordinates: { lat: 25.396, lng: 68.3578 },
    services: ["Whole Blood", "Emergency Cross-Matching", "Surgical OT Standby"],
  },
]
