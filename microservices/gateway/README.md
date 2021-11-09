Gateway
-------------------

RPC 2.0 Microservice. This is a single entry point for all clients.

![Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FLomray-Software%2Fmicroservices%2Fstaging%2Fmicroservices%2Fgateway%2Fpackage.json&label=Staging%20version&query=$.version&colorB=blue)  
![GitHub](https://img.shields.io/github/license/Lomray-Software/microservices)
![GitHub package.json dependency version (dev dep on branch)](https://img.shields.io/github/package-json/dependency-version/Lomray-Software/microservices/dev/typescript/staging)

[![Quality Gate Status](https://sonarqube-proxy.lomray.com/status/microservices-gateway?token=cdc3d50e659b50ce3d57cbc000cd8623)](https://sonarqube.lomray.com/dashboard?id=microservices-gateway)
[![Reliability Rating](https://sonarqube-proxy.lomray.com/reliability/microservices-gateway?token=cdc3d50e659b50ce3d57cbc000cd8623)](https://sonarqube.lomray.com/dashboard?id=microservices-gateway)
[![Security Rating](https://sonarqube-proxy.lomray.com/security/microservices-gateway?token=cdc3d50e659b50ce3d57cbc000cd8623)](https://sonarqube.lomray.com/dashboard?id=microservices-gateway)
[![Vulnerabilities](https://sonarqube-proxy.lomray.com/vulnerabilities/microservices-gateway?token=cdc3d50e659b50ce3d57cbc000cd8623)](https://sonarqube.lomray.com/dashboard?id=microservices-gateway)
[![Lines of code](https://sonarqube-proxy.lomray.com/lines/microservices-gateway?token=cdc3d50e659b50ce3d57cbc000cd8623)](https://sonarqube.lomray.com/dashboard?id=microservices-gateway)
[![Coverage](https://sonarqube-proxy.lomray.com/coverage/microservices-gateway?token=cdc3d50e659b50ce3d57cbc000cd8623)](https://sonarqube.lomray.com/dashboard?id=microservices-gateway)

## Navigation
- [ENVIRONMENTS](#environments)
- [HOW TO DEVELOP](#how-to-develop)

### <a id="environments"></a>ENVIRONMENTS:
- `MS_CONNECTION` - Invert json host and port (with protocol). Default: `http://127.0.0.1:8001`
- `MS_NAME` - Microservice name. Default: `gateway`
- `MS_DISABLE_REMOTE_MIDDLEWARE` - Disable remote middleware feature. Default: `0`

### <a id="how-to-develop"></a>HOW TO DEVELOP:
1. Run `Inverted Json` job server.
```bash
docker run -it -p 8001:8001 lega911/ijson --log 47
```
2. Run microservice
```
npm run start:dev
```
3. That is all. **Don't forget install npm dependencies**
   (in root folder & local folder run:  `npm ci`)
