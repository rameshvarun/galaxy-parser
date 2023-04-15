# StarCraft 2 Galaxy Parser

[![Node.js CI](https://github.com/rameshvarun/galaxy-parser/actions/workflows/node.js.yml/badge.svg)](https://github.com/rameshvarun/galaxy-parser/actions/workflows/node.js.yml)
[![npm](https://img.shields.io/npm/v/sc2-galaxy-parser)](https://www.npmjs.com/package/sc2-galaxy-parser)

## Usage

```javascript
const parse = require("sc2-galaxy-parser");
console.log(parse(`void Main(int argc, string[100] argv) {
  ConsoleLog("Basic Galaxy Test...");
  TestFunctionA();
}`));
```

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
<variable-declaration> ::= <type-specifier> <identifier> []

<struct-declaration> ::= "struct" "{" {<struct-field>} "}"
<struct-field> ::= <type-specifier> <identifier>  ";"

<function-prototype> ::= ["static"] <type-specifier> <identifier> "(" ")" ";"

<function-declaration> ::= ["static"] <type-specifier> <identifier> "(" ")" "{" <function-body> "}"

<type-specifier> ::= <identifier>
  | <type-specifier> "[" <integer-literal> "]"
  | <identifier> "<" <identifier> ">"

<type-def> ::= "typedef" <type-specifier> <identifier> ";"
<include-path> ::= "import" <string-literal> [";"]

<function-body> ::= {<variable-declaration> ";"}

<statement> ::= <expression>
  | <identifier> <assign-op> <expression> // TODO: Determine if assignment is a statement or expression.
  | "return" <expression>
  | "continue"
  | "break"

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
