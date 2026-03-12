import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { Program, ZerowAstType } from './generated/ast.js';
import type { ZerowServices } from './zerow-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: ZerowServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.ZerowValidator;
    const checks: ValidationChecks<ZerowAstType> = {
        Program: validator.checkProgram
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
        //     function buildMeasureSet(/* TODO: add type */) {
        //         /* TODO: Add validation code */
        //     }

        //     function validateStatement(/* TODO: add type */) {
        //         /* TODO: Add validation code */
        //     }

        //check that no two declarations have the same name
        function validateDeclarationStmt(model: Program, accept: ValidationAcceptor) {
            const names = new Set<string>();
            for (const statement of model.statements) {
                if (statement.$type === 'Declare') {
                    const name = statement.name;
                    if (names.has(name)) {
                        accept('error', `${name} has already been declared`, {
                            node: statement,
                            property: 'name'
                        });
                    }
                    names.add(name);
                }
            }
        }

        //     function validateAssignmentStmt(/* TODO: add type */) {
        //         /* TODO: Add validation code */
        //     }

        //     function validateExpression(/* TODO: add type */) {
        //         /* TODO: Add validation code */
        //     }

        //     function validateLiteral(/* TODO: add type */) {
        //         /* TODO: Add validation code */
        //     }

        //     function validateReference(/* TODO: add type */) {
        //         /* TODO: Add validation code */
        //     }

        //     function resolveReference(/* TODO: add type */) {
        //         /* TODO: Add validation code */
        //     }
        
        validateDeclarationStmt(model, accept);
    }
}
