export interface User {
  id: string;
  name: string;
  phone: string;
  language: string;
  subscription: 'none' | 'basic' | 'family' | 'village';
  createdAt: string;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  price: number;
  stock: number;
  dosage: string;
  description: string;
  bilingualLabel: string; // Hindi / Local language translation
}

export interface OrderItem {
  medicineId: string;
  name: string;
  genericName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  paymentMethod: 'UPI' | 'Card' | 'Wallet' | 'COD';
  paymentStatus: 'pending' | 'completed' | 'failed';
  shippingAddress: {
    fullName: string;
    phone: string;
    village: string;
    panchayat: string;
    district: string;
    state: string;
    pincode: string;
  };
  status: 'ordered' | 'dispatched' | 'out_for_delivery' | 'delivered';
  date: string;
}

export interface PrescribedMedicine {
  name: string;
  dosage: string;
  duration: string;
}

export interface Consultation {
  id: string;
  userId: string;
  patientName: string; // User or family member name
  doctorName: string;
  doctorSpecialization: string;
  date: string;
  type: 'video' | 'audio' | 'chat';
  status: 'scheduled' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'completed';
  amount: number;
  prescription?: {
    medicines: PrescribedMedicine[];
    advice: string;
  };
}

export interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  relation: string;
  age: number;
  gender: string;
  medicalHistory: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  languages: string[];
  fee: number;
  available: boolean;
}
