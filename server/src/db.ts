import mongoose, { Schema, model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { User, Medicine, Order, Consultation, FamilyMember, Doctor, PrescribedMedicine } from './types';

// ==========================================
// 1. MONGOOSE SCHEMA & MODEL DEFINITIONS
// ==========================================

const UserSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  language: { type: String, default: 'en' },
  subscription: { type: String, enum: ['none', 'basic', 'family', 'village'], default: 'none' },
  createdAt: { type: Date, default: Date.now }
});
const MongoUser = model('User', UserSchema);

const MedicineSchema = new Schema({
  name: { type: String, required: true },
  genericName: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  dosage: { type: String, required: true },
  description: { type: String, required: true },
  bilingualLabel: { type: String, required: true }
});
const MongoMedicine = model('Medicine', MedicineSchema);

const OrderSchema = new Schema({
  userId: { type: String, required: true },
  items: [{
    medicineId: { type: String, required: true },
    name: { type: String, required: true },
    genericName: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['UPI', 'Card', 'Wallet', 'COD'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    village: { type: String, required: true },
    panchayat: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  status: { type: String, enum: ['ordered', 'dispatched', 'out_for_delivery', 'delivered'], default: 'ordered' },
  date: { type: Date, default: Date.now }
});
const MongoOrder = model('Order', OrderSchema);

const ConsultationSchema = new Schema({
  userId: { type: String, required: true },
  patientName: { type: String, required: true },
  doctorName: { type: String, required: true },
  doctorSpecialization: { type: String, required: true },
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ['video', 'audio', 'chat'], required: true },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  paymentStatus: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  amount: { type: Number, required: true },
  prescription: {
    medicines: [{
      name: { type: String, required: true },
      dosage: { type: String, required: true },
      duration: { type: String, required: true }
    }],
    advice: { type: String, default: '' }
  }
});
const MongoConsultation = model('Consultation', ConsultationSchema);

const FamilyMemberSchema = new Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  relation: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  medicalHistory: { type: String, default: '' }
});
const MongoFamilyMember = model('FamilyMember', FamilyMemberSchema);


// ==========================================
// 2. DATABASE MODE SETUP (MONGO VS JSON FALLBACK)
// ==========================================

let isMongoConnected = false;

const JSON_DB_DIR = path.join(__dirname, '..', 'data');
const JSON_DB_PATH = path.join(JSON_DB_DIR, 'db-fallback.json');

// Initialize JSON database if it doesn't exist
function initJsonDb() {
  if (!fs.existsSync(JSON_DB_DIR)) {
    fs.mkdirSync(JSON_DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(JSON_DB_PATH)) {
    const defaultData = {
      users: [],
      medicines: [],
      orders: [],
      consultations: [],
      familyMembers: []
    };
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(defaultData, null, 2));
  }
}

// JSON DB Helper functions
function readJsonDb(): any {
  initJsonDb();
  const data = fs.readFileSync(JSON_DB_PATH, 'utf-8');
  return JSON.parse(data);
}

function writeJsonDb(data: any) {
  initJsonDb();
  fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2));
}

// Generate unique ID for JSON fallback entities
function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

// Connect to MongoDB with timeout
export async function connectDb(mongoUri: string | undefined) {
  if (!mongoUri) {
    console.warn('⚠️ No MONGO_URI specified. Falling back to local JSON database.');
    isMongoConnected = false;
    initJsonDb();
    return;
  }

  try {
    console.log(`🔌 Attempting to connect to MongoDB at ${mongoUri}...`);
    // Connect with a 5 second server selection timeout
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB successfully.');
  } catch (error: any) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    console.warn('⚠️ Falling back to local JSON database.');
    isMongoConnected = false;
    initJsonDb();
  }
}


// ==========================================
// 3. SERVICE WRAPPERS DEFINITION
// ==========================================

