-- ./docker/init.sql
CREATE DATABASE keycloak_db;
CREATE DATABASE app_db;


GRANT ALL PRIVILEGES ON DATABASE keycloak_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE app_db TO postgres;