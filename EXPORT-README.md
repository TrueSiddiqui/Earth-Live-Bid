# Global Bid System source export

This archive contains the current managed app source and local assets. The app source is in nextjs_space/. It is an independent export, not a repository connection or automatic synchronization.

## GitHub upload
Extract the ZIP on your computer. Upload the extracted folders and files to your repository, not the ZIP itself. Keep the folder structure and hidden .gitignore and .env.example files.

## Exclusions and safety
Real environment configuration, platform-private metadata, Git history, installed dependencies, generated build caches, logs, and runtime uploads are omitted. Database records and cloud-stored documents are not included. Literal credentials found in source scripts were replaced with <REPLACE_WITH_YOUR_OWN_SECRET>. Replace these locally with environment-variable based configuration before running the scripts, and never publish real credentials. Dependency manifest and lockfile links were materialized as normal files.

## Running independently
This is a source snapshot, not a tested standalone migration. Configure a separate database and private storage; do not reuse the managed app's live data credentials. See nextjs_space/.env.example for configuration names. The export's package-manager cache configuration is portable, but the database client generator still retains its original machine-specific output path and application configuration still contains managed-environment settings; review these before an independent build. No seed, migration, external build, deployment, or GitHub commit was performed for this export.

EXPORT-MANIFEST.json records source-file hashes, export-file hashes, exclusions, and files sanitized only in this copy.
