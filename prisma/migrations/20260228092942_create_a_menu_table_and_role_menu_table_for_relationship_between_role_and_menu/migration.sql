-- CreateTable
CREATE TABLE "menu" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_by" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(255),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_menu" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "created_by" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" VARCHAR(255),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "role_menu_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "menu_name_key" ON "menu"("name");

-- CreateIndex
CREATE UNIQUE INDEX "role_menu_roleId_menuId_key" ON "role_menu"("roleId", "menuId");

-- AddForeignKey
ALTER TABLE "role_menu" ADD CONSTRAINT "role_menu_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "role_menu" ADD CONSTRAINT "role_menu_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "menu"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
