/*
  Warnings:

  - A unique constraint covering the columns `[actionId,resourceId]` on the table `permission` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "permission_actionId_resourceId_key" ON "permission"("actionId", "resourceId");
