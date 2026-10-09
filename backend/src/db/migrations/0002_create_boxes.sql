DO $$ BEGIN
 CREATE TYPE "public"."box_status" AS ENUM('ACTIVE', 'MAINTENANCE', 'INACTIVE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "boxes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "boxes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(60) NOT NULL,
	"status" "box_status" DEFAULT 'ACTIVE' NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "boxes_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "boxes_name_idx" ON "boxes" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "boxes_status_idx" ON "boxes" USING btree ("status");
