configuration
-------------------

RPC 2.0 Microservice.   
This microservice provides configuration for all other microservices. Single point for store configurations of microservices.

![Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FLomray-Software%2Fmicroservices%2Fstaging%2Fmicroservices%2Fconfiguration%2Fpackage.json&label=Staging%20version&query=$.version&colorB=blue)  
![GitHub](https://img.shields.io/github/license/Lomray-Software/microservices)
![GitHub package.json dependency version (dev dep on branch)](https://img.shields.io/github/package-json/dependency-version/Lomray-Software/microservices/dev/typescript/staging)

[![Quality Gate Status](https://sonarqube-proxy.lomray.com/status/microservices-configuration?token=bc1f8fe2de3b8e8fb2a9caee93661e22)](https://sonarqube.lomray.com/dashboard?id=microservices-configuration)
[![Reliability Rating](https://sonarqube-proxy.lomray.com/reliability/microservices-configuration?token=bc1f8fe2de3b8e8fb2a9caee93661e22)](https://sonarqube.lomray.com/dashboard?id=microservices-configuration)
[![Security Rating](https://sonarqube-proxy.lomray.com/security/microservices-configuration?token=bc1f8fe2de3b8e8fb2a9caee93661e22)](https://sonarqube.lomray.com/dashboard?id=microservices-configuration)
[![Vulnerabilities](https://sonarqube-proxy.lomray.com/vulnerabilities/microservices-configuration?token=bc1f8fe2de3b8e8fb2a9caee93661e22)](https://sonarqube.lomray.com/dashboard?id=microservices-configuration)
[![Lines of code](https://sonarqube-proxy.lomray.com/lines/microservices-configuration?token=bc1f8fe2de3b8e8fb2a9caee93661e22)](https://sonarqube.lomray.com/dashboard?id=microservices-configuration)
[![Coverage](https://sonarqube-proxy.lomray.com/coverage/microservices-configuration?token=bc1f8fe2de3b8e8fb2a9caee93661e22)](https://sonarqube.lomray.com/dashboard?id=microservices-configuration)

## Navigation
- [ENVIRONMENTS](#environments)
- [HOW TO DEVELOP](#how-to-develop)

### <a id="environments"></a>ENVIRONMENTS:
- `NODE_ENV` - Can be `production` or `development`. Default: `development`
- `MS_CONNECTION` - Invert json host and port (with protocol). Default: `http://127.0.0.1:8001`
- `MS_NAME` - Microservice name. Default: `gateway`
- `MS_DISABLE_REMOTE_MIDDLEWARE` - Disable remote middleware feature. Default: `0`
- `DB_HOST` - Database host. Default: `127.0.0.1`
- `DB_PORT` - Database host. Default: `5432`
- `DB_USERNAME` - Database host. Default: `postgres`
- `DB_PASSWORD` - Database host. Default: `example`
- `DB_DATABASE` - Database host. Default: `ms-configuration`
- `MS_CONFIGS` - JSON string for configure initial `Config` values. Default: `[]`

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
