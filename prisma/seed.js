const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CIELVO India-wide BeautyTech marketplace database...');

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
  // Maharashtra
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

  // Localities & PINs in Mumbai
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

  // Localities & PINs in Pune
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

  // 4. USERS & PASSWORDS
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('CielvoPass@2026', salt);
  const adminPasswordHash = await bcrypt.hash('AdminPassword@2026', salt);

  // A. Admin User
  const adminUser = await prisma.user.create({
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

  // B. Salon Owner 1 (Aura Luxury Salon)
  const salonOwner1 = await prisma.user.create({
    data: {
      email: 'owner.aura@cielvo.com',
      phone: '+919811100011',
      passwordHash,
      role: 'SALON_OWNER',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  // C. Salon Owner 2 (Elysian Atelier)
  const salonOwner2 = await prisma.user.create({
    data: {
      email: 'owner.elysian@cielvo.com',
      phone: '+919811100022',
      passwordHash,
      role: 'SALON_OWNER',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  // D. Salon Owner 3 (Belleza Prime)
  const salonOwner3 = await prisma.user.create({
    data: {
      email: 'owner.belleza@cielvo.com',
      phone: '+919811100033',
      passwordHash,
      role: 'SALON_OWNER',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  // E. Salon Staff Users
  const staffUser1 = await prisma.user.create({
    data: {
      email: 'staff.meera@cielvo.com',
      phone: '+919877711101',
      passwordHash,
      role: 'SALON_STAFF',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const staffUser2 = await prisma.user.create({
    data: {
      email: 'staff.rohit@cielvo.com',
      phone: '+919877711102',
      passwordHash,
      role: 'SALON_STAFF',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const staffUser3 = await prisma.user.create({
    data: {
      email: 'staff.aanya@cielvo.com',
      phone: '+919877711103',
      passwordHash,
      role: 'SALON_STAFF',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  // F. Customers
  const customerUser1 = await prisma.user.create({
    data: {
      email: 'priya@cielvo.com',
      phone: '+919822211100',
      passwordHash,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const customerProfile1 = await prisma.customerProfile.create({
    data: {
      userId: customerUser1.id,
      fullName: 'Priya Sharma',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      defaultState: 'Maharashtra',
      defaultCity: 'Mumbai',
      defaultPincode: '400050',
    },
  });

  await prisma.customerAddress.create({
    data: {
      customerId: customerProfile1.id,
      label: 'Home',
      addressLine1: 'B-402, Sea Crest Apartments, Perry Cross Road',
      locality: 'Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400050',
      landmark: 'Near Carter Road Promenade',
      latitude: 19.062,
      longitude: 72.828,
      isDefault: true,
    },
  });

  const customerUser2 = await prisma.user.create({
    data: {
      email: 'ananya@cielvo.com',
      phone: '+919833322211',
      passwordHash,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const customerProfile2 = await prisma.customerProfile.create({
    data: {
      userId: customerUser2.id,
      fullName: 'Ananya Iyer',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      defaultState: 'Karnataka',
      defaultCity: 'Bengaluru',
      defaultPincode: '560038',
    },
  });

  await prisma.customerAddress.create({
    data: {
      customerId: customerProfile2.id,
      label: 'Home',
      addressLine1: 'Villa 12, Palm Meadows, 100 Feet Road',
      locality: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      landmark: 'Near Metro Station',
      latitude: 12.978,
      longitude: 77.641,
      isDefault: true,
    },
  });

  // 5. SERVICE CATEGORIES
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

  // 6. MASTER SERVICES
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

  const serviceMap = {};
  for (const s of masterServices) {
    const srv = await prisma.service.create({ data: s });
    serviceMap[s.slug] = srv;
  }

  // 7. APPROVED SALONS & MULTI-BRANCH NETWORK
  // Salon 1: Aura Luxury Salon & Spa (Mumbai & Bengaluru)
  const salon1 = await prisma.salon.create({
    data: {
      ownerId: salonOwner1.id,
      businessName: 'Aura Luxury Salon & Spa',
      slug: 'aura-luxury-salon-spa',
      registrationNumber: 'MH-MUM-2023-SAL-9821',
      description: 'Aura is a pinnacle of contemporary luxury and conscious beauty rituals. Our master stylists and aestheticians deliver bespoke transformations using globally acclaimed organic formulations.',
      logoUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80',
      coverImageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
      status: 'APPROVED',
      approvedAt: new Date(),
      rating: 4.9,
      reviewCount: 38,
      allowInSalon: true,
      allowAtHome: true,
      isFeatured: true,
    },
  });

  // Salon 1 - Branch 1: Bandra West, Mumbai
  const branch1MUM = await prisma.salonLocation.create({
    data: {
      salonId: salon1.id,
      branchName: 'Aura Bandra Flagship',
      phone: '+919811100011',
      email: 'bandra@aurasalon.com',
      addressLine: 'Ground & 1st Floor, The Athena Building, Linking Road',
      locality: 'Bandra West',
      cityId: cityMumbai.id,
      city: 'Mumbai',
      district: 'Mumbai Suburban',
      state: 'Maharashtra',
      postalCode: '400050',
      latitude: 19.0596,
      longitude: 72.8295,
      serviceRadiusKm: 12.0,
      allowAtHome: true,
      isActive: true,
    },
  });

  // Salon 1 - Branch 2: Indiranagar, Bengaluru
  const branch1BLR = await prisma.salonLocation.create({
    data: {
      salonId: salon1.id,
      branchName: 'Aura Indiranagar Atelier',
      phone: '+919811100012',
      email: 'indiranagar@aurasalon.com',
      addressLine: 'Plot 482, 12th Main Road, HAL 2nd Stage',
      locality: 'Indiranagar',
      cityId: cityBlr.id,
      city: 'Bengaluru',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      postalCode: '560038',
      latitude: 12.9784,
      longitude: 77.6408,
      serviceRadiusKm: 10.0,
      allowAtHome: true,
      isActive: true,
    },
  });

  // Salon 2: Elysian Atelier & Beauty Lounge (Hyderabad & Pune)
  const salon2 = await prisma.salon.create({
    data: {
      ownerId: salonOwner2.id,
      businessName: 'Elysian Atelier & Beauty Lounge',
      slug: 'elysian-atelier-beauty-lounge',
      registrationNumber: 'TS-HYD-2022-EL-4512',
      description: 'Elysian Atelier blends French aesthetic refinement with Indian skin wellness secrets. Renowned for transformative bridal couture, restorative facials, and personalized doorstep beauty experiences.',
      logoUrl: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=300&q=80',
      coverImageUrl: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80',
      status: 'APPROVED',
      approvedAt: new Date(),
      rating: 4.8,
      reviewCount: 24,
      allowInSalon: true,
      allowAtHome: true,
      isFeatured: true,
    },
  });

  const branch2HYD = await prisma.salonLocation.create({
    data: {
      salonId: salon2.id,
      branchName: 'Elysian Jubilee Hills',
      phone: '+919811100022',
      email: 'jhills@elysianatelier.com',
      addressLine: 'Road No. 36, Near Peddamma Temple',
      locality: 'Jubilee Hills',
      cityId: cityHyd.id,
      city: 'Hyderabad',
      district: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500033',
      latitude: 17.4319,
      longitude: 78.4073,
      serviceRadiusKm: 15.0,
      allowAtHome: true,
      isActive: true,
    },
  });

  const branch2PUN = await prisma.salonLocation.create({
    data: {
      salonId: salon2.id,
      branchName: 'Elysian Koregaon Park',
      phone: '+919811100023',
      email: 'kpune@elysianatelier.com',
      addressLine: 'Lane 7, Above Sante Spa Cuisine',
      locality: 'Koregaon Park',
      cityId: cityPune.id,
      city: 'Pune',
      district: 'Pune',
      state: 'Maharashtra',
      postalCode: '411001',
      latitude: 18.5362,
      longitude: 73.894,
      serviceRadiusKm: 10.0,
      allowAtHome: true,
      isActive: true,
    },
  });

  // Salon 3: Belleza Prime Studios (New Delhi)
  const salon3 = await prisma.salon.create({
    data: {
      ownerId: salonOwner3.id,
      businessName: 'Belleza Prime Studios',
      slug: 'belleza-prime-studios',
      registrationNumber: 'DL-DEL-2024-BP-1029',
      description: 'Capital city destination for modern trendsetters. Our certified trichologists and dermal specialists craft flawless looks for high-profile events and everyday glamour.',
      logoUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=300&q=80',
      coverImageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
      status: 'APPROVED',
      approvedAt: new Date(),
      rating: 4.7,
      reviewCount: 19,
      allowInSalon: true,
      allowAtHome: true,
      isFeatured: true,
    },
  });

  const branch3DEL = await prisma.salonLocation.create({
    data: {
      salonId: salon3.id,
      branchName: 'Belleza Vasant Vihar',
      phone: '+919811100033',
      email: 'vvihar@bellezaprime.com',
      addressLine: 'Commercial Complex, Basant Lok Market',
      locality: 'Vasant Vihar',
      cityId: cityDelhi.id,
      city: 'New Delhi',
      district: 'South Delhi',
      state: 'Delhi',
      postalCode: '110057',
      latitude: 28.5604,
      longitude: 77.1611,
      serviceRadiusKm: 12.0,
      allowAtHome: true,
      isActive: true,
    },
  });

  // 8. SALON BUSINESS HOURS (7 days a week)
  const allBranches = [branch1MUM, branch1BLR, branch2HYD, branch2PUN, branch3DEL];
  for (const branch of allBranches) {
    for (let day = 0; day <= 6; day++) {
      await prisma.salonHours.create({
        data: {
          locationId: branch.id,
          dayOfWeek: day,
          openTime: '09:00',
          closeTime: '21:00',
          isClosed: false,
        },
      });
    }
  }

  // 9. SALON SERVICES AT BRANCHES
  // Bandra Flagship Services
  const ss1 = await prisma.salonService.create({
    data: {
      salonId: salon1.id,
      locationId: branch1MUM.id,
      serviceId: serviceMap['bespoke-haircut-blowout'].id,
      customPrice: 1950,
      customDurationMinutes: 60,
      allowAtHome: true,
      allowInSalon: true,
      isActive: true,
    },
  });

  const ss2 = await prisma.salonService.create({
    data: {
      salonId: salon1.id,
      locationId: branch1MUM.id,
      serviceId: serviceMap['hydrafacial-lymphatic-sculpt'].id,
      customPrice: 3950,
      customDurationMinutes: 75,
      allowAtHome: true,
      allowInSalon: true,
      isActive: true,
    },
  });

  const ss3 = await prisma.salonService.create({
    data: {
      salonId: salon1.id,
      locationId: branch1MUM.id,
      serviceId: serviceMap['rose-quartz-mani-pedi'].id,
      customPrice: 2500,
      customDurationMinutes: 90,
      allowAtHome: true,
      allowInSalon: true,
      isActive: true,
    },
  });

  const ss4 = await prisma.salonService.create({
    data: {
      salonId: salon1.id,
      locationId: branch1MUM.id,
      serviceId: serviceMap['french-balayage-gloss'].id,
      customPrice: 6800,
      customDurationMinutes: 150,
      allowAtHome: false,
      allowInSalon: true,
      isActive: true,
    },
  });

  // Indiranagar Services
  const ss5 = await prisma.salonService.create({
    data: {
      salonId: salon1.id,
      locationId: branch1BLR.id,
      serviceId: serviceMap['hydrafacial-lymphatic-sculpt'].id,
      customPrice: 3800,
      customDurationMinutes: 75,
      allowAtHome: true,
      allowInSalon: true,
      isActive: true,
    },
  });

  // Jubilee Hills Services
  const ss6 = await prisma.salonService.create({
    data: {
      salonId: salon2.id,
      locationId: branch2HYD.id,
      serviceId: serviceMap['red-carpet-hd-airbrush'].id,
      customPrice: 4800,
      customDurationMinutes: 90,
      allowAtHome: true,
      allowInSalon: true,
      isActive: true,
    },
  });

  // 10. SALON STAFF PROFILES
  // Staff 1: Meera Patel (Bandra West - Aura)
  const staff1 = await prisma.salonStaff.create({
    data: {
      locationId: branch1MUM.id,
      userId: staffUser1.id,
      fullName: 'Meera Patel',
      phone: '+919877711101',
      email: 'staff.meera@cielvo.com',
      roleTitle: 'Senior Aesthetician & Dermal Expert',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      bio: 'CIDESCO certified with 8 years of luxury clinical skincare experience. Specialized in hydrafacial infusions and non-invasive facial sculpting.',
      isActive: true,
      isAvailable: true,
      atHomeEnabled: true,
    },
  });

  // Staff 2: Rohit Verma (Bandra West - Aura)
  const staff2 = await prisma.salonStaff.create({
    data: {
      locationId: branch1MUM.id,
      userId: staffUser2.id,
      fullName: 'Rohit Verma',
      phone: '+919877711102',
      email: 'staff.rohit@cielvo.com',
      roleTitle: 'Master Creative Stylist & Colorist',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      bio: 'Trained at Toni&Guy London. Master of precision texturizing, French balayage, and restorative hair ceremonies.',
      isActive: true,
      isAvailable: true,
      atHomeEnabled: true,
    },
  });

  // Staff 3: Aanya Sen (Bengaluru - Aura)
  const staff3 = await prisma.salonStaff.create({
    data: {
      locationId: branch1BLR.id,
      userId: staffUser3.id,
      fullName: 'Aanya Sen',
      phone: '+919877711103',
      email: 'staff.aanya@cielvo.com',
      roleTitle: 'Senior Skin Ritualist',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
      bio: 'Pioneered holistic skin recovery treatments combining organic actives with cold crystal massage.',
      isActive: true,
      isAvailable: true,
      atHomeEnabled: true,
    },
  });

  // Link staff to services
  await prisma.staffService.create({ data: { staffId: staff1.id, salonServiceId: ss2.id } }); // Meera -> HydraFacial
  await prisma.staffService.create({ data: { staffId: staff1.id, salonServiceId: ss3.id } }); // Meera -> Mani-Pedi
  await prisma.staffService.create({ data: { staffId: staff2.id, salonServiceId: ss1.id } }); // Rohit -> Haircut
  await prisma.staffService.create({ data: { staffId: staff2.id, salonServiceId: ss4.id } }); // Rohit -> Balayage
  await prisma.staffService.create({ data: { staffId: staff3.id, salonServiceId: ss5.id } }); // Aanya -> Blr HydraFacial

  // 11. SAMPLE BOOKINGS WORKFLOW
  // Booking A: At-Home Booking - Active Doorstep Verification Ready
  // Customer: Priya Sharma | Salon: Aura Bandra | Service: HydraFacial | Staff: Meera Patel
  const customerOtpPlain = '482910';
  const staffOtpPlain = '619342';
  const customerOtpHashed = await bcrypt.hash(customerOtpPlain, 8);
  const staffOtpHashed = await bcrypt.hash(staffOtpPlain, 8);

  const bookingA = await prisma.booking.create({
    data: {
      bookingNumber: 'CLV-2026-08492',
      customerId: customerProfile1.id,
      salonId: salon1.id,
      locationId: branch1MUM.id,
      salonServiceId: ss2.id,
      staffId: staff1.id,
      bookingType: 'AT_HOME',
      status: 'ARRIVED', // Staff has arrived at customer's doorstep! Two-way OTP challenge is active!
      appointmentDate: '2026-11-08',
      appointmentTime: '11:00',
      serviceDurationMinutes: 75,
      servicePrice: 3950,
      totalAmount: 3950,
      customerNotes: 'Please ring bell twice. Sensitive skin prone to redness.',
      customerAddressId: customerProfile1.id,
      serviceAddressSnapshot: 'B-402, Sea Crest Apartments, Perry Cross Road, Bandra West, Mumbai 400050 (Landmark: Near Carter Road Promenade)',
      customerLatitude: 19.062,
      customerLongitude: 72.828,
      acceptedAt: new Date(Date.now() - 3600000 * 2),
      arrivedAt: new Date(Date.now() - 300000), // arrived 5 mins ago
    },
  });

  await prisma.bookingItem.create({
    data: {
      bookingId: bookingA.id,
      serviceName: 'Oxygen Glow HydraFacial & Lymphatic Sculpt',
      categoryName: 'Skin & Facial Therapies',
      price: 3950,
      durationMinutes: 75,
    },
  });

  await prisma.bookingStatusHistory.create({
    data: {
      bookingId: bookingA.id,
      fromStatus: 'CONFIRMED',
      toStatus: 'ARRIVED',
      changedByUserId: staffUser1.id,
      notes: 'Professional Meera Patel arrived at customer doorstep. Generated two-way verification challenge.',
    },
  });

  // Active OTP Challenge for Booking A
  await prisma.bookingOtpChallenge.create({
    data: {
      bookingId: bookingA.id,
      staffId: staff1.id,
      customerId: customerProfile1.id,
      customerOtpHashed,
      professionalOtpHashed: staffOtpHashed,
      customerOtpVerified: false,
      professionalOtpVerified: false,
      expiresAt: new Date(Date.now() + 1000 * 60 * 10), // 10 min window
    },
  });

  // Booking B: In-Salon Completed Booking with Verified Review & Direct Payment
  const bookingB = await prisma.booking.create({
    data: {
      bookingNumber: 'CLV-2026-07119',
      customerId: customerProfile1.id,
      salonId: salon1.id,
      locationId: branch1MUM.id,
      salonServiceId: ss1.id,
      staffId: staff2.id,
      bookingType: 'IN_SALON',
      status: 'COMPLETED',
      appointmentDate: '2026-11-04',
      appointmentTime: '15:30',
      serviceDurationMinutes: 60,
      servicePrice: 1950,
      totalAmount: 1950,
      customerNotes: 'Prefers layered blowout finish.',
      acceptedAt: new Date('2026-11-03T10:00:00Z'),
      completedAt: new Date('2026-11-04T16:45:00Z'),
    },
  });

  await prisma.bookingItem.create({
    data: {
      bookingId: bookingB.id,
      serviceName: 'Signature Bespoke Haircut & Kérastase Blowout',
      categoryName: 'Hair Care & Styling',
      price: 1950,
      durationMinutes: 60,
    },
  });

  // Direct Payment Record for Booking B
  await prisma.paymentRecord.create({
    data: {
      bookingId: bookingB.id,
      salonId: salon1.id,
      locationId: branch1MUM.id,
      customerId: customerProfile1.id,
      amount: 1950,
      paymentMethod: 'UPI',
      paymentStatus: 'CUSTOMER_ACKNOWLEDGED',
      transactionReference: 'UPI/HDFC/61298492019/CIELVO',
      notes: 'Customer paid salon UPI QR directly at front desk. Acknowledged in app.',
      recordedByUserId: salonOwner1.id,
      acknowledgedAt: new Date('2026-11-04T16:50:00Z'),
    },
  });

  // Verified Review for Booking B
  const revB = await prisma.review.create({
    data: {
      bookingId: bookingB.id,
      customerId: customerProfile1.id,
      salonId: salon1.id,
      locationId: branch1MUM.id,
      rating: 5,
      title: 'Flawless precision cut and world-class ambiance',
      comment: 'Rohit is truly a master stylist. The consultation was thorough, the Kérastase caviar treatment left my hair silky for days, and the salon ambiance is pristine. The direct UPI payment was effortless.',
      isVerifiedBooking: true,
      moderationStatus: 'APPROVED',
    },
  });

  await prisma.reviewResponse.create({
    data: {
      reviewId: revB.id,
      salonId: salon1.id,
      responseText: 'Thank you so much Priya! It was an absolute pleasure hosting you at Aura Bandra. Looking forward to your next visit!',
    },
  });

  // Booking C: New Pending Request for Salon Owner
  await prisma.booking.create({
    data: {
      bookingNumber: 'CLV-2026-09102',
      customerId: customerProfile2.id,
      salonId: salon1.id,
      locationId: branch1BLR.id,
      salonServiceId: ss5.id,
      bookingType: 'IN_SALON',
      status: 'REQUESTED',
      appointmentDate: '2026-11-10',
      appointmentTime: '14:00',
      serviceDurationMinutes: 75,
      servicePrice: 3800,
      totalAmount: 3800,
      customerNotes: 'First time at Aura Indiranagar. Looking forward to the hydrafacial.',
    },
  });

  // 12. HOMEPAGE BANNERS & PLATFORM SETTINGS
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
      value: '+91 8000 243586',
      description: 'Customer concierge grievance desk',
    },
  });

  console.log('Seeding completed successfully!');
  console.log('Admin Account: admin@cielvo.com / AdminPassword@2026');
  console.log('Salon Owner Account: owner.aura@cielvo.com / CielvoPass@2026');
  console.log('Salon Staff Account: staff.meera@cielvo.com / CielvoPass@2026');
  console.log('Customer Account: priya@cielvo.com / CielvoPass@2026');
  console.log(`Doorstep OTP Demo: Customer OTP = ${customerOtpPlain}, Staff OTP = ${staffOtpPlain}`);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
