// Client-side API Mock and Fallback service for static deployments (e.g. GitHub Pages)

const DEFAULT_MEDICINES = [
  {
    id: 'med1',
    name: 'Paracetamol (Crocin 650mg)',
    genericName: 'Paracetamol',
    category: 'Fever & Pain Relief',
    price: 15,
    stock: 120,
    dosage: '1 tablet after food, up to 3 times a day',
    description: 'Relieves fever, headache, and mild to moderate body pain.',
    bilingualLabel: 'पैरासिटामोल (बुखार और बदन दर्द की दवा)'
  },
  {
    id: 'med2',
    name: 'Cetirizine (Alerid 10mg)',
    genericName: 'Cetirizine Hydrochloride',
    category: 'Cold & Allergy',
    price: 12,
    stock: 80,
    dosage: '1 tablet at bedtime',
    description: 'Relieves runny nose, sneezing, itching, and watery eyes caused by allergies or cold.',
    bilingualLabel: 'सिट्रीजीन (सर्दी, जुकाम और एलर्जी की दवा)'
  },
  {
    id: 'med3',
    name: 'Omeprazole (Omez 20mg)',
    genericName: 'Omeprazole',
    category: 'Stomach & Gas',
    price: 35,
    stock: 100,
    dosage: '1 capsule in the morning, 30 mins before breakfast',
    description: 'Reduces excess acid production in stomach. Helpful for gas, acidity, and heartburn.',
    bilingualLabel: 'ओमेप्राजोल (एसिडिटी और पेट की गैस की दवा)'
  },
  {
    id: 'med4',
    name: 'Pantoprazole (Pan-40)',
    genericName: 'Pantoprazole Sodium',
    category: 'Stomach & Gas',
    price: 48,
    stock: 90,
    dosage: '1 tablet daily before the first meal of the day',
    description: 'Effective relief from severe heartburn, acid reflux, and peptic ulcers.',
    bilingualLabel: 'पेंटोप्राजोल (गैस और छाती में जलन की दवा)'
  },
  {
    id: 'med5',
    name: 'ORS (Electral Powder)',
    genericName: 'Oral Rehydration Salts',
    category: 'First Aid & Nutrition',
    price: 22,
    stock: 200,
    dosage: 'Dissolve one packet in 1 Liter of clean drinking water. Drink throughout the day.',
    description: 'Restores lost body fluids and electrolytes due to dehydration, diarrhea, or vomiting.',
    bilingualLabel: 'ओ.आर.एस. (दस्त और कमजोरी में पानी की कमी पूरी करने का घोल)'
  },
  {
    id: 'med6',
    name: 'Multivitamin (Zincovit)',
    genericName: 'Multivitamins & Zinc',
    category: 'Vitamins & Nutrition',
    price: 110,
    stock: 60,
    dosage: '1 tablet daily after lunch',
    description: 'Improves immunity, strength, and helps in faster recovery from illnesses.',
    bilingualLabel: 'मल्टीविटामिन और जिंक (ताकत और रोग प्रतिरोधक क्षमता बढ़ाने की दवा)'
  },
  {
    id: 'med7',
    name: 'Amlodipine (Amlopin 5mg)',
    genericName: 'Amlodipine Besylate',
    category: 'Blood Pressure',
    price: 28,
    stock: 150,
    dosage: '1 tablet daily, preferably at the same time, as advised by doctor',
    description: 'Lowers blood pressure and helps prevent future heart disease or strokes.',
    bilingualLabel: 'एम्लोडिपिन (उच्च रक्तचाप / बीपी नियंत्रण की दवा)'
  },
  {
    id: 'med8',
    name: 'Metformin (Glycomet 500mg)',
    genericName: 'Metformin Hydrochloride',
    category: 'Diabetes Care',
    price: 32,
    stock: 140,
    dosage: '1 tablet with dinner or immediately after food',
    description: 'Helps control blood sugar levels in patients with Type-2 diabetes.',
    bilingualLabel: 'मेटफॉर्मिन (शुगर / मधुमेह नियंत्रण की दवा)'
  },
  {
    id: 'med9',
    name: 'Cough Syrup (Koflet 100ml)',
    genericName: 'Herbal Cough Formula',
    category: 'Cold & Allergy',
    price: 85,
    stock: 50,
    dosage: '2 teaspoons (10ml) thrice a day',
    description: 'Soothes dry cough and throat irritation. Promotes expectoration of mucus.',
    bilingualLabel: 'कफ सिरप (सूखी और गीली खांसी की दवा)'
  },
  {
    id: 'med10',
    name: 'Ibuprofen (Brufen 400mg)',
    genericName: 'Ibuprofen',
    category: 'Fever & Pain Relief',
    price: 18,
    stock: 110,
    dosage: '1 tablet after meals, only when in pain (maximum 3 in a day)',
    description: 'Relieves inflammatory pain, swelling, muscle pain, dental pain, and joint aches.',
    bilingualLabel: 'आइबुप्रोफेन (दर्द और सूजन की दवा)'
  }
];

