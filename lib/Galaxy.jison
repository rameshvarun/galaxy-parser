%{
  var ast = require('./ast');
%}

%lex

digit [0-9]
id [a-zA-Z][a-zA-Z0-9]*

%x COMMENT STRING
%%

/* String literals */
"\"" { literal = ''; this.begin('STRING'); }
<STRING>"\"" { this.popState(); yytext = literal; return 'STRINGLITERAL'; }
<STRING>. { literal += yytext; }

/* Comments */
"//" { this.begin('COMMENT'); }
<COMMENT><<EOF>> { this.popState(); }
<COMMENT>[\n] { this.popState(); }
<COMMENT>[^\n] { /* eat all non-newline characters */ }

"if" { return 'IF'; }
"include" { return 'INCLUDE'; }

"void" { return 'VOID'; }

"struct" { return 'STRUCT'; }

"structref" { return 'STRUCTREF'; }
"funcref" { return 'FUNCREF'; }
"arrayref" { return 'ARRAYREF'; }

"static" { return 'STATIC'; }
"const" { return 'CONST'; }

{id} {return 'ID'; }

/* Operators */
"<<" { return 'LSHIFT'; }
">>" { return 'RSHIFT'; }
"+" { return 'PLUS'; }
"-" { return 'MINUS'; }
"*" { return 'MULT'; }
"/" { return 'DIV'; }

"(" { return 'LPAREN'; }
")" { return 'RPAREN'; }
"<" { return 'LANGLE'; }
">" { return 'RANGLE'; }
"{" { return 'LBRACE'; }
"}" { return 'RBRACE'; }

";" { return 'SEMICOLON'; }
\s+ { /* skip whitespace */}
<<EOF>> { return 'EOF'; }
/lex

%start program
%%

program
  : EOF { return ast.Program([]); }
  | toplevel_declarations EOF { return ast.Program($1); }
  ;

toplevel_declarations
  : toplevel_declaration { $$ = [$1]; }
  | toplevel_declarations toplevel_declaration { $$ = $1.concat([$2]); }
  ;

toplevel_declaration
  : include { $$ = $1; }
  | struct_definition { $$ = $1; }
  ;

include
  : INCLUDE string_literal { $$ = ast.Include($2); }
  | INCLUDE string_literal SEMICOLON { $$ = ast.Include($2); }
  ;

string_literal
  : STRINGLITERAL { $$ = ast.StringLiteral($1);}
  ;

struct_definition
  : STATIC STRUCT ID LBRACE struct_fields RBRACE SEMICOLON
  | STRUCT ID LBRACE RBRACE struct_fields SEMICOLON
  ;
//function_prototype
//  : STATIC RETURNTYPE ID arglist SEMICOLON {}
//  | RETURNTYPE ID arglist SEMICOLON
//  ;
