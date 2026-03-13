import type { ValidationAcceptor, ValidationChecks } from 'langium';
import { Declare, Expression, Program, Statement, ZerowAstType } from './generated/ast.js';
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
                /*validateAssignmentStmt(statement);*/
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
        }

        //     function validateAssignmentStmt(/* TODO: add type */) {
        //         /* TODO: Add validation code */
        //     }

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
            } else if (expr.$type === 'GroupExpression') {
                validateExpression(expr.expr);
            } else if (expr.$type === 'NegativeNum') {
                validateExpression(expr.value);
            }
        }

        //     function validateLiteral(/* TODO: add type */) {
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
