CREATE USER :POSTGRES_USER WITH PASSWORD ':POSTGRES_PASSWORD';

CREATE DATABASE :POSTGRES_DB;

\c :POSTGRES_DB

GRANT ALL ON SCHEMA public TO :POSTGRES_USER;
GRANT ALL PRIVILEGES ON DATABASE :POSTGRES_DB TO :POSTGRES_USER;
GRANT ALL ON ALL TABLES IN SCHEMA public TO :POSTGRES_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO :POSTGRES_USER;

ALTER DATABASE :POSTGRES_DB OWNER TO :POSTGRES_USER;