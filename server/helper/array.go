package helper

import "math/rand"

/* shuffle array -- create side effect -- */
func Shuffle[T any](arr []T) {
	rand.Shuffle(len(arr), func(i, j int) {
		arr[i], arr[j] = arr[j], arr[i]
	})
}

func RandomSelect[T any](arr []*T) *T {
	randInd := rand.Intn(len(arr))
	return arr[randInd]
}
