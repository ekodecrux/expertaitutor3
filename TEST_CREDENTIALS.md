# ACES-AIProfessor - Test Credentials

This document contains test user credentials for all user roles in the ACES-AIProfessor platform.

---

## Admin Users

### Super Admin
- **Email**: `admin@acesaiprofessor.com`
- **Password**: `demo123`
- **Role**: Admin
- **Access**: Full platform access, content management, user management, analytics

### Institution Admin
- **Email**: `institutionadmin@acesaiprofessor.com`
- **Password**: `demo123`
- **Role**: Institution Admin
- **Access**: Branch management, teacher/student management, reports

---

## Teacher Users

### Teacher 1 (Mathematics)
- **Email**: `teacher1@acesaiprofessor.com`
- **Password**: `demo123`
- **Role**: Teacher
- **Subject**: Mathematics
- **Access**: Class management, assignment creation, student progress tracking

### Teacher 2 (Science)
- **Email**: `teacher2@acesaiprofessor.com`
- **Password**: `demo123`
- **Role**: Teacher
- **Subject**: Science
- **Access**: Class management, assignment creation, student progress tracking

---

## Student Users

### Student 1 (Grade 10, CBSE)
- **Email**: `student1@acesaiprofessor.com`
- **Password**: `demo123`
- **Role**: Student
- **Grade**: 10
- **Curriculum**: CBSE
- **Target Exam**: JEE
- **Access**: AI Tutor, content library, assessments, study plans

### Student 2 (Grade 12, CBSE)
- **Email**: `student2@acesaiprofessor.com`
- **Password**: `demo123`
- **Role**: Student
- **Grade**: 12
- **Curriculum**: CBSE
- **Target Exam**: NEET
- **Access**: AI Tutor, content library, assessments, study plans

### Student 3 (International - SAT)
- **Email**: `student3@acesaiprofessor.com`
- **Password**: `demo123`
- **Role**: Student
- **Grade**: 11
- **Curriculum**: International
- **Target Exam**: SAT
- **Access**: AI Tutor, content library, assessments, study plans

### Student 4 (Graduate - GMAT)
- **Email**: `student4@acesaiprofessor.com`
- **Password**: `demo123`
- **Role**: Student
- **Level**: Graduate
- **Target Exam**: GMAT
- **Access**: AI Tutor, content library, assessments, study plans

### Student 5 (Graduate - GRE)
- **Email**: `student5@acesaiprofessor.com`
- **Password**: `demo123`
- **Role**: Student
- **Level**: Graduate
- **Target Exam**: GRE
- **Access**: AI Tutor, content library, assessments, study plans

---

## Parent Users

### Parent 1
- **Email**: `parent1@acesaiprofessor.com`
- **Password**: `demo123`
- **Role**: Parent
- **Children**: Student 1
- **Access**: Child progress monitoring, payment management, communication with teachers

### Parent 2
- **Email**: `parent2@acesaiprofessor.com`
- **Password**: `demo123`
- **Role**: Parent
- **Children**: Student 2
- **Access**: Child progress monitoring, payment management, communication with teachers

---

## Testing Checklist

### Admin Testing
- [ ] Login with admin credentials
- [ ] Access admin dashboard
- [ ] Navigate to Content Sources Management
- [ ] Run content scrapers
- [ ] Review content approval queue
- [ ] Approve/reject content items
- [ ] Manage users (create, edit, delete)
- [ ] Manage classes and sections
- [ ] View analytics and reports
- [ ] Test bulk CSV import

### Teacher Testing
- [ ] Login with teacher credentials
- [ ] Access teacher dashboard
- [ ] View assigned classes
- [ ] Create assignments
- [ ] Grade student work
- [ ] View student progress
- [ ] Send messages to students/parents
- [ ] Generate reports

### Student Testing
- [ ] Login with student credentials
- [ ] Access student dashboard
- [ ] Browse content library
- [ ] Add items to favorites
- [ ] View recommendations
- [ ] Start AI tutor session
- [ ] Take assessments
- [ ] View study plan
- [ ] Track progress
- [ ] Test subscription management
- [ ] View payment history

### Parent Testing
- [ ] Login with parent credentials
- [ ] Access parent dashboard
- [ ] View child's progress
- [ ] Communicate with teachers
- [ ] Manage subscription/payments
- [ ] View payment history
- [ ] Receive notifications

### General Testing
- [ ] Test forgot password flow
- [ ] Test OTP login
- [ ] Test email/password registration
- [ ] Test logout functionality
- [ ] Test navigation across all pages
- [ ] Test responsive design (mobile/tablet/desktop)
- [ ] Test all buttons and links
- [ ] Verify no broken links
- [ ] Check for console errors
- [ ] Test Stripe payment flow
- [ ] Verify webhook handling

---

## Notes

- All test users have the same password: `demo123`
- Email domains use `@acesaiprofessor.com` for consistency
- Users are pre-seeded in the database via `seed-users.mjs`
- For production, change all passwords immediately
- Delete or disable test accounts before going live

---

## Quick Login URLs

- **Platform**: https://yourdomain.com
- **Login Page**: https://yourdomain.com/login
- **Admin Dashboard**: https://yourdomain.com/admin (requires admin role)
- **Student Dashboard**: https://yourdomain.com/dashboard (requires student role)

---

## Support

For issues with test credentials or access:
- Check database connection
- Verify users exist: `SELECT * FROM users WHERE email LIKE '%acesaiprofessor.com'`
- Re-run seed script: `node seed-users.mjs`
- Check application logs for authentication errors
