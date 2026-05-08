export const destinations = [
  {
    slug: 'male-maldives',
    name: 'Male',
    country: 'Maldives',
    region: 'North Male Atoll',
    heroImage:
      'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'bali-indonesia',
    name: 'Bali',
    country: 'Indonesia',
    region: 'Seminyak',
    heroImage:
      'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'phuket-thailand',
    name: 'Phuket',
    country: 'Thailand',
    region: 'Kamala',
    heroImage:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'crete-greece',
    name: 'Crete',
    country: 'Greece',
    region: 'Elounda',
    heroImage:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
  },
];

export const amenities = [
  'Ocean view',
  'Private pool',
  'Airport transfer',
  'Breakfast included',
  'Spa access',
  'Fast Wi-Fi',
];

export const properties = [
  {
    slug: 'the-daria',
    destinationSlug: 'male-maldives',
    name: 'The Daria',
    summary: 'Beachfront villa with panoramic lagoon views and a private deck.',
    description: 'A premium overwater stay designed for long mornings, slow sunsets, and direct sea access.',
    address: 'North Male Atoll, Maldives',
    cardImage:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
    heroImage:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80',
    nightlyRateUsd: 10000,
    cleaningFeeUsd: 650,
    rating: 4.9,
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 8,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    ],
    amenities: ['Ocean view', 'Private pool', 'Breakfast included', 'Fast Wi-Fi'],
  },
  {
    slug: 'the-sanctuary',
    destinationSlug: 'bali-indonesia',
    name: 'The Sanctuary',
    summary: 'Contemporary tropical retreat with private courtyard and infinity pool.',
    description: 'Balanced for couples and family stays with resort-grade privacy and concierge support.',
    address: 'Seminyak, Bali, Indonesia',
    cardImage:
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=900&q=80',
    heroImage:
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1400&q=80',
    nightlyRateUsd: 9000,
    cleaningFeeUsd: 450,
    rating: 4.8,
    bedrooms: 3,
    bathrooms: 3,
    maxGuests: 6,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=900&q=80',
    ],
    amenities: ['Private pool', 'Airport transfer', 'Spa access', 'Fast Wi-Fi'],
  },
  {
    slug: 'the-infinity',
    destinationSlug: 'bali-indonesia',
    name: 'The Infinity',
    summary: 'Elegant courtyard home with bright interiors and curated local design.',
    description: 'A quiet luxury stay with generous living areas, ideal for extended premium trips.',
    address: 'Ubud, Bali, Indonesia',
    cardImage:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
    heroImage:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80',
    nightlyRateUsd: 8000,
    cleaningFeeUsd: 350,
    rating: 4.9,
    bedrooms: 4,
    bathrooms: 4,
    maxGuests: 8,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
    ],
    amenities: ['Private pool', 'Breakfast included', 'Fast Wi-Fi'],
  },
  {
    slug: 'la-maison',
    destinationSlug: 'crete-greece',
    name: 'La Maison',
    summary: 'Clifftop villa with open sea views, terrace dining, and calm minimal interiors.',
    description: 'Built for destination stays where design, privacy, and sunlight matter equally.',
    address: 'Elounda, Crete, Greece',
    cardImage:
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=80',
    heroImage:
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80',
    nightlyRateUsd: 8000,
    cleaningFeeUsd: 320,
    rating: 4.7,
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=80',
    ],
    amenities: ['Ocean view', 'Airport transfer', 'Fast Wi-Fi'],
  },
  {
    slug: 'serenity-shores',
    destinationSlug: 'phuket-thailand',
    name: 'Serenity Shores',
    summary: 'Palm-lined residence with relaxed pool terrace and warm timber detailing.',
    description: 'A resort-style house with coastal landscaping and flexible spaces for groups.',
    address: 'Kamala, Phuket, Thailand',
    cardImage:
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=80',
    heroImage:
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=80',
    nightlyRateUsd: 7000,
    cleaningFeeUsd: 260,
    rating: 4.8,
    bedrooms: 3,
    bathrooms: 3,
    maxGuests: 7,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=80',
    ],
    amenities: ['Private pool', 'Breakfast included', 'Fast Wi-Fi'],
  },
  {
    slug: 'azure-haven',
    destinationSlug: 'male-maldives',
    name: 'Azure Haven',
    summary: 'Waterfront suites with direct jetty access and a quiet private lounge.',
    description: 'Designed for premium island stays where arrival, transfer, and comfort are handled cleanly.',
    address: 'Male, Maldives',
    cardImage:
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=80',
    heroImage:
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=80',
    nightlyRateUsd: 8000,
    cleaningFeeUsd: 400,
    rating: 4.8,
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=80',
    ],
    amenities: ['Ocean view', 'Spa access', 'Fast Wi-Fi'],
  },
  {
    slug: 'ocean-breeze',
    destinationSlug: 'phuket-thailand',
    name: 'Ocean Breeze',
    summary: 'Soft modern villa with layered interiors and a private outdoor bath.',
    description: 'A compact luxury option for couples or small groups who want resort quality without excess.',
    address: 'Patong, Phuket, Thailand',
    cardImage:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
    heroImage:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80',
    nightlyRateUsd: 7000,
    cleaningFeeUsd: 280,
    rating: 4.8,
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
    ],
    amenities: ['Breakfast included', 'Fast Wi-Fi'],
  },
  {
    slug: 'palm-breeze',
    destinationSlug: 'phuket-thailand',
    name: 'Palm Breeze',
    summary: 'Garden villa built around timber, glass, and a calm layered landscape.',
    description: 'Well suited to multi-night stays with strong indoor-outdoor flow and family-friendly sizing.',
    address: 'Surin, Phuket, Thailand',
    cardImage:
      'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=900&q=80',
    heroImage:
      'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1400&q=80',
    nightlyRateUsd: 6000,
    cleaningFeeUsd: 250,
    rating: 4.9,
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 5,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=900&q=80',
    ],
    amenities: ['Private pool', 'Airport transfer', 'Fast Wi-Fi'],
  },
];
