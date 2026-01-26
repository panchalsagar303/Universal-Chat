package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/websocket"
	_ "github.com/lib/pq"
)

// GLOBAL DATABASE VARIABLE
var db *sql.DB

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

type UserClaims struct {
	UserID string `json:"user_id"` // <--- FIXED: CHANGED BACK TO STRING
	jwt.RegisteredClaims
}

func main() {
	// 1. Get Connection String
	connStr := os.Getenv("DB_CONN_STRING")

	// 2. Connect to Database
	var err error
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Failed to open DB:", err)
	}
	defer db.Close()

	if err = db.Ping(); err != nil {
		log.Fatal("Failed to connect to DB:", err)
	}
	fmt.Println("✅ Connected to PostgreSQL successfully!")

	// 3. Start the Hub
	hub := newHub()
	go hub.run()

	// 4. Handle WebSocket requests
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWs(hub, w, r)
	})

	fmt.Println("🚀 WebSocket Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
