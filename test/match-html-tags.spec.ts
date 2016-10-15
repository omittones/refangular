import * as core from '../src/core';
import * as mocha from 'mocha';
import { expect } from 'chai';

describe('when parsing html', function() {

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
        expect(usages.length).to.be.equal(9);
    })
});

describe('when parsing path', function() {

    it('directive name can be parsed', function() {

        var name = core.extractDirectiveNameFromFile('D:/Code/some-site.directive/other/other-thing.directive.ts');
        expect(name.tagName).to.be.equal('other-thing');
        expect(name.declarationName).to.be.equal('otherThing');

    });

    it('directive postfix should be respected', function() {
        var name = core.extractDirectiveNameFromFile('D:/Code/some-site.directive/other/other-thing.ts');
        expect(name).to.be.null;
    });

    it('directive parent dir should be respected', function() {
        var name = core.extractDirectiveNameFromFile('D:/Code/some-site.directive/parent/other-thing.directive.ts');
        expect(name).to.be.null;
    });

    it('js files should also work', function() {
        var name = core.extractDirectiveNameFromFile('D:/Code/some-site/other/other-thing.directive.js');
        expect(name.tagName).to.be.equal('other-thing');
        expect(name.declarationName).to.be.equal('otherThing');
    });

});