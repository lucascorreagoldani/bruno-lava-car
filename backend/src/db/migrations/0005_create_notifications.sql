CREATE TYPE "public"."notification_status" AS ENUM('QUEUED', 'PROCESSING', 'SENT', 'FAILED');
--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('APPOINTMENT_CONFIRMED', 'WORK_ORDER_STARTED', 'WORK_ORDER_READY', 'WORK_ORDER_DELIVERED', 'CUSTOM_MESSAGE');
--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('WHATSAPP', 'SMS', 'WEBHOOK');
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "notification_type" NOT NULL,
	"channel" "notification_channel" DEFAULT 'WHATSAPP' NOT NULL,
	"status" "notification_status" DEFAULT 'QUEUED' NOT NULL,
	"recipient_phone" varchar(20) NOT NULL,
	"recipient_name" varchar(150) NOT NULL,
	"content" text NOT NULL,
	"client_id" integer,
	"vehicle_plate" varchar(10),
	"work_order_id" integer,
	"appointment_id" integer,
	"provider_message_id" varchar(100),
	"error_message" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_vehicle_plate_vehicles_plate_fk" FOREIGN KEY ("vehicle_plate") REFERENCES "public"."vehicles"("plate") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_work_order_id_work_orders_id_fk" FOREIGN KEY ("work_order_id") REFERENCES "public"."work_orders"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
