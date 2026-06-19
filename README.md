# RuralCare — Telemedicine & Medicine Delivery Platform for Rural India

RuralCare is a multilingual telemedicine and medicine delivery platform designed to improve healthcare accessibility in rural India. The platform provides virtual consultations, medicine ordering, multilingual support, OCR-based medicine scanning, and family healthcare management through a modern responsive interface.

---

## 🌐 Live Demo
[Click Here to View Project](https://ruralcare-demo-testing-2026.surge.sh/)

---

## 🔗 GitHub Repository
https://github.com/kteja6411-a11y/RuralCare-Telemedicine

---

## 🚀 Features

### 🩺 Telemedicine Consultation
- Search doctors by specialty and language
- Virtual consultation support
- Symptom-based consultation interface
- Downloadable digital prescriptions

### 💊 Medicine Delivery System
- Generic medicine recommendations
- Medicine ordering and cart management
- Affordable healthcare-focused medicine suggestions

### 🌍 Multilingual Support
Supports:
- English
- Hindi
- Telugu
- Tamil
- Malayalam
- Kannada

### 📸 OCR Medicine Scanner
- Scan or upload medicine labels
- OCR-based medicine identification
- Translation assistance support

### 👨‍👩‍👧 Family Health Management
- Manage dependent profiles
- Store medical history
- Single-account family healthcare access

### 💳 Payment & Checkout
- Simulated UPI payment integration
- QR code-based checkout
- Cash on Delivery support

### 🚴 Delivery Partner Portal
- Rider onboarding system
- Delivery management support

---

## 🛠️ Technologies Used

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide Icons

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- JSON Fallback Database

---

## 📂 Project Structure

```bash
RuralCare-Telemedicine/
├── client/
├── server/
├── README.md
└── package.json
```

---

## ⚙️ Installation & Setup

### Clone Repository

```bash
git clone https://github.com/kteja6411-a11y/RuralCare-Telemedicine.git
```

### Install Dependencies

```bash
npm run install-all
```

### Run Backend Server

```bash
npm run dev:server
```

### Run Frontend Client

```bash
npm run dev:client
```

Frontend:
```bash
http://localhost:5173
```

Backend:
```bash
http://localhost:5000
```

---

## 🗄️ Database Configuration

Create a `.env` file inside the `server` folder:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ruralcare
```

If MongoDB is unavailable, the application automatically switches to a local JSON fallback database.

---

## 🚀 Future Improvements
- Real-time video consultation
- AI-based symptom analysis
- Online pharmacy integration
- Appointment scheduling system
- Healthcare analytics dashboard

---

## 👨‍💻 Developed Using
- Antigravity 2.0
- GitHub
- Vercel
- React Ecosystem
