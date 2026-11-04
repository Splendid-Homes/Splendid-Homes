import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`leads_notes\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	\`author_id\` integer,
  	\`at\` text,
  	FOREIGN KEY (\`author_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`leads\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`leads_notes_order_idx\` ON \`leads_notes\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`leads_notes_parent_id_idx\` ON \`leads_notes\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`leads_notes_author_idx\` ON \`leads_notes\` (\`author_id\`);`)
  await db.run(sql`CREATE TABLE \`leads_status_history\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`from\` text,
  	\`to\` text,
  	\`by_id\` integer,
  	\`at\` text,
  	FOREIGN KEY (\`by_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`leads\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`leads_status_history_order_idx\` ON \`leads_status_history\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`leads_status_history_parent_id_idx\` ON \`leads_status_history\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`leads_status_history_by_idx\` ON \`leads_status_history\` (\`by_id\`);`)
  await db.run(sql`CREATE TABLE \`leads\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`type\` text NOT NULL,
  	\`status\` text DEFAULT 'new' NOT NULL,
  	\`name\` text NOT NULL,
  	\`phone\` text,
  	\`email\` text,
  	\`subject\` text,
  	\`message\` text,
  	\`details\` text,
  	\`cv_id\` integer,
  	\`assigned_agent_id\` integer,
  	\`property_id\` integer,
  	\`project_id\` integer,
  	\`job_id\` integer,
  	\`source_page\` text,
  	\`consent_at\` text,
  	\`delivery_email_sent\` integer,
  	\`delivery_email_error\` text,
  	\`delivery_sheets_sent\` integer,
  	\`delivery_sheets_error\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`cv_id\`) REFERENCES \`resumes\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`assigned_agent_id\`) REFERENCES \`agents\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`property_id\`) REFERENCES \`properties\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`project_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`job_id\`) REFERENCES \`careers\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`leads_cv_idx\` ON \`leads\` (\`cv_id\`);`)
  await db.run(sql`CREATE INDEX \`leads_assigned_agent_idx\` ON \`leads\` (\`assigned_agent_id\`);`)
  await db.run(sql`CREATE INDEX \`leads_property_idx\` ON \`leads\` (\`property_id\`);`)
  await db.run(sql`CREATE INDEX \`leads_project_idx\` ON \`leads\` (\`project_id\`);`)
  await db.run(sql`CREATE INDEX \`leads_job_idx\` ON \`leads\` (\`job_id\`);`)
  await db.run(sql`CREATE INDEX \`leads_updated_at_idx\` ON \`leads\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`leads_created_at_idx\` ON \`leads\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`resumes\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`applicant\` text,
  	\`_objectkey\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric
  );
  `)
  await db.run(sql`CREATE INDEX \`resumes_updated_at_idx\` ON \`resumes\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`resumes_created_at_idx\` ON \`resumes\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`resumes_filename_idx\` ON \`resumes\` (\`filename\`);`)
  await db.run(sql`CREATE TABLE \`properties_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`url\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`properties\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`properties_images_order_idx\` ON \`properties_images\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`properties_images_parent_id_idx\` ON \`properties_images\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`properties_images_image_idx\` ON \`properties_images\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`properties\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`ref\` text NOT NULL,
  	\`permit\` text NOT NULL,
  	\`purpose\` text NOT NULL,
  	\`type\` text NOT NULL,
  	\`price\` numeric NOT NULL,
  	\`beds\` numeric NOT NULL,
  	\`baths\` numeric NOT NULL,
  	\`size\` numeric NOT NULL,
  	\`parking\` numeric DEFAULT 0,
  	\`community_id\` integer NOT NULL,
  	\`building\` text NOT NULL,
  	\`developer_id\` integer,
  	\`furnishing\` text DEFAULT 'Unfurnished' NOT NULL,
  	\`completion_status\` text DEFAULT 'Ready' NOT NULL,
  	\`completion\` text,
  	\`view\` text,
  	\`service_charge\` numeric,
  	\`desc\` text NOT NULL,
  	\`video_url\` text,
  	\`tour_url\` text,
  	\`seo_meta_title\` text,
  	\`seo_meta_description\` text,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`featured\` integer DEFAULT false,
  	\`agent_id\` integer NOT NULL,
  	\`listed_at\` text NOT NULL,
  	\`views\` numeric DEFAULT 0,
  	\`slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`community_id\`) REFERENCES \`communities\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`developer_id\`) REFERENCES \`developers\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`agent_id\`) REFERENCES \`agents\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`properties_ref_idx\` ON \`properties\` (\`ref\`);`)
  await db.run(sql`CREATE INDEX \`properties_community_idx\` ON \`properties\` (\`community_id\`);`)
  await db.run(sql`CREATE INDEX \`properties_developer_idx\` ON \`properties\` (\`developer_id\`);`)
  await db.run(sql`CREATE INDEX \`properties_agent_idx\` ON \`properties\` (\`agent_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`properties_slug_idx\` ON \`properties\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`properties_updated_at_idx\` ON \`properties\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`properties_created_at_idx\` ON \`properties\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`properties_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`properties\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`properties_texts_order_parent\` ON \`properties_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_plan\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`pct\` numeric NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_plan_order_idx\` ON \`projects_plan\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_plan_parent_id_idx\` ON \`projects_plan\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_units\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`type\` text NOT NULL,
  	\`size\` text NOT NULL,
  	\`from\` numeric NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_units_order_idx\` ON \`projects_units\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_units_parent_id_idx\` ON \`projects_units\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`url\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_images_order_idx\` ON \`projects_images\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_images_parent_id_idx\` ON \`projects_images\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_images_image_idx\` ON \`projects_images\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`projects\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`developer_id\` integer NOT NULL,
  	\`community_id\` integer NOT NULL,
  	\`start_price\` numeric NOT NULL,
  	\`handover\` text NOT NULL,
  	\`payment_plan\` text NOT NULL,
  	\`construction_status\` text NOT NULL,
  	\`desc\` text NOT NULL,
  	\`image_id\` integer,
  	\`image_url\` text,
  	\`brochure_id\` integer,
  	\`seo_meta_title\` text,
  	\`seo_meta_description\` text,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`featured\` integer DEFAULT false,
  	\`slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`developer_id\`) REFERENCES \`developers\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`community_id\`) REFERENCES \`communities\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`brochure_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_developer_idx\` ON \`projects\` (\`developer_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_community_idx\` ON \`projects\` (\`community_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_image_idx\` ON \`projects\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_brochure_idx\` ON \`projects\` (\`brochure_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`projects_slug_idx\` ON \`projects\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`projects_updated_at_idx\` ON \`projects\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`projects_created_at_idx\` ON \`projects\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`projects_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_texts_order_parent\` ON \`projects_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`communities\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`tag\` text NOT NULL,
  	\`desc\` text NOT NULL,
  	\`image_id\` integer,
  	\`image_url\` text,
  	\`coords_lat\` numeric NOT NULL,
  	\`coords_lng\` numeric NOT NULL,
  	\`avg_sale\` numeric NOT NULL,
  	\`avg_rent\` numeric NOT NULL,
  	\`roi\` numeric NOT NULL,
  	\`seo_meta_title\` text,
  	\`seo_meta_description\` text,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`order\` numeric DEFAULT 0,
  	\`slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`communities_image_idx\` ON \`communities\` (\`image_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`communities_slug_idx\` ON \`communities\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`communities_updated_at_idx\` ON \`communities\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`communities_created_at_idx\` ON \`communities\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`communities_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`communities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`communities_texts_order_parent\` ON \`communities_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`developers\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`desc\` text NOT NULL,
  	\`founded\` numeric NOT NULL,
  	\`projects\` numeric,
  	\`logo_id\` integer,
  	\`slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`developers_logo_idx\` ON \`developers\` (\`logo_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`developers_slug_idx\` ON \`developers\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`developers_updated_at_idx\` ON \`developers\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`developers_created_at_idx\` ON \`developers\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`agents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`title\` text NOT NULL,
  	\`photo_id\` integer,
  	\`photo_url\` text,
  	\`brn\` text NOT NULL,
  	\`phone\` text NOT NULL,
  	\`email\` text NOT NULL,
  	\`bio\` text NOT NULL,
  	\`deals\` numeric,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`order\` numeric DEFAULT 0,
  	\`slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`agents_photo_idx\` ON \`agents\` (\`photo_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`agents_slug_idx\` ON \`agents\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`agents_updated_at_idx\` ON \`agents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`agents_created_at_idx\` ON \`agents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`agents_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`agents\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`agents_texts_order_parent\` ON \`agents_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_takeaways\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_takeaways_order_idx\` ON \`posts_takeaways\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_takeaways_parent_id_idx\` ON \`posts_takeaways\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_steps_order_idx\` ON \`posts_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_steps_parent_id_idx\` ON \`posts_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_table_rows\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_table_rows_order_idx\` ON \`posts_table_rows\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_table_rows_parent_id_idx\` ON \`posts_table_rows\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_community_rows_rows\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`community_id\` integer NOT NULL,
  	\`best_for\` text NOT NULL,
  	FOREIGN KEY (\`community_id\`) REFERENCES \`communities\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_community_rows_rows_order_idx\` ON \`posts_community_rows_rows\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_community_rows_rows_parent_id_idx\` ON \`posts_community_rows_rows\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_community_rows_rows_community_idx\` ON \`posts_community_rows_rows\` (\`community_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_faqs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`q\` text NOT NULL,
  	\`a\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_faqs_order_idx\` ON \`posts_faqs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_faqs_parent_id_idx\` ON \`posts_faqs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_sources\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`url\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_sources_order_idx\` ON \`posts_sources\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_sources_parent_id_idx\` ON \`posts_sources\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`posts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`category\` text NOT NULL,
  	\`date\` text NOT NULL,
  	\`last_reviewed\` text,
  	\`author_id\` integer NOT NULL,
  	\`image_id\` integer,
  	\`image_url\` text,
  	\`excerpt\` text NOT NULL,
  	\`summary\` text,
  	\`sample_note\` text,
  	\`body\` text NOT NULL,
  	\`table_title\` text,
  	\`table_caption\` text,
  	\`community_rows_title\` text,
  	\`community_rows_caption\` text,
  	\`show_community_comparison\` integer,
  	\`seo_meta_title\` text,
  	\`seo_meta_description\` text,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`author_id\`) REFERENCES \`agents\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_author_idx\` ON \`posts\` (\`author_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_image_idx\` ON \`posts\` (\`image_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`posts_slug_idx\` ON \`posts\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`posts_updated_at_idx\` ON \`posts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`posts_created_at_idx\` ON \`posts\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`posts_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_texts_order_parent\` ON \`posts_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`testimonials\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`role\` text NOT NULL,
  	\`text\` text NOT NULL,
  	\`rating\` numeric DEFAULT 5,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`testimonials_updated_at_idx\` ON \`testimonials\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`testimonials_created_at_idx\` ON \`testimonials\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`services\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`icon\` text NOT NULL,
  	\`desc\` text NOT NULL,
  	\`image_id\` integer,
  	\`image_url\` text,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`order\` numeric DEFAULT 0,
  	\`slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`services_image_idx\` ON \`services\` (\`image_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`services_slug_idx\` ON \`services\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`services_updated_at_idx\` ON \`services\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`services_created_at_idx\` ON \`services\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`services_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`services_texts_order_parent\` ON \`services_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`careers\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`dept\` text NOT NULL,
  	\`type\` text NOT NULL,
  	\`location\` text NOT NULL,
  	\`desc\` text NOT NULL,
  	\`posted_at\` text,
  	\`closes_at\` text,
  	\`salary\` text,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`careers_updated_at_idx\` ON \`careers\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`careers_created_at_idx\` ON \`careers\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`alt\` text NOT NULL,
  	\`_objectkey\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric
  );
  `)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`role\` text DEFAULT 'agent' NOT NULL,
  	\`agent_id\` integer,
  	\`active\` integer DEFAULT true,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`reset_password_requested_at\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text,
  	FOREIGN KEY (\`agent_id\`) REFERENCES \`agents\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`users_agent_idx\` ON \`users\` (\`agent_id\`);`)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`activity\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`user_id\` integer,
  	\`action\` text,
  	\`collection_slug\` text,
  	\`doc_id\` text,
  	\`title\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`activity_user_idx\` ON \`activity\` (\`user_id\`);`)
  await db.run(sql`CREATE INDEX \`activity_updated_at_idx\` ON \`activity\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`activity_created_at_idx\` ON \`activity\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`exports\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`format\` text DEFAULT 'csv' NOT NULL,
  	\`limit\` numeric,
  	\`page\` numeric DEFAULT 1,
  	\`sort\` text,
  	\`sort_order\` text,
  	\`drafts\` text DEFAULT 'yes',
  	\`collection_slug\` text DEFAULT 'leads' NOT NULL,
  	\`where\` text DEFAULT '{}',
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric
  );
  `)
  await db.run(sql`CREATE INDEX \`exports_updated_at_idx\` ON \`exports\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`exports_created_at_idx\` ON \`exports\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`exports_filename_idx\` ON \`exports\` (\`filename\`);`)
  await db.run(sql`CREATE TABLE \`exports_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`exports\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`exports_texts_order_parent\` ON \`exports_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`imports\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`collection_slug\` text NOT NULL,
  	\`import_mode\` text,
  	\`match_field\` text DEFAULT 'id',
  	\`status\` text DEFAULT 'pending',
  	\`summary_imported\` numeric,
  	\`summary_updated\` numeric,
  	\`summary_total\` numeric,
  	\`summary_issues\` numeric,
  	\`summary_issue_details\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric
  );
  `)
  await db.run(sql`CREATE INDEX \`imports_updated_at_idx\` ON \`imports\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`imports_created_at_idx\` ON \`imports\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`imports_filename_idx\` ON \`imports\` (\`filename\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`payload_jobs_log\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`executed_at\` text NOT NULL,
  	\`completed_at\` text NOT NULL,
  	\`task_slug\` text NOT NULL,
  	\`task_i_d\` text NOT NULL,
  	\`input\` text,
  	\`output\` text,
  	\`state\` text NOT NULL,
  	\`error\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`payload_jobs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_jobs_log_order_idx\` ON \`payload_jobs_log\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_log_parent_id_idx\` ON \`payload_jobs_log\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_jobs\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`input\` text,
  	\`completed_at\` text,
  	\`total_tried\` numeric DEFAULT 0,
  	\`has_error\` integer DEFAULT false,
  	\`error\` text,
  	\`task_slug\` text,
  	\`queue\` text DEFAULT 'default',
  	\`wait_until\` text,
  	\`processing\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_jobs_completed_at_idx\` ON \`payload_jobs\` (\`completed_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_total_tried_idx\` ON \`payload_jobs\` (\`total_tried\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_has_error_idx\` ON \`payload_jobs\` (\`has_error\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_task_slug_idx\` ON \`payload_jobs\` (\`task_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_queue_idx\` ON \`payload_jobs\` (\`queue\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_wait_until_idx\` ON \`payload_jobs\` (\`wait_until\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_processing_idx\` ON \`payload_jobs\` (\`processing\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_updated_at_idx\` ON \`payload_jobs\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_created_at_idx\` ON \`payload_jobs\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`leads_id\` integer,
  	\`resumes_id\` integer,
  	\`properties_id\` integer,
  	\`projects_id\` integer,
  	\`communities_id\` integer,
  	\`developers_id\` integer,
  	\`agents_id\` integer,
  	\`posts_id\` integer,
  	\`testimonials_id\` integer,
  	\`services_id\` integer,
  	\`careers_id\` integer,
  	\`media_id\` integer,
  	\`users_id\` integer,
  	\`activity_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`leads_id\`) REFERENCES \`leads\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`resumes_id\`) REFERENCES \`resumes\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`properties_id\`) REFERENCES \`properties\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`communities_id\`) REFERENCES \`communities\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`developers_id\`) REFERENCES \`developers\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`agents_id\`) REFERENCES \`agents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`testimonials_id\`) REFERENCES \`testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`services_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`careers_id\`) REFERENCES \`careers\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`activity_id\`) REFERENCES \`activity\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_leads_id_idx\` ON \`payload_locked_documents_rels\` (\`leads_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_resumes_id_idx\` ON \`payload_locked_documents_rels\` (\`resumes_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_properties_id_idx\` ON \`payload_locked_documents_rels\` (\`properties_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_projects_id_idx\` ON \`payload_locked_documents_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_communities_id_idx\` ON \`payload_locked_documents_rels\` (\`communities_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_developers_id_idx\` ON \`payload_locked_documents_rels\` (\`developers_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_agents_id_idx\` ON \`payload_locked_documents_rels\` (\`agents_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_testimonials_id_idx\` ON \`payload_locked_documents_rels\` (\`testimonials_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_services_id_idx\` ON \`payload_locked_documents_rels\` (\`services_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_careers_id_idx\` ON \`payload_locked_documents_rels\` (\`careers_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_activity_id_idx\` ON \`payload_locked_documents_rels\` (\`activity_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`settings_rates\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`code\` text NOT NULL,
  	\`rate\` numeric NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`settings_rates_order_idx\` ON \`settings_rates\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`settings_rates_parent_id_idx\` ON \`settings_rates\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`company\` text NOT NULL,
  	\`orn\` text NOT NULL,
  	\`tagline\` text NOT NULL,
  	\`phone\` text NOT NULL,
  	\`whatsapp\` text NOT NULL,
  	\`email\` text NOT NULL,
  	\`street\` text NOT NULL,
  	\`address\` text NOT NULL,
  	\`hours\` text NOT NULL,
  	\`lat\` numeric NOT NULL,
  	\`lng\` numeric NOT NULL,
  	\`google_business_profile\` text,
  	\`socials_instagram\` text,
  	\`socials_linkedin\` text,
  	\`socials_youtube\` text,
  	\`socials_tiktok\` text,
  	\`socials_facebook\` text,
  	\`stats_years\` numeric NOT NULL,
  	\`stats_sold\` text NOT NULL,
  	\`stats_clients\` text NOT NULL,
  	\`stats_agents\` numeric NOT NULL,
  	\`hero_title\` text NOT NULL,
  	\`hero_subtitle\` text NOT NULL,
  	\`hero_image_id\` integer,
  	\`hero_image_url\` text,
  	\`sections_featured\` integer DEFAULT true,
  	\`sections_offplan\` integer DEFAULT true,
  	\`sections_communities\` integer DEFAULT true,
  	\`sections_services\` integer DEFAULT true,
  	\`sections_why\` integer DEFAULT true,
  	\`sections_testimonials\` integer DEFAULT true,
  	\`sections_sell\` integer DEFAULT true,
  	\`sections_team\` integer DEFAULT true,
  	\`sections_insights\` integer DEFAULT true,
  	\`market_source\` text NOT NULL,
  	\`market_source_url\` text,
  	\`market_updated\` text NOT NULL,
  	\`sheets_enabled\` integer DEFAULT false,
  	\`privacy\` text,
  	\`terms\` text,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`settings_hero_image_idx\` ON \`settings\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE TABLE \`settings_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`settings_texts_order_parent\` ON \`settings_texts\` (\`order\`,\`parent_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`leads_notes\`;`)
  await db.run(sql`DROP TABLE \`leads_status_history\`;`)
  await db.run(sql`DROP TABLE \`leads\`;`)
  await db.run(sql`DROP TABLE \`resumes\`;`)
  await db.run(sql`DROP TABLE \`properties_images\`;`)
  await db.run(sql`DROP TABLE \`properties\`;`)
  await db.run(sql`DROP TABLE \`properties_texts\`;`)
  await db.run(sql`DROP TABLE \`projects_plan\`;`)
  await db.run(sql`DROP TABLE \`projects_units\`;`)
  await db.run(sql`DROP TABLE \`projects_images\`;`)
  await db.run(sql`DROP TABLE \`projects\`;`)
  await db.run(sql`DROP TABLE \`projects_texts\`;`)
  await db.run(sql`DROP TABLE \`communities\`;`)
  await db.run(sql`DROP TABLE \`communities_texts\`;`)
  await db.run(sql`DROP TABLE \`developers\`;`)
  await db.run(sql`DROP TABLE \`agents\`;`)
  await db.run(sql`DROP TABLE \`agents_texts\`;`)
  await db.run(sql`DROP TABLE \`posts_takeaways\`;`)
  await db.run(sql`DROP TABLE \`posts_steps\`;`)
  await db.run(sql`DROP TABLE \`posts_table_rows\`;`)
  await db.run(sql`DROP TABLE \`posts_community_rows_rows\`;`)
  await db.run(sql`DROP TABLE \`posts_faqs\`;`)
  await db.run(sql`DROP TABLE \`posts_sources\`;`)
  await db.run(sql`DROP TABLE \`posts\`;`)
  await db.run(sql`DROP TABLE \`posts_texts\`;`)
  await db.run(sql`DROP TABLE \`testimonials\`;`)
  await db.run(sql`DROP TABLE \`services\`;`)
  await db.run(sql`DROP TABLE \`services_texts\`;`)
  await db.run(sql`DROP TABLE \`careers\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`activity\`;`)
  await db.run(sql`DROP TABLE \`exports\`;`)
  await db.run(sql`DROP TABLE \`exports_texts\`;`)
  await db.run(sql`DROP TABLE \`imports\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`payload_jobs_log\`;`)
  await db.run(sql`DROP TABLE \`payload_jobs\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
  await db.run(sql`DROP TABLE \`settings_rates\`;`)
  await db.run(sql`DROP TABLE \`settings\`;`)
  await db.run(sql`DROP TABLE \`settings_texts\`;`)
}
