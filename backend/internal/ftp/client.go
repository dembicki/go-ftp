package ftp

import (
	"fmt"

	"github.com/dembicki/go-ftp/internal/config"
	"github.com/dembicki/go-ftp/internal/files"
	"github.com/jlaffaye/ftp"
)

type Client struct {
	conn   *ftp.ServerConn
	config *config.Config
}

func NewClient(cfg *config.Config) (*Client, error) {
	return &Client{
		config: cfg,
	}, nil
}

func (c *Client) Connect() error {
	conn, err := ftp.Dial(fmt.Sprintf("%s:%s", c.config.URL, c.config.Port))
	if err != nil {
		return fmt.Errorf("error connecting to FTP server: %w", err)
	}

	if err := conn.Login(c.config.Username, c.config.Password); err != nil {
		return fmt.Errorf("error logging in to FTP server: %w", err)
	}

	fmt.Printf("Connected to FTP server: %s:%s\n", c.config.URL, c.config.Port)

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
