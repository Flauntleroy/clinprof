'use client';

import DOMPurify from 'isomorphic-dompurify';

interface SafeHTMLProps {
    html: string;
    className?: string;
}

/**
 * SafeHTML Component
 * Renders HTML content safely by sanitizing it with DOMPurify
 * to prevent XSS attacks from malicious scripts in content
 */
export default function SafeHTML({ html, className }: SafeHTMLProps) {
    // Configure DOMPurify to allow safe HTML tags
    const cleanHTML = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'br', 'hr',
            'ul', 'ol', 'li',
            'strong', 'b', 'em', 'i', 'u', 's', 'strike',
            'a', 'img',
            'blockquote', 'pre', 'code',
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'div', 'span',
            'figure', 'figcaption',
            'iframe', // Allow for YouTube embeds
        ],
        ALLOWED_ATTR: [
            'href', 'src', 'alt', 'title', 'class', 'id', 'style',
            'target', 'rel',
            'width', 'height',
            'rowspan', 'colspan',
            'frameborder', 'allowfullscreen', 'allow', // for iframe
        ],
        // Allow safe URI schemes
        ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
        // Strip potentially dangerous attributes
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
        // Strip potentially dangerous tags completely (not just sanitize)
        FORBID_TAGS: ['script', 'style', 'object', 'embed', 'form', 'input', 'button'],
    });

    return (
        <div
            className={className}
            dangerouslySetInnerHTML={{ __html: cleanHTML }}
        />
    );
}
