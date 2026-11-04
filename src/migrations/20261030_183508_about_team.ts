import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`about_team_values\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`icon\` text DEFAULT 'star',
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_team\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_team_values_order_idx\` ON \`about_team_values\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_team_values_parent_id_idx\` ON \`about_team_values\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`about_team\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`story_eyebrow\` text,
  	\`story_title\` text,
  	\`story_italic\` text,
  	\`story_text1\` text,
  	\`story_text2\` text,
  	\`story_image_id\` integer,
  	\`show_stats\` integer DEFAULT true,
  	\`values_title\` text,
  	\`values_italic\` text,
  	\`lead_eyebrow\` text,
  	\`lead_title\` text,
  	\`lead_italic\` text,
  	\`lead_link\` text,
  	\`all_languages\` text,
  	\`card_whatsapp\` text,
  	\`card_message\` text,
  	\`label_brn\` text,
  	\`label_languages\` text,
  	\`label_areas\` text,
  	\`label_deals\` text,
  	\`show_deals\` integer DEFAULT true,
  	\`wa_to\` text DEFAULT 'company',
  	\`profile_whatsapp\` text,
  	\`profile_email\` text,
  	\`listings_eyebrow\` text,
  	\`listings_title\` text,
  	\`listings_italic\` text,
  	\`articles_eyebrow\` text,
  	\`articles_title\` text,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`story_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`about_team_story_image_idx\` ON \`about_team\` (\`story_image_id\`);`)
  await db.run(sql`CREATE TABLE \`about_team_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`agents_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`about_team\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`agents_id\`) REFERENCES \`agents\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_team_rels_order_idx\` ON \`about_team_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`about_team_rels_parent_idx\` ON \`about_team_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_team_rels_path_idx\` ON \`about_team_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`about_team_rels_agents_id_idx\` ON \`about_team_rels\` (\`agents_id\`);`)
  await db.run(sql`ALTER TABLE \`agents\` ADD \`linkedin\` text;`)
  await db.run(sql`ALTER TABLE \`agents\` ADD \`instagram\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`about_team_values\`;`)
  await db.run(sql`DROP TABLE \`about_team\`;`)
  await db.run(sql`DROP TABLE \`about_team_rels\`;`)
  await db.run(sql`ALTER TABLE \`agents\` DROP COLUMN \`linkedin\`;`)
  await db.run(sql`ALTER TABLE \`agents\` DROP COLUMN \`instagram\`;`)
}
