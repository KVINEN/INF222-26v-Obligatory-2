grammar Zerow

entry Program:
    (unit+=Unit 
    | declare+=Declare
    | asign+=Asign
    )*;

Unit:
    'unit' name=ID;

Declare:
    'declare' name=ID 'equals' value=INT '['unit=[Unit]']';

Asign:
    'asign' value=INT '['unit=[Unit]']' 'to' + declare=[Declare];

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
