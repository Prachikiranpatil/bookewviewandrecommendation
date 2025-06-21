document.addEventListener('DOMContentLoaded', function() {
    // --- Modal Dialog for "Book Now" ---

    // Get the modal element
    const modal = document.getElementById('unavailableModal');

    // Get all "Book Now" buttons
    const bookNowButtons = document.querySelectorAll('.book-now-btn');

    // Get the close button for the modal
    const closeButton = document.querySelector('.modal .close-button');

    // Function to open the modal
    const openModal = (event) => {
        event.preventDefault(); // Prevents the link from navigating to course.html
        if (modal) {
            modal.style.display = 'block';
        }
    };

    // Function to close the modal
    const closeModal = () => {
        if (modal) {
            modal.style.display = 'none';
        }
    };

    // Add click event listeners to all "Book Now" buttons
    bookNowButtons.forEach(button => {
        button.addEventListener('click', openModal);
    });

    // Add click event listener to the close button
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }

    // Close the modal if the user clicks outside of the modal content
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // --- Like and View Count Functionality ---

    // Function to initialize counts from localStorage
    const initializeCounts = () => {
        const postCards = document.querySelectorAll('.post-card');
        postCards.forEach(card => {
            const postId = card.dataset.postId;
            if (postId) {
                // Initialize likes
                const likeCountSpan = card.querySelector('.like-count');
                const storedLikes = localStorage.getItem(`likes-post-${postId}`);
                if (likeCountSpan && storedLikes) {
                    likeCountSpan.textContent = storedLikes;
                }

                // Initialize views
                const readCountSpan = card.querySelector('.read-count');
                const storedReads = localStorage.getItem(`reads-post-${postId}`);
                if (readCountSpan && storedReads) {
                    readCountSpan.textContent = storedReads;
                }
            }
        });
    };

    // Add event listeners for like buttons
    const likeButtons = document.querySelectorAll('.like-btn');
    likeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const postCard = button.closest('.post-card');
            if (!postCard) return; // Safety check
            const postId = postCard.dataset.postId;
            const likeCountSpan = postCard.querySelector('.like-count');
            
            if (postId && likeCountSpan) {
                let currentLikes = parseInt(likeCountSpan.textContent, 10) || 0;
                currentLikes++;
                likeCountSpan.textContent = currentLikes;
                localStorage.setItem(`likes-post-${postId}`, currentLikes);
            }
        });
    });

    // Add event listeners for post clicks (to increment view count)
    const postLinks = document.querySelectorAll('.post-clickable-area');
    postLinks.forEach(link => {
        link.addEventListener('click', () => {
            const postCard = link.closest('.post-card');
            if (!postCard) return; // Safety check
            const postId = postCard.dataset.postId;
            const readCountSpan = postCard.querySelector('.read-count');

            if (postId && readCountSpan) {
                let currentReads = parseInt(readCountSpan.textContent, 10) || 0;
                currentReads++;
                // The text will update on the next page load from localStorage
                localStorage.setItem(`reads-post-${postId}`, currentReads);
            }
        });
    });

    // Initialize counts when the page loads
    initializeCounts();
});