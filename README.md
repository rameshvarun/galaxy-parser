# Galaxy Parser [![Build Status](https://travis-ci.org/rameshvarun/galaxy-parser.svg)](https://travis-ci.org/rameshvarun/galaxy-parser)

## Notes
### Extended Backus–Naur Form Grammar
```ebnf
<program> ::= {<toplevel-declaration>}
<toplevel-declaration> ::= <struct-declaration>
  | <global-declaration>
  | <type-def>

<global-declaration> ::= ["static"] ["const"] <variable-declaration> ";"

(* Struct Definitions *)
<struct-declaration> ::= "struct" "{" {<struct-field>} "}"
<struct-field> ::= <type> Identifier ";"


<type-def> ::= "typedef"
<include-path> ::= "import" StringLiteral [";"]

<variable-declaration> ::= <int
<function-body> ::= {<variable-declaration> ";"} <statement> ::=

<expression> ::=

<bin-op> ::= "+" | "-" | "*" | "/" | "%" | "&"
  | "|" | "^" | "<<" | ">>" | "&&" | "||" | "=="
  | "!=" | "<" | "<=" | ">=" | ">"

<unary-op> ::= "+" | "-" | "~" | "!"

<assign-op> ::= "=" | "+=" | "-=" | "*=" | "/="
  | "%=" | "&=" | "|=" | "^=" | "<<=" | ">>="
```
