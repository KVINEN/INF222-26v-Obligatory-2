import type { ValidationAcceptor, ValidationChecks } from 'langium';
import { Assign, Declare, Expression, Program, Statement, Unit, ZerowAstType } from './generated/ast.js';
import type { ZerowServices } from './zerow-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: ZerowServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.ZerowValidator;
    const checks: ValidationChecks<ZerowAstType> = {
        Program: validator.checkProgram,
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class ZerowValidator {

    checkProgram(model: Program, accept: ValidationAcceptor): void {
        this.validateProgram(model, accept);
    }

    validateProgram(model: Program, accept: ValidationAcceptor) {

        const declaredName = new Set<string>();
        const declaredUnit = new Set<string>();

        const firstNonUnitOffset = Math.min(
            ...model.statements.map(s => s.$cstNode?.offset ?? Infinity),
            ...model.returns.map(r => r.$cstNode?.offset ?? Infinity)
        );

        for (const unit of model.units) {
            buildMeasureSet(unit);
        }

        for (const statement of model.statements) {
            validateStatement(statement);
        }
        for (const ret of model.returns) {
            validateExpression(ret.value);
        }

        function inferUnit(expr: Expression | undefined): string | undefined {
            if (!expr) return undefined;

            if (expr.$type === 'IntLiteral') {
                return expr.unit.ref?.name;
            } else if (expr.$type === 'VariableRef') {
                return inferUnit(expr.var.ref?.value);
            } else if (expr.$type === 'GroupExpression') {
                return inferUnit(expr.expr);
            } else if (expr.$type === 'NegativeNum') {
                return inferUnit(expr.value);
            } else if (expr.$type === 'BinaryExpression') {
                return inferUnit(expr.left);
            }

            return undefined;
        }

        // check that units are declared first and no duplicate units exist
        function buildMeasureSet(statement: Unit) {
            /* grammer is (units+=Unit)* (statements+=Statement)* (returns+=Return)* 
            so this error message never shows insted you get: 
            Expecting token of type 'EOF' but found `unit`. */
            if ((statement.$cstNode?.offset ?? -1) > firstNonUnitOffset) {
                accept('error', 'Unit must be decaled at the start of the program', {
                    node: statement,
                    property: 'name'
                });
            }
            if (declaredUnit.has(statement.name)) {
                accept('error', `Unit ${statement.name} has already been declared`, {
                    node: statement,
                    property: 'name'
                });
            } else {
                declaredUnit.add(statement.name);
            }
        }

        //validate that the statement is valid
        function validateStatement(statement: Statement) {
            if (statement.$type === 'Declare') {
                validateDeclarationStmt(statement);
            } else if (statement.$type === 'Assign') {
                validateAssignmentStmt(statement);
            } else if (statement.$type === 'ExpressionStatment') {
                validateExpression(statement.expr);
            }
        }

        //check that no two declarations have the same name
        function validateDeclarationStmt(declareation: Declare) {
            if (declaredName.has(declareation.name)) {
                accept('error', `Variable ${declareation.name} has already been declared`, {
                    node: declareation,
                    property: 'name'
                });
            } else {
                declaredName.add(declareation.name);
            }
            validateExpression(declareation.value);
        }

        //check that a variable is declared before it is assigned
        // TODO: if you assigne 10[kg] to x (declare x 5[m]) then x new unit should be [kg] I thing if I understood it right
        function validateAssignmentStmt(assignment: Assign) {
            const targetName = assignment.target.ref?.name;
            if (targetName && !declaredName.has(targetName)) {
                accept('error', `Variable ${targetName} is assigned before its declaration`, {
                    node: assignment,
                    property: 'target'
                });
            }
            validateExpression(assignment.value);
        }

        //check that the units are compatible
        function validateExpression(expr: Expression) {
            if (expr.$type === 'BinaryExpression') {
                const leftUnit = inferUnit(expr.left);
                const rightUnit = inferUnit(expr.right);
                const validOperators = ['add', 'sub', 'mul', 'div'];

                if ((validOperators.includes(expr.operator)) && leftUnit && rightUnit) {
                    if (leftUnit !== rightUnit) {
                        accept('error', `Unit mismatch: ${leftUnit} and ${rightUnit}`, {
                            node: expr,
                            property: 'operator'
                        });
                    }
                }

                validateExpression(expr.left);
                validateExpression(expr.right);
            }
        }

        //     function validateLiteral(/* TODO: add type *returns/) {
        //         /* TODO: Add validation code */
        //     }

        //     function validateReference(/* TODO: add type */) {
        //         /* TODO: Add validation code */
        //     }

        //     function resolveReference(/* TODO: add type */) {
        //         /* TODO: Add validation code */
        //     }

    }
}
