import { 
  Directive, 
  ElementRef, 
  OnDestroy, 
  inject, 
  input, 
  output,
  effect
} from '@angular/core';

@Directive({
  selector: '[appLazyLoading]',
  standalone: true
})
export class LazyLoading implements OnDestroy {
  private readonly element = inject(ElementRef);
  private observer?: IntersectionObserver;
  rootMargin = input<string>('50px');
  threshold = input<number>(0.1);
  visible = output<void>();
  constructor() {
    effect((onCleanup) => {
      this.setupObserver();
      onCleanup(() => {
        this.observer?.disconnect();
      });
    });
  }

  private setupObserver() {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          this.visible.emit();
          this.observer?.unobserve(this.element.nativeElement);
        }
      },
      {
        root: null,
        rootMargin: this.rootMargin(), 
        threshold: this.threshold()   
      }
    );

    this.observer.observe(this.element.nativeElement);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}