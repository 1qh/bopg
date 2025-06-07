FROM oven/bun:alpine
COPY . .
RUN bun i && bun run build
EXPOSE 3000
CMD ["bun", "--cwd", "apps/nextjs", "start"]