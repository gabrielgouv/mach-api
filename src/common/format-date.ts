export function formatDate (rplDateString: string): Date {
    const day = parseInt(rplDateString.substr(0, 2))
    const month = parseInt(rplDateString.substr(2, 2)) - 1
    const year = parseInt(rplDateString.substr(4, 2)) + 2000
    return new Date(Date.UTC(year, month, day))
}
