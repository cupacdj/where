// prisma/seed.ts
import { PrismaClient, PlaceType, Weekday, PlaceSource, TagCategory } from '@prisma/client';

// Helper: slugify place name -> filename (lowercase, remove accents, spaces -> hyphens)
const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const buildLocalImageUrl = (placeName: string) => `/uploads/places/${slugify(placeName)}.jpg`;

const prisma = new PrismaClient();

// ---------- TAGS ----------

const tagsSeed: {
  name: string;
  displayName: string;
  category: TagCategory;
  description?: string;
}[] = [
  // FOOD
  {
    name: 'specialty_coffee',
    displayName: 'Specialty coffee',
    category: 'FOOD',
    description: 'High-quality specialty coffee and espresso drinks',
  },
  {
    name: 'breakfast_brunch',
    displayName: 'Breakfast & brunch',
    category: 'FOOD',
  },
  {
    name: 'desserts',
    displayName: 'Desserts & sweets',
    category: 'FOOD',
  },
  {
    name: 'light_food',
    displayName: 'Light food & snacks',
    category: 'FOOD',
  },

  // PRICE
  {
    name: 'cheap',
    displayName: 'Budget friendly',
    category: 'PRICE',
  },
  {
    name: 'mid_range',
    displayName: 'Mid-range',
    category: 'PRICE',
  },

  // MOOD
  {
    name: 'quiet',
    displayName: 'Quiet / relaxed',
    category: 'MOOD',
  },
  {
    name: 'lively',
    displayName: 'Lively / busy',
    category: 'MOOD',
  },
  {
    name: 'romantic',
    displayName: 'Romantic',
    category: 'MOOD',
  },
  {
    name: 'laptop_friendly',
    displayName: 'Laptop friendly',
    category: 'MOOD',
    description: 'Good for working or studying on a laptop',
  },

  // VIEW / SPACE
  {
    name: 'garden_terrace',
    displayName: 'Garden / terrace',
    category: 'VIEW',
  },
  {
    name: 'river_nearby',
    displayName: 'Near the river',
    category: 'VIEW',
  },
  {
    name: 'outdoor_seating',
    displayName: 'Outdoor seating',
    category: 'VIEW',
  },

  // OTHER
  {
    name: 'pet_friendly',
    displayName: 'Pet friendly',
    category: 'OTHER',
  },
  {
    name: 'non_smoking',
    displayName: 'Non-smoking',
    category: 'OTHER',
  },
];

// ---------- PLACES ----------

type SeedWorkingHour = {
  dayOfWeek: Weekday;
  openTime: string | null;
  closeTime: string | null;
  isClosed?: boolean;
};

type SeedImage = {
  url: string;
  isPrimary?: boolean;
  order?: number;
  altText?: string | null;
};

type SeedPlace = {
  name: string;
  type: PlaceType;
  description: string;
  city: string;
  address: string;
  phone: string | null;
  website: string | null;
  priceLevel: number | null;
  source: PlaceSource;
  tags: string[]; // Tag.name values
  workingHours: SeedWorkingHour[];
  images: SeedImage[];
};

