const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CIELVO India-wide BeautyTech marketplace database (Production Foundation)...');

  // Clean existing tables in reverse dependency order
  await prisma.reviewResponse.deleteMany();
  await prisma.review.deleteMany();
  await prisma.paymentRecord.deleteMany();
  await prisma.otpAttemptLog.deleteMany();
  await prisma.bookingOtpChallenge.deleteMany();
  await prisma.bookingStatusHistory.deleteMany();
  await prisma.bookingItem.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.serviceImage.deleteMany();
  await prisma.staffService.deleteMany();
  await prisma.staffAvailability.deleteMany();
  await prisma.salonStaff.deleteMany();
  await prisma.salonHours.deleteMany();
  await prisma.salonServiceArea.deleteMany();
  await prisma.salonService.deleteMany();
  await prisma.salonLocation.deleteMany();
  await prisma.salonDocument.deleteMany();
  await prisma.customerFavourite.deleteMany();
  await prisma.salon.deleteMany();
  await prisma.service.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.customerAddress.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.supportMessage.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.adminAuditLog.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.homepageBanner.deleteMany();
  await prisma.platformSetting.deleteMany();
  await prisma.postalCode.deleteMany();
  await prisma.locality.deleteMany();
  await prisma.city.deleteMany();
  await prisma.district.deleteMany();
  await prisma.state.deleteMany();
  await prisma.country.deleteMany();

  // 1. COUNTRY: India
  const india = await prisma.country.create({
    data: {
      code: 'IN',
      name: 'India',
      phoneCode: '+91',
    },
  });

  // 2. ALL 28 INDIAN STATES & 8 UNION TERRITORIES
  const indianStatesData = [
    // States
    { name: 'Andhra Pradesh', code: 'AP', isUnionTerritory: false },
    { name: 'Arunachal Pradesh', code: 'AR', isUnionTerritory: false },
    { name: 'Assam', code: 'AS', isUnionTerritory: false },
    { name: 'Bihar', code: 'BR', isUnionTerritory: false },
    { name: 'Chhattisgarh', code: 'CG', isUnionTerritory: false },
    { name: 'Goa', code: 'GA', isUnionTerritory: false },
    { name: 'Gujarat', code: 'GJ', isUnionTerritory: false },
    { name: 'Haryana', code: 'HR', isUnionTerritory: false },
    { name: 'Himachal Pradesh', code: 'HP', isUnionTerritory: false },
    { name: 'Jharkhand', code: 'JH', isUnionTerritory: false },
    { name: 'Karnataka', code: 'KA', isUnionTerritory: false },
    { name: 'Kerala', code: 'KL', isUnionTerritory: false },
    { name: 'Madhya Pradesh', code: 'MP', isUnionTerritory: false },
    { name: 'Maharashtra', code: 'MH', isUnionTerritory: false },
    { name: 'Manipur', code: 'MN', isUnionTerritory: false },
    { name: 'Meghalaya', code: 'ML', isUnionTerritory: false },
    { name: 'Mizoram', code: 'MZ', isUnionTerritory: false },
    { name: 'Nagaland', code: 'NL', isUnionTerritory: false },
    { name: 'Odisha', code: 'OD', isUnionTerritory: false },
    { name: 'Punjab', code: 'PB', isUnionTerritory: false },
    { name: 'Rajasthan', code: 'RJ', isUnionTerritory: false },
    { name: 'Sikkim', code: 'SK', isUnionTerritory: false },
    { name: 'Tamil Nadu', code: 'TN', isUnionTerritory: false },
    { name: 'Telangana', code: 'TS', isUnionTerritory: false },
    { name: 'Tripura', code: 'TR', isUnionTerritory: false },
    { name: 'Uttar Pradesh', code: 'UP', isUnionTerritory: false },
    { name: 'Uttarakhand', code: 'UK', isUnionTerritory: false },
    { name: 'West Bengal', code: 'WB', isUnionTerritory: false },
    // Union Territories
    { name: 'Andaman and Nicobar Islands', code: 'AN', isUnionTerritory: true },
    { name: 'Chandigarh', code: 'CH', isUnionTerritory: true },
    { name: 'Dadra and Nagar Haveli and Daman and Diu', code: 'DH', isUnionTerritory: true },
    { name: 'Delhi', code: 'DL', isUnionTerritory: true },
    { name: 'Jammu and Kashmir', code: 'JK', isUnionTerritory: true },
    { name: 'Ladakh', code: 'LA', isUnionTerritory: true },
    { name: 'Lakshadweep', code: 'LD', isUnionTerritory: true },
    { name: 'Puducherry', code: 'PY', isUnionTerritory: true },
  ];

  const statesMap = {};
  for (const s of indianStatesData) {
    const createdState = await prisma.state.create({
      data: {
        countryId: india.id,
        name: s.name,
        code: s.code,
        isUnionTerritory: s.isUnionTerritory,
      },
    });
    statesMap[s.code] = createdState;
  }

  // 3. KEY DISTRICTS, CITIES, LOCALITIES & PIN CODES
  // Maharashtra - Mumbai
  const distMumbai = await prisma.district.create({
    data: { stateId: statesMap['MH'].id, name: 'Mumbai Suburban', code: 'MUM-SUB' },
  });
  const distPune = await prisma.district.create({
    data: { stateId: statesMap['MH'].id, name: 'Pune', code: 'PUN' },
  });

  const cityMumbai = await prisma.city.create({
    data: { stateId: statesMap['MH'].id, districtId: distMumbai.id, name: 'Mumbai', tier: 1, latitude: 19.076, longitude: 72.8777 },
  });
  const cityPune = await prisma.city.create({
    data: { stateId: statesMap['MH'].id, districtId: distPune.id, name: 'Pune', tier: 1, latitude: 18.5204, longitude: 73.8567 },
  });

  const mumbaiLocs = [
    { name: 'Bandra West', pincode: '400050', lat: 19.0596, lng: 72.8295 },
    { name: 'Juhu', pincode: '400049', lat: 19.1075, lng: 72.8263 },
    { name: 'Andheri West', pincode: '400058', lat: 19.1197, lng: 72.8464 },
    { name: 'Colaba', pincode: '400005', lat: 18.9067, lng: 72.8147 },
    { name: 'Powai', pincode: '400076', lat: 19.1176, lng: 72.906 },
  ];
  for (const loc of mumbaiLocs) {
    await prisma.locality.create({
      data: { cityId: cityMumbai.id, name: loc.name, postalCode: loc.pincode, latitude: loc.lat, longitude: loc.lng },
    });
    await prisma.postalCode.create({
      data: { code: loc.pincode, cityId: cityMumbai.id, stateId: statesMap['MH'].id, localityName: loc.name, latitude: loc.lat, longitude: loc.lng },
    });
  }

  const puneLocs = [
    { name: 'Koregaon Park', pincode: '411001', lat: 18.5362, lng: 73.894 },
    { name: 'Kalyani Nagar', pincode: '411006', lat: 18.5484, lng: 73.903 },
    { name: 'Baner', pincode: '411045', lat: 18.559, lng: 73.7868 },
    { name: 'Viman Nagar', pincode: '411014', lat: 18.5679, lng: 73.9143 },
  ];
  for (const loc of puneLocs) {
    await prisma.locality.create({
      data: { cityId: cityPune.id, name: loc.name, postalCode: loc.pincode, latitude: loc.lat, longitude: loc.lng },
    });
    await prisma.postalCode.create({
      data: { code: loc.pincode, cityId: cityPune.id, stateId: statesMap['MH'].id, localityName: loc.name, latitude: loc.lat, longitude: loc.lng },
    });
  }

  // Karnataka - Bengaluru
  const distBlr = await prisma.district.create({
    data: { stateId: statesMap['KA'].id, name: 'Bengaluru Urban', code: 'BLR-U' },
  });
  const cityBlr = await prisma.city.create({
    data: { stateId: statesMap['KA'].id, districtId: distBlr.id, name: 'Bengaluru', tier: 1, latitude: 12.9716, longitude: 77.5946 },
  });
  const blrLocs = [
    { name: 'Indiranagar', pincode: '560038', lat: 12.9784, lng: 77.6408 },
    { name: 'Koramangala', pincode: '560034', lat: 12.9352, lng: 77.6245 },
    { name: 'Whitefield', pincode: '560066', lat: 12.9698, lng: 77.75 },
    { name: 'Jayanagar', pincode: '560041', lat: 12.9308, lng: 77.5838 },
  ];
  for (const loc of blrLocs) {
    await prisma.locality.create({
      data: { cityId: cityBlr.id, name: loc.name, postalCode: loc.pincode, latitude: loc.lat, longitude: loc.lng },
    });
    await prisma.postalCode.create({
      data: { code: loc.pincode, cityId: cityBlr.id, stateId: statesMap['KA'].id, localityName: loc.name, latitude: loc.lat, longitude: loc.lng },
    });
  }

  // Delhi (NCT)
  const distSouthDelhi = await prisma.district.create({
    data: { stateId: statesMap['DL'].id, name: 'South Delhi', code: 'DL-S' },
  });
  const cityDelhi = await prisma.city.create({
    data: { stateId: statesMap['DL'].id, districtId: distSouthDelhi.id, name: 'New Delhi', tier: 1, latitude: 28.6139, longitude: 77.209 },
  });
  const delhiLocs = [
    { name: 'Connaught Place', pincode: '110001', lat: 28.6315, lng: 77.2167 },
    { name: 'Vasant Vihar', pincode: '110057', lat: 28.5604, lng: 77.1611 },
    { name: 'Greater Kailash', pincode: '110048', lat: 28.5398, lng: 77.2344 },
    { name: 'Hauz Khas', pincode: '110016', lat: 28.5494, lng: 77.2001 },
  ];
  for (const loc of delhiLocs) {
    await prisma.locality.create({
      data: { cityId: cityDelhi.id, name: loc.name, postalCode: loc.pincode, latitude: loc.lat, longitude: loc.lng },
    });
    await prisma.postalCode.create({
      data: { code: loc.pincode, cityId: cityDelhi.id, stateId: statesMap['DL'].id, localityName: loc.name, latitude: loc.lat, longitude: loc.lng },
    });
  }

  // Telangana - Hyderabad
  const distHyd = await prisma.district.create({
    data: { stateId: statesMap['TS'].id, name: 'Hyderabad', code: 'HYD' },
  });
  const cityHyd = await prisma.city.create({
    data: { stateId: statesMap['TS'].id, districtId: distHyd.id, name: 'Hyderabad', tier: 1, latitude: 17.385, longitude: 78.4867 },
  });
  const hydLocs = [
    { name: 'Jubilee Hills', pincode: '500033', lat: 17.4319, lng: 78.4073 },
    { name: 'Banjara Hills', pincode: '500034', lat: 17.4156, lng: 78.4354 },
    { name: 'Gachibowli', pincode: '500032', lat: 17.4401, lng: 78.3489 },
  ];
  for (const loc of hydLocs) {
    await prisma.locality.create({
      data: { cityId: cityHyd.id, name: loc.name, postalCode: loc.pincode, latitude: loc.lat, longitude: loc.lng },
    });
    await prisma.postalCode.create({
      data: { code: loc.pincode, cityId: cityHyd.id, stateId: statesMap['TS'].id, localityName: loc.name, latitude: loc.lat, longitude: loc.lng },
    });
  }

  // Tamil Nadu - Chennai
  const distChennai = await prisma.district.create({
    data: { stateId: statesMap['TN'].id, name: 'Chennai', code: 'CHN' },
  });
  const cityChennai = await prisma.city.create({
    data: { stateId: statesMap['TN'].id, districtId: distChennai.id, name: 'Chennai', tier: 1, latitude: 13.0827, longitude: 80.2707 },
  });
  const chnLocs = [
    { name: 'Alwarpet', pincode: '600018', lat: 13.0336, lng: 80.2505 },
    { name: 'Nungambakkam', pincode: '600034', lat: 13.0604, lng: 80.2415 },
    { name: 'Besant Nagar', pincode: '600090', lat: 13.0001, lng: 80.2667 },
  ];
  for (const loc of chnLocs) {
    await prisma.locality.create({
      data: { cityId: cityChennai.id, name: loc.name, postalCode: loc.pincode, latitude: loc.lat, longitude: loc.lng },
    });
    await prisma.postalCode.create({
      data: { code: loc.pincode, cityId: cityChennai.id, stateId: statesMap['TN'].id, localityName: loc.name, latitude: loc.lat, longitude: loc.lng },
    });
  }

  // 4. SERVICE CATEGORIES
  const categoriesData = [
    {
      name: 'Hair Care & Styling',
      slug: 'hair-care-styling',
      description: 'Couture haircuts, botanical keratin infusions, balayage, gloss treatments, and luxury blowouts.',
      iconName: 'Scissors',
      sortOrder: 1,
      imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Skin & Facial Therapies',
      slug: 'skin-facial-therapies',
      description: 'HydraFacials, cellular renewal rituals, lymphatic drainage, and 24K gold illumination.',
      iconName: 'Sparkles',
      sortOrder: 2,
      imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Nails & Couture Mani-Pedi',
      slug: 'nails-couture-mani-pedi',
      description: 'Russian manicures, BIAB gel extensions, therapeutic foot spas, and artisanal nail art.',
      iconName: 'Hand',
      sortOrder: 3,
      imageUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Bridal & Pre-Bridal Couture',
      slug: 'bridal-pre-bridal-couture',
      description: 'Signature bridal hair & makeup trials, full bespoke trousseau prep, and wedding day glam.',
      iconName: 'Crown',
      sortOrder: 4,
      imageUrl: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Spa, Massage & Wellness',
      slug: 'spa-massage-wellness',
      description: 'Swedish deep tissue, Ayurvedic potli rejuvenation, hot stone therapies, and body polishes.',
      iconName: 'HeartHandshake',
      sortOrder: 5,
      imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Makeup & Red Carpet Looks',
      slug: 'makeup-red-carpet',
      description: 'High-definition celebrity makeup, evening glam, cocktail styling, and soft glam airbrushing.',
      iconName: 'Palette',
      sortOrder: 6,
      imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: "Men's Grooming & Barbering",
      slug: 'mens-grooming',
      description: 'Executive fades, hot towel straight-razor shaves, beard contouring, and scalp revitalisation.',
      iconName: 'UserCheck',
      sortOrder: 7,
      imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const catMap = {};
  for (const c of categoriesData) {
    const cat = await prisma.serviceCategory.create({ data: c });
    catMap[c.slug] = cat;
  }

  // 5. MASTER SERVICES LIBRARY (Available for new salons when setting up their menus)
  const masterServices = [
    {
      categoryId: catMap['hair-care-styling'].id,
      name: 'Signature Bespoke Haircut & Kérastase Blowout',
      slug: 'bespoke-haircut-blowout',
      description: 'Customized consultation, precision cut according to face structure, and luxury Kérastase caviar infusion blowout.',
      durationMinutes: 60,
      basePrice: 1800,
      allowAtHome: true,
      allowInSalon: true,
      genderTarget: 'FEMALE',
    },
    {
      categoryId: catMap['hair-care-styling'].id,
      name: 'French Balayage & Gloss Treatment',
      slug: 'french-balayage-gloss',
      description: 'Hand-painted dimensional hair contouring finished with an acidic bonding gloss for high mirror shine.',
      durationMinutes: 150,
      basePrice: 6500,
      allowAtHome: false,
      allowInSalon: true,
      genderTarget: 'FEMALE',
    },
    {
      categoryId: catMap['skin-facial-therapies'].id,
      name: 'Oxygen Glow HydraFacial & Lymphatic Sculpt',
      slug: 'hydrafacial-lymphatic-sculpt',
      description: 'Deep pore vacuum extraction, peptide infusion, oxygen jet blast, and chilled cryo-globe lymphatic sculpting.',
      durationMinutes: 75,
      basePrice: 3800,
      allowAtHome: true,
      allowInSalon: true,
      genderTarget: 'UNISEX',
    },
    {
      categoryId: catMap['skin-facial-therapies'].id,
      name: '24K Imperial Gold Radiance Facial',
      slug: '24k-gold-radiance-facial',
      description: 'Pure 24K gold foil sheets pressed over hyaluronic serum for radiant, event-ready illumination.',
      durationMinutes: 90,
      basePrice: 5200,
      allowAtHome: true,
      allowInSalon: true,
      genderTarget: 'UNISEX',
    },
    {
      categoryId: catMap['nails-couture-mani-pedi'].id,
      name: 'Rose Quartz Luxury Manicure & Pedicure Duo',
      slug: 'rose-quartz-mani-pedi',
      description: 'Rose petal soak, organic brown sugar scrub, hot stone massage, cuticle perfection, and toxin-free gel finish.',
      durationMinutes: 90,
      basePrice: 2400,
      allowAtHome: true,
      allowInSalon: true,
      genderTarget: 'UNISEX',
    },
    {
      categoryId: catMap['makeup-red-carpet'].id,
      name: 'Red Carpet HD Airbrush Glam',
      slug: 'red-carpet-hd-airbrush',
      description: '16-hour camera-ready HD airbrush complexion, custom individual lash mapping, and lip contouring.',
      durationMinutes: 90,
      basePrice: 4500,
      allowAtHome: true,
      allowInSalon: true,
      genderTarget: 'FEMALE',
    },
    {
      categoryId: catMap['spa-massage-wellness'].id,
      name: 'Deep Rejuvenating Swedish Aromatherapy Massage',
      slug: 'swedish-aromatherapy-massage',
      description: 'Full body muscle knot release with warm organic cold-pressed lavender and bergamot botanical oils.',
      durationMinutes: 60,
      basePrice: 3200,
      allowAtHome: true,
      allowInSalon: true,
      genderTarget: 'UNISEX',
    },
  ];

  for (const s of masterServices) {
    await prisma.service.create({ data: s });
  }

  // 6. HOMEPAGE BANNERS & PLATFORM SETTINGS
  await prisma.homepageBanner.create({
    data: {
      title: 'Your Beauty. Your Way.',
      subtitle: 'Discover top-rated salons across India or experience certified salon professionals at your doorstep.',
      imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80',
      linkUrl: '/explore',
      badgeText: 'India-Wide BeautyTech Marketplace',
      sortOrder: 1,
      isActive: true,
    },
  });

  await prisma.platformSetting.create({
    data: {
      key: 'PLATFORM_NAME',
      value: 'CIELVO',
      description: 'Official registered brand name',
    },
  });

  await prisma.platformSetting.create({
    data: {
      key: 'TAGLINE',
      value: 'Your beauty. Your way.',
      description: 'Official brand tagline',
    },
  });

  await prisma.platformSetting.create({
    data: {
      key: 'SUPPORT_PHONE',
      value: '+917264845323',
      description: 'Customer concierge grievance desk',
    },
  });

  await prisma.platformSetting.create({
    data: {
      key: 'SUPPORT_EMAIL',
      value: 'cielvotechnologies@gmail.com',
      description: 'Official support and partner inquiries email',
    },
  });

  // 7. INITIAL PRODUCTION ADMINISTRATOR ACCOUNTS
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('AdminPassword@2026', salt);

  // Official Administrator Account (Primary)
  await prisma.user.create({
    data: {
      email: 'cielvotechnologies@gmail.com',
      phone: '+917264845323',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  // System Admin Alias Account
  await prisma.user.create({
    data: {
      email: 'admin@cielvo.com',
      phone: '+919876543210',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  console.log('\n========================================================');
  console.log('CIELVO PRODUCTION FOUNDATION SEED COMPLETE');
  console.log('========================================================');
  console.log('Database is 100% clean of mock customer/salon test data.');
  console.log('India-Wide geography, master categories, and services seeded.');
  console.log('Admin Account: cielvotechnologies@gmail.com / AdminPassword@2026');
  console.log('Admin Alias:   admin@cielvo.com / AdminPassword@2026');
  console.log('Support Phone: +917264845323');
  console.log('Support Email: cielvotechnologies@gmail.com');
  console.log('Ready to collect and store real registrations, bookings, and payments!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
