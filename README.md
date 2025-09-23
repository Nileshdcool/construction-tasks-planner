# Construction Planner

A professional offline-first construction task management web application that allows users to create, manage, and track construction tasks on interactive floor plans.

## 🏗️ Project Overview

Construction Planner is a comprehensive React-based application designed for construction professionals to efficiently manage construction projects. The application features an offline-first architecture using RxDB for data persistence, enabling seamless work even without internet connectivity.

### Key Features (MVP)

- **📋 Essential Task Management**: Create, update, and track construction tasks with basic statuses
- **🏠 Basic Floor Plans**: Upload floor plan images and click to add tasks at specific locations
- **✅ Simple Checklists**: Basic checklist functionality for task completion tracking
- **📊 Basic Dashboard**: Simple task counts and completion statistics
- **👤 Simple Authentication**: Username-based login system
- **💾 Offline-First Storage**: Local data persistence using browser storage
- **📱 Responsive Layout**: Basic mobile-friendly design

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- Modern web browser with IndexedDB support

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd construction-planner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## 🏃‍♂️ Usage Instructions

### 1. User Authentication
- Enter any username to log in (no password required)
- The system creates a new user if the username doesn't exist
- Admin users (username: "admin") have access to development tools

### 2. Dashboard Overview
- View project statistics and analytics
- See task distribution by status
- Monitor checklist completion progress
- Quick access to main application features

### 3. Task Management
- **Create Tasks**: Use the Task Board or Floor Plan view to create new tasks
- **Task Statuses**: `not-started`, `in-progress`, `blocked`, `final-check`, `done`
- **Task Details**: Each task includes title, description, status, and creation/update timestamps

### 4. Checklist System
- Every task automatically gets default checklist items:
  - "Review project requirements and specifications"
  - "Gather necessary materials and tools"
  - "Set up workspace and safety measures"
- Add custom checklist items with different statuses
- Track completion progress with visual indicators
- Celebration animation when all items are completed

### 5. Floor Plan Integration
- Upload floor plan images through the Plans page
- Position tasks directly on floor plans by clicking
- Visual task markers with status-based color coding
- Interactive tooltips showing task details

### 6. Navigation
- **Dashboard**: Overview and analytics
- **Floor Plan**: Interactive floor plan with task positioning
- **Plans**: Manage uploaded floor plans
- **Tasks**: Kanban-style task board view

## 🛠️ Technology Stack

### Frontend Framework
- **React 19.1.1**: Modern React with latest features
- **TypeScript 4.9.5**: Type-safe development
- **React Router 7.9.1**: Client-side routing

### State Management
- **Zustand 5.0.8**: Lightweight state management
- **Persistent storage**: Browser-based state persistence

### Database & Offline Storage
- **RxDB 16.19.0**: Reactive offline-first database
- **IndexedDB**: Browser-based persistent storage
- **Dexie 4.2.0**: IndexedDB wrapper for enhanced functionality

### Styling & UI
- **Tailwind CSS 3.4.0**: Utility-first CSS framework
- **PostCSS**: CSS processing
- **Custom component library**: Reusable UI components

### Additional Libraries
- **React Hot Toast 2.6.0**: Toast notifications
- **Canvas Confetti 1.9.3**: Celebration animations
- **RxJS 7.8.2**: Reactive programming support

### Development Tools
- **React Scripts 5.0.1**: Build tooling and development server
- **Jest**: Testing framework
- **React Testing Library**: Component testing utilities

## ⏱️ Development Time Estimates (Streamlined MVP)

Based on essential features only, here are the estimated development times for a minimal viable product:

### Core Infrastructure (4-5 hours)
- **Basic Database Setup** (2 hours): Simple RxDB configuration with essential schemas (users, tasks)
- **Simple Authentication** (1 hour): Username-only login with basic state management
- **Basic Routing** (1-2 hours): Simple React Router setup with minimal protection

