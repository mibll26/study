-- CreateTable
CREATE TABLE "Ingredient" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "nameKo" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameScientific" TEXT,
    "aliases" TEXT NOT NULL DEFAULT '[]',
    "category" TEXT NOT NULL,
    "functionality" TEXT NOT NULL DEFAULT '[]',
    "dosageForms" TEXT NOT NULL DEFAULT '[]',
    "descriptionKo" TEXT,
    "dailyIntake" TEXT,
    "caution" TEXT,
    "sourceName" TEXT,
    "sourceUrl" TEXT,
    "verifiedAt" TEXT,
    "curated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RegulatoryStatus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ingredientId" INTEGER NOT NULL,
    "countryCode" TEXT NOT NULL,
    "legalityStatus" TEXT NOT NULL,
    "usable" BOOLEAN NOT NULL DEFAULT true,
    "approvalType" TEXT,
    "approvalHolder" TEXT,
    "legality" TEXT,
    "allowedClaims" TEXT NOT NULL DEFAULT '[]',
    "facilityRequirements" TEXT,
    "registrationDuration" TEXT,
    "registrationCost" TEXT,
    "alternativeChannels" TEXT,
    "sourceName" TEXT,
    "sourceUrl" TEXT,
    "verifiedAt" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "RegulatoryStatus_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "nameKo" TEXT NOT NULL,
    "nameEn" TEXT,
    "countryCode" TEXT NOT NULL,
    "supplierTypes" TEXT NOT NULL DEFAULT '[]',
    "dosageForms" TEXT NOT NULL DEFAULT '[]',
    "certifications" TEXT NOT NULL DEFAULT '[]',
    "moqMin" INTEGER,
    "moqUnit" TEXT,
    "leadWeeksMin" INTEGER,
    "leadWeeksMax" INTEGER,
    "verificationStatus" TEXT NOT NULL DEFAULT 'unverified',
    "description" TEXT,
    "foundedYear" INTEGER,
    "capacity" TEXT,
    "contactEmail" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SupplierIngredient" (
    "supplierId" INTEGER NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "note" TEXT,

    PRIMARY KEY ("supplierId", "ingredientId"),
    CONSTRAINT "SupplierIngredient_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SupplierIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MfdsProduct" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reportNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "ingredientRaw" TEXT,
    "functionality" TEXT,
    "intakeMethod" TEXT,
    "reportDate" TEXT,
    "keyword" TEXT NOT NULL,
    "ingredientId" INTEGER,
    "fetchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MfdsProduct_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContactRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "refNo" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "title" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "ingredient" TEXT NOT NULL,
    "dosageForm" TEXT NOT NULL,
    "quantityRange" TEXT NOT NULL,
    "targetDate" TEXT,
    "targetMarkets" TEXT NOT NULL DEFAULT '[]',
    "message" TEXT,
    "supplierIds" TEXT NOT NULL DEFAULT '[]',
    "supplierNames" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" DATETIME,
    "respondedAt" DATETIME,
    "adminNote" TEXT
);

-- CreateTable
CREATE TABLE "SupplierApplication" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "company" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "supplierTypes" TEXT NOT NULL DEFAULT '[]',
    "dosageForms" TEXT NOT NULL DEFAULT '[]',
    "certifications" TEXT NOT NULL DEFAULT '[]',
    "moq" TEXT,
    "leadTime" TEXT,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "InfoRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "query" TEXT NOT NULL,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "IssueReport" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "field" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SyncJob" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "source" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_slug_key" ON "Ingredient"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "RegulatoryStatus_ingredientId_countryCode_key" ON "RegulatoryStatus"("ingredientId", "countryCode");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_slug_key" ON "Supplier"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "MfdsProduct_reportNo_key" ON "MfdsProduct"("reportNo");

-- CreateIndex
CREATE INDEX "MfdsProduct_keyword_idx" ON "MfdsProduct"("keyword");

-- CreateIndex
CREATE INDEX "MfdsProduct_name_idx" ON "MfdsProduct"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ContactRequest_refNo_key" ON "ContactRequest"("refNo");
