
![NetZero Banner](https://img.shields.io/badge/NetZero-Smart_Bill_Splitting-0052CC?style=for-the-badge)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

NetZero is a full-stack smart bill splitting and travel itinerary planner application. It combines complex graph-based debt minimization algorithms with an elegant, MakeMyTrip-inspired mobile UI to make managing group expenses and travel routes seamless and hassle-free.

## ✨ Key Features

- **🧠 Graph-Based Debt Minimization**: Automatically simplifies group debts using a directed graph algorithm to minimize the total number of transactions needed to settle up.
- **🗺️ TSP Route Optimizer**: Plan your itineraries like a pro. Uses a Haversine-based Traveling Salesperson Problem (TSP) algorithm to find the most efficient travel routes.
- **📍 Dual-Mode Location Picker**: An intuitive, Uber-style visual map interface combined with autocomplete search for seamless location selection.
- **💳 Expense Tracking & Budgets**: Easily log expenses, manage user groups, split costs, and track personal/group budgets with rich analytics.
- **🔐 Secure Authentication**: Robust JWT-based authentication powered by Spring Security.
- **📱 Premium Mobile Experience**: Built with React Native and Expo, featuring a beautiful deep-blue and coral design language, dynamic animations, and responsive interactive maps.

## 🛠️ Tech Stack

**Backend (REST API):**
- Java 17
- Spring Boot 3.2.5
- Spring Security + JWT (JSON Web Tokens)
- Spring Data MongoDB
- Lombok

**Frontend (Mobile App):**
- React Native (v0.81.5)
- Expo (v54)
- React Navigation
- React Native Maps
- Axios

## 📂 Repository Structure

```
netzero/
├── netzero-mobile/      # React Native front-end application
│   ├── src/             # Frontend source code (Components, Screens, Navigators)
│   ├── package.json     # Node dependencies & Expo config
│   └── App.js           # Expo entry point
├── src/                 # Spring Boot backend source code
│   └── main/java/...    # Controllers, Services, Models, DSA algorithms (DebtGraph)
├── pom.xml              # Maven dependencies for Backend
└── HELP.md              # Spring Boot predefined help document
```

## 🚀 Getting Started

### Prerequisites

- **Java 17** installed and configured.
- **Maven** (or use the provided `mvnw` wrapper).
- **Node.js** (v18+) and **npm** or **yarn**.
- **MongoDB** running locally or via a cloud cluster (e.g., MongoDB Atlas).
- **Expo CLI** installed globally.

### Setting up the Backend (Spring Boot)

1. Navigate to the root directory `netzero/`.
2. Ensure your `application.properties` or `application.yml` (inside `src/main/resources`) is pointing to your active MongoDB instance.
3. Build and run the project using the Maven wrapper:
   ```bash
   ./mvnw clean install
   ./mvnw spring-boot:run
   ```
   The backend API will typically start on `http://localhost:8080`.

### Setting up the Frontend (React Native Mobile App)

1. Open a new terminal and navigate to the mobile app directory:
   ```bash
   cd netzero-mobile
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start
   ```
4. Scan the QR code with the Expo Go app on your physical device, or run it on an Android/iOS emulator by pressing `a` or `i` in the terminal.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---
*Developed with focus on beautiful UI, performance, and robust DSA implementations.*
