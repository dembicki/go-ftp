package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	URL      string
	Port     string
	Username string
	Password string
}

func LoadConfig() (*Config, error) {
	if err := godotenv.Load(); err != nil {
		return nil, err
	}

	return &Config{
		URL:      os.Getenv("FTP_URL"),
		Port:     os.Getenv("FTP_PORT"),
		Username: os.Getenv("FTP_USERNAME"),
		Password: os.Getenv("FTP_PASSWORD"),
	}, nil
}
