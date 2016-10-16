import * as mfs from 'fs';
import * as mpath from 'path';
import * as mchangeCase from 'change-case';
import * as mcore from './core';
import * as msfm from './source-file-manager';

function recurse(file: string, include?: (s: string) => boolean): string[] {
    include = include || function() { return true };

    let output: string[] = [];
    let files = mfs.readdirSync(file);
    for (let i = 0; i < files.length; i++) {
        var current = mpath.join(file, files[i]);
        var stat = mfs.statSync(current);
        if (stat.isFile()) {
            if (include(current))
                output.push(current);
        }
        else if (stat.isDirectory()) {
            var children = recurse(current, include);
            children.forEach(c => {
                output.push(c);
            });
        }
    }

    return output;
}

class AngularManager {

    constructor(private manager: msfm.SourceFileManager) {
    }

    public findDirectiveUsage(path: string, directive: mcore.Token): mcore.Token[] {
        var directiveTag = mchangeCase.paramCase(directive.name);
        var contents = this.manager.load(path);
        return mcore.matchHtmlTags(path, contents, directiveTag);
    }

    public findDirectives(path: string): mcore.Token[] {
        var contents = this.manager.load(path);
        return mcore.matchDirectiveCalls(path, contents);
    }
}


function main() {

    var sourceManager = new msfm.SourceFileManager(mfs);
    var angularManager = new AngularManager(sourceManager);

    var sourceFiles = recurse('D:/Code/neogov/platform/src/WebApp/scripts/app', s => s.endsWith('.ts') || s.endsWith('.js'));
    var htmlFiles = recurse('D:/Code/neogov/platform/src/WebApp', s => s.endsWith('.cshtml') || s.endsWith('.html'));

    var endsWithDirective: string[] = [];
    var directiveDefinition: mcore.Token[] = [];

    sourceFiles.forEach(srcFile => {

        if (srcFile.endsWith('.directive.js') ||
            srcFile.endsWith('.directive.ts')) {
            endsWithDirective.push(srcFile);
        }

        var directives = angularManager.findDirectives(srcFile);
        if (directives.length > 0) {
            directiveDefinition = directiveDefinition.concat(directives);
        }
    });

    console.log(`      Directive files: ${endsWithDirective.length}`);
    console.log(`Directive definitions: ${directiveDefinition.length}`);
    console.log();

    var allFiles = htmlFiles.concat(sourceFiles);

    directiveDefinition.forEach(directive => {

        console.log(`-- ${directive.name} ------ ${directive.file}`)

        let allDirectiveUsages: mcore.Token[] = [];
        allFiles.forEach(file => {
            var usesInFile = angularManager.findDirectiveUsage(file, directive);
            if (usesInFile.length > 0) {
                console.log(`      - used ${usesInFile.length} times in ${file}`);
                allDirectiveUsages = allDirectiveUsages.concat(usesInFile);
            }
        });
        console.log(`      - totaling ${allDirectiveUsages.length} times`);

        var replacementName = mcore.extractDirectiveNameFromFile(directive.file);
        if (replacementName != null) {

            sourceManager.replaceToken(directive, replacementName.declarationName);
            allDirectiveUsages.forEach(token => {
                sourceManager.replaceToken(token, replacementName.tagName);
            });

        } else {
            console.error('Could not infer directive name!');
        }
    });

    //sourceManager.flush();
}

main();