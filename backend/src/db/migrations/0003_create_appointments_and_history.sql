CREATE TYPE "public"."appointment_status" AS ENUM('SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
CREATE TYPE "public"."appointment_history_action" AS ENUM('CREATED', 'STATUS_CHANGED', 'RESCHEDULED', 'CANCELLED', 'COMPLETED');

CREATE TABLE "appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"vehicle_plate" varchar(10) NOT NULL,
	"service_id" integer NOT NULL,
	"box_id" integer NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"estimated_end_at" timestamp with time zone NOT NULL,
	"price_in_cents" integer NOT NULL,
	"status" "appointment_status" DEFAULT 'SCHEDULED' NOT NULL,
	"notes" text,
	"cancellation_reason" text,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "appointment_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"appointment_id" integer NOT NULL,
	"previous_status" varchar(30),
	"new_status" varchar(30) NOT NULL,
	"action" "appointment_history_action" NOT NULL,
	"reason" text,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "appointments" ADD CONSTRAINT "appointments_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_vehicle_plate_vehicles_plate_fk" FOREIGN KEY ("vehicle_plate") REFERENCES "public"."vehicles"("plate") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_box_id_boxes_id_fk" FOREIGN KEY ("box_id") REFERENCES "public"."boxes"("id") ON DELETE restrict ON UPDATE no action;

ALTER TABLE "appointment_history" ADD CONSTRAINT "appointment_history_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;

CREATE INDEX "idx_appointments_box_interval" ON "appointments" USING btree ("box_id","scheduled_at","estimated_end_at");
CREATE INDEX "idx_appointments_client" ON "appointments" USING btree ("client_id");
CREATE INDEX "idx_appointments_vehicle" ON "appointments" USING btree ("vehicle_plate");
CREATE INDEX "idx_appointments_status" ON "appointments" USING btree ("status");
CREATE INDEX "idx_appointment_history_appointment" ON "appointment_history" USING btree ("appointment_id","created_at");
