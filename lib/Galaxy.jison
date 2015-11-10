%{
  var ast = require('./ast');
%}

%lex

%x COMMENT STRING
%%

/* String literals */
"\"" { yytext = ''; this.begin('STRING'); }
<STRING>"\"" { this.popState(); return 'STRINGLITERAL'; }
<STRING>. { }

/* Comments */
"//" { this.begin('COMMENT'); }
<COMMENT><<EOF>> { this.popState(); }
<COMMENT>[\n] { this.popState(); }
<COMMENT>[^\n] { /* eat all non-newline characters */ }

"if" { return 'IF'; }
"include" { return 'INCLUDE'; }
"void" { return 'VOID'; }

"static" { return 'STATIC'; }
"const" { return 'CONST'; }

/* Operators */
"<<" { return 'LSHIFT'; }
">>" { return 'RSHIFT'; }
"+" { return 'PLUS'; }
"-" { return 'MINUS'; }
"*" { return 'MULT'; }
"/" { return 'DIV'; }

"(" { return 'LPAREN'; }
")" { return 'RPAREN'; }
";" { return 'SEMICOLON'; }
\s+ { /* skip whitespace */}
<<EOF>> { return 'EOF'; }
/lex

%start program
%%

program
  : EOF { return ast.Program([]); }
  | toplevel_declarations EOF { return ast.Program([$1]); }
  ;

toplevel_declarations
  : toplevel_declaration { $$ = [$1]; }
  | toplevel_declarations toplevel_declaration { $$ = $1.concat([$2]); }
  ;

toplevel_declaration
  : include { $$ = $1; }
  ;

include
  : INCLUDE STRINGLITERAL { $$ = ast.Include($2); }
  | INCLUDE STRINGLITERAL SEMICOLON { $$ = ast.Include($2); }
  ;

function_prototype
  : STATIC CONST ID
  | CONST
  ;
