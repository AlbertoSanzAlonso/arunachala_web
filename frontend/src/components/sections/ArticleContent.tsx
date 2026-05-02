
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { prepareArticleContent } from 'utils/markdownUtils';

interface ArticleContentProps {
    body: string;
    onImageClick: (src: string) => void;
}

const ArticleContent: React.FC<ArticleContentProps> = ({ body, onImageClick }) => {
    const { processed, isHtml } = prepareArticleContent(body || '');

    if (isHtml) {
        return (
            <div 
                className="prose prose-slate max-w-none prose-p:leading-relaxed prose-headings:font-headers prose-headings:text-forest prose-img:rounded-3xl prose-img:shadow-lg prose-img:cursor-zoom-in" 
                dangerouslySetInnerHTML={{ __html: processed }} 
                onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.tagName === 'IMG') {
                        onImageClick((target as HTMLImageElement).src);
                    }
                }}
            />
        );
    }

    return (
        <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-headings:font-headers prose-headings:text-forest prose-img:rounded-3xl prose-img:shadow-lg prose-img:cursor-zoom-in">
            <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                    img: ({node, ...props}) => (
                        <img 
                            {...props} 
                            alt={props.alt || "Article image"}
                            onClick={() => props.src && onImageClick(props.src)} 
                            className="cursor-zoom-in hover:opacity-95 transition-opacity" 
                        />
                    )
                }}
            >
                {processed}
            </ReactMarkdown>
        </div>
    );
};

export default ArticleContent;
