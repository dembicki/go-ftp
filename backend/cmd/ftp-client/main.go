package main

import (
	"fmt"
	"net"
	"net/http"

	"github.com/dembicki/go-ftp/internal/api"
	"github.com/dembicki/go-ftp/internal/config"
	"github.com/dembicki/go-ftp/internal/ftp"
	"github.com/dembicki/go-ftp/internal/logger"
	"go.uber.org/zap"
)

func main() {
	logger := logger.NewLogger()

	// Config
	cfg, err := config.LoadConfig()
	if err != nil {
		logger.Error("Error loading .env file", zap.Error(err))
		return
	}

	// FTP Client
	client, err := ftp.NewClient(cfg)
	if err != nil {
		logger.Error("Error creating FTP client", zap.Error(err))
		return
	}

	// Connect to FTP server
	if err := client.Connect(); err != nil {
		logger.Error("Error connecting to FTP server", zap.Error(err))
		return
	}

	// Close FTP connection
	defer client.Close()

	// API Server
	server := api.NewServer(client)
	server.SetupRoutes()
	port := "8000"

	// Start API server
	logger.Info("Starting API server on :%s", zap.String("port", port))

	// Check if port is not in use
	ln, err := net.Listen("tcp", fmt.Sprintf(":%s", port))
	if err != nil {
		logger.Error("Error starting API server", zap.Error(err))
	}

	defer ln.Close()

	if err := http.Serve(ln, nil); err != nil {
		logger.Error("Error starting API server", zap.Error(err))
	}

}
