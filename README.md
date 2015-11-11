# Galaxy Parser [![Build Status](https://travis-ci.org/rameshvarun/galaxy-parser.svg)](https://travis-ci.org/rameshvarun/galaxy-parser)

## Notes
### Extended Backus–Naur Form Grammar
```
<program> ::= {<toplevel-declaration>}
<toplevel-declaration> ::= <struct-declaration>
  | <global-declaration>
  | <type-def>
  | <function-declaration>
  | <function-prototype>
  | <native-declaration>

<global-declaration> ::= ["static"] ["const"] <variable-declaration> ";"
<variable-declaration> ::= <variable-type> <identifier> []

<struct-declaration> ::= "struct" "{" {<struct-field>} "}"
<struct-field> ::= <variable-type> <identifier>  ";"


<type-def> ::= "typedef"
<include-path> ::= "import" StringLiteral [";"]

<function-body> ::= {<variable-declaration> ";"} <statement> ::=

<statement> ::= <expression>
  | <identifier> <assign-op> <expression>

<expression> ::= <expression> <bin-op> <expression> // Binary operator.
  | <unary-op> <expression> // Unary operator.
  | <identifier> "[" "]" // Array indexing.
  | <identifier> "(" [<expresion_list>] ")" // Function call.
  | <identifier> // Scope lookup.
  | <string-literal> // String literal.

<expresion_list> ::= {<expresion> ","} <expresion>

<bin-op> ::= "+" | "-" | "*" | "/" | "%" | "&"
  | "|" | "^" | "<<" | ">>" | "&&" | "||" | "=="
  | "!=" | "<" | "<=" | ">=" | ">"

<unary-op> ::= "+" | "-" | "~" | "!"

<assign-op> ::= "=" | "+=" | "-=" | "*=" | "/="
  | "%=" | "&=" | "|=" | "^=" | "<<=" | ">>="
```
## Links
- [Galaxy Parser in Haskell (Using Parser Combinators)](https://github.com/phyrex1an/galaxy-parser)
- [Galaxy Language Overview](http://www.sc2mapster.com/wiki/galaxy/script/language-overview/)
- [Galaxy Operators](http://deaod.de/GalaxyOperators.txt)
- [Galaxy Types](http://deaod.de/GalaxyTypes.txt)
