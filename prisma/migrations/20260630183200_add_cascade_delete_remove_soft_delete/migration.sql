-- Supprimer d'abord les lignes soft-deleted pour éviter les erreurs de contrainte
DELETE FROM "transaction" WHERE "deleted" = true;
DELETE FROM "partner" WHERE "deleted" = true;

-- DropForeignKey
ALTER TABLE "public"."transaction" DROP CONSTRAINT "transaction_account_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."transaction" DROP CONSTRAINT "transaction_from_account_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."transaction" DROP CONSTRAINT "transaction_to_account_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."transfer" DROP CONSTRAINT "transfer_partnerId_fkey";

-- AlterTable : supprimer la colonne deleted de transaction
ALTER TABLE "public"."transaction" DROP COLUMN "deleted";

-- AlterTable : supprimer la colonne deleted de partner
ALTER TABLE "public"."partner" DROP COLUMN "deleted";

-- AddForeignKey avec ON DELETE CASCADE
ALTER TABLE "public"."transaction" ADD CONSTRAINT "transaction_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."bank_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey avec ON DELETE CASCADE
ALTER TABLE "public"."transaction" ADD CONSTRAINT "transaction_from_account_id_fkey" FOREIGN KEY ("from_account_id") REFERENCES "public"."bank_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey avec ON DELETE CASCADE
ALTER TABLE "public"."transaction" ADD CONSTRAINT "transaction_to_account_id_fkey" FOREIGN KEY ("to_account_id") REFERENCES "public"."bank_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey avec ON DELETE CASCADE
ALTER TABLE "public"."transfer" ADD CONSTRAINT "transfer_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "public"."partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
