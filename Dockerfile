FROM node:18-alpine

WORKDIR /src

# Install pnpm
RUN npm install -g pnpm

# Copy pnpm specific files
COPY pnpm-lock.yaml ./
COPY package.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

COPY . .
# RUN npx prisma generate
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]