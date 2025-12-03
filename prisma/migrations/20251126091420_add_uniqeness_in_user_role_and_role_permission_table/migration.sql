/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `role` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[roleId,permissionId]` on the table `role_permission` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,roleId]` on the table `user_role` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "role_name_key" ON "role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "role_permission_roleId_permissionId_key" ON "role_permission"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "user_role_userId_roleId_key" ON "user_role"("userId", "roleId");
