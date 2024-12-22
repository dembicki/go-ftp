package api

import "net/http"

func (s *Server) SetupRoutes() {
	http.HandleFunc("/", s.getFileList)
}
