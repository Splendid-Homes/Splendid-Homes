import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`settings_home_sections\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`section\` text NOT NULL,
  	\`show\` integer DEFAULT true,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`title_italic\` text,
  	\`title_end\` text,
  	\`intro\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`settings_home_sections_order_idx\` ON \`settings_home_sections\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`settings_home_sections_parent_id_idx\` ON \`settings_home_sections\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`settings_budget_bands\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`min\` numeric,
  	\`max\` numeric,
  	\`icon\` text DEFAULT 'home',
  	\`blurb\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`settings_budget_bands_order_idx\` ON \`settings_budget_bands\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`settings_budget_bands_parent_id_idx\` ON \`settings_budget_bands\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`settings_finder_wants\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`want\` text NOT NULL,
  	\`label\` text NOT NULL,
  	\`limit\` numeric,
  	\`start_on\` integer,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`settings_finder_wants_order_idx\` ON \`settings_finder_wants\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`settings_finder_wants_parent_id_idx\` ON \`settings_finder_wants\` (\`_parent_id\`);`)
  // Plain column additions. The generated version rebuilt `settings` (copy, DROP, rename); on D1, PRAGMA foreign_keys=OFF
  // is ignored, so the DROP cascaded and wiped every settings_* list (why rows, rates, page heroes…).
  await db.run(sql`ALTER TABLE \`settings\` ADD \`hero_cards_badge\` text;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`hero_cards_show_market\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`hero_cards_show_experts\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`hero_cards_price_value\` text;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`hero_cards_price_label\` text;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`hero_cards_yield_value\` text;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`hero_cards_yield_label\` text;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`hero_cards_experts_title\` text;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`hero_cards_experts_status\` text;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`show_launches\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`launches_blurb\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`settings_home_sections\`;`)
  await db.run(sql`DROP TABLE \`settings_budget_bands\`;`)
  await db.run(sql`DROP TABLE \`settings_finder_wants\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`hero_cards_badge\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`hero_cards_show_market\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`hero_cards_show_experts\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`hero_cards_price_value\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`hero_cards_price_label\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`hero_cards_yield_value\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`hero_cards_yield_label\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`hero_cards_experts_title\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`hero_cards_experts_status\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`show_launches\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`launches_blurb\`;`)
}
