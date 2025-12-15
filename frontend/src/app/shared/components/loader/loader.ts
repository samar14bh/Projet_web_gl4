import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
  selector: 'app-loader',
  imports: [],
  templateUrl: './loader.html',
  styleUrl: './loader.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Loader {

  @Input() message: string = 'Loading...';
  @Input() size: number = 200;


}
