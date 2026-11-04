import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`listing_pages_numbers\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`number\` numeric,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`listing_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`listing_pages_numbers_order_parent_idx\` ON \`listing_pages_numbers\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`ALTER TABLE \`listing_pages\` ADD \`page_size\` numeric DEFAULT 12;`)
  await db.run(sql`ALTER TABLE \`listing_pages\` ADD \`buy_sort\` text DEFAULT 'featured';`)
  await db.run(sql`ALTER TABLE \`listing_pages\` ADD \`rent_sort\` text DEFAULT 'featured';`)
  await db.run(sql`ALTER TABLE \`listing_pages\` ADD \`callback_cta\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`listing_pages_numbers\`;`)
  await db.run(sql`ALTER TABLE \`listing_pages\` DROP COLUMN \`page_size\`;`)
  await db.run(sql`ALTER TABLE \`listing_pages\` DROP COLUMN \`buy_sort\`;`)
  await db.run(sql`ALTER TABLE \`listing_pages\` DROP COLUMN \`rent_sort\`;`)
  await db.run(sql`ALTER TABLE \`listing_pages\` DROP COLUMN \`callback_cta\`;`)
}
