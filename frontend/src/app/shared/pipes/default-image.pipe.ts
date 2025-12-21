import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'defaultImage',
    standalone: true
})
export class DefaultImagePipe implements PipeTransform {

    transform(value: string | undefined | null, type: 'event' | 'user' | 'club' = 'event'): string {
        if (value && value.trim() !== '') {
            return value;
        }

        switch (type) {
            case 'event':
                return 'assets/images/default-event.jpg';
            case 'user':
                return 'assets/images/default-user.jpg';
            case 'club':
                return 'assets/images/default-club.jpg';
            default:
                return 'assets/images/default-placeholder.jpg';
        }
    }

}
