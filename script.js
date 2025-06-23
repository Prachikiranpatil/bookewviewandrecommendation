document.addEventListener('DOMContentLoaded', function() {
    // --- Three Dots Dropdown Functionality ---
    document.querySelectorAll('.three-dots-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const dropdown = button.nextElementSibling; // The share-dropdown is the next sibling
            if (dropdown && dropdown.classList.contains('share-dropdown')) {
                // Toggle visibility
                dropdown.classList.toggle('show');
                // Update aria-expanded attribute for accessibility
                button.setAttribute('aria-expanded', dropdown.classList.contains('show'));
            }
            event.stopPropagation(); // Prevent click from bubbling up to document and closing immediately
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
        document.querySelectorAll('.share-dropdown').forEach(dropdown => {
            const button = dropdown.previousElementSibling; // Get the button that opened this dropdown
            if (dropdown.classList.contains('show') && !button.contains(event.target) && !dropdown.contains(event.target)) {
                dropdown.classList.remove('show');
                button.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // --- Copy Link Functionality ---
    // Function to copy text to clipboard
    async function copyToClipboard(text, buttonElement) {
        try {
            await navigator.clipboard.writeText(text);
            console.log('Link copied to clipboard:', text);
            if (buttonElement) {
                const originalText = buttonElement.innerHTML;
                buttonElement.innerHTML = 'Copied!';
                setTimeout(() => {
                    buttonElement.innerHTML = originalText;
                }, 2000); // Change back after 2 seconds
            }
        } catch (err) {
            console.error('Failed to copy: ', err);
            if (buttonElement) {
                const originalText = buttonElement.innerHTML;
                buttonElement.innerHTML = 'Failed to copy!';
                setTimeout(() => {
                    buttonElement.innerHTML = originalText;
                }, 2000);
            }
        }
    }

    // Event listener for "Copy Link" button in the dropdown
    document.querySelectorAll('.share-dropdown .share-option[data-action="copy-link-header"]').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior
            const postUrl = window.location.href; // Get the current page's URL
            copyToClipboard(postUrl, button);
            // Optionally close the dropdown after copying
            const dropdown = button.closest('.share-dropdown');
            if (dropdown) {
                dropdown.classList.remove('show');
                const threeDotsBtn = dropdown.previousElementSibling;
                if (threeDotsBtn) {
                    threeDotsBtn.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });

    // Event listener for the main "Copy Link" button (if it exists and is separate)
    document.querySelectorAll('.interaction-btn.copy-link-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior
            const postUrl = window.location.href; // Get the current page's URL
            copyToClipboard(postUrl, button);
        });
    });
    // --- GLOBAL & API CONFIG ---
    // The API Key is now managed in config.js
    
    // --- API-POWERED SEARCH FUNCTIONALITY ---
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    const mainContent = document.querySelector('.content');

    async function performSearch() {
        if (!searchInput || !searchResultsContainer) {
            console.error("Search elements not found on this page.");
            return;
        }

        const query = searchInput.value.trim();

        if (query === '') {
            // Hide results and show original content
            searchResultsContainer.innerHTML = '';
            searchResultsContainer.style.display = 'none';
            if (mainContent) {
                Array.from(mainContent.children).forEach(el => {
                    if (el.id !== 'searchResultsContainer') el.style.display = '';
                });
            }
            return;
        }

        // Check if the API key has been set in config.js
        if (typeof API_CONFIG === 'undefined' || !API_CONFIG.API_KEY || API_CONFIG.API_KEY === 'YOUR_API_KEY_HERE') {
            alert('API key is missing or is a placeholder. Please add your real Google Books API key to config.js to enable search.');
            return;
        }

        // Show loading state and hide original content
        searchResultsContainer.style.display = 'block';
        searchResultsContainer.innerHTML = '<p>Searching...</p>';
        if (mainContent) {
            Array.from(mainContent.children).forEach(el => {
                if (el.id !== 'searchResultsContainer') el.style.display = 'none';
            });
        }

        try {
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${API_CONFIG.API_KEY}&maxResults=20`);
            if (!response.ok) {
                throw new Error(`Network response was not ok (${response.status})`);
            }
            const data = await response.json();
            displayResults(data.items || []);
        } catch (error) {
            console.error('Error fetching book data:', error);
            searchResultsContainer.innerHTML = '<p>Sorry, something went wrong while searching. Please try again.</p>';
        }
    }

    function displayResults(books) {
        searchResultsContainer.innerHTML = ''; // Clear loading message
        searchResultsContainer.style.display = 'block';

        const resultsTitle = document.createElement('h2');
        resultsTitle.textContent = `Search Results for "${searchInput.value}"`;
        searchResultsContainer.appendChild(resultsTitle);
         if (books.length === 0) {
            searchResultsContainer.innerHTML += '<p>No books found. Try a different search term.</p>';
            return;
        }

        const resultsGrid = document.createElement('div');
        resultsGrid.className = 'api-results-grid';

        books.forEach(book => {
            const bookInfo = book.volumeInfo;
            const title = bookInfo.title || 'No Title';
            const authors = bookInfo.authors ? bookInfo.authors.join(', ') : 'Unknown Author';
            const description = bookInfo.description ? bookInfo.description.substring(0, 150) + '...' : 'No description available.';
            const thumbnail = bookInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128x192.png?text=No+Image';
            const bookLink = bookInfo.infoLink;

            const bookCard = document.createElement('div');
            bookCard.className = 'api-book-card';
            // Only add the link if it exists
            const cardContent = `
                <img src="${thumbnail}" alt="Cover of ${title}">
                <div class="api-book-card-content">
                    <h3>${title}</h3>
                    <p class="author">By: ${authors}</p>
                    <p class="description">${description}</p>
                </div>
            `;
            
            if (bookLink) {
                bookCard.innerHTML = `<a href="${bookLink}" target="_blank" rel="noopener noreferrer">${cardContent}</a>`;
            } else {
                bookCard.innerHTML = cardContent;
            }
            
            resultsGrid.appendChild(bookCard);
        });

        searchResultsContainer.appendChild(resultsGrid);
    }

    if (searchButton && searchInput) {
        searchButton.addEventListener('click', performSearch);
        
        searchInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                performSearch();
            }
        });
    }
    // --- MODAL DIALOG FOR "BOOK NOW" ---
    const modal = document.getElementById('unavailableModal');
    const bookNowButtons = document.querySelectorAll('.book-now-btn');
    const closeButton = document.querySelector('.modal .close-button');

    if (modal && bookNowButtons.length > 0 && closeButton) {
    const openModal = (event) => {
            event.preventDefault();
            modal.style.display = 'block';
        };
        const closeModal = () => {
            modal.style.display = 'none';
        };
        bookNowButtons.forEach(button => button.addEventListener('click', openModal));
        closeButton.addEventListener('click', closeModal);
        window.addEventListener('click', (event) => {
            if (event.target === modal) closeModal();
        });
    }
// --- TICKET CALCULATION FOR REGISTER.HTML ---
    const ticketQuantity = document.getElementById('ticketQuantity');
    const subtotalEl = document.getElementById('subtotal');
    const totalCostEl = document.getElementById('totalCost');

    if (ticketQuantity && subtotalEl && totalCostEl) {
        const TICKET_PRICE = 500;
        const SERVICE_FEE = 50;
const updateCost = () => {
            const quantity = parseInt(ticketQuantity.value, 10) || 0;
            const subtotal = (TICKET_PRICE * quantity) + SERVICE_FEE;
            const total = subtotal;
            subtotalEl.textContent = `₹${subtotal}`;
            totalCostEl.textContent = `₹${total}`;
            };
        ticketQuantity.addEventListener('change', updateCost);
        updateCost(); // Initial calculation
    }
// --- "LEARN MORE" SMOOTH SCROLL ON INDEX.HTML ---
    const learnMoreButton = document.getElementById('learnMoreButton');
    const ourStorySection = document.getElementById('ourStorySection');

    if (learnMoreButton && ourStorySection) {
        learnMoreButton.addEventListener('click', (event) => {
            // Prevent the default anchor jump to allow for a smooth scroll
            event.preventDefault();
            // Scroll the "Our Story" section into view smoothly
            ourStorySection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // --- PERSISTENT LIKE AND VIEW COUNT FUNCTIONALITY (for your blog posts) ---
    const initializeCounts = () => {
        document.querySelectorAll('.post-card').forEach(card => {
            const postId = card.dataset.postId;
            if (!postId) return;
            const likeCountSpan = card.querySelector('.like-count');
            if (likeCountSpan) {
                likeCountSpan.textContent = localStorage.getItem(`likes-post-${postId}`) || '0';
            }
            const readCountSpan = card.querySelector('.read-count');
            if (readCountSpan) {
                readCountSpan.textContent = localStorage.getItem(`reads-post-${postId}`) || '0';
            }
        });
    };
    const likeButtons = document.querySelectorAll('.like-btn');
    likeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
            e.preventDefault();
            const postCard = button.closest('.post-card');
            if (!postCard) return;
            const postId = postCard.dataset.postId;
            const likeCountSpan = postCard.querySelector('.like-count');
            if (!postId || !likeCountSpan) return;

            let currentLikes = parseInt(localStorage.getItem(`likes-post-${postId}`), 10) || 0;
            currentLikes++;
            likeCountSpan.textContent = currentLikes;
            localStorage.setItem(`likes-post-${postId}`, currentLikes);
            button.disabled = true;
        });
    });

    document.querySelectorAll('.post-clickable-area').forEach(link => {
        link.addEventListener('click', () => {
            const postCard = link.closest('.post-card');
            if (!postCard) return;
            const postId = postCard.dataset.postId;
            if (!postId) return;
            let currentReads = parseInt(localStorage.getItem(`reads-post-${postId}`), 10) || 0;
            currentReads++;
            localStorage.setItem(`reads-post-${postId}`, currentReads);
        });
    });

    initializeCounts();
});  