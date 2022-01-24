authorization
-------------------

RPC 2.0 Microservice.  
This microservice provides authorization mechanism for all other microservices.

## Navigation
- [ENVIRONMENTS](#environments)
- [HOW TO DEVELOP](#how-to-develop)

### <a id="environments"></a>ENVIRONMENTS:
- `NODE_ENV` - Can be `production` or `development` or `tests`. Default: `development`
- `MS_CONNECTION` - Invert json host and port (with protocol). Default: `http://127.0.0.1:8001`
- `MS_CONNECTION_SRV` - Invert json connection it is SRV record. Default: `false`
- `MS_NAME` - Microservice name. Default: `authorization`
- `MS_CONFIG_NAME` - Configuration microservice name. Default: `configuration` 
- `MS_WORKERS` - Microservice queue workers count. Default: `1`
- `MS_DISABLE_REMOTE_MIDDLEWARE` - Disable remote middleware feature. Set `1` to disable. Default: `0` (enabled)
- `MS_REMOTE_CONFIG` - Enable remote config (get from configuration microservice). Set `0` to disable. Default: `1`
- `DB_FROM_CONFIG_MS` - Get db credentials from configuration microservice. Set `0` to disable. Default: `1`
- `DB_HOST` - Database host. Default: `127.0.0.1`
- `DB_PORT` - Database port. Default: `5432`
- `DB_USERNAME` - Database user name. Default: `postgres`
- `DB_PASSWORD` - Database password. Default: `example`
- `DB_DATABASE` - Database db name. Default: `ms-authorization`
- `MS_DEFAULT_ROLE_ALIAS` - Default user role alias. Default: `user`

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
