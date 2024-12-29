package api

import "net/http"

// RegisterRoutes returns an http.Handler with all routes registered
func (s *Server) RegisterRoutes() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/api/ftp/connect", s.handleConnect)
	mux.HandleFunc("/api/ftp/disconnect", s.AuthMiddleware(s.handleDisconnect))
	mux.HandleFunc("/api/ftp/check-session", s.AuthMiddleware(s.handleCheckSession))
	mux.HandleFunc("/api/ftp/list", s.AuthMiddleware(s.handleListFiles))
	mux.HandleFunc("/api/ftp/download", s.AuthMiddleware(s.handleDownloadFile))
	// Start session cleanup
	s.cleanupSessions()

	return enableCORS(mux)
}
