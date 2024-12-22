package config

import (
	"fmt"
)

type Config struct {
	Host     string
	Port     string
	Username string
	Password string
}

func validateConfig(cfg *Config) error {
	if cfg.Host == "" || cfg.Port == "" || cfg.Username == "" || cfg.Password == "" {
		return fmt.Errorf("invalid config")
	}
	return nil
}
