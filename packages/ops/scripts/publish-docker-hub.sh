
set -e
# before you run this you need to run 
# $ source .atlas-secrets to load tokens and passwords

cd ../client

git fetch --tags
TAG="$(git describe --abbrev=0 --tags)"

cd ../ops

export NEW_TAG=rc0.0.5
docker-compose -f docker-compose-local.yml build
docker login --username atlas --password ${DOCKER_HUB_PASSWORD}

for repo in {client,server,realtime-server}; do
    for tag in {$TAG,latest}; do
        docker tag atlas/${repo} atlas/${repo}:${tag}
        docker push atlas/${repo}:${tag}
    done
done 