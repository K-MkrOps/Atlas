# Deploying Atlas on minikube

## Install kubectl, Helm, Docker, and VirtualBox
If [kubectl](https://kubernetes.io/docs/tasks/tools/), [Helm](https://helm.sh/docs/intro/install/),
[Docker](https://docs.docker.com/get-docker/) and/or [VirtualBox](https://www.virtualbox.org/wiki/Downloads)
aren't already installed on your machine, install them.

You may also need to install [Docker Compose](https://docs.docker.com/compose/install/)

## Download and install minikube
Instructions can be found [here](https://minikube.sigs.k8s.io/docs/start/)

While you can follow the demo instructions there about starting minikube, deploying
some demo deployments, etc. to get a feel for it, before deploying Atlas you should delete
your minikube cluster, since we have some specific starting requirements.

## Clone this repo to your local machine
To build the Atlas Docker image locally, and to have a pre-tested way to run various local
services, you'll need to get the Atlas repo on your machine. This is most easily
done by running `git clone https://github.com:AtlasFoundation/Atlas.git`

## Start MariaDB server locally via Docker
For simplicity, we recommend running a MariaDB server on your local machine outside of minikube.
Later instructions will set up minikube so that it can access this server

If you run `docker-compose up` from the top-level `/scripts` directory in the Atlas repo, it will
start up multiple MariaDB docker images (as well as a redis server, which is not needed). One, intended
for local development, runs on port 3306; another, intended for automated testing purposes, runs on 
port 3305; and the last one, intended for minikube testing, runs on port 3304. Once the
minikube MariaDB Docker image is stopped, you can start it again by running 
`docker start atlas_minikube_db`. 

Alternatively, if you want to just run MariaDB on its own without Docker, that's fine too.
You'll just have to configure the Helm config file to have the appropriate SQL server configuration,
and possibly change the script `./scripts/build_minikube.sh`.

## Start local file server
If you're going to have the minikube deployment use a local storage provider, rather than a cloud
storage provider like AWS S3, you'll need to have the local file server running on your machine
outside of minikube.

Run `npm install` (or `yarn install` if `npm install` isn't working right;
you'd need to install yarn in that case) from the root of the Atlas repo. When that's finished,
go to packages/server and run `npm run serve-local-files`. This will start a local file server
on port 8642, and will create and serve those files from packages/server/upload.

## Create minikube cluster
Run the following command:
`minikube start --disk-size 40000m --cpus 4 --memory 10124m --addons ingress --driver virtualbox`

This says to start minikube with 40GB of disk space, 4 CPUs, 10GB of memory, using VirtualBox as its
driver, and starting up an nginx ingress service.

The disk space, CPUs, and memory allocation are configurable. These are what we recommend for optimal
running (though the disk space might be a bit more than necessary). When minikube is running,
it will reserve those resources for itself regardless of whether the services in minikube are using
that much.

The 10GB of memory might be the spec with the least wiggle room. Later instructions on building
the Docker image will have it be built in the minikube context. This uses the RAM reserved for minikube,
and the client build process normally uses about 8GB of RAM at its peak. minikube may freeze if
it gets maxed out on RAM, and the Docker build process might freeze indefinitely.

### Starting ingress after minikube has started
If you forget to use `--addons ingress` when starting minikube, you can start nginx later by
running `minikube addons enable ingress`

## Get minikube IP address and edit system hostfile to point to 
Run this command after minikube has started: `minikube ip`
This will get you the address that minikube is running on.

You'll need to edit your hostfile to point certain domains to minikube IP addresses. On Linux,
this is done by running `sudo gedit /etc/hosts`.

Add the following lines:
`<Output of 'minikube ip'>  local.atlasfoundation.io api-local.atlasfoundation.io gameserver-local.atlasfoundation.io 00000.gameserver-local.atlasfoundation.io 00001.gameserver-local.atlasfoundation.io 00002.gameserver-local.atlasfoundation.io 00003.gameserver-local.atlasfoundation.io`
`10.0.2.2   host.minikube.internal`

The first line says to point several *-local.atlasfoundation.io domains internally to the minikube cluster,
where the nginx ingress server will redirect the traffic to the appropriate pod.
The second line is used to give minikube access to your local environment, particularly so that it
can access the MariaDB server.

Make sure to save this file after you've edited it. On Linux, at least, you need root permissions
to edit it.

## Add Helm repos
You'll need to add a few Helm repos. Run the following:
`helm repo add agones https://agones.dev/chart/stable`
`helm repo add redis https://charts.bitnami.com/bitnami`
`helm repo add atlas https://helm.atlasfoundation.io`

This will add the Helm charts for Agones, redis, and Atlas, respectively.

## Install Agones and redis deployments
After adding those Helm repos, you'll start installing deployments using Helm repos.

Make sure that kubectl is pointed at minikube by running `kubectl config current-context`,
which should say 'minikube'. You can also run `kubectl config get-contexts` to get all contexts
that kubectl has been configured to run; the current one will have a '*' under the left-most
'current' column.

Once kubectl is pointed to minikube, from the top of the Atlas repo, run
`helm install -f packages/ops/configs/agones-default-values.yaml agones agones/agones` to install Agones
and `helm install local-redis redis/redis` to install redis.

You can run `kubectl get pods -A` to list all of the pods running in minikube. After a minute or so,
all of these pods should be in the Running state.

## Run build_minikube.sh
When minikube is running, run the following command from the root of the Atlas repo:
`./scripts/build_minikube.sh`

This points Docker *in the current terminal* to minikube's Docker environment. Anything that Docker builds
will be locally accessible to minikube; if the first main command in the script were not run, Docker would build to your
machine's Docker environment, and minikube would not have access to it.

The script also builds the full-repo Docker image using several build arguments. Vite, which builds
the client files, uses some information from the MariaDB database created for minikube deployments
to fill in some variables, and needs database credentials. The script will supply default values
for all of the MYSQL_* variables if they are not provided to the script, as well as VITE_CLIENT_HOST,
VITE_SERVER_HOST, and VITE_GAMESERVER_HOST. The latter three will make your minikube deployment
accessible on `(local/api-local/gameserver-local).atlasfoundation.io`; if you want to run it on a different
domain, then you'll have to set those three environment variables to what you want them to be (and also
change the hostfile records you made pointing those subdomains to minikube's IP)

This will build an image of the entire Atlas repo into a single Docker file. When deployed for
different services, it will only run the parts needed for that service. This may take up to 15 minutes,
though later builds should take less time as things are cached.

## Deploy Atlas Helm chart
Run the following command: `helm install -f </path/to/local.values.yaml> --set api.extraEnv.FORCE_DB_REFRESH=true local atlas/atlas`.
This will use a Helm config file titled 'local.values.yaml' to configure the deployment. There is
a [template](../packages/ops/configs/local.template.values.yaml) for this file in packages/ops/configs

After a minute or so, running `kubectl get pods` should show one or more gameservers, one or more api
servers, and one client server in the Running state. Setting `FORCE_DB_REFRESH=true` made the api servers
(re)initialize the database. Since you don't want that to happen every time a new api pod starts, run
`helm upgrade --reuse-values --set api.extraEnv.FORCE_DB_REFRESH=false local atlas/atlas`.
The API pods will restart and will now not attempt to reinit the database on boot.

## Accept invalid certs
Since there are no valid certificates for this domain, you'll have to tell your browser to ignore the
insecure connections when you try to load the application.

Go to https://local.atlasfoundation.io/login You should see a warning about an invalid certificate; accept this
invalid cert to get to the login page. You'll next have to open the dev tools for your browser and go to
the console and/or Network tab. There should be errors on https://api-local.atlasfoundation.io; open that link
in a new tab and accept the invalid certificate for that, too.

When you go to https://local.atlasfoundation.io/location/default, you'll have to open the console again, find the
erroring https://gameserver-local.atlasfoundation.io, open that link in a new tab, and accept the invalid certificate
for that domain, as well.
