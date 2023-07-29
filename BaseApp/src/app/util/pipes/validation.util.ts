import { AbstractControl } from '@angular/forms';
import { of as observableOf } from 'rxjs/internal/observable/of';
import { map } from 'rxjs/operators';

export class ValidationUtil {
    //checks whether email matches with email regex pattern
    static validateEmail(Ac: AbstractControl) {
        let emailRegexPattern = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        return observableOf(emailRegexPattern.test(Ac.value)).pipe(
            map(result => result ? null : { checkEmailPattern: true })
        );
    }

    //checks whether mobile matches with mobile regex pattern
    static validateMobile(Ac: AbstractControl) {
        let mobileRegexPattern = new RegExp(/^[0-9]{10}$/);
        return observableOf(mobileRegexPattern.test(Ac.value)).pipe(
            map(result => result ? null : { checkMobilePattern: true })
        );
    }

    static validateMobileRegular(control: AbstractControl) {
        if (control.value) {
            let mobileRegexPattern = new RegExp(/^[0-9]{10}$/);
            if (!mobileRegexPattern.test(control.value)) {
                return { checkMobilePattern: true };
            }
            return null;
        }
        return null;
    }

    static validatename(Ac: AbstractControl) {
        let nameRegexPattern = new RegExp(/^[a-zA-z]+([\s][a-zA-Z]+)*$/);
        return observableOf(nameRegexPattern.test(Ac.value)).pipe(
            map(result => result ? null : { checknamePattern: true })
        );
    }

    //checks whether password matches with confirm password
    static comparePasswords(AC: AbstractControl) {
        let password = AC.get('password').value; // to get value in input tag
        let confirmPassword = AC.get('confirmPassword').value; // to get value in input tag
        if (password != confirmPassword) {
            console.log('false');
            console.log("Acontrol", AC.root);
            AC.get('confirmPassword').setErrors({ passwordMisMatches: true })
        } else {
            console.log('true');
            AC.get('confirmPassword').setErrors(null)
            return null
        }
    }

    // static compareTime(AC: AbstractControl) {
    //   let startTime = AC.get('startTime').value; // to get value in input tag
    //   let endTime = AC.get('endTime').value; // to get value in input tag
    //   if (startTime == endTime) {
    //     AC.get('endTime').setErrors({ sameTime: true })
    //   } else {
    //     return null
    //   }
    // }

    //check password with Regex pattern
    static validatePasswordPattern(Ac: AbstractControl) {
        let passwordPattern = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#*])[A-Za-z\d@$!#*]{8,}$/);
        return observableOf(passwordPattern.test(Ac.value)).pipe(
            map(result => result ? null : { checkPasswordPattern: true })
        );
    }

    //check FirstName and LastName
    static validateNamePattern(Ac: AbstractControl) {
        let nameRegexPattern = new RegExp(/^[a-zA-Z]+(\s{0,1}[a-zA-Z])*$/);
        return observableOf(nameRegexPattern.test(Ac.value)).pipe(
            map(result => result ? null : { checkNamePattern: true })
        )
    }

    //validate Zipcode USA pattern
    static validateZipcode(Ac: AbstractControl) {
        let zipcodePattern = new RegExp(/(^\d{5,6}$)|(^\d{5}-\d{4}$)/);
        return observableOf(zipcodePattern.test(Ac.value)).pipe(
            map(result => result ? null : { checkZipcodePattern: true })
        )
    }

    //Validate Website Pattern
    static validateWebsitePattern(Ac: AbstractControl) {
        let websitePattern = new RegExp(/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/|www\.)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/);
        return observableOf(websitePattern.test(Ac.value)).pipe(
            map(result => result ? null : { checkWebsitePattern: true })
        )
    }

    //validate Number Only pattern 
    static validateNumberOnly(Ac: AbstractControl) {
        let NumberOnly = new RegExp(/(^[0-9]*$)/);
        return observableOf(NumberOnly.test(Ac.value)).pipe(
            map(result => result ? null : { checkNumberOnly: true })
        )
    }

    static validateFortyCharacters(Ac: AbstractControl) {
        let exceedsFortyCharacters = new RegExp(/(^.{1,40}$)/);
        return observableOf(exceedsFortyCharacters.test(Ac.value)).pipe(
            map(result => result ? null : { exceedsFortyCharacters: true })
        )
    }
}