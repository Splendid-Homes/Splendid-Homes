import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`communities_list_life_filters\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`want\` text NOT NULL,
  	\`label\` text NOT NULL,
  	\`limit\` numeric,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`communities_list\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`communities_list_life_filters_order_idx\` ON \`communities_list_life_filters\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`communities_list_life_filters_parent_id_idx\` ON \`communities_list_life_filters\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`communities_list_card_figures\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`communities_list\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`communities_list_card_figures_order_idx\` ON \`communities_list_card_figures\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`communities_list_card_figures_parent_idx\` ON \`communities_list_card_figures\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`communities_list\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`all_areas\` text,
  	\`show_card_chips\` integer DEFAULT true,
  	\`rank_by\` text DEFAULT 'yield',
  	\`list_compare_eyebrow\` text,
  	\`list_compare_title\` text,
  	\`list_compare_italic\` text,
  	\`list_compare_intro\` text,
  	\`col_community\` text,
  	\`col_price\` text,
  	\`col_rent\` text,
  	\`col_yield\` text,
  	\`col_listings\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`communities_list_life_filters\`;`)
  await db.run(sql`DROP TABLE \`communities_list_card_figures\`;`)
  await db.run(sql`DROP TABLE \`communities_list\`;`)
}
