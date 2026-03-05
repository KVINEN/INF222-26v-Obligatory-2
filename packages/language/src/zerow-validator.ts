import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { Declare, Program, ZerowAstType } from './generated/ast.js';
import type { ZerowServices } from './zerow-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: ZerowServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.ZerowValidator;
    const checks: ValidationChecks<ZerowAstType> = {
        Declare: validator.checkUniqueDeclaration,
        // TODO: Declare validators for your properties
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
        // this.validateProgram(model, accept);
    }

    checkUniqueDeclaration(declare: Declare, accept: ValidationAcceptor): void {
        const container = declare.$container as Program;

        const duplicate = container.declare.find(d => d !== declare && d.name === declare.name);

        if (duplicate) {
            accept('error', `Declaration with variable ' ${declare.name} 'already exist.`, {
                node: declare,
                property: 'name'
            });
        }

    }


    // validateProgram(model: Program, accept: ValidationAcceptor) {
    //     function buildMeasureSet(/* TODO: add type */) {
    //         /* TODO: Add validation code */
    //     }

    //     function validateStatement(/* TODO: add type */) {
    //         /* TODO: Add validation code */
    //     }

    //     function validateDeclarationStmt(/* TODO: add type */) {
    //         /* TODO: Add validation code */
    //     }

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
    // }
}
