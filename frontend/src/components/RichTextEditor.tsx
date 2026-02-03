import React, { useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'quill-emoji/dist/quill-emoji.css';
import * as Emoji from 'quill-emoji';

// Register emoji module
ReactQuill.Quill.register('modules/emoji', Emoji);

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, className }) => {
    const modules = {
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                ['link', 'image'],
                ['emoji'], // Add emoji button to toolbar
                ['clean']
            ]
        },
        'emoji-toolbar': true,
        'emoji-textarea': false,
        'emoji-shortname': true,
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image',
        'emoji' // Add emoji format
    ];

    const quillRef = React.useRef<ReactQuill>(null);

    return (
        <div className={`rich-text-editor ${className || ''}`}>
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                className="bg-white rounded-md"
            />
            <style>{`
                .ql-container {
                    border-bottom-left-radius: 0.375rem;
                    border-bottom-right-radius: 0.375rem;
                    min-height: 200px;
                }
                .ql-toolbar {
                    border-top-left-radius: 0.375rem;
                    border-top-right-radius: 0.375rem;
                }
                .ql-editor {
                    min-height: 200px;
                    font-family: inherit;
                    font-size: 1rem;
                }
                /* Fix for missing emoji icon */
                .ql-snow .ql-picker.ql-emoji {
                    width: 28px;
                }
                button.ql-emoji svg {
                    display: none; /* Hide original svg if it exists and is broken */
                }
                button.ql-emoji::before {
                    content: "😀";
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                    margin-top: -2px;
                }
                button.ql-emoji:hover::before {
                    content: "😃";
                }
            `}</style>
        </div>
    );
};

export default RichTextEditor;
