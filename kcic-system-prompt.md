# KCIC Ticketing System - AI Agent Development Prompt

## Project Overview
You are tasked with building a **KCIC Ticketing System** - a comprehensive support ticket management platform with incident tracking, knowledge base, and analytics capabilities.

## Tech Stack Requirements
- **Frontend**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **State Management**: React Context/Zustand (your choice)
- **UI Components**: shadcn/ui or build custom components
- **Rich Text Editor**: TipTap or similar
- **Charts**: Recharts or Chart.js

---

## Development Phases

### **Phase 1: Project Foundation & Authentication**
**Objective**: Set up the project infrastructure and implement secure authentication with role-based access control.

**Tasks**:
1. configure Supabase client
2. Set up Supabase authentication with email/password
3. Create database schema for users with role field (Admin, Manager, Worker, Employee)
4. Implement Row Level Security (RLS) policies based on user roles
5. Build authentication pages (login, register, forgot password)
6. Create protected route middleware/wrapper component
7. Implement session persistence and role-based route guards
8. Set up basic layout structure with navigation

**Deliverables**: Working authentication system with role-based access control

---

### **Phase 2: Core Ticket Management System**
**Objective**: Build the primary ticketing functionality with CRUD operations and views.

**Tasks**:
1. Design and create tickets table schema with appropriate fields (title, description, status, priority, assignee, timestamps, etc.)
2. Build ticket list page with grid and kanban/card views
3. Implement ticket creation form with validation
4. Create ticket detail modal/page with full information display
5. Add status workflow transitions (New → In Progress → Resolved → Closed)
6. Implement priority levels (Low, Medium, High, Critical) with visual indicators
7. Build filtering system (status, priority, assignee, date range)
8. Add pagination or infinite scroll for ticket list
9. Implement ticket assignment functionality for managers

**Deliverables**: Fully functional ticket management system with multiple views

---

### **Phase 3: Dashboard & Real-time Features**
**Objective**: Create an informative dashboard and enable real-time updates.

**Tasks**:
1. Build dashboard page with summary statistics cards
2. Implement analytics queries (total tickets, open, resolved, critical counts)
3. Create interactive charts for ticket metrics (status distribution, priority breakdown, 7-day trend)
4. Set up Supabase Realtime subscriptions for live ticket updates
5. Add notification system for ticket changes
6. Implement quick action shortcuts on dashboard
7. Create responsive layout for dashboard widgets

**Deliverables**: Interactive dashboard with real-time data synchronization

---

### **Phase 4: Incident Management Module**
**Objective**: Implement specialized incident tracking with severity classification and resolution timeline.

**Tasks**:
1. Create incidents table schema with severity levels and RCA fields
2. Build incident list page with filtering capabilities
3. Implement incident creation form with severity classification
4. Create detailed incident view page with timeline component
5. Add root cause analysis (RCA) documentation section
6. Implement incident resolution workflow and status tracking
7. Link related tickets to incidents (relationship table if needed)
8. Add incident history/audit trail

**Deliverables**: Complete incident management system separate from regular tickets

---

### **Phase 5: Knowledge Base System**
**Objective**: Build a self-service documentation platform with rich content editing.

**Tasks**:
1. Design knowledge base articles table with categories
2. Integrate rich text editor (TipTap) for article creation
3. Build article list page with search functionality
4. Implement full-text search across article content
5. Create article viewer with clean reading layout
6. Add category/tag management system
7. Implement article versioning or edit history (optional)
8. Build article management interface (create, edit, delete) with proper permissions

**Deliverables**: Functional knowledge base with search and content management

---

### **Phase 6: Worker Management & Team Tools**
**Objective**: Provide manager tools for overseeing support agents and workload distribution.

**Tasks**:
1. Create worker/agent directory page
2. Implement availability status tracking (Online, Busy, Offline)
3. Build workload monitoring dashboard showing assigned ticket counts
4. Add contact information display (email, phone with click-to-action)
5. Implement agent profile pages with performance metrics
6. Create bulk assignment tools for managers
7. Add agent filtering and search capabilities

**Deliverables**: Worker management interface for team oversight

---

### **Phase 7: SLA Management & Automation**
**Objective**: Configure service level agreements and automate deadline tracking.

