import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDb, UserService, MedicineService, OrderService, ConsultationService, FamilyService } from './db';
import { Doctor, Medicine } from './types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ruralcare';

app.use(cors());
app.use(express.json());

// ==========================================
// 1. MOCK SEED DATA DEFINITIONS
// ==========================================

const DEFAULT_MEDICINES: Omit<Medicine, 'id'>[] = [
  {
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

const DOCTORS: Doctor[] = [
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


// ==========================================
// 2. CONTROLLERS & API ROUTES
// ==========================================

// --- AUTHENTICATION GATE & LOGIN ---
app.post('/api/auth/login', async (req, res) => {
  const { phone, name } = req.body;
  if (!phone || !name) {
    return res.status(400).json({ error: 'Phone number and Name are required / फोन नंबर और नाम आवश्यक हैं' });
  }

  try {
    let user = await UserService.findByPhone(phone);
    if (!user) {
      user = await UserService.create(name, phone);
    }
    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/me/:id', async (req, res) => {
  try {
    const user = await UserService.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/update-lang', async (req, res) => {
  const { userId, language } = req.body;
  try {
    const user = await UserService.updateLanguage(userId, language);
    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/subscribe', async (req, res) => {
  const { userId, subscription } = req.body;
  try {
    const user = await UserService.updateSubscription(userId, subscription);
    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- MEDICINES SEARCH & LISTING ---
app.get('/api/medicines', async (req, res) => {
  try {
    const meds = await MedicineService.getAll();
    res.json(meds);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Photo search simulation (Mock OCR)
app.post('/api/medicines/search-image', async (req, res) => {
  // Simulates OCR processing of image and returns 1-3 matching medicines
  try {
    const meds = await MedicineService.getAll();
    // Return a random selection of 1 to 2 medicines to simulate scanner findings
    const shuffled = [...meds].sort(() => 0.5 - Math.random());
    const matched = shuffled.slice(0, Math.floor(Math.random() * 2) + 1);
    
    // Simulate delay
    setTimeout(() => {
      res.json({
        success: true,
        matches: matched,
        confidence: Math.floor(Math.random() * 20) + 75 // 75% to 95%
      });
    }, 1500);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- DOCTOR BOOKING & CONSULTATION ---
app.get('/api/doctors', (req, res) => {
  res.json(DOCTORS);
});

app.get('/api/consultations/:userId', async (req, res) => {
  try {
    const consults = await ConsultationService.getByUserId(req.params.userId);
    res.json(consults);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/consultations/book', async (req, res) => {
  const { userId, patientName, doctorName, doctorSpecialization, type, amount } = req.body;
  try {
    const newConsult = await ConsultationService.create({
      userId,
      patientName,
      doctorName,
      doctorSpecialization,
      type,
      paymentStatus: 'completed', // Payment made in simulated modal prior to call
      amount
    });
    res.json({ success: true, consultation: newConsult });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Call finished - generate doctor prescription
app.post('/api/consultations/complete', async (req, res) => {
  const { consultationId } = req.body;
  
  // Create a randomized prescription for demonstration
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

  // Pick random subset of medicines (1 to 2) and advice
  const prescriptionMeds = mockMeds.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1);
  const advice = mockAdviceList[Math.floor(Math.random() * mockAdviceList.length)];

  try {
    const updated = await ConsultationService.updatePrescription(consultationId, {
      medicines: prescriptionMeds,
      advice
    });
    res.json({ success: true, consultation: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- ORDERS & CHECKOUT ---
app.get('/api/orders/:userId', async (req, res) => {
  try {
    const orders = await OrderService.getByUserId(req.params.userId);
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders/checkout', async (req, res) => {
  const { userId, items, total, paymentMethod, shippingAddress } = req.body;
  try {
    const newOrder = await OrderService.create({
      userId,
      items,
      total,
      paymentMethod,
      shippingAddress
    });
    res.json({ success: true, order: newOrder });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- FAMILY ACCOUNTS ---
app.get('/api/family/:userId', async (req, res) => {
  try {
    const members = await FamilyService.getByUserId(req.params.userId);
    res.json(members);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/family/add', async (req, res) => {
  const { userId, name, relation, age, gender, medicalHistory } = req.body;
  try {
    const member = await FamilyService.create(userId, { name, relation, age: Number(age), gender, medicalHistory });
    res.json({ success: true, member });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/family/:userId/:memberId', async (req, res) => {
  const { userId, memberId } = req.params;
  try {
    const success = await FamilyService.delete(userId, memberId);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ==========================================
// 3. SERVER STARTUP & DATABASE CONNECT
// ==========================================

const startServer = async () => {
  // Connect to DB
  await connectDb(MONGO_URI);

  // Seed default medicines
  try {
    const seededCount = await MedicineService.seed(DEFAULT_MEDICINES);
    if (seededCount > 0) {
      console.log(`🌱 Seeded ${seededCount} medicines into database.`);
    }
  } catch (seedErr: any) {
    console.error('⚠️ Seeding error:', seedErr.message);
  }

  // Start HTTP listener
  app.listen(PORT, () => {
    console.log(`🚀 RuralCare Server running at http://localhost:${PORT}`);
  });
};

startServer().catch(err => {
  console.error('💥 Fatal server startup crash:', err);
});
