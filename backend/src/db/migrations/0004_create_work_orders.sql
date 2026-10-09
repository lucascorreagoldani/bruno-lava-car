CREATE TYPE "public"."work_order_status" AS ENUM('CHECK_IN', 'IN_PROGRESS', 'FINISHING', 'READY_FOR_PICKUP', 'DELIVERED', 'CANCELLED');
CREATE TYPE "public"."work_order_history_action" AS ENUM('CREATED', 'STATUS_CHANGED', 'ITEM_ADDED', 'ITEM_REMOVED', 'CANCELLED', 'DELIVERED');

CREATE TABLE "work_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_number" varchar(30) NOT NULL UNIQUE,
	"appointment_id" integer,
	"client_id" integer NOT NULL,
	"vehicle_plate" varchar(10) NOT NULL,
	"box_id" integer NOT NULL,
	"status" "work_order_status" DEFAULT 'CHECK_IN' NOT NULL,
	"total_price_in_cents" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"cancellation_reason" text,
	"check_in_at" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "work_order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"work_order_id" integer NOT NULL,
	"service_id" integer NOT NULL,
	"service_name" varchar(100) NOT NULL,
	"unit_price_in_cents" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"total_price_in_cents" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "work_order_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"work_order_id" integer NOT NULL,
	"previous_status" varchar(30),
	"new_status" varchar(30) NOT NULL,
	"action" "work_order_history_action" NOT NULL,
	"reason" text,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_vehicle_plate_vehicles_plate_fk" FOREIGN KEY ("vehicle_plate") REFERENCES "public"."vehicles"("plate") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_box_id_boxes_id_fk" FOREIGN KEY ("box_id") REFERENCES "public"."boxes"("id") ON DELETE restrict ON UPDATE no action;

ALTER TABLE "work_order_items" ADD CONSTRAINT "work_order_items_work_order_id_work_orders_id_fk" FOREIGN KEY ("work_order_id") REFERENCES "public"."work_orders"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "work_order_items" ADD CONSTRAINT "work_order_items_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE restrict ON UPDATE no action;

ALTER TABLE "work_order_history" ADD CONSTRAINT "work_order_history_work_order_id_work_orders_id_fk" FOREIGN KEY ("work_order_id") REFERENCES "public"."work_orders"("id") ON DELETE cascade ON UPDATE no action;

CREATE INDEX "idx_work_orders_status" ON "work_orders" USING btree ("status");
CREATE INDEX "idx_work_orders_client" ON "work_orders" USING btree ("client_id");
CREATE INDEX "idx_work_orders_vehicle" ON "work_orders" USING btree ("vehicle_plate");
CREATE INDEX "idx_work_orders_box" ON "work_orders" USING btree ("box_id");
CREATE INDEX "idx_work_orders_check_in" ON "work_orders" USING btree ("check_in_at");
CREATE INDEX "idx_work_order_items_order" ON "work_order_items" USING btree ("work_order_id");
CREATE INDEX "idx_work_order_history_order" ON "work_order_history" USING btree ("work_order_id","created_at");
