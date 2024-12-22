package api

import (
	"encoding/json"
	"fmt"
	"io"
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
		http.Error(w, fmt.Sprintf("Failed to connect to FTP server: %v", err), http.StatusInternalServerError)
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
		"message": "Successfully connected to FTP server",
	})

	fmt.Printf("New FTP connection with session %s\n", session.ID)
}

func (s *Server) handleDisconnect(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get session from context
	session := r.Context().Value("session").(*session.UserSession)

	if err := session.Client.Quit(); err != nil {
		http.Error(w, "Failed to disconnect from FTP server", http.StatusInternalServerError)
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

	// Get session from context
	session := r.Context().Value("session").(*session.UserSession)

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

func (s *Server) handleDownload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get session from context
	session := r.Context().Value("session").(*session.UserSession)

	path := r.URL.Query().Get("path")
	if path == "" {
		http.Error(w, "Path parameter is required", http.StatusBadRequest)
		return
	}

	resp, err := session.Client.Retr(path)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to retrieve file: %v", err), http.StatusInternalServerError)
		return
	}
	defer resp.Close()

	// Set headers for file download
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", path))
	w.Header().Set("Content-Type", "application/octet-stream")
	w.Header().Set("Access-Control-Expose-Headers", "Content-Disposition")

	// Copy the file to the response writer
	if _, err := io.Copy(w, resp); err != nil {
		http.Error(w, fmt.Sprintf("Failed to send file: %v", err), http.StatusInternalServerError)
		return
	}
}
