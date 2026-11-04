import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`menus_main_nav\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`href\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`menus\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`menus_main_nav_order_idx\` ON \`menus_main_nav\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`menus_main_nav_parent_id_idx\` ON \`menus_main_nav\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`menus_more_cols_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`href\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`menus_more_cols\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`menus_more_cols_links_order_idx\` ON \`menus_more_cols_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`menus_more_cols_links_parent_id_idx\` ON \`menus_more_cols_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`menus_more_cols\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`icon\` text DEFAULT 'key',
  	\`source\` text DEFAULT 'links',
  	\`all_label\` text,
  	\`all_href\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`menus\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`menus_more_cols_order_idx\` ON \`menus_more_cols\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`menus_more_cols_parent_id_idx\` ON \`menus_more_cols\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`menus_mobile_extra\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`href\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`menus\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`menus_mobile_extra_order_idx\` ON \`menus_mobile_extra\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`menus_mobile_extra_parent_id_idx\` ON \`menus_mobile_extra\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`menus_footer_cols_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`href\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`menus_footer_cols\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`menus_footer_cols_links_order_idx\` ON \`menus_footer_cols_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`menus_footer_cols_links_parent_id_idx\` ON \`menus_footer_cols_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`menus_footer_cols\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`menus\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`menus_footer_cols_order_idx\` ON \`menus_footer_cols\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`menus_footer_cols_parent_id_idx\` ON \`menus_footer_cols\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`menus_ways\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`note\` text,
  	\`href\` text NOT NULL,
  	\`icon\` text DEFAULT 'phone',
  	\`tone\` text DEFAULT 'forest',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`menus\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`menus_ways_order_idx\` ON \`menus_ways\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`menus_ways_parent_id_idx\` ON \`menus_ways\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`menus\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`cta_label\` text,
  	\`cta_href\` text,
  	\`more_label\` text,
  	\`help_bold\` text,
  	\`help_text\` text,
  	\`directions\` text,
  	\`call_label\` text,
  	\`email_label\` text,
  	\`cta_title\` text,
  	\`cta_italic\` text,
  	\`cta_open\` text,
  	\`cta_closed\` text,
  	\`cta_default\` text,
  	\`cta_trust\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`menus_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`menus\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`menus_texts_order_parent\` ON \`menus_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`page_seo\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`home_title\` text,
  	\`home_description\` text,
  	\`buy_title\` text,
  	\`buy_description\` text,
  	\`rent_title\` text,
  	\`rent_description\` text,
  	\`off_plan_title\` text,
  	\`off_plan_description\` text,
  	\`commercial_title\` text,
  	\`commercial_description\` text,
  	\`communities_title\` text,
  	\`communities_description\` text,
  	\`developers_title\` text,
  	\`developers_description\` text,
  	\`sell_title\` text,
  	\`sell_description\` text,
  	\`services_title\` text,
  	\`services_description\` text,
  	\`mortgage_title\` text,
  	\`mortgage_description\` text,
  	\`insights_title\` text,
  	\`insights_description\` text,
  	\`about_title\` text,
  	\`about_description\` text,
  	\`team_title\` text,
  	\`team_description\` text,
  	\`careers_title\` text,
  	\`careers_description\` text,
  	\`contact_title\` text,
  	\`contact_description\` text,
  	\`compare_title\` text,
  	\`compare_description\` text,
  	\`saved_title\` text,
  	\`saved_description\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`menus_main_nav\`;`)
  await db.run(sql`DROP TABLE \`menus_more_cols_links\`;`)
  await db.run(sql`DROP TABLE \`menus_more_cols\`;`)
  await db.run(sql`DROP TABLE \`menus_mobile_extra\`;`)
  await db.run(sql`DROP TABLE \`menus_footer_cols_links\`;`)
  await db.run(sql`DROP TABLE \`menus_footer_cols\`;`)
  await db.run(sql`DROP TABLE \`menus_ways\`;`)
  await db.run(sql`DROP TABLE \`menus\`;`)
  await db.run(sql`DROP TABLE \`menus_texts\`;`)
  await db.run(sql`DROP TABLE \`page_seo\`;`)
}
