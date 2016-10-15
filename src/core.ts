import * as mpath from 'path';
import * as mchangeCase from 'change-case';

export class Token {
    constructor(
        public name: string,
        public file: string,
        public definition: string,
        public definitionIndex: number) {
    }
}

export interface DirectiveName {
    declarationName: string;
    tagName: string;
}

export function extractDirectiveNameFromFile(path: string): DirectiveName {

    const directiveToken = '.directive';

    var directive = mpath.parse(path);
    var parent = mpath.parse(directive.dir);

    if (directive.name.endsWith(directiveToken)) {
        var tagName = directive.name.substring(0, directive.name.length - directiveToken.length);
        if (tagName.startsWith(parent.name)) {
            return {
                declarationName: mchangeCase.camel(tagName),
                tagName: tagName
            };
        }
    }

    return null;
}

export function matchDirectiveCalls(path: string, source: string) {

    var regex: RegExp = /\.\s*directive\(["']([\w\.\(\)]*)['"][^\w]/gm;
    let directives: Token[] = [];
    let match: RegExpExecArray = null;
    while ((match = regex.exec(source)) !== null) {
        console.assert(match.length === 2, 'Match should have only one group!');
        var definition = new Token(match[1], path, match[0], match.index);
        directives.push(definition);
    }

    return directives;
}

export function matchHtmlTags(path: string, html: string, tagName: string) {

    var regexStart: RegExp = new RegExp(`\\<\\s*${tagName}(?:\\s|\\/\\>|\\>)`, 'gm');
    var regexEnd: RegExp = new RegExp(`\\<\\/\\s*${tagName}\\s*\\>`, 'gm');
    let usages: Token[] = [];
    let match: RegExpExecArray = null;

    while ((match = regexStart.exec(html)) !== null) {
        console.assert(match.length === 1, 'There should be no groups!');
        var usage = new Token(tagName, path, match[0], match.index);
        usages.push(usage);
    }

    while ((match = regexEnd.exec(html)) !== null) {
        console.assert(match.length === 1, 'There should be no groups!');
        var usage = new Token(tagName, path, match[0], match.index);
        usages.push(usage);
    }

    return usages;
}