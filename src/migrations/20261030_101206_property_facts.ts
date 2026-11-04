import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`property_page_key_facts\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`property_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`property_page_key_facts_order_idx\` ON \`property_page_key_facts\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`property_page_key_facts_parent_idx\` ON \`property_page_key_facts\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`property_page_detail_rows\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`fact\` text NOT NULL,
  	\`label\` text,
  	\`show\` integer DEFAULT true,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`property_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`property_page_detail_rows_order_idx\` ON \`property_page_detail_rows\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`property_page_detail_rows_parent_id_idx\` ON \`property_page_detail_rows\` (\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`property_page\` ADD \`reg_permit\` text;`)
  await db.run(sql`ALTER TABLE \`property_page\` ADD \`reg_ref\` text;`)
  await db.run(sql`ALTER TABLE \`property_page\` ADD \`reg_brn\` text;`)
  await db.run(sql`ALTER TABLE \`property_page\` ADD \`reg_orn\` text;`)
  await db.run(sql`ALTER TABLE \`property_page\` ADD \`rent_payment\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`property_page_key_facts\`;`)
  await db.run(sql`DROP TABLE \`property_page_detail_rows\`;`)
  await db.run(sql`ALTER TABLE \`property_page\` DROP COLUMN \`reg_permit\`;`)
  await db.run(sql`ALTER TABLE \`property_page\` DROP COLUMN \`reg_ref\`;`)
  await db.run(sql`ALTER TABLE \`property_page\` DROP COLUMN \`reg_brn\`;`)
  await db.run(sql`ALTER TABLE \`property_page\` DROP COLUMN \`reg_orn\`;`)
  await db.run(sql`ALTER TABLE \`property_page\` DROP COLUMN \`rent_payment\`;`)
}
