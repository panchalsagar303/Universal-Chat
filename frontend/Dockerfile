FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy code
COPY . .

# Expose Next.js port
EXPOSE 3000

# Run dev server (For production, we would use 'npm run build' and 'start')
CMD ["npm", "run", "dev"]
