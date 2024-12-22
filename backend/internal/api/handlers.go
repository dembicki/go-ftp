package api

import (
	"encoding/json"
	"net/http"
)

func (s *Server) getFileList(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusInternalServerError)
		return
	}

	files, err := s.client.ListFiles("/")
	if err != nil {
		http.Error(w, "Error listing ftp files", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(files)
}