export const UserService = {
  async findByPhone(phone: string): Promise<User | null> {
    if (isMongoConnected) {
      const u = await MongoUser.findOne({ phone });
      if (!u) return null;
      return {
        id: u._id.toString(),
        name: u.name,
        phone: u.phone,
        language: u.language,
        subscription: u.subscription as any,
        createdAt: u.createdAt.toISOString()
      };
    } else {
      const db = readJsonDb();
      const user = db.users.find((u: any) => u.phone === phone);
      return user || null;
    }
  },

  async findById(id: string): Promise<User | null> {
    if (isMongoConnected) {
      try {
        const u = await MongoUser.findById(id);
        if (!u) return null;
        return {
          id: u._id.toString(),
          name: u.name,
          phone: u.phone,
          language: u.language,
          subscription: u.subscription as any,
          createdAt: u.createdAt.toISOString()
        };
      } catch {
        return null;
      }
    } else {
      const db = readJsonDb();
      const user = db.users.find((u: any) => u.id === id);
      return user || null;
    }
  },

  async create(name: string, phone: string, language: string = 'en'): Promise<User> {
    if (isMongoConnected) {
      const u = await MongoUser.create({ name, phone, language, subscription: 'none' });
      return {
        id: u._id.toString(),
        name: u.name,
        phone: u.phone,
        language: u.language,
        subscription: u.subscription as any,
        createdAt: u.createdAt.toISOString()
      };
    } else {
      const db = readJsonDb();
      // Check if user already exists
      const existing = db.users.find((u: any) => u.phone === phone);
      if (existing) return existing;

      const newUser: User = {
        id: generateId(),
        name,
        phone,
        language,
        subscription: 'none',
        createdAt: new Date().toISOString()
      };
      db.users.push(newUser);
      writeJsonDb(db);
      return newUser;
    }
  },

  async updateSubscription(userId: string, subscription: 'none' | 'basic' | 'family' | 'village'): Promise<User | null> {
    if (isMongoConnected) {
      const u = await MongoUser.findByIdAndUpdate(userId, { subscription }, { new: true });
      if (!u) return null;
      return {
        id: u._id.toString(),
        name: u.name,
        phone: u.phone,
        language: u.language,
        subscription: u.subscription as any,
        createdAt: u.createdAt.toISOString()
      };
    } else {
      const db = readJsonDb();
      const idx = db.users.findIndex((u: any) => u.id === userId);
      if (idx === -1) return null;
      db.users[idx].subscription = subscription;
      writeJsonDb(db);
      return db.users[idx];
    }
  },

  async updateLanguage(userId: string, language: string): Promise<User | null> {
    if (isMongoConnected) {
      const u = await MongoUser.findByIdAndUpdate(userId, { language }, { new: true });
      if (!u) return null;
      return {
        id: u._id.toString(),
        name: u.name,
        phone: u.phone,
        language: u.language,
        subscription: u.subscription as any,
        createdAt: u.createdAt.toISOString()
      };
    } else {
      const db = readJsonDb();
      const idx = db.users.findIndex((u: any) => u.id === userId);
      if (idx === -1) return null;
      db.users[idx].language = language;
      writeJsonDb(db);
      return db.users[idx];
    }
  }
};

export const MedicineService = {
  async getAll(): Promise<Medicine[]> {
    if (isMongoConnected) {
      const meds = await MongoMedicine.find({});
      return meds.map(m => ({
        id: m._id.toString(),
        name: m.name,
        genericName: m.genericName,
        category: m.category,
        price: m.price,
        stock: m.stock,
        dosage: m.dosage,
        description: m.description,
        bilingualLabel: m.bilingualLabel
      }));
    } else {
      const db = readJsonDb();
      return db.medicines;
    }
  },

  async seed(defaultMedicines: Omit<Medicine, 'id'>[]): Promise<number> {
    if (isMongoConnected) {
      const count = await MongoMedicine.countDocuments({});
      if (count === 0) {
        await MongoMedicine.insertMany(defaultMedicines);
        return defaultMedicines.length;
      }
      return 0;
    } else {
      const db = readJsonDb();
      if (db.medicines.length === 0) {
        db.medicines = defaultMedicines.map(m => ({
          ...m,
          id: generateId()
        }));
        writeJsonDb(db);
        return defaultMedicines.length;
      }
      return 0;
    }
  }
};

