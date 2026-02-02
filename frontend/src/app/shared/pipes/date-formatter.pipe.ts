import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'formatDate',
  standalone: true,
  pure: true 
})
export class DateFormatterPipe implements PipeTransform {
  transform(dateString: string | Date | null | undefined, format: 'short' | 'long' = 'short'): string {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = format === 'short' 
      ? { day: '2-digit', month: 'short', year: 'numeric' }
      : { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };

    return date.toLocaleDateString('fr-FR', options);
  }
}