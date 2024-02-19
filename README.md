# microservices-nodejs-kubernetes

Basic demo of a microservices architecture in Node.js in a kubernetes containerized environment. Uses: Kubernetes, Kong, Nginx, Node.js, MySQL.

| Route              |      Description      |
|:-------------------|:----------------------|
| /                  | connects to the frontend NGINX server |
| /api               | homepage of api, shows which backend service is handling that request |
| /api/wilayas       | list of algerian states |
| /api/wilayas/<id>  | information about state number 'id' |

## Quick Start

### Requirements

- Ensure Docker Desktop is installed and "Use Kubernetes" is ticked.
- Ensure Kubectl is installed (Note: It is not included in Docker desktop on linux).

### Build & push Docker containers

Build the docker containers and push them to your own docker-hub using a small handy bash script such as:

```bash
for dir in */; do
    service=${dir%/}  # Remove trailing slash
    echo "Building service '$service'"
    cd $dir
    docker build -t $service .
    docker tag $service abdou1307/$service
    docker push abdou1307/$service
    cd ..
done
```

**Note:** make sure you update the kubernetes yaml files to use your own docker images.

### Deploy Kong Ingress Controller (API Gateway)

```bash
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.0.0/standard-install.yaml
helm repo add kong https://charts.konghq.com
helm repo update
helm install kong kong/ingress -n kong --create-namespace
```

### Deploy microservices

```bash
kubectl apply -f .kubernetes
```

### Shut everything down

```bash
kubectl delete -f .kubernetes
kubectl delete all --all -n kong # to remove all services deployed by kong
helm uninstall kong kong/ingress -n kong # to uninstall kong
```

## Explanation

- Each microservice has a single .yaml config file containing both a **Service** and a **Deployment** object.
  - **Service:** its type being ClusterIP, it auto creates an internal load balancing between replicas of that service.
  - **Deployment:** describes the desired state, ie.how the system should keep the microservice running.
- **api-gateway.yaml** defines the routes for our api-gateway in yaml language.
- Communication in-between services is ensured via Kubernetes built-in dns resolution. That is why the backend can communicate with the database by using hostname '**database**'

## Future changes

As it is right now, the database cannot be scaled up or there will be a risk of data inconsistancy.

In the future, I hope to update this example by using a **StatefulSet** instead of a **Deployment** object aswell as implementing some data syncing mechanic.
