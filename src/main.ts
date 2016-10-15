import * as fs from 'fs';
import * as path from 'path';
import * as changeCase from 'change-case';
import * as core from './core';

function recurse(file: string, include?: (s: string) => boolean): string[] {
    include = include || function() { return true };

    let output: string[] = [];
    let files = fs.readdirSync(file);
    for (let i = 0; i < files.length; i++) {
        var current = path.join(file, files[i]);
        var stat = fs.statSync(current);
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

export function findDirectiveUsage(path: string, directive: core.Token): core.Token[] {
    var directiveTag = changeCase.paramCase(directive.name);
    var contents = fs.readFileSync(path, 'utf8');
    return core.matchHtmlTags(path, contents, directiveTag);
}

export function findDirectives(path: string): core.Token[] {
    var contents = fs.readFileSync(path, 'utf8');
    return core.matchDirectiveCalls(path, contents);
}

function main() {

    var sourceFiles = recurse('D:/Code/neogov/platform/src/WebApp/scripts/app', s => s.endsWith('.ts') || s.endsWith('.js'));
    var htmlFiles = recurse('D:/Code/neogov/platform/src/WebApp', s => s.endsWith('.cshtml') || s.endsWith('.html'));

    var endsWithDirective: string[] = [];
    var directiveDefinition: core.Token[] = [];

    sourceFiles.forEach(srcFile => {

        if (srcFile.endsWith('.directive.js') ||
            srcFile.endsWith('.directive.ts')) {
            endsWithDirective.push(srcFile);
        }

        var directives = findDirectives(srcFile);
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

        let allDirectiveUsages: core.Token[] = [];
        allFiles.forEach(file => {
            var usesInFile = findDirectiveUsage(file, directive);
            if (usesInFile.length > 0) {
                console.log(`      - used ${usesInFile.length} times in ${file}`);
                allDirectiveUsages = allDirectiveUsages.concat(usesInFile);
            }
        });
        console.log(`      - totaling ${allDirectiveUsages.length} times`);




    });
}

main();