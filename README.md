Start dev server

```bash
bun dev
```

Run in docker

```bash
docker run -e POSTGRES_PASSWORD=pw -p 5433:5432 postgres:alpine
docker build --no-cache -t app .
docker run -p 3000:3000 --network=host app
```

Drizzle studio

```bash
bun db:studio
```

Migrate database

```bash
bun db:push
```

Before commit, make sure `bun fix` is passed

<details>
<summary>If not...</summary>

It means that one of these checks failed:

- `bun lint`
- `bun typecheck`

Spot every issue and fix them

</details>