const DEFAULT_DOCTORS = [
  {
    id: 'doc1',
    name: 'Dr. Rajesh Sharma (डॉ. राजेश शर्मा)',
    specialization: 'General Physician / सामान्य रोग विशेषज्ञ',
    languages: ['Hindi', 'English', 'Punjabi'],
    fee: 150,
    available: true
  },
  {
    id: 'doc2',
    name: 'Dr. Sunitha Reddy (डॉ. सुनीता रेड्डी)',
    specialization: 'Pediatrician / शिशु एवं बाल रोग विशेषज्ञ',
    languages: ['Telugu', 'English', 'Hindi'],
    fee: 200,
    available: true
  },
  {
    id: 'doc3',
    name: 'Dr. Anjali Menon (डॉ. अंजली मेनन)',
    specialization: 'Gynecologist / महिला एवं प्रसूति रोग विशेषज्ञ',
    languages: ['Malayalam', 'Tamil', 'English'],
    fee: 250,
    available: true
  },
  {
    id: 'doc4',
    name: 'Dr. G. K. Gowda (डॉ. जी. के. गौड़ा)',
    specialization: 'Cardiologist / हृदय रोग विशेषज्ञ',
    languages: ['Kannada', 'Telugu', 'English'],
    fee: 300,
    available: true
  },
  {
    id: 'doc5',
    name: 'Dr. Amit Patel (डॉ. अमित पटेल)',
    specialization: 'Skin Specialist / त्वचा रोग विशेषज्ञ',
    languages: ['Hindi', 'Gujarati', 'English'],
    fee: 200,
    available: false
  }
];

const generateId = () => Math.random().toString(36).substring(2, 15);

// Helper to simulate a response object
const createMockResponse = (data: any, status = 200): Response => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
};

