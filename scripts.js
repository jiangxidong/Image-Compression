class ImageCompressor {
    constructor() {
        this.maxFiles = 10;
        this.quality = 0.7;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Upload area functionality
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = Array.from(e.dataTransfer.files).filter(file => 
                file.type.match('image/(jpeg|png)'));
            this.handleFiles(files);
        });

        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.handleFiles(files);
        });

        // Quality slider
        const qualitySlider = document.getElementById('quality');
        const qualityValue = document.getElementById('qualityValue');
        qualitySlider.addEventListener('input', (e) => {
            this.quality = e.target.value / 100;
            qualityValue.textContent = `${e.target.value}%`;
        });
    }

    handleFiles(files) {
        if (files.length > this.maxFiles) {
            alert(`Please select a maximum of ${this.maxFiles} files.`);
            return;
        }

        files.forEach(file => this.processImage(file));
    }

    processImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => this.compressImage(img, file);
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    compressImage(img, originalFile) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Maintain aspect ratio while setting maximum dimensions
        const maxWidth = 1920;
        const maxHeight = 1080;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
            (blob) => this.displayResults(originalFile, blob, img.src),
            'image/jpeg',
            this.quality
        );
    }

    displayResults(originalFile, compressedBlob, originalPreviewUrl) {
        const container = document.getElementById('imagesContainer');
        const card = document.createElement('div');
        card.className = 'image-card';

        const originalSize = this.formatSize(originalFile.size);
        const compressedSize = this.formatSize(compressedBlob.size);
        const savings = Math.round((1 - compressedBlob.size / originalFile.size) * 100);

        card.innerHTML = `
            <img src="${originalPreviewUrl}" class="image-preview" alt="Original">
            <div class="image-info">
                <div>
                    <div>Original: ${originalSize}</div>
                    <div>Compressed: ${compressedSize}</div>
                    <div>Saved: ${savings}%</div>
                </div>
                <button class="download-button">Download</button>
            </div>
        `;

        card.querySelector('.download-button').addEventListener('click', () => {
            const url = URL.createObjectURL(compressedBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `compressed_${originalFile.name}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });

        container.appendChild(card);
    }

    formatSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize the compressor when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ImageCompressor();
}); 