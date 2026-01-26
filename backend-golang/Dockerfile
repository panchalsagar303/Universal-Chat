# Stage 1: Build the compiled binary
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Copy dependency files first (for better caching)
COPY go.mod go.sum ./
RUN go mod download

# Copy the code and build
COPY . .
RUN go build -o universal-chat .

# Stage 2: Run the binary in a tiny container
FROM alpine:latest

WORKDIR /root/

# Copy the binary from Stage 1
COPY --from=builder /app/universal-chat .

# Expose the WebSocket port
EXPOSE 8080

# Run command
CMD ["./universal-chat"]
