export function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function extractTextFromHtml(html: string): string {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.innerText || temp.textContent || '';
}

export function convertHtmlToMarkdown(html: string): string {
  // A very basic HTML to Markdown converter for simple TipTap output
  let md = html;
  
  // Replace headings
  md = md.replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n');
  
  // Replace lists
  md = md.replace(/<ul data-type="taskList">/g, '<ul>');
  md = md.replace(/<li data-type="taskItem" data-checked="true">.*?<label>.*?<\/label><div>(.*?)<\/div><\/li>/gi, '- [x] $1\n');
  md = md.replace(/<li data-type="taskItem" data-checked="false">.*?<label>.*?<\/label><div>(.*?)<\/div><\/li>/gi, '- [ ] $1\n');
  
  md = md.replace(/<ul>/g, '\n');
  md = md.replace(/<\/ul>/g, '\n');
  md = md.replace(/<ol>/g, '\n');
  md = md.replace(/<\/ol>/g, '\n');
  md = md.replace(/<li>(.*?)<\/li>/gi, '- $1\n');
  
  // Bold, italic, strike
  md = md.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i>(.*?)<\/i>/gi, '*$1*');
  md = md.replace(/<u>(.*?)<\/u>/gi, '<u>$1</u>'); // no standard MD underline
  
  // Paragraphs
  md = md.replace(/<p>(.*?)<\/p>/gi, '$1\n\n');
  
  // Clean up extra spaces
  md = md.replace(/<[^>]*>?/gm, ''); // remove remaining tags
  md = md.replace(/\n\s*\n\s*\n/g, '\n\n'); // Max 2 newlines
  
  return md.trim();
}
