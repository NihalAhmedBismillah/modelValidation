import "reflect-metadata";

interface IValidationRule {
    evaluate(target: any, value: any, key: string): string | null;
}

class RequiredValidationRule implements IValidationRule {
    static instance = new RequiredValidationRule();

    evaluate(target: any, value: any, key: string): string | null {
        if (value) {
            return null;
        }
        return `${key} is required`;
    }
}

function required(target: any, propertyKey: string) {

    addValidationRule(target, propertyKey, RequiredValidationRule.instance);
}


function addValidationRule(target: any, propertyKey: string, rule: IValidationRule) {

    let rules: IValidationRule[] = Reflect.getMetadata("validation", target, propertyKey) || [];
    rules.push(rule);

    let properties: string[] = Reflect.getMetadata("validation", target) || [];
    if (properties.indexOf(propertyKey) < 0) {
        properties.push(propertyKey);
    }

    Reflect.defineMetadata("validation", properties, target);
    Reflect.defineMetadata("validation", rules, target, propertyKey);
}

export class Validator {

    validate(target: any) {
        // Get the list of properties to validate
        const keys = Reflect.getMetadata("validation", target) as string[];
        console.log('Keys====> :', keys);
        let errorMessages: string[] = [];
        if (Array.isArray(keys)) {
            for (const key of keys) {
                const rules = Reflect.getMetadata("validation", target, key) as IValidationRule[];
                if (!Array.isArray(rules)) {
                    continue;
                }
                for (const rule of rules) {
                    const error = rule.evaluate(target, target[key], key);
                    if (error) {
                        errorMessages.push(error);
                    }
                }
            }
        }
        return errorMessages;
    }
    isValid(target: any) {
        const validationResult = this.validate(target);
        console.log('result : ', validationResult);
        return validationResult.length === 0;
    }
}

class Person extends Validator {

    @required
    public firstName: string;
    @required
    public lastName: string;
}

let person = new Person();
person.firstName = 'Nihal Ahmed';
//person.lastName = 'Choudhary';
console.log('Error Message : ', person.isValid(person));