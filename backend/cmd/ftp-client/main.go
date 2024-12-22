package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/dembicki/go-ftp/internal/api"
)

func main() {
	server := api.NewServer()

	addr := "localhost:8000"
	fmt.Printf("Starting API server on %s...\n", addr)
	if err := http.ListenAndServe(addr, server.RegisterRoutes()); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
