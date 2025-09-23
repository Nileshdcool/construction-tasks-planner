# Construction Planner

A professional offline-first construction task management web application that allows users to create, manage, and track construction tasks on interactive floor plans.

## 🏗️ Project Overview

Construction Planner is a comprehensive React-based application designed for construction professionals to efficiently manage construction projects. The application features an offline-first architecture using RxDB for data persistence, enabling seamless work even without internet connectivity.

### Key Features

- **📋 Task Management**: Create, update, and track construction tasks with customizable statuses
- **🏠 Interactive Floor Plans**: Upload floor plan images and position tasks directly on plans
- **✅ Detailed Checklists**: Each task includes a comprehensive checklist with status tracking
- **📊 Dashboard Analytics**: Real-time project insights and progress tracking
- **👤 User Authentication**: Simple username-based authentication system
- **💾 Offline-First Architecture**: Works seamlessly without internet connectivity
- **🎉 Visual Feedback**: Celebration animations when tasks are completed
- **📱 Responsive Design**: Works on desktop and mobile devices

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

## ⏱️ Development Time Estimates

Based on the complexity and features implemented, here are the estimated development times for each major component:

### Core Infrastructure (8-10 hours)
- **Database Setup & Schemas** (3 hours): RxDB configuration, schema design for users, tasks, floor plans, and checklist items
- **Authentication System** (2 hours): Simple username-based auth with Zustand persistence
- **Routing & Navigation** (2 hours): React Router setup with protected routes
- **Project Setup & Configuration** (1-2 hours): TypeScript, Tailwind, build configuration

### Task Management System (12-15 hours)
- **Task CRUD Operations** (4 hours): Create, read, update, delete tasks with database integration
- **Task Status Management** (2 hours): Status workflow and validation
- **Task Board View** (4 hours): Kanban-style interface with drag-and-drop consideration
- **Task Details Modal** (3-4 hours): Comprehensive task editing interface

### Checklist System (8-10 hours)
- **Checklist Data Model** (2 hours): Schema design and database operations
- **Checklist Components** (4 hours): Interactive checklist items with status management
- **Default Checklist Logic** (1 hour): Auto-generation of default items for new tasks
- **Progress Tracking** (2-3 hours): Visual progress indicators and analytics

### Floor Plan Integration (10-12 hours)
- **Floor Plan Upload** (3 hours): Image upload and storage system
- **Interactive Floor Plan Component** (5-6 hours): Click-to-place tasks, marker system, tooltips
- **Floor Plan Management** (2-3 hours): CRUD operations for floor plans

### Dashboard & Analytics (6-8 hours)
- **Dashboard Layout** (2 hours): Main dashboard structure and navigation
- **Analytics Calculations** (3-4 hours): Task statistics, completion rates, progress tracking
- **Data Visualization** (2 hours): Progress bars, status distribution, charts

### UI/UX Polish (8-10 hours)
- **Responsive Design** (3-4 hours): Mobile-friendly layouts and responsive components
- **Visual Feedback** (2 hours): Loading states, error handling, success animations
- **Component Styling** (3-4 hours): Consistent design system and polish

### Testing & Bug Fixes (6-8 hours)
- **Unit Testing** (3-4 hours): Component and utility function tests
- **Integration Testing** (2-3 hours): End-to-end workflow testing
- **Bug Fixes & Optimization** (2-3 hours): Performance improvements and issue resolution

### **Total Estimated Development Time: 58-73 hours**

## 🔧 Areas for Improvement & Refactoring

Due to time constraints, there are several areas that would benefit from improvement:

### 1. Code Architecture & Organization
- **Component Extraction**: Some components (especially modals) are quite large and could be broken into smaller, more focused components
- **Custom Hooks**: Extract common logic into reusable custom hooks (e.g., task operations, checklist management)
- **Service Layer**: Create dedicated service classes for database operations instead of mixing them in stores
- **Type Definitions**: Consolidate and improve TypeScript interfaces across the application

### 2. State Management Improvements
- **Normalized State**: Implement normalized state structure to avoid data duplication
- **Optimistic Updates**: Add optimistic UI updates for better user experience
- **Error Handling**: Implement comprehensive error boundaries and retry mechanisms
- **Loading States**: More granular loading states for different operations

### 3. Performance Optimizations
- **Memoization**: Add React.memo, useMemo, and useCallback where appropriate
- **Virtual Scrolling**: For large lists of tasks or checklist items
- **Image Optimization**: Implement image compression and lazy loading for floor plans
- **Bundle Splitting**: Code splitting for better initial load performance

### 4. User Experience Enhancements
- **Drag & Drop**: Implement drag-and-drop for task reordering and status changes
- **Keyboard Shortcuts**: Add keyboard navigation and shortcuts
- **Undo/Redo**: Implement undo/redo functionality for critical operations
- **Better Mobile Experience**: Optimize touch interactions and mobile layouts

### 5. Data & Persistence
- **Data Migration**: Implement proper database migration system for schema changes
- **Backup/Export**: Add data export and import functionality
- **Conflict Resolution**: Better handling of concurrent edits and data conflicts
- **Data Validation**: More robust client-side validation

### 6. Security & Authentication
- **Real Authentication**: Implement proper authentication with tokens/sessions
- **Role-Based Access**: Add different user roles and permissions
- **Data Encryption**: Encrypt sensitive data in local storage
- **Input Sanitization**: Improve input validation and sanitization

### 7. Testing & Quality Assurance
- **E2E Testing**: Implement Cypress or Playwright for end-to-end testing
- **Visual Regression Testing**: Add screenshot testing for UI consistency
- **Performance Testing**: Add performance benchmarks and monitoring
- **Accessibility Testing**: Ensure WCAG compliance and screen reader support

### 8. Developer Experience
- **Error Logging**: Implement proper error tracking and logging
- **Development Tools**: Better debugging tools and development utilities
- **Documentation**: Add comprehensive API documentation and component stories
- **CI/CD**: Implement automated testing and deployment pipelines

### 9. Feature Enhancements
- **Task Dependencies**: Add task dependency management
- **Time Tracking**: Implement time tracking for tasks
- **File Attachments**: Allow file attachments to tasks
- **Team Collaboration**: Add multi-user collaboration features
- **Notifications**: Implement task reminders and notifications
- **Advanced Analytics**: More detailed reporting and analytics

### 10. Technical Debt
- **Legacy Browser Support**: Remove or improve compatibility code
- **Unused Dependencies**: Audit and remove unused packages
- **Code Consistency**: Standardize coding patterns and conventions
- **Performance Profiling**: Regular performance audits and optimizations

## 🎯 Next Steps for Production

1. **Security Audit**: Implement proper authentication and authorization
2. **Performance Testing**: Load testing and optimization
3. **Accessibility Compliance**: Ensure WCAG 2.1 AA compliance
4. **Cross-browser Testing**: Comprehensive browser compatibility testing
5. **Mobile App**: Consider React Native version for mobile platforms
6. **Cloud Sync**: Add optional cloud synchronization for data backup
7. **Team Features**: Multi-user support and real-time collaboration

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
