import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe pour formater les montants en Dinars Tunisiens (TND)
 * Utilise Intl.NumberFormat pour une localisation correcte et performante.
 * Est "pure" par défaut, donc ne se recalcule que si la valeur change.
 */
@Pipe({
    name: 'currencyTnd',
    standalone: true
})
export class CurrencyTndPipe implements PipeTransform {
    private formatter = new Intl.NumberFormat('fr-TN', {
        style: 'currency',
        currency: 'TND',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    transform(value: number | string | null | undefined): string {
        if (value === null || value === undefined) return '0,00 TND';

        const numValue = typeof value === 'string' ? parseFloat(value) : value;

        if (isNaN(numValue)) return '0,00 TND';

        return this.formatter.format(numValue);
    }
}
