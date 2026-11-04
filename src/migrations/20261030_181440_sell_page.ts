import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`sell_page_why_points\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`sell_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`sell_page_why_points_order_idx\` ON \`sell_page_why_points\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`sell_page_why_points_parent_id_idx\` ON \`sell_page_why_points\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`sell_page_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`sell_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`sell_page_steps_order_idx\` ON \`sell_page_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`sell_page_steps_parent_id_idx\` ON \`sell_page_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`sell_page_faqs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`q\` text NOT NULL,
  	\`a\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`sell_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`sell_page_faqs_order_idx\` ON \`sell_page_faqs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`sell_page_faqs_parent_id_idx\` ON \`sell_page_faqs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`sell_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`why_eyebrow\` text,
  	\`why_title\` text,
  	\`why_italic\` text,
  	\`show_stats\` integer DEFAULT true,
  	\`steps_eyebrow\` text,
  	\`steps_title\` text,
  	\`steps_italic\` text,
  	\`faq_title\` text,
  	\`step1\` text,
  	\`step2\` text,
  	\`step3\` text,
  	\`step1_title\` text,
  	\`step2_title\` text,
  	\`step3_title\` text,
  	\`intent_label\` text,
  	\`community_label\` text,
  	\`community_placeholder\` text,
  	\`building_label\` text,
  	\`building_hint\` text,
  	\`type_label\` text,
  	\`beds_label\` text,
  	\`size_label\` text,
  	\`price_label\` text,
  	\`price_hint\` text,
  	\`continue_cta\` text,
  	\`back_cta\` text,
  	\`submit_cta\` text,
  	\`success_title\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`sell_page_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`sell_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`sell_page_texts_order_parent\` ON \`sell_page_texts\` (\`order\`,\`parent_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`sell_page_why_points\`;`)
  await db.run(sql`DROP TABLE \`sell_page_steps\`;`)
  await db.run(sql`DROP TABLE \`sell_page_faqs\`;`)
  await db.run(sql`DROP TABLE \`sell_page\`;`)
  await db.run(sql`DROP TABLE \`sell_page_texts\`;`)
}
