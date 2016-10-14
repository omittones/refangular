export class Token {
    constructor(
        public name: string,
        public file: string,
        private definition: string,
        private definitionIndex: number) {
    }
}

export function matchHtmlTags(path:string, html:string, tagName:string) {

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