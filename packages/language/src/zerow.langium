grammar Zerow

//entry point of the program
entry Program:
    (units+=Unit)*
    (statements+=Statement)*
    (returns+=Return)*;

//statement can be any of the three types
Statement:
    Declare | Assign | ExpressionStatment;

//statment can be an expression
ExpressionStatment:
    expr=Expression;

//unit declares some type of mesurement unit always first thing to be declared
Unit:
    'unit' name=ID;

//declare a variable with a value and unit
Declare:
    'declare' name=ID 'equals' value=Expression;

//assing some value to a variable
Assign:
    'assign' value=Expression 'to' target=[Declare:ID];

//return some expression
Return:
    'returns' value=Expression;

//expression can be any of the following
Expression:
    Addition;

//addtion and subtraction refers to multiplication
Addition infers Expression:
    Multiplication ({infer BinaryExpression.left=current} operator=('add' | 'sub') right=Multiplication)*;

//multiplication and division refers to primary
Multiplication infers Expression:
    Primary ({infer BinaryExpression.left=current} operator=('mul' | 'div') right=Primary)*;

//primary can be any of the following
Primary infers Expression:
    GroupExpression | IntLiteral | VariableRef | NegativeNum;

//group expression refers to expression in parentheses
GroupExpression:
    '(' expr=Expression ')';

//integer literal refers to a number with a unit
IntLiteral:
    value=INT '[' unit=[Unit:ID] ']';

//variable reference refers to a variable
VariableRef:
    var=[Declare:ID];

//negative number refers to a number with a negative sign
NegativeNum:
    'neg' value=Primary;


hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;