export function getUrlWithTimestamp(url: string): string {
    let timestamp: number = new Date().getTime();
    return `${url}?load=${timestamp}`;
}