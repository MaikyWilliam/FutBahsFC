class HttpClient {
    constructor() {
        this.baseUrl = 'https://api.meulance.net.br/website';
        this.token = null;
    }

    async makeHttpRequest(url, method, data = null, authToken = null, headers = {}) {
        try {
            headers['Content-Type'] = 'application/json';
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }
            const options = { method, headers, body: data ? JSON.stringify(data) : null };
            const response = await fetch(url, options);
            if (!response.ok) {
                if (response.status === 404) return null;
                throw new Error(`Erro na solicitação: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Erro na requisição para ${url}:`, error);
            throw error;
        }
    }

    async login() {
        // AVISO: CREDENCIAIS EXPOSTAS EM CÓDIGO PÚBLICO. Altere sua senha.
        const postData = { "email": "maikywilliam.620@gmail.com", "password": "96574565" };
        const url = `${this.baseUrl}/visitor-sessions`;
        const data = await this.makeHttpRequest(url, "POST", postData);
        if (data && data.token) this.token = data.token;
    }

    async postChannelId() {
        if (!this.token) return;
        const requestData = { establishmentName: "FUTHAUS7 É US GURI" };
        const url = `${this.baseUrl}/channels`;
        const data = await this.makeHttpRequest(url, "POST", requestData, this.token);
        if (data && data.length > 0) this.channelId = data[0].value;
    }

    async postVideos() {
        if (!this.channelId) return { videos: [], date: null };
        const saturday = this.getPreviousSaturday(new Date());

        const videoParams = {
            state: 'RS', city: 'Estância Velha', establishmentName: 'FUTHAUS7 É US GURI',
            channelId: this.channelId, day: saturday.date, hour: saturday.hour
        };
        const url = `${this.baseUrl}/videos`;
        const responseData = await this.makeHttpRequest(url, "POST", videoParams, this.token);

        const videos = [];
        if (Array.isArray(responseData)) {
            responseData.forEach(item => {
                if (item.url) videos.push({ tipo: 'video', url: item.url });
            });
        }
        return { videos, date: saturday.date };
    }

    formatToISODate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    getPreviousSaturday(date) {
        const previousSaturday = new Date(date);
        const dayOfWeek = date.getDay();
        const daysToSubtract = (dayOfWeek + 1) % 7;
        previousSaturday.setDate(date.getDate() - daysToSubtract);

        const formattedDate = this.formatToISODate(previousSaturday);
        return { date: formattedDate, hour: '10' };
    }
}