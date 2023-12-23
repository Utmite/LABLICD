FROM node:lts AS runtime
WORKDIR /app
COPY ./ /app/

ENV PUBLIC_FILES = http://files

RUN npm run build

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321
CMD node ./dist/server/entry.mjs