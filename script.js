// =====================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// =====================================
class ColorGenerator {
    constructor() {
        // Estado de la aplicación
        this.currentColor = '#667EEA';
        this.colorLocked = false;
        this.currentColorName = 'Cornflower Blue';
        
        // Almacenamiento
        this.colorHistory = JSON.parse(localStorage.getItem('colorHistory')) || [];
        this.favorites = JSON.parse(localStorage.getItem('colorFavorites')) || [];
        
        // Referencias a elementos del DOM
        this.initializeElements();
        
        // Inicializar la aplicación
        this.init();
    }
    
    // =====================================
    // INICIALIZACIÓN
    // =====================================
    initializeElements() {
        // Elementos principales
        this.body = document.body;
        this.colorVisual = document.getElementById('colorVisual');
        this.colorDisplay = document.getElementById('colorDisplay');
        this.colorCode = document.getElementById('colorCode').querySelector('span');
        this.colorName = document.getElementById('colorName');
        this.colorNameValue = document.getElementById('colorNameValue');
        
        // Botones
        this.generateBtn = document.getElementById('generateBtn');
        this.copyHexBtn = document.getElementById('copyHexBtn');
        this.favoriteBtn = document.getElementById('favoriteBtn');
        this.lockBtn = document.getElementById('lockBtn');
        this.shareBtn = document.getElementById('shareBtn');
        this.clearHistoryBtn = document.getElementById('clearHistory');
        this.themeToggle = document.getElementById('themeToggle');
        
        // Valores de color
        this.rgbValue = document.getElementById('rgbValue');
        this.hslValue = document.getElementById('hslValue');
        this.cmykValue = document.getElementById('cmykValue');
        
        // Sliders
        this.hueSlider = document.getElementById('hueSlider');
        this.saturationSlider = document.getElementById('saturationSlider');
        this.lightnessSlider = document.getElementById('lightnessSlider');
        this.hueValue = document.getElementById('hueValue');
        this.saturationValue = document.getElementById('saturationValue');
        this.lightnessValue = document.getElementById('lightnessValue');
        
        // Grids
        this.historyGrid = document.getElementById('historyGrid');
        this.favoritesGrid = document.getElementById('favoritesGrid');
        this.favoritesCount = document.getElementById('favoritesCount');
        this.palettesContainer = document.getElementById('palettesContainer');
        
        // Modal
        this.shareModal = document.getElementById('shareModal');
        this.closeShareModal = document.getElementById('closeShareModal');
        this.shareColorPreview = document.getElementById('shareColorPreview');
        this.shareColorCode = document.getElementById('shareColorCode');
        this.shareColorName = document.getElementById('shareColorName');
        
        // Toast container
        this.toastContainer = document.getElementById('toastContainer');
    }
    
    init() {
        this.setupEventListeners();
        this.createParticles();
        this.loadInitialColor();
        this.renderHistory();
        this.renderFavorites();
        this.generatePalettes();
        this.updateFavoritesCount();
        this.applyTheme();
    }
    
