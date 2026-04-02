/**
 * Contenido Module - Modal Logic for Health Topics
 */
function initContenido() {
    const topCardElements = document.querySelectorAll('.topic-card');
    const modalOverlay = document.getElementById('globalTopicModal');
    const modalBodyWrapper = document.getElementById('topicModalBody');
    const modalCloseBtn = document.getElementById('closeTopicModal');

    if (topCardElements.length > 0 && modalOverlay) {
        const closeTopicModal = () => {
            modalOverlay.classList.remove('active');
            modalOverlay.setAttribute('aria-hidden', 'true');
            setTimeout(() => {
                modalBodyWrapper.innerHTML = '';
            }, 300);
        };

        topCardElements.forEach(card => {
            card.addEventListener('click', () => {
                const hiddenContent = card.querySelector('.topic-hidden-content');
                if (hiddenContent) {
                    modalBodyWrapper.innerHTML = hiddenContent.innerHTML;
                    modalOverlay.classList.add('active');
                    modalOverlay.setAttribute('aria-hidden', 'false');
                }
            });

            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });

        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', closeTopicModal);
        }

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeTopicModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
                closeTopicModal();
            }
        });
    }
}
