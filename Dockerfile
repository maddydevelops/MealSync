FROM node:24-alpine AS build
WORKDIR /app
ARG ENV
ENV ENV=$ENV

RUN apk add --no-cache \
    build-base \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev \
    pixman-dev \
    pkgconfig

COPY . .
RUN apk add --no-cache libc6-compat gcompat build-base


RUN npm install -f
RUN npx prisma db push --accept-data-loss
RUN npx prisma db seed
RUN npm run build

RUN mkdir -p .next/standalone/public && cp -r public/* .next/standalone/public/
RUN cp -r .next/static .next/standalone/.next/

FROM node:24-alpine AS runner

WORKDIR /app
RUN apk add --no-cache \
    build-base \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev \
    pixman-dev \
    pkgconfig

ENV NODE_ENV=production

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/public /var/www/flextrack

ENV HOSTNAME=0.0.0.0
ARG PORT=$PORT
ENV PORT=$PORT
EXPOSE 3000
CMD ["node", "server.js"]
