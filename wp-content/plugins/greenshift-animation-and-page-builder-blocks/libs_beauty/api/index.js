const GS_SESSION_ID = 'uid-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 11);

// Helper function to sanitize JSON strings before parsing
function sanitizeJSONString(jsonString) {
    if (typeof jsonString !== 'string') {
        return jsonString;
    }
    
    // Replace control characters that are not allowed in JSON
    return jsonString.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
}

function GSrunAPICall(api_filters) {
    if (typeof api_filters === 'string') {
        api_filters = JSON.parse(api_filters);
    }
    if (!api_filters) {
        return;
    }

    // Helper: get nested value from an object given a dotted, bracket, or mixed path.
    function GSgetNestedValue(obj, path) {
        if (!path) return obj;
        const keys = path.match(/(\w+)|\[(\d+)\]/g);
        if (!keys) return undefined;
        return keys.reduce((acc, key) => {
            key = key.replace(/[\[\]]/g, '');
            return acc ? acc[key] : undefined;
        }, obj);
    }

    // Placeholder handlers mapping to reduce code duplication.
    const placeholderHandlers = [
        {
            // Replace {{TEXT:...}} with innerText of the provided selector.
            regex: /\{\{TEXT:(.*?)\}\}/g,
            handler: (p1) => {
                const elem = document.querySelector(p1);
                return elem && elem.innerText ? elem.innerText : "";
            }
        },
        {
            // Replace {{URL:...}} with the URL of the current page.
            regex: /\{\{URL:(.*?)\}\}/g,
            handler: (p1) => {
                const elem = document.querySelector(p1);
                if(elem){
                    let url = elem.getAttribute('href');
                    if(!url){
                        url = elem.getAttribute('src');
                    }
                    return url;
                }
                return "";
            }
        },
        {
            // Replace {{VALUE:...}} with the element's value.
            regex: /\{\{VALUE:(.*?)\}\}/g,
            handler: (p1) => {
                const elem = document.querySelector(p1);
                return elem && elem.value ? elem.value : "";
            }
        },
        {
            // Replace {{COOKIE:...}} with the cookie value.
            regex: /\{\{COOKIE:(.*?)\}\}/g,
            handler: (p1) => {
                let cookieValue = GSCookClass.getCookie(p1);
                return cookieValue ? cookieValue : "";
            }
        },
        {
            // Replace {{STORAGE:...}} with the localStorage value.
            regex: /\{\{STORAGE:(.*?)\}\}/g,
            handler: (p1) => {
                let storageValue = localStorage.getItem(p1);
                return storageValue ? storageValue : "";
            }
        },
        {
            // Replace {{ATTR:attributeName | selector}} with the attribute value.
            regex: /\{\{ATTR:(.*?)\}\}/g,
            handler: (p1) => {
                let parts = p1.split('|').map(s => s.trim());
                if (parts.length === 2) {
                    let attributeName = parts[0];
                    let elem = document.querySelector(parts[1]);
                    return elem ? (elem.getAttribute(attributeName) || "") : "";
                }
                return "";
            }
        },
        {
            // Replace {{FORMDATA:...}} with a serialized version of the form data.
            regex: /\{\{FORMDATA:(.*?)\}\}/g,
            handler: (p1) => {
                const formElem = document.querySelector(p1);
                if (formElem) {
                    let formData = new FormData(formElem);
                    let entries = {};
                    formData.forEach((value, key) => {
                        entries[key] = value;
                    });
                    return JSON.stringify(entries);
                }
                return "";
            }
        },
        {
            // Replace {{SESSION_ID}} with a unique id string.
            regex: /\{\{SESSION_ID\}\}/g,
            handler: () => {
                return GS_SESSION_ID;
            }
        }
    ];

    // Consolidated function to replace all dynamic placeholders.
    const dynamicPlaceholders = (value) => {
        if (typeof value !== 'string') {
            return value;
        }
        let newValue = value;
        for (const { regex, handler } of placeholderHandlers) {
            newValue = newValue.replace(regex, (match, p1) => {
                return handler(p1);
            });
        }
        return newValue;
    };

    // Markdown parsing function to convert markdown to HTML
    const parseMarkdown = (markdownText, skipParagraph = false) => {
        if (typeof markdownText !== 'string') {
            return markdownText;
        }

        // Extract code blocks first to protect them
        let codeBlocks = [];
        let inlineCodeBlocks = [];

        // Extract code blocks
        let processedText = markdownText.replace(/```([\s\S]*?)```/gim, function (match, p1) {
            // Check if the code block has a language indicator
            let codeContent = p1;
            let language = '';

            // Check for language indicator in the first line
            const firstLineMatch = codeContent.match(/^([a-zA-Z0-9_+-]+)\s*\n/);
            if (firstLineMatch) {
                language = firstLineMatch[1].toLowerCase();
                // Remove the language line from the code content
                codeContent = codeContent.substring(firstLineMatch[0].length);
            }

            // Store the code content and language
            codeBlocks.push({
                content: codeContent,
                language: language
            });

            return "CODE_BLOCK_PLACEHOLDER_" + (codeBlocks.length - 1);
        });

        // Extract inline code
        processedText = processedText.replace(/`(.*?)`/gim, function (match, p1) {
            inlineCodeBlocks.push(p1);
            return "INLINE_CODE_PLACEHOLDER_" + (inlineCodeBlocks.length - 1);
        });

        // Now escape HTML entities in the remaining text
        processedText = processedText
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

        // Headers
        processedText = processedText.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
        processedText = processedText.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        processedText = processedText.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        processedText = processedText.replace(/^# (.*$)/gim, '<h1>$1</h1>');

        // Bold and italic
        processedText = processedText.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
        processedText = processedText.replace(/\*(.*?)\*/gim, '<em>$1</em>');

        // Process lists - improved to handle nested content better
        // First, identify list items and wrap them properly
        let inList = false;
        let listType = '';

        // Split by lines to process lists properly
        let lines = processedText.split('\n');
        for (let i = 0; i < lines.length; i++) {
            // Check for list items
            let bulletMatch = lines[i].match(/^\s*[\*\-] (.*)/);  // Added dash (-) support
            let numberMatch = lines[i].match(/^\s*(\d+)\. (.*)/);

            if (bulletMatch) {
                if (!inList || listType !== 'ul') {
                    // Start a new list
                    if (inList) {
                        // Close previous list
                        lines[i] = '</' + listType + '><ul><li>' + bulletMatch[1] + '</li>';
                    } else {
                        lines[i] = '<ul><li>' + bulletMatch[1] + '</li>';
                    }
                    inList = true;
                    listType = 'ul';
                } else {
                    // Continue the list
                    lines[i] = '<li>' + bulletMatch[1] + '</li>';
                }
            } else if (numberMatch) {
                if (!inList || listType !== 'ul') {  // Changed from 'ol' to 'ul'
                    // Start a new list - always use ul instead of ol
                    if (inList) {
                        // Close previous list
                        lines[i] = '</' + listType + '><ul><li>' + numberMatch[2] + '</li>';
                    } else {
                        lines[i] = '<ul><li>' + numberMatch[2] + '</li>';
                    }
                    inList = true;
                    listType = 'ul';  // Changed from 'ol' to 'ul'
                } else {
                    // Continue the list
                    lines[i] = '<li>' + numberMatch[2] + '</li>';
                }
            } else if (inList && lines[i].trim() === '') {
                // Empty line ends the list
                lines[i] = '</' + listType + '>';
                inList = false;
            } else if (inList && lines[i].trim() !== '') {
                // Content that belongs to the previous list item
                // Append to previous line instead of creating a new paragraph
                lines[i - 1] = lines[i - 1].replace(/<\/li>$/, ' ' + lines[i] + '</li>');
                lines[i] = '';
            }
        }

        // Close any open list
        if (inList) {
            lines.push('</' + listType + '>');
        }

        processedText = lines.join('\n');

        // Links
        processedText = processedText.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>');

        // Paragraphs - only wrap text that isn't already wrapped in HTML tags
        // Skip wrapping content that's already in a list
        // Skip paragraph wrapping if skipParagraph is true
        if (!skipParagraph) {
            processedText = processedText.replace(/^(?!\s*<\/?(?:ul|ol|li|h\d|blockquote|pre|img|code))[^\n<]+(?:\n(?!\s*<\/?(?:ul|ol|li|h\d|blockquote|pre|img|code))[^\n<]+)*/gim, function (m) {
                if (m.trim() === '') return '';
                return '<p>' + m + '</p>';
            });
        }

        // Line breaks - only add <br> tags where appropriate
        // Don't add breaks inside list items or other block elements
        processedText = processedText.replace(/\n(?!\s*<\/?(?:p|ul|ol|li|h\d|blockquote|pre|code))/gim, '<br>');

        // Clean up any empty paragraphs
        processedText = processedText.replace(/<p>\s*<\/p>/gim, '');

        // Now put back the code blocks with proper HTML escaping
        processedText = processedText.replace(/CODE_BLOCK_PLACEHOLDER_(\d+)/g, function (match, index) {
            let codeBlock = codeBlocks[parseInt(index)];
            let codeContent = codeBlock.content;
            let language = codeBlock.language;

            // Escape HTML in code blocks to display tags literally
            codeContent = codeContent
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');

            // Add language indicator if present
            if (language) {
                return '<div class="code_language">' + language + '</div><pre><code>' + codeContent + '</code></pre>';
            } else {
                return '<pre><code>' + codeContent + '</code></pre>';
            }
        });

        // Put back inline code with proper HTML escaping
        processedText = processedText.replace(/INLINE_CODE_PLACEHOLDER_(\d+)/g, function (match, index) {
            let codeContent = inlineCodeBlocks[parseInt(index)];
            // Escape HTML in inline code to display tags literally
            codeContent = codeContent
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
            return '<code>' + codeContent + '</code>';
        });

        // Clean up any double line breaks
        processedText = processedText.replace(/(<br>\s*)+/g, '<br>');
        processedText = processedText.replace(/^\s*<br>/g, '');
        processedText = processedText.replace(/<br>\s*$/g, '');

        if (skipParagraph) {
            return processedText;
        }

        return processedText;
    };

    // Cache frequently used properties from api_filters.
    const {
        result_selector,
        result_handle = 'replace',
        loader_selector,
        apiHeaders, // optional extra headers
        apiUrl,
        apiMethod,
        apiBody,
        responseField,
        appendField,
        assistantField,
        user_message,
        assistant_message,
        custom_response,
        responseMaps,
        response_selector,
        repeatable,
        stream_chat = false,
        stream_response = false,
        no_data_text = 'No data found'
    } = api_filters;

    // Convert extra_filters.apiHeaders (array) to a proper headers object.
    const headersToSend =
        Array.isArray(apiHeaders)
            ? apiHeaders.reduce((acc, header) => {
                if (header.name) {
                    acc[header.name] = dynamicPlaceholders(header.value);
                }
                return acc;
            }, {})
            : {};

    // Cache loader element to avoid multiple queries.
    const loaderElem = loader_selector ? document.querySelector(loader_selector) : null;
    if (loaderElem) {
        loaderElem.classList.add('active');
    }

    const resultElem = result_selector ? document.querySelector(result_selector) : null;
    if (resultElem) {
        resultElem.classList.remove('loaded');
        resultElem.classList.remove('active');
        resultElem.classList.add('loading');
    }

    let savedVar = 'gspb-api-saved-var';
    if (responseField) {
        savedVar = responseField.replace(/[^a-zA-Z0-9]/g, '');
    }

    const appendToBody = (bodyApi, appendField, appendValue) => {
        if (appendField && bodyApi) {
            let bodyObj = JSON.parse(bodyApi);
            let appendFieldObj = GSgetNestedValue(bodyObj, appendField);
            if (appendFieldObj) {
                if (Array.isArray(appendFieldObj)) {
                    appendFieldObj.push(appendValue);
                } else {
                    bodyObj[appendField] = appendValue;
                }
            }
            bodyApi = JSON.stringify(bodyObj);
        }
        return bodyApi;
    }

    let bodyApi = apiBody ? dynamicPlaceholders(apiBody) : null;
    if (stream_chat) {
        if (typeof window[savedVar] !== 'undefined') {
            bodyApi = window[savedVar];
        }
    }
    let userMessage = user_message ? dynamicPlaceholders(user_message) : null;
    if (userMessage) {
        bodyApi = appendToBody(bodyApi, appendField, JSON.parse(dynamicPlaceholders(userMessage)));
    }

    // Initiate the API fetch
    // Check if this is a GreenShift proxy API endpoint and add nonce if needed
    const processedApiUrl = dynamicPlaceholders(apiUrl);
    
    // Add the nonce to headers if this is a GreenShift proxy endpoint
    if (processedApiUrl.includes('greenshift/v1/proxy-api') && typeof gspbApiSettings !== 'undefined') {
        headersToSend['X-WP-Nonce'] = gspbApiSettings.nonce;
    }
    
    fetch(processedApiUrl, {
        method: apiMethod ? apiMethod : 'GET',
        headers: headersToSend,
        body: bodyApi,
    })
        .then(response => {
            // Handle streaming if enabled
            if (stream_response) {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                if (!response.body) {
                    throw new Error("ReadableStream not supported in this browser.");
                }

                // Get a reader from the response body stream
                const reader = response.body.getReader();

                // For simplicity, we'll assume JSON streaming with newline-delimited JSON
                let buffer = '';
                let decoder = new TextDecoder();

                // Create a DIV for streaming content if result_selector exists
                let streamContainer = null;
                if (resultElem) {
                    // Clear previous content based on result_handle
                    if (result_handle === 'replace') {
                        resultElem.innerHTML = '';
                    }

                    // Create streaming container
                    streamContainer = document.createElement('div');
                    streamContainer.classList.add('gs-streaming-content');

                    if (result_handle === 'append') {
                        resultElem.appendChild(streamContainer);
                    } else if (result_handle === 'prepend') {
                        resultElem.insertBefore(streamContainer, resultElem.firstChild);
                    } else {
                        resultElem.appendChild(streamContainer);
                    }
                }

                let assistantMessage = '';

                // Function to process each chunk as it arrives
                const processStream = () => {
                    return reader.read().then(({ done, value }) => {
                        if (done) {
                            // Stream is complete, nothing more to do
                            // Just mark the stream container as completed if not already done
                            if (streamContainer && !streamContainer.classList.contains('result-loaded')) {
                                streamContainer.classList.add('result-loaded');
                            }
                            return;
                        }

                        // Decode new chunk and add to buffer
                        const chunk = decoder.decode(value, { stream: true });
                        buffer += chunk;

                        // Process each complete JSON object in the buffer
                        // This assumes JSON streaming format uses newlines as delimiters
                        let delimiterPos;

                        // Initialize the streaming container with the template elements once at the beginning
                        if (custom_response && responseMaps && response_selector && !streamContainer.hasAttribute('data-initialized')) {
                            const copySelector = document.querySelector(response_selector);
                            if (copySelector) {
                                streamContainer.innerHTML = copySelector.innerHTML;
                                streamContainer.setAttribute('data-initialized', 'true');
                            }
                        }

                        // Flag to track if this is the first chunk
                        let isFirstChunk = !streamContainer.hasAttribute('data-received-first-chunk');

                        while ((delimiterPos = buffer.indexOf('\n')) !== -1) {
                            const jsonStr = buffer.slice(0, delimiterPos).trim();
                            buffer = buffer.slice(delimiterPos + 1);

                            if (jsonStr && streamContainer) {
                                try {
                                    // Skip processing for the end-of-stream marker
                                    if (jsonStr === 'data: [DONE]') {
                                        console.log('Stream completed');
                                        // Mark the stream container as completed
                                        streamContainer.classList.add('result-loaded');
                                        continue;
                                    }

                                    // Check if string starts with "data: " and remove it before parsing
                                    const jsonString = jsonStr.startsWith('data: ') ? jsonStr.substring(6) : jsonStr;
                                    const jsonData = JSON.parse(jsonString);
                                    let streamContent = responseField ? GSgetNestedValue(jsonData, responseField) : jsonData;

                                    // If this is the first chunk, hide the loader
                                    if (isFirstChunk && loaderElem) {
                                        loaderElem.classList.remove('active');
                                        streamContainer.setAttribute('data-received-first-chunk', 'true');
                                        isFirstChunk = false;
                                    }

                                    // Apply custom response processing if needed
                                    if (custom_response && responseMaps && response_selector) {
                                        processStreamChunk(streamContent);
                                        if (assistantField && assistant_message) {
                                            let assistantMessageObj = GSgetNestedValue(streamContent, assistantField);
                                            if (assistantMessageObj) {
                                                assistantMessage += assistantMessageObj;
                                            }
                                        }
                                    } else {
                                        if (typeof streamContent === 'string') {
                                            // Remove any paragraph tags that might be around the content
                                            streamContent = streamContent.replace(/<\/?p>/g, '');
                                            streamContainer.innerHTML += streamContent;
                                        } else if (streamContent !== null && streamContent !== undefined) {
                                            streamContainer.innerHTML += String(streamContent);
                                        }

                                        streamContainer.classList.remove('loading');
                                        streamContainer.classList.add('loaded');
                                        streamContainer.classList.add('active');

                                        if (assistant_message) {
                                            assistantMessage += streamContent;
                                        }

                                    }
                                } catch (e) {
                                    console.error('Error parsing stream chunk:', e);
                                }
                            }
                        }

                        // Continue reading the stream
                        return processStream();
                    });
                };

                // Helper function to process a stream chunk with the custom response mappings
                const processStreamChunk = (sourceData) => {
                    // Skip processing if necessary components are missing
                    if (!custom_response || !responseMaps || !response_selector) {
                        return sourceData;
                    }

                    // For streamed chat, we want to update existing elements rather than clone each time
                    const targetElements = {};

                    responseMaps.forEach(map => {
                        const mapSelector = map.name;
                        let mapValue = GSgetNestedValue(sourceData, map.value);
                        // Find or cache the target element
                        if (!targetElements[mapSelector]) {
                            targetElements[mapSelector] = streamContainer.querySelector(mapSelector);
                        }
                        const targetElem = targetElements[mapSelector];
                        if (targetElem && !targetElem.classList.contains('loaded')) {
                            targetElem.classList.add('loading');
                        }

                        if (typeof mapValue === 'undefined') {
                            return;
                        }

                        if (targetElem) {
                            if (map.format === 'date') {
                                mapValue = new Date(mapValue).toLocaleString();
                            }

                            // For markdown, accumulate content and process what we have so far
                            if (map.format === 'markdown' && typeof mapValue === 'string') {
                                // Store raw content for markdown processing
                                if (!targetElem.hasAttribute('data-raw-content')) {
                                    targetElem.setAttribute('data-raw-content', '');
                                }
                                let currentRawContent = targetElem.getAttribute('data-raw-content');
                                currentRawContent += mapValue;
                                targetElem.setAttribute('data-raw-content', currentRawContent);

                                // Process the complete markdown content accumulated so far
                                targetElem.innerHTML = parseMarkdown(currentRawContent, true);
                            } else {
                                // Update the appropriate attribute or content
                                if (targetElem.hasAttribute('src')) {
                                    targetElem.setAttribute('src', mapValue);
                                } else if (targetElem.hasAttribute('href')) {
                                    targetElem.setAttribute('href', mapValue);
                                } else {
                                    // Append to existing content instead of replacing
                                    // Remove any paragraph tags that might be around the content
                                    if (typeof mapValue === 'string') {
                                        mapValue = mapValue.replace(/<\/?p>/g, '');
                                    }
                                    targetElem.innerHTML += mapValue;
                                }
                            }

                            if (!targetElem.classList.contains('loaded')) {
                                targetElem.classList.remove('loading');
                                targetElem.classList.add('loaded');
                                targetElem.classList.add('active');
                            }
                        }
                    });

                    return null; // No need to return content since we're updating elements directly
                };

                // Start processing the stream
                return processStream()
                    .catch(error => {
                        console.error('Stream error:', error);
                        throw error;
                    })
                    .finally(() => {
                        // Finalize UI state
                        if (resultElem) {
                            resultElem.classList.remove('loading');
                            setTimeout(() => {
                                resultElem.classList.add('loaded');
                                resultElem.classList.add('active');
                            }, 50);
                            let nextRun = resultElem.getAttribute('data-nextrun');
                            if (!nextRun) {
                                resultElem.setAttribute('data-nextrun', 2);
                            } else {
                                let nextRunNumber = parseInt(nextRun);
                                resultElem.setAttribute('data-nextrun', nextRunNumber + 1);
                            }

                            // Final markdown processing just to ensure everything is formatted correctly
                            if (streamContainer && responseMaps) {
                                responseMaps.forEach(map => {
                                    if (map.format === 'markdown') {
                                        const targetElem = streamContainer.querySelector(map.name);
                                        if (targetElem && targetElem.hasAttribute('data-raw-content')) {
                                            const rawContent = targetElem.getAttribute('data-raw-content');
                                            // Now process the complete markdown content one final time
                                            targetElem.innerHTML = parseMarkdown(rawContent, true);
                                            // Clean up the temporary attribute
                                            targetElem.removeAttribute('data-raw-content');
                                        }
                                    }
                                });
                            }
                        }

                        if (bodyApi && appendField && assistantMessage && assistantField && assistant_message) {
                            let assistantM = assistant_message.replace('{{RESPONSE}}', assistantMessage);
                            try {
                                let sanitizedJson = sanitizeJSONString(assistantM);
                                let assistantJSON = JSON.parse(sanitizedJson);
                                bodyApi = appendToBody(bodyApi, appendField, assistantJSON);
                                window[savedVar] = bodyApi;
                            } catch (error) {
                                console.error('Error parsing assistant message JSON:', error);
                                console.log('Problematic JSON string:', assistantM);
                            }
                        }

                        // Trigger any actions on the streamed content
                        if (resultElem) {
                            const layersElements = resultElem.querySelectorAll("[data-gspbactions]");
                            if (layersElements.length > 0 && typeof GSPB_Trigger_Actions === 'function') {
                                GSPB_Trigger_Actions('front', layersElements);
                            }
                            if (typeof GSChartRun !== 'undefined') {
                                GSChartRun(resultElem);
                            }
                            document.dispatchEvent(new CustomEvent("GSPB_API_RESPONSE", { detail: { resultElem, responseData: null } }));
                        }
                    });
            }

            // Non-streaming response
            return response.json();
        })
        .then(data => {
            // Skip processing if we already handled streaming
            if (stream_response) return;

            // Resolve nested response if necessary.
            const responseData = responseField
                ? GSgetNestedValue(data, responseField)
                : data;

            let formattedResponse = responseData;
            if (assistantField && responseData && bodyApi && appendField && assistant_message) {
                let assistantMessage = GSgetNestedValue(responseData, assistantField);
                let assistantM = assistant_message.replace('{{RESPONSE}}', assistantMessage);
                try {
                    let sanitizedJson = sanitizeJSONString(assistantM);
                    let assistantJSON = JSON.parse(sanitizedJson);
                    bodyApi = appendToBody(bodyApi, appendField, assistantJSON);
                    window[savedVar] = bodyApi;
                } catch (error) {
                    console.error('Error parsing assistant message JSON:', error);
                    console.log('Problematic JSON string:', assistantM);
                }
            } else {
                window[savedVar] = formattedResponse;
            }
            if (typeof formattedResponse === 'undefined') {
                formattedResponse = '<div class="gspb-api-noresponse">' + no_data_text + '</div>';
            }

            // If a custom response mapping is defined, apply it.
            if (custom_response && responseMaps && response_selector) {
                const copySelector = document.querySelector(response_selector);
                let finalResponse = '';
                let noDataErrors = [];
                if (copySelector) {
                    const processMappings = (sourceData) => {
                        let cloneNode = copySelector.cloneNode(true);
                        responseMaps.forEach(map => {
                            const mapSelector = map.name;
                            const targetElem = cloneNode.querySelector(mapSelector);
                            targetElem.classList.add('loading');
                            // In repeatable mode, use the individual item data.
                            let mapValue = GSgetNestedValue(sourceData, map.value);
                            if (typeof mapValue === 'undefined') {
                                noDataErrors.push(map.name);
                            }
                            if (targetElem) {
                                if (map.format === 'date') {
                                    mapValue = new Date(mapValue).toLocaleString();
                                }
                                if (map.format === 'markdown') {
                                    // Basic markdown to HTML conversion
                                    if (typeof mapValue === 'string') {
                                        mapValue = parseMarkdown(mapValue);
                                    }
                                }
                                if (targetElem.hasAttribute('src')) {
                                    targetElem.setAttribute('src', mapValue);
                                } else if (targetElem.hasAttribute('href')) {
                                    targetElem.setAttribute('href', mapValue);
                                } else {
                                    targetElem.innerHTML = mapValue;
                                }
                                targetElem.classList.remove('loading');
                                targetElem.classList.add('loaded');
                                targetElem.classList.add('active');
                            }
                        });
                        return cloneNode.innerHTML;
                    };

                    if (repeatable && Array.isArray(formattedResponse)) {
                        formattedResponse.forEach(item => {
                            finalResponse += processMappings(item);
                        });
                    } else {
                        finalResponse = processMappings(formattedResponse);
                    }
                    if (finalResponse) {
                        formattedResponse = finalResponse;
                    }
                    if (noDataErrors.length > 0 && noDataErrors.length === responseMaps.length) {
                        formattedResponse = '<div class="gspb-api-noresponse">' + no_data_text + '</div>';
                    }
                }
            }

            // Update the DOM element specified by result_selector.
            if (resultElem) {
                if (result_handle === 'replace') {
                    resultElem.innerHTML = formattedResponse;
                } else if (result_handle === 'append') {
                    resultElem.innerHTML += formattedResponse;
                } else if (result_handle === 'prepend') {
                    resultElem.innerHTML = formattedResponse + resultElem.innerHTML;
                }
                Array.from(resultElem.children).forEach(child => {
                    if (!child.classList.contains('result-loaded')) {
                        setTimeout(() => {
                            child.classList.add('result-loaded');
                        }, 10);
                    }
                });
                const layersElements = resultElem.querySelectorAll("[data-gspbactions]");
                if (layersElements.length > 0 && typeof GSPB_Trigger_Actions === 'function') {
                    GSPB_Trigger_Actions('front', layersElements);
                }
                if (typeof GSChartRun !== 'undefined') {
                    GSChartRun(resultElem);
                }
                document.dispatchEvent(new CustomEvent("GSPB_API_RESPONSE", { detail: { resultElem, responseData } }));
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
        })
        .finally(() => {
            // Skip finalizing if we already did it in streaming mode
            if (stream_response) return;

            if (loaderElem) {
                loaderElem.classList.remove('active');
            }
            if (resultElem) {
                resultElem.classList.remove('loading');
                setTimeout(() => {
                    resultElem.classList.add('loaded');
                    resultElem.classList.add('active');
                }, 50);
                let nextRun = resultElem.getAttribute('data-nextrun');
                if (!nextRun) {
                    resultElem.setAttribute('data-nextrun', 2);
                } else {
                    let nextRunNumber = parseInt(nextRun);
                    resultElem.setAttribute('data-nextrun', nextRunNumber + 1);
                }
            }
            if (resultElem && resultElem.querySelector('.gspb-api-noresponse')) {
                setTimeout(() => {
                    resultElem.querySelector('.gspb-api-noresponse').remove();
                }, 1000);
            }
        });
}