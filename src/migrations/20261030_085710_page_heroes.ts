import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`settings_page_heroes\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`page\` text NOT NULL,
  	\`eyebrow\` text,
  	\`title\` text,
  	\`title_italic\` text,
  	\`sub\` text,
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`settings_page_heroes_order_idx\` ON \`settings_page_heroes\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`settings_page_heroes_parent_id_idx\` ON \`settings_page_heroes\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`settings_page_heroes_image_idx\` ON \`settings_page_heroes\` (\`image_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`settings_page_heroes\`;`)
}