const placesSeed: SeedPlace[] = [
  // 1. Pržionica
  {
    name: 'Pržionica',
    type: 'CAFE',
    description:
      'Specialty coffee roastery and minimalist café in Dorćol, focused on high-quality espresso and filter coffee.',
    city: 'Belgrade',
    address: 'Dobračina 59b, 11000 Belgrade, Serbia',
    phone: '+381603666678',
    website: 'https://przionica.rs',
    priceLevel: 2,
    source: 'MANUAL',
    tags: [
      'specialty_coffee',
      'light_food',
      'cheap',
      'quiet',
      'laptop_friendly',
      'non_smoking',
      'outdoor_seating',
      'pet_friendly',
    ],
    workingHours: [
      { dayOfWeek: 'MONDAY', openTime: '09:00', closeTime: '18:00' },
      { dayOfWeek: 'TUESDAY', openTime: '08:00', closeTime: '18:00' },
      { dayOfWeek: 'WEDNESDAY', openTime: '08:00', closeTime: '18:00' },
      { dayOfWeek: 'THURSDAY', openTime: '08:00', closeTime: '18:00' },
      { dayOfWeek: 'FRIDAY', openTime: '08:00', closeTime: '18:00' },
      { dayOfWeek: 'SATURDAY', openTime: '09:00', closeTime: '18:00' },
      { dayOfWeek: 'SUNDAY', openTime: '09:00', closeTime: '18:00' },
    ],
    images: [
      {
        url: 'https://your-cdn.com/places/przionica/main.jpg',
        isPrimary: true,
        order: 0,
        altText: 'Interior of Pržionica café in Dorćol',
      },
    ],
  },

  // 2. D59B
  {
    name: 'D59B',
    type: 'CAFE',
    description:
      'Specialty coffee bar in Gornji Dorćol with cosy interior, terrace and its own roasted coffee.',
    city: 'Belgrade',
    address: 'Kralja Petra 70, 11000 Belgrade, Serbia',
    phone: null,
    website: 'https://radio.d59b.com',
    priceLevel: 2,
    source: 'MANUAL',
    tags: [
      'specialty_coffee',
      'light_food',
      'mid_range',
      'lively',
      'laptop_friendly',
      'outdoor_seating',
    ],
    workingHours: [
      { dayOfWeek: 'MONDAY', openTime: '07:30', closeTime: '22:00' },
      { dayOfWeek: 'TUESDAY', openTime: '07:30', closeTime: '22:00' },
      { dayOfWeek: 'WEDNESDAY', openTime: '07:30', closeTime: '22:00' },
      { dayOfWeek: 'THURSDAY', openTime: '07:30', closeTime: '22:00' },
      { dayOfWeek: 'FRIDAY', openTime: '07:30', closeTime: '22:00' },
      { dayOfWeek: 'SATURDAY', openTime: '09:00', closeTime: '22:00' },
      { dayOfWeek: 'SUNDAY', openTime: '09:00', closeTime: '20:00' },
    ],
    images: [
      {
        url: 'https://your-cdn.com/places/d59b/main.jpg',
        isPrimary: true,
        order: 0,
        altText: 'D59B coffee bar in Dorćol',
      },
    ],
  },

  // 3. UGAO Specialty Coffee (Dunavska)
  {
    name: 'UGAO Specialty Coffee',
    type: 'CAFE',
    description:
      'Modern, pet-friendly specialty coffee shop near the Danube, serving espresso and filter coffee with plant-based milk options.',
    city: 'Belgrade',
    address: 'Dunavska 2i, 11000 Belgrade, Serbia',
    phone: null,
    website: null,
    priceLevel: 2,
    source: 'MANUAL',
    tags: [
      'specialty_coffee',
      'light_food',
      'cheap',
      'quiet',
      'laptop_friendly',
      'non_smoking',
      'outdoor_seating',
      'pet_friendly',
      'river_nearby',
    ],
    workingHours: [
      { dayOfWeek: 'MONDAY', openTime: '08:00', closeTime: '20:00' },
      { dayOfWeek: 'TUESDAY', openTime: '08:00', closeTime: '20:00' },
      { dayOfWeek: 'WEDNESDAY', openTime: '08:00', closeTime: '20:00' },
      { dayOfWeek: 'THURSDAY', openTime: '08:00', closeTime: '20:00' },
      { dayOfWeek: 'FRIDAY', openTime: '08:00', closeTime: '20:00' },
      { dayOfWeek: 'SATURDAY', openTime: '08:00', closeTime: '20:00' },
      { dayOfWeek: 'SUNDAY', openTime: '08:00', closeTime: '20:00' },
    ],
    images: [
      {
        url: 'https://your-cdn.com/places/ugao-dunavska/main.jpg',
        isPrimary: true,
        order: 0,
        altText: 'UGAO Specialty Coffee in Dunavska street',
      },
    ],
  },

  // 4. Kafeterija Magazin 1907
  {
    name: 'Kafeterija Magazin 1907',
    type: 'CAFE',
    description:
      'Large multi-level Kafeterija location in the city centre, popular for specialty coffee, desserts and co-working.',
    city: 'Belgrade',
    address: 'Kralja Petra 16, 11000 Belgrade, Serbia',
    phone: '+381113281311',
    website: 'https://kafeterija.com',
    priceLevel: 2,
    source: 'MANUAL',
    tags: [
      'specialty_coffee',
      'breakfast_brunch',
      'desserts',
      'mid_range',
      'lively',
      'laptop_friendly',
      'outdoor_seating',
    ],
    workingHours: [
      { dayOfWeek: 'MONDAY', openTime: '07:00', closeTime: '23:00' },
      { dayOfWeek: 'TUESDAY', openTime: '07:00', closeTime: '23:00' },
      { dayOfWeek: 'WEDNESDAY', openTime: '07:00', closeTime: '23:00' },
      { dayOfWeek: 'THURSDAY', openTime: '07:00', closeTime: '23:00' },
      { dayOfWeek: 'FRIDAY', openTime: '07:00', closeTime: '23:00' },
      { dayOfWeek: 'SATURDAY', openTime: '08:00', closeTime: '23:00' },
      { dayOfWeek: 'SUNDAY', openTime: '08:00', closeTime: '23:00' },
    ],
    images: [
      {
        url: 'https://your-cdn.com/places/kafeterija-magazin1907/main.jpg',
        isPrimary: true,
        order: 0,
        altText: 'Kafeterija Magazin 1907 interior',
      },
    ],
  },

  // 5. Koffein (Uskočka 8)
  {
    name: 'Koffein',
    type: 'CAFE',
    description:
      'Small, cosy specialty coffee bar in Stari Grad, known for carefully prepared espresso drinks.',
    city: 'Belgrade',
    address: 'Uskočka 8, 11000 Belgrade, Serbia',
    phone: null,
    website: 'https://www.facebook.com/koffein.belgrade/',
    priceLevel: 2,
    source: 'MANUAL',
    tags: [
      'specialty_coffee',
      'light_food',
      'cheap',
      'quiet',
      'laptop_friendly',
      'outdoor_seating',
    ],
    workingHours: [
      { dayOfWeek: 'MONDAY', openTime: '08:00', closeTime: '22:00' },
      { dayOfWeek: 'TUESDAY', openTime: '08:00', closeTime: '22:00' },
      { dayOfWeek: 'WEDNESDAY', openTime: '08:00', closeTime: '22:00' },
      { dayOfWeek: 'THURSDAY', openTime: '08:00', closeTime: '22:00' },
      { dayOfWeek: 'FRIDAY', openTime: '08:00', closeTime: '22:00' },
      { dayOfWeek: 'SATURDAY', openTime: '08:00', closeTime: '22:00' },
      { dayOfWeek: 'SUNDAY', openTime: '08:30', closeTime: '20:00' },
    ],
    images: [
      {
        url: 'https://your-cdn.com/places/koffein-uskočka/main.jpg',
        isPrimary: true,
        order: 0,
        altText: 'Koffein cafe in Uskočka street',
      },
    ],
  },

  // 6. Cafe&Factory
  {
    name: 'Cafe&Factory',
    type: 'CAFE',
    description:
      'Roastery and café in Vračar with house blends, cakes and brunch options.',
    city: 'Belgrade',
    address: 'Nevesinjska 34, 11000 Belgrade, Serbia',
    phone: '+381653675641',
    website: 'https://cafe-factory.net',
    priceLevel: 3,
    source: 'MANUAL',
    tags: [
      'specialty_coffee',
      'light_food',
      'breakfast_brunch',
      'desserts',
      'mid_range',
      'lively',
      'laptop_friendly',
      'outdoor_seating',
    ],
    workingHours: [
      { dayOfWeek: 'MONDAY', openTime: '08:00', closeTime: '20:00' },
      { dayOfWeek: 'TUESDAY', openTime: '08:00', closeTime: '20:00' },
      { dayOfWeek: 'WEDNESDAY', openTime: '08:00', closeTime: '20:00' },
      { dayOfWeek: 'THURSDAY', openTime: '08:00', closeTime: '20:00' },
      { dayOfWeek: 'FRIDAY', openTime: '08:00', closeTime: '20:00' },
      { dayOfWeek: 'SATURDAY', openTime: '08:00', closeTime: '15:00' },
      { dayOfWeek: 'SUNDAY', openTime: '08:00', closeTime: '15:00' },
    ],
    images: [
      {
        url: 'https://your-cdn.com/places/cafe-factory/main.jpg',
        isPrimary: true,
        order: 0,
        altText: 'Cafe&Factory bar and roastery',
      },
    ],
  },

  // 7. Smokvica Molerova
  {
    name: 'Smokvica Molerova',
    type: 'CAFE',
    description:
      'Garden-style bistro and café in Vračar, offering breakfast, desserts and coffee.',
    city: 'Belgrade',
    address: 'Molerova 33, 11000 Belgrade, Serbia',
    phone: '+38163608446',
    website: 'https://smokvica.rs',
    priceLevel: 3,
    source: 'MANUAL',
    tags: [
      'specialty_coffee',
      'breakfast_brunch',
      'desserts',
      'mid_range',
      'romantic',
      'garden_terrace',
      'outdoor_seating',
      'pet_friendly',
    ],
    workingHours: [
      { dayOfWeek: 'MONDAY', openTime: '08:00', closeTime: '00:00' },
      { dayOfWeek: 'TUESDAY', openTime: '08:00', closeTime: '00:00' },
      { dayOfWeek: 'WEDNESDAY', openTime: '08:00', closeTime: '00:00' },
      { dayOfWeek: 'THURSDAY', openTime: '08:00', closeTime: '00:00' },
      { dayOfWeek: 'FRIDAY', openTime: '08:00', closeTime: '01:00' },
      { dayOfWeek: 'SATURDAY', openTime: '08:00', closeTime: '01:00' },
      { dayOfWeek: 'SUNDAY', openTime: '08:00', closeTime: '00:00' },
    ],
    images: [
      {
        url: 'https://your-cdn.com/places/smokvica-molerova/main.jpg',
        isPrimary: true,
        order: 0,
        altText: 'Garden of Smokvica Molerova',
      },
    ],
  },

  // 8. Kuca Specialty Coffee
  {
    name: 'Kuca Specialty Coffee',
    type: 'CAFE',
    description:
      'Neighbourhood specialty coffee shop with homemade cakes and gelato, family- and pet-friendly.',
    city: 'Belgrade',
    address: 'Vojvode Toze 25, 11000 Belgrade, Serbia',
    phone: '+381112851113',
    website: null,
    priceLevel: 2,
    source: 'MANUAL',
    tags: [
      'specialty_coffee',
      'light_food',
      'breakfast_brunch',
      'desserts',
      'cheap',
      'quiet',
      'garden_terrace',
      'pet_friendly',
      'non_smoking',
      'outdoor_seating',
      'laptop_friendly',
    ],
    workingHours: [
      { dayOfWeek: 'MONDAY', openTime: '09:00', closeTime: '20:00' },
      { dayOfWeek: 'TUESDAY', openTime: '09:00', closeTime: '20:00' },
      { dayOfWeek: 'WEDNESDAY', openTime: '09:00', closeTime: '20:00' },
      { dayOfWeek: 'THURSDAY', openTime: '09:00', closeTime: '20:00' },
      { dayOfWeek: 'FRIDAY', openTime: '09:00', closeTime: '20:00' },
      { dayOfWeek: 'SATURDAY', openTime: '09:00', closeTime: '17:00' },
      { dayOfWeek: 'SUNDAY', openTime: null, closeTime: null, isClosed: true },
    ],
    images: [
      {
        url: 'https://your-cdn.com/places/kuca-coffee/main.jpg',
        isPrimary: true,
        order: 0,
        altText: 'Garden of Kuca Specialty Coffee',
      },
    ],
  },

  // 9. Simbol Specialty Coffee Shop
  {
    name: 'Simbol Specialty Coffee Shop',
    type: 'CAFE',
    description:
      'Small specialty coffee shop near the centre, serving espresso and filter coffee.',
    city: 'Belgrade',
    address: 'Dečanska 19, 11000 Belgrade, Serbia',
    phone: null,
    website: null,
    priceLevel: 2,
    source: 'MANUAL',
    tags: [
      'specialty_coffee',
      'light_food',
      'cheap',
      'quiet',
      'laptop_friendly',
      'non_smoking',
      'pet_friendly',
      'outdoor_seating',
    ],
    workingHours: [
      { dayOfWeek: 'MONDAY', openTime: '07:00', closeTime: '18:00' },
      { dayOfWeek: 'TUESDAY', openTime: '07:00', closeTime: '18:00' },
      { dayOfWeek: 'WEDNESDAY', openTime: '07:00', closeTime: '18:00' },
      { dayOfWeek: 'THURSDAY', openTime: '07:00', closeTime: '18:00' },
      { dayOfWeek: 'FRIDAY', openTime: '07:00', closeTime: '18:00' },
      { dayOfWeek: 'SATURDAY', openTime: '08:00', closeTime: '19:00' },
      { dayOfWeek: 'SUNDAY', openTime: '09:00', closeTime: '17:00' },
    ],
    images: [
      {
        url: 'https://your-cdn.com/places/simbol/main.jpg',
        isPrimary: true,
        order: 0,
        altText: 'Simbol specialty coffee shop in Dečanska street',
      },
    ],
  },

  // 10. Bloom
  {
    name: 'Bloom',
    type: 'CAFE',
    description:
      'Popular breakfast & brunch spot in Dorćol with healthy dishes, desserts and good coffee.',
    city: 'Belgrade',
    address: 'Gospodar Jevremova 23, 11000 Belgrade, Serbia',
    phone: '+381653262295',
    website: 'https://www.bloombelgrade.com',
    priceLevel: 3,
    source: 'MANUAL',
    tags: [
      'specialty_coffee',
      'breakfast_brunch',
      'desserts',
      'mid_range',
      'quiet',
      'garden_terrace',
      'pet_friendly',
      'non_smoking',
      'outdoor_seating',
      'laptop_friendly',
    ],
    workingHours: [
      { dayOfWeek: 'MONDAY', openTime: null, closeTime: null, isClosed: true },
      { dayOfWeek: 'TUESDAY', openTime: '08:00', closeTime: '16:00' },
      { dayOfWeek: 'WEDNESDAY', openTime: '08:00', closeTime: '16:00' },
      { dayOfWeek: 'THURSDAY', openTime: '08:00', closeTime: '16:00' },
      { dayOfWeek: 'FRIDAY', openTime: '08:00', closeTime: '16:00' },
      { dayOfWeek: 'SATURDAY', openTime: '09:00', closeTime: '17:00' },
      { dayOfWeek: 'SUNDAY', openTime: '09:00', closeTime: '17:00' },
    ],
    images: [
      {
        url: 'https://your-cdn.com/places/bloom/main.jpg',
        isPrimary: true,
        order: 0,
        altText: 'Bloom breakfast & brunch in Dorćol',
      },
    ],
  },
];

