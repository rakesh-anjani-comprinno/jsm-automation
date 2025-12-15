export const adfToPlainText = (adf) => {
    if (!adf || !adf.content) return '';
  
  function processNode(node, inTable = false) {
    if (!node) return '';

    if (node.type === 'text') {
      return node.text || '';
    }
    
    switch (node.type) {
      case 'paragraph':
        const paragraphText = node.content 
          ? node.content.map(n => processNode(n, inTable)).join('')
          : '';
        return inTable ? paragraphText : paragraphText + '\n';
      
      case 'hardBreak':
        return '\n';
      
      case 'heading':
        const headingText = node.content 
          ? node.content.map(n => processNode(n)).join('')
          : '';
        return headingText + '\n';
      
      case 'bulletList':
      case 'orderedList':
        return node.content 
          ? node.content.map(n => processNode(n)).join('')
          : '';
      
      case 'listItem':
        const listItemText = node.content 
          ? node.content.map(n => processNode(n)).join('')
          : '';
        return '• ' + listItemText;
      
      case 'codeBlock':
        const codeText = node.content 
          ? node.content.map(n => processNode(n)).join('')
          : '';
        return codeText + '\n';
      
      case 'blockquote':
        const quoteText = node.content 
          ? node.content.map(n => processNode(n)).join('')
          : '';
        return '> ' + quoteText + '\n';
      
      case 'table':
        return node.content 
          ? node.content.map(n => processNode(n, true)).join('')
          : '';
      
      case 'tableRow':
        const rowText = node.content 
          ? node.content.map(n => processNode(n, true)).join(' ')
          : '';
        return rowText + '\n';
      
      case 'tableCell':
        return node.content 
          ? node.content.map(n => processNode(n, true)).join('')
          : '';
      
      case 'mediaSingle':
      case 'media':
        return '';
      
      default:
        if (node.content && Array.isArray(node.content)) {
          return node.content.map(n => processNode(n, inTable)).join('');
        }
        return '';
    }
  }
  
  return adf.content.map(n => processNode(n)).join('').trim();
}