# Nest-React-Template

This is a Nest + Next JS template.

Features:

- NestJS
- NextJS
- SCSS
- Tailwind
- Husky + Commitizen
- Jest
- MobX + React Service Provider
- Isomorphic Rendering
- Enviromnent Folder (scr/env/(dev,prod,test))

## Environments

To configure the environment you need to configure different environments at src/env

## Production

`npm run build`

`npm start`

## Development

`npm run start:dev`

## Testing

`npm run test`

or with majestic

`npx majestic --noOpen --port 5000`

## Testing Watch

`npm run test:watch`

## Testing Coverage

`npm run test:cov`

## Git Commit

`npm run commit`

## Release

`npm run semantic-release`

## Redis

s
`docker run --name redis -d -p 6379:6379 --restart unless-stopped redis`

## Mongo

`docker run --name mongo -d -p 27017:27017 --restart unless-stopped -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo`

```
docker exec -it mongo /bin/bash
mongo -u admin -p password --authenticationDatabase admin
use nest
db.createUser({
  user: 'nest',
  pwd: 'password',
  roles: [{ role: 'readWrite', db: 'nest'}]
})
exit
exit
```

## Production

.env

```
GOOGLE_CLIENT_ID=...
GOOGLE_SECRET=...
JWT_SECRET=...
MONGO_CONNECTION_URL=mongodb://...
REDIS_HOST=...
REDIS_PORT=...
NEXT_PUBLIC_SELF_URL=http://rowanberry.xyz
```
