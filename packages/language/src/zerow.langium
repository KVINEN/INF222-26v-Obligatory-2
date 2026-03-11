grammar Zerow

entry Program:
    (units+=Unit
    |statements+=Statement
    |returns+=Return
    |addtions+=Addition
    |subtractions+=Subtraction
    |multiplications+=Multiplication
    |divissions+=Divission
    |negatives+=NegativeNum)*;

Statement:
    Declare | Assign;

Unit:
    'unit' name=ID;

Declare:
    'declare' name=ID 'equals' value=Expression;

Assign:
    'assign' value=Expression 'to' declare=[Declare:ID];

Return:
    'returns' value=Expression;

Expression:
    Declare | IntLiteral | VariableRef | Addition | Subtraction | Multiplication | Divission | NegativeNum;

Addition infers Expression:
    Multiplication ({infer BinaryExpression.left=current} operator=('add') right=Multiplication)*;

Subtraction infers Expression:
    Multiplication ({infer BinaryExpression.left=current} operator=('sub') right=Multiplication)*;

Multiplication infers Expression:
    Primary ({infer BinaryExpression.left=current} operator=('mul') right=Primary)*;

Divission infers Expression:
    Primary ({infer BinaryExpression.left=current} operator=('div') right=Primary)*;

Primary infers Expression:
    GroupExpression | IntLiteral | VariableRef | NegativeNum;

GroupExpression:
    '(' expr=Expression ')';

IntLiteral:
    value=INT '[' unit=[Unit:ID] ']';

VariableRef:
    var=[Declare:ID];

NegativeNum:
    'neg' value=Primary;


hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;