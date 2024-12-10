package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
)

const SERVER_PORT = "8080"

type Server struct {
	router *chi.Mux
}

func (s *Server) start(port string) error {
	return http.ListenAndServe(fmt.Sprintf(":%s", port), s.router)
}

func main() {
	r := chi.NewRouter()
	routes(r)

	server := &Server{
		router: r,
	}

	log.Printf("Server is running on %s", SERVER_PORT)

	err := server.start(SERVER_PORT)
	if err != nil {
		log.Fatal(err)
	}

}
