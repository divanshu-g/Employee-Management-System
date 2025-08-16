/*
  Warnings:

  - You are about to drop the column `salary_range_max` on the `Position` table. All the data in the column will be lost.
  - You are about to drop the column `salary_range_min` on the `Position` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,role_id]` on the table `UserRole` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Department" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_by_id" INTEGER;

-- AlterTable
ALTER TABLE "public"."Position" DROP COLUMN "salary_range_max",
DROP COLUMN "salary_range_min",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "salary" DOUBLE PRECISION,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_user_id_role_id_key" ON "public"."UserRole"("user_id", "role_id");

-- AddForeignKey
ALTER TABLE "public"."Department" ADD CONSTRAINT "Department_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "public"."User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
