-- CreateEnum
CREATE TYPE "public"."SecretGroup" AS ENUM ('RUNTIME_APPLICATION', 'GITHUB_ACTIONS', 'LOCAL_DEVELOPMENT', 'DEPLOYMENT_PLATFORM', 'INFRASTRUCTURE', 'OTHER');

-- AlterTable
ALTER TABLE "public"."secrets" ADD COLUMN "group" "public"."SecretGroup" NOT NULL DEFAULT 'RUNTIME_APPLICATION';

-- DropIndex
DROP INDEX "public"."secrets_name_environmentId_key";

-- CreateIndex
CREATE UNIQUE INDEX "secrets_name_projectId_environmentId_group_key" ON "public"."secrets"("name", "projectId", "environmentId", "group");