**Tasks**:
1. Create SLA policies table with priority-based timeframes
2. Build SLA configuration interface for admins
3. Implement automatic due date calculation on ticket creation
4. Add visual SLA breach indicators (warnings, overdue markers)
5. Create SLA compliance reports
6. Implement automated reminders/notifications for approaching deadlines
7. Add SLA metrics to dashboard and reports

**Deliverables**: Automated SLA tracking and compliance monitoring

---

### **Phase 8: Reporting & Analytics**
**Objective**: Provide comprehensive insights into support performance and trends.

**Tasks**:
1. Build analytics dashboard page
2. Implement KPI calculations (average response time, resolution time, first contact resolution)
3. Create ticket volume trend charts (daily, weekly, monthly views)
4. Add incident severity distribution visualizations
5. Build agent performance reports
6. Implement custom date range selectors
7. Add export functionality (CSV/PDF reports)
8. Create comparative analytics (period-over-period comparisons)

**Deliverables**: Complete analytics and reporting module

---

### **Phase 9: Advanced Features & Optimization**
**Objective**: Polish the application and add enhancement features.

**Tasks**:
1. Implement bulk operations (bulk assign, bulk status change, bulk delete)
2. Add file attachment support for tickets and incidents
3. Implement comment/activity feed on tickets
4. Add email notifications for critical events
5. Create user preference settings (theme, notifications, display options)
6. Optimize database queries and add proper indexes
7. Implement caching strategies for dashboard data
8. Add keyboard shortcuts for power users
9. Implement audit logging for sensitive operations

**Deliverables**: Production-ready application with advanced features

---

### **Phase 10: Testing, Documentation & Deployment**
**Objective**: Ensure quality, document the system, and prepare for production deployment.

**Tasks**:
1. Write unit tests for critical business logic
2. Implement integration tests for key user flows
3. Perform security audit (SQL injection prevention, XSS protection, CSRF tokens)
4. Create user documentation and help guides
5. Write API documentation for any custom endpoints
6. Set up environment variables and configuration management
7. Configure production Supabase project with proper security rules
8. Perform performance testing and optimization
9. Set up monitoring and error tracking (Sentry or similar)
10. Deploy to Vercel or chosen hosting platform

**Deliverables**: Tested, documented, and deployed production application

---

## Important Guidelines

### Database Design Principles
- Use meaningful table names that reflect business entities
- Implement proper foreign key relationships
- Create appropriate indexes for frequently queried fields
- Use Supabase RLS policies to enforce authorization at database level
- Design for scalability (consider partitioning for large tables)

### Code Quality Standards
- Follow TypeScript strict mode
- Implement proper error handling and user feedback
- Use server components where appropriate for better performance
- Create reusable components and custom hooks
- Maintain consistent naming conventions
- Write self-documenting code with clear variable/function names

### Security Considerations
- Never expose Supabase anon key in client-side code for sensitive operations
- Validate all user inputs on both client and server
- Implement rate limiting for API endpoints
- Use prepared statements/parameterized queries (Supabase handles this)
- Sanitize rich text content to prevent XSS attacks

### UI/UX Best Practices
- Ensure responsive design for mobile, tablet, and desktop
- Provide loading states for all async operations
- Implement optimistic updates where appropriate
- Show clear error messages and recovery options
- Use consistent color coding (e.g., red for critical, yellow for warnings)
- Implement keyboard navigation for accessibility

---

## Success Criteria
- All user roles can perform their designated functions
- Real-time updates work reliably across connected clients
- Dashboard loads within 2 seconds with cached data
- Ticket creation and updates are intuitive and fast
- Knowledge base search returns relevant results quickly
- SLA tracking accurately calculates and displays deadlines
- Application is accessible (WCAG 2.1 AA compliance)
- No critical security vulnerabilities

---

## Notes for AI Agent
- **Autonomy**: Make architectural decisions for implementation details (exact field names, endpoint structures, component organization)
- **Creativity**: Feel free to suggest improvements or additional features that enhance user experience
- **Pragmatism**: Balance between perfect architecture and shipping working features
- **Communication**: Explain key design decisions when implementing complex features
- **Iteration**: Build incrementally and test each phase before moving to the next

**Start with Phase 1 and proceed sequentially. Good luck!** 🚀