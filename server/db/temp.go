package db

import "math/rand"

var temp = [4]string{
	"_ loves carrot",
	"_ is banned to be in car",
}

func RandomFact() string {
	randInd := rand.Intn(len(temp))
	return temp[randInd]
}
