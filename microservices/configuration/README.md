configuration
-------------------

RPC 2.0 Microservice.   
This microservice provides configuration for all other microservices. Single point for store configurations of microservices.

## Navigation
- [ENVIRONMENTS](#environments)
- [HOW TO DEVELOP](#how-to-develop)

### <a id="environments"></a>ENVIRONMENTS:
- `MS_CONNECTION` - Invert json host and port (with protocol). Default: `http://127.0.0.1:8001`
- `MS_NAME` - Microservice name. Default: `gateway`
- `MS_DISABLE_REMOTE_MIDDLEWARE` - Disable remote middleware feature. Default: `0`
- `DB_HOST` - Database host. Default: `127.0.0.1`
- `DB_PORT` - Database host. Default: `5432`
- `DB_USERNAME` - Database host. Default: `postgres`
- `DB_PASSWORD` - Database host. Default: `example`
- `DB_DATABASE` - Database host. Default: `ms-configuration`

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
