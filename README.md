# Equipment Qualification Module

A React-based Equipment Qualification application for injection molding process validation. This module provides tools for Injection Speed Linearity testing, Shot Repeatability studies, and Load Sensitivity tests.

## 📋 Prerequisites

### Node.js Version
- **Required**: Node.js v18.x or v20.x (LTS recommended)
- **npm**: v9.x or higher

> ⚠️ **Important**: This project uses React 18 and requires a compatible Node.js version.

### Verify Installation
```bash
node --version   # Should show v18.x.x or v20.x.x
npm --version    # Should show v9.x.x or higher
```

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "Equipment Qualification"
```

### 2. Install Dependencies
```bash
npm install
```

> **Note**: The installation may take a few minutes due to Syncfusion and Stimulsoft packages.

### 3. Start the Development Server
```bash
npm start
```

The application will open automatically at `http://localhost:3000`

### 4. Build for Production
```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

---

## 📁 Project Structure

```
Equipment Qualification/
├── public/                          # Static public assets
│   ├── index.html                   # HTML template
│   └── templates/                   # Report templates
│       └── ViscosityPrint.mrt       # Stimulsoft report template
│
├── src/                             # Source code
│   ├── index.js                     # Application entry point
│   ├── index.scss                   # Global SCSS styles
│   ├── store.js                     # Redux store configuration
│   │
│   ├── actions/                     # Redux actions
│   │   ├── header.js                # Header title actions
│   │   └── types.js                 # Action type constants
│   │
│   ├── reducers/                    # Redux reducers
│   │   ├── index.js                 # Root reducer (combines all reducers)
│   │   └── header.js                # Header state reducer
│   │
│   ├── components/                  # React components
│   │   ├── app.jsx                  # Main App component (layout wrapper)
│   │   ├── App.css                  # Main application styles
│   │   │
│   │   ├── common/                  # Shared/common components
│   │   │   ├── header-component/
│   │   │   │   └── header.js        # Top navigation header
│   │   │   ├── sidebar-component/
│   │   │   │   ├── sidebar.js       # Left sidebar navigation
│   │   │   │   └── menu.js          # Sidebar menu configuration
│   │   │   ├── loader.js            # Loading spinner component
│   │   │   ├── breadcrumb.js        # Breadcrumb navigation
│   │   │   └── footer.js            # Footer component
│   │   │
│   │   └── EquipmentQualification/  # Main module components
│   │       ├── EquipmentDashboard.js    # Main dashboard with tabs
│   │       ├── Grid.css                  # Grid styling
│   │       │
│   │       ├── Inj_Speed_Linearity/     # Injection Speed Linearity study
│   │       │   ├── InjSpeed.js          # Main component
│   │       │   ├── InjSpeedGrid.js      # Data grid component
│   │       │   ├── InjGrid.js           # Grid utilities
│   │       │   └── AddRow.js            # Add row functionality
│   │       │
│   │       ├── Shot_Repeatability_Study/ # Shot Repeatability study
│   │       │   ├── ShotRepeatability.js  # Main component
│   │       │   ├── ShotRepGrid.js        # Data grid component
│   │       │   ├── ShotGrid.js           # Grid utilities
│   │       │   ├── ShotCalcGrid.js       # Calculation grid
│   │       │   ├── AddRow.js             # Add row functionality
│   │       │   └── EditColumnHeader.js   # Column header editor
│   │       │
│   │       ├── Load_Sensitivity_Test/    # Load Sensitivity test
│   │       │   ├── LoadSensitivity.js    # Main component
│   │       │   ├── LoadSensitivityGrid.js # Data grid component
│   │       │   ├── LoadGrid.js           # Grid utilities
│   │       │   └── AddRow.js             # Add row functionality
│   │       │
│   │       └── Report/                   # Report generation
│   │           ├── EquipQualReport.js    # Main report component
│   │           ├── InjSpeedReport.js     # Injection speed report
│   │           ├── ShotRepeatReport.js   # Shot repeatability report
│   │           └── LoadSensitivityReport.js # Load sensitivity report
│   │
│   ├── assets/                      # Static assets
│   │   ├── custom-stylesheet/       # CSS stylesheets
│   │   │   ├── header_style.css     # Main layout styles (includes Bootstrap)
│   │   │   ├── sixstep_style.css    # Tab and study styles
│   │   │   └── *.css                # Other component styles
│   │   ├── fonts/                   # Font files (FontAwesome, Feather, etc.)
│   │   ├── Icons/                   # Application icons (PNG)
│   │   └── images/                  # Application images
│   │
│   └── services/                    # API services (placeholder)
│
├── package.json                     # Project dependencies and scripts
├── package-lock.json                # Dependency lock file
└── README.md                        # This file
```

---

## 🔧 Key Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI Framework |
| Redux | 4.1.2 | State Management |
| React Router | 5.3.4 | Routing |
| Syncfusion EJ2 | 24.2.8 | UI Components (Tabs, Grids, Charts) |
| Stimulsoft Reports | 2025.4.2 | PDF Report Generation |
| Plotly.js | 3.0.1 | Interactive Charts |
| D3.js | 7.8.2 | Data Visualization |
| Bootstrap (via Reactstrap) | 8.4.1 | UI Components |
| Sass | 1.85.1 | CSS Preprocessing |

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Runs the app in development mode on `http://localhost:3000` |
| `npm run build` | Builds the app for production to the `build` folder |
| `npm test` | Launches the test runner |
| `npm run eject` | Ejects from Create React App (⚠️ irreversible) |

---

## 🎯 Features

### Equipment Qualification Dashboard
The main dashboard provides three study types via tabs:

1. **Injection Speed Linearity**
   - Tests machine's ability to achieve set injection speeds
   - Displays actual vs expected fill times
   - Calculates percentage differences and linearity range

2. **Shot Repeatability Study**
   - Measures consistency of shot weights
   - Statistical analysis (average, range, percentage variation)
   - Visual charts for data analysis

3. **Load Sensitivity Test**
   - Tests machine response to load variations
   - Data grid for input/output measurements
   - Graphical representation of results

### Report Generation
- Print functionality for all studies
- PDF report generation using Stimulsoft Reports
- Selectable report sections

---

## ⚙️ Configuration

### Syncfusion License
The Syncfusion license key is registered in `src/index.js`. For production use, replace with your own license key:

```javascript
registerLicense("YOUR_SYNCFUSION_LICENSE_KEY");
```

### Stimulsoft License
The Stimulsoft license key is also configured in `src/index.js`:

```javascript
Stimulsoft.Base.StiLicense.key = "YOUR_STIMULSOFT_LICENSE_KEY";
```

---

## 🐛 Troubleshooting

### Common Issues

1. **Node version mismatch**
   ```bash
   # Use nvm to switch Node versions
   nvm install 18
   nvm use 18
   ```

2. **Dependencies not installing**
   ```bash
   # Clear npm cache and reinstall
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Port 3000 already in use**
   ```bash
   # On Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # Or start on different port
   set PORT=3001 && npm start
   ```

4. **Syncfusion styles not loading**
   - Ensure `App.css` is imported in `app.jsx`
   - Check that node_modules contains `@syncfusion` packages

---

## 📝 Development Notes

- The application uses Redux for state management (header title)
- Syncfusion EJ2 components are used for tabs, grids, and charts
- Data is stored in sessionStorage during development (no backend required)
- The sidebar currently shows only the Equipment Qualification module

---

## 📄 License

Private - All rights reserved.

