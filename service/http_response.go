package service

import (
	"bytes"
	"compress/gzip"
	"compress/zlib"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/andybalholm/brotli"
)

var gzipMagicBytes = []byte{0x1f, 0x8b}

// DecompressResponseBody detects and decompresses gzip/deflate/brotli encoded response bodies.
// It handles cases where Content-Encoding header is missing but data is actually compressed.
// For streaming responses (isStream=true), magic byte sniffing is skipped to avoid blocking.
func DecompressResponseBody(resp *http.Response, isStream bool) error {
	if resp == nil || resp.Body == nil {
		return nil
	}

	encodings := parseContentEncodings(resp.Header.Get("Content-Encoding"))

	// If no Content-Encoding header and not streaming, sniff for gzip magic bytes
	// Skip sniffing for streams to avoid blocking on SSE connections
	if len(encodings) == 0 && !isStream {
		sniffed, newBody, err := sniffBodyPrefix(resp.Body, len(gzipMagicBytes))
		if err != nil {
			return err
		}
		resp.Body = newBody
		if len(sniffed) >= len(gzipMagicBytes) && bytes.Equal(sniffed[:len(gzipMagicBytes)], gzipMagicBytes) {
			encodings = []string{"gzip"}
		}
	}

	if len(encodings) == 0 {
		return nil
	}

	// Check if we can handle all encodings
	if !canHandleEncodings(encodings) {
		return fmt.Errorf("unsupported content encoding in response: %s", resp.Header.Get("Content-Encoding"))
	}

	// Decode in reverse order (last encoding applied first during compression)
	decodedAny := false
	for i := len(encodings) - 1; i >= 0; i-- {
		encoding := encodings[i]
		if encoding == "" || encoding == "identity" {
			continue
		}
		decoded, err := decodeBody(resp.Body, encoding)
		if err != nil {
			return fmt.Errorf("decode %s response: %w", encoding, err)
		}
		resp.Body = decoded
		decodedAny = true
	}

	if decodedAny {
		// Clear encoding headers since body is now decompressed
		resp.Header.Del("Content-Encoding")
		// Clear Content-Length as decompressed size differs from original
		resp.Header.Del("Content-Length")
		resp.ContentLength = -1
	}
	return nil
}

func parseContentEncodings(header string) []string {
	if header == "" {
		return nil
	}
	parts := strings.Split(header, ",")
	encodings := make([]string, 0, len(parts))
	for _, part := range parts {
		encoding := strings.TrimSpace(strings.ToLower(part))
		if encoding == "" {
			continue
		}
		encodings = append(encodings, encoding)
	}
	return encodings
}

func canHandleEncodings(encodings []string) bool {
	for _, encoding := range encodings {
		switch encoding {
		case "", "identity", "gzip", "deflate", "br", "brotli":
			continue
		default:
			return false
		}
	}
	return true
}

func decodeBody(body io.ReadCloser, encoding string) (io.ReadCloser, error) {
	switch encoding {
	case "gzip":
		reader, err := gzip.NewReader(body)
		if err != nil {
			return nil, err
		}
		return newCompoundReadCloser(reader, reader, body), nil
	case "deflate":
		reader, err := zlib.NewReader(body)
		if err != nil {
			return nil, err
		}
		return newCompoundReadCloser(reader, reader, body), nil
	case "br", "brotli":
		reader := brotli.NewReader(body)
		return newCompoundReadCloser(reader, body), nil
	default:
		return nil, fmt.Errorf("unsupported content encoding %q", encoding)
	}
}

func sniffBodyPrefix(body io.ReadCloser, n int) ([]byte, io.ReadCloser, error) {
	if body == nil || n <= 0 {
		return nil, body, nil
	}

	buf := make([]byte, n)
	read, err := body.Read(buf)
	if err != nil && err != io.EOF {
		return nil, nil, err
	}
	buf = buf[:read]

	combined := io.MultiReader(bytes.NewReader(buf), body)
	return buf, newCompoundReadCloser(combined, body), nil
}

func newCompoundReadCloser(reader io.Reader, closers ...io.Closer) io.ReadCloser {
	return &compoundReadCloser{
		Reader:  reader,
		closers: closers,
	}
}

type compoundReadCloser struct {
	io.Reader
	closers []io.Closer
}

func (c *compoundReadCloser) Close() error {
	var firstErr error
	for _, closer := range c.closers {
		if closer == nil {
			continue
		}
		if err := closer.Close(); err != nil && firstErr == nil {
			firstErr = err
		}
	}
	return firstErr
}
