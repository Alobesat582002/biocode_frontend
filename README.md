<div align="center">
  <br />
    <img src="https://img.icons8.com/color/124/stethoscope.png" alt="BioCode Logo" width="80" />
  <br />

  # 🩺 BioCode - Smart Medical Network

  **The Future of AI-Driven Healthcare & Patient Booking.**  
  *An intelligent, seamless, and fully responsive platform bridging the gap between doctors and patients.*

  ---

  [![React](https://img.shields.io/badge/React-18.x-blue.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-5.x-purple.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC.svg?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![i18next](https://img.shields.io/badge/L10n-i18next-orange.svg?style=for-the-badge)](https://www.i18next.com/)

</div>

<br />

## ✨ About BioCode
BioCode is a premium, modern medical platform featuring a patient-first architecture. By utilizing AI algorithms (KNN distance matching & Gemini medical analysis), BioCode seamlessly connects patients with the most appropriate nearby doctors based on their health symptoms. 

Designed with a stunning **Dark/Light** mode UI, comprehensive **English/Arabic localization**, and blazing-fast React routing.

## 🚀 Key Features

### 🧑‍⚕️ For Doctors
- **Advanced Dashboard:** Real-time statistics, incoming appointments, and modern metric cards.
- **Dynamic Profiles:** Customize clinic layouts, upload certificates via Cloudinary, and present services via neat UI tags.
- **Community:** Post interactive updates for patients, connect, and receive seamless real-time likes/comments.

### 🤒 For Patients
- **AI Triage & Recommendations:** Type symptoms, and BioCode's AI engine instantly figures out the required specialty and lists the best doctors based on the **K-Nearest Neighbors (KNN)** distance formula!
- **Intelligent Booking System:** Filter doctors, view comprehensive profiles (services, description, fees, distance).
- **Dynamic Review System:** Leave reviews for visited doctors, which intelligently aggregates and displays average ratings directly on doctor cards!
- **Health Records:** Keep track of personal AI analyzes, appointments, and chronic diseases.

### 🎨 Premium UI/UX
- **Smooth Dark Mode Engine:** Fully fluid light and dark modes stored continuously via Context APIs.
- **Bi-Directional i18n (RTL/LTR):** First-class Arabic (Right-to-Left) and English (Left-to-Right) formatting out of the box with zero layout breaks.
- **Responsive Mastery:** Crafted intricately with Tailwind CSS to ensure the app works flawlessly as an iOS/Android PWA or standard desktop experience.

<br />

## 🛠️ Tech Stack & Architecture

- **Core Framework:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (Atomic Utility-First CSS)
- **Routing:** `react-router-dom` v6
- **Global State:** React Context API (AuthContext, ThemeContext)
- **Localization:** `react-i18next` with modular JSON language packs.
- **Iconography:** `lucide-react`
- **HTTP Client:** `axios` (With Request Interceptor logic)

<br />

## ⚙️ Installation & Usage

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/biocode_frontend.git
cd biocode_frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:8000
```

### 4. Run the Dev Server
```bash
npm run dev
```

Your app will be automatically running at `http://localhost:5173`. 🌟

<br />

## 🤝 Contribution
Contributions, issues, and feature requests are always welcome! Feel free to check the issues page.

---
<div align="center">
  <sub>Built with ❤️ by Hussein & Team</sub>
</div>
