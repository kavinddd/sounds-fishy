package db

import (
	"sounds-fishy/helper"
)

type FunFact struct {
	Full   string
	Hidden string
}

var temp = []*FunFact{
	{
		Full:   "Rabbit loves eating carrot.",
		Hidden: "_ loves eating carrot.",
	},
	{
		Full:   "Test test test test",
		Hidden: "Test test test _",
	},
}

func RandomFact() *FunFact {
	return helper.RandomSelect(temp)
}
