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

export class TokenCollection {

    constructor(
        private tokens: Token[],
        private manager: ISourceFileManager) {
    }

    public add(tokens: Token[]) {
        this.tokens = this.tokens.concat(tokens);
    }

    public replaceToken(token: Token, replacementName: string) {

        var content = this.manager.load(token.file);

        var newDefinition = token.definition.replace(token.name, replacementName);
        var sizeDiff = newDefinition.length - token.definition.length;
        var begin = content.substr(0, token.definitionIndex);
        var end = content.substring(token.definitionIndex + token.definition.length);
        content = begin + newDefinition + end;

        token.definition = newDefinition;
        token.name = replacementName;

        this.tokens.forEach(t => {
            if (t.file === token.file &&
                t.definitionIndex > token.definitionIndex) {
                t.definitionIndex += sizeDiff;
            }
        });

        this.manager.save(token.file, content);
    }
}

export interface ISourceFileManager {
    load(file: string): string;
    save(file: string, content: string): void;
    flush(): void;
}

export interface IFileSystem {
    readFileSync(filename: string, options: { encoding: string; flag?: string; }): string;
    writeFileSync(filename: string, data: any, options?: { encoding?: string; mode?: string; flag?: string; }): void;
}

export interface DirectiveName {
    declarationName: string;
    tagName: string;
}

export function extractDirectiveNameFromFile(rootPath: string, filePath: string): DirectiveName {

    const directiveToken = '.directive';
    rootPath = mpath.resolve(rootPath);
    filePath = mpath.resolve(filePath);

    var relativePath = mpath.relative(rootPath, filePath);
    if (relativePath) {
        var file = mpath.parse(relativePath);
        if (file.name.endsWith(directiveToken)) {
            var name = file.name.substring(0, file.name.length - directiveToken.length);
            file = mpath.parse(file.dir);

            if (name.startsWith(file.name)) {
                file = mpath.parse(file.dir);
                while (file.name != '') {
                    name = file.name + '-' + name;
                    file = mpath.parse(file.dir);
                }

                return {
                    declarationName: mchangeCase.camel(name),
                    tagName: name
                };
            }
        }
    } else {
        throw 'Could not determine relative path!';
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