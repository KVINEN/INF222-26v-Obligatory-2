import { Assign, Declare, Expression, Program, Return, Statement } from 'zerow-language';
import * as fs from 'node:fs';
import { extractDestinationAndName, func, funcsec, functype, Info, instr, localidx, module, typeidx, typesec, i32, valtype, codesec, code, locals, exportsec, export_, exportdesc } from './util.js';

export function generateOutput(model: Program, source: string, destination: string): string {
    const data = extractDestinationAndName(destination);

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(destination, compile(model));
    return destination;
}

export function compile(model: Program) {
    const program = generateProgram(model);
    const mod = module(program);

    return Uint8Array.from(mod.flat(Infinity));
}

function generateProgram(model: Program) {
    let symbols: Map<string, Info> = new Map();
    let instructions: any[] = [];
    let returns: Return[] = [];

    for (const state of model.statements) {
        if (state.$type === "Declare") {
            if (!symbols.has(state.name)) {
                symbols.set(state.name, { name: state.name, idx: symbols.size });
            }
        }
    }

    for (const state of model.statements) {
        visitState(state);
    }

    for (const ret of model.returns) {
        visitReturn(ret);
    }

    instructions.push(instr.end);

    function visitState(state: Statement) {
        if (state.$type === "Declare") {
            visitDecl(state as Declare);
        }
        else if (state.$type === "Assign") {
            visitAssi(state as Assign);
        }
    }

    function visitDecl(decl: Declare) {
        visitExpr(decl.value);
        const info = symbols.get(decl.name);
        if (info !== undefined) {
            instructions.push([instr.local.set, localidx(info.idx)]);
        }
    }

    function visitAssi(assi: Assign) {
        visitExpr(assi.value);

        const dec = symbols.get(assi.target.ref!.name);
        if (dec !== undefined) {
            instructions.push([instr.local.set, localidx(dec.idx)]);
        }
    }

    function visitExpr(expr: Expression) {
        if (expr.$type === "VariableRef") {
            const info = symbols.get(expr.var.ref!.name);
            if (info !== undefined) {
                instructions.push([instr.local.get, localidx(info.idx)]);
            }
        }
        else if (expr.$type === "GroupExpression") {
            visitExpr(expr.expr);
        }
        else if (expr.$type === "NegativeNum") {
            if (expr.value.$type === "IntLiteral") {
                instructions.push([instr.i32.const, i32(-expr.value.value)]);
            }
        }
        else if (expr.$type === "IntLiteral") {
            instructions.push([instr.i32.const, i32(expr.value)]);
        }
        else if (expr.$type === "BinaryExpression") {
            visitExpr(expr.left);
            visitExpr(expr.right);

            if (expr.operator === "add") {
                instructions.push(instr.i32.add);
            }
            else if (expr.operator === "sub") {
                instructions.push(instr.i32.sub);
            }
            else if (expr.operator === "mul") {
                instructions.push(instr.i32.mul);
            }
            else if (expr.operator === "div") {
                instructions.push(instr.i32.div_s);
            }
        }
    }

    function visitReturn(ret: Return) {
        visitExpr(ret.value);
        returns.push(ret);
    }

    const returnTypes = returns.map(() => valtype.i32);
    const mainSig = functype([], returnTypes);

    const typeSect = typesec([mainSig]);
    const funcSect = funcsec([typeidx(0)]);

    let localDecl = symbols.size > 0 ? [locals(symbols.size, valtype.i32)] : [];

    const exportSect = exportsec([export_("main", exportdesc.func(0))]);
    const codeSect = codesec([code(func(localDecl, instructions))]);

    return [typeSect, funcSect, exportSect, codeSect];
}
