package ftp

import (
	"fmt"

	"github.com/dembicki/go-ftp/internal/files"
	"github.com/jlaffaye/ftp"
)

type Config struct {
	Host     string
	Port     string
	Username string
	Password string
}

type Client struct {
	conn   *ftp.ServerConn
	config *Config
}

func NewClient(cfg *Config) (*Client, error) {
	return &Client{
		config: cfg,
	}, nil
}

func (c *Client) Connect(host string, port string, username string, password string) error {
	conn, err := ftp.Dial(fmt.Sprintf("%s:%s", host, port))
	if err != nil {
		return fmt.Errorf("error connecting to FTP server: %w", err)
	}

	if err := conn.Login(username, password); err != nil {
		return fmt.Errorf("error logging in to FTP server: %w", err)
	}

	fmt.Printf("Connected to FTP server: %s:%s\n", host, port)

	c.conn = conn
	return nil
}

func (c *Client) Close() error {
	if c.conn != nil {
		return c.conn.Quit()
	}
	return nil
}

func (c *Client) ListFiles(path string) ([]files.File, error) {
	entries, err := c.conn.List(path)
	if err != nil {
		return nil, err
	}

	files, err := files.FileMapper(entries)
	if err != nil {
		return nil, err
	}

	return files, nil
}

func (c *Client) DownloadFile(path string) error {
	fmt.Println("To be implemented")
	return nil
}
