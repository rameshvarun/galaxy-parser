%{
var ast = require('./ast');
var range = require('./range');
%}

%lex

digit [0-9]
id [a-zA-Z_][a-zA-Z0-9_]*

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

"struct" { return 'STRUCT'; }

"structref" { return 'STRUCTREF'; }
"funcref" { return 'FUNCREF'; }
"arrayref" { return 'ARRAYREF'; }

"static" { return 'STATIC'; }
"const" { return 'CONST'; }

"continue" { return 'CONTINUE'; }
"break" { return 'BREAK'; }
"return" { return 'RETURN'; }

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
"[" { return 'LBRACKET'; }
"]" { return 'RBRACKET'; }

";" { return 'SEMICOLON'; }
\s+ { /* skip whitespace */}
<<EOF>> { return 'EOF'; }
/lex

%start program
%%

program
  : EOF { return ast.Program(range.fromJison(@$), []); }
  | toplevel_declarations EOF { return ast.Program(range.fromJison(@$), $1); }
  ;

toplevel_declarations
  : toplevel_declaration { $$ = [$1]; }
  | toplevel_declarations toplevel_declaration { $$ = $1.concat([$2]); }
  ;

toplevel_declaration
  : include { $$ = $1; }
  | struct_definition { $$ = $1; }
  | function_declaration { $$ = $1; }
  ;

include
  : INCLUDE string_literal { $$ = ast.Include(range.fromJison(@$), $2); }
  | INCLUDE string_literal SEMICOLON { $$ = ast.Include(range.fromJison(@$), $2); }
  ;

string_literal
  : STRINGLITERAL { $$ = ast.StringLiteral(range.fromJison(@1), $1);}
  ;

struct_definition
  : STATIC STRUCT identifier LBRACE struct_fields RBRACE SEMICOLON
    { $$ = ast.StructDefinition(range.fromJison(@$), true, $3, $5); }
  | STRUCT identifier LBRACE struct_fields RBRACE SEMICOLON
    { $$ = ast.StructDefinition(range.fromJison(@$), false, $2, $4) }
  ;

struct_fields
  : { $$ = []; }
  | struct_fields struct_field { $$ = $1.concat($2); }
  | struct_field { $$ = [$1]; }
  ;

struct_field
  : type_specifier identifier SEMICOLON { $$ = ast.StructField(range.fromJison(@$), $1, $2); }
  ;

type_specifier
  : identifier { $$ = ast.TypeSpecifier(range.fromJison(@$), $1); }
  | type_specifier LBRACKET RBRACKET {}
  | identifier LANGLE ID LBRACKET {}
  ;

identifier
  : ID { $$ = ast.Identifier(range.fromJison(@$), $1); }
  ;
