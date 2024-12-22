package api

import "github.com/dembicki/go-ftp/internal/ftp"

type Server struct {
	client *ftp.Client
}

func NewServer(client *ftp.Client) *Server {
	return &Server{client: client}
}
