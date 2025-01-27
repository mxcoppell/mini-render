import { marked } from 'marked';
import { CodeBlock, ProcessedContent, RendererOptions } from './types';

export class MiniRenderer {
    private options: RendererOptions;

    constructor(options: RendererOptions = {}) {
        this.options = options;
    }

    public render(content: string): string {
        if (!content) {
            return '<p>Please select a file to view its content.</p>';
        }

        // Step 1: Protect code blocks
        const { content: processedContent, blocks } = this.preprocessContent(content);

        // Step 2: Parse markdown
        const rendered = marked.parse(processedContent) as string;

        // Step 3: Restore code blocks and add copy buttons
        return this.restoreContent(rendered, blocks);
    }

    private preprocessContent(content: string): ProcessedContent {
        let blocks: CodeBlock[] = [];
        let counter = 0;

        // Helper function to store and replace content
        const store = (match: string, lang: string, code: string): string => {
            const id = `BLOCK_${counter++}`;
            blocks.push({ id, content: code, lang });
            return id;
        };

        // Protect code blocks and preserve language specifier
        // Use negative lookbehind to avoid matching escaped backslashes
        content = content.replace(/(?<!\\)```(\w*)\n([\s\S]*?)(?<!\\)```/g, store);

        return { content, blocks };
    }

    private renderMarkdownInCodeBlock(content: string): string {
        return marked.parse(content) as string;
    }

    private restoreContent(content: string, blocks: CodeBlock[]): string {
        blocks.forEach(({ id, content: originalContent, lang }) => {
            const languageLabel = `<span class="language-label">${lang || 'text'}</span>`;
            if (lang === 'markdown') {
                const renderedMarkdown = this.renderMarkdownInCodeBlock(originalContent);
                content = content.replace(id, `<div class="code-block-container"><div class="rendered-markdown-container"><div class="rendered-markdown">${renderedMarkdown}</div><div class="raw-markdown" style="display:none;">${originalContent}</div></div>${languageLabel}</div>`);
            } else {
                content = content.replace(id, `<div class="code-block-container"><pre><code class="language-${lang}">${originalContent}</code></pre>${languageLabel}</div>`);
            }
        });
        return content;
    }
} 
