digit [0-9]
id [a-zA-Z_][a-zA-Z0-9_]*

%x COMMENT STRING
%%

/* Fixed-point Literals */
{digit}+\.{digit}+ { return 'FIXEDLITERAL'; }

/* Integer Literals */
{digit}+ { return 'INTEGERLITERAL'; }

/* String literals */
"\"" { literal_start = yylloc; literal = ''; this.begin('STRING'); }
<STRING>\\. { literal += yytext[1]; }
<STRING>"\"" {
  this.popState();
  yylloc.first_line = literal_start.first_line;
  yylloc.first_column = literal_start.first_column;
  yytext = literal;
  return 'STRINGLITERAL';
}
<STRING>. { literal += yytext; }

/* Comments */
"//" { this.begin('COMMENT'); }
<COMMENT><<EOF>> { this.popState(); }
<COMMENT>[\n] { this.popState(); }
<COMMENT>[^\n] { /* eat all non-newline characters */ }

/* Keywords */
"if" { return 'IF'; }
"else" { return 'ELSE'; }
"while" { return 'WHILE'; }
"for" { return 'FOR'; }

"include" { return 'INCLUDE'; }

"true" { return 'TRUE'; }
"false" { return 'FALSE'; }

"struct" { return 'STRUCT'; }
"typedef" { return 'TYPEDEF'; }

"static" { return 'STATIC'; }
"const" { return 'CONST'; }

"continue" { return 'CONTINUE'; }
"break" { return 'BREAK'; }
"return" { return 'RETURN'; }

/* Identifiers */
{id} {return 'ID'; }

/* Multi-character Operators */

"<<" { return '<<'; }
">>" { return '>>'; }

"&&" { return '&&'; }
"||" { return '||'; }

"!=" { return '!='; }
"==" { return '=='; }
"<=" { return '<='; }
">=" { return '>='; }

/* Special Assignment Operators */
"+=" { return '+='; }
"-=" { return '-='; }
"*=" { return '*='; }
"/=" { return '/='; }
"%=" { return '%='; }
"&=" { return '&='; }
"|=" { return '|='; }
"^=" { return '^='; }
"<<=" { return '<<='; }
">>=" { return '>>='; }

/* Single character operators */
"=" { return '='; }

"+" { return '+'; }
"-" { return '-'; }
"*" { return '*'; }
"/" { return '/'; }
"%" { return '%'; }

"|" { return '|'; }
"&" { return '&'; }
"^" { return '^'; }

"!" { return '!'; }
"~" { return '~'; }

"(" { return '('; }
")" { return ')'; }
"<" { return '<'; }
">" { return '>'; }
"{" { return '{'; }
"}" { return '}'; }
"[" { return '['; }
"]" { return ']'; }

/* Separators */
";" { return ';'; }
"," { return ','; }
"." { return '.'; }

\s+ { /* skip whitespace */}
<<EOF>> { return 'EOF'; }
