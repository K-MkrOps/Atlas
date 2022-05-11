set -x

RELEASE=$1

helm repo update

helm upgrade --install $RELEASE atlas/atlas --values values/$RELEASE.values.yaml
