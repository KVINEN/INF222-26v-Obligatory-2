import type { ValidationAcceptor, ValidationChecks } from 'langium';
import { Assign, Declare, Expression, Program, Statement, ZerowAstType } from './generated/ast.js';
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

    // TODO: Add logic here for validation checks of properties
    checkProgram(model: Program, accept: ValidationAcceptor): void {
        this.validateProgram(model, accept);
    }

    validateProgram(model: Program, accept: ValidationAcceptor) {

        const declaredName = new Set<string>();

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

        //     function buildMeasureSet(/* TODO: add type */) {
        //         /* TODO: Add validation code */
        //     }

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