    // =====================================
    // MANEJO DE EVENTOS
    // =====================================
    setupEventListeners() {
        // Botón de generar color
        this.generateBtn.addEventListener('click', () => this.generateNewColor());
        
        // Botones de copiar
        this.copyHexBtn.addEventListener('click', () => this.copyToClipboard('hex'));
        document.querySelectorAll('.copy-small').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target.dataset.target;
                this.copyToClipboard(target);
            });
        });
        
        // Botones de acción
        this.favoriteBtn.addEventListener('click', () => this.toggleFavorite());
        this.lockBtn.addEventListener('click', () => this.toggleLock());
        this.shareBtn.addEventListener('click', () => this.openShareModal());
        
        // Botón de limpiar historial
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        
        // Sliders
        this.hueSlider.addEventListener('input', (e) => this.updateFromSliders());
        this.saturationSlider.addEventListener('input', (e) => this.updateFromSliders());
        this.lightnessSlider.addEventListener('input', (e) => this.updateFromSliders());
        
        // Tema oscuro/claro
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Modal
        this.closeShareModal.addEventListener('click', () => this.closeModal());
        this.shareModal.addEventListener('click', (e) => {
            if (e.target === this.shareModal) this.closeModal();
        });
        
        // Botones de compartir
        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const platform = e.target.dataset.platform;
                this.shareColor(platform);
            });
        });
        
        // Atajos de teclado
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Click en código de color para copiar
        this.colorCode.parentElement.addEventListener('click', () => this.copyToClipboard('hex'));
        
        // Click en historial
        this.historyGrid.addEventListener('click', (e) => {
            const colorItem = e.target.closest('.history-item');
            if (colorItem) {
                const color = colorItem.dataset.color;
                this.applyColor(color, false);
            }
        });
        
        // Click en favoritos
        this.favoritesGrid.addEventListener('click', (e) => {
            const colorItem = e.target.closest('.favorite-item');
            if (colorItem) {
                const color = colorItem.dataset.color;
                this.applyColor(color, false);
            }
            
            const removeBtn = e.target.closest('.remove-favorite');
            if (removeBtn) {
                const colorItem = removeBtn.closest('.favorite-item');
                const color = colorItem.dataset.color;
                this.removeFromFavorites(color);
            }
        });
    }
    
    // =====================================
    // GENERACIÓN DE COLORES
    // =====================================
    generateRandomColor() {
        // Generar HSL aleatorio para colores más atractivos
        const h = Math.floor(Math.random() * 360);
        const s = Math.floor(Math.random() * 30) + 70; // 70-100%
        const l = Math.floor(Math.random() * 30) + 35; // 35-65%
        
        return this.hslToHex(h, s, l);
    }
    
    hslToHex(h, s, l) {
        s /= 100;
        l /= 100;
        
        let c = (1 - Math.abs(2 * l - 1)) * s;
        let x = c * (1 - Math.abs((h / 60) % 2 - 1));
        let m = l - c / 2;
        
        let r, g, b;
        
        if (0 <= h && h < 60) {
            [r, g, b] = [c, x, 0];
        } else if (60 <= h && h < 120) {
            [r, g, b] = [x, c, 0];
        } else if (120 <= h && h < 180) {
            [r, g, b] = [0, c, x];
        } else if (180 <= h && h < 240) {
            [r, g, b] = [0, x, c];
        } else if (240 <= h && h < 300) {
            [r, g, b] = [x, 0, c];
        } else {
            [r, g, b] = [c, 0, x];
        }
        
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
    }
    
    hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
    }
    
    hexToHsl(hex) {
        const { r, g, b } = this.hexToRgb(hex);
        
        const rNorm = r / 255;
        const gNorm = g / 255;
        const bNorm = b / 255;
        
        const max = Math.max(rNorm, gNorm, bNorm);
        const min = Math.min(rNorm, gNorm, bNorm);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case rNorm: h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6; break;
                case gNorm: h = ((bNorm - rNorm) / d + 2) / 6; break;
                case bNorm: h = ((rNorm - gNorm) / d + 4) / 6; break;
            }
        }
        
        h = Math.round(h * 360);
        s = Math.round(s * 100);
        l = Math.round(l * 100);
        
        return { h, s, l };
    }
    
    hexToCmyk(hex) {
        const { r, g, b } = this.hexToRgb(hex);
        
        const rNorm = r / 255;
        const gNorm = g / 255;
        const bNorm = b / 255;
        
        const k = 1 - Math.max(rNorm, gNorm, bNorm);
        
        if (k === 1) {
            return { c: 0, m: 0, y: 0, k: 100 };
        }
        
        const c = (1 - rNorm - k) / (1 - k);
        const m = (1 - gNorm - k) / (1 - k);
        const y = (1 - bNorm - k) / (1 - k);
        
        return {
            c: Math.round(c * 100),
            m: Math.round(m * 100),
            y: Math.round(y * 100),
            k: Math.round(k * 100)
        };
    }
    
    getColorName(hex) {
        // Mapeo simple de nombres de color
        const colorMap = {
            '#667EEA': 'Cornflower Blue',
            '#764BA2': 'Royal Purple',
            '#F093FB': 'Lavender Pink',
            '#F5576C': 'Coral Pink',
            '#4FD1C5': 'Turquoise',
            '#4299E1': 'Steel Blue',
            '#48BB78': 'Emerald Green',
            '#ED8936': 'Vibrant Orange',
            '#ECC94B': 'Sunflower Yellow',
            '#9F7AEA': 'Amethyst Purple'
        };
        
        // Encontrar el color más cercano
        let closestColor = Object.keys(colorMap)[0];
        let minDistance = Infinity;
        
        const target = this.hexToRgb(hex);
        
        Object.keys(colorMap).forEach(colorHex => {
            const color = this.hexToRgb(colorHex);
            const distance = Math.sqrt(
                Math.pow(target.r - color.r, 2) +
                Math.pow(target.g - color.g, 2) +
                Math.pow(target.b - color.b, 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                closestColor = colorHex;
            }
        });
        
        return colorMap[closestColor] || 'Custom Color';
    }
    
    // =====================================
    // MANIPULACIÓN DE COLORES
    // =====================================
    generateNewColor() {
        if (this.colorLocked) {
            this.showToast('Color bloqueado. Desbloquea para cambiar.', 'warning');
            return;
        }
        
        const newColor = this.generateRandomColor();
        this.applyColor(newColor, true);
        
        // Animación del botón
        this.animateButton(this.generateBtn);
    }
    
    applyColor(hex, addToHistory = true) {
        // Actualizar color actual
        this.currentColor = hex.toUpperCase();
        
        // Obtener valores de color
        const rgb = this.hexToRgb(hex);
        const hsl = this.hexToHsl(hex);
        const cmyk = this.hexToCmyk(hex);
        const colorName = this.getColorName(hex);
        
        // Actualizar UI
        this.colorDisplay.style.backgroundColor = hex;
        this.colorCode.textContent = hex;
        this.colorName.textContent = colorName;
        this.colorNameValue.textContent = colorName;
        
        // Actualizar valores
        this.rgbValue.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        this.hslValue.textContent = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        this.cmykValue.textContent = `cmyk(${cmyk.c}, ${cmyk.m}, ${cmyk.y}, ${cmyk.k})`;
        
        // Actualizar sliders
        this.hueSlider.value = hsl.h;
        this.saturationSlider.value = hsl.s;
        this.lightnessSlider.value = hsl.l;
        
        this.hueValue.textContent = `${hsl.h}°`;
        this.saturationValue.textContent = `${hsl.s}%`;
        this.lightnessValue.textContent = `${hsl.l}%`;
        
        // Actualizar nombre del color actual
        this.currentColorName = colorName;
        
        // Agregar al historial
        if (addToHistory) {
            this.addToHistory(hex);
        }
        
        // Actualizar botón de favoritos
        this.updateFavoriteButton();
        
        // Animación de cambio de color
        this.animateColorChange();
    }
    
    updateFromSliders() {
        if (this.colorLocked) return;
        
        const h = parseInt(this.hueSlider.value);
        const s = parseInt(this.saturationSlider.value);
        const l = parseInt(this.lightnessSlider.value);
        
        this.hueValue.textContent = `${h}°`;
        this.saturationValue.textContent = `${s}%`;
        this.lightnessValue.textContent = `${l}%`;
        
        const newColor = this.hslToHex(h, s, l);
        this.applyColor(newColor, false);
    }
    
    // =====================================
    // HISTORIAL Y FAVORITOS
    // =====================================
    addToHistory(color) {
        // Evitar duplicados consecutivos
        if (this.colorHistory[0] === color) return;
        
        this.colorHistory.unshift(color);
        
        // Limitar a 20 colores
        if (this.colorHistory.length > 20) {
            this.colorHistory = this.colorHistory.slice(0, 20);
        }
        
        // Guardar y renderizar
        this.saveToLocalStorage('colorHistory', this.colorHistory);
        this.renderHistory();
    }
    
    renderHistory() {
        this.historyGrid.innerHTML = '';
        
        this.colorHistory.forEach(color => {
            const item = this.createColorItem(color, 'history-item');
            this.historyGrid.appendChild(item);
        });
    }
    
    clearHistory() {
        if (this.colorHistory.length === 0) {
            this.showToast('El historial ya está vacío', 'info');
            return;
        }
        
        if (confirm('¿Estás seguro de que quieres limpiar el historial?')) {
            this.colorHistory = [];
            this.saveToLocalStorage('colorHistory', this.colorHistory);
            this.renderHistory();
            this.showToast('Historial limpiado correctamente', 'success');
        }
    }
    
    toggleFavorite() {
        const isFavorite = this.favorites.includes(this.currentColor);
        
        if (isFavorite) {
            this.removeFromFavorites(this.currentColor);
        } else {
            this.addToFavorites(this.currentColor);
        }
    }
    
    addToFavorites(color) {
        if (this.favorites.includes(color)) return;
        
        this.favorites.unshift(color);
        this.saveToLocalStorage('colorFavorites', this.favorites);
        this.renderFavorites();
        this.updateFavoriteButton();
        this.updateFavoritesCount();
        this.showToast('Color agregado a favoritos', 'success');
    }
    
    removeFromFavorites(color) {
        this.favorites = this.favorites.filter(fav => fav !== color);
        this.saveToLocalStorage('colorFavorites', this.favorites);
        this.renderFavorites();
        this.updateFavoriteButton();
        this.updateFavoritesCount();
        this.showToast('Color eliminado de favoritos', 'info');
    }
    
    renderFavorites() {
        this.favoritesGrid.innerHTML = '';
        
        this.favorites.forEach(color => {
            const item = this.createColorItem(color, 'favorite-item');
            
            // Agregar botón de eliminar
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-favorite';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.title = 'Eliminar de favoritos';
            
            item.appendChild(removeBtn);
            this.favoritesGrid.appendChild(item);
        });
    }
    
    updateFavoriteButton() {
        const isFavorite = this.favorites.includes(this.currentColor);
        const icon = this.favoriteBtn.querySelector('i');
        
        if (isFavorite) {
            icon.className = 'fas fa-heart';
            this.favoriteBtn.classList.add('active');
        } else {
            icon.className = 'far fa-heart';
            this.favoriteBtn.classList.remove('active');
        }
    }
    
    updateFavoritesCount() {
        const count = this.favorites.length;
        this.favoritesCount.textContent = `${count} ${count === 1 ? 'color' : 'colores'}`;
    }
    
    createColorItem(color, className) {
        const item = document.createElement('div');
        item.className = className;
        item.style.backgroundColor = color;
        item.dataset.color = color;
        
        // Añadir código en hover
        item.title = color;
        
        return item;
    }
    
    // =====================================
    // PALETAS DE COLORES
    // =====================================
    generatePalettes() {
        const palettes = [
            this.generateMonochromaticPalette(this.currentColor),
            this.generateAnalogousPalette(this.currentColor),
            this.generateComplementaryPalette(this.currentColor),
            this.generateTriadicPalette(this.currentColor),
            this.generateTetradicPalette(this.currentColor)
        ];
        
        this.palettesContainer.innerHTML = '';
        
        palettes.forEach((palette, index) => {
            const paletteDiv = document.createElement('div');
            paletteDiv.className = 'palette';
            
            palette.forEach(color => {
                const colorDiv = document.createElement('div');
                colorDiv.className = 'palette-color';
                colorDiv.style.backgroundColor = color;
                colorDiv.dataset.color = color;
                colorDiv.title = color;
                
                paletteDiv.appendChild(colorDiv);
            });
            
            // Click para aplicar primera paleta
            paletteDiv.addEventListener('click', () => {
                this.applyColor(palette[0], true);
            });
            
            this.palettesContainer.appendChild(paletteDiv);
        });
    }
    
    generateMonochromaticPalette(baseColor) {
        const hsl = this.hexToHsl(baseColor);
        const palette = [];
        
        for (let i = -2; i <= 2; i++) {
            const newL = Math.max(10, Math.min(90, hsl.l + i * 15));
            palette.push(this.hslToHex(hsl.h, hsl.s, newL));
        }
        
        return palette;
    }
    
    generateAnalogousPalette(baseColor) {
        const hsl = this.hexToHsl(baseColor);
        const palette = [];
        
        for (let i = -2; i <= 2; i++) {
            const newH = (hsl.h + i * 30 + 360) % 360;
            palette.push(this.hslToHex(newH, hsl.s, hsl.l));
        }
        
        return palette;
    }
    
    generateComplementaryPalette(baseColor) {
        const hsl = this.hexToHsl(baseColor);
        const complementaryHue = (hsl.h + 180) % 360;
        
        return [
            this.hslToHex(hsl.h, hsl.s, hsl.l),
            this.hslToHex(complementaryHue, hsl.s, hsl.l),
            this.hslToHex(hsl.h, hsl.s, hsl.l - 20),
            this.hslToHex(complementaryHue, hsl.s, hsl.l - 20),
            this.hslToHex(hsl.h, hsl.s, hsl.l + 20)
        ];
    }
    
    generateTriadicPalette(baseColor) {
        const hsl = this.hexToHsl(baseColor);
        
        return [
            this.hslToHex(hsl.h, hsl.s, hsl.l),
            this.hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
            this.hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
            this.hslToHex(hsl.h, hsl.s, hsl.l + 15),
            this.hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l + 15)
        ];
    }
    
    generateTetradicPalette(baseColor) {
        const hsl = this.hexToHsl(baseColor);
        
        return [
            this.hslToHex(hsl.h, hsl.s, hsl.l),
            this.hslToHex((hsl.h + 90) % 360, hsl.s, hsl.l),
            this.hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
            this.hslToHex((hsl.h + 270) % 360, hsl.s, hsl.l),
            this.hslToHex(hsl.h, hsl.s, hsl.l + 10)
        ];
    }
    
    // =====================================
    // CLIPBOARD Y COMPARTIR
    // =====================================
    async copyToClipboard(type) {
        let textToCopy;
        
        switch(type) {
            case 'hex':
                textToCopy = this.currentColor;
                break;
            case 'rgb':
                textToCopy = this.rgbValue.textContent;
                break;
            case 'hsl':
                textToCopy = this.hslValue.textContent;
                break;
            case 'cmyk':
                textToCopy = this.cmykValue.textContent;
                break;
            case 'name':
                textToCopy = this.currentColorName;
                break;
            default:
                textToCopy = this.currentColor;
        }
        
        try {
            await navigator.clipboard.writeText(textToCopy);
            this.showToast(`¡${type.toUpperCase()} copiado al portapapeles!`, 'success');
        } catch (err) {
            // Fallback para navegadores antiguos
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast(`¡${type.toUpperCase()} copiado!`, 'success');
        }
    }
    
    openShareModal() {
        this.shareColorPreview.style.backgroundColor = this.currentColor;
        this.shareColorCode.textContent = this.currentColor;
        this.shareColorName.textContent = this.currentColorName;
        this.shareModal.classList.add('show');
    }
    
    closeModal() {
        this.shareModal.classList.remove('show');
    }
    
    shareColor(platform) {
        const text = `Mira este increíble color: ${this.currentColor} - ${this.currentColorName}`;
        const url = window.location.href;
        
        let shareUrl;
        
        switch(platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case 'link':
                this.copyToClipboard('hex');
                this.closeModal();
                return;
        }
        
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    
    // =====================================
    // TEMA Y PERSONALIZACIÓN
    // =====================================
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        this.saveToLocalStorage('theme', newTheme);
        
        // Actualizar icono
        const icon = this.themeToggle.querySelector('i');
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        
        this.showToast(`Modo ${newTheme === 'dark' ? 'oscuro' : 'claro'} activado`, 'info');
    }
    
    applyTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const icon = this.themeToggle.querySelector('i');
        icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    // =====================================
    // ANIMACIONES Y EFECTOS
    // =====================================
    createParticles() {
        const container = document.getElementById('particles');
        
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Tamaño aleatorio
            const size = Math.random() * 30 + 10;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Posición inicial aleatoria
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            
            // Color aleatorio (transparente)
            const opacity = Math.random() * 0.1 + 0.05;
            particle.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
            
            // Animación
            const duration = Math.random() * 20 + 10;
            const delay = Math.random() * 5;
            particle.style.animation = `float ${duration}s linear ${delay}s infinite`;
            
            container.appendChild(particle);
        }
    }
    
    animateColorChange() {
        // Efecto de pulso en el display de color
        this.colorVisual.style.animation = 'none';
        setTimeout(() => {
            this.colorVisual.style.animation = 'colorPulse 4s ease-in-out infinite';
        }, 10);
        
        // Efecto de brillo en el código
        const codeElement = this.colorCode.parentElement;
        codeElement.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.5)';
        setTimeout(() => {
            codeElement.style.boxShadow = '';
        }, 500);
    }
    
    animateButton(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }
    
    toggleLock() {
        this.colorLocked = !this.colorLocked;
        const icon = this.lockBtn.querySelector('i');
        
        if (this.colorLocked) {
            icon.className = 'fas fa-lock';
            this.lockBtn.classList.add('active');
            this.showToast('Color bloqueado', 'info');
        } else {
            icon.className = 'far fa-lock';
            this.lockBtn.classList.remove('active');
            this.showToast('Color desbloqueado', 'info');
        }
    }
    
    // =====================================
    // NOTIFICACIONES
    // =====================================
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Icono según tipo
        let icon;
        switch(type) {
            case 'success':
                icon = '<i class="fas fa-check-circle"></i>';
                break;
            case 'error':
                icon = '<i class="fas fa-exclamation-circle"></i>';
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-triangle"></i>';
                break;
            default:
                icon = '<i class="fas fa-info-circle"></i>';
        }
        
        toast.innerHTML = `${icon} <span>${message}</span>`;
        
        this.toastContainer.appendChild(toast);
        
        // Auto-eliminar después de 3 segundos
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    // =====================================
    // ATAJOS DE TECLADO
    // =====================================
    handleKeyboardShortcuts(e) {
        // Ignorar si el usuario está escribiendo en un input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch(e.key.toLowerCase()) {
            case ' ':
                e.preventDefault();
                this.generateNewColor();
                break;
            case 'c':
                this.copyToClipboard('hex');
                break;
            case 'f':
                this.toggleFavorite();
                break;
            case 'l':
                this.toggleLock();
                break;
            case 'h':
                this.historyGrid.parentElement.parentElement.classList.toggle('hidden');
                break;
        }
    }
    
    // =====================================
    // UTILIDADES
    // =====================================
    saveToLocalStorage(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
    
    loadInitialColor() {
        // Cargar último color o usar el predeterminado
        if (this.colorHistory.length > 0) {
            this.applyColor(this.colorHistory[0], false);
        } else {
            this.applyColor(this.currentColor, false);
        }
    }
    
    // =====================================
    // INICIALIZAR APLICACIÓN
    // =====================================
    static init() {
        // Crear instancia singleton
        if (!window.colorGenerator) {
            window.colorGenerator = new ColorGenerator();
        }
        return window.colorGenerator;
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    ColorGenerator.init();
});

// Exportar para uso global (si es necesario)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ColorGenerator;
}