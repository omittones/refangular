import * as mfs from 'fs';
import * as mpath from 'path';
import * as mcore from './core';
import SourceFileManager from './source-file-manager';
import AngularManager from './angular-manager';

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

function main() {

    var sourceManager = new SourceFileManager(mfs);
    var angularManager = new AngularManager(sourceManager);

    var sourceFiles = recurse('D:/Code/neogov/platform/src/WebApp/scripts/app', s => s.endsWith('.ts') || s.endsWith('.js'));
    var htmlFiles = recurse('D:/Code/neogov/platform/src/WebApp', s => s.endsWith('.cshtml') || s.endsWith('.html'));

    var endsWithDirective: string[] = [];
    sourceFiles.forEach(srcFile => {

        if (srcFile.endsWith('.directive.js') ||
            srcFile.endsWith('.directive.ts')) {
            endsWithDirective.push(srcFile);
        }

        angularManager.addFile(srcFile);
    });

    htmlFiles.forEach(htmlFile => {
        angularManager.addFile(htmlFile);
    })

    console.log(`      Directive files: ${endsWithDirective.length}`);
    console.log(`Directive definitions: ${angularManager.directives.length}`);
    console.log();

    angularManager.logStatistics();

    let naming = mcore.extractDirectiveNameFromFile.bind(null, 'D:/Code/neogov/platform/src/WebApp/scripts/app');

    angularManager.tidyUp(naming);

    sourceManager.flush();
}

main();