package main

import "fmt"

type Role string

const (
	PLAYER    Role = "PLYAER"
	RED_FISH  Role = "RED_FISH"
	BLUE_FISH Role = "BLUE_FISH"
)

/*
return a shuffled array of Role that has 1 player, 1 blue fish, n - 2 red fish
  - n should not be less than 4
*/
func RandomRoles(n int) ([]Role, error) {
	if n < 4 {
		return nil, fmt.Errorf("Roles cannot be less than")
	}

	roles := []Role{PLAYER, BLUE_FISH}

	return roles, nil

}
