import * as mcore from './core'
import { camelCase, paramCase } from 'change-case';

export default class AngularManager {

    public directives: mcore.Token[];
    public htmls: mcore.Token[];
    private tokens: mcore.TokenCollection;
    private files: string[];

    constructor(private manager: mcore.ISourceFileManager) {
        this.tokens = new mcore.TokenCollection([], manager);
        this.directives = [];
        this.htmls = [];
        this.files = [];
    }

    private checkAndAddDirective(directive: mcore.Token) {
        var names = this.directives.map(d => d.name);
        if (names.indexOf(directive.name) != -1)
            throw `Directive "${directive.name}" already added!`;
        this.directives.push(directive);
    }

    public addFile(path: string) {

        //process this file for directive definitions
        let content = this.manager.load(path);
        let fileDirectives = mcore.matchDirectiveCalls(path, content);
        if (fileDirectives.length > 0) {
            fileDirectives.forEach(directive => {
                let directiveTag = paramCase(directive.name);
                this.checkAndAddDirective(directive);

                //process all files again for tags
                this.files.forEach(f => {
                    let content = this.manager.load(f);
                    let htmls = mcore.matchHtmlTags(f, content, directiveTag);
                    this.tokens.add(htmls);
                    this.htmls = this.htmls.concat(htmls);
                });
            });
            this.tokens.add(fileDirectives);
        }

        //process this file for existing tags
        this.directives.forEach(d => {
            var tagName = paramCase(d.name);
            let htmls = mcore.matchHtmlTags(path, content, tagName);
            this.tokens.add(htmls);
            this.htmls = this.htmls.concat(htmls);
        });
    }

    public logStatistics():void {
        // console.log(`      Directive files: ${endsWithDirective.length}`);
        // console.log(`Directive definitions: ${directiveDefinition.length}`);
        // console.log();
        // this.directives.forEach(definition => {
        //     console.log(`-- ${definition.name} ------ ${definition.file}`)
        //     let allDirectiveUsages: mcore.Token[] = [];
        //     allFiles.forEach(file => {
        //         var usesInFile = angularManager.findDirectiveUsage(file, definition);
        //         if (usesInFile.length > 0) {
        //             console.log(`      - used ${usesInFile.length} times in ${file}`);
        //             allDirectiveUsages = allDirectiveUsages.concat(usesInFile);
        //         }
        //     });
        //     console.log(`      - totaling ${allDirectiveUsages.length} times`);
        //     var replacementName = mcore.extractDirectiveNameFromFile(definition.file);
        //     if (replacementName != null) {
        //         mcore.replaceToken(sourceManager, definition, replacementName.declarationName);
        //         allDirectiveUsages.forEach(usage => {
        //             mcore.replaceToken(sourceManager, usage, replacementName.tagName);
        //         });
        //     } else {
        //         console.error('Could not infer directive name!');
        //     }
        // });
    }

    public tidyUp(fileToDirective: (file:string) => mcore.DirectiveName): void {

        this.directives.forEach(directive => {

            var directiveTag = paramCase(directive.name);
            var renamed = fileToDirective(directive.file);
            if (renamed == null) {
                throw `Failed to infer directive name in ${directive.file}`;
            }

            console.log(`\nPROCESSING ${directive.file}`);
            if (renamed.tagName != directiveTag) {

                console.log(`    JS: Replacing ${directive.name} with ${renamed.declarationName}`);
                this.tokens.replaceToken(directive, renamed.declarationName);

                this.htmls.forEach(html => {
                    if (html.name === directiveTag) {
                        console.log(`  HTML: Replacing ${html.name} with ${renamed.tagName}`);
                        this.tokens.replaceToken(html, renamed.tagName);
                    }
                });
            }
        });

    }
}