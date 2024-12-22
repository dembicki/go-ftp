package session

import (
	"crypto/rand"
	"fmt"
	"sync"
	"time"

	"github.com/jlaffaye/ftp"
)

type UserSession struct {
	ID       string
	Client   *ftp.ServerConn
	LastUsed time.Time
}

type Manager struct {
	sessions map[string]*UserSession
	mu       sync.RWMutex
}

func NewManager() *Manager {
	return &Manager{
		sessions: make(map[string]*UserSession),
	}
}

func (m *Manager) CreateSession(client *ftp.ServerConn) (*UserSession, error) {
	sessionID := generateSessionID()
	session := &UserSession{
		ID:       sessionID,
		Client:   client,
		LastUsed: time.Now(),
	}

	m.mu.Lock()
	m.sessions[sessionID] = session
	m.mu.Unlock()

	return session, nil
}

func (m *Manager) GetSession(sessionID string) (*UserSession, bool) {
	m.mu.RLock()
	session, exists := m.sessions[sessionID]
	m.mu.RUnlock()
	return session, exists
}

func (m *Manager) RemoveSession(sessionID string) {
	m.mu.Lock()
	delete(m.sessions, sessionID)
	m.mu.Unlock()
}

// Helper function to generate session IDs
func generateSessionID() string {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return fmt.Sprintf("%d", time.Now().UnixNano())
	}
	return fmt.Sprintf("%x", b)
}

func (m *Manager) CleanupSessions(maxAge time.Duration) {
	m.mu.Lock()
	defer m.mu.Unlock()

	now := time.Now()
	for id, session := range m.sessions {
		if now.Sub(session.LastUsed) > maxAge {
			session.Client.Quit()
			delete(m.sessions, id)
		}
	}
}
