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

function checkProject(root: string) {
    var checkPaths = ['src/WebApp', 'src/WebApp/scripts/app'];
    var absPaths = checkPaths.map(p => {
        return mpath.resolve(mpath.join(root, p));
    });
    try {
        absPaths.forEach(p => mfs.accessSync(p));
        return true;
    }
    catch (err) {
        return false;
    }
}

function main() {

    console.log(process.argv);

    var dryRun : boolean;
    var projectRoot = mpath.resolve('.');
    if (process.argv.length > 2) {
        dryRun = process.argv[2] == '--dry';
    }

    while (projectRoot != '' && !checkProject(projectRoot)) {
        console.log('Project not found, looking in: ' + projectRoot);
        var root = mpath.parse(projectRoot).dir;
        if (root == projectRoot)
            break;
        projectRoot = root;
    }

    if (!checkProject(projectRoot))
    {
        console.error('Valid project not found! Please run the app from your PE project root!');

    } else {

        var sourceManager = new SourceFileManager(mfs);
        var angularManager = new AngularManager(sourceManager);

        var config = {
            dryRun: dryRun,
            sourceDir : mpath.join(projectRoot, 'src/WebApp/scripts/app'),
            htmlDir : mpath.join(projectRoot, 'src/WebApp')
        };

        console.log('Running with: ');
        console.log(config);

        var sourceFiles = recurse(config.sourceDir, s => s.endsWith('.ts') || s.endsWith('.js'));
        var htmlFiles = recurse(config.htmlDir, s => {
            s = mpath.relative(config.htmlDir, s);
            if (s.endsWith('.cshtml') || s.endsWith('.html')) {
                if (s.startsWith('Content'))
                    return false;
                if (s.startsWith('assets'))
                    return false;
                if (s.startsWith('vendor'))
                    return false;
                if (s.startsWith('less'))
                    return false;
                if (s.startsWith('css'))
                    return false;
                return true;
            }
            return false;
        });

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

        if (!config.dryRun) {
            sourceManager.flush();
        }
    }
}

main();