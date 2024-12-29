package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/dembicki/go-ftp/internal/files"
	"github.com/dembicki/go-ftp/internal/session"
	"github.com/jlaffaye/ftp"
)

type ConnectRequest struct {
	Host     string `json:"host"`
	Port     int    `json:"port"`
	Username string `json:"username"`
	Password string `json:"password"`
}

func (s *Server) handleConnect(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req ConnectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	ftpClient, err := ftp.Dial(fmt.Sprintf("%s:%d", req.Host, req.Port))
	if err != nil {
		// return error in json
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": fmt.Sprintf("Failed to connect to FTP server: %v", err),
		})
		return
	}

	if err := ftpClient.Login(req.Username, req.Password); err != nil {
		ftpClient.Quit()
		http.Error(w, fmt.Sprintf("Failed to authenticate: %v", err), http.StatusUnauthorized)
		return
	}

	// Create new session using session manager
	session, err := s.sessionManager.CreateSession(ftpClient)
	if err != nil {
		ftpClient.Quit()
		http.Error(w, "Failed to create session", http.StatusInternalServerError)
		return
	}

	// Set session cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "session_id",
		Value:    session.ID,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		MaxAge:   1800, // 30 minutes
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"sessionId": session.ID,
	})

	fmt.Printf("New FTP connection with session %s\n", session.ID)
}

func (s *Server) handleDisconnect(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		w.Write([]byte("Method not allowed"))
		return
	}

	// Get session from context
	session := r.Context().Value("session").(*session.UserSession)

	if err := session.Client.Quit(); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Failed to disconnect from FTP server"))
		return
	}

	// Remove session using session manager
	s.sessionManager.RemoveSession(session.ID)

	// Clear session cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "session_id",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
	})

	fmt.Printf("Disconnected from FTP server with session %s\n", session.ID)
	w.WriteHeader(http.StatusOK)
}

func (s *Server) handleListFiles(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get session from context with nil check
	sessionVal := r.Context().Value("session")
	if sessionVal == nil {
		http.Error(w, "Unauthorized: No session found", http.StatusUnauthorized)
		return
	}

	session, ok := sessionVal.(*session.UserSession)
	if !ok {
		http.Error(w, "Invalid session type", http.StatusInternalServerError)
		return
	}

	// Get path from query parameters with default value
	path := r.URL.Query().Get("path")
	if path == "" {
		path = "/"
	}

	entries, err := session.Client.List(path)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to list files: %v", err), http.StatusInternalServerError)
		return
	}

	files, err := files.FileMapper(entries)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to process files: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(files)
}

func (s *Server) handleCheckSession(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	session := r.Context().Value("session").(*session.UserSession)
	if session == nil {
		json.NewEncoder(w).Encode(map[string]bool{
			"isConnected": false,
		})
		return
	}
	json.NewEncoder(w).Encode(map[string]bool{
		"isConnected": true,
	})
}
