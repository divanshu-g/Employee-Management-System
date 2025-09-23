-- CreateEnum
CREATE TYPE "public"."ApprovalStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- CreateEnum
CREATE TYPE "public"."TimesheetStatus" AS ENUM ('Open', 'Submitted');

-- CreateEnum
CREATE TYPE "public"."TimesheetDayStatus" AS ENUM ('Pending', 'Filled', 'Leave', 'Holiday', 'AutoLeave');

-- CreateEnum
CREATE TYPE "public"."LeaveType" AS ENUM ('Sick', 'Paid', 'Unpaid', 'Halfday', 'None');

-- CreateEnum
CREATE TYPE "public"."RoleType" AS ENUM ('superAdmin', 'subAdmin', 'employee');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('Male', 'Female', 'Other', 'Prefer_not_to_say');

-- CreateEnum
CREATE TYPE "public"."EmploymentType" AS ENUM ('Full_Time', 'Part_Time', 'Contract', 'Intern', 'Consultant');

-- CreateEnum
CREATE TYPE "public"."WorkLocation" AS ENUM ('Office', 'Remote', 'Hybrid');

-- CreateEnum
CREATE TYPE "public"."EmploymentStatus" AS ENUM ('Active', 'Inactive', 'Terminated', 'On_Leave', 'Suspended');

-- CreateTable
CREATE TABLE "public"."User" (
    "user_id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."Role" (
    "role_id" SERIAL NOT NULL,
    "role_name" TEXT NOT NULL,
    "role_type" "public"."RoleType" NOT NULL,
    "role_description" TEXT,
    "permissions" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "public"."UserRole" (
    "user_role_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigned_by_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("user_role_id")
);

-- CreateTable
CREATE TABLE "public"."Department" (
    "department_id" SERIAL NOT NULL,
    "department_name" TEXT NOT NULL,
    "department_code" TEXT NOT NULL,
    "description" TEXT,
    "parent_department_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" INTEGER NOT NULL,
    "updated_by_id" INTEGER,
    "department_head_id" INTEGER,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("department_id")
);

-- CreateTable
CREATE TABLE "public"."Position" (
    "position_id" SERIAL NOT NULL,
    "position_title" TEXT NOT NULL,
    "position_code" TEXT NOT NULL,
    "job_description" TEXT,
    "required_skills" JSONB,
    "salary" DOUBLE PRECISION,
    "position_level" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "department_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("position_id")
);

-- CreateTable
CREATE TABLE "public"."Employee" (
    "emp_id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "employee_code" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "personal_email" TEXT,
    "phone_number" TEXT,
    "emergency_contact" JSONB,
    "date_of_birth" TIMESTAMP(3),
    "gender" "public"."Gender",
    "address" JSONB,
    "department_id" INTEGER,
    "position_id" INTEGER,
    "employment_type" "public"."EmploymentType",
    "work_location" "public"."WorkLocation",
    "hire_date" TIMESTAMP(3) NOT NULL,
    "probation_end_date" TIMESTAMP(3),
    "confirmation_date" TIMESTAMP(3),
    "termination_date" TIMESTAMP(3),
    "direct_manager_id" INTEGER,
    "skip_level_manager_id" INTEGER,
    "employment_status" "public"."EmploymentStatus" DEFAULT 'Active',
    "is_people_manager" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by_id" INTEGER,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("emp_id")
);

-- CreateTable
CREATE TABLE "public"."WeeklyTimesheet" (
    "weekly_timesheet_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "week_start" TIMESTAMP(3) NOT NULL,
    "status" "public"."TimesheetStatus" NOT NULL DEFAULT 'Open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "approved_by" INTEGER,

    CONSTRAINT "WeeklyTimesheet_pkey" PRIMARY KEY ("weekly_timesheet_id")
);

-- CreateTable
CREATE TABLE "public"."TimesheetDay" (
    "timesheetday_id" SERIAL NOT NULL,
    "weekly_timesheet_id" INTEGER NOT NULL,
    "attendance_id" INTEGER,
    "leave_id" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,
    "check_in" TIMESTAMP(3),
    "check_out" TIMESTAMP(3),
    "duration" DOUBLE PRECISION,
    "summary" TEXT,
    "status" "public"."TimesheetDayStatus" NOT NULL DEFAULT 'Pending',
    "created_by" INTEGER,
    "updated_by" INTEGER,

    CONSTRAINT "TimesheetDay_pkey" PRIMARY KEY ("timesheetday_id")
);

-- CreateTable
CREATE TABLE "public"."Leave" (
    "leave_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "leaveType" "public"."LeaveType" NOT NULL,
    "reason" TEXT,
    "leave_duration" DOUBLE PRECISION,
    "status" "public"."ApprovalStatus" NOT NULL DEFAULT 'Pending',
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "approved_by" INTEGER,

    CONSTRAINT "Leave_pkey" PRIMARY KEY ("leave_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_role_name_key" ON "public"."Role"("role_name");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_user_id_role_id_key" ON "public"."UserRole"("user_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "Department_department_code_key" ON "public"."Department"("department_code");

-- CreateIndex
CREATE UNIQUE INDEX "Position_position_code_key" ON "public"."Position"("position_code");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employee_code_key" ON "public"."Employee"("employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyTimesheet_user_id_week_start_key" ON "public"."WeeklyTimesheet"("user_id", "week_start");

-- CreateIndex
CREATE UNIQUE INDEX "TimesheetDay_weekly_timesheet_id_date_key" ON "public"."TimesheetDay"("weekly_timesheet_id", "date");

-- AddForeignKey
ALTER TABLE "public"."UserRole" ADD CONSTRAINT "UserRole_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "public"."User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserRole" ADD CONSTRAINT "UserRole_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."Role"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserRole" ADD CONSTRAINT "UserRole_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Department" ADD CONSTRAINT "Department_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Department" ADD CONSTRAINT "Department_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "public"."User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Department" ADD CONSTRAINT "Department_department_head_id_fkey" FOREIGN KEY ("department_head_id") REFERENCES "public"."Employee"("emp_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Department" ADD CONSTRAINT "Department_parent_department_id_fkey" FOREIGN KEY ("parent_department_id") REFERENCES "public"."Department"("department_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Position" ADD CONSTRAINT "Position_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."Department"("department_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Employee" ADD CONSTRAINT "Employee_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Employee" ADD CONSTRAINT "Employee_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."Department"("department_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Employee" ADD CONSTRAINT "Employee_direct_manager_id_fkey" FOREIGN KEY ("direct_manager_id") REFERENCES "public"."Employee"("emp_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Employee" ADD CONSTRAINT "Employee_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "public"."Position"("position_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Employee" ADD CONSTRAINT "Employee_skip_level_manager_id_fkey" FOREIGN KEY ("skip_level_manager_id") REFERENCES "public"."Employee"("emp_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Employee" ADD CONSTRAINT "Employee_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "public"."User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Employee" ADD CONSTRAINT "Employee_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WeeklyTimesheet" ADD CONSTRAINT "WeeklyTimesheet_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WeeklyTimesheet" ADD CONSTRAINT "WeeklyTimesheet_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TimesheetDay" ADD CONSTRAINT "TimesheetDay_weekly_timesheet_id_fkey" FOREIGN KEY ("weekly_timesheet_id") REFERENCES "public"."WeeklyTimesheet"("weekly_timesheet_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TimesheetDay" ADD CONSTRAINT "TimesheetDay_leave_id_fkey" FOREIGN KEY ("leave_id") REFERENCES "public"."Leave"("leave_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Leave" ADD CONSTRAINT "Leave_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Leave" ADD CONSTRAINT "Leave_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
