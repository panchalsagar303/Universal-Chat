package main

type Hub struct {
	// Registered clients (True = Online)
	clients map[*Client]bool

	// Inbound messages from the clients
	broadcast chan []byte

	// Register requests from the clients
	register chan *Client

	// Unregister requests from clients
	unregister chan *Client
}

func newHub() *Hub {
	return &Hub{
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
	}
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			// A new user connected
			h.clients[client] = true

		case client := <-h.unregister:
			// A user disconnected
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}

		case message := <-h.broadcast:
			// A message came in, send it to EVERYONE
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					// If sending fails, assume client is dead
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}
