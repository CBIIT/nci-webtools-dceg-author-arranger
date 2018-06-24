import {AbstractControl, FormArray, FormControl, FormGroup} from '@angular/forms';

export function createFormObject(initial : any) : AbstractControl {
    if(Array.isArray(initial)) {
        // detemine if array contains ValidatorFn or ValidatorFn[] eg: use same syntax
        // as formBuilder
        const isFn = obj => typeof obj === 'function';
        const hasValidators = initial.some(isFn) || initial
            .filter(Array.isArray)
            .some(isFn);

        if (hasValidators)
            return new FormControl(...initial);
        else
            return new FormArray(initial.map(val => createFormObject(val)))// return a FormGroup for objects;
        }

else if (typeof initial === 'object' && initial !== null)
        return new FormGroup(Object.keys(initial).reduce((acc, key) => ({
            ...acc,
            [key]: createFormObject(initial[key])
        }), {}));

    // otherwise, return a FormControl
    return new FormControl(initial);
}