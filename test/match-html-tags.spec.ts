import * as core from '../src/core';
import * as mocha from 'mocha';
import { expect } from 'chai';

describe('matchHtmlTags', function() {

    var test = `
<single-tag></single-tag>
<single-tag single-tag=""></single-tag>
< single-tag></ single-tag>
<single-tag />
<single-tag/>
<single-tag single-tag="" />
`;

    it('should find all tag forms', function() {
        var usages = core.matchHtmlTags('', test, 'single-tag');
        expect(usages.length).to.equal(9);
    });

});

describe('extractDirectiveNameFromFile', function() {

    it('should return directive name', function() {

        var name = core.extractDirectiveNameFromFile('D:/Code/some-site.directive/other/other-thing.directive.ts');
        expect(name.tagName).to.equal('other-thing');
        expect(name.declarationName).to.equal('otherThing');

    });

    it('should check directive postfix', function() {
        var name = core.extractDirectiveNameFromFile('D:/Code/some-site.directive/other/other-thing.ts');
        expect(name).to.null;
    });

    it('should check directive parent dir', function() {
        var name = core.extractDirectiveNameFromFile('D:/Code/some-site.directive/parent/other-thing.directive.ts');
        expect(name).to.null;
    });

    it('should work for js files', function() {
        var name = core.extractDirectiveNameFromFile('D:/Code/some-site/other/other-thing.directive.js');
        expect(name.tagName).to.equal('other-thing');
        expect(name.declarationName).to.equal('otherThing');
    });

});