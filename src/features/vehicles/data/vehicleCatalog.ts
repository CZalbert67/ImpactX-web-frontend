/**
 * Catálogo local orientado al mercado mexicano. Permite autocompletar sin
 * depender de un servicio externo; cualquier marca o modelo no listado puede
 * escribirse manualmente.
 */
export const VEHICLE_CATALOG = {
  Acura: ["Integra", "MDX", "RDX", "TLX"],
  AlfaRomeo: ["Giulia", "Stelvio", "Tonale"],
  Audi: ["A1", "A3", "A4", "A5", "A6", "Q2", "Q3", "Q5", "Q7", "Q8", "e-tron"],
  BAIC: ["BJ20", "BJ40", "EU5", "X35", "X55", "X65"],
  BMW: ["Serie 1", "Serie 2", "Serie 3", "Serie 4", "Serie 5", "X1", "X2", "X3", "X4", "X5", "X6", "iX"],
  Buick: ["Enclave", "Encore", "Envision"],
  BYD: ["Dolphin", "Dolphin Mini", "Han", "King", "Seal", "Song Plus", "Tang", "Yuan Plus"],
  Cadillac: ["CT4", "CT5", "Escalade", "XT4", "XT5", "XT6"],
  Changan: ["Alsvin", "CS35 Plus", "CS55 Plus", "CS75 Plus", "Hunter", "UNI-K", "UNI-T"],
  Chirey: ["Arrizo 5", "Omoda 5", "Tiggo 2 Pro", "Tiggo 4 Pro", "Tiggo 7 Pro", "Tiggo 8 Pro"],
  Chevrolet: ["Aveo", "Blazer", "Bolt EUV", "Captiva", "Cavalier", "Colorado", "Equinox", "Groove", "Onix", "S10 Max", "Silverado", "Suburban", "Tahoe", "Tracker", "Trax"],
  Chrysler: ["Pacifica", "Town & Country"],
  Cupra: ["Ateca", "Born", "Formentor", "León", "Terramar"],
  Dodge: ["Attitude", "Challenger", "Charger", "Durango", "Journey"],
  Fiat: ["Argo", "Fastback", "Mobi", "Pulse", "Strada", "Uno"],
  Ford: ["Bronco", "Bronco Sport", "Edge", "Escape", "Expedition", "Explorer", "F-150", "Lobo", "Maverick", "Mustang", "Ranger", "Territory", "Transit"],
  GAC: ["Emkoo", "Empow", "GS3 Emzoom", "GS4", "GS8", "M8"],
  Geely: ["Coolray", "Emgrand", "Geometry C", "Okavango", "Starray"],
  GMC: ["Acadia", "Canyon", "Sierra", "Terrain", "Yukon"],
  GreatWall: ["Haval H6", "Haval Jolion", "Ora 03", "Poer", "Tank 300", "Tank 500"],
  Honda: ["Accord", "BR-V", "City", "Civic", "CR-V", "HR-V", "Odyssey", "Pilot"],
  Hyundai: ["Accent", "Creta", "Elantra", "Grand i10", "HB20", "Ioniq 5", "Kona", "Palisade", "Santa Fe", "Tucson"],
  Infiniti: ["Q50", "QX50", "QX55", "QX60", "QX80"],
  JAC: ["E10X", "E30X", "Frison T6", "Frison T8", "J7", "Sei2", "Sei4 Pro", "Sei7 Pro"],
  Jaecoo: ["J7", "J8"],
  Jeep: ["Commander", "Compass", "Gladiator", "Grand Cherokee", "Renegade", "Wagoneer", "Wrangler"],
  Kia: ["Carnival", "Forte", "K3", "K4", "Niro", "Rio", "Seltos", "Sorento", "Soul", "Sportage", "Telluride"],
  LandRover: ["Defender", "Discovery", "Discovery Sport", "Range Rover", "Range Rover Evoque", "Range Rover Sport", "Range Rover Velar"],
  Lexus: ["ES", "GX", "IS", "LBX", "LS", "LX", "NX", "RX", "UX"],
  Lincoln: ["Aviator", "Corsair", "Nautilus", "Navigator"],
  Mazda: ["Mazda2", "Mazda3", "Mazda6", "CX-3", "CX-30", "CX-5", "CX-50", "CX-70", "CX-90", "MX-5"],
  MercedesBenz: ["Clase A", "Clase C", "Clase E", "Clase G", "CLA", "GLA", "GLB", "GLC", "GLE", "GLS", "EQA", "EQB", "EQE", "EQS"],
  MG: ["GT", "HS", "MG3", "MG4", "MG5", "One", "RX5", "ZS"],
  MINI: ["Aceman", "Cooper", "Countryman"],
  Mitsubishi: ["Eclipse Cross", "L200", "Mirage G4", "Montero Sport", "Outlander", "Xpander"],
  Nissan: ["Altima", "Frontier", "Kicks", "March", "NP300", "Pathfinder", "Sentra", "Urvan", "Versa", "X-Trail"],
  Omoda: ["C5", "C5 EV"],
  Peugeot: ["2008", "3008", "5008", "Landtrek", "Partner", "Rifter"],
  Porsche: ["718", "911", "Cayenne", "Macan", "Panamera", "Taycan"],
  RAM: ["700", "1200", "1500", "2500", "ProMaster", "ProMaster Rapid"],
  Renault: ["Captur", "Duster", "Kardian", "Koleos", "Kwid", "Oroch", "Stepway"],
  SEAT: ["Arona", "Ateca", "Ibiza", "León", "Tarraco"],
  Subaru: ["BRZ", "Crosstrek", "Forester", "Impreza", "Outback", "WRX", "XV"],
  Suzuki: ["Baleno", "Ciaz", "Ertiga", "Fronx", "Grand Vitara", "Ignis", "Jimny", "S-Cross", "Swift"],
  Tesla: ["Model 3", "Model S", "Model X", "Model Y"],
  Toyota: ["Avanza", "Camry", "Corolla", "Corolla Cross", "GR86", "Hiace", "Highlander", "Hilux", "Land Cruiser", "Prius", "Raize", "RAV4", "Sequoia", "Sienna", "Tacoma", "Tundra", "Yaris", "Yaris Cross"],
  Volkswagen: ["Amarok", "Cross Sport", "Golf", "Jetta", "Nivus", "Polo", "Saveiro", "Taos", "Teramont", "T-Cross", "Tiguan", "Virtus"],
  Volvo: ["C40", "EX30", "EX40", "EX90", "S60", "S90", "V60", "XC40", "XC60", "XC90"],
} as const;

export type CatalogBrand = keyof typeof VEHICLE_CATALOG;

function formatBrandName(brand: CatalogBrand): string {
  return brand
    .replace("AlfaRomeo", "Alfa Romeo")
    .replace("GreatWall", "Great Wall")
    .replace("LandRover", "Land Rover")
    .replace("MercedesBenz", "Mercedes-Benz");
}

const CATALOG_BRAND_KEYS = Object.keys(
  VEHICLE_CATALOG,
) as CatalogBrand[];

export const VEHICLE_BRANDS = CATALOG_BRAND_KEYS.map(formatBrandName);

const DISPLAY_TO_KEY = new Map<string, CatalogBrand>(
  CATALOG_BRAND_KEYS.map((key) => [
    formatBrandName(key).toLocaleLowerCase("es-MX"),
    key,
  ]),
);

export function vehicleModelsForBrand(brand: string): readonly string[] {
  const key = DISPLAY_TO_KEY.get(brand.trim().toLocaleLowerCase("es-MX"));
  return key ? VEHICLE_CATALOG[key] : [];
}
