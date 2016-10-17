import * as core from '../src/core';
import * as mocha from 'mocha';
import SourceFileManager from '../src/source-file-manager';
import AngularManager from '../src/angular-manager';
import { expect } from 'chai';

describe('AngularManager', function() {

    var testFiles: any = {
        js: `
            module.directive('singleTag', function(){ return { shouldNotBeReplaced: 'singleTag' }; });
        `,
        html: `
        <single-tag></single-tag>
        <single-tag single-tag=""></single-tag>
        < single-tag></ single-tag>
        <single-tag />
        <single-tag/>
        <single-tag single-tag="" />
        `
    };

    var fakeSM: core.ISourceFileManager = {
        load: function(filename: string): string {
            return testFiles[filename];
        },
        save: function(filename: string, data: any): void {
            testFiles[filename] = data;
        },
        flush: function(): void { }
    };

    var sut: AngularManager = new AngularManager(fakeSM);
    sut.addFile('js');
    sut.addFile('html');

    it('should find directive definitions', function() {
        expect(sut.directives.length).to.be.eql(1);
        expect(sut.directives[0].name).to.be.eql('singleTag');
    });

    it('should find html tags', function() {
        expect(sut.htmls.length).to.equal(9);
        sut.htmls.forEach(tag => {
            expect(tag.name).to.be.eql('single-tag');
        });
    });
});

describe('extractDirectiveNameFromFile', function() {

    it('should return directive name', function() {
        var name = core.extractDirectiveNameFromFile('D:/Code/some-site.directive','D:/Code/some-site.directive/other/other-thing.directive.ts');
        expect(name).to.not.be.null;
        expect(name.tagName).to.equal('other-thing');
        expect(name.declarationName).to.equal('otherThing');
    });

    it('should check directive postfix', function() {
        var name = core.extractDirectiveNameFromFile('D:/Code/some-site.directive', 'D:/Code/some-site.directive/other/other-thing.ts');
        expect(name).to.be.null;
    });

    it('should check directive parent dir', function() {
        var name = core.extractDirectiveNameFromFile('D:/Code/some-site.directive', 'D:/Code/some-site.directive/parent/other-thing.directive.ts');
        expect(name).to.be.null;
    });

    it('should work for js files', function() {
        var name = core.extractDirectiveNameFromFile('D:/Code/some-site.directive', 'D:/Code/some-site.directive/other/other-thing.directive.js');
        expect(name).to.not.be.null;
        expect(name.tagName).to.equal('other-thing');
        expect(name.declarationName).to.equal('otherThing');
    });

    it('should not prepend direct parent', function() {
        var name = core.extractDirectiveNameFromFile('D:/Code/apps','D:/Code/apps/goal-feature/goal-feature.directive.ts');
        expect(name).to.not.be.null;
        expect(name.tagName).to.be.eql('goal-feature');
    });

    it('should prepend parents', function() {
        var name = core.extractDirectiveNameFromFile('D:/Code/apps', 'D:/Code/apps/first/second/third/third-yes-no.directive.ts');
        expect(name).to.not.be.null;
        expect(name.tagName).to.be.eql('first-second-third-yes-no');
    });
});


describe('SourceFileManager', function() {

    var loaded: string[] = [];
    var saved: string[] = [];
    var fakeFS: core.IFileSystem = {
        readFileSync: function(filename: string) {
            loaded.push(filename);
            return '<contents>' + filename + '</contents>';
        },
        writeFileSync: function(filename: string, data: any): void {
            saved.push(filename);
        }
    };

    var sut: SourceFileManager;

    beforeEach(function() {
        loaded.length = 0;
        saved.length = 0;
        sut = new SourceFileManager(fakeFS, s => s);
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