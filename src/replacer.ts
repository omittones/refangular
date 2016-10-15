import * as core from './core';

function load(file: string): string {
    return '';
}

function save(file: string, content: string): void {

}

function replaceToken(token: core.Token, replacementName: string) {

    var content = load(token.file);

    var newDefinition = token.definition.replace(token.name, replacementName);
    var begin = content.substr(0, token.definitionIndex);
    var end = content.substring(token.definitionIndex + token.definition.length);
    content = begin + newDefinition + end;

    save(token.file, content);
}