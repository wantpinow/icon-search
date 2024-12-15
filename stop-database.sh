# load the environment variables
set -a
source .env.local

# delete the database container (also deletes the data)
docker rm -f $DATABASE_NAME-postgres