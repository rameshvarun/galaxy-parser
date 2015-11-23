%{
var ast = require('./ast');
var range = require('./range').fromJison;
%}

%lex

digit [0-9]
id [a-zA-Z_][a-zA-Z0-9_]*

%x COMMENT STRING
%%

/* String literals */
"\"" { literal = ''; this.begin('STRING'); }
<STRING>\\. { literal += yytext[1]; }
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
"%" { return 'MODULUS'; }

/* Assignment Operators */
"=" { return 'EQUALS'; }
"+=" { return 'PLUSEQUALS'; }

"(" { return 'LPAREN'; }
")" { return 'RPAREN'; }
"<" { return 'LANGLE'; }
">" { return 'RANGLE'; }
"{" { return 'LBRACE'; }
"}" { return 'RBRACE'; }
"[" { return 'LBRACKET'; }
"]" { return 'RBRACKET'; }

";" { return 'SEMICOLON'; }
"," { return 'COMMA'; }

\s+ { /* skip whitespace */}
<<EOF>> { return 'EOF'; }
/lex

%start program

%left PLUS MINUS
%left MULT DIV MODULUS
%%

program
  : EOF { return ast.Program(range(@$), []); }
  | toplevel_declarations EOF { return ast.Program(range(@$), $1); }
  ;

toplevel_declarations
  : toplevel_declaration { $$ = [$1]; }
  | toplevel_declarations toplevel_declaration { $$ = $1.concat([$2]); }
  ;

toplevel_declaration
  : include | struct_definition | function_declaration SEMICOLON
  | function_definition | global_declaration ;

global_declaration
  : STATIC CONST variable_declaration SEMICOLON
    { $$ = ast.GlobalDeclaration(range(@$), true, true, $3); }
  | STATIC variable_declaration SEMICOLON
    { $$ = ast.GlobalDeclaration(range(@$), true, false, $3); }
  | CONST variable_declaration SEMICOLON
    { $$ = ast.GlobalDeclaration(range(@$), false, true, $3); }
  | variable_declaration SEMICOLON
    { $$ = ast.GlobalDeclaration(range(@$), false, false, $3); }
  ;

variable_declaration
  : type_specifier identifier
    { $$ = ast.VariableDeclaration(range(@$), $1, $2, null); }
  | type_specifier identifier EQUALS expression
    { $$ = ast.VariableDeclaration(range(@$), $1, $2, $4); }
  ;

function_declaration
  : STATIC type_specifier identifier LPAREN optional_formals RPAREN
    { $$ = ast.FunctionDeclaration(range(@$), true, $2, $3, $5); }
  | type_specifier identifier LPAREN optional_formals RPAREN
    { $$ = ast.FunctionDeclaration(range(@$), false, $2, $3, $5); }
  ;

function_definition
  : function_declaration LBRACE optional_statements RBRACE
    { $$ = ast.FunctionDefinition(range(@$), $1, $3); }
  ;

optional_statements : { $$ = []; } | statements;
optional_formals : { $$ = []; } | formals;
optional_actuals : { $$ = []; } | actuals;

statements
  : statements statement SEMICOLON { $$ = $1.concat($2); }
  | statement SEMICOLON { $$ = [$1]; }
  ;

formals
  : formals COMMA formal { $$ = $1.concat($2); }
  | formal { $$ = [$1]; }
  ;

formal : type_specifier identifier { $$ = ast.Formal(range(@$), $1, $2); };

actuals
  : actuals COMMA expression { $$ = $1.concat($2); }
  | expression { $$ = [$1]; }
  ;

include
  : INCLUDE string_literal { $$ = ast.Include(range(@$), $2); }
  | INCLUDE string_literal SEMICOLON { $$ = ast.Include(range(@$), $2); }
  ;

string_literal
  : STRINGLITERAL { $$ = ast.StringLiteral(range(@1), $1);}
  ;

struct_definition
  : static_modifier STRUCT identifier LBRACE struct_fields RBRACE SEMICOLON
    { $$ = ast.StructDefinition(range(@$), $1, $3, $5); }
  ;

static_modifier : { $$ = false; } | STATIC { $$ = true; } ;
const_modifier : { $$ = false; } | CONST { $$ = true; };

struct_fields
  : struct_fields struct_field { $$ = $1.concat($2); }
  | struct_field { $$ = [$1]; }
  ;

struct_field
  : type_specifier identifier SEMICOLON { $$ = ast.StructField(range(@$), $1, $2); }
  ;

expression
  : string_literal
  | identifier
  | identifier LPAREN optional_actuals RPAREN
    { $$ = ast.FunctionCall(range(@$), $1, $3); }

  | expression PLUS expression
    { $$ = ast.BinaryOperation(range(@$), $1, $1, $3); }
  | expression MINUS expression
    { $$ = ast.BinaryOperation(range(@$), $2, $1, $3); }
  ;

statement
  : variable_declaration
  | expression { $$ = ast.ExpressionStatement(range(@$), $1); }
  ;

type_specifier
  : identifier { $$ = ast.TypeSpecifier(range(@$), $1); }
  ;

identifier
  : ID { $$ = ast.Identifier(range(@$), $1); }
  ;
