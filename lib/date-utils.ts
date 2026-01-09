// CONFIGURACIÓN DE LA HORA
// Si la hora sigue incorrecta, ajusta este número.
// Positivos restan horas (ej: 5 resta 5 horas).
// Si necesitas sumar, usa números negativos.
const HOURS_OFFSET = 10; 

export function formatToColombiaTime(dateInput: string | Date | null | undefined): string {
    if (!dateInput) return "";

    try {
        let s = String(dateInput).trim();
        
        // Si ya es objeto Date, a string ISO para uniformidad
        if (dateInput instanceof Date) {
            s = dateInput.toISOString();
        }

        let dateObj: Date;

        // Regex para capturar partes de la fecha: YYYY-MM-DD HH:mm:ss
        // Funciona tanto con ISO como con strings de fecha SQL
        const match = s.match(/^(\d{4})[-/](\d{2})[-/](\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?/);

        if (match) {
            const year = parseInt(match[1], 10);
            const month = parseInt(match[2], 10) - 1; // Meses en JS van de 0 a 11
            const day = parseInt(match[3], 10);
            const hour = match[4] ? parseInt(match[4], 10) : 0;
            const minute = match[5] ? parseInt(match[5], 10) : 0;
            const second = match[6] ? parseInt(match[6], 10) : 0;

            // APLICACIÓN DEL OFFSET MANUAL
            // Restamos las 5 horas manualmente a los números extraídos.
            // Esto crea una fecha "Local" con los números que queremos ver.
            dateObj = new Date(year, month, day, hour - HOURS_OFFSET, minute, second);
        } else {
            // Fallback: si falla el regex, intentamos parseo nativo y restamos también
            dateObj = new Date(s);
            dateObj.setHours(dateObj.getHours() - HOURS_OFFSET);
        }

        // Formateamos SIN especificar timeZone para mantener los números tal cual los calculamos ("Wall Clock")
        // Al no poner timeZone, el navegador/servidor pintará el objeto fecha tal cual lo construimos arriba.
        return dateObj.toLocaleDateString('es-CO', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

    } catch (error) {
        console.error("Error formateando fecha:", error);
        return String(dateInput);
    }
}
