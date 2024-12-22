package api

import (
	"net/http"
	"sync"
	"time"

	"github.com/dembicki/go-ftp/internal/session"
)

type Server struct {
	sessionManager *session.Manager
	mu             sync.RWMutex
}

func NewServer() *Server {
	return &Server{
		sessionManager: session.NewManager(),
	}
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (s *Server) cleanupSessions() {
	ticker := time.NewTicker(30 * time.Minute)
	go func() {
		for range ticker.C {
			s.sessionManager.CleanupSessions(30 * time.Minute)
		}
	}()
}
