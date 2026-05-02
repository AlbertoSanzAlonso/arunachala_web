
const prepareMarkdown = (content) => {
    let text = content;
    
    // Rule from n8n
    // 1. Convert broken bold patterns into valid bold
    // Case: "- * Word *: " -> "- **Word**: "
    text = text.replace(/^(\s*([-*+]|\d+\.)\s*)\*+\s*([^*:\n]+)\s*\*+:/mg, '$1**$3**:');
    
    // Rule from frontend (Problematic)
    // text = text.replace(/([^* \n])\*+:/g, '$1:'); 
    
    // Revised Rule 4.a
    text = text.replace(/([^* \n\t])\*(?![\*]):/g, '$1:');

    return text;
};

const examples = [
    "- * Earth *: is the foundation",
    "- ** Earth **: is the foundation",
    "- **Earth**: is the foundation",
    "Vāta*:",
    "**Root Yourself**: Spend"
];

examples.forEach(ex => {
    console.log(`'${ex}' -> '${prepareMarkdown(ex)}'`);
});
