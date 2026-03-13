import type { ValidationAcceptor, ValidationChecks } from 'langium';
import { Declare, Program, Statement, ZerowAstType } from './generated/ast.js';
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
        //     function buildMeasureSet(/* TODO: add type */) {
        //         /* TODO: Add validation code */
        //     }

        function validateStatement(statement: Statement) {
            if (statement.$type === 'Declare') {
                validateDeclarationStmt(statement);
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

        //function validateExpression(expr: Expression) {

        //}

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