// ---------- MAIN SEED FUNCTION ----------

async function main() {
  console.log('Seeding tags...');
  for (const tag of tagsSeed) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: {
        name: tag.name,
        displayName: tag.displayName,
        category: tag.category,
        description: tag.description,
      },
    });
  }

  console.log('Seeding places...');
  for (const place of placesSeed) {
    await prisma.place.create({
      data: {
        name: place.name,
        type: place.type,
        description: place.description,
        city: place.city,
        address: place.address,
        latitude: null,
        longitude: null,
        phone: place.phone,
        website: place.website,
        priceLevel: place.priceLevel,
        isActive: true,
        source: place.source,

        workingHours: {
          create: place.workingHours.map((wh) => ({
            dayOfWeek: wh.dayOfWeek,
            openTime: wh.openTime,
            closeTime: wh.closeTime,
            isClosed: wh.isClosed ?? false,
          })),
        },

        images: {
          create:
            (place.images && place.images.length
              ? place.images
              : [{ isPrimary: true, order: 0, altText: `${place.name} photo` }]
            ).map((img, idx) => ({
              // point to backend/uploads/places/{slug}.jpg
              url: buildLocalImageUrl(place.name),
              source: 'MANUAL',
              isPrimary: idx === 0 ? (img.isPrimary ?? true) : (img.isPrimary ?? false),
              order: img.order ?? idx,
              altText: img.altText ?? `${place.name}`,
            })),
        },

        tags: {
          create: place.tags.map((tagName) => ({
            tag: { connect: { name: tagName } },
          })),
        },
      },
    });
  }

  console.log('Done seeding.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
