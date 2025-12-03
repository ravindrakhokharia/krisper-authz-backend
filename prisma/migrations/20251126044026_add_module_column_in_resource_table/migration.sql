/*
  Warnings:

  - Added the required column `module` to the `resource` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "resource" ADD COLUMN     "module" VARCHAR(255) NOT NULL;
