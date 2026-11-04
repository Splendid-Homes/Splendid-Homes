import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`insights_pages_categories\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`intro\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`insights_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`insights_pages_categories_order_idx\` ON \`insights_pages_categories\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`insights_pages_categories_parent_id_idx\` ON \`insights_pages_categories\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`insights_pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`all_label\` text,
  	\`featured\` text DEFAULT 'newest',
  	\`featured_post_id\` integer,
  	\`per_page\` numeric,
  	\`prev_label\` text,
  	\`next_label\` text,
  	\`read_more\` text,
  	\`min_read\` text,
  	\`empty_text\` text,
  	\`nl_show\` integer DEFAULT true,
  	\`nl_on_articles\` integer DEFAULT false,
  	\`nl_title\` text,
  	\`nl_text\` text,
  	\`published\` text,
  	\`updated\` text,
  	\`in_short\` text,
  	\`takeaways\` text,
  	\`steps\` text,
  	\`faq_title\` text,
  	\`compared\` text,
  	\`compared_caption\` text,
  	\`sources\` text,
  	\`sources_note\` text,
  	\`about_author\` text,
  	\`view_profile\` text,
  	\`form_show\` integer DEFAULT true,
  	\`form_title\` text,
  	\`form_cta\` text,
  	\`form_message\` text,
  	\`related_eyebrow\` text,
  	\`related_title\` text,
  	\`related_italic\` text,
  	\`related_all\` text,
  	\`related_count\` numeric,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`featured_post_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`insights_pages_featured_post_idx\` ON \`insights_pages\` (\`featured_post_id\`);`)
  await db.run(sql`CREATE TABLE \`insights_pages_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`insights_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`insights_pages_texts_order_parent\` ON \`insights_pages_texts\` (\`order\`,\`parent_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`insights_pages_categories\`;`)
  await db.run(sql`DROP TABLE \`insights_pages\`;`)
  await db.run(sql`DROP TABLE \`insights_pages_texts\`;`)
}
