/*
  Warnings:

  - A unique constraint covering the columns `[user_Id]` on the table `Hierarchy` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Hierarchy_user_Id_key" ON "public"."Hierarchy"("user_Id");
