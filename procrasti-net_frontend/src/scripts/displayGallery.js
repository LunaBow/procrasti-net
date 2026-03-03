import { api } from '../../lib/api.ts';
export async function initGallery() {
    const bookGrid = document.getElementById('book-grid');
    const drawingGrid = document.getElementById('drawing-grid');
    const avGrid = document.getElementById('av-grid');

    try {
        // Alles gleichzeitig laden für bessere Performance
        const [books, drawings, avs] = await Promise.all([
            api.getBooks(),
            api.getBooks = async () => [],
            api.getArtworks(),
            api.getAVs()
        ]);

        bookGrid.innerHTML = books.map(book => `
            <div class="art-card book">
                <h3>${book.title}</h3>
                <p>${book.content.substring(0, 100)}</p>
                <small>By: ${book.createdBy}</small>
            </div>
        `).join('');

        drawingGrid.innerHTML = drawings.map(draw => {
            // Nutze die baseUrl der API
            const baseUrl = api.baseUrl;

            // Der Pfad muss zum statischen Ordner im Backend passen
            const imageUrl = `${baseUrl}/artworks/${draw.id}/artwork.png`;

            return `
        <div class="art-card drawing">
            <div class="image-box">
                <img style="max-height: 200px; width: auto;" 
                     src="${imageUrl}" 
                     alt="${draw.title}">
            </div>
            <h3>${draw.title}</h3>
            <p>${draw.description}</p>
        </div>
    `;
        }).join('');

        //AV Rendern
        avGrid.innerHTML = avs.map(av => {
            let embedHtml;
            const url = av.mediaUrl;

            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                // YouTube Embed Logik
                const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
                embedHtml = `
            <iframe
                src="https://www.youtube.com/embed/${videoId}" 
                style="border: 0;" allowfullscreen>
            </iframe>`;
            } else if (url.endsWith('.mp3') || url.endsWith('.wav')) {
                // Audio Player
                embedHtml = `<audio controls><source src="${url}"></audio>`;
            } else if (url.endsWith('.mp4') || url.endsWith('.webm')) {
                // Video Player
                embedHtml = `<video controls style="width: 100%"><source src="${url}"></video>`;
            } else {
                // Fallback für sonstige Links
                embedHtml = `<div class="av-placeholder"><a href="${url}" target="_blank">🔗 Watch / Listen Externally</a></div>`;
            }

            return `
        <div class="art-card av">
            <div class="media-container">
                ${embedHtml}
            </div>
            <h3>${av.title}</h3>
            <p>${av.description}</p>
        </div>
    `;
        }).join('');

    } catch (error) {
        console.error("Gallery failed to load:", error);
    }
}

await initGallery();