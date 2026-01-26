package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/websocket"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 512
)

type Client struct {
	hub    *Hub
	conn   *websocket.Conn
	send   chan []byte
	userID string
}

type BroadcastMessage struct {
	Content   string `json:"content"`
	Username  string `json:"username"`
	UserID    string `json:"user_id"`
	Timestamp string `json:"timestamp"`
}

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })

	for {
		_, messageBytes, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		messageContent := string(messageBytes)

		// 1. Get Username from DB
		var username string
		if db != nil {
			// FIXED: Query 'account_customuser' instead of 'auth_user'
			err := db.QueryRow("SELECT username FROM account_customuser WHERE id=$1", c.userID).Scan(&username)
			if err != nil {
				log.Printf("Error finding username for ID %s: %v", c.userID, err)
				username = "Unknown"
			}

			// 2. Save message to Postgres
			_, dbErr := db.Exec("INSERT INTO api_message (user_id, content, timestamp) VALUES ($1, $2, NOW())", c.userID, messageContent)
			if dbErr != nil {
				log.Printf("Error saving to DB: %v", dbErr)
			}
		}

		// 3. Create JSON Object
		msgObj := BroadcastMessage{
			Content:   messageContent,
			Username:  username,
			UserID:    c.userID,
			Timestamp: time.Now().Format(time.RFC3339),
		}

		jsonBytes, _ := json.Marshal(msgObj)
		c.hub.broadcast <- jsonBytes
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func serveWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	tokenString := r.URL.Query().Get("token")
	if tokenString == "" {
		http.Error(w, "Missing Token", http.StatusUnauthorized)
		return
	}

	// 1. Validate Token
	claims := &UserClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		secret := os.Getenv("JWT_SECRET")
		if secret == "" {
			return nil, fmt.Errorf("JWT_SECRET missing")
		}
		return []byte(secret), nil
	})

	if err != nil || !token.Valid {
		log.Printf("❌ Connection rejected: %v", err)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// 2. Upgrade Connection
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}

	// Note: We use claims.UserID directly because it is now a string again
	client := &Client{hub: hub, conn: conn, send: make(chan []byte, 256), userID: claims.UserID}
	client.hub.register <- client

	go client.writePump()
	go client.readPump()

	log.Printf("✅ User %s Connected!", claims.UserID)
}
