import generateIDParam, {
    generateHeaderParam,
    generateQueryParam,
} from 'src/domains/common/helpers/parametersWrapper';

describe.only('Domains :: Common :: Helpers :: ParametersWrapper', () => {
    describe('When generate an id', () => {
        it('should return an array with correct param', () => {
            const param = generateIDParam();

            expect(param.length).to.be.equal(1);
            expect(param[0].name).to.be.equal('id');
            expect(param[0].location).to.be.equal('path');
            expect(param[0].required).to.be.equal(true);
            expect(param[0].type).to.be.equal('string');
        });
    });

    describe('When generate a query', () => {
        it('should return an array with correct param', () => {
            const param = generateQueryParam(2, [
                {
                    name: 'active',
                    type: 'boolean',
                },
                {
                    name: 'showForm',
                    type: 'string',
                },
            ]);

            expect(param.length).to.be.equal(2);
            expect(param[0].name).to.be.equal('active');
            expect(param[0].location).to.be.equal('query');
            expect(param[0].required).to.be.equal(true);
            expect(param[0].type).to.be.equal('boolean');

            expect(param[1].name).to.be.equal('showForm');
            expect(param[1].location).to.be.equal('query');
            expect(param[1].required).to.be.equal(true);
            expect(param[1].type).to.be.equal('string');
        });
    });

    describe('When generate a header', () => {
        it('should return an array with correct param', () => {
            const param = generateHeaderParam(1, [{ name: 'test', type: 'number' }]);

            expect(param.length).to.be.equal(1);
            expect(param[0].name).to.be.equal('test');
            expect(param[0].location).to.be.equal('header');
            expect(param[0].required).to.be.equal(true);
            expect(param[0].type).to.be.equal('number');
        });
    });
});
