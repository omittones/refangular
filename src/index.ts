import * as fs from 'fs';
import * as path from 'path';

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

var sourceFiles = recurse('.', s => {
    return s.endsWith('.ts') || s.endsWith('.js');
});

sourceFiles.forEach(f => {
    console.log(f);
});