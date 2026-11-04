import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`developers_faqs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`q\` text NOT NULL,
  	\`a\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`developers\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`developers_faqs_order_idx\` ON \`developers_faqs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`developers_faqs_parent_id_idx\` ON \`developers_faqs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`developer_pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`list_order\` text DEFAULT 'manual',
  	\`show_logos\` integer DEFAULT false,
  	\`card_line\` text,
  	\`hero_eyebrow\` text,
  	\`about_eyebrow\` text,
  	\`about_title\` text,
  	\`fact_founded\` text,
  	\`fact_delivered\` text,
  	\`fact_launches\` text,
  	\`fact_ready\` text,
  	\`known_for_label\` text,
  	\`website_cta\` text,
  	\`projects_eyebrow\` text,
  	\`projects_title\` text,
  	\`projects_link\` text,
  	\`empty_text\` text,
  	\`empty_link\` text,
  	\`resale_eyebrow\` text,
  	\`resale_italic\` text,
  	\`faq_title\` text,
  	\`show_facts\` integer DEFAULT true,
  	\`show_known_for\` integer DEFAULT true,
  	\`show_resale\` integer DEFAULT true,
  	\`resale_count\` numeric DEFAULT 6,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`ALTER TABLE \`developers\` ADD \`hero_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`developers\` ADD \`website\` text;`)
  await db.run(sql`ALTER TABLE \`developers\` ADD \`order\` numeric DEFAULT 0;`)
  await db.run(sql`CREATE INDEX \`developers_hero_image_idx\` ON \`developers\` (\`hero_image_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Hand-written: the generated version rebuilt `developers` (copy, DROP, rename), which on D1 cascades to its
  // child rows and links. hero_image_id is left in place: SQLite cannot drop a column with a foreign key.
  await db.run(sql`DROP TABLE \`developers_faqs\`;`)
  await db.run(sql`DROP TABLE \`developer_pages\`;`)
  await db.run(sql`ALTER TABLE \`developers\` DROP COLUMN \`website\`;`)
  await db.run(sql`ALTER TABLE \`developers\` DROP COLUMN \`order\`;`)
}
