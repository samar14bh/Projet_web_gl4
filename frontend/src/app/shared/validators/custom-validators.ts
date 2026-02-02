import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
    static phoneNumber(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return null;
            }
            const valid = /^[0-9]{8,20}$/.test(control.value);
            return valid ? null : { invalidPhone: true };
        };
    }

    static noWhitespace(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return null;
            }
            const isWhitespace = (control.value || '').toString().trim().length === 0;
            return !isWhitespace ? null : { whitespace: true };
        };
    }
}
