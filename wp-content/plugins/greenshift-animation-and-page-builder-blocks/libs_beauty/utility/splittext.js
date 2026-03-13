function splitTextIntoLinesAndWords() {
  const elements = document.querySelectorAll('.gs-split-words, [data-aos-split]');

  elements.forEach(element => {
    const words = element.innerText.split(/\s+/);
    const containerWidth = element.offsetWidth;

    let lines = [];
    let currentLine = [];
    let testElement = document.createElement('span');
    testElement.style.visibility = 'hidden';
    testElement.style.position = 'absolute';
    testElement.style.whiteSpace = 'nowrap';
    element.appendChild(testElement);

    words.forEach(word => {
      currentLine.push(word);
      testElement.textContent = currentLine.join(' ');
      
      if (testElement.offsetWidth > containerWidth) {
        if (currentLine.length > 1) {
          currentLine.pop();
          lines.push(currentLine);
          currentLine = [word];
        } else {
          lines.push(currentLine);
          currentLine = [];
        }
      }
    });

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    element.removeChild(testElement);

    let wordCount = 0;
    const wrappedContent = lines.map((line) => {
      const wrappedWords = line.map((word) => {
        wordCount++;
        return `<span class="gs-words" style="transition-delay: calc(var(--gs-root-transition-delay, var(--gs-root-animation-delay, 0.01s)) + calc(var(--gs-root-transition-delay-multiplier, var(--gs-root-animation-delay-multiplier, 0.1s)) * ${wordCount - 1}));">${word}</span>`;
      }).join(' ');
      return `<span class="gs-lines">${wrappedWords}</span>`;
    }).join('');

    element.innerHTML = wrappedContent;
  });
}

// Call the function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', splitTextIntoLinesAndWords);

// Recalculate on window resize
window.addEventListener('resize', splitTextIntoLinesAndWords);
