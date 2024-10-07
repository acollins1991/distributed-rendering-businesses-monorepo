import { LowerCaseValidator, MaxLengthValidator, MinLengthValidator, PasswordValidatorManager, SpecialCharacterValidator, UpperCaseValidator } from '@password-validator/core';

const pm = PasswordValidatorManager.standard(); // Create a password validator manager

const minLength = new MinLengthValidator(8); // Minimum length of 8 characters
const maxLength = new MaxLengthValidator(24); // Maximum length of 16 characters
const uppercases = new UpperCaseValidator(1); // At least 2 uppercase characters
const lowercases = new LowerCaseValidator(1); // At least 2 lowercase characters
const specialCharacters = new SpecialCharacterValidator(1); // At least 2 special characters

// Register all the validators with the manager
pm.register(minLength, maxLength, uppercases, lowercases, specialCharacters);

export default function validatePassword(password: string) {
    return pm.validate(password)
}