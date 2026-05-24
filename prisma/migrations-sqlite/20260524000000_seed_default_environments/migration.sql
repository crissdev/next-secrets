INSERT INTO "environments" ("id", "name", "description", "createdAt", "updatedAt")
VALUES
  ('bbfd5e06-d229-4df2-8816-0702352ee62d', 'Development', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('e0244050-597a-4fe2-a201-af0ed54906bc', 'Staging', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('a777c2bf-1900-447f-bd8b-3403dc865cc4', 'Production', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO UPDATE SET
  "id" = excluded."id",
  "description" = excluded."description",
  "updatedAt" = CURRENT_TIMESTAMP;
