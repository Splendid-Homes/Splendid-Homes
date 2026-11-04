import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`testimonials\` ADD \`image_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`testimonials\` ADD \`image_url\` text;`)
  await db.run(sql`ALTER TABLE \`testimonials\` ADD \`photo_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`testimonials\` ADD \`photo_url\` text;`)
  await db.run(sql`CREATE INDEX \`testimonials_image_idx\` ON \`testimonials\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`testimonials_photo_idx\` ON \`testimonials\` (\`photo_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_testimonials\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`role\` text NOT NULL,
  	\`text\` text NOT NULL,
  	\`kind\` text DEFAULT 'buyer' NOT NULL,
  	\`outcome\` text,
  	\`rating\` numeric DEFAULT 5,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`INSERT INTO \`__new_testimonials\`("id", "name", "role", "text", "kind", "outcome", "rating", "status", "order", "updated_at", "created_at") SELECT "id", "name", "role", "text", "kind", "outcome", "rating", "status", "order", "updated_at", "created_at" FROM \`testimonials\`;`)
  await db.run(sql`DROP TABLE \`testimonials\`;`)
  await db.run(sql`ALTER TABLE \`__new_testimonials\` RENAME TO \`testimonials\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`testimonials_updated_at_idx\` ON \`testimonials\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`testimonials_created_at_idx\` ON \`testimonials\` (\`created_at\`);`)
}
