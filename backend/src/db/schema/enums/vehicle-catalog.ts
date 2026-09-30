export const KNOWN_VEHICLE_BRANDS = [
  "Chevrolet",
  "Volkswagen",
  "Fiat",
  "Toyota",
  "Hyundai",
  "Honda",
  "Jeep",
  "Renault",
  "Ford",
  "Nissan",
  "BYD",
  "GWM",
  "Peugeot",
  "Citroën",
  "Mitsubishi",
  "Caoa Chery",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Volvo",
  "Ram",
  "Kia",
  "Land Rover",
  "Porsche"
] as const;

export type KnownVehicleBrand = (typeof KNOWN_VEHICLE_BRANDS)[number];

export const KNOWN_MODELS_BY_BRAND: Record<string, readonly string[]> = {
  Chevrolet: [
    "Onix",
    "Onix Plus",
    "Prisma",
    "Tracker",
    "S10",
    "Spin",
    "Cruze",
    "Cruze Sport6",
    "Montana",
    "Celta",
    "Corsa",
    "Astra",
    "Cobalt",
    "Equinox",
    "Trailblazer",
    "Camaro"
  ],
  Volkswagen: [
    "Gol",
    "Polo",
    "Polo Track",
    "T-Cross",
    "Virtus",
    "Nivus",
    "Saveiro",
    "Amarok",
    "Fox",
    "Voyage",
    "Jetta",
    "Taos",
    "Tiguan",
    "Up!",
    "Golf"
  ],
  Fiat: [
    "Strada",
    "Toro",
    "Argo",
    "Mobi",
    "Pulse",
    "Fastback",
    "Cronos",
    "Fiorino",
    "Uno",
    "Palio",
    "Siena",
    "Grand Siena",
    "Punto",
    "Ducato",
    "Titano"
  ],
  Toyota: [
    "Corolla",
    "Hilux",
    "Yaris",
    "Yaris Sedan",
    "Corolla Cross",
    "Etios",
    "Etios Sedan",
    "SW4",
    "RAV4",
    "Camry"
  ],
  Hyundai: [
    "HB20",
    "HB20S",
    "Creta",
    "Tucson",
    "ix35",
    "Santa Fe",
    "Ioniq 5",
    "HR"
  ],
  Honda: [
    "Civic",
    "HR-V",
    "City",
    "City Hatchback",
    "Fit",
    "WR-V",
    "CR-V",
    "ZR-V",
    "Accord"
  ],
  Jeep: [
    "Compass",
    "Renegade",
    "Commander",
    "Wrangler",
    "Grand Cherokee",
    "Gladiator"
  ],
  Renault: [
    "Kwid",
    "Sandero",
    "Duster",
    "Logan",
    "Oroch",
    "Stepway",
    "Captur",
    "Kardian",
    "Master",
    "Megane E-Tech"
  ],
  Ford: [
    "Ranger",
    "Maverick",
    "Territory",
    "Bronco Sport",
    "Mustang",
    "Ka",
    "Ka Sedan",
    "EcoSport",
    "Fiesta",
    "Focus",
    "Fusion",
    "Transit"
  ],
  Nissan: [
    "Kicks",
    "Versa",
    "Frontier",
    "Sentra",
    "March",
    "Tiida"
  ],
  BYD: [
    "Dolphin",
    "Dolphin Mini",
    "Song Plus",
    "Seal",
    "Yuan Plus",
    "King",
    "Shark",
    "Tan"
  ],
  GWM: [
    "Haval H6",
    "Haval H6 GT",
    "Ora 03",
    "Tank 300",
    "Poer"
  ],
  Peugeot: [
    "208",
    "2008",
    "3008",
    "Expert",
    "Partner"
  ],
  Citroën: [
    "C3",
    "C3 Aircross",
    "C4 Cactus",
    "Basalt",
    "Jumpy"
  ],
  Mitsubishi: [
    "L200 Triton",
    "Eclipse Cross",
    "Outlander",
    "Pajero Sport",
    "Pajero TR4",
    "ASX"
  ],
  "Caoa Chery": [
    "Tiggo 5X",
    "Tiggo 7",
    "Tiggo 8",
    "Arrizo 6",
    "iCar"
  ],
  BMW: [
    "Série 3",
    "X1",
    "X3",
    "X5",
    "Série 1",
    "X4",
    "X6",
    "M3"
  ],
  "Mercedes-Benz": [
    "Classe C",
    "GLA",
    "GLC",
    "Classe A",
    "GLE",
    "Sprinter"
  ],
  Audi: [
    "A3 Sedan",
    "A3 Sportback",
    "A4",
    "Q3",
    "Q5",
    "Q7",
    "e-tron"
  ],
  Volvo: [
    "EX30",
    "XC40",
    "XC60",
    "XC90",
    "C40"
  ],
  Ram: [
    "Rampage",
    "1500",
    "2500",
    "3500"
  ],
  Kia: [
    "Sportage",
    "Stonic",
    "Niro",
    "Cerato",
    "Carnival",
    "Bongo"
  ],
  "Land Rover": [
    "Defender",
    "Discovery",
    "Discovery Sport",
    "Range Rover Evoque",
    "Range Rover Velar",
    "Range Rover Sport"
  ],
  Porsche: [
    "911",
    "Macan",
    "Cayenne",
    "Panamera",
    "Taycan",
    "718 Boxster",
    "718 Cayman"
  ]
};

export const KNOWN_VEHICLE_COLORS = [
  "Branco",
  "Preto",
  "Prata",
  "Cinza",
  "Vermelho",
  "Azul",
  "Verde",
  "Amarelo",
  "Marrom",
  "Bege",
  "Laranja",
  "Dourado",
  "Bordô",
  "Vinho"
] as const;

export type KnownVehicleColor = (typeof KNOWN_VEHICLE_COLORS)[number];

export function getModelsForBrand(brand: string): readonly string[] {
  const normalizedBrand = brand.trim();
  const matchedKey = Object.keys(KNOWN_MODELS_BY_BRAND).find(
    (key) => key.toLowerCase() === normalizedBrand.toLowerCase()
  );

  if (matchedKey && KNOWN_MODELS_BY_BRAND[matchedKey]) {
    return KNOWN_MODELS_BY_BRAND[matchedKey];
  }

  return [];
}