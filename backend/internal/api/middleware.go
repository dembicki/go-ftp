package api

import (
	"context"
	"net/http"
	"time"
)

type contextKey string

const (
	sessionKey contextKey = "session"
)

func (s *Server) requireSession(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("session_id")
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		session, exists := s.sessionManager.GetSession(cookie.Value)
		if !exists {
			http.Error(w, "Session not found", http.StatusUnauthorized)
			return
		}

		// Update last used time
		session.LastUsed = time.Now()

		// Add session to context
		ctx := context.WithValue(r.Context(), sessionKey, session)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}
