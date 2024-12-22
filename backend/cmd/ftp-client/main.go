package main

import (
	"fmt"

	"github.com/dembicki/go-ftp/internal/config"
)

func main() {
	cfg, err := config.LoadConfig()

	if err != nil {
		fmt.Println("Error loading .env file", err)
	}

	fmt.Println("[Config]", cfg)

}
