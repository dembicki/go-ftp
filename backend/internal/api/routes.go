package api

import "net/http"

// RegisterRoutes returns an http.Handler with all routes registered
func (s *Server) RegisterRoutes() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/api/ftp/connect", s.handleConnect)
	mux.HandleFunc("/api/ftp/disconnect", s.requireSession(s.handleDisconnect))
	mux.HandleFunc("/api/ftp/list", s.requireSession(s.handleListFiles))
	mux.HandleFunc("/api/ftp/download", s.requireSession(s.handleDownload))

	// Start session cleanup
	s.cleanupSessions()

	return enableCORS(mux)
}
