import { z } from 'zod';
import ValidateData from 'src/support/helpers/ValidateData';
import { ErrorMessage } from 'src/support/helpers/errorMessage';
import getErrorName from 'src/support/helpers/getErrorName';
import { HttpStatusCode } from 'src/support/helpers/HttpStatusCode';
import HttpRequestErrors from 'src/support/helpers/HttpRequestErrors';

describe('Helpers :: ValidateData', () => {
    const testToThrowError = (err: HttpRequestErrors, errMessage: string, code: number): void => {
        expect(err).toHaveProperty('message');
        expect(err).toHaveProperty('code');
        expect(err).toHaveProperty('name');
        expect(err.message).toStrictEqual(errMessage);
        expect(err.code).toBe(code);
        expect(err.name).toBe(getErrorName(code));
    };

    describe('when a zod validate.entry is successfull', () => {
        it('should not throw any error', () => {
            try {
                const testZodSchema = z.object({
                    value: z.number().min(5),
                });

                const testObject = { value: 10 };
                const validate = new ValidateData();
                validate.entry(testZodSchema, testObject);
                expect(true).toBe(true);
            } catch (error) {
                expect(error).toBeUndefined();
            }
        });
    });

    describe('when a zod validate.entry fail', () => {
        it('should throw an error', () => {
            try {
                const testZodSchema = z.object({
                    value: z.number().min(5),
                });

                const testObject = { noNumber: '10' };
                const validate = new ValidateData();
                validate.entry(testZodSchema, testObject);
                expect(true).toBe(false);
            } catch (error) {
                const zodError = error as HttpRequestErrors;
                testToThrowError(zodError, zodError.message, HttpStatusCode.UNPROCESSABLE_ENTITY);
                expect(zodError.message).toStrictEqual('Schema error');
            }
        });
    });

    describe('when a zod validate.entryReturn is successfull', () => {
        it('should return null', () => {
            const testZodSchema = z.object({
                value: z.number().min(5),
            });

            const testObject = { value: 10 };
            const validate = new ValidateData();
            const schema = validate.entryReturn(testZodSchema, testObject);
            expect(schema).toBeNull();
        });
    });

    describe('when a zod validate.entryReturn fail', () => {
        it('should return errors', () => {
            const testZodSchema = z.object({
                value: z.number().min(5),
            });

            const testObject = { noNumber: '10' };
            const validate = new ValidateData();
            const schema = validate.entryReturn(testZodSchema, testObject);
            expect(!schema).toBe(false);
        });
    });

    describe('when validate.existance fail', () => {
        const errorCondition = true;
        it('should throw a an error', () => {
            try {
                const validate = new ValidateData();
                validate.existance(errorCondition, ErrorMessage.BAD_REQUEST);
                expect(validate.existance).toThrow(Error);
            } catch (error) {
                const notFoundError = error as HttpRequestErrors;
                testToThrowError(notFoundError, ErrorMessage.BAD_REQUEST, HttpStatusCode.BAD_REQUEST);
            }
        });
    });

    describe('when validate.existance is sucessfull', () => {
        const errorCondition = false;
        it('should not throw an error', () => {
            try {
                const validate = new ValidateData();
                validate.existance(errorCondition, ErrorMessage.BAD_REQUEST);
            } catch (error) {
                expect(error).toBeUndefined();
            }
        });
    });
});
