import { Token, IFileSystem, ISourceFileManager } from './core';
import * as mpath from 'path';

export default class SourceFileManager implements ISourceFileManager {

    private map: Map<string, string>;
    private dirty: string[];

    constructor(
        private filesystem: IFileSystem,
        private pathResolver?: (s: string) => string) {

        this.map = new Map<string, string>();
        this.dirty = [];
        if (!this.pathResolver)
            this.pathResolver = mpath.resolve;
    }

    public load(file: string): string {
        file = this.pathResolver(file);
        if (this.map.has(file)) {
            return this.map.get(file);
        } else {
            var contents = this.filesystem.readFileSync(file, { encoding: 'utf8' });
            if (contents != null)
                this.map.set(file, contents);
            return contents;
        }
    }

    public save(file: string, content: string): void {
        file = this.pathResolver(file);
        console.assert(this.map.has(file));
        this.map.set(file, content);
        this.dirty.push(file);
    }

    public flush(): void {
        var total = 0;
        this.dirty.forEach(file => {
            var contents = this.map.get(file);
            this.filesystem.writeFileSync(file, contents, {
                encoding: 'utf8'
            });
        });
    }
}
