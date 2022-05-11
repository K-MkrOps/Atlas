# atlas-ops

Deployment and Operations for atlas services

## One-Click Deployment on Kubernetes using Helm

You can run the whole platfrom with the following commands:

``` bash
helm repo add atlas https://helm.atlasfoundation.io
helm repo update
helm install my-release atlas/atlas
```

For more details about the Atlas chart

- [Atlas helm chart](atlas/)
- [Building the atlas helm chart](docs/release-helm-chart.md)

For deployment on different cloud providers:

- [Deploying Atlas on AWS EKS](docs/deploy_on_eks.md)
- [Managing Remote Kubernets Clusters - TBD](docs/managing_remote_kubernets.md)

Requires Helm and access to a Kubernetes cluster, if you are new to those, check the following instructions:

- [Installing Helm v3](https://www.digitalocean.com/community/tutorials/how-to-install-software-on-kubernetes-clusters-with-the-helm-3-package-manager)
- [Installing Kubernetes Locally - microk8s](https://ubuntu.com/tutorials/install-a-local-kubernetes-with-microk8s#2-deploying-microk8s)
- [Installing Kubernetes Locally - MiniKube](https://minikube.sigs.k8s.io/docs/start/)
- [Helper Scripts](scripts/) contains useful scripts to speedup preparing your machine with Docker, Helm, k8s, etc.

## One-Click Deployment on your laptop Docker Compose

You can run the whole platfrom with the following commands:

``` bash
git clone git@github.com:atlas/xrsocial-ops.git
cd xrsocial-ops
docker-compose up
```

To run specific services

``` bash
docker-compose up <service-name>
```

This will pull images from [atlas's docker hub repo](https://hub.docker.com/u/atlas)

## Atlas services

- [server](https://github.com/AtlasFoundation/xrsocial): backend server on <http://127.0.0.1:3030/docs>
- [client](https://github.com/AtlasFoundation/xrsocial-client): frontend Next.js+react on <http://127.0.0.1:3000>
- adminer: a lightweight web app to manage database, <http://127.0.0.1:8080/?server=db&username=server&db=atlas>  (Note: password is "password")
- db: MariaDB on default port [mysql://127.0.0.1:3306]()

## Build docker/compose stack yourself

If you want to build the whole compose stack on your machine, and not pull the containers from docker-hub

- install [docker](https://docs.docker.com/get-docker/).
- clone the 5 repos into the same folder with the same names:

    ``` txt
    |
    +-- xrsocial-client
    +-- xrsocial
    +-- xrsocial-ops
    +-- Editor
    ```

- `cd xrsocial-ops`
- run `docker-compose -f docker-compose-local.yml build`
- run `docker-compose -f docker-compose-local.yml up`
- all services will be running as detailed in [service](Services) section.

## Build the Helm Chart yourself
