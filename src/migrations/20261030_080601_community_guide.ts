import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`communities_guide_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`heading\` text NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`communities_guide\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`communities_guide_items_order_idx\` ON \`communities_guide_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`communities_guide_items_parent_id_idx\` ON \`communities_guide_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`communities_guide\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`communities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`communities_guide_order_idx\` ON \`communities_guide\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`communities_guide_parent_id_idx\` ON \`communities_guide\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`communities_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`communities_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`communities\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`communities_id\`) REFERENCES \`communities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`communities_rels_order_idx\` ON \`communities_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`communities_rels_parent_idx\` ON \`communities_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`communities_rels_path_idx\` ON \`communities_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`communities_rels_communities_id_idx\` ON \`communities_rels\` (\`communities_id\`);`)
  await db.run(sql`ALTER TABLE \`communities\` ADD \`intro\` text;`)
  await db.run(sql`ALTER TABLE \`communities\` ADD \`suits\` text;`)
  await db.run(sql`ALTER TABLE \`communities\` ADD \`not_for\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`communities_guide_items\`;`)
  await db.run(sql`DROP TABLE \`communities_guide\`;`)
  await db.run(sql`DROP TABLE \`communities_rels\`;`)
  await db.run(sql`ALTER TABLE \`communities\` DROP COLUMN \`intro\`;`)
  await db.run(sql`ALTER TABLE \`communities\` DROP COLUMN \`suits\`;`)
  await db.run(sql`ALTER TABLE \`communities\` DROP COLUMN \`not_for\`;`)
}
