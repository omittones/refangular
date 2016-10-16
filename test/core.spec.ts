import * as core from '../src/core';
import * as sfm from '../src/source-file-manager';
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


describe('SourceFileManager', function() {

    var loaded: string[] = [];
    var saved: string[] = [];
    var fakeFS: sfm.IFileSystem = {
        readFileSync: function(filename: string) {
            loaded.push(filename);
            return '<contents>' + filename + '</contents>';
        },
        writeFileSync: function(filename: string, data: any): void {
            saved.push(filename);
        }
    };

    var sut: sfm.SourceFileManager;

    beforeEach(function() {
        loaded.length = 0;
        saved.length = 0;
        sut = new sfm.SourceFileManager(fakeFS, s => s);
    });

    it('should not call load for same file twice', function() {
        sut.load('one');
        sut.load('two');
        sut.load('one');
        expect(loaded).to.be.eql(['one', 'two']);
    });

    it('should not save immediately', function() {
        sut.load('one');
        sut.save('one', 'newContent');
        expect(sut.load('one')).to.be.eql('newContent');
        expect(saved.length).to.be.eql(0);
    });

    it('should not flush unchanged files', function() {
        sut.load('one');
        sut.load('two');
        sut.load('one');
        sut.load('two');
        sut.flush();
        expect(saved.length).to.be.eql(0);
    });

    it('should flush changed files', function() {
        sut.load('one');
        sut.load('two');
        sut.save('one', 'replaced');
        sut.flush();
        expect(saved.length).to.be.eql(1);
        expect(saved[0]).to.be.eql('one');
    });

});