const simulateApi = (url: string, init?: RequestInit): Response => {
  const method = init?.method || 'GET';
  const body = init?.body ? JSON.parse(init.body as string) : null;

  // 1. AUTH ROUTES
  if (url.includes('/api/auth/login')) {
    const { phone, name } = body || {};
    const users = JSON.parse(localStorage.getItem('offline_users') || '[]');
    let user = users.find((u: any) => u.phone === phone);
    if (!user) {
      user = {
        id: generateId(),
        name,
        phone,
        language: 'en',
        subscription: 'none',
        createdAt: new Date().toISOString()
      };
      users.push(user);
      localStorage.setItem('offline_users', JSON.stringify(users));
    }
    return createMockResponse({ success: true, user });
  }

  if (url.includes('/api/auth/me/')) {
    const id = url.split('/api/auth/me/')[1];
    const users = JSON.parse(localStorage.getItem('offline_users') || '[]');
    const user = users.find((u: any) => u.id === id);
    if (!user) {
      return createMockResponse({ error: 'User not found' }, 404);
    }
    return createMockResponse(user);
  }

  if (url.includes('/api/auth/update-lang')) {
    const { userId, language } = body || {};
    const users = JSON.parse(localStorage.getItem('offline_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].language = language;
      localStorage.setItem('offline_users', JSON.stringify(users));
      return createMockResponse({ success: true, user: users[userIndex] });
    }
    return createMockResponse({ error: 'User not found' }, 404);
  }

  if (url.includes('/api/auth/subscribe')) {
    const { userId, subscription } = body || {};
    const users = JSON.parse(localStorage.getItem('offline_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].subscription = subscription;
      localStorage.setItem('offline_users', JSON.stringify(users));
      return createMockResponse({ success: true, user: users[userIndex] });
    }
    return createMockResponse({ error: 'User not found' }, 404);
  }

  // 2. MEDICINES
  if (url.includes('/api/medicines/search-image')) {
    // Pick 1 or 2 random medicines
    const shuffled = [...DEFAULT_MEDICINES].sort(() => 0.5 - Math.random());
    const matched = shuffled.slice(0, Math.floor(Math.random() * 2) + 1);
    return createMockResponse({
      success: true,
      matches: matched,
      confidence: Math.floor(Math.random() * 20) + 75
    });
  }

  if (url.includes('/api/medicines')) {
    return createMockResponse(DEFAULT_MEDICINES);
  }

  // 3. DOCTORS
  if (url.includes('/api/doctors')) {
    return createMockResponse(DEFAULT_DOCTORS);
  }

  // 4. CONSULTATIONS
  if (url.includes('/api/consultations/book')) {
    const { userId, patientName, doctorName, doctorSpecialization, type, amount } = body || {};
    const consultations = JSON.parse(localStorage.getItem('offline_consultations') || '[]');
    const newConsult = {
      id: generateId(),
      userId,
      patientName,
      doctorName,
      doctorSpecialization,
      type,
      date: new Date().toISOString(),
      amount,
      paymentStatus: 'completed'
    };
    consultations.push(newConsult);
    localStorage.setItem('offline_consultations', JSON.stringify(consultations));
    return createMockResponse({ success: true, consultation: newConsult });
  }

  if (url.includes('/api/consultations/complete')) {
    const { consultationId } = body || {};
    const consultations = JSON.parse(localStorage.getItem('offline_consultations') || '[]');
    const consultIndex = consultations.findIndex((c: any) => c.id === consultationId);
    if (consultIndex !== -1) {
      const mockAdviceList = [
        'Take bed rest for 2 days. Drink plenty of warm water. Avoid cold drinks.',
        'Keep monitoring your body temperature. Eat light foods like porridge or khichdi.',
        'Rest your eyes. Take tablets exactly after meals. Avoid spicy food.',
        'Regular morning walks and reducing salt intake will help. Sleep for 8 hours.'
      ];
      const mockMeds = [
        { name: 'Paracetamol (Crocin 650mg)', dosage: '1 tablet after meals (twice a day)', duration: '3 Days' },
        { name: 'Cetirizine (Alerid 10mg)', dosage: '1 tablet before sleeping', duration: '5 Days' },
        { name: 'ORS Powder', dosage: '1 packet in 1L water, drink slowly', duration: '2 Days' },
        { name: 'Multivitamin (Zincovit)', dosage: '1 tablet after lunch', duration: '15 Days' }
      ];
      const prescriptionMeds = mockMeds.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1);
      const advice = mockAdviceList[Math.floor(Math.random() * mockAdviceList.length)];

      consultations[consultIndex].prescription = {
        medicines: prescriptionMeds,
        advice
      };
      localStorage.setItem('offline_consultations', JSON.stringify(consultations));
      return createMockResponse({ success: true, consultation: consultations[consultIndex] });
    }
    return createMockResponse({ error: 'Consultation not found' }, 404);
  }

  if (url.match(/\/api\/consultations\/[a-zA-Z0-9]+/)) {
    const userId = url.split('/api/consultations/')[1];
    const consultations = JSON.parse(localStorage.getItem('offline_consultations') || '[]');
    const filtered = consultations.filter((c: any) => c.userId === userId);
    return createMockResponse(filtered);
  }

  // 5. ORDERS
  if (url.includes('/api/orders/checkout')) {
    const { userId, items, total, paymentMethod, shippingAddress } = body || {};
    const orders = JSON.parse(localStorage.getItem('offline_orders') || '[]');
    const newOrder = {
      id: generateId(),
      userId,
      items,
      total,
      paymentMethod,
      paymentStatus: 'completed',
      shippingAddress,
      createdAt: new Date().toISOString()
    };
    orders.push(newOrder);
    localStorage.setItem('offline_orders', JSON.stringify(orders));
    return createMockResponse({ success: true, order: newOrder });
  }

  if (url.match(/\/api\/orders\/[a-zA-Z0-9]+/)) {
    const userId = url.split('/api/orders/')[1];
    const orders = JSON.parse(localStorage.getItem('offline_orders') || '[]');
    const filtered = orders.filter((o: any) => o.userId === userId);
    return createMockResponse(filtered);
  }

  // 6. FAMILY MEMBERS
  if (url.includes('/api/family/add')) {
    const { userId, name, relation, age, gender, medicalHistory } = body || {};
    const family = JSON.parse(localStorage.getItem('offline_family') || '[]');
    const newMember = {
      id: generateId(),
      userId,
      name,
      relation,
      age: Number(age),
      gender,
      medicalHistory
    };
    family.push(newMember);
    localStorage.setItem('offline_family', JSON.stringify(family));
    return createMockResponse({ success: true, member: newMember });
  }

  if (method === 'DELETE' && url.match(/\/api\/family\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+/)) {
    const parts = url.split('/api/family/')[1].split('/');
    const userId = parts[0];
    const memberId = parts[1];
    const family = JSON.parse(localStorage.getItem('offline_family') || '[]');
    const filtered = family.filter((f: any) => !(f.userId === userId && f.id === memberId));
    localStorage.setItem('offline_family', JSON.stringify(filtered));
    return createMockResponse({ success: true });
  }

  if (url.match(/\/api\/family\/[a-zA-Z0-9]+/)) {
    const userId = url.split('/api/family/')[1];
    const family = JSON.parse(localStorage.getItem('offline_family') || '[]');
    const filtered = family.filter((f: any) => f.userId === userId);
    return createMockResponse(filtered);
  }

  // 404 default
  return createMockResponse({ error: 'Route not found' }, 404);
};

export const apiFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : (input as any).url || input.toString();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const isRelativeApiCall = typeof input === 'string' && input.startsWith('/api');

  if (isRelativeApiCall && import.meta.env.PROD && !apiBaseUrl) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(simulateApi(url, init));
      }, 400);
    });
  }

  const requestInput = isRelativeApiCall && apiBaseUrl
    ? `${apiBaseUrl.replace(/\/$/, '')}${input}`
    : input;

  // Try actual network fetch first
  try {
    const response = await fetch(requestInput, init);
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      if (response.ok || !isRelativeApiCall) {
        return response;
      }
    }
  } catch (err) {
    // Network is offline or proxy target not reachable
  }

  // Local storage simulation fallback
  return new Promise((resolve) => {
    // Add small simulated latency to make UI spinners feel premium
    setTimeout(() => {
      resolve(simulateApi(url, init));
    }, 400);
  });
};
