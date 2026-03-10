grammar Zerow

entry Program:
    (
    unit+=Unit 
    | declare+=Declare
    | assign+=Assign
    | returns+=Returns
    )*;

Unit:
    'unit' name=ID;

Declare:
    'declare' name=ID 'equals' value=INT '['unit=[Unit]']';

Assign:
    'assign' value=INT '['unit=[Unit:ID]']' 'to' declare=[Declare:ID];

Returns:
    'returns' (declare=[Declare:ID])? (value=INT '['unit=[Unit:ID]']')?;


hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