### Essential Task Management (6-8 hours)
- **Core Task CRUD** (3 hours): Basic create, read, update, delete functionality
- **Simple Status Management** (1 hour): Basic status workflow (not-started, in-progress, done)
- **Basic Task List View** (2-3 hours): Simple list interface without complex features
- **Quick Task Form** (1-2 hours): Minimal task creation/editing

### Basic Checklist (3-4 hours)
- **Simple Checklist Model** (1 hour): Basic checklist schema and operations
- **Basic Checklist UI** (2-3 hours): Simple checkbox interface with basic completion tracking

### Simplified Floor Plan (4-5 hours)
- **Basic Image Display** (1-2 hours): Simple image upload and display
- **Click-to-Add Tasks** (2-3 hours): Basic click positioning without complex markers
- **Simple Task Markers** (1 hour): Basic visual indicators on floor plan

### Minimal Dashboard (2-3 hours)
- **Basic Layout** (1 hour): Simple navigation and layout structure
- **Essential Stats** (1-2 hours): Basic task count and completion percentage

### Basic Styling & Polish (2-3 hours)
- **Essential Styling** (1-2 hours): Basic responsive layout with minimal custom styling
- **Basic Error Handling** (1 hour): Simple error messages and loading states

### **Total Estimated Development Time: 21-28 hours**

*Note: This streamlined approach focuses on core functionality only. Advanced features like detailed analytics, complex UI animations, comprehensive testing, and performance optimizations are excluded to meet the 20-25 hour target.*

## 🔧 Areas for Improvement & Future Enhancements

*Note: The following features were excluded from the MVP to meet the 20-25 hour development target but could be added in future iterations:*

### 1. Enhanced Features (Future Phases)
- **Advanced Analytics**: Detailed progress tracking, charts, and reporting
- **Complex Status Workflow**: Multiple status types and transitions
- **Advanced Checklists**: Status-specific checklist items and progress indicators
- **Visual Feedback**: Celebration animations and enhanced notifications
- **Drag & Drop**: Task reordering and status changes via drag-and-drop

### 2. Performance & UX Improvements
- **Advanced UI Components**: Custom modals, tooltips, and interactive elements
- **Memoization**: React.memo, useMemo, and useCallback optimizations
- **Image Optimization**: Compression and lazy loading for floor plans
- **Keyboard Shortcuts**: Navigation and accessibility improvements

### 3. Technical Enhancements
- **Comprehensive Testing**: Unit, integration, and E2E test coverage
- **Error Boundaries**: Advanced error handling and recovery
- **Data Migration**: Proper database schema versioning
- **Security**: Real authentication with tokens and role-based access

### 4. Advanced User Experience
- **Mobile App**: React Native version for native mobile experience
- **Team Collaboration**: Multi-user support and real-time sync
- **File Attachments**: Document and image attachments to tasks
- **Time Tracking**: Task duration and time management features
- **Notifications**: Task reminders and deadline alerts

### 5. Architecture Improvements
- **Component Library**: Reusable component system with Storybook
- **Service Layer**: Dedicated API layer and business logic separation
- **State Normalization**: Optimized state structure for better performance
- **Code Splitting**: Lazy loading and bundle optimization

## 📝 Scripts

- `npm start`: Start development server
- `npm run build`: Create production build
- `npm test`: Run test suite
- `npm run eject`: Eject from Create React App (not recommended)

## 📂 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── checklist/      # Checklist-specific components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Navigation.tsx  # App navigation
│   └── ...            # Other components
├── db/                 # Database layer
│   ├── schemas/       # RxDB schemas
│   ├── database.ts    # Database configuration
│   └── devUtils.ts    # Development utilities
├── pages/             # Page components
├── store/             # Zustand stores
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── App.tsx           # Main application component
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.construction-tasks-planner
offline-first Web-App where users can create “construction tasks” on a floor-plan
