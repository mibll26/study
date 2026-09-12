-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" SERIAL NOT NULL,
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
    "intakeMin" DOUBLE PRECISION,
    "intakeMax" DOUBLE PRECISION,
    "intakeUnit" TEXT,
    "intakeBasis" TEXT,
    "caution" TEXT,
    "sourceName" TEXT,
    "sourceUrl" TEXT,
    "verifiedAt" TEXT,
    "curated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngredientEvidence" (
    "id" SERIAL NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "goal" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "mechanism" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "refLabel" TEXT,
    "refUrl" TEXT,

    CONSTRAINT "IngredientEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngredientInteraction" (
    "id" SERIAL NOT NULL,
    "aId" INTEGER NOT NULL,
    "bId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "refUrl" TEXT,

    CONSTRAINT "IngredientInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Formulation" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dosageForm" TEXT NOT NULL,
    "targetMarkets" TEXT NOT NULL DEFAULT '[]',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Formulation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormulationItem" (
    "id" SERIAL NOT NULL,
    "formulationId" INTEGER NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FormulationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegulatoryStatus" (
    "id" SERIAL NOT NULL,
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

    CONSTRAINT "RegulatoryStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" SERIAL NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierIngredient" (
    "supplierId" INTEGER NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "note" TEXT,

    CONSTRAINT "SupplierIngredient_pkey" PRIMARY KEY ("supplierId","ingredientId")
);

-- CreateTable
CREATE TABLE "MfdsProduct" (
    "id" SERIAL NOT NULL,
    "reportNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "ingredientRaw" TEXT,
    "functionality" TEXT,
    "intakeMethod" TEXT,
    "reportDate" TEXT,
    "keyword" TEXT NOT NULL,
    "ingredientId" INTEGER,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MfdsProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactRequest" (
    "id" SERIAL NOT NULL,
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
    "formulationSlug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "adminNote" TEXT,

    CONSTRAINT "ContactRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierApplication" (
    "id" SERIAL NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplierApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfoRequest" (
    "id" SERIAL NOT NULL,
    "query" TEXT NOT NULL,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InfoRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssueReport" (
    "id" SERIAL NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "field" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IssueReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncJob" (
    "id" SERIAL NOT NULL,
    "source" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "SyncJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_slug_key" ON "Ingredient"("slug");

-- CreateIndex
CREATE INDEX "IngredientEvidence_goal_idx" ON "IngredientEvidence"("goal");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientEvidence_ingredientId_goal_key" ON "IngredientEvidence"("ingredientId", "goal");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientInteraction_aId_bId_key" ON "IngredientInteraction"("aId", "bId");

-- CreateIndex
CREATE UNIQUE INDEX "Formulation_slug_key" ON "Formulation"("slug");

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

-- AddForeignKey
ALTER TABLE "IngredientEvidence" ADD CONSTRAINT "IngredientEvidence_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientInteraction" ADD CONSTRAINT "IngredientInteraction_aId_fkey" FOREIGN KEY ("aId") REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientInteraction" ADD CONSTRAINT "IngredientInteraction_bId_fkey" FOREIGN KEY ("bId") REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulationItem" ADD CONSTRAINT "FormulationItem_formulationId_fkey" FOREIGN KEY ("formulationId") REFERENCES "Formulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulationItem" ADD CONSTRAINT "FormulationItem_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegulatoryStatus" ADD CONSTRAINT "RegulatoryStatus_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierIngredient" ADD CONSTRAINT "SupplierIngredient_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierIngredient" ADD CONSTRAINT "SupplierIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MfdsProduct" ADD CONSTRAINT "MfdsProduct_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

