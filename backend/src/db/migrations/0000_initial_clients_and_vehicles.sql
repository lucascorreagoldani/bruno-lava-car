DO $$ BEGIN
	CREATE TYPE "public"."vehicle_category" AS ENUM('HATCH', 'SEDAN', 'SUV', 'PICKUP');
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clients" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "clients_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"full_name" varchar(150) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "clients_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vehicles" (
	"plate" varchar(10) PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"brand" varchar(50) NOT NULL,
	"model" varchar(80) NOT NULL,
	"color" varchar(30) NOT NULL,
	"year" integer,
	"category" "vehicle_category" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "clients_phone_idx" ON "clients" USING btree ("phone");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "clients_full_name_idx" ON "clients" USING btree ("full_name");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vehicles_client_id_idx" ON "vehicles" USING btree ("client_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vehicles_category_idx" ON "vehicles" USING btree ("category");
