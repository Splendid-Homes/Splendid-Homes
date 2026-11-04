import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`contact_careers_extra_rows\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`value\` text NOT NULL,
  	\`icon\` text DEFAULT 'building',
  	\`href\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`contact_careers\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`contact_careers_extra_rows_order_idx\` ON \`contact_careers_extra_rows\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`contact_careers_extra_rows_parent_id_idx\` ON \`contact_careers_extra_rows\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`contact_careers_perks\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`icon\` text DEFAULT 'star',
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`contact_careers\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`contact_careers_perks_order_idx\` ON \`contact_careers_perks\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`contact_careers_perks_parent_id_idx\` ON \`contact_careers_perks\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`contact_careers\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`call_label\` text,
  	\`wa_label\` text,
  	\`wa_value\` text,
  	\`email_label\` text,
  	\`visit_label\` text,
  	\`hours_label\` text,
  	\`show_map\` integer DEFAULT true,
  	\`form_title\` text,
  	\`form_cta\` text,
  	\`interest_label\` text,
  	\`form_message\` text,
  	\`perks_title\` text,
  	\`perks_italic\` text,
  	\`roles_title\` text,
  	\`roles_italic\` text,
  	\`no_roles\` text,
  	\`spec_text\` text,
  	\`spec_subject\` text,
  	\`careers_email\` text,
  	\`apply_cta\` text,
  	\`apply_title\` text,
  	\`apply_send\` text,
  	\`apply_hint\` text,
  	\`cv_label\` text,
  	\`show_salary\` integer DEFAULT true,
  	\`salary_label\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`contact_careers_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`contact_careers\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`contact_careers_texts_order_parent\` ON \`contact_careers_texts\` (\`order\`,\`parent_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`contact_careers_extra_rows\`;`)
  await db.run(sql`DROP TABLE \`contact_careers_perks\`;`)
  await db.run(sql`DROP TABLE \`contact_careers\`;`)
  await db.run(sql`DROP TABLE \`contact_careers_texts\`;`)
}
