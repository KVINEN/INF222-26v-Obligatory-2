grammar Zerow

entry Program:
    (units+=Unit)*
    (statements+=Statement)*
    (returns+=Return)*;

Statement:
    Declare | Assign | Return;

Unit:
    'unit' name=ID;

Declare:
    'declare' name=ID 'equals' value=Expression;

Assign:
    'assign' value=Expression 'to' declare=[Declare:ID];

Return:
    'returns' value=Expression;

Expression:
    Declare | IntLiteral | VariableRef;

IntLiteral:
    value=INT '[' unit=[Unit:ID] ']';

VariableRef:
    var=[Declare:ID];


hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;