export const OrderService = {
  async getByUserId(userId: string): Promise<Order[]> {
    if (isMongoConnected) {
      const orders = await MongoOrder.find({ userId }).sort({ date: -1 });
      return orders.map(o => ({
        id: o._id.toString(),
        userId: o.userId,
        items: o.items.map((i: any) => ({
          medicineId: i.medicineId,
          name: i.name,
          genericName: i.genericName,
          quantity: i.quantity,
          price: i.price
        })),
        total: o.total,
        paymentMethod: o.paymentMethod as any,
        paymentStatus: o.paymentStatus as any,
        shippingAddress: o.shippingAddress as any,
        status: o.status as any,
        date: o.date.toISOString()
      }));
    } else {
      const db = readJsonDb();
      return db.orders
        .filter((o: any) => o.userId === userId)
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  },

  async create(orderData: Omit<Order, 'id' | 'date' | 'status' | 'paymentStatus'>): Promise<Order> {
    if (isMongoConnected) {
      const o = await MongoOrder.create({
        ...orderData,
        status: 'ordered',
        paymentStatus: orderData.paymentMethod === 'COD' ? 'pending' : 'completed'
      });
      return {
        id: o._id.toString(),
        userId: o.userId,
        items: o.items.map((i: any) => ({
          medicineId: i.medicineId,
          name: i.name,
          genericName: i.genericName,
          quantity: i.quantity,
          price: i.price
        })),
        total: o.total,
        paymentMethod: o.paymentMethod as any,
        paymentStatus: o.paymentStatus as any,
        shippingAddress: o.shippingAddress as any,
        status: o.status as any,
        date: o.date.toISOString()
      };
    } else {
      const db = readJsonDb();
      const newOrder: Order = {
        ...orderData,
        id: generateId(),
        status: 'ordered',
        paymentStatus: orderData.paymentMethod === 'COD' ? 'pending' : 'completed',
        date: new Date().toISOString()
      };
      db.orders.push(newOrder);
      // Reduce medicine stocks
      newOrder.items.forEach(item => {
        const medIdx = db.medicines.findIndex((m: any) => m.id === item.medicineId || m.name === item.name);
        if (medIdx !== -1) {
          db.medicines[medIdx].stock = Math.max(0, db.medicines[medIdx].stock - item.quantity);
        }
      });
      writeJsonDb(db);
      return newOrder;
    }
  }
};

export const ConsultationService = {
  async getByUserId(userId: string): Promise<Consultation[]> {
    if (isMongoConnected) {
      const consults = await MongoConsultation.find({ userId }).sort({ date: -1 });
      return consults.map(c => ({
        id: c._id.toString(),
        userId: c.userId,
        patientName: c.patientName,
        doctorName: c.doctorName,
        doctorSpecialization: c.doctorSpecialization,
        date: c.date.toISOString(),
        type: c.type as any,
        status: c.status as any,
        paymentStatus: c.paymentStatus as any,
        amount: c.amount,
        prescription: c.prescription ? {
          medicines: c.prescription.medicines.map((m: any) => ({
            name: m.name,
            dosage: m.dosage,
            duration: m.duration
          })),
          advice: c.prescription.advice
        } : undefined
      }));
    } else {
      const db = readJsonDb();
      return db.consultations
        .filter((c: any) => c.userId === userId)
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  },

  async create(consultationData: Omit<Consultation, 'id' | 'date' | 'status' | 'prescription'>): Promise<Consultation> {
    if (isMongoConnected) {
      const c = await MongoConsultation.create({
        ...consultationData,
        status: 'scheduled'
      });
      return {
        id: c._id.toString(),
        userId: c.userId,
        patientName: c.patientName,
        doctorName: c.doctorName,
        doctorSpecialization: c.doctorSpecialization,
        date: c.date.toISOString(),
        type: c.type as any,
        status: c.status as any,
        paymentStatus: c.paymentStatus as any,
        amount: c.amount
      };
    } else {
      const db = readJsonDb();
      const newConsult: Consultation = {
        ...consultationData,
        id: generateId(),
        status: 'scheduled',
        date: new Date().toISOString()
      };
      db.consultations.push(newConsult);
      writeJsonDb(db);
      return newConsult;
    }
  },

  async updatePrescription(id: string, prescription: { medicines: PrescribedMedicine[], advice: string }): Promise<Consultation | null> {
    if (isMongoConnected) {
      try {
        const c = await MongoConsultation.findByIdAndUpdate(id, {
          prescription,
          status: 'completed'
        }, { new: true });
        if (!c) return null;
        return {
          id: c._id.toString(),
          userId: c.userId,
          patientName: c.patientName,
          doctorName: c.doctorName,
          doctorSpecialization: c.doctorSpecialization,
          date: c.date.toISOString(),
          type: c.type as any,
          status: c.status as any,
          paymentStatus: c.paymentStatus as any,
          amount: c.amount,
          prescription: c.prescription ? {
            medicines: c.prescription.medicines.map((m: any) => ({
              name: m.name,
              dosage: m.dosage,
              duration: m.duration
            })),
            advice: c.prescription.advice
          } : undefined
        };
      } catch {
        return null;
      }
    } else {
      const db = readJsonDb();
      const idx = db.consultations.findIndex((c: any) => c.id === id);
      if (idx === -1) return null;
      db.consultations[idx].prescription = prescription;
      db.consultations[idx].status = 'completed';
      writeJsonDb(db);
      return db.consultations[idx];
    }
  }
};

export const FamilyService = {
  async getByUserId(userId: string): Promise<FamilyMember[]> {
    if (isMongoConnected) {
      const members = await MongoFamilyMember.find({ userId });
      return members.map(m => ({
        id: m._id.toString(),
        userId: m.userId,
        name: m.name,
        relation: m.relation,
        age: m.age,
        gender: m.gender,
        medicalHistory: m.medicalHistory
      }));
    } else {
      const db = readJsonDb();
      return db.familyMembers.filter((m: any) => m.userId === userId);
    }
  },

  async create(userId: string, memberData: Omit<FamilyMember, 'id' | 'userId'>): Promise<FamilyMember> {
    if (isMongoConnected) {
      const m = await MongoFamilyMember.create({
        userId,
        ...memberData
      });
      return {
        id: m._id.toString(),
        userId: m.userId,
        name: m.name,
        relation: m.relation,
        age: m.age,
        gender: m.gender,
        medicalHistory: m.medicalHistory
      };
    } else {
      const db = readJsonDb();
      const newMember: FamilyMember = {
        id: generateId(),
        userId,
        ...memberData
      };
      db.familyMembers.push(newMember);
      writeJsonDb(db);
      return newMember;
    }
  },

  async delete(userId: string, id: string): Promise<boolean> {
    if (isMongoConnected) {
      try {
        const res = await MongoFamilyMember.deleteOne({ _id: id, userId });
        return res.deletedCount > 0;
      } catch {
        return false;
      }
    } else {
      const db = readJsonDb();
      const filterLen = db.familyMembers.length;
      db.familyMembers = db.familyMembers.filter((m: any) => !(m.id === id && m.userId === userId));
      writeJsonDb(db);
      return db.familyMembers.length < filterLen;
    }
  }
};
