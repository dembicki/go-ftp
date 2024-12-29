package files

import (
	"fmt"
	"time"

	"github.com/jlaffaye/ftp"
)

type File struct {
	Name     string
	Size     int64
	Type     string
	IsHidden bool
	Modified time.Time
}

func FileMapper(entries []*ftp.Entry) ([]File, error) {
	if len(entries) == 0 {
		return nil, fmt.Errorf("entries cannot be empty")
	}

	files := make([]File, 0, len(entries))

	for _, entry := range entries {
		if entry.Name == "" {
			return nil, fmt.Errorf("entry name cannot be empty")
		}

		files = append(files, File{
			Name:     entry.Name,
			Size:     int64(entry.Size),
			Type:     entry.Type.String(),
			IsHidden: entry.Name[0] == '.',
			Modified: entry.Time,
		})
	}

	return files, nil
}
