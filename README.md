2210990289 - Divanshu Garg
2210992057 - Prajwal
Project Title - NesusHR
Type - Copyright
Current Status - Waiting 
# 🏢 Employee Management System (Backend)

A backend service for managing **users, roles, departments, employees, positions, and timesheets** in an organization.  
Built with **Node.js, Express.js, Prisma ORM, and PostgreSQL**.

---

## 🚀 Features

- 🔐 **Authentication & Authorization** (JWT + Role-based access)
- 👥 **User & Role Management** (Super Admin, Sub Admin, Employee)
- 🏬 **Department & Position Management**
- 👨‍💼 **Employee Profiles** (with reporting managers, skip-level managers, etc.)
- ⏱️ **Timesheet & Attendance Tracking** (weekly + daily with approval workflow)
- 📊 **Soft-delete & activation toggles** for entities

---

## 🛠️ Tech Stack

- **Runtime:** Node.js + Express.js  
- **ORM:** [Prisma](https://www.prisma.io/)  
- **Database:** PostgreSQL  
- **Auth:** JWT-based authentication  
- **Middleware:** Custom role-based authorization  

---

## 📂 Project Structure

```bash
.
├── prisma/
│ └── schema.prisma # Database schema
├── src/
│ ├── controllers/ # Business logic (userController, employeeController, etc.)
│ ├── middlewares/ # Auth & Role middlewares
│ ├── routes/ # Express routes (user, role, department, etc.)
│ ├── services/ # Service layer for DB interactions
│ └── index.js # App entrypoint
├── .env # Environment variables (DATABASE_URL, JWT_SECRET, etc.)
├── package.json
└── README.md
```
---

## 🗄️ Database Schema (Prisma)

- **User** ↔ **Roles** via `UserRole` (many-to-many)  
- **Departments** ↔ **Employees** (with head of department, created/updated by users)  
- **Positions** belong to Departments  
- **Employees** can have managers, skip-level managers  
- **Weekly Timesheets** with daily entries, approval workflow  

👉 Check [`prisma/schema.prisma`](./prisma/schema.prisma) for the full model definitions.

---

## ⚙️ Setup & Installation

### 1. Clone Repository
git clone https://github.com/your-username/employee-management-backend.git
cd employee-management-backend

### 2. Install Dependencies
npm install

### 3. Configure Environment
Create a `.env` file in the root directory:

DATABASE_URL="postgresql://user:password@localhost:5432/ems"
JWT_SECRET="your_secret_key"
PORT=5000

### 4. Setup Database
npx prisma migrate dev --name init
npx prisma generate

### 5. Run Server
npm run dev

---

## 📌 API Endpoints

### 🔑 Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/users/` | Create new user (SuperAdmin only) |
| GET    | `/users/` | Get all users |
| GET    | `/users/:id` | Get user by ID |
| PUT    | `/users/:id` | Update user password |
| DELETE | `/users/deactivate/:id` | Deactivate user |
| PUT    | `/users/activate/:id` | Reactivate user |

---

### 👥 Roles
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/roles/` | Create role |
| GET    | `/roles/` | Get all roles |
| GET    | `/roles/:id` | Get role by ID |
| PUT    | `/roles/:id` | Update role |
| DELETE | `/roles/:id` | Delete role |

---

### 🏬 Departments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/departments/` | Create department |
| GET    | `/departments/` | Get all departments |
| GET    | `/departments/code/:code` | Get department by code |
| GET    | `/departments/:id` | Get department by ID |
| PUT    | `/departments/:id` | Update department |
| DELETE | `/departments/:id` | Delete department |
| PUT    | `/departments/activate/:id` | Activate department |

---

### 👨‍💼 Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/employees/` | Create employee |
| GET    | `/employees/` | Get all employees |
| GET    | `/employees/code/:code` | Get employee by code |
| GET    | `/employees/email` | Get employee by email |
| GET    | `/employees/dptid/:dptid` | Get employees by department |
| PUT    | `/employees/:code` | Update employee |

---

### 📌 Positions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/positions/` | Create position |
| GET    | `/positions/` | Get all positions |
| GET    | `/positions/:id` | Get position by ID |
| GET    | `/positions/code/:code` | Get position by code |
| PUT    | `/positions/:id` | Update position |
| DELETE | `/positions/:id` | Delete position |
| PUT    | `/positions/activate/:id` | Activate position |

---

### ⏱️ Timesheets
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/timesheets/` | Create weekly timesheet |
| GET    | `/timesheets/:id` | Get timesheet by ID |
| PUT    | `/timesheets/:id` | Update / submit timesheet |
| PUT    | `/timesheets/approve/:id` | Approve timesheet |
| GET    | `/timesheets/user/:userId` | Get all timesheets for user |

---

## 🔒 Authorization

- **superAdmin & subAdmin →** Full CRUD on Users, Roles, Departments, Employees, Positions  
- **employee →** Limited access (own timesheets, profile, etc.)

---

## 📈 Future Improvements

- 📘 Add Swagger API documentation  
- 🧪 Add unit/integration tests (Jest / Supertest)  
- ⚙️ Add CI/CD (GitHub Actions)  
- 🚀 Add caching layer (Redis) for performance  

---

## 🤝 Contributing

1. Fork the repo  
2. Create a new branch (`feature/my-feature`)  
3. Commit changes (`git commit -m "Add feature"`)  
4. Push branch (`git push origin feature/my-feature`)  
5. Open a Pull Request  

---

## 📜 License

This project is licensed under the **MIT License**.

Copyright (c) 2025 Divanshu Garg, Swastik Verma, Raghav Nagi, Priyanshu Bindal

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

