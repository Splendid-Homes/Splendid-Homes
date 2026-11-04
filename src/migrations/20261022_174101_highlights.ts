import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`projects_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`highlights_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`highlights_id\`) REFERENCES \`highlights\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_rels_order_idx\` ON \`projects_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_parent_idx\` ON \`projects_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_path_idx\` ON \`projects_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_highlights_id_idx\` ON \`projects_rels\` (\`highlights_id\`);`)
  await db.run(sql`CREATE TABLE \`highlights\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`short\` text,
  	\`icon\` text DEFAULT 'check' NOT NULL,
  	\`desc\` text,
  	\`rule\` text DEFAULT 'none',
  	\`min_price\` numeric,
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`highlights_updated_at_idx\` ON \`highlights\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`highlights_created_at_idx\` ON \`highlights\` (\`created_at\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`highlights_id\` integer REFERENCES highlights(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_highlights_id_idx\` ON \`payload_locked_documents_rels\` (\`highlights_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`projects_rels\`;`)
  await db.run(sql`DROP TABLE \`highlights\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`leads_id\` integer,
  	\`resumes_id\` integer,
  	\`properties_id\` integer,
  	\`projects_id\` integer,
  	\`communities_id\` integer,
  	\`developers_id\` integer,
  	\`agents_id\` integer,
  	\`posts_id\` integer,
  	\`testimonials_id\` integer,
  	\`services_id\` integer,
  	\`careers_id\` integer,
  	\`media_id\` integer,
  	\`users_id\` integer,
  	\`activity_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`leads_id\`) REFERENCES \`leads\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`resumes_id\`) REFERENCES \`resumes\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`properties_id\`) REFERENCES \`properties\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`communities_id\`) REFERENCES \`communities\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`developers_id\`) REFERENCES \`developers\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`agents_id\`) REFERENCES \`agents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`testimonials_id\`) REFERENCES \`testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`services_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`careers_id\`) REFERENCES \`careers\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`activity_id\`) REFERENCES \`activity\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "leads_id", "resumes_id", "properties_id", "projects_id", "communities_id", "developers_id", "agents_id", "posts_id", "testimonials_id", "services_id", "careers_id", "media_id", "users_id", "activity_id") SELECT "id", "order", "parent_id", "path", "leads_id", "resumes_id", "properties_id", "projects_id", "communities_id", "developers_id", "agents_id", "posts_id", "testimonials_id", "services_id", "careers_id", "media_id", "users_id", "activity_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_leads_id_idx\` ON \`payload_locked_documents_rels\` (\`leads_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_resumes_id_idx\` ON \`payload_locked_documents_rels\` (\`resumes_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_properties_id_idx\` ON \`payload_locked_documents_rels\` (\`properties_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_projects_id_idx\` ON \`payload_locked_documents_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_communities_id_idx\` ON \`payload_locked_documents_rels\` (\`communities_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_developers_id_idx\` ON \`payload_locked_documents_rels\` (\`developers_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_agents_id_idx\` ON \`payload_locked_documents_rels\` (\`agents_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_testimonials_id_idx\` ON \`payload_locked_documents_rels\` (\`testimonials_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_services_id_idx\` ON \`payload_locked_documents_rels\` (\`services_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_careers_id_idx\` ON \`payload_locked_documents_rels\` (\`careers_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_activity_id_idx\` ON \`payload_locked_documents_rels\` (\`activity_id\`);`)
}
